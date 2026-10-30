/* ==========================================================================
   Dido engine — exact symbolic algebra & linear algebra
   A JavaScript port of the linear_algebra.py architecture:
     Q (Integer/Rational) → G (C, Gaussian rationals) → Alg (Radical /
     AlgebraicNumber) → Poly (Monomialvar / Polynomialvar) → RF
     (Rationalfractionvar) → Matrix
   Algorithms follow the library: Bareiss fraction-free determinants,
   Cayley–Hamilton inverses, fraction-free echelon form, radical
   simplification with denesting, multivariate GCD cancellation.
   ========================================================================== */
(function (global) {
'use strict';

class MathError extends Error {}
const fail = (m) => { throw new MathError(m); };
const LIMIT_TERMS = 6000;

/* ---------- BigInt helpers ---------- */
const babs = (a) => (a < 0n ? -a : a);
function bgcd(a, b) { a = babs(a); b = babs(b); while (b) { [a, b] = [b, a % b]; } return a; }
function bfloorDiv(n, d) { // d > 0
  const q = n / d; return (n % d !== 0n && n < 0n) ? q - 1n : q;
}

/* ---------- Q : exact rationals (Integer / Rational) ---------- */
class Q {
  constructor(n, d) { this.n = n; this.d = d; }
  static of(n, d = 1n) {
    n = BigInt(n); d = BigInt(d);
    if (d === 0n) fail('Division by zero');
    if (d < 0n) { n = -n; d = -d; }
    const g = bgcd(n, d) || 1n;
    return g === 1n ? new Q(n, d) : new Q(n / g, d / g);
  }
  add(o) { return this.d === o.d ? Q.of(this.n + o.n, this.d) : Q.of(this.n * o.d + o.n * this.d, this.d * o.d); }
  sub(o) { return this.d === o.d ? Q.of(this.n - o.n, this.d) : Q.of(this.n * o.d - o.n * this.d, this.d * o.d); }
  mul(o) { return Q.of(this.n * o.n, this.d * o.d); }
  div(o) { if (o.n === 0n) fail('Division by zero'); return Q.of(this.n * o.d, this.d * o.n); }
  neg() { return new Q(-this.n, this.d); }
  inv() { return Q.of(this.d, this.n); }
  pow(k) {
    if (k < 0) return this.inv().pow(-k);
    const K = BigInt(k); return new Q(this.n ** K, this.d ** K);
  }
  isZero() { return this.n === 0n; }
  isOne() { return this.n === 1n && this.d === 1n; }
  isInt() { return this.d === 1n; }
  sign() { return this.n > 0n ? 1 : this.n < 0n ? -1 : 0; }
  eq(o) { return this.n === o.n && this.d === o.d; }
  floor() { return bfloorDiv(this.n, this.d); }
  num() { return Number(this.n) / Number(this.d); }
  key() { return this.d === 1n ? String(this.n) : this.n + '/' + this.d; }
  latex() {
    if (this.d === 1n) return String(this.n);
    const s = this.n < 0n ? '-' : '';
    return `${s}\\frac{${babs(this.n)}}{${this.d}}`;
  }
}
Q.ZERO = new Q(0n, 1n); Q.ONE = new Q(1n, 1n); Q.MONE = new Q(-1n, 1n);

/* ---------- G : Gaussian rationals (class C) ---------- */
class G {
  constructor(re, im = Q.ZERO) { this.re = re; this.im = im; }
  static int(k) { return new G(Q.of(k)); }
  add(o) { return new G(this.re.add(o.re), this.im.add(o.im)); }
  sub(o) { return new G(this.re.sub(o.re), this.im.sub(o.im)); }
  neg() { return new G(this.re.neg(), this.im.neg()); }
  mul(o) {
    if (this.im.isZero() && o.im.isZero()) return new G(this.re.mul(o.re));
    return new G(this.re.mul(o.re).sub(this.im.mul(o.im)), this.re.mul(o.im).add(this.im.mul(o.re)));
  }
  conj() { return new G(this.re, this.im.neg()); }
  norm() { return this.re.mul(this.re).add(this.im.mul(this.im)); }
  inv() {
    if (this.isZero()) fail('Division by zero');
    if (this.im.isZero()) return new G(this.re.inv());
    const n = this.norm(); return new G(this.re.div(n), this.im.neg().div(n));
  }
  div(o) { return this.mul(o.inv()); }
  pow(k) {
    if (k < 0) return this.inv().pow(-k);
    let r = G.ONE, b = this;
    while (k) { if (k & 1) r = r.mul(b); b = b.mul(b); k >>= 1; }
    return r;
  }
  isZero() { return this.re.isZero() && this.im.isZero(); }
  isOne() { return this.re.isOne() && this.im.isZero(); }
  isReal() { return this.im.isZero(); }
  eq(o) { return this.re.eq(o.re) && this.im.eq(o.im); }
  key() { return this.re.key() + ',' + this.im.key(); }
  latex() {
    const re = this.re, im = this.im;
    const imPart = (q, lead) => {
      const a = q.sign() < 0 ? q.neg() : q;
      let body;
      if (a.isOne()) body = 'i';
      else if (a.isInt()) body = `${a.n}i`;
      else body = `\\frac{${a.n}}{${a.d}}i`;
      if (q.sign() < 0) return '-' + body;
      return lead ? body : '+' + body;
    };
    if (im.isZero()) return re.latex();
    if (re.isZero()) return imPart(im, true);
    return re.latex() + imPart(im, false);
  }
}
G.ZERO = new G(Q.ZERO); G.ONE = new G(Q.ONE); G.MONE = new G(Q.MONE); G.I = new G(Q.ZERO, Q.ONE);

/* ---------- integer factorisation (factors / Cfactors helpers) ---------- */
const factorCache = new Map();
function factorBig(n) { // n > 0n → Array<[prime BigInt, exp Number]>
  n = babs(n);
  const key = n.toString();
  if (factorCache.has(key)) return factorCache.get(key);
  const out = [];
  let m = n;
  const take = (p) => { let e = 0; while (m % p === 0n) { m /= p; e++; } if (e) out.push([p, e]); };
  take(2n); take(3n);
  let p = 5n, steps = 0;
  while (p * p <= m && steps < 600000) { take(p); take(p + 2n); p += 6n; steps++; }
  if (m > 1n) out.push([m, 1]);
  if (factorCache.size > 5000) factorCache.clear();
  factorCache.set(key, out);
  return out;
}
function isPrimeBig(n) { if (n < 2n) return false; const f = factorBig(n); return f.length === 1 && f[0][1] === 1; }

/* ---------- radical parts: Map prime → exponent in (0,1) ---------- */
function radFromExps(list) { // list of [p BigInt, Q exponent] → {coef: Q, rad: [[p,Q]] sorted}
  const m = new Map();
  for (const [p, e] of list) { const k = p.toString(); const cur = m.get(k); m.set(k, cur ? [p, cur[1].add(e)] : [p, e]); }
  let coef = Q.ONE; const rad = [];
  for (const [p, e] of m.values()) {
    if (e.isZero()) continue;
    const fl = e.floor();
    const frac = e.sub(Q.of(fl));
    if (fl !== 0n) coef = coef.mul(fl > 0n ? Q.of(p ** fl) : Q.of(1n, p ** (-fl)));
    if (!frac.isZero()) rad.push([p, frac]);
  }
  rad.sort((a, b) => (a[0] < b[0] ? -1 : 1));
  return { coef, rad };
}
const radKey = (rad) => rad.map(([p, e]) => p + '^' + e.key()).join('·');
function radLatex(rad) {
  const groups = new Map(); // denom → radicand
  for (const [p, e] of rad) {
    const d = e.d.toString();
    groups.set(d, (groups.get(d) || 1n) * p ** e.n);
  }
  return [...groups.entries()].sort((a, b) => Number(a[0]) - Number(b[0]))
    .map(([d, r]) => d === '2' ? `\\sqrt{${r}}` : `\\sqrt[${d}]{${r}}`).join('');
}
const radNum = (rad) => rad.reduce((acc, [p, e]) => acc * Math.pow(Number(p), e.num()), 1);

/* ---------- Alg : algebraic numbers (Radical / AlgebraicNumber) ---------- */
class Alg {
  constructor(terms) { this.t = terms; } // Map key → {c: G, rad}
  static fromG(g) { const m = new Map(); if (!g.isZero()) m.set('', { c: g, rad: [] }); return new Alg(m); }
  static fromQ(q) { return Alg.fromG(new G(q)); }
  static int(k) { return Alg.fromG(G.int(k)); }
  static term(c, rad) { const m = new Map(); if (!c.isZero()) m.set(radKey(rad), { c, rad }); return new Alg(m); }
  isZero() { return this.t.size === 0; }
  isRational() { return this.t.size === 0 || (this.t.size === 1 && this.t.has('')); }
  asG() { if (this.t.size === 0) return G.ZERO; return this.isRational() ? this.t.get('').c : null; }
  isOne() { const g = this.asG(); return !!g && g.isOne(); }
  isRealRational() { const g = this.asG(); return !!g && g.isReal(); }
  add(o) {
    if (o.isZero()) return this; if (this.isZero()) return o;
    const m = new Map(this.t);
    for (const [k, v] of o.t) {
      const cur = m.get(k);
      if (cur) { const c = cur.c.add(v.c); if (c.isZero()) m.delete(k); else m.set(k, { c, rad: v.rad }); }
      else m.set(k, v);
    }
    return new Alg(m);
  }
  neg() { const m = new Map(); for (const [k, v] of this.t) m.set(k, { c: v.c.neg(), rad: v.rad }); return new Alg(m); }
  sub(o) { return this.add(o.neg()); }
  scaleG(g) {
    if (g.isZero()) return Alg.ZERO; if (g.isOne()) return this;
    const m = new Map(); for (const [k, v] of this.t) m.set(k, { c: v.c.mul(g), rad: v.rad }); return new Alg(m);
  }
  mul(o) {
    const a = this.asG(), b = o.asG();
    if (a && b) return Alg.fromG(a.mul(b));
    if (a) return o.scaleG(a);
    if (b) return this.scaleG(b);
    let r = Alg.ZERO;
    for (const x of this.t.values()) for (const y of o.t.values()) {
      const { coef, rad } = radFromExps([...x.rad, ...y.rad]);
      r = r.add(Alg.term(x.c.mul(y.c).mul(new G(coef)), rad));
    }
    return r;
  }
  pow(k) {
    if (k < 0) return this.inv().pow(-k);
    let r = Alg.ONE, b = this;
    while (k) { if (k & 1) r = r.mul(b); k >>= 1; if (k) b = b.mul(b); }
    return r;
  }
  conj() { const m = new Map(); for (const [k, v] of this.t) m.set(k, { c: v.c.conj(), rad: v.rad }); return new Alg(m); }
  eq(o) { return this.sub(o).isZero(); }
  single() { return this.t.size === 1 ? [...this.t.values()][0] : null; }
  static singleInv(x) { // 1/(c·∏p^e)
    const { coef, rad } = radFromExps(x.rad.map(([p, e]) => [p, e.neg()]));
    return Alg.term(x.c.inv().mul(new G(coef)), rad);
  }
  inv() {
    if (this.isZero()) fail('Division by zero');
    const s = this.single(); if (s) return Alg.singleInv(s);
    // rationalise square roots by successive conjugation (a+b√c → a−b√c)
    let x = this, numr = Alg.ONE, guard = 0;
    while (!x.single()) {
      if (++guard > 24) fail('Cannot rationalise this denominator exactly');
      let prime = null, onlySqrt = true;
      for (const v of x.t.values()) for (const [p, e] of v.rad) { if (e.d !== 2n) onlySqrt = false; else if (!prime) prime = p; }
      if (!onlySqrt || !prime) fail('Cannot rationalise denominators with higher-order roots');
      const m = new Map();
      for (const [k, v] of x.t) {
        const has = v.rad.some(([p]) => p === prime);
        m.set(k, { c: has ? v.c.neg() : v.c, rad: v.rad });
      }
      const sig = new Alg(m);
      numr = numr.mul(sig); x = x.mul(sig);
    }
    return numr.mul(Alg.singleInv(x.single()));
  }
  div(o) { return this.mul(o.inv()); }
  numeric() { // [re, im]
    let re = 0, im = 0;
    for (const v of this.t.values()) { const r = radNum(v.rad); re += v.c.re.num() * r; im += v.c.im.num() * r; }
    return [re, im];
  }
  sortedTerms() {
    return [...this.t.entries()].sort((a, b) => (a[0] === '' ? -1 : b[0] === '' ? 1 : (a[0] < b[0] ? -1 : 1))).map((e) => e[1]);
  }
  static termLatex(v) {
    const c = v.c;
    if (!v.rad.length) return c.latex();
    const R = radLatex(v.rad);
    if (c.isReal()) {
      const q = c.re, sg = q.sign() < 0 ? '-' : '', a = q.sign() < 0 ? q.neg() : q;
      if (a.isInt()) return sg + (a.isOne() ? '' : String(a.n)) + R;
      return `${sg}\\frac{${a.n.toString() === '1' ? '' : a.n}${R}}{${a.d}}`;
    }
    if (c.re.isZero()) { const s = c.latex(); return s + R; }
    return `\\left(${c.latex()}\\right)${R}`;
  }
  latex() {
    if (this.isZero()) return '0';
    let s = '';
    for (const v of this.sortedTerms()) {
      const tl = Alg.termLatex(v);
      if (!s) s = tl;
      else if (tl.startsWith('-')) s += tl;
      else if (!v.rad.length && !v.c.isReal() && !v.c.re.isZero()) s += '+' + tl; // complex constant part
      else s += '+' + tl;
    }
    return s;
  }
  isCompound() { // needs parentheses when used as a coefficient
    if (this.t.size > 1) return true;
    const s = this.single(); return !!s && !s.c.re.isZero() && !s.c.im.isZero();
  }
  /* n-th root (sqrt / cbrt / nthrt) with simplification & denesting */
  root(n) {
    if (!Number.isInteger(n) || n < 1) fail('Root index must be a positive integer');
    if (n === 1) return this;
    if (this.isZero()) return Alg.ZERO;
    const s = this.single();
    if (s && s.c.isReal()) {
      let q = s.c.re, mult = G.ONE;
      if (q.sign() < 0) {
        if (n % 2 === 1) { mult = G.MONE; q = q.neg(); }
        else if (n === 2) { mult = G.I; q = q.neg(); }
        else fail('Even roots of negative numbers are only supported for square roots');
      }
      const list = s.rad.map(([p, e]) => [p, e.div(Q.of(n))]);
      for (const [p, e] of factorBig(q.n)) list.push([p, Q.of(e, n)]);
      for (const [p, e] of factorBig(q.d)) list.push([p, Q.of(-e, n)]);
      const { coef, rad } = radFromExps(list);
      return Alg.term(mult.mul(new G(coef)), rad);
    }
    if (n === 2 && this.isRational()) { // √(a+bi), exact when |z| is rational
      const g = this.asG(), m2 = g.norm();
      const mr = Alg.fromQ(m2).root(2);
      const mq = mr.asG();
      if (!mq) fail('This complex square root has no simple exact form');
      const m = mq.re;
      const x = Alg.fromQ(m.add(g.re).div(Q.of(2))).root(2);
      const y = Alg.fromQ(m.sub(g.re).div(Q.of(2))).root(2);
      return x.add(y.scaleG(g.im.sign() < 0 ? G.I.neg() : G.I));
    }
    if (n === 2 && this.t.size === 2) { // denest √(a + b√c)
      const [ra, rb] = this.sortedTerms();
      if (!ra.rad.length && ra.c.isReal() && rb.c.isReal() && rb.rad.length >= 1 && rb.rad.every(([, e]) => e.d === 2n)) {
        const val = this.numeric()[0];
        if (val < 0) return this.neg().root(2).scaleG(G.I);
        const a = ra.c.re, b = rb.c.re, cRad = rb.rad.reduce((acc, [p]) => acc * p, 1n);
        const disc = a.mul(a).sub(b.mul(b).mul(Q.of(cRad)));
        if (disc.sign() >= 0) {
          const dr = Alg.fromQ(disc).root(2).asG();
          if (dr) {
            const d = dr.re;
            const p = Alg.fromQ(a.add(d).div(Q.of(2))).root(2);
            const qq = Alg.fromQ(a.sub(d).div(Q.of(2))).root(2);
            return b.sign() >= 0 ? p.add(qq) : p.sub(qq);
          }
        }
      }
    }
    fail('This radical cannot be simplified to an exact form');
  }
}
Alg.ZERO = new Alg(new Map()); Alg.ONE = Alg.fromG(G.ONE); Alg.I = Alg.fromG(G.I);

/* ---------- variable names ---------- */
const GREEK = ['alpha','beta','gamma','delta','epsilon','zeta','eta','theta','kappa','lambda','mu','nu','rho','sigma','tau','upsilon','phi','chi','psi','omega','pi',
  'Gamma','Delta','Theta','Lambda','Sigma','Upsilon','Phi','Psi','Omega','Pi'];
const GREEK_UNI = { 'α':'alpha','β':'beta','γ':'gamma','δ':'delta','ε':'epsilon','ζ':'zeta','η':'eta','θ':'theta','κ':'kappa','λ':'lambda','μ':'mu','ν':'nu','ξ':'xi','ρ':'rho','σ':'sigma','τ':'tau','υ':'upsilon','φ':'phi','χ':'chi','ψ':'psi','ω':'omega','π':'pi',
  'Γ':'Gamma','Δ':'Delta','Θ':'Theta','Λ':'Lambda','Σ':'Sigma','Φ':'Phi','Ψ':'Psi','Ω':'Omega','Π':'Pi' };
function varLatex(name) {
  let base = name, sub = '';
  const k = name.indexOf('_');
  if (k >= 0) { base = name.slice(0, k); sub = name.slice(k + 1); }
  let b = (GREEK.includes(base) || base === 'xi') ? '\\' + (base === 'epsilon' ? 'varepsilon' : base) : base;
  if (base === 'phi') b = '\\varphi';
  return sub ? `${b}_{${sub}}` : b;
}
const varSortKey = (n) => { const base = n.split('_')[0]; return (base.length > 1 ? '~' : '') + n; };
const cmpName = (a, b) => { const ka = varSortKey(a), kb = varSortKey(b); return ka < kb ? -1 : ka > kb ? 1 : 0; };

/* ---------- Poly : multivariate polynomials (Monomialvar / Polynomialvar) ---------- */
// term: {v: [[name, exp], ...] sorted by name, c: Alg}
const vkey = (v) => v.map(([n, e]) => n + '^' + e).join('*');
function mulVars(a, b) {
  const out = []; let i = 0, j = 0;
  while (i < a.length || j < b.length) {
    if (j >= b.length || (i < a.length && cmpName(a[i][0], b[j][0]) < 0)) out.push(a[i++]);
    else if (i >= a.length || cmpName(a[i][0], b[j][0]) > 0) out.push(b[j++]);
    else { out.push([a[i][0], a[i][1] + b[j][1]]); i++; j++; }
  }
  return out;
}
function lexCmp(a, b) { // >0 if a > b (earlier variables dominate)
  let i = 0, j = 0;
  while (i < a.length || j < b.length) {
    let na, ea, nb, eb;
    if (i < a.length) [na, ea] = a[i]; if (j < b.length) [nb, eb] = b[j];
    if (j >= b.length || (i < a.length && cmpName(na, nb) < 0)) return 1;      // a has an earlier var
    if (i >= a.length || cmpName(na, nb) > 0) return -1;
    if (ea !== eb) return ea - eb;
    i++; j++;
  }
  return 0;
}
const tdeg = (v) => v.reduce((s, x) => s + x[1], 0);
const grlexCmp = (a, b) => (tdeg(a) - tdeg(b)) || lexCmp(a, b);
const dividesVars = (a, b) => a.every(([n, e]) => { const f = b.find((x) => x[0] === n); return f && f[1] >= e; });
function divVars(b, a) { // b / a
  return b.map(([n, e]) => { const f = a.find((x) => x[0] === n); return [n, e - (f ? f[1] : 0)]; }).filter((x) => x[1] > 0);
}

class Poly {
  constructor(t) { this.t = t; }
  static fromAlg(a) { const m = new Map(); if (!a.isZero()) m.set('', { v: [], c: a }); return new Poly(m); }
  static int(k) { return Poly.fromAlg(Alg.int(k)); }
  static variable(name, exp = 1) { if (exp === 0) return Poly.ONE; const v = [[name, exp]]; return new Poly(new Map([[vkey(v), { v, c: Alg.ONE }]])); }
  static term(v, c) { const m = new Map(); if (!c.isZero()) m.set(vkey(v), { v, c }); return new Poly(m); }
  isZero() { return this.t.size === 0; }
  isConst() { return this.t.size === 0 || (this.t.size === 1 && this.t.has('')); }
  isOne() { return this.isConst() && this.constAlg().isOne(); }
  constAlg() { const x = this.t.get(''); return x ? x.c : Alg.ZERO; }
  terms() { return [...this.t.values()]; }
  add(o) {
    if (o.isZero()) return this; if (this.isZero()) return o;
    const m = new Map(this.t);
    for (const [k, x] of o.t) {
      const cur = m.get(k);
      if (cur) { const c = cur.c.add(x.c); if (c.isZero()) m.delete(k); else m.set(k, { v: x.v, c }); }
      else m.set(k, x);
    }
    if (m.size > LIMIT_TERMS) fail('Result is too large to display');
    return new Poly(m);
  }
  neg() { const m = new Map(); for (const [k, x] of this.t) m.set(k, { v: x.v, c: x.c.neg() }); return new Poly(m); }
  sub(o) { return this.add(o.neg()); }
  scale(a) {
    if (a.isZero()) return Poly.ZERO; if (a.isOne()) return this;
    const m = new Map(); for (const [k, x] of this.t) { const c = x.c.mul(a); if (!c.isZero()) m.set(k, { v: x.v, c }); } return new Poly(m);
  }
  mulTerm(v, c) {
    const m = new Map();
    for (const x of this.t.values()) { const nv = mulVars(x.v, v); const nc = x.c.mul(c); if (!nc.isZero()) m.set(vkey(nv), { v: nv, c: nc }); }
    return new Poly(m);
  }
  mul(o) {
    if (this.isZero() || o.isZero()) return Poly.ZERO;
    if (o.isConst()) return this.scale(o.constAlg());
    if (this.isConst()) return o.scale(this.constAlg());
    const m = new Map();
    for (const x of this.t.values()) for (const y of o.t.values()) {
      const v = mulVars(x.v, y.v), k = vkey(v), c = x.c.mul(y.c);
      const cur = m.get(k);
      if (cur) { const s = cur.c.add(c); if (s.isZero()) m.delete(k); else m.set(k, { v, c: s }); }
      else if (!c.isZero()) m.set(k, { v, c });
    }
    if (m.size > LIMIT_TERMS) fail('Result is too large to display');
    return new Poly(m);
  }
  pow(k) {
    if (k < 0) fail('Negative power of a polynomial');
    if (this.isConst()) return Poly.fromAlg(this.constAlg().pow(k));
    if (k > 400) fail('Exponent too large');
    let r = Poly.ONE, b = this;
    while (k) { if (k & 1) r = r.mul(b); k >>= 1; if (k) b = b.mul(b); }
    return r;
  }
  vars() { const s = new Set(); for (const x of this.t.values()) for (const [n] of x.v) s.add(n); return s; }
  degIn(name) { let d = 0; for (const x of this.t.values()) for (const [n, e] of x.v) if (n === name && e > d) d = e; return d; }
  totalDeg() { let d = 0; for (const x of this.t.values()) d = Math.max(d, tdeg(x.v)); return d; }
  coeffsIn(name) { // Map exp → Poly
    const out = new Map();
    for (const x of this.t.values()) {
      const f = x.v.find((y) => y[0] === name), e = f ? f[1] : 0;
      const rest = x.v.filter((y) => y[0] !== name);
      out.set(e, (out.get(e) || Poly.ZERO).add(Poly.term(rest, x.c)));
    }
    return out;
  }
  leading(cmp = lexCmp) { let best = null; for (const x of this.t.values()) if (!best || cmp(x.v, best.v) > 0) best = x; return best; }
  eq(o) { return this.sub(o).isZero(); }
  allCoeffsRealRational() { for (const x of this.t.values()) if (!x.c.isRealRational()) return false; return true; }
  sorted() { return this.terms().sort((a, b) => grlexCmp(b.v, a.v)); }
  numeric() { if (!this.isConst()) return null; return this.constAlg().numeric(); }
  latexIn(x) { // grouped by powers of x: λ² − (a+d)λ + (ad − bc)
    const others = [...this.vars()].filter((v) => v !== x);
    if (!others.length) return this.latex();
    const groups = [...this.coeffsIn(x).entries()].filter(([, c]) => !c.isZero()).sort((a, b) => b[0] - a[0]);
    let s = '';
    for (const [k, C] of groups) {
      const X = k === 0 ? '' : varLatex(x) + (k === 1 ? '' : `^{${k}}`);
      let tl;
      if (!X) tl = C.latex();
      else if (C.isConst()) tl = Poly.term([[x, k]], C.constAlg()).latex();
      else if (C.t.size === 1) tl = C.latex() + X;
      else { const neg = C.sorted()[0].c.latex().startsWith('-'); tl = (neg ? '-' : '') + `\\left(${(neg ? C.neg() : C).latex()}\\right)` + X; }
      if (!s) s = tl; else s += tl.startsWith('-') ? tl : '+' + tl;
    }
    return s || '0';
  }
  latex() {
    if (this.isZero()) return '0';
    let s = '';
    for (const x of this.sorted()) {
      const V = x.v.map(([n, e]) => varLatex(n) + (e === 1 ? '' : `^{${e}}`)).join('');
      let tl;
      if (!V) tl = x.c.latex();
      else if (x.c.isOne()) tl = V;
      else if (x.c.eq(Alg.int(-1))) tl = '-' + V;
      else if (x.c.isCompound()) tl = `\\left(${x.c.latex()}\\right)${V}`;
      else tl = x.c.latex() + V;
      if (!s) s = tl;
      else s += tl.startsWith('-') ? tl : '+' + tl;
    }
    return s;
  }
}
Poly.ZERO = new Poly(new Map()); Poly.ONE = Poly.fromAlg(Alg.ONE);

/* exact multivariate division (euclidien with zero remainder) */
function divExact(P, D) {
  if (D.isZero()) fail('Division by zero');
  if (P.isZero()) return Poly.ZERO;
  if (D.isConst()) return P.scale(D.constAlg().inv());
  const ltD = D.leading();
  let invLc; try { invLc = ltD.c.inv(); } catch (e) { return null; }
  let R = P, Qt = Poly.ZERO, guard = 0;
  while (!R.isZero()) {
    if (++guard > 4000) return null;
    const ltR = R.leading();
    if (!dividesVars(ltD.v, ltR.v)) return null;
    const v = divVars(ltR.v, ltD.v), c = ltR.c.mul(invLc);
    Qt = Qt.add(Poly.term(v, c));
    R = R.sub(D.mulTerm(v, c));
  }
  return Qt;
}
/* division with remainder in one variable (Polynomial.euclidien) — coefficients are RFs */
function divModIn(P, D, x) {
  const dP = P.coeffsIn(x), dD = D.coeffsIn(x);
  const degD = D.degIn(x);
  if (D.isZero()) fail('Division by zero polynomial');
  const lcD = RF.fromPoly(dD.get(degD) || Poly.ZERO);
  let R = new Map(); for (const [e, c] of dP) R.set(e, RF.fromPoly(c));
  const Dm = new Map(); for (const [e, c] of dD) Dm.set(e, RF.fromPoly(c));
  const Qm = new Map();
  const degR = () => { let d = -1; for (const [e, c] of R) if (!c.isZero() && e > d) d = e; return d; };
  let guard = 0;
  while (degR() >= degD) {
    if (++guard > 500) fail('Division did not terminate');
    const dr = degR(), coef = R.get(dr).div(lcD), sh = dr - degD;
    Qm.set(sh, (Qm.get(sh) || RF.ZERO).add(coef));
    for (const [e, c] of Dm) { const k = e + sh; R.set(k, (R.get(k) || RF.ZERO).sub(coef.mul(c))); }
  }
  const build = (m) => { let r = RF.ZERO; for (const [e, c] of m) if (!c.isZero()) r = r.add(c.mul(RF.fromPoly(Poly.variable(x, e)))); return r; };
  return [build(Qm), build(R)];
}

/* multivariate GCD (gcd_polyvar) via primitive pseudo-remainder sequences */
function prem(A, B, v) {
  const dB = B.degIn(v), lcB = B.coeffsIn(v).get(dB);
  let R = A, guard = 0;
  while (!R.isZero() && R.degIn(v) >= dB) {
    if (++guard > 200) fail('gcd');
    const dR = R.degIn(v), lcR = R.coeffsIn(v).get(dR);
    R = R.mul(lcB).sub(lcR.mul(B).mul(Poly.variable(v, dR - dB)));
  }
  return R;
}
function monic(P) { if (P.isZero()) return P; return P.scale(P.leading().c.inv()); }
function contentIn(P, v) {
  let g = null;
  for (const c of P.coeffsIn(v).values()) { if (c.isZero()) continue; g = g ? gcdRec(g, c) : monic(c); if (g.isConst()) return Poly.ONE; }
  return g || Poly.ONE;
}
function gcdRec(P, Q2, depth = 0) {
  if (depth > 40) fail('gcd');
  if (P.isZero()) return monic(Q2);
  if (Q2.isZero()) return monic(P);
  if (P.isConst() || Q2.isConst()) return Poly.ONE;
  const vs = [...new Set([...P.vars(), ...Q2.vars()])].sort(cmpName);
  const v = vs.find((x) => P.degIn(x) > 0 && Q2.degIn(x) > 0) || vs[0];
  if (P.degIn(v) === 0) return gcdRec(P, contentIn(Q2, v), depth + 1);
  if (Q2.degIn(v) === 0) return gcdRec(contentIn(P, v), Q2, depth + 1);
  const cP = contentIn(P, v), cQ = contentIn(Q2, v);
  let A = divExact(P, cP), B = divExact(Q2, cQ);
  if (!A || !B) fail('gcd');
  const c = gcdRec(cP, cQ, depth + 1);
  if (A.degIn(v) < B.degIn(v)) [A, B] = [B, A];
  let guard = 0;
  while (true) {
    if (++guard > 100) fail('gcd');
    const R = prem(A, B, v);
    if (R.isZero()) break;
    if (R.degIn(v) === 0) { B = Poly.ONE; break; }
    A = B; const cr = contentIn(R, v); B = divExact(R, cr); if (!B) fail('gcd');
  }
  let g = B;
  if (!g.isConst()) { const cg = contentIn(g, v); g = divExact(g, cg); if (!g) fail('gcd'); }
  else g = Poly.ONE;
  return monic(c.mul(g));
}
function polyGcd(P, Q2) {
  try { if (P.t.size * Q2.t.size > 40000) return null; return gcdRec(P, Q2); }
  catch (e) { return null; }
}
function polyLcm(P, Q2) {
  const g = polyGcd(P, Q2);
  if (!g || g.isConst()) return P.mul(Q2);
  const q = divExact(P, g); return q ? q.mul(Q2) : P.mul(Q2);
}

/* ---------- RF : rational functions (Rationalfractionvar) ---------- */
class RF {
  constructor(num, den) { this.num = num; this.den = den; }
  static fromPoly(p) { return new RF(p, Poly.ONE); }
  static fromAlg(a) { return new RF(Poly.fromAlg(a), Poly.ONE); }
  static fromG(g) { return RF.fromAlg(Alg.fromG(g)); }
  static int(k) { return RF.fromPoly(Poly.int(k)); }
  static q(q) { return RF.fromAlg(Alg.fromQ(q)); }
  static variable(n) { return RF.fromPoly(Poly.variable(n)); }
  static make(num, den) {
    if (den.isZero()) fail('Division by zero');
    if (num.isZero()) return RF.ZERO;
    if (den.isOne()) return new RF(num, Poly.ONE);
    const tryConst = () => { try { return new RF(num.scale(den.constAlg().inv()), Poly.ONE); } catch (e) { if (e.message === 'Division by zero') throw e; return null; } };
    if (den.isConst()) { const r = tryConst(); if (r) return r; }
    if (!den.isConst()) {
      const g = polyGcd(num, den);
      if (g && !g.isConst()) {
        const n2 = divExact(num, g), d2 = divExact(den, g);
        if (n2 && d2) { num = n2; den = d2; }
      }
      if (den.isConst()) { const r = tryConst(); if (r) return r; }
    }
    // normalise the denominator: integer primitive with positive leading coefficient, or monic
    const lc = den.leading(grlexCmp).c;
    if ([...den.t.values()].every((x) => x.c.isRational())) {
      // Gaussian-rational coefficients: scale to a primitive Gaussian-integer form, leading part positive
      let L = 1n, Gc = 0n;
      for (const x of den.t.values()) { const g = x.c.asG(); for (const q of [g.re, g.im]) L = L / bgcd(L, q.d) * q.d; }
      for (const x of den.t.values()) { const g = x.c.asG(); for (const q of [g.re, g.im]) Gc = bgcd(Gc, q.n * (L / q.d)); }
      const lg = lc.asG();
      let f = Q.of(L, Gc || 1n); if (lg.re.sign() < 0 || (lg.re.isZero() && lg.im.sign() < 0)) f = f.neg();
      if (!f.isOne()) { const a = Alg.fromQ(f); num = num.scale(a); den = den.scale(a); }
    } else {
      try { const a = lc.inv(); num = num.scale(a); den = den.scale(a); } catch (e) { /* keep */ }
    }
    return new RF(num, den);
  }
  isZero() { return this.num.isZero(); }
  isPoly() { return this.den.isOne(); }
  isConst() { return this.num.isConst() && this.den.isConst(); }
  constAlg() { if (!this.isConst()) return null; if (this.den.isOne()) return this.num.constAlg(); try { return this.num.constAlg().div(this.den.constAlg()); } catch (e) { return null; } }
  add(o) {
    if (o.isZero()) return this; if (this.isZero()) return o;
    if (this.den.isOne() && o.den.isOne()) return new RF(this.num.add(o.num), Poly.ONE);
    if (this.den.eq(o.den)) return RF.make(this.num.add(o.num), this.den);
    return RF.make(this.num.mul(o.den).add(o.num.mul(this.den)), this.den.mul(o.den));
  }
  neg() { return new RF(this.num.neg(), this.den); }
  sub(o) { return this.add(o.neg()); }
  mul(o) {
    if (this.isZero() || o.isZero()) return RF.ZERO;
    if (this.den.isOne() && o.den.isOne()) return new RF(this.num.mul(o.num), Poly.ONE);
    return RF.make(this.num.mul(o.num), this.den.mul(o.den));
  }
  inv() { if (this.isZero()) fail('Division by zero'); return RF.make(this.den, this.num); }
  div(o) {
    if (o.isZero()) fail('Division by zero');
    if (o.den.isOne() && o.num.isConst() && this.den.isOne()) return new RF(this.num.scale(o.num.constAlg().inv()), Poly.ONE);
    return RF.make(this.num.mul(o.den), this.den.mul(o.num));
  }
  pow(k) {
    if (k < 0) return this.inv().pow(-k);
    if (this.den.isOne()) return new RF(this.num.pow(k), Poly.ONE);
    return new RF(this.num.pow(k), this.den.pow(k));
  }
  eq(o) { return this.sub(o).isZero(); }
  vars() { return new Set([...this.num.vars(), ...this.den.vars()]); }
  conj() {
    const cj = (p) => { const m = new Map(); for (const [k, x] of p.t) m.set(k, { v: x.v, c: x.c.conj() }); return new Poly(m); };
    return RF.make(cj(this.num), cj(this.den));
  }
  latex() {
    if (this.den.isOne()) return this.mainVar ? this.num.latexIn(this.mainVar) : this.num.latex();
    let numP = this.num, denP = this.den;
    // display only: move rational denominators of the numerator's coefficients into the denominator
    let L = 1n, ok = true;
    for (const t of numP.t.values()) for (const v of t.c.t.values()) { L = L / bgcd(L, v.c.re.d) * v.c.re.d; L = L / bgcd(L, v.c.im.d) * v.c.im.d; }
    if (ok && L !== 1n) { const a = Alg.fromQ(Q.of(L)); numP = numP.scale(a); denP = denP.scale(a); }
    const n = numP.latex(), d = denP.latex();
    if (numP.t.size === 1 && n.startsWith('-') && !numP.terms()[0].c.isCompound()) return `-\\frac{${numP.neg().latex()}}{${d}}`;
    return `\\frac{${n}}{${d}}`;
  }
  numeric() {
    const a = this.constAlg(); if (a) return a.numeric();
    if (this.isConst()) { const [nr, ni] = this.num.constAlg().numeric(), [dr, di] = this.den.constAlg().numeric(); const q = dr * dr + di * di; return [(nr * dr + ni * di) / q, (ni * dr - nr * di) / q]; }
    return null;
  }
}
RF.ZERO = new RF(Poly.ZERO, Poly.ONE); RF.ONE = new RF(Poly.ONE, Poly.ONE);

/* ---------- Matrix ---------- */
class Matrix {
  constructor(a) { this.a = a; this.r = a.length; this.c = a[0].length; }
  static fill(r, c, f) { const a = []; for (let i = 0; i < r; i++) { const row = []; for (let j = 0; j < c; j++) row.push(f(i, j)); a.push(row); } return new Matrix(a); }
  static identity(n) { return Matrix.fill(n, n, (i, j) => (i === j ? RF.ONE : RF.ZERO)); }
  static zeros(r, c) { return Matrix.fill(r, c, () => RF.ZERO); }
  get(i, j) { return this.a[i][j]; }
  isSquare() { return this.r === this.c; }
  needSquare(what) { if (!this.isSquare()) fail(`${what} needs a square matrix (this one is ${this.r}×${this.c})`); }
  map(f) { return Matrix.fill(this.r, this.c, (i, j) => f(this.a[i][j], i, j)); }
  add(o) { if (this.r !== o.r || this.c !== o.c) fail(`Can't add a ${this.r}×${this.c} and a ${o.r}×${o.c} matrix`); return this.map((x, i, j) => x.add(o.a[i][j])); }
  sub(o) { if (this.r !== o.r || this.c !== o.c) fail(`Can't subtract a ${o.r}×${o.c} matrix from a ${this.r}×${this.c} matrix`); return this.map((x, i, j) => x.sub(o.a[i][j])); }
  neg() { return this.map((x) => x.neg()); }
  scale(s) { return this.map((x) => s.mul(x)); }
  mul(o) {
    if (this.c !== o.r) fail(`Can't multiply a ${this.r}×${this.c} by a ${o.r}×${o.c} matrix: the first needs as many columns as the second has rows`);
    return Matrix.fill(this.r, o.c, (i, j) => { let s = RF.ZERO; for (let k = 0; k < this.c; k++) { const x = this.a[i][k]; if (!x.isZero()) { const y = o.a[k][j]; if (!y.isZero()) s = s.add(x.mul(y)); } } return s; });
  }
  pow(k) {
    this.needSquare('A matrix power');
    if (k < 0) return this.inv().pow(-k);
    if (k > 4096) fail('Exponent too large');
    let r = Matrix.identity(this.r), b = this;
    while (k) { if (k & 1) r = r.mul(b); k >>= 1; if (k) b = b.mul(b); }
    return r;
  }
  transpose() { return Matrix.fill(this.c, this.r, (i, j) => this.a[j][i]); }
  trace() { this.needSquare('The trace'); let s = RF.ZERO; for (let i = 0; i < this.r; i++) s = s.add(this.a[i][i]); return s; }
  eq(o) { if (this.r !== o.r || this.c !== o.c) return false; for (let i = 0; i < this.r; i++) for (let j = 0; j < this.c; j++) if (!this.a[i][j].eq(o.a[i][j])) return false; return true; }
  /* determinant: clear denominators row by row, then Bareiss fraction-free elimination */
  det() {
    this.needSquare('The determinant');
    const n = this.r;
    if (n === 1) return this.a[0][0];
    if (n === 2) return this.a[0][0].mul(this.a[1][1]).sub(this.a[0][1].mul(this.a[1][0]));
    let denProd = Poly.ONE;
    const rows = this.a.map((row) => {
      let L = Poly.ONE;
      for (const x of row) if (!x.den.isOne()) L = polyLcm(L, x.den);
      denProd = denProd.mul(L);
      return row.map((x) => { if (x.den.isOne()) return x.num.mul(L); const q = divExact(L, x.den); return q ? x.num.mul(q) : fail('Determinant failed'); });
    });
    return RF.make(bareissDet(rows), denProd);
  }
  charpoly(name = 'lambda') {
    this.needSquare('The characteristic polynomial');
    const lam = RF.variable(name);
    return Matrix.fill(this.r, this.r, (i, j) => (i === j ? lam.sub(this.a[i][j]) : this.a[i][j].neg())).det();
  }
  /* inverse: closed form for n ≤ 2, Cayley–Hamilton otherwise (as in Matrix.inv) */
  inv() {
    this.needSquare('The inverse');
    const n = this.r;
    if (n === 1) { if (this.a[0][0].isZero()) fail('The matrix is singular (determinant 0), so it has no inverse'); return new Matrix([[this.a[0][0].inv()]]); }
    if (n === 2) {
      const d = this.det(); if (d.isZero()) fail('The matrix is singular (determinant 0), so it has no inverse');
      const [[a, b], [c, e]] = this.a;
      return new Matrix([[e.div(d), b.neg().div(d)], [c.neg().div(d), a.div(d)]]);
    }
    const name = '\u0000t';
    const p = this.charpoly(name);
    // coefficients c_k of λ^k (p is monic of degree n)
    const coeffs = []; const cn = p.num.coeffsIn(name);
    for (let k = 0; k <= n; k++) coeffs.push(RF.make(cn.get(k) || Poly.ZERO, p.den));
    const c0 = coeffs[0];
    if (c0.isZero()) fail('The matrix is singular (determinant 0), so it has no inverse');
    const I = Matrix.identity(n);
    let B = I;
    for (let k = n - 1; k >= 1; k--) B = B.mul(this).add(I.scale(coeffs[k]));
    return B.scale(c0.neg().inv());
  }
  /* Gauss–Jordan reduced row echelon form over the field of rational functions */
  rrefData() {
    const A = this.a.map((r) => r.slice()); const piv = []; let row = 0;
    for (let col = 0; col < this.c && row < this.r; col++) {
      let best = -1, bestSize = Infinity;
      for (let i = row; i < this.r; i++) { const x = A[i][col]; if (!x.isZero()) { const sz = x.num.t.size + x.den.t.size + (x.isConst() ? 0 : 100); if (sz < bestSize) { best = i; bestSize = sz; } } }
      if (best < 0) continue;
      [A[row], A[best]] = [A[best], A[row]];
      const p = A[row][col];
      A[row] = A[row].map((x) => x.div(p));
      for (let i = 0; i < this.r; i++) if (i !== row && !A[i][col].isZero()) { const f = A[i][col]; A[i] = A[i].map((x, j) => x.sub(f.mul(A[row][j]))); }
      piv.push(col); row++;
    }
    return { M: new Matrix(A), piv };
  }
  rref() { return this.rrefData().M; }
  rank() { return this.rrefData().piv.length; }
  /* fraction-free row echelon form, exactly as Matrix.rref in the library (cross-multiplication) */
  ref() {
    const A = this.a.map((r) => r.slice()); let row = 0;
    for (let col = 0; col < this.c && row < this.r; col++) {
      let k = row; while (k < this.r && A[k][col].isZero()) k++;
      if (k === this.r) continue;
      [A[row], A[k]] = [A[k], A[row]];
      const a = A[row][col];
      for (let i = row + 1; i < this.r; i++) { const b = A[i][col]; if (!b.isZero()) A[i] = A[i].map((x, j) => (j < col ? x : a.mul(x).sub(b.mul(A[row][j])))); }
      row++;
    }
    return new Matrix(A);
  }
  kernel() {
    const { M, piv } = this.rrefData();
    const free = []; for (let j = 0; j < this.c; j++) if (!piv.includes(j)) free.push(j);
    return free.map((f) => {
      const v = new Array(this.c).fill(RF.ZERO); v[f] = RF.ONE;
      piv.forEach((pc, r) => { v[pc] = M.a[r][f].neg(); });
      return clearVector(v);
    });
  }
  image() { const { piv } = this.rrefData(); return piv.map((j) => Matrix.fill(this.r, 1, (i) => this.a[i][j])); }
  minor(i, j) {
    if (i < 0 || j < 0 || i >= this.r || j >= this.c) fail('Row or column index out of range');
    if (this.r < 2 || this.c < 2) fail('Matrix too small to remove a row and column');
    return new Matrix(this.a.filter((_, k) => k !== i).map((row) => row.filter((_, k) => k !== j)));
  }
  isDiagonal() { if (!this.isSquare()) return false; for (let i = 0; i < this.r; i++) for (let j = 0; j < this.c; j++) if (i !== j && !this.a[i][j].isZero()) return false; return true; }
  isTriangular() {
    if (!this.isSquare()) return false; let up = true, lo = true;
    for (let i = 0; i < this.r; i++) for (let j = 0; j < this.c; j++) { if (i > j && !this.a[i][j].isZero()) up = false; if (i < j && !this.a[i][j].isZero()) lo = false; }
    return up || lo;
  }
  latex() {
    return '\\begin{bmatrix}' + this.a.map((r) => r.map((x) => x.latex()).join(' & ')).join(' \\\\ ') + '\\end{bmatrix}';
  }
}
function bareissDet(rows) {
  const n = rows.length; const A = rows.map((r) => r.slice());
  let sign = 1, prev = Poly.ONE;
  for (let k = 0; k < n - 1; k++) {
    if (A[k][k].isZero()) {
      let p = -1; for (let i = k + 1; i < n; i++) if (!A[i][k].isZero()) { p = i; break; }
      if (p < 0) return Poly.ZERO;
      [A[k], A[p]] = [A[p], A[k]]; sign = -sign;
    }
    for (let i = k + 1; i < n; i++) for (let j = k + 1; j < n; j++) {
      const num = A[k][k].mul(A[i][j]).sub(A[i][k].mul(A[k][j]));
      const q = divExact(num, prev);
      if (!q) fail('Determinant failed (inexact division)');
      A[i][j] = q;
    }
    prev = A[k][k];
  }
  return sign < 0 ? A[n - 1][n - 1].neg() : A[n - 1][n - 1];
}
function clearVector(v) { // scale a vector to clear denominators (nicer kernel bases)
  let L = Poly.ONE;
  for (const x of v) if (!x.den.isOne()) L = polyLcm(L, x.den);
  let w = v;
  if (!L.isOne()) { const Lr = RF.fromPoly(L); w = v.map((x) => x.mul(Lr)); }
  // clear rational coefficient denominators
  let den = 1n, allRat = true;
  for (const x of w) { if (!x.isPoly()) { allRat = false; break; } for (const t of x.num.t.values()) { const g = t.c.asG(); if (!g || !g.isReal()) { allRat = false; break; } den = den / bgcd(den, g.re.d) * g.re.d; } }
  if (allRat && den !== 1n) w = w.map((x) => x.mul(RF.int(den)));
  return Matrix.fill(w.length, 1, (i) => w[i]);
}

/* ==========================================================================
   Parser
   ========================================================================== */
const FUNCS = {
  det: 'Determinant', inv: 'Inverse', tr: 'Trace', trace: 'Trace', transpose: 'Transpose', rank: 'Rank',
  rref: 'Reduced row echelon form', ref: 'Fraction-free row echelon form', kernel: 'Kernel (null space) basis', ker: 'Kernel basis', nullspace: 'Kernel basis',
  image: 'Image (column space) basis', colspace: 'Column space basis', charpoly: 'Characteristic polynomial', minor: 'Remove row i and column j',
  identity: 'Identity matrix', zeros: 'Zero matrix', diag: 'Diagonal matrix', dot: 'Dot product', dim: 'Dimensions',
  issymmetric: 'Symmetric?', isantisymmetric: 'Antisymmetric?', isdiagonal: 'Diagonal?', istriangular: 'Triangular?', issquare: 'Square?',
  sqrt: 'Square root', cbrt: 'Cube root', root: 'n-th root', conj: 'Complex conjugate', re: 'Real part', im: 'Imaginary part', abs: 'Absolute value / modulus',
  factor: 'Prime factorisation', isprime: 'Prime?', primes: 'Primes up to n', gcd: 'Greatest common divisor', lcm: 'Least common multiple',
  quo: 'Polynomial quotient', rem: 'Polynomial remainder', deg: 'Degree', coeff: 'Coefficient', lagrange: 'Interpolating polynomial', polyroots: 'Polynomial from roots',
  expand: 'Expand', poly: 'View as a polynomial in one variable', numer: 'Numerator', denom: 'Denominator', approx: 'Decimal approximation', simplify: 'Simplify'
};
const FUNC_LATEX = { det: '\\det', tr: '\\operatorname{tr}', gcd: '\\gcd', deg: '\\deg', dim: '\\dim', ker: '\\ker', re: '\\operatorname{Re}', im: '\\operatorname{Im}' };
const WORDS = [...Object.keys(FUNCS), ...GREEK].sort((a, b) => b.length - a.length);

function tokenize(src) {
  const toks = []; let i = 0;
  const push = (t, v, extra) => toks.push(Object.assign({ t, v, pos: i }, extra || {}));
  while (i < src.length) {
    const ch = src[i];
    if (/\s/.test(ch)) { i++; continue; }
    if (/[0-9.]/.test(ch)) {
      let j = i; while (j < src.length && /[0-9]/.test(src[j])) j++;
      if (src[j] === '.' && /[0-9]/.test(src[j + 1] || '')) { j++; while (j < src.length && /[0-9]/.test(src[j])) j++; }
      else if (j === i) fail('Unexpected "."');
      push('num', src.slice(i, j)); i = j; continue;
    }
    if (/[A-Za-z]/.test(ch)) {
      let j = i; while (j < src.length && /[A-Za-z]/.test(src[j])) j++;
      const run = src.slice(i, j);
      let k = 0; const ids = [];
      while (k < run.length) {
        const rest = run.slice(k);
        if (FUNCS[rest] !== undefined && (k === 0 || /^\s*\(/.test(src.slice(j)))) { ids.push({ fn: rest }); k = run.length; break; }
        const g = GREEK.find((w) => rest.startsWith(w) && FUNCS[w] === undefined);
        if (g) { ids.push({ name: g }); k += g.length; continue; }
        ids.push({ name: rest[0] }); k++;
      }
      i = j;
      // subscript: x_1, x_{12}, x2
      let sub = null;
      if (src[i] === '_') {
        if (src[i + 1] === '{') { const e = src.indexOf('}', i + 2); if (e < 0) fail('Missing "}" in subscript'); sub = src.slice(i + 2, e).replace(/\s/g, ''); i = e + 1; }
        else { let e = i + 1; while (e < src.length && /[A-Za-z0-9]/.test(src[e])) e++; sub = src.slice(i + 1, e); i = e; }
        if (!sub) fail('Empty subscript');
      } else if (/[0-9]/.test(src[i] || '') && ids.length && ids[ids.length - 1].name) {
        let e = i; while (e < src.length && /[0-9]/.test(src[e])) e++; sub = src.slice(i, e); i = e;
      }
      if (sub !== null) { const last = ids[ids.length - 1]; if (last.fn) fail(`"${last.fn}" is a function and can't take a subscript`); last.name += '_' + sub; }
      for (const t of ids) toks.push(t.fn ? { t: 'fn', v: t.fn } : { t: 'id', v: t.name });
      continue;
    }
    if (GREEK_UNI[ch]) { push('id', GREEK_UNI[ch]); i++; continue; }
    if (ch === '√') { push('fn', 'sqrt'); i++; continue; }
    if (ch === '*' && src[i + 1] === '*') { push('op', '^'); i += 2; continue; }
    if ('*·×⋅'.includes(ch)) { push('op', '*'); i++; continue; }
    if ('/÷'.includes(ch)) { push('op', '/'); i++; continue; }
    if ('-−–'.includes(ch)) { push('op', '-'); i++; continue; }
    if ('+^()[]{},;='.includes(ch)) { push('op', ch); i++; continue; }
    if (ch === "'" || ch === '′' || ch === 'ᵀ') { push('op', "'"); i++; continue; }
    fail(`Unexpected character "${ch}"`);
  }
  return toks;
}

function parse(src) {
  const toks = tokenize(src); let p = 0;
  const peek = () => toks[p]; const isOp = (v) => toks[p] && toks[p].t === 'op' && toks[p].v === v;
  const expect = (v) => { if (!isOp(v)) fail(toks[p] ? `Expected "${v}" but found "${toks[p].v}"` : `Missing "${v}"`); p++; };
  const startsPrimary = (t) => t && (t.t === 'num' || t.t === 'id' || t.t === 'fn' || (t.t === 'op' && '([{'.includes(t.v)));
  function expr() {
    let l = mult();
    while (isOp('+') || isOp('-')) { const op = toks[p++].v; const r = mult(); l = { k: op === '+' ? 'add' : 'sub', l, r }; }
    return l;
  }
  function mult() {
    let l = unary();
    while (true) {
      if (isOp('*') || isOp('/')) { const op = toks[p++].v; const r = unary(); l = { k: op === '*' ? 'mul' : 'div', l, r, explicit: true }; }
      else if (startsPrimary(peek())) { const r = power(); l = { k: 'mul', l, r }; }
      else break;
    }
    return l;
  }
  function unary() {
    if (isOp('-')) { p++; return { k: 'neg', e: unary() }; }
    if (isOp('+')) { p++; return unary(); }
    return power();
  }
  function power() {
    const b = postfix();
    if (isOp('^')) { p++; const e = unary(); return { k: 'pow', b, e }; }
    return b;
  }
  function postfix() { let e = primary(); while (isOp("'")) { p++; e = { k: 'tr', e }; } return e; }
  function args() { expect('('); const a = []; if (isOp(')')) { p++; return a; } a.push(expr()); while (isOp(',')) { p++; a.push(expr()); } expect(')'); return a; }
  function primary() {
    const t = peek();
    if (!t) fail('Expression is incomplete');
    if (t.t === 'num') { p++; return { k: 'num', v: t.v }; }
    if (t.t === 'fn') { p++; if (isOp('(')) return { k: 'call', f: t.v, args: args() }; if (!startsPrimary(peek())) fail(`${t.v} needs an argument, like ${t.v}(x)`); return { k: 'call', f: t.v, args: [power()], bare: true }; }
    if (t.t === 'id') { p++; if (isOp('(')) return { k: 'apply', name: t.v, args: args() }; return { k: 'id', name: t.v }; }
    if (isOp('(')) { p++; const items = [expr()]; while (isOp(',')) { p++; items.push(expr()); } expect(')'); return items.length === 1 ? { k: 'group', e: items[0] } : { k: 'tuple', items }; }
    if (isOp('{')) { p++; const e = expr(); expect('}'); return { k: 'group', e, brace: true }; }
    if (isOp('[')) {
      p++;
      if (isOp('[')) {
        const rows = [];
        do { expect('['); const r = [expr()]; while (isOp(',')) { p++; r.push(expr()); } expect(']'); rows.push(r); } while (isOp(',') && ++p);
        expect(']'); return { k: 'matrix', rows };
      }
      if (isOp(']')) fail('Empty matrix');
      const rows = [[expr()]]; let semi = false;
      while (isOp(',') || isOp(';')) { const s = toks[p++].v; if (s === ';') { semi = true; rows.push([]); } rows[rows.length - 1].push(expr()); }
      expect(']');
      if (!semi) return { k: 'matrix', rows: rows[0].map((x) => [x]), vector: true };
      return { k: 'matrix', rows };
    }
    fail(`Unexpected "${t.v}"`);
  }
  if (!toks.length) return { k: 'empty' };
  const eqs = toks.filter((t) => t.t === 'op' && t.v === '=').length;
  if (eqs > 1) fail('Only one "=" is allowed per line');
  let node;
  if (eqs === 1) {
    const lhs = expr(); expect('='); if (!peek()) fail('Nothing after "="'); const rhs = expr();
    node = { k: 'def', lhs, rhs };
  } else node = expr();
  if (p < toks.length) fail(`Unexpected "${toks[p].v}"`);
  return node;
}

/* ---------- AST → LaTeX (typeset input) ---------- */
function astLatex(n) {
  const L = astLatex;
  const strip = (x) => (x.k === 'group' ? L(x.e) : L(x));
  const startsNum = (x) => { while (x.k === 'mul' || x.k === 'pow' || x.k === 'div') x = x.k === 'pow' ? x.b : x.l; return x.k === 'num' || x.k === 'neg'; };
  switch (n.k) {
    case 'empty': return '';
    case 'num': return n.v;
    case 'id': return varLatex(n.name);
    case 'neg': return '-' + L(n.e);
    case 'add': return L(n.l) + '+' + L(n.r);
    case 'sub': return L(n.l) + '-' + L(n.r);
    case 'mul': {
      const a = L(n.l), b = L(n.r);
      const dot = startsNum(n.r) || (n.l.k === 'matrix' && n.r.k === 'matrix') || (n.explicit && !(n.l.k === 'num' && n.r.k !== 'num'));
      return a + (dot ? '\\cdot ' : ' ') + b;
    }
    case 'div': return `\\frac{${strip(n.l)}}{${strip(n.r)}}`;
    case 'pow': {
      let b = L(n.b);
      if (['add', 'sub', 'mul', 'div', 'neg', 'pow'].includes(n.b.k)) b = `\\left(${b}\\right)`;
      if (n.e.k === 'id' && n.e.name === 'T') return `${b}^{\\mathsf{T}}`;
      return `${b}^{${strip(n.e)}}`;
    }
    case 'tr': return `${['add', 'sub', 'mul', 'div', 'neg'].includes(n.e.k) ? `\\left(${L(n.e)}\\right)` : L(n.e)}^{\\mathsf{T}}`;
    case 'group': return `\\left(${L(n.e)}\\right)`;
    case 'tuple': return `\\left(${n.items.map(L).join(', ')}\\right)`;
    case 'matrix': return '\\begin{bmatrix}' + n.rows.map((r) => r.map(L).join(' & ')).join(' \\\\ ') + '\\end{bmatrix}';
    case 'call': {
      const a = n.args;
      if (n.f === 'sqrt' && a.length === 1) return `\\sqrt{${strip(a[0])}}`;
      if (n.f === 'cbrt' && a.length === 1) return `\\sqrt[3]{${strip(a[0])}}`;
      if (n.f === 'root' && a.length === 2) return `\\sqrt[${strip(a[1])}]{${strip(a[0])}}`;
      if (n.f === 'abs' && a.length === 1) return `\\left|${strip(a[0])}\\right|`;
      if (n.f === 'conj' && a.length === 1) return `\\overline{${strip(a[0])}}`;
      if ((n.f === 'transpose') && a.length === 1) return `${a[0].k === 'id' || a[0].k === 'matrix' ? L(a[0]) : `\\left(${strip(a[0])}\\right)`}^{\\mathsf{T}}`;
      if (n.f === 'inv' && a.length === 1 && (a[0].k === 'id' || a[0].k === 'matrix')) return `${L(a[0])}^{-1}`;
      const fname = FUNC_LATEX[n.f] || `\\operatorname{${n.f}}`;
      return `${fname}\\left(${a.map(strip).join(', ')}\\right)`;
    }
    case 'apply': return `${varLatex(n.name)}\\left(${n.args.map(strip).join(', ')}\\right)`;
    case 'def': return `${L(n.lhs)}=${L(n.rhs)}`;
  }
  return '';
}

/* ==========================================================================
   Evaluator — order-independent (Desmos-style) line resolution
   ========================================================================== */
const isM = (x) => x instanceof Matrix;
/* ---------- UPoly : polynomial in one main variable (the library's Polynomial class) ----------
   Polynomial(lc, cst): a main variable plus a coefficient list, lowest power first.
   Coefficients are RFs that do not contain the main variable, so they may be symbolic
   (a, √2, 1/a, 2+i …). This keeps "polynomial in λ" separate from its constants. */
class UPoly {
  constructor(v, c) {
    this.v = v; this.c = c.slice();
    while (this.c.length && this.c[this.c.length - 1].isZero()) this.c.pop();   // cleanup()
  }
  static fromRF(f, v) {
    if (f.den.degIn(v) > 0) return null;                       // a genuine fraction in v: not a polynomial
    const cs = f.num.coeffsIn(v), d = f.num.degIn(v), c = [];
    for (let k = 0; k <= d; k++) c.push(RF.make(cs.get(k) || Poly.ZERO, f.den));
    return new UPoly(v, c);
  }
  static of(f, v) { return (f instanceof UPoly ? (f.v === v ? f : UPoly.fromRF(f.toRF(), v)) : UPoly.fromRF(f, v)); }
  deg() { return this.c.length - 1; }                         // −1 for the zero polynomial
  isZero() { return this.c.length === 0; }
  coef(k) { return this.c[k] || RF.ZERO; }
  freeOf(s) { return !(s instanceof RF) || !s.vars().has(this.v); }
  toRF() {
    let r = RF.ZERO; const X = RF.variable(this.v);
    for (let k = this.deg(); k >= 0; k--) r = r.mul(X).add(this.c[k]);   // Horner
    return r;
  }
  add(o) { const n = Math.max(this.c.length, o.c.length), c = []; for (let k = 0; k < n; k++) c.push(this.coef(k).add(o.coef(k))); return new UPoly(this.v, c); }
  neg() { return new UPoly(this.v, this.c.map((x) => x.neg())); }
  sub(o) { return this.add(o.neg()); }
  scale(s) { return new UPoly(this.v, this.c.map((x) => s.mul(x))); }
  mul(o) {
    if (this.isZero() || o.isZero()) return new UPoly(this.v, []);
    const c = Array.from({ length: this.c.length + o.c.length - 1 }, () => RF.ZERO);
    this.c.forEach((x, i) => { if (!x.isZero()) o.c.forEach((y, j) => { if (!y.isZero()) c[i + j] = c[i + j].add(x.mul(y)); }); });
    return new UPoly(this.v, c);
  }
  pow(k) {
    if (k < 0) fail('Negative power of a polynomial');
    if (k > 200) fail('Exponent too large');
    let r = new UPoly(this.v, [RF.ONE]), b = this;
    while (k) { if (k & 1) r = r.mul(b); k >>= 1; if (k) b = b.mul(b); }
    return r;
  }
  /* Polynomial.__call__: Horner's method at a number, an expression, another polynomial or a square matrix */
  at(val) {
    if (val && val.kind) fail('A polynomial can only be evaluated at a number, an expression or a square matrix');
    if (isM(val)) val.needSquare('Evaluating a polynomial at a matrix');
    if (this.isZero()) return RF.ZERO;
    let res = this.c[this.deg()];
    for (let k = this.deg() - 1; k >= 0; k--) res = opAdd(opMul(res, val), this.c[k], false);
    return res;
  }
  latex() {
    if (this.isZero()) return '0';
    const X = (k) => (k === 0 ? '' : varLatex(this.v) + (k === 1 ? '' : `^{${k}}`));
    const leadNeg = (f) => { const t = f.num.sorted()[0]; return !!t && t.c.isRealRational() && t.c.asG().re.sign() < 0; };
    let s = '';
    for (let k = this.deg(); k >= 0; k--) {
      const f = this.c[k]; if (f.isZero()) continue;
      let tl;
      const a = f.constAlg();
      if (a && !a.isCompound()) {                                  // plain number coefficient
        if (k > 0 && a.isOne()) tl = X(k);
        else if (k > 0 && a.eq(Alg.int(-1))) tl = '-' + X(k);
        else tl = a.latex() + X(k);
      } else if (f.isPoly() && f.num.t.size === 1 && !f.num.terms()[0].c.isCompound()) {   // a single term such as 2a or −√2
        tl = f.latex() + X(k);
      } else if (!f.isPoly()) {                                     // a fraction is already a visual unit: −(a²+1)/a λ
        const neg = leadNeg(f);
        tl = (neg ? '-' : '') + (neg ? f.neg() : f).latex().replace(/^-/, '') + X(k);
        if (!neg && f.latex().startsWith('-')) tl = f.latex() + X(k);
      } else {                                                     // compound coefficient: keep it in one bracket
        const neg = leadNeg(f);
        tl = (neg ? '-' : '') + `\\left(${(neg ? f.neg() : f).latex()}\\right)` + X(k);
      }
      if (!s) s = tl; else s += tl.startsWith('-') ? tl : '+' + tl;
    }
    return s;
  }
}
const isU = (x) => x instanceof UPoly;
const deU = (x) => (isU(x) ? x.toRF() : x);
const asPoly = (v, x) => { if (isU(v)) return v; const u = UPoly.fromRF(v, x); return u || v; };
const isS = (x) => x instanceof RF;
const BOOL = (b) => ({ kind: 'bool', v: b });
const TEX = (t) => ({ kind: 'tex', tex: t });
const LIST = (items, set) => ({ kind: 'list', items, set });

function asScalar(x, what) { x = deU(x); if (!isS(x)) fail(`${what} must be a number or expression, not a ${isM(x) ? 'matrix' : 'list'}`); return x; }
function asMatrix(x, what) { if (!isM(x)) fail(`${what} must be a matrix`); return x; }
function asInt(x, what) {
  const a = isS(x) ? x.constAlg() : null; const g = a && a.asG();
  if (!g || !g.isReal() || !g.re.isInt()) fail(`${what} must be a whole number`);
  const v = g.re.n; if (babs(v) > 1000000n) fail(`${what} is too large`);
  return Number(v);
}
function asIntBig(x, what) {
  const a = isS(x) ? x.constAlg() : null; const g = a && a.asG();
  if (!g || !g.isReal() || !g.re.isInt()) fail(`${what} must be a whole number`);
  return g.re.n;
}
function asVarName(x, what) {
  if (isS(x) && x.isPoly() && x.num.t.size === 1) { const t = x.num.terms()[0]; if (t.c.isOne() && t.v.length === 1 && t.v[0][1] === 1) return t.v[0][0]; }
  fail(`${what} must be a single variable such as x`);
}
function vecEntries(x) { const M = asMatrix(x, 'Argument'); if (M.c === 1) return M.a.map((r) => r[0]); if (M.r === 1) return M.a[0]; fail('Expected a vector'); }

function opAdd(a, b, sub) {
  if (isU(a) || isU(b)) {
    const P = isU(a) ? a : b, o = isU(a) ? b : a;
    let Q = null;
    if (isU(o) && o.v === P.v) Q = o; else if (isS(o) && P.freeOf(o)) Q = new UPoly(P.v, [o]);
    if (Q) { const A = isU(a) ? P : Q, B = isU(a) ? Q : P; return sub ? A.sub(B) : A.add(B); }
    a = deU(a); b = deU(b);
  }
  if (isS(a) && isS(b)) return sub ? a.sub(b) : a.add(b);
  if (isM(a) && isM(b)) return sub ? a.sub(b) : a.add(b);
  if (isM(a) && isS(b)) { a.needSquare('Adding a number to a matrix'); const I = Matrix.identity(a.r).scale(b); return sub ? a.sub(I) : a.add(I); }
  if (isS(a) && isM(b)) { b.needSquare('Adding a number to a matrix'); const I = Matrix.identity(b.r).scale(a); return sub ? I.sub(b) : I.add(b); }
  fail(`Can't ${sub ? 'subtract' : 'add'} these values`);
}
function opMul(a, b) {
  if (isU(a) || isU(b)) {
    const P = isU(a) ? a : b, o = isU(a) ? b : a;
    if (isU(o) && o.v === P.v) return P.mul(o);
    if (isS(o) && P.freeOf(o)) return P.scale(o);
    a = deU(a); b = deU(b);
  }
  if (isS(a) && isS(b)) return a.mul(b);
  if (isS(a) && isM(b)) return b.scale(a);
  if (isM(a) && isS(b)) return a.scale(b);
  if (isM(a) && isM(b)) { const r = a.mul(b); return r.r === 1 && r.c === 1 && (a.r === 1 && b.c === 1) ? r.a[0][0] : r; }
  fail("Can't multiply these values");
}
function opDiv(a, b) {
  if (isU(a) && isS(b) && a.freeOf(b)) { if (b.isZero()) fail('Division by zero'); return a.scale(b.inv()); }
  a = deU(a); b = deU(b);
  if (isS(b)) { if (b.isZero()) fail('Division by zero'); if (isS(a)) return a.div(b); if (isM(a)) return a.scale(b.inv()); }
  if (isM(b)) fail('Division by a matrix is not defined — use inv(B) instead');
  fail("Can't divide these values");
}
function opPow(a, e, eNode) {
  if (isU(a)) { const ea = isS(e) && e.constAlg(), g = ea && ea.asG(); if (g && g.isReal() && g.re.isInt() && g.re.sign() >= 0) return a.pow(Number(g.re.n)); a = deU(a); }
  e = deU(e);
  if (isM(a)) {
    if (eNode && eNode.k === 'id' && eNode.name === 'T') return a.transpose();
    return a.pow(asInt(e, 'A matrix exponent'));
  }
  a = asScalar(a, 'The base');
  const ea = isS(e) ? e.constAlg() : null; const eg = ea && ea.asG();
  if (!eg || !eg.isReal()) fail('Exponents must be numbers (variables cannot be exponents)');
  const q = eg.re;
  if (q.isInt()) { if (babs(q.n) > 100000n) fail('Exponent too large'); return a.pow(Number(q.n)); }
  const base = a.constAlg();
  if (!base) fail('Fractional powers are only supported for constants');
  if (q.d > 64n) fail('Root index too large');
  return RF.fromAlg(base.root(Number(q.d)).pow(Number(q.n)));
}

/* evaluate a one-variable polynomial / rational function at a value (number, expression or square matrix) */
function polyAt(P, v, val) {
  const cs = P.coeffsIn(v), deg = P.degIn(v);
  let res = RF.fromPoly(cs.get(deg) || Poly.ZERO);
  for (let k = deg - 1; k >= 0; k--) res = opAdd(opMul(res, val), RF.fromPoly(cs.get(k) || Poly.ZERO), false);
  return res;
}
function substitute(f, v, val) {
  if (val && val.kind) fail('A polynomial can only be evaluated at a number, an expression or a square matrix');
  if (isM(val)) val.needSquare('Evaluating a polynomial at a matrix');
  const N = polyAt(f.num, v, val);
  if (f.den.isOne()) return N;
  const D = polyAt(f.den, v, val);
  if (isM(D)) return opMul(N, D.inv());
  return opDiv(N, D);
}

class Engine {
  constructor() { this.reset(); }
  reset() { this.defs = new Map(); this.memo = new Map(); this.lines = []; }
  evaluateAll(lines) {
    this.reset();
    const parsed = lines.map((ln) => {
      const r = { id: ln.id, src: ln.text, ast: null, def: null, err: null, state: 'idle' };
      if (ln.convError) { r.err = ln.convError; return r; }
      if (!ln.text || !ln.text.trim()) { r.empty = true; return r; }
      try {
        r.ast = parse(ln.text);
        if (r.ast.k === 'def') {
          const L = r.ast.lhs;
          if (L.k === 'id') r.def = { kind: 'var', name: L.name };
          else if (L.k === 'apply' && L.args.every((x) => x.k === 'id') && new Set(L.args.map((x) => x.name)).size === L.args.length) r.def = { kind: 'func', name: L.name, params: L.args.map((x) => x.name) };
          else if (L.k === 'mul' && L.l.k === 'id' && L.r.k === 'group' && L.r.e.k === 'id') r.def = { kind: 'func', name: L.l.name, params: [L.r.e.name] };
          else fail('The left side of "=" must be a name (like A) or a function (like f(x))');
          if (r.def.name === 'i') fail('i is the imaginary unit and cannot be redefined');
          if (r.def.kind === 'func' && r.def.params.includes('i')) fail('i cannot be used as a parameter name');
        }
      } catch (e) { r.err = e instanceof MathError ? e.message : 'Could not understand this line'; }
      return r;
    });
    this.lines = parsed;
    for (const r of parsed) if (r.def && !r.err) { if (!this.defs.has(r.def.name)) this.defs.set(r.def.name, []); this.defs.get(r.def.name).push(r); }
    for (const [name, rs] of this.defs) if (rs.length > 1) rs.forEach((r) => { r.dupErr = `"${name}" is defined on more than one line`; });
    return parsed.map((r) => this.result(r));
  }
  lineValue(r) {
    if (r.err) fail(r.err);
    if (r.dupErr) fail(r.dupErr);
    if (r.state === 'done') return r.value;
    if (r.state === 'error') fail(r.valErr);
    if (r.state === 'busy') fail('Circular definition');
    r.state = 'busy';
    try {
      const node = r.ast.k === 'def' ? r.ast.rhs : r.ast;
      let v;
      if (r.def && r.def.kind === 'func') { const scope = new Map(r.def.params.map((n) => [n, RF.variable(n)])); v = this.ev(node, scope, 0); }
      else v = this.ev(node, new Map(), 0);
      r.value = v; r.state = 'done'; return v;
    } catch (e) {
      r.state = 'error';
      r.valErr = e instanceof MathError ? e.message : (e instanceof RangeError ? 'Computation too large' : 'Internal error: ' + e.message);
      fail(r.valErr);
    }
  }
  lookup(name, scope, depth) {
    if (scope.has(name)) return scope.get(name);
    if (name === 'i') return RF.fromG(G.I);
    const d = this.defs.get(name);
    if (d) {
      const r = d[0];
      if (r.def.kind === 'func') fail(`${name} is a function — call it like ${name}(x)`);
      try { return this.lineValue(r); }
      catch (e) { if (e.message === 'Circular definition') throw e; fail(`"${name}" has an error`); }
    }
    return RF.variable(name);
  }
  callUser(name, argVals, depth) {
    const r = this.defs.get(name)[0];
    if (r.err || r.dupErr) fail(`"${name}" has an error`);
    if (argVals.length !== r.def.params.length) fail(`${name} takes ${r.def.params.length} argument${r.def.params.length > 1 ? 's' : ''}`);
    if (depth > 40) fail('Function calls nest too deeply (recursive definition?)');
    const scope = new Map(r.def.params.map((n, k) => [n, argVals[k]]));
    try { return this.ev(r.ast.rhs, scope, depth + 1); }
    catch (e) { if (e instanceof MathError) throw e; throw e; }
  }
  ev(n, scope, depth) {
    switch (n.k) {
      case 'num': {
        if (n.v.includes('.')) { const [a, b] = n.v.split('.'); return RF.q(Q.of(BigInt((a || '0') + b), 10n ** BigInt(b.length))); }
        return RF.q(Q.of(BigInt(n.v)));
      }
      case 'id': return this.lookup(n.name, scope, depth);
      case 'group': return this.ev(n.e, scope, depth);
      case 'neg': { const v = this.ev(n.e, scope, depth); if (isS(v) || isM(v) || isU(v)) return v.neg(); fail("Can't negate this value"); }
      case 'add': return opAdd(this.ev(n.l, scope, depth), this.ev(n.r, scope, depth), false);
      case 'sub': return opAdd(this.ev(n.l, scope, depth), this.ev(n.r, scope, depth), true);
      case 'mul': return opMul(this.ev(n.l, scope, depth), this.ev(n.r, scope, depth));
      case 'div': return opDiv(this.ev(n.l, scope, depth), this.ev(n.r, scope, depth));
      case 'pow': {
        const b = this.ev(n.b, scope, depth);
        const eN = n.e.k === 'group' ? n.e.e : n.e;
        if (isM(b) && eN.k === 'id' && eN.name === 'T' && !scope.has('T') && !this.defs.has('T')) return b.transpose();
        return opPow(b, this.ev(n.e, scope, depth), null);
      }
      case 'tr': { const v = this.ev(n.e, scope, depth); if (isM(v)) return v.transpose(); if (isS(v) || isU(v)) return v; fail('Transpose needs a matrix'); }
      case 'tuple': return LIST(n.items.map((x) => this.ev(x, scope, depth)), false);
      case 'matrix': {
        const w = n.rows[0].length;
        if (n.rows.some((r) => r.length !== w)) fail('All rows of a matrix must have the same length');
        const a = n.rows.map((r) => r.map((x) => { const v = deU(this.ev(x, scope, depth)); if (!isS(v)) fail('Matrix entries must be numbers or expressions'); return v; }));
        return new Matrix(a);
      }
      case 'apply': {
        const d = this.defs.get(n.name);
        if (!scope.has(n.name) && d && d[0].def.kind === 'func') return this.callUser(n.name, n.args.map((x) => this.ev(x, scope, depth)), depth);
        const base = this.lookup(n.name, scope, depth);
        const named = scope.has(n.name) || (d && d[0].def.kind === 'var');
        if (named && isU(base)) {                     // Polynomial.__call__ on its main variable
          if (n.args.length !== 1) fail(`${n.name} is a polynomial in ${base.v === 'lambda' ? 'λ' : base.v}, so it takes one value`);
          return base.at(this.ev(n.args[0], scope, depth));
        }
        if (named && isS(base) && !base.isConst()) {
          // Polynomial.__call__: p = x² + 1 ⇒ p(1) = 2, p(a), p(q), p(A)
          const vs = [...base.vars()].sort(cmpName);
          if (vs.length > 1) fail(`${n.name} contains ${vs.map((v) => v.replace(/_.*/, '')).join(', ')}, so it's unclear which to replace. Define it as a function instead, e.g. ${n.name}(${vs.join(', ')}) = …`);
          if (n.args.length !== 1) fail(`${n.name} is a polynomial in ${vs[0]}, so it takes one value`);
          return substitute(base, vs[0], this.ev(n.args[0], scope, depth));
        }
        if (n.args.length !== 1) fail(`${n.name} is not a function`);
        return opMul(base, this.ev(n.args[0], scope, depth));
      }
      case 'call': return this.builtin(n.f, n.args.map((x) => this.ev(x, scope, depth)));
      case 'def': fail('Unexpected "="');
    }
    fail('Unknown expression');
  }
  builtin(f, a) {
    const need = (k, m = k) => { if (a.length < k || a.length > m) fail(`${f} takes ${k === m ? k : k + '–' + m} argument${m > 1 ? 's' : ''}`); };
    const M0 = () => asMatrix(a[0], `The argument of ${f}`);
    switch (f) {
      case 'det': need(1); return M0().det();
      case 'inv': need(1); if (isS(a[0])) return a[0].inv(); return M0().inv();
      case 'tr': case 'trace': need(1); return M0().trace();
      case 'transpose': need(1); if (isS(a[0])) return a[0]; return M0().transpose();
      case 'rank': need(1); return RF.int(M0().rank());
      case 'rref': need(1); return M0().rref();
      case 'ref': need(1); return M0().ref();
      case 'kernel': case 'ker': case 'nullspace': { need(1); const k = M0().kernel(); return k.length ? LIST(k, true) : LIST([Matrix.zeros(M0().c, 1)], true); }
      case 'image': case 'colspace': { need(1); const im = M0().image(); return im.length ? LIST(im, true) : LIST([Matrix.zeros(M0().r, 1)], true); }
      case 'charpoly': { need(1, 2); const name = a[1] ? asVarName(a[1], 'The variable') : 'lambda'; return asPoly(M0().charpoly(name), name); }
      case 'poly': {
        need(1, 2); const f = asScalar(a[0], 'The expression');
        let x;
        if (a[1]) x = asVarName(a[1], 'The variable');
        else if (isU(a[0])) return a[0];
        else { const vs = [...f.vars()].sort(cmpName); if (vs.length !== 1) fail(vs.length ? 'Say which variable: poly(e, x)' : 'poly needs an expression with a variable'); x = vs[0]; }
        const u = UPoly.fromRF(f, x); if (!u) fail(`This is a fraction in ${x}, not a polynomial in ${x}`);
        return u;
      }
      case 'minor': need(3); return M0().minor(asInt(a[1], 'Row index') - 1, asInt(a[2], 'Column index') - 1);
      case 'identity': { need(1); const n = asInt(a[0], 'The size'); if (n < 1 || n > 40) fail('Size must be between 1 and 40'); return Matrix.identity(n); }
      case 'zeros': { need(1, 2); const r = asInt(a[0], 'Rows'), c = a[1] ? asInt(a[1], 'Columns') : r; if (r < 1 || c < 1 || r > 40 || c > 40) fail('Size must be between 1 and 40'); return Matrix.zeros(r, c); }
      case 'diag': {
        if (a.length === 1 && isM(a[0])) { const v = vecEntries(a[0]); return Matrix.fill(v.length, v.length, (i, j) => (i === j ? v[i] : RF.ZERO)); }
        if (!a.length) fail('diag needs entries'); a.forEach((x) => asScalar(x, 'Each diagonal entry'));
        return Matrix.fill(a.length, a.length, (i, j) => (i === j ? a[i] : RF.ZERO));
      }
      case 'dot': { need(2); const u = vecEntries(a[0]), v = vecEntries(a[1]); if (u.length !== v.length) fail('Vectors have different dimensions'); let s = RF.ZERO; u.forEach((x, k) => { s = s.add(x.mul(v[k])); }); return s; }
      case 'dim': need(1); { const M = M0(); return TEX(`${M.r}\\times ${M.c}`); }
      case 'issymmetric': need(1); { const M = M0(); return BOOL(M.isSquare() && M.eq(M.transpose())); }
      case 'isantisymmetric': need(1); { const M = M0(); return BOOL(M.isSquare() && M.transpose().eq(M.neg())); }
      case 'isdiagonal': need(1); return BOOL(M0().isDiagonal());
      case 'istriangular': need(1); return BOOL(M0().isTriangular());
      case 'issquare': need(1); return BOOL(M0().isSquare());
      case 'sqrt': case 'cbrt': case 'root': {
        if (f === 'root') need(2); else need(1);
        const n = f === 'sqrt' ? 2 : f === 'cbrt' ? 3 : asInt(a[1], 'The root index');
        if (n < 1 || n > 64) fail('Root index must be between 1 and 64');
        const x = asScalar(a[0], 'The radicand');
        const c = x.constAlg();
        if (!c) {
          if (x.isPoly() && x.num.t.size === 1) { // root of a monomial with exponents divisible by n
            const t = x.num.terms()[0];
            if (t.v.every(([, e]) => e % n === 0)) { const v = t.v.map(([nm, e]) => [nm, e / n]); try { return RF.fromPoly(Poly.term(v, t.c.root(n))); } catch (e) { /* fallthrough */ } }
          }
          fail('Roots of symbolic expressions are not supported — roots must be of constants');
        }
        return RF.fromAlg(c.root(n));
      }
      case 'conj': need(1); if (isM(a[0])) return a[0].map((x) => x.conj()); return asScalar(a[0], 'The argument').conj();
      case 're': case 'im': {
        need(1); const x = asScalar(a[0], 'The argument');
        const c = x.conj();
        return f === 're' ? x.add(c).div(RF.int(2)) : x.sub(c).div(RF.fromG(new G(Q.ZERO, Q.of(2))));
      }
      case 'abs': {
        need(1); const x = asScalar(a[0], 'The argument'); const c = x.constAlg();
        if (!c) fail('abs is only defined for constants (variables are symbolic)');
        const g = c.asG();
        if (g) { if (g.isReal()) return RF.q(g.re.sign() < 0 ? g.re.neg() : g.re); return RF.fromAlg(Alg.fromQ(g.norm()).root(2)); }
        const [re, im] = c.numeric();
        if (Math.abs(im) < 1e-12) return re < 0 ? x.neg() : x;
        return RF.fromAlg(c.mul(c.conj()).root(2));
      }
      case 'factor': {
        need(1); const n = asIntBig(a[0], 'factor’s argument');
        if (n === 0n) return RF.ZERO; if (babs(n) === 1n) return RF.int(Number(n));
        const fs = factorBig(n);
        return TEX((n < 0n ? '-' : '') + fs.map(([p, e]) => (e > 1 ? `${p}^{${e}}` : String(p))).join('\\cdot '));
      }
      case 'isprime': need(1); return BOOL(isPrimeBig(asIntBig(a[0], 'The argument')));
      case 'primes': {
        need(1); const n = asInt(a[0], 'The bound'); if (n > 100000) fail('Bound too large (max 100000)');
        const out = []; const sieve = new Uint8Array(n + 1);
        for (let k = 2; k <= n; k++) if (!sieve[k]) { out.push(RF.int(k)); for (let m = k * k; m <= n; m += k) sieve[m] = 1; }
        return LIST(out, false);
      }
      case 'gcd': case 'lcm': {
        if (a.length < 2) fail(`${f} needs at least two arguments`);
        const xs = a.map((x) => asScalar(x, 'Each argument'));
        if (xs.every((x) => { const g = x.constAlg() && x.constAlg().asG(); return g && g.isReal() && g.re.isInt(); })) {
          const ints = xs.map((x) => x.constAlg().asG().re.n);
          if (f === 'gcd') return RF.q(Q.of(ints.reduce((p, q) => bgcd(p, q))));
          return RF.q(Q.of(ints.reduce((p, q) => (p === 0n || q === 0n ? 0n : babs(p / bgcd(p, q) * q)))));
        }
        if (!xs.every((x) => x.isPoly())) fail(`${f} needs polynomials or whole numbers`);
        let acc = xs[0].num;
        for (const x of xs.slice(1)) { const g = f === 'gcd' ? polyGcd(acc, x.num) : polyLcm(acc, x.num); if (!g) fail('Could not compute this gcd exactly'); acc = f === 'lcm' ? monic(g) : g; }
        return RF.fromPoly(acc);
      }
      case 'quo': case 'rem': {
        need(2, 3);
        const P = asScalar(a[0], 'The dividend'), D = asScalar(a[1], 'The divisor');
        if (!P.isPoly() || !D.isPoly()) fail(`${f} needs polynomials`);
        let x;
        if (a[2]) x = asVarName(a[2], 'The variable');
        else { const vs = [...new Set([...P.num.vars(), ...D.num.vars()])].sort(cmpName); if (vs.length === 0) { x = 'x'; } else if (vs.length === 1) x = vs[0]; else fail(`Several variables — say which one: ${f}(p, q, x)`); }
        if (D.isZero()) fail('Division by zero polynomial');
        const [q, r] = divModIn(P.num, D.num, x);
        return asPoly(f === 'quo' ? q : r, x);
      }
      case 'deg': {
        need(1, 2);
        if (isU(a[0]) && (!a[1] || asVarName(a[1], 'The variable') === a[0].v)) return a[0].isZero() ? TEX('-\\infty') : RF.int(a[0].deg());
        const P = asScalar(a[0], 'The argument'); if (!P.isPoly()) fail('deg needs a polynomial');
        if (P.isZero()) return TEX('-\\infty');
        if (a[1]) return RF.int(P.num.degIn(asVarName(a[1], 'The variable')));
        return RF.int(P.num.totalDeg());
      }
      case 'coeff': {
        need(3); const P = asScalar(a[0], 'The polynomial'); if (!P.isPoly()) fail('coeff needs a polynomial');
        const x = asVarName(a[1], 'The variable'), k = asInt(a[2], 'The power');
        return RF.fromPoly(P.num.coeffsIn(x).get(k) || Poly.ZERO);
      }
      case 'lagrange': {
        if (a.length === 0) fail('lagrange needs points like (0,1), (1,3)');
        let pts = a, x = 'x';
        if (a.length >= 1 && isS(a[a.length - 1]) && a.length > 1) { x = asVarName(a[a.length - 1], 'The variable'); pts = a.slice(0, -1); }
        const P = pts.map((pt) => { if (!pt || pt.kind !== 'list' || pt.items.length !== 2) fail('Each point must look like (x, y)'); const it = pt.items.map(deU); if (!it.every(isS)) fail('Each point must look like (x, y)'); return it; });
        for (let s = 0; s < P.length; s++) for (let t = s + 1; t < P.length; t++) if (P[s][0].eq(P[t][0])) fail('Two points share the same x-value');
        const X = RF.variable(x); let res = RF.ZERO;
        P.forEach(([xi, yi], s) => {
          let L = RF.ONE;
          P.forEach(([xj], t) => { if (s !== t) L = L.mul(X.sub(xj).div(xi.sub(xj))); });
          res = res.add(yi.mul(L));
        });
        return asPoly(res, x);
      }
      case 'polyroots': {
        if (!a.length) fail('polyroots needs at least one root');
        let roots = a, x = 'x';
        if (a.length > 1 && a[a.length - 1].kind === undefined && isS(a[a.length - 1])) { /* all scalars: roots only */ }
        if (a.length === 1 && isM(a[0])) roots = vecEntries(a[0]);
        const X = RF.variable(x); let P = RF.ONE;
        for (const r of roots) P = P.mul(X.sub(asScalar(r, 'Each root')));
        return asPoly(P, x);
      }
      case 'expand': case 'simplify': need(1); return deU(a[0]);
      case 'numer': need(1); return RF.fromPoly(asScalar(a[0], 'The argument').num);
      case 'denom': need(1); return RF.fromPoly(asScalar(a[0], 'The argument').den);
      case 'approx': {
        need(1); const x = asScalar(a[0], 'The argument'); const v = x.numeric();
        if (!v) fail('approx needs a constant (no variables)');
        return TEX(fmtComplex(v));
      }
    }
    fail(`Unknown function ${f}`);
  }
  result(r) {
    const out = { id: r.id, inputLatex: '', outLatex: null, approx: null, error: null, kind: null, defName: r.def ? r.def.name : null };
    if (r.empty) { out.kind = 'empty'; return out; }
    if (r.ast) { try { out.inputLatex = astLatex(r.ast); } catch (e) { out.inputLatex = ''; } }
    if (r.err) { out.error = r.err; return out; }
    if (r.dupErr) { out.error = r.dupErr; return out; }
    let v;
    try { v = this.lineValue(r); }
    catch (e) { out.error = e instanceof MathError ? e.message : 'Computation failed'; return out; }
    out.kind = isM(v) ? 'matrix' : isS(v) ? 'scalar' : isU(v) ? 'polynomial' : v.kind;
    if (isU(v)) out.polyVar = v.v;
    out.outLatex = valueLatex(v);
    const rhsTex = r.ast.k === 'def' ? astLatex(r.ast.rhs) : null;
    const norm = (s) => (s || '').replace(/\\left|\\right|\\cdot|\s/g, '');
    if (r.def && norm(rhsTex) === norm(out.outLatex)) out.same = true;
    if (isS(v)) {
      const num = v.numeric();
      if (num) {
        const a = v.constAlg(); const g = a && a.asG();
        const trivial = g && g.isReal() && g.re.isInt();
        if (!trivial) out.approx = fmtComplex(num);
      }
    }
    if (r.def && r.def.kind === 'func') out.kind = 'function';
    return out;
  }
}
function fmtNum(x) {
  if (!isFinite(x)) return String(x);
  if (Math.abs(x) < 1e-12) return '0';
  const ax = Math.abs(x);
  let s = (ax >= 1e10 || ax < 1e-6) ? x.toExponential(6) : String(Number(x.toPrecision(10)));
  if (s.includes('e')) { const [m, e] = s.split('e'); s = `${String(Number(m))}\\times 10^{${Number(e)}}`; }
  return s;
}
function fmtComplex([re, im]) {
  if (Math.abs(im) < 1e-12 * Math.max(1, Math.abs(re))) return fmtNum(re);
  const r = Math.abs(re) < 1e-12 ? '' : fmtNum(re);
  const imAbs = Math.abs(im), sign = im < 0 ? '-' : (r ? '+' : '');
  return `${r}${sign}${Math.abs(imAbs - 1) < 1e-15 ? '' : fmtNum(imAbs)}i`;
}
function valueLatex(v) {
  if (isS(v) || isM(v) || isU(v)) return v.latex();
  if (v.kind === 'bool') return v.v ? '\\text{true}' : '\\text{false}';
  if (v.kind === 'tex') return v.tex;
  if (v.kind === 'list') { const inner = v.items.map(valueLatex).join(',\\ '); return v.set ? `\\left\\{${inner}\\right\\}` : `\\left[${inner}\\right]`; }
  return '';
}


/* ==========================================================================
   LaTeX ⇄ text bridges for the MathQuill editor
   ========================================================================== */
const MQ_BUILTIN_OPS = new Set(['det', 'deg', 'dim', 'gcd', 'ker', 'arg', 'exp', 'ln', 'log', 'max', 'min']);
const GREEK_ALIAS = { varepsilon: 'epsilon', varphi: 'phi', vartheta: 'theta', varrho: 'rho', varsigma: 'sigma', varpi: 'pi', xi: 'xi' };
function latexToText(L, opts = {}) {
  function conv(s) {
    let i = 0, out = '';
    const sp = () => { while (s[i] === ' ') i++; };
    const grp = () => {
      sp();
      if (s[i] === '{') {
        let d = 0; const st = i;
        for (; i < s.length; i++) { if (s[i] === '{') d++; else if (s[i] === '}' && --d === 0) { i++; return s.slice(st + 1, i - 1); } }
        fail('Unbalanced braces');
      }
      if (s[i] === '\\') { const m = /^\\([a-zA-Z]+|.)/.exec(s.slice(i)); i += m[0].length; return m[0]; }
      return s[i++] || '';
    };
    const opt = () => {
      sp(); if (s[i] !== '[') return null;
      let d = 0; const st = i;
      for (; i < s.length; i++) { if (s[i] === '[') d++; else if (s[i] === ']' && --d === 0) { i++; return s.slice(st + 1, i - 1); } }
      fail('Unbalanced brackets');
    };
    const word = (w) => { sp(); out += ' ' + w + (s[i] === '_' || s[i] === '^' ? '' : ' '); };
    while (i < s.length) {
      const c = s[i];
      if (c === '\\') {
        const m = /^\\([a-zA-Z]+)/.exec(s.slice(i));
        if (!m) {
          const ch = s[i + 1]; i += 2;
          if (ch === '{') out += '('; else if (ch === '}') out += ')'; else if (ch === '%') fail('Unexpected "%"'); else out += ' ';
          continue;
        }
        const name = m[1]; i += m[0].length;
        switch (name) {
          case 'frac': case 'dfrac': case 'tfrac': { const a = conv(grp()), b = conv(grp()); out += `((${a})/(${b}))`; break; }
          case 'sqrt': { const n = opt(); const a = conv(grp()); out += n !== null ? ` root((${a}),(${conv(n)}))` : ` sqrt(${a})`; break; }
          case 'left': case 'right': {
            sp(); let d = s[i];
            if (d === '\\') { const mm = /^\\([a-zA-Z]+|.)/.exec(s.slice(i)); i += mm[0].length; d = { lbrack: '[', rbrack: ']', lbrace: '(', rbrace: ')', '{': '(', '}': ')', '|': '|', vert: '|', lvert: '|', rvert: '|', langle: '(', rangle: ')' }[mm[1]] || ''; }
            else i++;
            if (d === '|') out += name === 'left' ? ' abs(' : ')';
            else if (d !== '.') out += d;
            break;
          }
          case 'cdot': case 'times': case 'ast': out += '*'; break;
          case 'div': out += '/'; break;
          case 'lbrack': out += '['; break; case 'rbrack': out += ']'; break;
          case 'prime': out += "'"; break;
          case 'quad': case 'qquad': out += ' '; break;
          case 'operatorname': case 'mathrm': case 'text': case 'mathit': case 'textrm': {
            const a = grp().replace(/\\[a-z]+/g, '').replace(/[^A-Za-z0-9]/g, '');
            if (a) word(a); break;
          }
          case 'mathbf': case 'boldsymbol': case 'mathsf': out += conv(grp()); break;
          case 'embed': {
            const kind = grp(), id = opt();
            if (kind !== 'matrix' || !opts.matrix) fail('Unsupported embedded object');
            const rows = opts.matrix(id);
            if (!rows) fail('This matrix was lost; insert a new one');
            const cells = rows.map((r) => r.map((c) => conv(c || '').trim()));
            if (cells.some((r) => r.some((c) => !c))) fail('Fill in every matrix entry');
            out += '[' + cells.map((r) => '[' + r.join(',') + ']').join(',') + ']';
            break;
          }
          case 'begin': {
            const env = grp();
            if (!/matrix$/.test(env)) fail(`Unsupported environment ${env}`);
            const endTag = '\\end{' + env + '}', e = s.indexOf(endTag, i);
            if (e < 0) fail('Missing \\end{' + env + '}');
            const body = s.slice(i, e); i = e + endTag.length;
            const rows = body.split('\\\\').map((r) => r.split('&').map((x) => conv(x).trim())).filter((r) => r.some((x) => x));
            out += '[' + rows.map((r) => r.join(',')).join(';') + ']';
            break;
          }
          default: {
            const g = GREEK_ALIAS[name] || name;
            if (GREEK.includes(g) || g === 'xi' || MQ_BUILTIN_OPS.has(g) || FUNCS[g] !== undefined) { word(g); break; }
            fail(`Unsupported symbol \\${name}`);
          }
        }
        continue;
      }
      if (c === '^') { i++; const t = conv(grp()).trim(); out += (/^[A-Za-z]$/.test(t) || /^\d+$/.test(t)) ? '^' + t : '^(' + t + ')'; continue; }
      if (c === '_') { i++; out += '_{' + conv(grp()).replace(/\s/g, '') + '}'; continue; }
      if (c === '{') { out += '(' + conv(grp()) + ')'; continue; }
      if (c === '}' || c === '$') { i++; continue; }
      if (c === '~') { out += ' '; i++; continue; }
      out += c; i++;
    }
    return out;
  }
  return conv(L).replace(/\s+/g, ' ').trim();
}

/* plain-text input → MathQuill-editable LaTeX (used for examples & older saved sheets) */
function astToMQ(n) {
  const T = astToMQ;
  const strip = (x) => (x.k === 'group' ? T(x.e) : T(x));
  const wrap = (x) => (['add', 'sub', 'mul', 'div', 'neg', 'pow'].includes(x.k) ? `\\left(${T(x)}\\right)` : T(x));
  const startsNum = (x) => { while (x.k === 'mul' || x.k === 'pow') x = x.k === 'pow' ? x.b : x.l; return x.k === 'num' || x.k === 'neg'; };
  const name = (nm) => {
    let [base, sub] = nm.split(/_(.*)/s);
    const b = GREEK.includes(base) || base === 'xi' ? '\\' + base + ' ' : base;
    return sub !== undefined ? `${b}_{${sub}}` : b;
  };
  const list = (xs) => xs.map(strip).join(',');
  switch (n.k) {
    case 'empty': return '';
    case 'num': return n.v;
    case 'id': return name(n.name);
    case 'neg': return '-' + T(n.e);
    case 'add': return T(n.l) + '+' + T(n.r);
    case 'sub': return T(n.l) + '-' + T(n.r);
    case 'mul': return T(n.l) + ((n.explicit && !(n.l.k === 'num' && n.r.k !== 'num')) || startsNum(n.r) ? '\\cdot ' : '') + T(n.r);
    case 'div': return `\\frac{${strip(n.l)}}{${strip(n.r)}}`;
    case 'pow': return `${wrap(n.b)}^{${strip(n.e)}}`;
    case 'tr': return `${wrap(n.e)}^{T}`;
    case 'group': return `\\left(${T(n.e)}\\right)`;
    case 'tuple': return `\\left(${list(n.items)}\\right)`;
    case 'matrix':
      if (mqMatrixHook) return mqMatrixHook(n.rows.map((r) => r.map(strip)));
      if (n.vector) return `\\left[${list(n.rows.map((r) => r[0]))}\\right]`;
      return `\\left[${n.rows.map((r) => `\\left[${list(r)}\\right]`).join(',')}\\right]`;
    case 'call': {
      const a = n.args;
      if (n.f === 'sqrt' && a.length === 1) return `\\sqrt{${strip(a[0])}}`;
      if (n.f === 'cbrt' && a.length === 1) return `\\sqrt[3]{${strip(a[0])}}`;
      if (n.f === 'root' && a.length === 2) return `\\sqrt[${strip(a[1])}]{${strip(a[0])}}`;
      if (n.f === 'abs' && a.length === 1) return `\\left|${strip(a[0])}\\right|`;
      const f = MQ_BUILTIN_OPS.has(n.f) ? `\\${n.f}` : `\\operatorname{${n.f}}`;
      return `${f}\\left(${list(a)}\\right)`;
    }
    case 'apply': return `${name(n.name)}\\left(${list(n.args)}\\right)`;
    case 'def': return `${T(n.lhs)}=${T(n.rhs)}`;
  }
  return '';
}
let mqMatrixHook = null;
function textToMQ(text, matrixHook) {
  mqMatrixHook = matrixHook || null;
  try { return astToMQ(parse(text)); } catch (e) { return text.replace(/([\\{}])/g, '\\$1'); } finally { mqMatrixHook = null; }
}

global.Dido = { latexToText, textToMQ, MQ_OPS: Object.keys(FUNCS), Engine, parse, astLatex, MathError, FUNCS, Q, G, Alg, Poly, RF, Matrix, tokenize };
})(typeof window !== 'undefined' ? window : globalThis);
