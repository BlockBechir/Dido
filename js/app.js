/* Dido — user interface */
(function () {
'use strict';
const { Engine } = window.Dido;
const engine = new Engine();
const MQ = MathQuill.getInterface(2);
let matStore = {};
let matSeq = 0;
const newMatId = () => 'm' + Date.now().toString(36) + (++matSeq).toString(36);
function emptyCells(r, c) { return Array.from({ length: r }, () => Array.from({ length: c }, () => '')); }
function matrixHook(rows) { const id = newMatId(); matStore[id] = { rows }; return `\\embed{matrix}[${id}]`; }
const toMQ = (t) => Dido.textToMQ(t, matrixHook);
MQ.registerEmbed('matrix', (id) => {
  id = (id || '').trim() || newMatId();
  if (!matStore[id]) matStore[id] = { rows: emptyCells(2, 2) };
  return { htmlString: `<span class="dmx" data-mid="${id}"></span>`, text: () => 'matrix', latex: () => `\\embed{matrix}[${id}]` };
});
const TOUCH = (window.matchMedia && matchMedia('(hover: none) and (pointer: coarse)').matches) ||
  /Android|iPhone|iPad|iPod/i.test(navigator.userAgent) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
let activeMF = null;
const MQ_CONFIG = {
  spaceBehavesLikeTab: false,
  leftRightIntoCmdGoes: 'up',
  restrictMismatchedBrackets: true,
  sumStartsWithNEquals: true,
  supSubsRequireOperand: true,
  charsThatBreakOutOfSupSub: '+-=<>,;)]',
  autoSubscriptNumerals: false,
  autoCommands: 'pi sqrt nthroot alpha beta gamma delta epsilon theta kappa lambda mu rho sigma tau phi chi psi omega Gamma Delta Theta Lambda Sigma Phi Psi Omega',
  substituteTextarea: () => {
    // on touch screens the Dido keypad replaces the phone keyboard (inputmode="none"); hardware keyboards still work
    const t = document.createElement('textarea');
    ['autocapitalize', 'autocomplete', 'autocorrect'].forEach((a) => t.setAttribute(a, 'off'));
    t.setAttribute('spellcheck', 'false');
    if (TOUCH) t.setAttribute('inputmode', 'none');
    return t;
  },
  autoOperatorNames: 'det inv rank rref kernel image charpoly minor identity zeros diag transpose trace nullspace colspace issymmetric isantisymmetric isdiagonal istriangular issquare conj abs factor isprime primes gcd lcm quo coeff lagrange polyroots expand numer denom approx simplify cbrt root dot dim deg'
};
const $ = (s, el = document) => el.querySelector(s);
const hasKatex = () => typeof window.katex !== 'undefined';

/* ---------- icons ---------- */
const ICON = {
  grip: '<svg class="grip" viewBox="0 0 24 24" fill="currentColor"><circle cx="9" cy="6" r="1.6"/><circle cx="15" cy="6" r="1.6"/><circle cx="9" cy="12" r="1.6"/><circle cx="15" cy="12" r="1.6"/><circle cx="9" cy="18" r="1.6"/><circle cx="15" cy="18" r="1.6"/></svg>',
  up: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M6 15l6-6 6 6"/></svg>',
  down: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M6 9l6 6 6-6"/></svg>',
  del: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"><path d="M6 6l12 12M18 6L6 18"/></svg>',
  copy: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="9" y="9" width="11" height="11" rx="2"/><path d="M5 15V5a2 2 0 0 1 2-2h8"/></svg>',
  warn: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="9"/><path d="M12 7.5v5.5M12 16.5v.2"/></svg>',
  sun: '<circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/>',
  moon: '<path d="M20 14.5A8 8 0 1 1 9.5 4a6.5 6.5 0 0 0 10.5 10.5z"/>'
};

/* ---------- examples ---------- */
const EXAMPLES = {
  tour: { title: 'Guided tour', sub: 'A bit of everything, defined out of order', lines: [
    'det(M)',
    'M = [[1, 2+i, a], [0, 3, b], [i, 1, 2]]',
    'p = x^2 - 5x + 6',
    'p(B)',
    'p(2 + i)',
    'B = [[2, 1], [1, 3]]',
    'inv(B)',
    'charpoly(B)',
    '(a^2 - b^2)/(a - b)',
    'sqrt(12) + sqrt(27)',
    '(1 + 2i)/(3 - 4i)',
    'kernel([[1, 2, 3], [2, 4, 6], [1, 1, 1]])'
  ] },
  linalg: { title: 'Linear algebra', sub: 'Determinants, inverses, kernels, powers', lines: [
    'A = [[a, b], [c, d]]',
    'det(A)', 'inv(A)', 'A^T', 'tr(A)', 'charpoly(A)',
    'N = [[2, 1, 0], [1, 3, 1], [0, 1, 4]]',
    'inv(N)', 'N^4', 'N inv(N)', 'issymmetric(N)',
    'S = [1, 2, 3; 2, 4, 6; 1, 1, 1]',
    'rank(S)', 'rref(S)', 'kernel(S)', 'image(S)',
    'det([[x, 1, 1, 1], [1, x, 1, 1], [1, 1, x, 1], [1, 1, 1, x]])'
  ] },
  poly: { title: 'Polynomials & fractions', sub: 'Expansion, division, gcd, interpolation', lines: [
    '(a + b)^5',
    'P = x^3 + 2x + 1',
    'quo(P, x + 1)', 'rem(P, x + 1)',
    'gcd(x^2 - 1, x^2 + 2x + 1)',
    '(x^2 + 2xy + y^2)/(x^2 - y^2)',
    '1/(x + 1) + 1/(x - 1)',
    'L = lagrange((0, 1), (1, 3), (2, 7))',
    'L(10)',
    'lagrange((0, i), (1, 1 + i), (i, 2))',
    'lagrange((1/2, 1/3), (2/3, 3/4))',
    'lagrange((a, 1), (b, 2))',
    'polyroots(1, 2, 3)',
    'coeff((x + 1)^6, x, 3)',
    'f(t) = t^2 + 1', 'f(f(t))'
  ] },
  radical: { title: 'Radicals & complex numbers', sub: 'Exact roots, denesting, Gaussian rationals', lines: [
    'sqrt(72)', 'cbrt(54)', 'sqrt(3 + 2sqrt(2))', 'sqrt(5 + 2sqrt(6))',
    '1/(1 + sqrt(2))', 'sqrt(-8)', 'sqrt(3 + 4i)', '(1 + i)^10', 'abs(3 + 4i)',
    'conj((2 - i)^3)', '8^(2/3)', 'factor(360)', 'det([[sqrt(2), 1], [1, sqrt(2)]])'
  ] }
};

/* ---------- reference ---------- */
const REF = [
  { h: 'Writing math', note: 'Type plain text; Dido typesets it as you go. Letters without a definition are symbols. Multiplication can be implicit: 2a, ab, (a+b)(a−b).', items: [
    ['matrix', 'Type the word matrix to get a 2 × 2 grid. Drag its corner to add rows or columns; Tab or → moves to the next entry', 'mx:'],
    ['A = …', 'Define a name; any line can use it, above or below', 'w:A='],
    ['[[1, 2], [3, 4]]  or  [1, 2; 3, 4]', 'Matrices can also be typed by rows', 'w:\\left[1,2;3,4\\right]'],
    ['[1, 2, 3]', 'Column vector', 'w:\\left[1,2,3\\right]'],
    ['x_1, a_2, alpha, theta', 'Subscripts and Greek letters', 't:x_'],
    ['2^(1/2), 8^(2/3)', 'Fractional powers of constants', 't:^'],
  ] },
  { h: 'Polynomials in one variable', note: 'Like the library\'s Polynomial class, Dido keeps a polynomial as one main variable plus a list of coefficients, and coefficients may contain other letters, roots, fractions or i. charpoly, quo, rem, lagrange, polyroots and poly() all return this form, shown one term per power. Name it and call it to plug in a value, exactly as Polynomial(value) works in the library. Write p·(…) with a dot to multiply instead.', items: [
    ['P = charpoly(A)  then  P(A)', 'Characteristic polynomial in λ; P(A) gives the zero matrix (Cayley–Hamilton)', 'w:P=\\operatorname{charpoly}\\left(A\\right)'],
    ['poly(a x^2 + b x + c, x)', 'View any expression as a polynomial in x, with a, b, c as coefficients', 'fn:poly'],
    ['deg(P), coeff(P, λ, 1)', 'Degree in the main variable; a single coefficient', 'fn:deg'],
    ['expand(P)', 'Back to an ordinary expression', 'fn:expand'],
    ['p = x^2 + 1  then  p(1)', 'Plug in a number: p(1) = 2', 'w:p=x^2+1'],
    ['p(a + 1)', 'Plug in a variable or expression: a² + 2a + 2', 'fn:p'],
    ['p(q)', 'Plug in another polynomial (composition)', 'fn:p'],
    ['p(A)', 'Plug in a square matrix: A² + I', 'fn:p'],
    ['r = 1/(x + 1)  then  r(A)', 'Rational functions too; at a matrix this is (A + I)⁻¹', 'w:r=\\frac{1}{x+1}'],
    ['f(x, y) = x^2 + y', 'With several variables, define a function to say which is which', 'w:f\\left(x,y\\right)='],
  ] },
  { h: 'Lagrange interpolation', note: 'lagrange finds the lowest-degree polynomial through the given points. The coordinates can be whole numbers, fractions, complex numbers or symbols; the answer is exact.', items: [
    ['lagrange((0, 1), (1, 3), (2, 7))', 'Whole numbers: x² + x + 1', 'w:\\operatorname{lagrange}\\left(\\left(0,1\\right),\\left(1,3\\right),\\left(2,7\\right)\\right)'],
    ['lagrange((1/2, 1/3), (2/3, 3/4))', 'Fractions: 5/2·x − 11/12', 'w:\\operatorname{lagrange}\\left(\\left(\\frac{1}{2},\\frac{1}{3}\\right),\\left(\\frac{2}{3},\\frac{3}{4}\\right)\\right)'],
    ['lagrange((0, i), (1, 1 + i), (i, 2))', 'Complex points: 2ix² + (1 − 2i)x + i', 'w:\\operatorname{lagrange}\\left(\\left(0,i\\right),\\left(1,1+i\\right),\\left(i,2\\right)\\right)'],
    ['lagrange((a, 1), (b, 2))', 'Symbolic points: (2a − b − x)/(a − b)', 'w:\\operatorname{lagrange}\\left(\\left(a,1\\right),\\left(b,2\\right)\\right)'],
    ['lagrange((0, 0), (1, 1), (2, 8), (3, 27), t)', 'A last argument names the variable (default x)', 'fn:lagrange'],
    ['L = lagrange(…)  then  L(5)', 'Name the result to evaluate it anywhere', 'w:L=\\operatorname{lagrange}\\left(\\left(0,1\\right),\\left(1,3\\right),\\left(2,7\\right)\\right)'],
  ] },
  { h: 'Matrices', items: [
    ['det(A)', 'Determinant (Bareiss, fraction-free)', 'fn:det'],
    ['inv(A)  or  A^-1', 'Exact inverse', 'fn:inv'],
    ['A^T  or  transpose(A)', 'Transpose', 'fn:transpose'],
    ['A^n', 'Matrix power (negative n uses the inverse)', 't:^'],
    ['tr(A)', 'Trace', 'fn:tr'],
    ['rank(A)', 'Rank', 'fn:rank'],
    ['rref(A)', 'Reduced row echelon form', 'fn:rref'],
    ['ref(A)', 'Fraction-free row echelon form', 'fn:ref'],
    ['kernel(A)', 'Basis of the null space', 'fn:kernel'],
    ['image(A)', 'Basis of the column space', 'fn:image'],
    ['charpoly(A)', 'Characteristic polynomial det(λI − A)', 'fn:charpoly'],
    ['minor(A, i, j)', 'Delete row i and column j', 'fn:minor'],
    ['dot(u, v)', 'Dot product of two vectors', 'fn:dot'],
    ['identity(n), zeros(m, n)', 'Identity and zero matrices', 'fn:identity'],
    ['diag(a, b, c)', 'Diagonal matrix', 'fn:diag'],
    ['dim(A)', 'Size, rows × columns', 'fn:dim'],
    ['issymmetric(A), isantisymmetric(A)', 'Symmetry tests', 'fn:issymmetric'],
    ['isdiagonal(A), istriangular(A), issquare(A)', 'Shape tests', 'fn:istriangular'],
  ] },
  { h: 'Polynomials & fractions', items: [
    ['quo(p, q, x)', 'Quotient of long division in x', 'fn:quo'],
    ['rem(p, q, x)', 'Remainder of long division in x', 'fn:rem'],
    ['gcd(p, q), lcm(p, q)', 'For polynomials or whole numbers', 'fn:gcd'],
    ['deg(p), deg(p, x)', 'Total degree, or degree in x', 'fn:deg'],
    ['coeff(p, x, k)', 'Coefficient of xᵏ', 'fn:coeff'],
    ['numer(r), denom(r)', 'Numerator and denominator', 'fn:numer'],
    ['polyroots(r₁, r₂, …)', 'Monic polynomial with those roots', 'fn:polyroots'],
  ] },
  { h: 'Numbers, radicals & complex', items: [
    ['i', 'Imaginary unit, i² = −1 (predefined)', 't:i'],
    ['sqrt(x), cbrt(x), root(x, n)', 'Simplified exact roots, with denesting', 't:sqrt'],
    ['conj(z), re(z), im(z)', 'Conjugate and parts (variables treated as real)', 'fn:conj'],
    ['abs(z)', 'Absolute value or modulus', 'fn:abs'],
    ['factor(n), isprime(n), primes(n)', 'Integer factorisation and primes', 'fn:factor'],
    ['approx(x)', 'Decimal value of a constant', 'fn:approx'],
  ] },
];

/* ---------- state ---------- */
let seq = 0;
const newId = () => 'L' + (++seq) + Math.random().toString(36).slice(2, 6);
let state = { lines: [], selected: null };
let results = new Map();
let undoSnapshot = null;
const rows = new Map(); // id → row element
let editingId = null;

function store(k, v) { try { localStorage.setItem(k, v); } catch (e) {} }
function load(k) { try { return localStorage.getItem(k); } catch (e) { return null; } }

/* ---------- KaTeX helpers ---------- */
const boost = (l) => (l && l.includes('{bmatrix}') && l.includes('\\frac{') ? '\\def\\arraystretch{2}' + l.replace(/\\frac\{/g, '\\dfrac{') : l);
function tex(el, latex, display) {
  latex = boost(latex);
  const key = (display ? 'D:' : 'I:') + latex;
  if (el._tex === key) return;
  el._tex = key;
  if (!latex) { el.textContent = ''; return; }
  if (hasKatex()) {
    try { katex.render(latex, el, { throwOnError: false, displayMode: !!display, strict: 'ignore', output: 'htmlAndMathml' }); return; }
    catch (e) { /* fall through */ }
  }
  el.textContent = latex;
}

/* ---------- rows ---------- */
function makeRow(line) {
  const row = document.createElement('div');
  row.className = 'row';
  row.dataset.id = line.id;
  row.innerHTML = `
    <div class="gutter" draggable="true" title="Drag to reorder"><span class="num"></span><span class="status-dot"></span>${ICON.grip}</div>
    <div class="body">
      <div class="tex-in" role="button" tabindex="-1"></div>
      <div class="field"><span class="mq"></span><span class="ph">Type an expression, e.g. det([[a, b], [c, d]])</span></div>
      <div class="preview"></div>
      <div class="out"><span class="eq">=</span><div class="tex-out"></div><span class="approx"></span><button class="copy-out" title="Copy result as LaTeX" aria-label="Copy result as LaTeX">${ICON.copy}</button></div>
      <div class="err">${ICON.warn}<span class="err-msg"></span></div>
    </div>
    <div class="actions">
      <button class="up" title="Move up (Alt+↑)" aria-label="Move line up">${ICON.up}</button>
      <button class="down" title="Move down (Alt+↓)" aria-label="Move line down">${ICON.down}</button>
      <button class="del" title="Delete line" aria-label="Delete line">${ICON.del}</button>
    </div>`;
  const fieldEl = $('.mq', row);
  let silent = true;
  const mf = MQ.MathField(fieldEl, Object.assign({}, MQ_CONFIG, { handlers: {
    edit: () => {
      if (silent) return;
      if (/(?:^|[^A-Za-z\\{])matrix(?![A-Za-z])/.test(mf.latex())) {
        // typing the word "matrix" summons a 2×2 matrix editor
        silent = true;
        for (let k = 0; k < 6; k++) mf.keystroke('Backspace');
        const id = newMatId(); matStore[id] = { rows: emptyCells(2, 2) };
        mf.write(`\\embed{matrix}[${id}]`);
        silent = false;
        mountMatrices(row);
        focusCell(row, id, 0, 0);
      }
      mountMatrices(row);
      line.latex = mf.latex();
      row.classList.toggle('is-empty', !line.latex);
      schedule();
    },
    enter: () => insertLine(indexOf(line.id) + 1, '', true),
    upOutOf: () => { const k = indexOf(line.id); if (k > 0) focusLine(state.lines[k - 1].id, 'end'); },
    downOutOf: () => { const k = indexOf(line.id); if (k < state.lines.length - 1) focusLine(state.lines[k + 1].id, 'end'); },
    deleteOutOf: (dir) => { if (dir === MQ.L && !mf.latex() && state.lines.length > 1) deleteLine(line.id, false); }
  } }));
  mf.latex(line.latex || '');
  silent = false;
  row._mf = mf;
  mountMatrices(row);
  row.classList.toggle('is-empty', !line.latex);
  fieldEl.addEventListener('focusin', (e) => { if (!e.target.closest('.dmx')) activeMF = mf; editingId = line.id; lastInputId = line.id; select(line.id); row.classList.add('editing'); });
  fieldEl.addEventListener('focusout', () => {
    setTimeout(() => { if (!fieldEl.contains(document.activeElement)) { row.classList.remove('editing'); if (editingId === line.id) editingId = null; } }, 0);
  });
  fieldEl.addEventListener('keydown', (e) => {
    if (e.altKey && (e.key === 'ArrowUp' || e.key === 'ArrowDown')) { e.preventDefault(); e.stopPropagation(); moveLine(line.id, e.key === 'ArrowUp' ? -1 : 1, true); }
    else if (e.key === 'Escape') { e.stopPropagation(); if (e.target.closest('.dmx')) mf.focus(); else mf.blur(); }
  }, true);
  $('.tex-in', row).addEventListener('mousedown', (e) => { e.preventDefault(); focusLine(line.id, 'end'); });
  row.addEventListener('mousedown', (e) => { if (!e.target.closest('.field, button')) select(line.id); });
  $('.up', row).addEventListener('click', () => moveLine(line.id, -1, true));
  $('.down', row).addEventListener('click', () => moveLine(line.id, 1, true));
  $('.del', row).addEventListener('click', () => deleteLine(line.id, true));
  $('.copy-out', row).addEventListener('click', () => { const r = results.get(line.id); if (r && r.outLatex) copyText(r.outLatex, 'Result copied as LaTeX'); });

  // drag and drop
  const gutter = $('.gutter', row);
  gutter.addEventListener('dragstart', (e) => {
    dragId = line.id; row.classList.add('dragging');
    e.dataTransfer.effectAllowed = 'move';
    try { e.dataTransfer.setData('text/plain', line.id); e.dataTransfer.setDragImage(row, 20, 20); } catch (err) {}
  });
  gutter.addEventListener('dragend', () => { row.classList.remove('dragging'); clearDrop(); dragId = null; });
  row.addEventListener('dragover', (e) => {
    if (!dragId || dragId === line.id) return;
    e.preventDefault(); e.dataTransfer.dropEffect = 'move';
    const r = row.getBoundingClientRect(), after = e.clientY > r.top + r.height / 2;
    clearDrop(); row.classList.add(after ? 'drop-after' : 'drop-before'); dropTarget = { id: line.id, after };
  });
  row.addEventListener('drop', (e) => {
    e.preventDefault();
    if (!dragId || !dropTarget) return;
    const from = indexOf(dragId); const [moved] = state.lines.splice(from, 1);
    let to = indexOf(dropTarget.id) + (dropTarget.after ? 1 : 0);
    state.lines.splice(to, 0, moved);
    clearDrop(); syncDom(); recompute(); select(moved.id);
  });
  return row;
}
let dragId = null, dropTarget = null;
function clearDrop() { document.querySelectorAll('.drop-before, .drop-after').forEach((el) => el.classList.remove('drop-before', 'drop-after')); dropTarget = null; }


function updateRow(line, r, idx) {
  const row = rows.get(line.id); if (!row) return;
  $('.num', row).textContent = idx + 1;
  const ta = row.querySelector('textarea'); if (ta) ta.setAttribute('aria-label', 'Line ' + (idx + 1));
  tex($('.tex-in', row), r.inputLatex ? '\\displaystyle ' + r.inputLatex : '', false);
  tex($('.preview', row), r.inputLatex ? '\\displaystyle ' + r.inputLatex : '', false);
  row.classList.toggle('mat-view', !!r.inputLatex && r.inputLatex.includes('{bmatrix}') && !r.error);
  row.classList.toggle('grid-edit', (line.latex || '').includes('\\embed{matrix}'));
  const showOut = !!r.outLatex && !r.error && !r.same;
  row.classList.toggle('has-out', showOut);
  if (showOut) {
    tex($('.tex-out', row), '\\displaystyle ' + r.outLatex, false);
    row.classList.toggle('out-tall', /bmatrix|\\left\\\{|\\left\[/.test(r.outLatex));
    tex($('.approx', row), r.approx ? '\\approx ' + r.approx : '', false);
  }
  row.classList.toggle('is-err', !!r.error);
  $('.err-msg', row).textContent = r.error || '';
  row.classList.toggle('is-def', !!r.defName && !r.error);
}

function syncDom() {
  const list = $('#list');
  const addBtn = $('#add-row');
  const ids = new Set(state.lines.map((l) => l.id));
  for (const [id, el] of rows) if (!ids.has(id)) { el.remove(); rows.delete(id); }
  state.lines.forEach((line) => {
    let row = rows.get(line.id);
    if (!row) { row = makeRow(line); rows.set(line.id, row); }
    list.insertBefore(row, addBtn);
  });
}

/* ---------- evaluation ---------- */
let pending = false;
function schedule() { if (pending) return; pending = true; requestAnimationFrame(() => { pending = false; recompute(); }); }
function recompute() {
  let res;
  try {
    res = engine.evaluateAll(state.lines.map((l) => {
      try { return { id: l.id, text: Dido.latexToText(l.latex || '', { matrix: (id) => matStore[id] && matStore[id].rows }) }; }
      catch (e) { return { id: l.id, text: '', convError: e.message || 'Could not read this line' }; }
    }));
  }
  catch (e) { res = state.lines.map((l) => ({ id: l.id, error: 'Computation failed', inputLatex: '' })); }
  results = new Map(res.map((r) => [r.id, r]));
  state.lines.forEach((l, i) => updateRow(l, results.get(l.id), i));
  renderInspector();
  persist();
}
function persist() {
  const used = {};
  state.lines.forEach((l) => { (l.latex || '').replace(/\\embed\{matrix\}\[([-\w]+)\]/g, (m, id) => { if (matStore[id]) used[id] = matStore[id]; }); });
  if (undoSnapshot) undoSnapshot.forEach((l) => (l.latex || '').replace(/\\embed\{matrix\}\[([-\w]+)\]/g, (m, id) => { if (matStore[id]) used[id] = matStore[id]; }));
  matStore = Object.assign(matStore, used);
  store('dido.sheet.v3', JSON.stringify({ lines: state.lines.map((l) => l.latex), mats: used }));
}

/* ---------- line operations ---------- */
const indexOf = (id) => state.lines.findIndex((l) => l.id === id);
function insertLine(idx, latex = '', focus = true) {
  const line = { id: newId(), latex };
  state.lines.splice(idx, 0, line);
  syncDom(); recompute();
  if (focus) focusLine(line.id, 'end');
  return line;
}
function deleteLine(id, viaButton) {
  const idx = indexOf(id); if (idx < 0) return;
  if (state.lines.length === 1) { state.lines[0].latex = ''; rows.get(id)._mf.latex(''); recompute(); focusLine(id); return; }
  const removed = state.lines[idx];
  takeSnapshot();
  state.lines.splice(idx, 1);
  syncDom(); recompute();
  const next = state.lines[Math.max(0, idx - (viaButton ? 0 : 1))] || state.lines[0];
  if (!viaButton) focusLine(next.id, 'end'); else select(next.id);
  if (viaButton && (removed.latex || '').trim()) toast('Line deleted', true);
}
function moveLine(id, dir, keepFocus) {
  const idx = indexOf(id), to = idx + dir;
  if (idx < 0 || to < 0 || to >= state.lines.length) return;
  const [l] = state.lines.splice(idx, 1); state.lines.splice(to, 0, l);
  const wasEditing = editingId === id;
  syncDom(); recompute();
  if (keepFocus && wasEditing) focusLine(id, 'end');
  select(id);
}
function focusLine(id, where) {
  const row = rows.get(id); if (!row) return;
  row.classList.add('editing');
  row._mf.focus();
  if (where === 'start') row._mf.moveToLeftEnd(); else row._mf.moveToRightEnd();
  row.scrollIntoView({ block: 'nearest' });
}
function select(id) {
  if (state.selected === id) return;
  state.selected = id;
  rows.forEach((el, k) => el.classList.toggle('selected', k === id));
  renderInspector();
}
/* ---------- matrix editor ---------- */
function mountMatrices(row) {
  row.querySelectorAll('.dmx').forEach((el) => {
    if (el._mounted) return;
    el._mounted = true;
    const id = el.dataset.mid;
    if (!matStore[id]) matStore[id] = { rows: emptyCells(2, 2) };
    el.innerHTML = '<span class="dmx-wrap"><span class="dmx-br l"></span><span class="dmx-grid"></span><span class="dmx-br r"></span>' +
      '<span class="dmx-handle" title="Drag to add or remove rows and columns" role="button" aria-label="Resize matrix"></span><span class="dmx-size"></span></span>';
    const wrap = el.firstChild;
    // keep clicks inside the matrix away from the surrounding editor
    ['mousedown', 'pointerdown', 'touchstart', 'click', 'dblclick'].forEach((ev) => wrap.addEventListener(ev, (e) => e.stopPropagation()));
    // MathQuill listens for keys on the whole line editor, so a key typed in a cell would also reach the line around it
    // (Backspace then deleted the whole matrix). Keep every keyboard / text event inside the matrix.
    ['keydown', 'keypress', 'keyup', 'input', 'beforeinput', 'textInput', 'paste', 'cut', 'copy',
      'compositionstart', 'compositionupdate', 'compositionend'].forEach((ev) => wrap.addEventListener(ev, (e) => e.stopPropagation()));
    buildGrid(row, el);
    wireHandle(row, el);
  });
}
function buildGrid(row, el) {
  const id = el.dataset.mid, M = matStore[id], grid = el.querySelector('.dmx-grid');
  const R = M.rows.length, C = M.rows[0].length;
  grid.innerHTML = '';
  grid.style.gridTemplateColumns = `repeat(${C}, auto)`;
  el._fields = [];
  for (let r = 0; r < R; r++) {
    el._fields.push([]);
    for (let c = 0; c < C; c++) {
      const cell = document.createElement('span'); cell.className = 'dmx-cell';
      const span = document.createElement('span'); cell.appendChild(span); grid.appendChild(cell);
      let quiet = true;
      const f = MQ.MathField(span, Object.assign({}, MQ_CONFIG, { handlers: {
        edit: () => { if (quiet) return; M.rows[r][c] = f.latex(); schedule(); },
        enter: () => stepCell(row, el, r, c, 1),
        moveOutOf: (dir) => stepCell(row, el, r, c, dir === MQ.R ? 1 : -1),
        upOutOf: () => { if (r > 0) cellField(el, r - 1, c, 'end'); else exitMatrix(row, el, -1); },
        downOutOf: () => { if (r < R - 1) cellField(el, r + 1, c, 'end'); else exitMatrix(row, el, 1); }
      } }));
      f.latex(M.rows[r][c] || '');
      quiet = false;
      span.addEventListener('focusin', () => { activeMF = f; });
      span.addEventListener('keydown', (e) => { if (e.key === 'Tab') { e.preventDefault(); e.stopPropagation(); stepCell(row, el, r, c, e.shiftKey ? -1 : 1); } }, true);
      el._fields[r].push(f);
    }
  }
}
function cellField(el, r, c, where) { const f = el._fields[r][c]; f.focus(); if (where === 'start') f.moveToLeftEnd(); else f.moveToRightEnd(); }
function focusCell(row, id, r, c) { const el = row.querySelector(`.dmx[data-mid="${id}"]`); if (el && el._fields) cellField(el, r, c, 'end'); }
function stepCell(row, el, r, c, dir) {
  const R = el._fields.length, C = el._fields[0].length;
  let k = r * C + c + dir;
  if (k < 0 || k >= R * C) return exitMatrix(row, el, dir);
  cellField(el, Math.floor(k / C), k % C, dir > 0 ? 'start' : 'end');
}
function exitMatrix(row, el, dir) { const mf = row._mf; mf.focus(); }
function wireHandle(row, el) {
  const handle = el.querySelector('.dmx-handle'), badge = el.querySelector('.dmx-size');
  let start = null;
  const M = () => matStore[el.dataset.mid];
  handle.addEventListener('pointerdown', (e) => {
    e.preventDefault(); e.stopPropagation();
    const grid = el.querySelector('.dmx-grid').getBoundingClientRect();
    const R = M().rows.length, C = M().rows[0].length;
    start = { x: e.clientX, y: e.clientY, R, C, w: Math.max(34, grid.width / C), h: Math.max(28, grid.height / R) };
    try { handle.setPointerCapture(e.pointerId); } catch (err) {}
    handle.classList.add('active'); badge.textContent = `${R} × ${C}`;
  });
  handle.addEventListener('pointermove', (e) => {
    if (!start) return;
    const nR = Math.min(10, Math.max(1, start.R + Math.round((e.clientY - start.y) / start.h)));
    const nC = Math.min(10, Math.max(1, start.C + Math.round((e.clientX - start.x) / start.w)));
    const rows = M().rows;
    if (nR === rows.length && nC === rows[0].length) return;
    M().rows = Array.from({ length: nR }, (_, r) => Array.from({ length: nC }, (_, c) => (rows[r] && rows[r][c] !== undefined ? rows[r][c] : '')));
    buildGrid(row, el);
    badge.textContent = `${nR} × ${nC}`;
    schedule();
  });
  const end = () => { if (!start) return; start = null; handle.classList.remove('active'); persist(); };
  handle.addEventListener('pointerup', end); handle.addEventListener('pointercancel', end);
}
function insertMatrix(mf, row) {
  const id = newMatId(); matStore[id] = { rows: emptyCells(2, 2) };
  mf.write(`\\embed{matrix}[${id}]`);
  mountMatrices(row); focusCell(row, id, 0, 0);
}

/* ---------- on-screen keypad ---------- */
const kp = (() => {
  const pad = $('#keypad'), body = $('#kp-body');
  const mf = () => activeMF;
  const T = (s) => () => mf().typedText(s);
  const C = (c) => () => mf().cmd(c);
  const K = (k) => () => mf().keystroke(k);
  const fnIns = (name) => () => { const builtin = ['det', 'deg', 'dim', 'gcd'].includes(name); mf().write((builtin ? '\\' + name : '\\operatorname{' + name + '}') + '\\left(\\right)'); mf().keystroke('Left'); show('main'); };
  const MATRIX_ICON = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M7 4H4v16h3M17 4h3v16h-3"/><circle cx="9.5" cy="9" r="1" fill="currentColor"/><circle cx="14.5" cy="9" r="1" fill="currentColor"/><circle cx="9.5" cy="15" r="1" fill="currentColor"/><circle cx="14.5" cy="15" r="1" fill="currentColor"/></svg>';
  const main = [
    ['<i>x</i>', T('x')], ['<i>y</i>', T('y')], ['<i>a</i>²', () => { mf().typedText('^2'); mf().keystroke('Right'); }], ['<i>a</i><sup><i>b</i></sup>', T('^')],
    ['7', T('7'), 'num'], ['8', T('8'), 'num'], ['9', T('9'), 'num'], ['÷', T('/'), 'op'], ['⌫', K('Backspace'), 'ctl'],
    ['(', T('(')], [')', T(')')], ['√', C('\\sqrt')], ['ⁿ√', C('\\nthroot')],
    ['4', T('4'), 'num'], ['5', T('5'), 'num'], ['6', T('6'), 'num'], ['×', T('*'), 'op'], ['←', K('Left'), 'ctl'],
    ['<i>i</i>', T('i')], ['π', C('\\pi')], [',', T(',')], ['=', T('=')],
    ['1', T('1'), 'num'], ['2', T('2'), 'num'], ['3', T('3'), 'num'], ['−', T('-'), 'op'], ['→', K('Right'), 'ctl'],
    ['ABC', () => show('abc'), 'ctl'], ['f(x)', () => show('fn'), 'ctl'], [MATRIX_ICON, () => { const row = mf().el && mf().el().closest('.row'); insertMatrix(mf(), row || rows.get(editingId)); }],
    ['[ ]', T('[')], ['0', T('0'), 'num'], ['.', T('.'), 'num'], ['+', T('+'), 'op'], ['↵', T('\n'), 'go']
  ];
  let shift = false;
  const letter = (ch) => () => { mf().typedText(shift ? ch.toUpperCase() : ch); if (shift) { shift = false; build('abc'); } };
  const abcRows = ['qwertyuiop', 'asdfghjkl', 'zxcvbnm'];
  function abcKeys() {
    const ks = [];
    abcRows[0].split('').forEach((c) => ks.push([shift ? c.toUpperCase() : c, letter(c)]));
    ks.push(['', null, 'pad']); abcRows[1].split('').forEach((c) => ks.push([shift ? c.toUpperCase() : c, letter(c)])); ks.push(['', null, 'pad']);
    ks.push(['⇧', () => { shift = !shift; build('abc'); }, 'ctl w3' + (shift ? ' on' : '')]);
    abcRows[2].split('').forEach((c) => ks.push([shift ? c.toUpperCase() : c, letter(c)]));
    ks.push(['⌫', K('Backspace'), 'ctl w3']);
    ks.push(['123', () => show('main'), 'ctl w3'], ['_', T('_'), 'ctl'], ['θ', C('\\theta')], ['λ', C('\\lambda')], ['α', C('\\alpha')],
      ['←', K('Left'), 'ctl'], ['→', K('Right'), 'ctl'], ['↵', T('\n'), 'go w5']);
    return ks;
  }
  const FNS = ['det', 'inv', 'transpose', 'tr', 'rank', 'rref', 'kernel', 'image', 'charpoly', 'dot', 'minor', 'identity',
    'gcd', 'quo', 'rem', 'deg', 'coeff', 'lagrange', 'polyroots', 'factor', 'abs', 'conj', 'cbrt', 'approx'];
  function build(name) {
    let keys, cls = name;
    if (name === 'main') keys = main;
    else if (name === 'abc') keys = abcKeys();
    else keys = FNS.map((f) => [f, fnIns(f), 'fnk']).concat([['123', () => show('main'), 'ctl'], ['ABC', () => show('abc'), 'ctl']]);
    body.innerHTML = '';
    const panel = document.createElement('div'); panel.className = 'kp-panel on ' + cls;
    keys.forEach(([label, act, kc]) => {
      const b = document.createElement('button'); b.type = 'button'; b.tabIndex = -1; b.className = 'k ' + (kc || '');
      b.innerHTML = '<span>' + label + '</span>';
      if (act) b.addEventListener('pointerdown', (e) => {
        e.preventDefault();
        if (!activeMF) return;
        lastKeyAt = Date.now();
        b.classList.add('pressed'); setTimeout(() => b.classList.remove('pressed'), 120);
        try { act(); } catch (err) { /* ignore a key that does not apply here */ }
      });
      panel.appendChild(b);
    });
    body.appendChild(panel);
  }
  function show(name) { build(name); }
  ['mousedown', 'touchstart'].forEach((ev) => pad.addEventListener(ev, (e) => e.preventDefault(), { passive: false }));
  // a key can change the keypad's size; swallow the tap's follow-up click so it never lands on the page behind
  let lastKeyAt = 0;
  document.addEventListener('click', (e) => { if (Date.now() - lastKeyAt < 600 && !pad.contains(e.target)) { e.preventDefault(); e.stopPropagation(); } }, true);
  $('#kp-hide').addEventListener('pointerdown', (e) => { e.preventDefault(); if (activeMF) activeMF.blur(); close(); });
  function open() {
    if (!TOUCH) return;
    pad.classList.add('open'); document.body.classList.add('kp-open');
    requestAnimationFrame(() => {
      const row = editingId && rows.get(editingId); if (!row) return;
      const r = row.getBoundingClientRect(), limit = window.innerHeight - pad.offsetHeight - 12;
      if (r.bottom > limit) window.scrollBy({ top: r.bottom - limit, behavior: 'smooth' });
    });
  }
  function close() { pad.classList.remove('open'); document.body.classList.remove('kp-open'); }
  build('main');
  document.addEventListener('focusin', (e) => { if (e.target.closest && e.target.closest('.mq')) open(); });
  document.addEventListener('focusout', () => setTimeout(() => { const a = document.activeElement; if (!(a && a.closest && a.closest('.mq'))) close(); }, 50));
  return { open, close };
})();

/* ---------- inspector ---------- */
function kindChip(r) {
  if (!r || r.kind === 'empty') return '';
  if (r.error) return '<span class="chip err">Error</span>';
  if (r.kind === 'function') return `<span class="chip def">Function</span>`;
  const pv = r.polyVar ? (r.polyVar === 'lambda' ? 'λ' : r.polyVar.replace(/_(.*)/, '₍$1₎')) : '';
  const what = { matrix: 'Matrix', scalar: 'Expression', list: 'Set', bool: 'Test', tex: 'Result', polynomial: 'Polynomial in ' + pv }[r.kind] || 'Result';
  if (r.defName) return `<span class="chip def">Defines a name · ${what}</span>`;
  return `<span class="chip">${what}</span>`;
}
function renderInspector() {
  const panel = $('#panel-insp');
  const id = state.selected, idx = indexOf(id), r = results.get(id);
  let html = '';
  if (idx < 0 || !r) html += '<p class="insp-empty">Select a line to see it here at full size.</p>';
  else {
    html += `<div class="insp-head"><p class="eyebrow" style="margin:0">Line ${idx + 1}</p>${kindChip(r)}</div>`;
    if (r.kind === 'empty') html += '<p class="insp-empty">This line is empty. Try typing <code>det([[a, b], [c, d]])</code> or pick a function from Reference.</p>';
    else {
      html += `<div class="insp-card"><div class="label"><span>Input</span>${r.inputLatex ? '<button data-copy="in">Copy LaTeX</button>' : ''}</div><div class="big" id="insp-in"></div></div>`;
      if (r.error) html += `<div class="insp-card" style="border-color:var(--err)"><div class="label"><span style="color:var(--err)">Error</span></div><div style="color:var(--err);font-size:14px"></div></div>`;
      else if (r.outLatex) html += `<div class="insp-card"><div class="label"><span>${r.same ? 'Value' : 'Result'}</span><button data-copy="out">Copy LaTeX</button></div><div class="big" id="insp-out"></div>${r.approx ? '<div class="insp-approx" id="insp-approx"></div>' : ''}</div>`;
    }
  }
  const defs = [];
  state.lines.forEach((l, k) => { const rr = results.get(l.id); if (rr && rr.defName) defs.push({ id: l.id, k, rr }); });
  html += `<div class="section"><p class="eyebrow">Names on this sheet</p>`;
  html += defs.length ? '<div class="names" id="names"></div>' : '<p class="insp-empty">Nothing defined yet. Write <code>A = …</code> or <code>f(x) = …</code> on any line.</p>';
  html += '</div>';
  panel.innerHTML = html;
  if (r && r.kind !== 'empty' && idx >= 0) {
    const bi = $('#insp-in', panel); if (bi) tex(bi, r.inputLatex || state.lines[idx].latex || '', true);
    const bo = $('#insp-out', panel); if (bo) tex(bo, r.outLatex, true);
    const ba = $('#insp-approx', panel); if (ba) tex(ba, '\\approx ' + r.approx, false);
    if (r.error) panel.querySelector('.insp-card[style] div:last-child').textContent = r.error;
    panel.querySelectorAll('[data-copy]').forEach((b) => b.addEventListener('click', () => copyText(b.dataset.copy === 'in' ? r.inputLatex : r.outLatex, 'Copied LaTeX')));
  }
  const names = $('#names', panel);
  if (names) defs.forEach(({ id: did, k, rr }) => {
    const b = document.createElement('button'); b.className = 'name-chip'; b.title = 'Go to line ' + (k + 1);
    const t = document.createElement('span'); b.appendChild(t);
    const nameTex = rr.inputLatex ? rr.inputLatex.split('=')[0] : rr.defName;
    tex(t, nameTex, false);
    const s = document.createElement('span'); s.textContent = 'line ' + (k + 1) + (rr.error ? ' · error' : ''); b.appendChild(s);
    b.addEventListener('click', () => focusLine(did, 'end'));
    names.appendChild(b);
  });
}
const escTex = (s) => s.replace(/[\\{}$&#^_%~]/g, (c) => '\\' + c);

/* ---------- reference ---------- */
function renderReference() {
  const panel = $('#panel-ref');
  panel.innerHTML = '<p class="ref-note">Click an entry to insert it into the line you are editing.</p>';
  REF.forEach((g) => {
    const sec = document.createElement('div'); sec.className = 'ref-group';
    sec.innerHTML = `<h3>${g.h}</h3>` + (g.note ? `<p class="ref-note">${g.note}</p>` : '');
    g.items.forEach(([code, desc, tpl]) => {
      const b = document.createElement('button'); b.className = 'ref-item';
      b.innerHTML = '<code></code><span></span>';
      b.firstChild.textContent = code; b.lastChild.textContent = desc;
      b.addEventListener('mousedown', (e) => e.preventDefault());
      b.addEventListener('click', () => insertTemplate(tpl));
      sec.appendChild(b);
    });
    panel.appendChild(sec);
  });
  const keys = document.createElement('div'); keys.className = 'ref-group';
  keys.innerHTML = `<h3>Keyboard</h3><div class="keys">
    <kbd>Enter</kbd><span>New line below</span>
    <kbd>↑</kbd><span>Previous line</span>
    <kbd>↓</kbd><span>Next line</span>
    <kbd>Alt + ↑ / ↓</kbd><span>Move the line up or down</span>
    <kbd>Backspace</kbd><span>On an empty line, delete it</span>
    <kbd>Esc</kbd><span>Finish editing</span></div>`;
  panel.appendChild(keys);
}
let lastInputId = null;
const MQ_BUILTIN = new Set(['det', 'deg', 'dim', 'gcd', 'ker']);
function insertTemplate(spec) {
  let id = editingId || lastInputId;
  if (!id || indexOf(id) < 0) id = insertLine(state.lines.length, '', false).id;
  const mf = rows.get(id)._mf;
  mf.focus();
  const k = spec.indexOf(':'), kind = spec.slice(0, k), v = spec.slice(k + 1);
  if (kind === 'mx') { insertMatrix(mf, rows.get(id)); return; }
  if (kind === 'fn') { mf.write((v.length === 1 ? v : MQ_BUILTIN.has(v) ? '\\' + v : '\\operatorname{' + v + '}') + '\\left(\\right)'); mf.keystroke('Left'); }
  else if (kind === 'w') mf.write(v);
  else mf.typedText(v);
}

/* ---------- toast & clipboard ---------- */
let toastTimer;
function toast(msg, undo) {
  const el = $('#toast'); $('#toast-msg').textContent = msg;
  $('#toast-undo').hidden = !undo;
  el.classList.add('show'); clearTimeout(toastTimer);
  toastTimer = setTimeout(() => el.classList.remove('show'), undo ? 6000 : 2200);
}
function copyText(t, msg) {
  if (!t) return;
  try { navigator.clipboard.writeText(t).then(() => toast(msg), () => toast('Copy was blocked by the browser')); }
  catch (e) { toast('Copy was blocked by the browser'); }
}
function takeSnapshot() { undoSnapshot = state.lines.map((l) => ({ ...l })); }
$('#toast-undo').addEventListener('click', () => {
  if (!undoSnapshot) return;
  state.lines = undoSnapshot; undoSnapshot = null;
  rows.forEach((el) => el.remove()); rows.clear();
  syncDom(); recompute(); select(state.lines[0].id);
  $('#toast').classList.remove('show');
});

/* ---------- examples menu ---------- */
function loadLines(latexList) {
  state.lines = latexList.map((t) => ({ id: newId(), latex: t }));
  rows.forEach((el) => el.remove()); rows.clear();
  syncDom(); recompute(); state.selected = null; select(state.lines[0].id);
  $('.sheet').scrollTop = 0;
}
(function buildMenu() {
  const menu = $('#examples-menu'), btn = $('#examples-btn');
  Object.entries(EXAMPLES).forEach(([k, ex]) => {
    const b = document.createElement('button'); b.setAttribute('role', 'menuitem');
    b.innerHTML = '<div class="m-title"></div><div class="m-sub"></div>';
    b.firstChild.textContent = ex.title; b.lastChild.textContent = ex.sub;
    b.addEventListener('click', () => { takeSnapshot(); loadLines(ex.lines.map(toMQ)); close(); toast(`Loaded “${ex.title}”`, true); });
    menu.appendChild(b);
  });
  menu.appendChild(document.createElement('hr'));
  const blank = document.createElement('button'); blank.setAttribute('role', 'menuitem');
  blank.innerHTML = '<div class="m-title">Blank sheet</div><div class="m-sub">Start from an empty line</div>';
  blank.addEventListener('click', () => { takeSnapshot(); loadLines(['']); close(); toast('Sheet cleared', true); focusLine(state.lines[0].id); });
  menu.appendChild(blank);
  const close = () => { menu.classList.remove('open'); btn.setAttribute('aria-expanded', 'false'); };
  btn.addEventListener('click', (e) => { e.stopPropagation(); const o = !menu.classList.contains('open'); menu.classList.toggle('open', o); btn.setAttribute('aria-expanded', String(o)); });
  document.addEventListener('click', (e) => { if (!e.target.closest('.menu-wrap')) close(); });
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape') close(); });
})();

/* ---------- theme ---------- */
function currentTheme() {
  const t = document.documentElement.getAttribute('data-theme');
  if (t === 'dark' || t === 'light') return t;
  return window.matchMedia && matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}
function applyTheme(t) {
  document.documentElement.setAttribute('data-theme', t);
  $('#theme-icon').innerHTML = t === 'dark' ? ICON.sun : ICON.moon;
  $('#theme-btn').setAttribute('aria-label', t === 'dark' ? 'Switch to light mode' : 'Switch to dark mode');
}
applyTheme(load('dido.theme') || currentTheme());
$('#theme-btn').addEventListener('click', () => { const t = currentTheme() === 'dark' ? 'light' : 'dark'; applyTheme(t); store('dido.theme', t); });

/* ---------- tabs ---------- */
['insp', 'ref'].forEach((k) => $('#tab-' + k).addEventListener('click', () => {
  ['insp', 'ref'].forEach((j) => { $('#tab-' + j).setAttribute('aria-selected', String(j === k)); $('#panel-' + j).hidden = j !== k; });
}));

/* ---------- boot ---------- */
const list = $('#list');
const addRow = document.createElement('button');
addRow.className = 'add-row'; addRow.id = 'add-row';
addRow.innerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"><path d="M12 5v14M5 12h14"/></svg>Add a line';
addRow.addEventListener('click', () => insertLine(state.lines.length, '', true));
list.appendChild(addRow);
$('#add-btn').addEventListener('click', () => { const idx = state.selected ? indexOf(state.selected) + 1 : state.lines.length; insertLine(idx || state.lines.length, '', true); });

renderReference();
let v3 = null, v2 = null, v1 = null;
try { v3 = JSON.parse(load('dido.sheet.v3') || 'null'); v2 = JSON.parse(load('dido.sheet.v2') || 'null'); v1 = JSON.parse(load('dido.sheet.v1') || 'null'); } catch (e) {}
if (v3 && Array.isArray(v3.lines) && v3.lines.length) { matStore = Object.assign({}, v3.mats || {}); loadLines(v3.lines); }
else if (Array.isArray(v2) && v2.length) loadLines(v2);
else if (Array.isArray(v1) && v1.length) loadLines(v1.map(toMQ));
else loadLines(['']);   // new visitors start with a blank sheet (the tour is under Examples)
if (!hasKatex()) window.addEventListener('load', () => { if (hasKatex()) { rows.forEach((r) => r.querySelectorAll('*').forEach((el) => { el._tex = null; })); recompute(); } });
})();
