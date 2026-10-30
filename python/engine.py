import math as math

superscripts = str.maketrans("0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ", "⁰¹²³⁴⁵⁶⁷⁸⁹ᵃᵇᶜᵈᵉᶠᵍʰⁱʲᵏˡᵐⁿᵒᵖᵠʳˢᵗᵘᵛʷˣʸᶻᴬᴮᶜᴰᴱᶠᴳᴴᴵᴶᴷᴸᴹᴺᴼᴾᵠᴿˢᵀᵁⱽᵂˣʸᶻ")
superscripts2 = str.maketrans({
    "0": "",
    "1": "'",
    "2": "''",
    "3": "'''",
    "4": "⁴",
    "5": "⁵",
    "6": "⁶",
    "7": "⁷",
    "8": "⁸",
    "9": "⁹"
})

GREEK_MAP = {
    "alpha": "α", "beta": "β", "gamma": "γ", "delta": "δ", "epsilon": "ε",
    "zeta": "ζ", "eta": "η", "theta": "θ", "iota": "ι", "kappa": "κ",
    "lambda": "λ", "mu": "μ", "nu": "ν", "xi": "ξ", "omicron": "ο",
    "pi": "π", "rho": "ρ", "sigma": "σ", "tau": "τ", "upsilon": "υ",
    "phi": "φ", "chi": "χ", "psi": "ψ", "omega": "ω",
    "Alpha": "Α", "Beta": "Β", "Gamma": "Γ", "Delta": "Δ", "Epsilon": "Ε",
    "Zeta": "Ζ", "Eta": "Η", "Theta": "Θ", "Iota": "Ι", "Kappa": "Κ",
    "Lambda": "Λ", "Mu": "Μ", "Nu": "Ν", "Xi": "Ξ", "Omicron": "Ο",
    "Pi": "Π", "Rho": "Ρ", "Sigma": "Σ", "Tau": "Τ", "Upsilon": "Υ",
    "Phi": "Φ", "Chi": "Χ", "Psi": "Ψ", "Omega": "Ω"
}

greekalphabetcap = {
    "α": "Α", "β": "Β", "γ": "Γ", "δ": "Δ", "ε": "Ε", "ζ": "Ζ", "η": "Η",
    "θ": "Θ", "ι": "Ι", "κ": "Κ", "λ": "Λ", "μ": "Μ", "ν": "Ν", "ξ": "Ξ",
    "ο": "Ο", "π": "Π", "ρ": "Ρ", "σ": "Σ", "τ": "Τ", "υ": "Υ", "φ": "Φ",
    "χ": "Χ", "ψ": "Ψ", "ω": "Ω"
}

def swap(List, i, j):
    List[i], List[j] = List[j], List[i]

class Greek():
    def __init__(self, char=""):
        self.char = str(char)

    def __str__(self):
        return GREEK_MAP.get(self.char, self.char)

    def __repr__(self):
        return self.__str__()

    def __len__(self):
        return len(str(self))

    def __add__(self, other):
        return f"{str(self)}+{str(other)}"

    def __radd__(self, other):
        return f"{str(other)}+{str(self)}"

    def __mul__(self, other):
        if isinstance(other, Integer):
            return str(self) * other
        return NotImplemented

    def __rmul__(self, other):
        return self.__mul__(other)

    def __eq__(self, other):
        return str(self) == str(other)

    def __ne__(self, other):
        return not (self == other)

    def __hash__(self):
        return hash(str(self))

    def upper(self):
        if self.char in GREEK_MAP.keys():
            return Greek(str(self.char.capitalize()))
        else:
            return Greek(self.char.upper())

    def swapcase(self):
        if self.char.islower():
            return self.upper()
        return Greek(self.char.lower())

    def __eq__(self, other):
        return str(self) == str(other)

    def __lt__(self, other):
        return str(self) < str(other)

    def __le__(self, other):
        return str(self) <= str(other)

    def __gt__(self, other):
        return str(self) > str(other)

    def __ge__(self, other):
        return str(self) >= str(other)
    
order = [
    'a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j', 'k', 'l', 'm', 'n', 'o', 'p', 'q', 'r', 's', 't', 'u', 'v', 'w', 'x', 'y', 'z',
    'A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z',
    'α', 'β', 'γ', 'δ', 'ε', 'ζ', 'η', 'θ', 'ι', 'κ', 'λ', 'μ', 'ν', 'ξ', 'ο', 'π', 'ρ', 'σ', 'τ', 'υ', 'φ', 'χ', 'ψ', 'ω',
    'Α', 'Β', 'Γ', 'Δ', 'Ε', 'Ζ', 'Η', 'Θ', 'Ι', 'Κ', 'Λ', 'Μ', 'Ν', 'Ξ', 'Ο', 'Π', 'Ρ', 'Σ', 'Τ', 'Υ', 'Φ', 'Χ', 'Ψ', 'Ω'
]
order_index = {name: i for i, name in enumerate(order)}

def _compact_lc(lc):
    if not lc:
        return [0]
    top = -1
    for i in range(len(lc) - 1, -1, -1):
        if not zero(lc[i]):
            top = i
            break
    if top < 0:
        return [0]
    return list(lc[: top + 1])


def cleanup(L):
    while L and not bool(L[-1]):
        L.pop()
    return L


def sign(val):
    if (hasattr(val, 'numerator') and hasattr(val, 'denominator')
            and isinstance(getattr(val, 'numerator', None), int)
            and isinstance(getattr(val, 'denominator', None), int)):
        return "+" if val.numerator >= 0 else ""
    v = val.value if hasattr(val, 'value') else val
    return "+" if v >= 0 else ""


def delete(val):
    if (hasattr(val, 'numerator') and hasattr(val, 'denominator')
            and isinstance(getattr(val, 'numerator', None), int)
            and isinstance(getattr(val, 'denominator', None), int)):
        if val.numerator == val.denominator:
            return ""
        if val.numerator == -val.denominator:
            return "-"
        return str(val)
    v = val.value if hasattr(val, 'value') else val
    if v == 1:
        return ""
    if v == -1:
        return "-"
    if isinstance(v, float) and v.is_integer():
        return str(int(v)) if not hasattr(val, 'value') else str(val)
    return str(val)

def zero(obj):
    try:
        res = obj.__bool__() if hasattr(obj, '__bool__') else bool(obj)
    except Exception:
        pass
    return not bool(obj)

def _as_polyvar(coef):
    if isinstance(coef, Polynomialvar):
        return coef
    if isinstance(coef, Monomialvar):
        return Polynomialvar([coef])
    if isinstance(coef, Rationalfractionvar):
        if coef.denominator.constant() and coef.denominator.identity():
            return _as_polyvar(coef.numerator.t[0].c if coef.numerator.t else coef)
        return Polynomialvar([Monomialvar(coef, {})])
    if isinstance(coef, (Scalar, float)):
        return Polynomialvar([Monomialvar(coef, {})])
    return Polynomialvar([Monomialvar(coef, {})])


def _scalar_from_polyvar(q):
    if isinstance(q, Polynomialvar):
        if q.null():
            return Monomialvar(0, {})
        if len(q.t) == 1:
            return q.t[0]
    return q


def _normalize_poly_coef(c):
    if isinstance(c, Polynomialvar):
        return _scalar_from_polyvar(c)
    return c


def _coef_sub(c1, c2):
    if isinstance(c1, (Scalar, float)) and isinstance(c2, (Scalar, float)) and not any(isinstance(x, (Polynomialvar, Monomialvar, Rationalfractionvar)) for x in (c1, c2)):
        return c1 - c2
    _rfv_like = lambda x: (hasattr(x, 'numerator') and hasattr(x, 'denominator')
                           and not hasattr(x, 'lc') and hasattr(x, 'null'))
    if _rfv_like(c1) or _rfv_like(c2):
        def _as_rfv(x):
            """Lift any scalar/Monomialvar/Polynomialvar to Rationalfractionvar."""
            if _rfv_like(x):
                return x
            pv = _as_polyvar(x)
            one = Polynomialvar([Monomialvar(1, {})])
            from types import SimpleNamespace
            rfv = object.__new__(Rationalfractionvar)
            rfv.numerator = pv
            rfv.denominator = one
            return rfv
        rfv1 = _as_rfv(c1)
        rfv2 = _as_rfv(c2)
        num = rfv1.numerator * rfv2.denominator - rfv2.numerator * rfv1.denominator
        den = rfv1.denominator * rfv2.denominator
        return Rationalfractionvar(num, den)
    t1 = list(_as_polyvar(c1).t)
    t2 = [Monomialvar(-term.c, term.t) for term in _as_polyvar(c2).t]
    return _normalize_poly_coef(Polynomialvar(t1 + t2))


def _coef_add(c1, c2):
    """Add two polynomial coefficients, handling RFV mixed with numeric types."""
    if zero(c1):
        return c2
    if zero(c2):
        return c1
    _rfv_like = lambda x: (hasattr(x, 'numerator') and hasattr(x, 'denominator')
                           and not hasattr(x, 'lc') and hasattr(x, 'null'))
    if _rfv_like(c1) or _rfv_like(c2):
        def _as_rfv(x):
            if _rfv_like(x):
                return x
            pv = _as_polyvar(x)
            one = Polynomialvar([Monomialvar(1, {})])
            rfv = object.__new__(Rationalfractionvar)
            rfv.numerator = pv
            rfv.denominator = one
            return rfv
        rfv1 = _as_rfv(c1)
        rfv2 = _as_rfv(c2)
        num = Polynomialvar((rfv1.numerator * rfv2.denominator).t + (rfv2.numerator * rfv1.denominator).t)
        den = rfv1.denominator * rfv2.denominator
        return Rationalfractionvar(num, den)
    return c1 + c2


def _leading_coeff_divides(r_lc, o_lc):
    """True when the leading term of R is exactly divisible by that of the divisor."""
    if zero(r_lc):
        return False
    if isinstance(r_lc, float):
        r_lc = Rational(r_lc)
    if isinstance(o_lc, float):
        o_lc = Rational(o_lc)
    if isinstance(r_lc, (Integer, Rational)) and isinstance(o_lc, (Integer, Rational)):
        return not zero(o_lc)
    if isinstance(r_lc, Monomialvar) and isinstance(o_lc, (Scalar, float)) and not isinstance(o_lc, (Polynomialvar, Monomialvar, Rationalfractionvar)):
        return not zero(o_lc)
    _rfv_like = lambda x: (hasattr(x, 'numerator') and hasattr(x, 'denominator')
                           and not hasattr(x, 'lc') and hasattr(x, 'null'))
    if _rfv_like(o_lc) and not zero(o_lc):
        return True
    if _rfv_like(r_lc) and not zero(r_lc) and not zero(o_lc):
        return True
    r_pv = _as_polyvar(r_lc)
    o_pv = _as_polyvar(o_lc)
    if o_pv.null():
        return False
    q = r_pv.exact_div(o_pv)
    return q is not None and not q.null()


def _divide_leading_coeff(r_lc, o_lc):
    if isinstance(r_lc, float):
        r_lc = Rational(r_lc)
    if isinstance(o_lc, float):
        o_lc = Rational(o_lc)
    if isinstance(r_lc, (Integer, Rational)) and isinstance(o_lc, (Integer, Rational)):
        return r_lc / o_lc
    if isinstance(r_lc, Monomialvar) and isinstance(o_lc, (Scalar, float)) and not isinstance(o_lc, (Polynomialvar, Monomialvar, Rationalfractionvar)):
        return Monomialvar(r_lc.c / o_lc, r_lc.t.copy())
    _rfv_like = lambda x: (hasattr(x, 'numerator') and hasattr(x, 'denominator')
                           and not hasattr(x, 'lc') and hasattr(x, 'null'))
    if _rfv_like(r_lc) and _rfv_like(o_lc):
        num = r_lc.numerator * o_lc.denominator
        den = r_lc.denominator * o_lc.numerator
        result = Rationalfractionvar(num, den)
        if isinstance(result, Polynomialvar):
            return _scalar_from_polyvar(result)
        return result
    if _rfv_like(o_lc):
        r_pv = _as_polyvar(r_lc)
        num = r_pv * o_lc.denominator
        den = o_lc.numerator
        result = Rationalfractionvar(num, den)
        if isinstance(result, Polynomialvar):
            return _scalar_from_polyvar(result)
        return result
    if _rfv_like(r_lc):
        o_pv = _as_polyvar(o_lc)
        den = r_lc.denominator * o_pv
        result = Rationalfractionvar(r_lc.numerator, den)
        if isinstance(result, Polynomialvar):
            return _scalar_from_polyvar(result)
        return result
    r_pv = _as_polyvar(r_lc)
    o_pv = _as_polyvar(o_lc)
    q = r_pv.exact_div(o_pv)
    if q is not None:
        if not q.null():
            return _scalar_from_polyvar(q)
    return Rationalfractionvar(r_pv, o_pv)


def factorial(n):
    if n == 0:
        return 1
    return n * factorial(n - 1)


class Infinity():
    def __add__(self, other): return self
    def __radd__(self, other): return self
    def __sub__(self, other): return self
    def __rsub__(self, other): return self
    def __mul__(self, other): return self
    def __truediv__(self, other): return self
    def __rtruediv__(self, other): return 0
    def __str__(self): return "∞"
    def __lt__(self, other): return False
    def __gt__(self, other): return not isinstance(other, Infinity)
    def __le__(self, other): return isinstance(other, Infinity)
    def __ge__(self, other): return True
    def __eq__(self, other): return isinstance(other, (Infinity, float)) and (other == float('inf') or isinstance(other, Infinity))
    def __ne__(self, other): return not self.__eq__(other)
    def __int__(self): return -1
    def __neg__(self): return self


infinity = Infinity
inf = Infinity()


def real(obj):
    if isinstance(obj, C):
        return obj.real
    else:
        return obj

def imaginary(obj):
    if isinstance(obj, C):
        return obj.imag
    else:
        return Integer(0)

def gcd(a, b):
    a = abs(int(a))
    b = abs(int(b))
    while b:
        a, b = b, a % b
    return a

class Scalar():
    pass

class Rad():
    pass

class Function():
    pass

class Vectorspace():
    def __hash__(self):
        size = self.dim() if hasattr(self, "dim") else len(self)
        flat_elements = []
        for item in self:
            if hasattr(item, "c"):
                flat_elements.extend(item.c)
            else:
                flat_elements.append(item)     
        return hash((size, tuple(flat_elements)))

class Integer(Scalar):
    def __init__(self, number):
        if isinstance(number, Integer):
            self.int = number.int
        else:
            self.int = int(number)

    def __add__(self, other):
        if isinstance(other, Integer):
            return Integer(self.int + other.int)
        if isinstance(other, Scalar):
            return NotImplemented
        if isinstance(other, int):
            return Integer(self.int + other)
        if isinstance(other, float):
            return float(self.int) + other
        return NotImplemented

    def __radd__(self, other):
        if isinstance(other, int):
            return Integer(other + self.int)
        if isinstance(other, float):
            return other + float(self.int)
        return NotImplemented

    def __sub__(self, other):
        if isinstance(other, Integer):
            return Integer(self.int - other.int)
        if isinstance(other, Scalar):
            return NotImplemented
        if isinstance(other, int):
            return Integer(self.int - other)
        if isinstance(other, float):
            return float(self.int) - other
        return NotImplemented

    def __rsub__(self, other):
        if isinstance(other, int):
            return Integer(other - self.int)
        if isinstance(other, float):
            return other - float(self.int)
        return NotImplemented

    def __mul__(self, other):
        if isinstance(other, Integer):
            return Integer(self.int * other.int)
        if isinstance(other, Scalar):
            return NotImplemented
        if isinstance(other, int):
            return Integer(self.int * other)
        if isinstance(other, float):
            return float(self.int) * other
        return NotImplemented

    def __rmul__(self, other):
        if isinstance(other, int):
            return Integer(other * self.int)
        if isinstance(other, float):
            return other * float(self.int)
        return NotImplemented

    def __truediv__(self, other):
        if isinstance(other, Rad):  # FIX (Dido): 1/sqrt(2) and 1/(1+sqrt(2)) crashed in Rational(int(...))
            return _rad_ensure_algebraic(self) / _rad_ensure_algebraic(other)
        if isinstance(other, (Monomialvar, Polynomialvar)):
            P = Monomialvar(self, {})
            P1 = Polynomialvar([P])
            return Rationalfractionvar(P1, other)
        if isinstance(other, Rationalfractionvar):
            P = Monomialvar(self, {})
            P1 = Polynomialvar([P])
            return Rationalfractionvar(P1 * other.denominator, other.numerator)
        if isinstance(other, Rational):
            return Rational(self.int * other.denominator, other.numerator)
        return Rational(self, other)

    def __rtruediv__(self, other):
        if isinstance(other, Rational):
            return Rational(other.numerator, other.denominator * self.int)
        return Rational(other, self)

    def __floordiv__(self, other):
        if isinstance(other, Integer):
            return Integer(self.int // other.int)
        return Integer(self.int // other)

    def __rfloordiv__(self, other):
        return Integer(other // self.int)

    def __mod__(self, other):
        if isinstance(other, Integer):
            return Integer(self.int % other.int)
        return Integer(self.int % other)

    def __rmod__(self, other):
        return Integer(other % self.int)

    def __neg__(self):
        return Integer(-self.int)

    def __pos__(self):
        return self

    def __abs__(self):
        return Integer(abs(self.int))

    def __invert__(self):
        return Integer(~self.int)

    def __pow__(self, exponent):
        if isinstance(exponent, Integer):
            return Integer(self.int ** exponent.int)
        return Integer(self.int ** exponent)

    def __rpow__(self, base):
        return Integer(base ** self.int)

    def __eq__(self, other):
        if isinstance(other, Integer):
            return self.int == other.int
        return self.int == other

    def __ne__(self, other):
        return not self.__eq__(other)

    def __lt__(self, other):
        if isinstance(other, Integer):
            return self.int < other.int
        return self.int < other

    def __le__(self, other):
        if isinstance(other, Integer):
            return self.int <= other.int
        return self.int <= other

    def __gt__(self, other):
        if isinstance(other, Integer):
            return self.int > other.int
        return self.int > other

    def __ge__(self, other):
        if isinstance(other, Integer):
            return self.int >= other.int
        return self.int >= other

    def __hash__(self):
        return hash(self.int)

    def __int__(self):
        return self.int

    def __float__(self):
        return float(self.int)

    def __str__(self):
        return str(self.int)

    def __repr__(self):
        return str(self.int)

    def is_integer(self):
        return True

    def __bool__(self):
        return bool(self.int)

    def inv(self):
        return Rational(1, self)

    def __round__(self, ndigits=None):
        return self

class C(Scalar):
    def __init__(self, real_part, imaginary_part=0):
        if isinstance(real_part, complex):
            imaginary_part = real_part.imag
            real_part = real_part.real
        _inf = float('inf')
        if real_part == _inf or imaginary_part == _inf:
            real_part, imaginary_part = _inf, 0
        if real_part != real_part or imaginary_part != imaginary_part:
            real_part, imaginary_part = 0, 0
        if hasattr(real_part, 'is_integer') and real_part.is_integer():
            real_part = Integer(real_part)
        if hasattr(imaginary_part, 'is_integer') and imaginary_part.is_integer():
            imaginary_part = Integer(imaginary_part)
        self.real = real_part
        self.imag = imaginary_part

    def __bool__(self):
        return bool(self.real) or bool(self.imag)

    def __invert__(self): return C(self.real, -self.imag)

    def __neg__(self):
        return C(-self.real, -self.imag)

    @staticmethod
    def _re(x):
        if isinstance(x, C): return x.real
        if isinstance(x, complex): return x.real
        if isinstance(x, (Integer, Rational, int, float)): return x
        return x

    @staticmethod
    def _im(x):
        if isinstance(x, C): return x.imag
        if isinstance(x, complex): return x.imag
        return Integer(0)

    def __add__(self, other):
        if not isinstance(other, (C, Integer, Rational, int, float, complex)):
            return NotImplemented
        return C(self.real + C._re(other), self.imag + C._im(other))

    def __radd__(self, other):
        if not isinstance(other, (C, Integer, Rational, int, float, complex)):
            return NotImplemented
        return C(C._re(other) + self.real, C._im(other) + self.imag)

    def __sub__(self, other):
        if not isinstance(other, (C, Integer, Rational, int, float, complex)):
            return NotImplemented
        return C(self.real - C._re(other), self.imag - C._im(other))

    def __rsub__(self, other):
        if not isinstance(other, (C, Integer, Rational, int, float, complex)):
            return NotImplemented
        return C(C._re(other) - self.real, C._im(other) - self.imag)

    def __mul__(self, other):
        if not isinstance(other, (C, Integer, Rational, int, float, complex)):
            return NotImplemented
        or_, oj = C._re(other), C._im(other)
        return C(self.real * or_ - self.imag * oj, self.real * oj + self.imag * or_)

    def __rmul__(self, other):
        if not isinstance(other, (C, Integer, Rational, int, float, complex)):
            return NotImplemented
        or_, oj = C._re(other), C._im(other)
        return C(or_ * self.real - oj * self.imag, or_ * self.imag + oj * self.real)

    def __truediv__(self, other):
        if not isinstance(other, (C, Integer, Rational, int, float, complex)):
            return NotImplemented
        or_, oj = C._re(other), C._im(other)
        den = or_ * or_ + oj * oj
        if zero(den):
            return C(float('inf'), 0)
        return C(
            (self.real * or_ + self.imag * oj) / den,
            (self.imag * or_ - self.real * oj) / den
        )

    def __rtruediv__(self, other):
        if not isinstance(other, (C, Integer, Rational, int, float, complex)):
            return NotImplemented
        den = self.real * self.real + self.imag * self.imag
        if zero(den):
            return C(float('inf'), 0)
        orl = C._re(other)
        oim = C._im(other)
        return C((orl * self.real + oim * self.imag) / den, (oim * self.real - orl * self.imag) / den)

    def __C__(self): return C(float(self.real), float(self.imag))

    def __ne__(self, other): return not self.__eq__(other)

    def bar(self):
        return C(self.real, -self.imag)

    def __eq__(self, other):
        if not isinstance(other, (C, Integer, Rational, int, float, complex)):
            return False
        return C._re(self) == C._re(other) and C._im(self) == C._im(other)

    def __abs__(self):
        return math.sqrt(float(C._re(self)) ** 2 + float(C._im(self)) ** 2)

    def __str__(self):
        if not bool(self.imag): return str(self.real)
        jv = self.imag
        if isinstance(jv, (int, Integer)):
            jn = int(jv); jneg = jn < 0; jabs = abs(jn)
            jcoef = "" if jabs == 1 else str(jabs)
        elif isinstance(jv, Rational):
            jneg = jv.numerator < 0
            jabs = Rational(abs(jv.numerator), jv.denominator)
            jcoef = "" if jabs.numerator == jabs.denominator else str(jabs)
        elif isinstance(jv, float):
            jneg = jv < 0; jabs = abs(jv)
            jcoef = "" if jabs == 1.0 else str(jabs)
        else:
            jneg = False; jcoef = str(jv)
        jsign = "-" if jneg else "+"
        if not bool(self.real):
            return f"{'-' if jneg else ''}{jcoef}j"
        return f"({self.real}{jsign}{jcoef}j)"

    def __repr__(self):
        return self.__str__()

    def integer(self):
        return C(int(C._re(self)), int(C._im(self)))

    def __int__(self):
        return int(C._re(self))

    def __hash__(self):
        return hash((self.real, self.imag))

    def __pow__(self, value):
        if hasattr(value, 'value'):
            p_val = int(C._re(value))
        else:
            p_val = int(C._re(value))
        if p_val == 0:
            return C(1, 0)
        if p_val < 0:
            return (C(1, 0) / self) ** abs(p_val)
        z = C(1, 0)
        for _ in range(p_val):
            z *= self
        return z

def Rationalize(x):
    k=1
    while not x==int(x):
        x*=10
        k*=10
    return Rational(int(x),k)

#radical

def factors(n):
    D=dict()
    n=Integer(n)
    x=n
    for i in range(2,int(n+1)):
        m=0
        while x%i==0:
            x/=i
            m+=1
        if m>0:
            D[Integer(i)]=Integer(m)
    if int(n)==n:
        return D
    else:
        return {Integer(n):Integer(1)}

def simplifyradical(n, m=2):
    if n == 0: 
        return (0, 1)
    
    if isinstance(n, (int, float)) and not isinstance(n, C):
        if n > 0:
            s, abs_n = 1, n
        else:
            if m % 2 == 1:
                s, abs_n = -1, -n
            else:
                s = C(Integer(0), Integer(1))  # FIX (Dido): was `j`, which only existed via the demo code at the bottom of the file
                abs_n = -n
    else:
        s, abs_n = 1, n
    
    val_abs = real(abs_n)
    if isinstance(abs_n, C) or hasattr(abs_n, 'j') or (val_abs != int(val_abs)):
        F = Cfactors(abs_n)
    else:
        F = factors(int(val_abs))
    
    k, r = 1, 1
    for i in F.keys():
        exponent = F[i]
        p_val = exponent % m
        q_val = exponent - p_val
        if isinstance(i, tuple):
            i_val = C(i[0], i[1])
        elif isinstance(i, C):
            i_val = i
        else:
            i_val = i
        k *= i_val ** (q_val // m)
        r *= i_val ** p_val
    
    return (s * k, r)

def isprime(n):
    v=True
    for i in range(2,int(math.sqrt(n))+1):
        if n%i==0:
            v=False
    return v

def primes(n):
    L=list()
    for i in range(2,int(n+1)):
        L.append(i) if isprime(i) else None
    return L

def fullsquare(n): return simplifyradical(n)[1]==1

def sumfullsquares(p):
    L = []
    for i in range(int(math.sqrt(p)) + 1):
        j_sq = p - i**2
        j = int(math.sqrt(j_sq))
        if j**2 == j_sq:
            if i <= j:
                L.append((i, j))
    return L
    
def Cfactors(z):
    D, w = dict(), z
    norm = Integer(int(round(real(z)**2 + imaginary(z)**2)))
    while True:
        q = w / C(Integer(1), Integer(1))
        q_i = C(Integer(int(round(real(q)))), Integer(int(round(imaginary(q)))))
        if (real(q - q_i)**2 + imaginary(q - q_i)**2) == Integer(0):
            if real(w)**2 + imaginary(w)**2 <= Integer(1): break
            w = q_i
            D[C(Integer(1), Integer(1))] = D.get(C(Integer(1), Integer(1)), Integer(0)) + Integer(1)
        else: break
    for i in primes(norm):
        if i == Integer(2): continue
        elif i % Integer(4) == Integer(3):
            while True:
                q = w / i
                q_i = C(Integer(int(round(real(q)))), Integer(int(round(imaginary(q)))))
                if (real(q - q_i)**2 + imaginary(q - q_i)**2) == Integer(0):
                    if real(w)**2 + imaginary(w)**2 <= Integer(1): break
                    w = q_i
                    D[i] = D.get(i, Integer(0)) + Integer(1)
                else: break
        else:
            sq = sumfullsquares(i)
            if not sq: continue
            z1, z1b = C(*sq[0]), C(*sq[0]).bar()
            for f in [z1, z1b]:
                while True:
                    q = w / f
                    q_i = C(Integer(int(round(real(q)))), Integer(int(round(imaginary(q)))))
                    if (real(q - q_i)**2 + imaginary(q - q_i)**2) == Integer(0):
                        if real(w)**2 + imaginary(w)**2 <= Integer(1): break
                        w = q_i
                        D[f] = D.get(f, Integer(0)) + Integer(1)
                    else: break
    if not (real(w)**2 + imaginary(w)**2 < Integer(1) and real(w) > Integer(1)):
        D[w] = D.get(w, Integer(0)) + Integer(1)
    return D

# ─────────────────────────────────────────────────────────────────────────────
# Radical class — exact algebraic radical arithmetic
# Depends on: Integer, Rational, C, j, Scalar, zero, gcd, factors,
#             simplifyradical, fullsquare, superscripts  (all from the main file)
# ─────────────────────────────────────────────────────────────────────────────

import math as _math
from functools import reduce as _reduce

# ── internal helpers ──────────────────────────────────────────────────────────

def _rad_int_val(x):
    """Return the plain Python int value of an Integer, int, or Rational(n,1)."""
    if isinstance(x, int):
        return x
    if isinstance(x, Integer):
        return x.int
    if isinstance(x, Rational):
        if x.denominator == 1:
            return x.numerator
    raise TypeError(f"Expected integer-valued scalar, got {type(x).__name__}")


def _rad_is_rational(x):
    """True if x is a pure rational number (Integer or Rational, not C or Radical)."""
    return isinstance(x, (int, Integer, Rational)) and not isinstance(x, bool)


def _is_gaussian_int(x):
    """True if x is a Gaussian integer C(a,b) with a,b in ℤ."""
    return (isinstance(x, C)
            and isinstance(x.real, (int, Integer))
            and isinstance(x.imag, (int, Integer)))


def _rad_rat_mul(a, b):
    """Multiply two rational-valued scalars, returning Integer or Rational."""
    if _rad_is_rational(a) and _rad_is_rational(b):
        an = _rad_int_val(a) if isinstance(a, (int, Integer)) else a.numerator
        ad = 1           if isinstance(a, (int, Integer)) else a.denominator
        bn = _rad_int_val(b) if isinstance(b, (int, Integer)) else b.numerator
        bd = 1           if isinstance(b, (int, Integer)) else b.denominator
        return Rational(an * bn, ad * bd)
    raise TypeError(f"_rad_rat_mul: not both rational: {a!r}, {b!r}")


def _rad_rat_div(a, b):
    """Divide two rational-valued scalars."""
    if _rad_is_rational(a) and _rad_is_rational(b):
        an = _rad_int_val(a) if isinstance(a, (int, Integer)) else a.numerator
        ad = 1           if isinstance(a, (int, Integer)) else a.denominator
        bn = _rad_int_val(b) if isinstance(b, (int, Integer)) else b.numerator
        bd = 1           if isinstance(b, (int, Integer)) else b.denominator
        return Rational(an * bd, ad * bn)
    raise TypeError(f"_rad_rat_div: not both rational: {a!r}, {b!r}")


def _rad_scalar_zero(x):
    """True when x equals zero (works for int, Integer, Rational, C)."""
    return zero(x)


def _rad_pure_add(a, b):
    """Add two Integer/Rational values without going through C arithmetic."""
    if isinstance(a, (int, Integer)) and isinstance(b, (int, Integer)):
        return Integer(_rad_int_val(a) + _rad_int_val(b))
    ra = a if isinstance(a, Rational) else Rational(_rad_int_val(a), 1)
    rb = b if isinstance(b, Rational) else Rational(_rad_int_val(b), 1)
    return ra + rb


def _rad_pure_sub(a, b):
    """Subtract two Integer/Rational values."""
    if isinstance(a, (int, Integer)) and isinstance(b, (int, Integer)):
        return Integer(_rad_int_val(a) - _rad_int_val(b))
    ra = a if isinstance(a, Rational) else Rational(_rad_int_val(a), 1)
    rb = b if isinstance(b, Rational) else Rational(_rad_int_val(b), 1)
    return ra - rb


def _rad_is_poly_like(x):
    """True for coefficients that already implement their own arithmetic and
    shouldn't be pulled apart by the rational/Gaussian-integer machinery below
    (Monomialvar/Polynomialvar/Rationalfractionvar, or a nested radical/
    AlgebraicNumber acting as a coefficient).
    """
    return isinstance(x, (Monomialvar, Polynomialvar, Rationalfractionvar, Rad))


def _rad_coef_mul(a, b):
    """Multiply two coefficients (Integer | Rational | C), returning simplified result."""
    if _rad_is_poly_like(a) or _rad_is_poly_like(b):
        return a * b
    if _rad_is_rational(a) and _rad_is_rational(b):
        return _rad_rat_mul(a, b)
    # At least one is C.  Compute (ar+ai·i)(br+bi·i) using pure rational arithmetic.
    def _split(v):
        if isinstance(v, C):
            r = v.real if isinstance(v.real, (Integer, Rational)) else Integer(int(v.real))
            i = v.imag if isinstance(v.imag, (Integer, Rational)) else Integer(int(v.imag))
            return r, i
        return v, Integer(0)
    ar, ai = _split(a)
    br, bi = _split(b)
    real_part = _rad_pure_sub(_rad_rat_mul(ar, br), _rad_rat_mul(ai, bi))
    imag_part = _rad_pure_add(_rad_rat_mul(ar, bi), _rad_rat_mul(ai, br))
    if _rad_scalar_zero(imag_part):
        return real_part
    return C(real_part, imag_part)


def _rad_coef_add(a, b):
    """Add two coefficients (Integer | Rational | C)."""
    if _rad_is_poly_like(a) or _rad_is_poly_like(b):
        return a + b
    if _rad_is_rational(a) and _rad_is_rational(b):
        return _rad_pure_add(a, b)
    # At least one is C.
    def _split(v):
        if isinstance(v, C):
            r = v.real if isinstance(v.real, (Integer, Rational)) else Integer(int(v.real))
            i = v.imag if isinstance(v.imag, (Integer, Rational)) else Integer(int(v.imag))
            return r, i
        return v, Integer(0)
    ar, ai = _split(a)
    br, bi = _split(b)
    real_part = _rad_pure_add(ar, br)
    imag_part = _rad_pure_add(ai, bi)
    if _rad_scalar_zero(imag_part):
        return real_part
    return C(real_part, imag_part)
    return result


def _rad_coef_neg(a):
    """Negate a coefficient."""
    if _rad_is_poly_like(a):
        return -a
    if _rad_is_rational(a):
        if isinstance(a, (int, Integer)):
            return Integer(-_rad_int_val(a))
        return Rational(-a.numerator, a.denominator)
    return C(-a.real, -a.imag)


def _rad_lcm(a, b):
    """LCM of two plain Python ints."""
    return a * b // _math.gcd(a, b)


def _rad_isqrt_exact(n):
    """Return sqrt(n) as int if n is a perfect square, else None."""
    if n < 0:
        return None
    s = _math.isqrt(n)
    return s if s * s == n else None


def _rad_icbrt_exact(n):
    """Return cbrt(n) as int if n is a perfect cube, else None."""
    if n == 0:
        return 0
    sign = 1 if n > 0 else -1
    r = round(abs(n) ** (1/3))
    for c in (r-1, r, r+1):
        if c >= 0 and c**3 == abs(n):
            return sign * c
    return None


def _rad_nth_root_exact(n, deg):
    """Return deg-th root of n as int if exact, else None."""
    if n == 0:
        return 0
    if deg == 2:
        return _rad_isqrt_exact(n)
    if deg == 3:
        return _rad_icbrt_exact(n)
    sign = 1 if n >= 0 else (-1 if deg % 2 == 1 else None)
    if sign is None:
        return None
    r = round(abs(n) ** (1/deg))
    for c in (r-1, r, r+1):
        if c >= 0 and c**deg == abs(n):
            return sign * c
    return None


def _rad_factor_dict_to_int(F):
    """Reconstruct n from its prime-factor dict {p: e, ...} as a plain int."""
    result = 1
    for p, e in F.items():
        result *= int(p) ** int(e)
    return result


# ── denesting: sqrt(a + b*sqrt(c)) = sqrt(p) + sqrt(q) ──────────────────────

def _rad_try_denest_sqrt(radicand):
    """
    If radicand is a Radical of the form  r + coef*sqrt(c)  (or r - coef*sqrt(c)),
    attempt to denest as  sqrt(p) ± sqrt(q).

    Returns a tuple (Radical_or_Rational, Radical_or_Rational, sign)
        meaning  sqrt(p) + sign*sqrt(q)
    or None if denesting is not possible.
    """
    # radicand must be an AlgebraicNumber or Radical that looks like a+b*sqrt(c)
    if not isinstance(radicand, AlgebraicNumber):
        return None
    terms = radicand.terms          # list of RadicalMonomial
    # We need exactly two terms: one rational, one rational*sqrt(c)
    if len(terms) != 2:
        return None
    # identify which term is rational and which has a single sqrt
    rat_term = None
    rad_term = None
    for t in terms:
        if len(t.radicals) == 0:
            rat_term = t
        elif len(t.radicals) == 1:
            (base_rad, power), = t.radicals.items()
            if power == 1 and base_rad.degree == 2 and _rad_is_rational(base_rad.radicand):
                rad_term = (t, base_rad)
    if rat_term is None or rad_term is None:
        return None

    a = rat_term.coef                      # rational part
    rad_t, sqrt_c_rad = rad_term
    b = rad_t.coef                         # coefficient of sqrt(c)
    c_val = sqrt_c_rad.radicand            # c (must be rational integer)
    if not isinstance(c_val, (int, Integer)):
        return None

    # need a, b rational
    if not _rad_is_rational(a) or not _rad_is_rational(b):
        return None

    # discriminant = a^2 - b^2*c;  must be a non-negative perfect square
    a_n = a.numerator if isinstance(a, Rational) else _rad_int_val(a)
    a_d = a.denominator if isinstance(a, Rational) else 1
    b_n = b.numerator if isinstance(b, Rational) else _rad_int_val(b)
    b_d = b.denominator if isinstance(b, Rational) else 1
    c_i = _rad_int_val(c_val)

    # disc = a^2 - b^2*c  as a rational (a_n/a_d)^2 - (b_n/b_d)^2*c_i
    disc_num = a_n**2 * b_d**2 - b_n**2 * a_d**2 * c_i
    disc_den = a_d**2 * b_d**2
    if disc_num < 0:
        return None
    # disc must be a perfect rational square: disc_num/disc_den = (s/t)^2
    # i.e. disc_num * disc_den must be a perfect square
    sq = _rad_isqrt_exact(disc_num * disc_den)
    if sq is None:
        return None
    # sqrt(disc) = sq / disc_den
    sqrt_disc_num = sq
    sqrt_disc_den = disc_den

    # p = (a + sqrt(disc)) / 2,  q = (a - sqrt(disc)) / 2
    # p_num/p_den = (a_n/a_d + sqrt_disc_num/sqrt_disc_den) / 2
    p_num = a_n * sqrt_disc_den + sqrt_disc_num * a_d
    p_den = 2 * a_d * sqrt_disc_den
    q_num = a_n * sqrt_disc_den - sqrt_disc_num * a_d
    q_den = 2 * a_d * sqrt_disc_den

    p = Rational(p_num, p_den)
    q = Rational(q_num, q_den)

    if _rad_scalar_zero(q):
        # sqrt(a + b*sqrt(c)) = sqrt(p)
        return (Radical(p), Radical(Integer(0)), 1)
    if _rad_scalar_zero(p):
        return (Radical(Integer(0)), Radical(q), 1)

    # sign of b determines whether we add or subtract
    sign = 1 if (b_n >= 0) else -1
    return (Radical(p), Radical(q), sign)


# ─────────────────────────────────────────────────────────────────────────────
# RadicalMonomial — coefficient × product of Radicals
# ─────────────────────────────────────────────────────────────────────────────

class RadicalMonomial(Scalar, Rad):
    """
    Represents:   coef × ∏ Rᵢ^eᵢ
    where coef is Integer | Rational | C (never Radical)
    and radicals is {Radical: positive_int_exponent}.

    After construction the exponents are normalised: if Rᵢ = ⁿ√x and eᵢ ≥ n,
    we pull x^(eᵢ//n) into the coefficient and keep only eᵢ % n.
    If eᵢ % n == 0, Rᵢ is removed entirely.
    """

    __slots__ = ('coef', 'radicals')

    def __init__(self, coef=None, radicals=None):
        self.coef     = Integer(1) if coef is None else coef
        self.radicals = {} if radicals is None else dict(radicals)
        self._reduce()

    # ── internal normalisation ─────────────────────────────────────────────

    def _reduce(self):
        """Pull out full nth-powers from each radical factor and zero-out."""
        new_rads = {}
        coef = self.coef
        for rad, exp in self.radicals.items():
            if exp == 0:
                continue
            n = rad.degree
            full, rem = divmod(exp, n)
            if full > 0:
                # rad^n = rad.radicand, so rad^(full*n) = radicand^full
                coef = _rad_coef_mul(coef, _rad_pow_scalar(rad.radicand, full))
            if rem > 0:
                new_rads[rad] = rem
        self.coef     = coef
        self.radicals = new_rads

    # ── arithmetic ────────────────────────────────────────────────────────

    def __mul__(self, other):
        if not isinstance(other, RadicalMonomial):
            return NotImplemented
        new_coef = _rad_coef_mul(self.coef, other.coef)
        new_rads = dict(self.radicals)
        for rad, exp in other.radicals.items():
            # 1. Same radicand AND same degree → merge exponents
            matched_same = None
            for existing in new_rads:
                if existing.radicand == rad.radicand and existing.degree == rad.degree:
                    matched_same = existing
                    break
            if matched_same is not None:
                new_rads[matched_same] = new_rads[matched_same] + exp
                continue
            # 2. Same degree but different radicand → combine into new Radical
            #    ⁿ√a · ⁿ√b = ⁿ√(a·b)  (then Radical.__new__ simplifies)
            matched_deg = None
            for existing in list(new_rads.keys()):
                if existing.degree == rad.degree:
                    matched_deg = existing
                    break
            if matched_deg is not None and exp == 1 and new_rads[matched_deg] == 1:
                # combine: ⁿ√a * ⁿ√b = ⁿ√(ab)
                combined_rad = Radical(
                    _rad_pow_scalar(matched_deg.radicand, 1) if _rad_is_rational(matched_deg.radicand)
                    else matched_deg.radicand,
                    matched_deg.degree)
                # build new radical with product radicand
                product_radicand = _rad_prod_radicands(matched_deg.radicand, rad.radicand)
                new_r = Radical(product_radicand, matched_deg.degree)
                del new_rads[matched_deg]
                if isinstance(new_r, (Integer, Rational)):
                    new_coef = _rad_coef_mul(new_coef, new_r)
                elif isinstance(new_r, Radical):
                    bare = _rad_bare_radical(new_r.radicand, new_r.degree)
                    new_coef = _rad_coef_mul(new_coef, new_r.coef)
                    if not (bare.radicand == Integer(1) or bare.radicand == 1):
                        new_rads[bare] = new_rads.get(bare, 0) + 1
                continue
            # 3. Different degree → keep separate
            new_rads[rad] = new_rads.get(rad, 0) + exp
        return RadicalMonomial(new_coef, new_rads)

    def __neg__(self):
        return RadicalMonomial(_rad_coef_neg(self.coef), dict(self.radicals))

    def is_zero(self):
        return _rad_scalar_zero(self.coef)

    def __eq__(self, other):
        if not isinstance(other, RadicalMonomial):
            return False
        return (self.coef == other.coef and
                self.radicals == other.radicals)

    def same_radicals(self, other):
        """True when two monomials have the same radical product (same 'basis element')."""
        return self.radicals == other.radicals

    def __hash__(self):
        return hash((self.coef,
                     frozenset((id(r), e) for r, e in self.radicals.items())))

    def __str__(self):
        if self.is_zero():
            return "0"
        c = self.coef
        # Build radical string (juxtaposition, no separator)
        rad_str = ""
        for rad, exp in sorted(self.radicals.items(), key=lambda x: str(x[0])):
            s = str(rad)
            if exp > 1:
                s += f"^{exp}"
            rad_str += s
        if not rad_str:
            return str(c)
        # Format coefficient prefix
        if _rad_is_rational(c):
            cv = _rad_int_val(c) if isinstance(c, (int, Integer)) else None
            if cv == 1:
                return rad_str
            if cv == -1:
                return "-" + rad_str
            return str(c) + rad_str
        # C coefficient
        cs = str(c)
        needs_paren = ('+' in cs or (cs.count('-') > (1 if cs.startswith('-') else 0)))
        return (f"({cs})" if needs_paren else cs) + rad_str

    def __repr__(self):
        return f"RadicalMonomial({self})"


def _rad_pow_scalar(x, n):
    """Raise a scalar (Integer | Rational | C) to a non-negative integer power."""
    if n == 0:
        return Integer(1)
    if _rad_is_poly_like(x):
        return x ** n
    if isinstance(x, (int, Integer)):
        return Integer(_rad_int_val(x) ** n)
    if isinstance(x, Rational):
        return Rational(x.numerator ** n, x.denominator ** n)
    if isinstance(x, C):
        return x ** n
    # Generic fallback: anything else (AlgebraicNumber, nested Radical, poly-like
    # coefficients, ...) already implements its own __pow__ — just use it.
    return x ** n


# ─────────────────────────────────────────────────────────────────────────────
# Radical — a single irreducible ⁿ√x  (the atom)
# ─────────────────────────────────────────────────────────────────────────────

class Radical(Scalar, Rad):
    """
    Represents an irreducible radical  coef · ⁿ√radicand.

    __new__ simplifies immediately:
      • factors out full nth-powers from integer/rational/Gaussian-int radicands
      • reduces the root index via gcd of remaining exponents
      • if the radicand collapses to 1 (or 0), returns coef as Integer/Rational/C
      • for sqrt of the form a+b√c, attempts denesting
      • handles negative real radicands by separating the sign
      • handles Gaussian-integer radicands via Cfactors
    """

    __slots__ = ('radicand', 'degree', 'coef')

    # ── construction & simplification ─────────────────────────────────────

    def __new__(cls, radicand, degree=2, coef=None):
        # Resolve default coefficient
        outer_coef = Integer(1) if coef is None else coef

        # ── 0 radicand ────────────────────────────────────────────────────
        if _rad_scalar_zero(radicand):
            return Integer(0)

        # ── degree 1 ──────────────────────────────────────────────────────
        degree = _rad_int_val(degree) if isinstance(degree, (Integer,)) else int(degree)
        if degree == 1:
            # ¹√x = x, return coef * x
            return _rad_make_algebraic_or_scalar(_rad_coef_mul(outer_coef, radicand))

        # ── negative integer/rational radicand ────────────────────────────
        if _rad_is_rational(radicand) and not _rad_scalar_zero(radicand):
            rv = (radicand.numerator // radicand.denominator
                  if isinstance(radicand, Rational) and radicand.is_integer()
                  else (_rad_int_val(radicand) if isinstance(radicand, (int, Integer)) else None))
            if rv is not None and rv < 0:
                if degree % 2 == 1:
                    # odd root of negative: pull out -1
                    outer_coef = _rad_coef_mul(outer_coef, Integer(-1))
                    radicand   = Integer(-rv)
                else:
                    # even root of negative real: multiply coefficient by i
                    outer_coef = _rad_coef_mul(outer_coef, C(Integer(0), Integer(1)))
                    radicand   = Integer(-rv)

        # ── rational radicand: factor & simplify ──────────────────────────
        if _rad_is_rational(radicand):
            # handle Rational(p,q): ⁿ√(p/q) = ⁿ√p / ⁿ√q
            if isinstance(radicand, Rational) and not radicand.is_integer():
                p, q = radicand.numerator, radicand.denominator
                # extract full nth-powers from numerator and denominator separately
                coef_p, rem_p = _rad_simplify_int_radical(p, degree)
                coef_q, rem_q = _rad_simplify_int_radical(q, degree)
                # ⁿ√(p/q) = (coef_p / coef_q) * ⁿ√(rem_p / rem_q)
                rat_coef  = _rad_rat_div(coef_p, coef_q)
                outer_coef = _rad_coef_mul(outer_coef, rat_coef)
                new_radicand = Rational(rem_p, rem_q) if rem_q != 1 else Integer(rem_p)
                if _rad_isqrt_exact(rem_p) is not None and _rad_isqrt_exact(rem_q) is not None:
                    # both are perfect squares — whole thing collapsed
                    pass  # new_radicand handled below
                radicand = new_radicand
            else:
                # integer radicand
                n_val = _rad_int_val(radicand) if isinstance(radicand, (int, Integer)) else None
                if n_val is None and isinstance(radicand, Rational) and radicand.is_integer():
                    n_val = radicand.numerator
                if n_val is not None:
                    coef_out, rem = _rad_simplify_int_radical(abs(n_val), degree)
                    outer_coef = _rad_coef_mul(outer_coef, coef_out)
                    radicand   = Integer(rem)

        # ── radicand collapsed to 1 ───────────────────────────────────────
        if radicand == Integer(1) or radicand == 1:
            return _rad_make_algebraic_or_scalar(outer_coef)

        # ── Gaussian integer radicand: factor via Cfactors ──────────
        if _is_gaussian_int(radicand) and not _rad_is_rational(radicand):
            ri = _rad_int_val(radicand.real)
            ji = _rad_int_val(radicand.imag)
            coef_out, rem = _rad_simplify_gaussian_radical(ri, ji, degree)
            outer_coef = _rad_coef_mul(outer_coef, coef_out)
            if _rad_scalar_zero(rem.imag) and rem.real == Integer(1):
                return _rad_make_algebraic_or_scalar(outer_coef)
            radicand = rem

        # ── reduce root index using gcd of exponents ──────────────────────
        if _rad_is_rational(radicand) and isinstance(radicand, (int, Integer)):
            n_val = _rad_int_val(radicand)
            if n_val > 0:
                F = factors(n_val)
                exponents = [int(e) for e in F.values()]
                if exponents:
                    g = _reduce(_math.gcd, exponents)
                    g = _math.gcd(g, degree)
                    if g > 1:
                        degree   = degree // g
                        radicand = Integer(_rad_factor_dict_to_int(
                            {p: Integer(int(e) // g) for p, e in F.items()}))
                        if degree == 1:
                            return _rad_make_algebraic_or_scalar(
                                _rad_coef_mul(outer_coef, radicand))

        # ── degree 2: try denesting sqrt(a + b*sqrt(c)) ───────────────────
        if degree == 2 and isinstance(radicand, AlgebraicNumber):
            result = _rad_try_denest_sqrt(radicand)
            if result is not None:
                sq_p, sq_q, sign = result
                # return outer_coef * (sq_p + sign*sq_q)
                term1 = AlgebraicNumber._from_radical(sq_p)
                term2 = AlgebraicNumber._from_radical(sq_q)
                combined = term1 + (term2 if sign == 1 else -term2)
                if isinstance(combined, AlgebraicNumber):
                    return combined * outer_coef
                return _rad_coef_mul(outer_coef, combined)

        # ── construct the irreducible Radical object ───────────────────────
        self = super().__new__(cls)
        self.radicand = radicand
        self.degree   = degree
        self.coef     = outer_coef
        return self

    def __init__(self, radicand, degree=2, coef=None):
        # __new__ sets attributes; __init__ is a no-op (needed to suppress warnings)
        pass

    # ── helpers ───────────────────────────────────────────────────────────

    def as_monomial(self):
        """Return a RadicalMonomial with coef=self.coef and {self (coef=1): 1}."""
        bare = _rad_bare_radical(self.radicand, self.degree)  # Radical with coef=1
        return RadicalMonomial(self.coef, {bare: 1})

    def as_algebraic(self):
        """Wrap in an AlgebraicNumber."""
        return AlgebraicNumber([self.as_monomial()])

    # ── arithmetic ────────────────────────────────────────────────────────

    def __add__(self, other):
        return self.as_algebraic() + _rad_ensure_algebraic(other)

    def __radd__(self, other):
        return _rad_ensure_algebraic(other) + self.as_algebraic()

    def __sub__(self, other):
        return self.as_algebraic() - _rad_ensure_algebraic(other)

    def __rsub__(self, other):
        return _rad_ensure_algebraic(other) - self.as_algebraic()

    def __mul__(self, other):
        if isinstance(other, Radical):
            # (c1 · ⁿ¹√x) · (c2 · ⁿ²√y)
            return self.as_algebraic() * other.as_algebraic()
        if _rad_is_rational(other) or isinstance(other, C):
            # scalar multiply: new coef
            new_coef = _rad_coef_mul(self.coef, other)
            return Radical(self.radicand, self.degree, new_coef)
        if isinstance(other, (AlgebraicNumber, RadicalMonomial)):
            return self.as_algebraic() * other
        return NotImplemented

    def __rmul__(self, other):
        if _rad_is_rational(other) or isinstance(other, C):
            return self.__mul__(other)
        return NotImplemented

    def __truediv__(self, other):
        if isinstance(other, Radical) and other.radicand == self.radicand and other.degree == self.degree:
            # same radical: cancel
            # FIX (Dido): the complex branch multiplied by the *negated* coefficient instead of dividing by it
            new_coef = _rad_rat_div(self.coef, other.coef) if (_rad_is_rational(self.coef) and _rad_is_rational(other.coef)) else self.coef / other.coef
            return new_coef
        return self.as_algebraic() / _rad_ensure_algebraic(other)

    def __rtruediv__(self, other):  # FIX (Dido): added so that  2 / sqrt(3)  works
        return _rad_ensure_algebraic(other) / self.as_algebraic()

    def __neg__(self):
        return Radical(self.radicand, self.degree, _rad_coef_neg(self.coef))

    def __pow__(self, n):
        n = int(n)
        if n == 0:
            return Integer(1)
        if n == 1:
            return self
        if n < 0:
            raise NotImplementedError("Negative powers of Radical not yet supported")
        # coef^n * (ⁿ√radicand)^n = coef^n * Radical(radicand^...) handled by __new__
        new_coef = _rad_pow_scalar(self.coef, n)
        return Radical(self.radicand, self.degree, new_coef) ** 1 if False else \
               _rad_make_algebraic_or_scalar(_rad_coef_mul(
                   new_coef,
                   Radical(_rad_pow_scalar(self.radicand, n % self.degree) if n < self.degree
                           else self.radicand, self.degree)
                   if n % self.degree != 0 else
                   _rad_pow_scalar(self.radicand, n // self.degree)))

    def numerical(self):
        """Return a floating-point approximation of this radical."""
        c = self.coef
        if isinstance(c, C):
            cr = float(_rad_int_val(c.real)) if isinstance(c.real, (int, Integer)) else float(c.real)
            ci = float(_rad_int_val(c.imag)) if isinstance(c.imag, (int, Integer)) else float(c.imag)
            cv = C(cr, ci)
        else:
            cv = C(float(c),0)
        rv = self.radicand
        if _rad_is_rational(rv):
            rv_f = float(rv)
        elif isinstance(rv, C):
            rr = float(_rad_int_val(rv.real)) if isinstance(rv.real, Integer) else float(rv.real)
            ri = float(_rad_int_val(rv.imag)) if isinstance(rv.imag, Integer) else float(rv.imag)
            rv_f = C(rr, ri)
        elif isinstance(rv, AlgebraicNumber):
            rv_f = rv.numerical()
        else:
            rv_f = float(rv)
        result = cv * (rv_f ** (1.0 / self.degree))
        return result.real if isinstance(result, C) and abs(result.imag) < 1e-12 else result

    def __eq__(self, other):
        if isinstance(other, Radical):
            return (self.radicand == other.radicand
                    and self.degree == other.degree
                    and self.coef == other.coef)
        return False

    def __hash__(self):
        return hash((str(self.radicand), self.degree))

    # ── display ───────────────────────────────────────────────────────────

    def __str__(self):
        rad_str = _radical_str(self.radicand, self.degree)
        c = self.coef
        if _rad_is_rational(c):
            cv = _rad_int_val(c) if isinstance(c, (int, Integer)) else None
            if cv == 1:
                return rad_str
            if cv == -1:
                return "-" + rad_str
            return str(c) + rad_str
        # C coefficient: only wrap in parens if it's a sum (has both real and imag)
        cs = str(c)
        # pure imaginary like "2j" or "1j": no parens needed
        needs_paren = ('+' in cs or (cs.count('-') > (1 if cs.startswith('-') else 0)))
        return (f"({cs})" if needs_paren else cs) + rad_str

    def __repr__(self):
        return self.__str__()


def _radical_str(radicand, degree):
    """Format  ⁿ√radicand  using a vinculum-style string."""
    if degree == 2:
        return f"√{_paren(str(radicand))}"
    idx = str(degree).translate(superscripts)
    return f"{idx}√{_paren(str(radicand))}"


def _paren(s):
    """Wrap s in parentheses only if it contains + or - (i.e. is a sum)."""
    if len(s) > 1 and ('+' in s or (s.count('-') > (1 if s[0] == '-' else 0))):
        return f"({s})"
    return s


def _rad_prod_radicands(a, b):
    """Multiply two radicands (Integer | Rational), returning their product as Integer/Rational."""
    if isinstance(a, (int, Integer)) and isinstance(b, (int, Integer)):
        return Integer(_rad_int_val(a) * _rad_int_val(b))
    an = _rad_int_val(a) if isinstance(a, (int, Integer)) else a.numerator
    ad = 1           if isinstance(a, (int, Integer)) else a.denominator
    bn = _rad_int_val(b) if isinstance(b, (int, Integer)) else b.numerator
    bd = 1           if isinstance(b, (int, Integer)) else b.denominator
    return Rational(an * bn, ad * bd)


def _rad_bare_radical(radicand, degree):
    """Create a Radical with coef=1 bypassing __new__ simplification (already done)."""
    obj = object.__new__(Radical)
    obj.radicand = radicand
    obj.degree   = degree
    obj.coef     = Integer(1)
    return obj


# ── integer-radical simplification helpers ────────────────────────────────────

def _rad_simplify_int_radical(n, degree):
    """
    Given a positive integer n and root degree,
    return (coef, remainder) such that  ⁿ√n = coef · ⁿ√remainder
    with coef an Integer and remainder a square-free (or power-free) integer.
    """
    F = factors(n)                # {prime: exponent}
    coef_int = 1
    rem_int  = 1
    for p, e in F.items():
        p_i = _rad_int_val(p)
        e_i = _rad_int_val(e)
        full, rest = divmod(e_i, degree)
        coef_int *= p_i ** full
        rem_int  *= p_i ** rest
    return Integer(coef_int), rem_int


def _rad_simplify_gaussian_radical(ri, ji, degree):
    """
    Factor the Gaussian integer ri+ji·i using Cfactors and extract
    full degree-th powers.  Returns (coef_C, remainder_C).
    """
    z = C(Integer(ri), Integer(ji))
    F = Cfactors(z)          # {Gaussian prime: exponent}
    coef = C(Integer(1), Integer(0))
    rem  = C(Integer(1), Integer(0))
    for p, e in F.items():
        e_i  = int(e)
        full, rest = divmod(e_i, degree)
        p_c  = p if isinstance(p, C) else C(Integer(int(p)), Integer(0))
        coef = coef * (p_c ** full)
        rem  = rem  * (p_c ** rest)
    # collapse coef to Integer/Rational if imaginary part is 0
    if _rad_scalar_zero(coef.imag):
        coef_out = coef.real  # FIX (Dido): C has no attribute `r`
        if isinstance(coef_out, (int, Integer)):
            coef_out = Integer(_rad_int_val(coef_out))
    else:
        coef_out = coef
    return coef_out, rem


# ── AlgebraicNumber helpers ───────────────────────────────────────────────────

def _rad_ensure_algebraic(x):
    """Wrap x in AlgebraicNumber if it isn't one already."""
    if isinstance(x, AlgebraicNumber):
        return x
    if isinstance(x, Radical):
        return x.as_algebraic()
    if _rad_is_rational(x) or isinstance(x, C):
        if _rad_scalar_zero(x):
            return AlgebraicNumber([])
        m = RadicalMonomial(x, {})
        return AlgebraicNumber([m])
    if _rad_is_poly_like(x):
        # Polynomial-style coefficients (Monomialvar/Polynomialvar/Rationalfractionvar)
        # carry their own arithmetic — just wrap them as a radical-free term and
        # let RadicalMonomial / AlgebraicNumber defer to that arithmetic.
        if zero(x):
            return AlgebraicNumber([])
        m = RadicalMonomial(x, {})
        return AlgebraicNumber([m])
    raise TypeError(f"Cannot convert {type(x).__name__} to AlgebraicNumber")


def _rad_make_algebraic_or_scalar(x):
    """Return x as-is if it's already a clean scalar, else as AlgebraicNumber."""
    if isinstance(x, (Integer, Rational, C)):
        return x
    if isinstance(x, int):
        return Integer(x)
    if isinstance(x, AlgebraicNumber):
        return x
    return x


# ─────────────────────────────────────────────────────────────────────────────
# AlgebraicNumber — a sum of RadicalMonomials
# ─────────────────────────────────────────────────────────────────────────────

class AlgebraicNumber(Scalar, Rad):
    """
    An element of a radical extension of ℚ (or ℚ(i)):

        a₀ + a₁·r₁ + a₂·r₂ + a₃·r₁·r₂ + ...

    where each aᵢ is Integer | Rational | C and each rᵢ is an irreducible Radical.

    Stored as a list of RadicalMonomial terms in canonical (sorted) form.
    """

    __slots__ = ('terms',)

    def __init__(self, terms=None):
        self.terms = [] if terms is None else list(terms)
        self._collect()

    # ── canonical form: collect like terms ───────────────────────────────

    def _collect(self):
        """Merge terms with the same radical product; drop zeros; sort canonically."""
        buckets = {}
        for t in self.terms:
            key_v = _rad_key(t)
            if key_v in buckets:
                buckets[key_v] = _rad_add_monomials(buckets[key_v], t)
            else:
                buckets[key_v] = t
        # Sort: rational (no radicals) term first, then alphabetically by radical string
        def _sort_key(mono):
            if not mono.radicals:
                return (0, "")
            return (1, "".join(sorted(str(r) for r in mono.radicals)))
        self.terms = sorted(
            (v for v in buckets.values() if not v.is_zero()),
            key=_sort_key
        )

    # ── class method: wrap a Radical ─────────────────────────────────────

    @classmethod
    def _from_radical(cls, rad):
        if isinstance(rad, (Integer, Rational, C, int)):
            if _rad_scalar_zero(rad):
                return cls([])
            return cls([RadicalMonomial(rad, {})])
        if isinstance(rad, Radical):
            return rad.as_algebraic()
        if isinstance(rad, cls):
            return rad
        raise TypeError(f"_from_radical: unexpected {type(rad).__name__}")

    # ── arithmetic ────────────────────────────────────────────────────────

    def __add__(self, other):
        other = _rad_ensure_algebraic(other)
        return AlgebraicNumber(self.terms + other.terms)

    def __radd__(self, other):
        return _rad_ensure_algebraic(other) + self

    def __sub__(self, other):
        other = _rad_ensure_algebraic(other)
        return AlgebraicNumber(self.terms + [-t for t in other.terms])

    def __rsub__(self, other):
        return _rad_ensure_algebraic(other) - self

    def __neg__(self):
        return AlgebraicNumber([-t for t in self.terms])

    def __mul__(self, other):
        if _rad_is_rational(other) or isinstance(other, C):
            if _rad_scalar_zero(other):
                return AlgebraicNumber([])
            return AlgebraicNumber([RadicalMonomial(_rad_coef_mul(t.coef, other), t.radicals)
                                    for t in self.terms])
        other = _rad_ensure_algebraic(other)
        result_terms = []
        for t1 in self.terms:
            for t2 in other.terms:
                result_terms.append(t1 * t2)
        return AlgebraicNumber(result_terms)

    def __rmul__(self, other):
        if _rad_is_rational(other) or isinstance(other, C):
            return self.__mul__(other)
        return NotImplemented

    def __truediv__(self, other):
        """
        Exact division.  Handles:
          • division by a rational scalar
          • division by a single-term AlgebraicNumber (scalar multiple of one radical)
          • two-term denominator via rationalisation (conjugate trick)
        """
        if _rad_is_rational(other) or isinstance(other, C):
            if _rad_scalar_zero(other):
                raise ZeroDivisionError("Division of AlgebraicNumber by zero")
            if _rad_is_rational(other):
                inv = _rad_rat_div(Integer(1), other)
            else:
                # C: 1/C = conjugate/|C|^2
                denom = _rad_coef_mul(other.real, other.real) + _rad_coef_mul(other.imag, other.imag)
                inv   = C(_rad_rat_div(other.real, denom), _rad_coef_neg(_rad_rat_div(other.imag, denom)))
            return self * inv

        other = _rad_ensure_algebraic(other)
        if len(other.terms) == 0:
            raise ZeroDivisionError("Division by zero AlgebraicNumber")

        if len(other.terms) == 1:
            # denominator is c·r: multiply numerator by 1/c and r^(n-1)/radicand
            t = other.terms[0]
            if not t.radicals:
                # pure scalar
                return self / t.coef
            # single radical factor: (c·ⁿ√x)^(-1) = (1/c) · ⁿ√x^(n-1) / x
            if len(t.radicals) == 1:
                (rad, exp), = t.radicals.items()
                n     = rad.degree
                x     = rad.radicand
                # 1/(ⁿ√x) = ⁿ√(x^(n-1)) / x
                inv_coef = _rad_rat_div(Integer(1), t.coef) if _rad_is_rational(t.coef) else \
                           C.__truediv__(C(Integer(1), Integer(0)), t.coef)
                inv_rad  = Radical(_rad_pow_scalar(x, n - exp), n) if _rad_is_rational(x) else \
                           _rad_bare_radical(x, n)
                inv_mono = RadicalMonomial(inv_coef,
                                          {_rad_bare_radical(x, n): n - exp}
                                          if exp < n else {})
                inv_an = AlgebraicNumber([inv_mono]) * (_rad_rat_div(Integer(1), x)
                                                         if _rad_is_rational(x) else Integer(1))
                return self * inv_an

        if len(other.terms) == 2:
            # rationalise: multiply by conjugate (negate the radical terms)
            conj = _rad_two_term_conjugate(other)
            num  = self  * conj
            den  = other * conj       # should be rational (AlgebraicNumber with 1 term)
            if den.terms and not den.terms[0].radicals:
                return num / den.terms[0].coef

        raise NotImplementedError(
            f"Division by {len(other.terms)}-term AlgebraicNumber not yet supported")

    def __rtruediv__(self, other):
        return _rad_ensure_algebraic(other) / self

    def __pow__(self, n):
        n = int(n)
        if n == 0:
            return AlgebraicNumber([RadicalMonomial(Integer(1), {})])
        if n < 0:
            return Integer(1) / (self ** (-n))
        result = AlgebraicNumber([RadicalMonomial(Integer(1), {})])
        base   = self
        while n:
            if n % 2 == 1:
                result = result * base
            base = base * base
            n //= 2
        return result

    def __eq__(self, other):
        try:
            other = _rad_ensure_algebraic(other)
        except TypeError:
            return False
        diff = self - other
        return len(diff.terms) == 0

    def __str__(self):
        if not self.terms:
            return "0"
        parts = []
        for t in self.terms:
            s = str(t)
            if parts and not s.startswith("-"):
                s = "+" + s
            parts.append(s)
        return "".join(parts)

    def __repr__(self):
        return self.__str__()

    def numerical(self):
        """Return a floating-point approximation (C if needed)."""
        total = 0j
        for t in self.terms:
            c = t.coef
            if isinstance(c, C):
                cr = float(c.real) if not isinstance(c.real, (int, Integer)) else float(_rad_int_val(c.real))
                ci = float(c.imag) if not isinstance(c.imag, (int, Integer)) else float(_rad_int_val(c.imag))
                cv = C(cr, ci)
            else:
                cv = C(float(c), 0)
            for rad, exp in t.radicals.items():
                rv = rad.radicand
                if _rad_is_rational(rv):
                    rv_f = float(rv)
                elif isinstance(rv, C):
                    rr = float(rv.real) if not isinstance(rv.real, Integer) else float(_rad_int_val(rv.real))
                    ri = float(rv.imag) if not isinstance(rv.imag, Integer) else float(_rad_int_val(rv.imag))
                    rv_f = C(rr, ri)
                else:
                    rv_f = float(rv)
                cv *= rv_f ** (exp / rad.degree)
            total += cv
        return total.real if abs(total.imag) < 1e-12 else total


# ── AlgebraicNumber helpers ───────────────────────────────────────────────────

def _rad_key(monomial):
    """A hashable key that identifies the radical product of a monomial."""
    return frozenset(
        (str(r.radicand), r.degree, e) for r, e in monomial.radicals.items()
    )


def _rad_add_monomials(m1, m2):
    """Add two RadicalMonomials with the same radical product."""
    new_coef = _rad_coef_add(m1.coef, m2.coef)
    return RadicalMonomial(new_coef, m1.radicals)


def _rad_two_term_conjugate(an):
    """
    Given a two-term AlgebraicNumber  a + b·√x, return its conjugate  a - b·√x.
    For the purpose of rationalisation.
    """
    t0, t1 = an.terms
    return AlgebraicNumber([t0, -t1])


# ── convenience constructor ───────────────────────────────────────────────────

def sqrt(x):
    """Convenience: return Radical(x, 2) fully simplified."""
    return Radical(x, 2)

def cbrt(x):
    """Convenience: return Radical(x, 3) fully simplified."""
    return Radical(x, 3)

def nthrt(x, n):
    """Convenience: return Radical(x, n) fully simplified."""
    return Radical(x, n)



class Rational(Scalar):
    def __new__(cls, numerator=0, denominator=1):
        if isinstance(numerator, Rational):
            numerator = numerator.numerator
        if isinstance(denominator, Rational):
            denominator = denominator.denominator
        g = gcd(abs(int(numerator)), abs(int(denominator)))
        numerator = int(numerator) // g
        denominator = int(denominator) // g
        if denominator < 0:
            numerator = -numerator
            denominator = -denominator
        if numerator == 0:
            return Integer(0)
        if denominator == 1:
            return Integer(numerator)
        self = super().__new__(cls)
        self.numerator = numerator
        self.denominator = denominator
        return self

    def simplify(self):
        try:
            n_val = real(self.numerator)
            d_val = real(self.denominator)
            if n_val.is_integer() and d_val.is_integer():
                n_int = int(n_val)
                d_int = int(d_val)
                common = gcd(abs(n_int), abs(d_int))
                if common > 1:
                    self.numerator = n_int // common
                    self.denominator = d_int // common
                else:
                    self.numerator = n_int
                    self.denominator = d_int
            if real(self.denominator) < 0:
                self.numerator = -self.numerator
                self.denominator = -self.denominator
        except (TypeError, ValueError, AttributeError):
            pass
        return self

    def __add__(self, other):
        if isinstance(other, Rad) and not isinstance(other, (Rational, Integer)):
            return other + self
        other = Rational._coerce(other)
        return Rational(self.numerator * other.denominator + self.denominator * other.numerator,
                        self.denominator * other.denominator)

    def __radd__(self, other):
        return self.__add__(other)

    def __sub__(self, other):
        if isinstance(other, (Monomialvar, Polynomialvar, Rationalfractionvar)):
            return (-other) + self
        if isinstance(other, Rad) and not isinstance(other, (Rational, Integer)):
            return (-other) + self
        other = Rational._coerce(other)
        return Rational(self.numerator * other.denominator - self.denominator * other.numerator,
                        self.denominator * other.denominator)

    def __rsub__(self, other):
        if isinstance(other, (Monomialvar, Polynomialvar, Rationalfractionvar)):
            return other + (-self)
        other = Rational._coerce(other)
        return Rational(other.numerator * self.denominator - other.denominator * self.numerator,
                        self.denominator * other.denominator)

    def __neg__(self):
        return Rational(-self.numerator, self.denominator)

    @staticmethod
    def _coerce(other):
        """Always return a proper Rational (never Integer) for arithmetic use."""
        if isinstance(other, Rational):
            return other
        if isinstance(other, Integer):
            # bypass __new__ to avoid collapsing back to Integer
            r = object.__new__(Rational)
            r.numerator = other.int
            r.denominator = 1
            return r
        r = object.__new__(Rational)
        v = Integer(other)
        r.numerator = v
        r.denominator = 1
        return r

    def __mul__(self, other):
        if hasattr(other, 'lc'):
            return NotImplemented
        if isinstance(other, Vectorspace):
            return NotImplemented
        if isinstance(other, (Polynomialvar, Monomialvar)):
            # Rational * Polynomial: scale each coefficient
            return other * self
        if isinstance(other, Rationalfractionvar):
            return NotImplemented
        if isinstance(other, Rad) and not isinstance(other, (Rational, Integer)):
            return other * self
        if isinstance(other, Rad):
            return other * self
        other = Rational._coerce(other)
        return Rational(self.numerator * other.numerator,
                        self.denominator * other.denominator)

    def __rmul__(self, other):
        if isinstance(other, int):
            other = Rational._coerce(Integer(other))
            return self * other
        if isinstance(other, (Scalar, float)) and not isinstance(other, (Polynomialvar, Monomialvar, Rationalfractionvar)):
            other = Rational._coerce(other)
            return self * other
        return NotImplemented

    def __truediv__(self, other):
        if isinstance(other, Rad) and not isinstance(other, (Rational, Integer)):
            # FIX (Dido): `1 / other` is a plain int divided by a Radical, which Python can't do
            return _rad_ensure_algebraic(self) / _rad_ensure_algebraic(other)
        other = Rational._coerce(other)
        return Rational(self.numerator * other.denominator, self.denominator * other.numerator)

    def __rtruediv__(self, other):
        other = Rational._coerce(other)
        return Rational(other.numerator * self.denominator, other.denominator * self.numerator)

    def __pow__(self, value):
        return Rational(self.numerator ** value, self.denominator ** value)

    def __abs__(self):
        return Rational(abs(self.numerator), abs(self.denominator))

    def __invert__(self):
        return Rational(self.denominator, self.numerator)

    def __float__(self):
        return real(self.numerator) / real(self.denominator)

    def __str__(self):
        d_str = str(self.denominator)
        if d_str == "1":
            return str(self.numerator)
        return f"{self.numerator}/{self.denominator}"

    def __repr__(self):
        return self.__str__()

    def __int__(self):
        return int(float(self))

    def __eq__(self, other):
        if not isinstance(other, Rational):
            return False
        return (self.numerator * other.denominator) == (other.numerator * self.denominator)

    def __lt__(self, other):
        if not isinstance(other, Rational):
            return False
        return (self.numerator * other.denominator - other.numerator * self.denominator) < 0

    def __le__(self, other):
        if not isinstance(other, Rational):
            return False
        return (self.numerator * other.denominator - other.numerator * self.denominator) <= 0

    def __gt__(self, other):
        if not isinstance(other, Rational):
            return False
        return (self.numerator * other.denominator - other.numerator * self.denominator) > 0

    def __ge__(self, other):
        if not isinstance(other, Rational):
            return False
        return (self.numerator * other.denominator - other.numerator * self.denominator) >= 0

    def __floordiv__(self, other):
        return Rational(self.numerator // other, self.denominator)

    def is_integer(self):
        return self.denominator==1

    def __round__(self, ndigits=None):
        n = int(self.numerator)/int(self.denominator)
        return round(n,ndigits)

class Polynomial(Function):
    def __init__(self, lc, cst='X'):
        if not isinstance(lc, (list, tuple)):
            lc = [lc]
        if isinstance(lc, tuple):
            lc = list(lc)
        L = []
        for i in lc:
            if hasattr(i, 'is_integer') and i.is_integer():
                L.append(Integer(i))
            else:
                L.append(i)
        self.lc = cleanup(L)
        self.cst = cst

    def deg(self):
        if not self.lc:
            return inf
        for i in range(len(self.lc) - 1, -1, -1):
            if not zero(self.lc[i]):
                return Integer(i)
        return inf

    def __lt__(self, other): return self.deg() < other.deg()
    def __le__(self, other): return self.deg() <= other.deg()
    def __gt__(self, other): return self.deg() > other.deg()
    def __ge__(self, other): return self.deg() >= other.deg()

    def __eq__(self, other):
        if not isinstance(other, Polynomial): return False
        return self.lc == other.lc

    def __ne__(self, other):
        return not (self == other)

    def __bool__(self):
        return self.deg() != inf

    def __add__(self, other):
        if isinstance(other, (Scalar, float, int)) and not isinstance(other, bool):
            other = Monomial(other, 0, self.cst)
        l1, l2 = list(self.lc), list(other.lc)
        max_len = max(len(l1), len(l2))
        l1 += [0] * (max_len - len(l1))
        l2 += [0] * (max_len - len(l2))
        return Polynomial([_coef_add(l1[i], l2[i]) for i in range(max_len)], self.cst)

    def __radd__(self, other):
        return self + other

    def __sub__(self, other):
        if isinstance(other, (Scalar, float, int)) and not isinstance(other, bool):
            other = Monomial(other, 0, self.cst)
        l1, l2 = list(self.lc), list(other.lc)
        max_len = max(len(l1), len(l2))
        l1 += [0] * (max_len - len(l1))
        l2 += [0] * (max_len - len(l2))
        res = Polynomial([_coef_sub(l1[i], l2[i]) for i in range(max_len)], self.cst)
        res.lc = [_normalize_poly_coef(c) for c in res.lc]
        return res

    def __rsub__(self, other):
        return Monomial(other, 0, self.cst) - self

    def __mul__(self, other):
        if isinstance(other, (Scalar, float)):
            return Polynomial([c * other for c in self.lc], self.cst)
        if isinstance(other, Polynomial):
            new_len = len(self.lc) + len(other.lc) - 1
            res = [0] * new_len
            for i in range(len(self.lc)):
                for k in range(len(other.lc)):
                    res[i + k] = _coef_add(res[i + k], self.lc[i] * other.lc[k])
            return Polynomial(res, self.cst)
        if isinstance(other, Monomial):
            return self * Polynomial(other.lc, other.cst)
        return NotImplemented

    def __rmul__(self, other):
        if isinstance(other, (Scalar, float, int)):
            return Polynomial([c * other for c in self.lc], self.cst)
        return NotImplemented

    def __truediv__(self, other):
        if isinstance(other, (Scalar, float)) and not isinstance(other, bool):
            return Polynomial([c / other for c in self.lc], self.cst)
        return Rationalfraction(self, other)

    def __floordiv__(self, other):
        return self.euclidien(other)[0]

    def __mod__(self, other):
        return self.euclidien(other)[1]

    def deg_val(self):
        d = self.deg()
        if d == inf: return -1
        v_d = d.value if hasattr(d, 'value') else d
        return int(v_d)

    def __str__(self):
        if self.deg() == inf:
            return "0"
        t = []
        for i in range(len(self.lc)):
            val = self.lc[i]
            if zero(val):
                continue
            term_str = str(Monomial(val, i, self.cst))
            t.append(term_str)
        if not t:
            return "0"
        result = t[0]
        for term in t[1:]:
            if term.startswith('-'):
                result += term
            else:
                result += "+" + term
        return result

    def __repr__(self):
        return self.__str__()

    def __pow__(self, exponent):
        v_exp = exponent.value if hasattr(exponent, 'value') else exponent
        if isinstance(v_exp, (int, float)) and float(v_exp).is_integer() and v_exp >= 0:
            P = Polynomial([1], self.cst)
            for _ in range(int(v_exp)):
                P = P * self
            return P
        # FIX (Dido): Function() takes no arguments, so this line itself crashed
        raise TypeError("Polynomial powers must be non-negative integers")

    def __call__(self, value):
        if self.deg() == inf: return Integer(0)
        coeff = self.lc
        if not coeff:
            return Integer(0)
        # Detect matrix input
        is_matrix = hasattr(value, 'dim') and hasattr(value, 'columns')
        if is_matrix:
            if not value.issquare():
                raise TypeError("Polynomial can only be evaluated at a square matrix")
            n = value.dim()[0]
            # Horner's method: avoids recomputing powers
            # p(M) = c0*I + c1*M + c2*M² + ...
            # = (...((c_d*I)*M + c_{d-1}*I)*M + ...)*M + c0*I
            # evaluated as: res = c_d; for k in d-1..0: res = res*M + c_k*I
            I = Matrix.identity(n)
            res = Matrix.null_matrix(n, n)
            for ck in reversed(coeff):
                res = res * value + ck * I
            return res
        else:
            # Scalar Horner's method
            res = Integer(0)
            for ck in reversed(coeff):
                res = res * value + ck
            if hasattr(res, 'numerator') and hasattr(res, 'denominator') and not hasattr(res, 'lc'):
                return Rationalfractionvar(res.numerator, res.denominator)
            return res

    def domcoef(self):
        d = self.deg()
        if d == inf:
            return 0
        v_d = d.value if hasattr(d, 'value') else d
        return self.lc[int(v_d)]

    def monomial(self):
        if self.deg() == inf: return False
        return sum(1 for x in self.lc if (x.value if hasattr(x, 'value') else x) != 0) == 1

    def euclidien(self, other):
        if other.deg() == inf:
            raise ZeroDivisionError
        R = Polynomial(self.lc.copy(), self.cst)
        Q = Polynomial([0], self.cst)
        step = 0
        max_steps = max(len(R.lc), len(other.lc)) + 8
        while R.deg() != inf and R.deg() >= other.deg():
            if step >= max_steps:
                break
            r_lc = R.domcoef()
            o_lc = other.domcoef()
            if not _leading_coeff_divides(r_lc, o_lc):
                break
            prev_deg = R.deg()
            try:
                coeff_ratio = _divide_leading_coeff(r_lc, o_lc)
                div_err = None
            except Exception as ex:
                coeff_ratio = None
                div_err = repr(ex)
            if div_err is not None:
                raise TypeError(div_err)
            deg_diff = R.deg() - other.deg()
            T = Monomial(coeff_ratio, deg_diff, self.cst)
            Q = Q + T
            R = R - (T * other)
            R.lc = _compact_lc(
                [_normalize_poly_coef(c) for c in cleanup(R.lc)]
            )
            new_deg = R.deg()
            if new_deg != inf and new_deg >= prev_deg:
                break
            step += 1
        return (Q, R)

    def derivative(self):
        Q = Polynomial([0], self.cst)
        if self.deg() == inf: return Q
        for i in range(len(self.lc)):
            v_num = self.lc[i].value if hasattr(self.lc[i], 'value') else self.lc[i]
            if v_num != 0:
                Q += Monomial(self.lc[i], i, self.cst).derivative()
        return Q

    def __neg__(self):
        L = [-x for x in self.lc]
        return Polynomial(L, self.cst)  # FIX (Dido): keep the variable name (was reset to X)

class Monomial(Polynomial):
    def __init__(self, c, d, cst='X'):
        self.c = c if hasattr(c, 'is_integer') and c.is_integer() else c
        self.d = d if hasattr(d, 'is_integer') and d.is_integer() else d
        self.cst = cst
        v_num = c.value if hasattr(c, 'value') else c
        v_d = int(d.value if hasattr(d, 'value') else d)
        l = [0] * v_d + [c] if v_num != 0 else [0]
        super().__init__(l, cst)

    def deg(self):
        v_d = self.d.value if hasattr(self.d, 'value') else self.d
        if v_d == float('inf'): return inf
        return self.d

    def __str__(self):
        d = self.deg()
        if d == 0: return str(self.c)
        x = self.cst
        d_val = d.value if hasattr(d, 'value') else d
        sup = str(int(d_val)).translate(superscripts) if d_val > 1 else ""
        # Multi-term Polynomialvar coefficient needs parentheses: (a+b)X not a+bX
        if isinstance(self.c, Polynomialvar) and len(self.c.t) > 1:
            return f"({self.c}){x}{sup}"
        prefix = delete(self.c)
        return f"{prefix}{x}{sup}"

    def __invert__(self):
        return Monomial(1, 0, self.cst) / self

    def __pow__(self, exponent):
        return Monomial(self.c**exponent, self.d*exponent, self.cst)  # FIX (Dido): `d` was undefined

    def derivative(self):
        d = self.deg()
        if d == inf or d == 0: return Polynomial([0], self.cst)
        v_d = d.value if hasattr(d, 'value') else d
        return Monomial(int(v_d) * self.c, int(v_d) - 1, self.cst)


def gcd_poly(a, b):
    a = Polynomial(a.lc.copy(), a.cst)
    b = Polynomial(b.lc.copy(), b.cst)
    while b.deg() != inf:
        _, r = a.euclidien(b)
        if all(zero(c) for c in r.lc):
            a = b
            break
        if r.deg() != inf and r.deg() >= b.deg():
            break
        a = b
        b = r
    if a.deg() != inf:
        lc = a.domcoef()
        if not zero(lc):
            if isinstance(lc, Rational):
                inv = Rational(lc.denominator, lc.numerator)
            else:
                inv = Rational(1, int(round(float(lc))))
            a = a * inv
    return a

class Rationalfraction(Function):
    def __init__(self, P, Q, _simplify=True):
        self.numerator = P if isinstance(P, Polynomial) else Polynomial(P)
        self.denominator = Q if isinstance(Q, Polynomial) else Polynomial(Q)
        if _simplify:
            self._simplify()

    def _simplify(self):
        if self.denominator.deg() == inf:
            return self
        try:
            quotient, remainder = self.numerator.euclidien(self.denominator)
            if all(zero(c) for c in remainder.lc):
                self.numerator = quotient
                self.denominator = Polynomial([1], self.denominator.cst)
                return self
        except Exception as ex:
            pass
        try:
            common = gcd_poly(self.numerator, self.denominator)
            if common.deg() != inf and common.deg() > 0:
                num_q, _ = self.numerator.euclidien(common)
                den_q, _ = self.denominator.euclidien(common)
                lc = den_q.domcoef()
                if not zero(lc):
                    if isinstance(lc, Rational):
                        inv = Rational(lc.denominator, lc.numerator)
                    else:
                        inv = 1 / float(lc)
                    self.numerator = num_q * inv
                    self.denominator = den_q * inv
                else:
                    self.numerator = num_q
                    self.denominator = den_q
        except:
            pass
        return self

    def simplify(self):
        return self._simplify()

    def __str__(self):
        if self.denominator.deg() == 0 and len(self.denominator.lc) == 1:
            d0 = self.denominator.lc[0]
            if (isinstance(d0, Rational) and d0.numerator == d0.denominator) or d0 == 1:
                return str(self.numerator)
        n_s = str(self.numerator) if self.numerator.monomial() else f"({self.numerator})"
        d_s = str(self.denominator) if self.denominator.monomial() else f"({self.denominator})"
        return f"{n_s}/{d_s}"

    def __add__(self, other):
        if isinstance(other, (Scalar, float, Polynomial)) and not isinstance(other, Rationalfraction):
            n = self.numerator + (self.denominator * other)
            d = self.denominator
            return Rationalfraction(n, d)
        n = (self.numerator * other.denominator) + (other.numerator * self.denominator)
        d = self.denominator * other.denominator
        return Rationalfraction(n, d)

    def __sub__(self, other):
        if isinstance(other, (Scalar, float, Polynomial)) and not isinstance(other, Rationalfraction):
            n = self.numerator - (self.denominator * other)
            d = self.denominator
        else:
            n = (self.numerator * other.denominator) - (other.numerator * self.denominator)
            d = self.denominator * other.denominator
        return Rationalfraction(n, d)

    def __mul__(self, other):
        if isinstance(other, (Scalar, float, Polynomial)) and not isinstance(other, Rationalfraction):
            n = self.numerator * other
            d = self.denominator
        else:
            n = self.numerator * other.numerator
            d = self.denominator * other.denominator
        return Rationalfraction(n, d)

    def __truediv__(self, other):
        if isinstance(other, (Scalar, float, Polynomial)) and not isinstance(other, Rationalfraction):
            n = self.numerator
            d = self.denominator * other
        else:
            n = self.numerator * other.denominator
            d = self.denominator * other.numerator
        return Rationalfraction(n, d)

    def derivative(self):
        u, v = self.numerator, self.denominator
        return Rationalfraction(u.derivative() * v - u * v.derivative(), v ** 2)

    def __invert__(self):
        return Rationalfraction(self.denominator, self.numerator)

    def __call__(self, value):
        n_v, d_v = self.numerator(value), self.denominator(value)
        if real(d_v) == 0 and imaginary(d_v) == 0: return inf
        return n_v / d_v

    def __neg__(self):
        P = -self.numerator
        Q = self.denominator
        return Rationalfraction(P,Q)

def lagrange(points):
    n = len(points)

    def _is_numeric(x):
        return isinstance(x, (int, float, Integer, Rational))

    def _to_scalar(x):
        return Integer(x) if isinstance(x, int) else x

    def _scalar_sub(a, b):
        return _to_scalar(a) - _to_scalar(b)

    def _inv(x):
        if isinstance(x, int): return Rational(1, x)
        if isinstance(x, Rational): return Rational(x.denominator, x.numerator)
        if isinstance(x, Integer): return Rational(1, x.int)
        return 1 / x

    def _coef_zero(c):
        return isinstance(c, int) and c == 0 or (isinstance(c, Integer) and c.int == 0)

    def poly_mul_linear(coeffs, xj, scale):
        new_coeffs = [Integer(0)] * (len(coeffs) + 1)
        xj = _to_scalar(xj)
        for k, c in enumerate(coeffs):
            if _coef_zero(c): continue
            sc = scale * c
            new_coeffs[k+1] = _coef_add(new_coeffs[k+1], sc)
            new_coeffs[k]   = _coef_add(new_coeffs[k], _to_scalar(Integer(0) - xj * sc))
        return new_coeffs

    symbolic_x = any(not _is_numeric(p[0]) for p in points)

    if not symbolic_x:
        P = Polynomial([0])
        for i in range(n):
            L = Polynomial([1])
            xi, yi = points[i]
            for j in range(n):
                if i == j: continue
                xj = points[j][0]
                scalar = _inv(_scalar_sub(xi, xj))
                L = L * (Polynomial([-xj, 1]) * scalar)
            P = P + yi * L
        return P

    result = [Integer(0)]
    for i in range(n):
        xi, yi = points[i]
        xi = _to_scalar(xi); yi = _to_scalar(yi)
        L = [Integer(1)]
        for j in range(n):
            if i == j: continue
            xj = _to_scalar(points[j][0])
            diff = _scalar_sub(xi, xj)
            scale = _inv(diff)
            L = poly_mul_linear(L, xj, scale)
        L = [yi * c if not _coef_zero(c) else Integer(0) for c in L]
        max_len = max(len(result), len(L))
        result += [Integer(0)] * (max_len - len(result))
        L      += [Integer(0)] * (max_len - len(L))
        result = [_coef_add(result[k], L[k]) for k in range(max_len)]

    return Polynomial(result)

def polyroots(roots):
    R = list(roots)
    x = Polynomial([0,1])
    P = Polynomial([1])
    for i in R:
        P*=x - i
    return P

class Constant(Scalar):
    def __init__(self, name, value=Integer(0), index = ""):
        self.name = name
        self.index = index
        self.v = value

    def __bool__(self):
        return bool(self.v)

    def __hash__(self):
        return hash((self.name, self.index))

    def __eq__(self, other):
        x = other
        if not isinstance(x, (Constant, Monomialvar, Polynomialvar)):
            return False
        if isinstance(x, Polynomialvar):
            if len(x.t)>1:
                return False
            x = x.t[0]
        if isinstance(x, Monomialvar):
            if len(other.t)>1 or other.coef != 1 or list(other.t.values()) != [1]:
                return False
            x = list(other.t.keys)[0]
        return self.name == other.name and self.index == other.index

    def __add__(self, other):
        if isinstance(other, (float, Scalar)) and not isinstance(other, Constant):
            return Monomialvar(Integer(1), {self: 1}) + other
        return Monomialvar(Integer(1), {self: 1}) + Monomialvar(Integer(1), {other: 1})

    def __radd__(self, other):
        return self.__add__(other)

    def __mul__(self, other):
        if isinstance(other, (float, Scalar)) and not isinstance(other, Constant):
            return Monomialvar(Integer(1), {self: 1}) * other
        return Monomialvar(Integer(1), {self: 1}) * Monomialvar(Integer(1), {other: 1})

    def __rmul__(self, other):
        return self.__mul__(other)

    def __neg__(self):
        return Monomialvar(Integer(-1), {self: 1})

    def __sub__(self, other):
        return self + -other

    def __rsub__(self, other):
        if isinstance(other, (float, Scalar)) and not isinstance(other, Constant):
            return other + -self
        return Monomialvar(Integer(1), {other: 1}) + -self

    def __truediv__(self, other):
        if isinstance(other, (float, Scalar)) and not isinstance(other, Constant):
            return Monomialvar(Integer(1), {self: 1}) / other
        return Monomialvar(Integer(1), {self: 1}) / Monomialvar(Integer(1), {other: 1})

    def __rtruediv__(self, other):
        if isinstance(other, (float, Scalar)) and not isinstance(other, Constant):
            return other / Monomialvar(Integer(1), {self: 1})
        return Monomialvar(Integer(1), {other: 1}) / Monomialvar(Integer(1), {self: 1})

    def __str__(self):
        if not self.index:
            return self.name
        return f"{self.name}_{self.index}"

    def __le__(self, other):
        return self.name <= other.name

    def __lt__(self,other):
        return self.name < other.name

    def __ge__(self, other):
        return self.name >= other.name

    def __gt__(self, other):
        return self.name > other.name

#constants defined

i = C(Integer(0),Integer(1))
pi = Constant(str(Greek("pi")),math.pi) 
e = Constant("e",math.e)
        
class Polynomialvar(Scalar):
    @staticmethod
    def _make(sorted_terms):
        """Fast internal constructor — terms already sorted and combined, skip sort()."""
        obj = object.__new__(Polynomialvar)
        obj.t = sorted_terms
        return obj

    def __init__(self, t: list):
        cleaned = []
        for item in t:
            if isinstance(item, Monomialvar):
                cleaned.append(item)
            elif isinstance(item, (Scalar, float)) and not isinstance(item, (Polynomialvar, Monomialvar, Rationalfractionvar)):
                cleaned.append(Monomialvar(item, {}))
            else:
                cleaned.append(item)
        self.t = cleaned
        self.sort()

    def __iter__(self):
        return iter(self.t)

    def sort(self):
        self.t = [term for term in self.t if isinstance(term, Monomialvar)]
        # Combine like terms (same variable pattern)
        combined = {}
        for term in self.t:
            key = tuple(sorted((v.name, e) for v, e in term.t.items()))
            if key in combined:
                combined[key] = Monomialvar(_coef_add(combined[key].c, term.c), dict(term.t))
            else:
                combined[key] = term
        # Filter zero coefficients and sort ascending by lex (leading term last)
        self.t = sorted(
            (term for term in combined.values() if not zero(term.c)),
            key=lambda m: m.lex()
        )
        return self

    def __neg__(self):
        neg_self = Polynomialvar([Monomialvar(-t.c, t.t) for t in self.t])
        return neg_self

    def __add__(self, other):
        if isinstance(other, (Scalar, float, int)) and not isinstance(other, (Polynomialvar, Monomialvar, Rationalfractionvar)):
            other = Polynomialvar([Monomialvar(other, {})])
        elif isinstance(other, Monomialvar):
            other = Polynomialvar([other])
        elif not isinstance(other, Polynomialvar):
            return NotImplemented
        all_t = self.t + other.t
        combined = {}
        for term in all_t:
            key = tuple(sorted(term.t.items()))
            if key in combined:
                combined[key] = Monomialvar(_coef_add(combined[key].c, term.c), dict(key))
            else:
                combined[key] = term
        filtered = [t for t in combined.values() if t.c != 0]
        return Polynomialvar(filtered)

    def __radd__(self, other):
        return self.__add__(other)

    def __mul__(self, other):
        if isinstance(other, int):
            other = Integer(other)
        if isinstance(other, (Scalar, float)) and not isinstance(other, (Polynomialvar, Monomialvar, Rationalfractionvar)):
            new_t = [Monomialvar(term.c * other, term.t) for term in self.t]
            return Polynomialvar(new_t)
        if isinstance(other, Monomialvar):
            other = Polynomialvar([other])
        if hasattr(other, 'null') and callable(other.null) and hasattr(other, 'numerator') and hasattr(other, 'denominator') and not hasattr(other, 'lc'):
            return Rationalfractionvar(self * other.numerator, other.denominator)
        if not isinstance(other, Polynomialvar):
            return NotImplemented
        result_t = []
        for t1 in self.t:
            for t2 in other.t:
                result_t.append(t1 * t2)
        # Use _make + sort instead of full constructor to avoid double-sort
        p = Polynomialvar._make(result_t)
        p.sort()
        return p

    def __rmul__(self, other):
        return self.__mul__(other)

    def __sub__(self, other):
        return self + -other

    def __rsub__(self, other):
        return other + -self

    def __pow__(self, exp):
        if exp == 0:
            return Polynomialvar([Monomialvar(1, {})])
        result = self
        for _ in range(1, exp):
            result = result * self
        return result

    def __str__(self):
        if not self.t:
            return "0"
        s = ""
        for term in self.t:
            term_str = str(term)
            if term_str.startswith('-'):
                s += term_str
            else:
                if s:
                    s += "+"
                s += term_str
        return s if s else "0"

    def __repr__(self):
        return self.__str__()

    def null(self):
        for i in self.t:
            if i.null() == False:
                return False
        return True

    def constant(self):
        for i in self.t:
            if i.constant() == False:
                return False
        return True

    def identity(self):
        for i in self.t:
            if i.identity() == False:
                return False
        return True

    def to_polynomial(self, denominator):
        L = list()
        if not denominator.constant():
            return None
        v = denominator.t[0].c
        for term in self.t:
            L.append(Monomialvar(term.c / v, term.t))
        return Polynomialvar(L)

    def __truediv__(self, other):
        # P / (N/D) = (P * D) / N — must come before the Scalar check since RFV is a Scalar
        if isinstance(other, Rationalfractionvar):
            return Rationalfractionvar(self * other.denominator, other.numerator)
        # Divide by a plain scalar (Integer/Rational/C/float): scale each term's coefficient
        if isinstance(other, (int, float)) or (isinstance(other, Scalar) and not isinstance(other, (Polynomialvar, Monomialvar, Rationalfractionvar))):
            L = []
            for i in self.t:
                L.append(i / other)
            return Polynomialvar(L)
        if isinstance(other, Monomialvar):
            other = Polynomialvar([other])
        # Polynomialvar / Polynomialvar → single Rationalfractionvar, never split term-by-term
        return Rationalfractionvar(self, other)

    def __rtruediv__(self, other):
        if isinstance(other,(Scalar,int,float)):
            P = Monomialvar(other,{})
            Q = Polynomialvar([P])
            return Rationalfractionvar(Q,self)
        if isinstance(other, Monomialvar):
            other = Polynomialvar([other])
        return Rationalfractionvar(other if isinstance(other, Polynomialvar) else _as_polyvar(other), self)

    def euclidien(self, other):
        if other.null():
            raise ZeroDivisionError("Division by zero polynomial")
        if self.null():
            return Polynomialvar._make([]), Polynomialvar._make([])
        # Guard: if either polynomial has non-scalar (RFV/Monomialvar/Polynomialvar)
        # coefficients, euclidien cannot work correctly — return (0, self) meaning
        # "no division possible, entire self is remainder"
        def _has_nonscalar_coef(poly):
            return any(isinstance(m.c, (Polynomialvar, Monomialvar, Rationalfractionvar))
                       for m in poly.t)
        if _has_nonscalar_coef(self) or _has_nonscalar_coef(other):
            return Polynomialvar._make([]), Polynomialvar._make(list(self.t))

        def _combine(terms):
            """Combine like terms and sort — all inline, no Polynomialvar() calls."""
            combined = {}
            for m in terms:
                key = tuple(sorted((v.name, e) for v, e in m.t.items()))
                if key in combined:
                    nc = _coef_add(combined[key].c, m.c)
                    combined[key] = Monomialvar(nc, dict(m.t))
                else:
                    combined[key] = m
            result = [m for m in combined.values() if not zero(m.c)]
            result.sort(key=lambda m: m.lex())
            return result

        A = list(self.t)   # sorted: leading term last
        B = other.t        # sorted: leading term last
        Q_terms = []
        R_terms = []

        while A:
            LT_A = A[-1]
            LT_B = B[-1]

            # Divisibility: every var in LT_B must appear in LT_A with >= exponent
            if not all(LT_A.t.get(var, 0) >= exp_b for var, exp_b in LT_B.t.items()):
                R_terms.append(LT_A); A.pop(); continue

            ca, cb = LT_A.c, LT_B.c
            # Coefficients must be plain scalars
            if isinstance(ca, (Polynomialvar, Monomialvar, Rationalfractionvar)) or \
               isinstance(cb, (Polynomialvar, Monomialvar, Rationalfractionvar)):
                R_terms.append(LT_A); A.pop(); continue

            coef_ratio = ca / cb
            if zero(coef_ratio):
                R_terms.append(LT_A); A.pop(); continue

            exp_diff = {var: LT_A.t.get(var, 0) - exp_b for var, exp_b in LT_B.t.items()}
            for var in LT_A.t:
                if var not in LT_B.t:
                    exp_diff[var] = LT_A.t[var]
            exp_diff = {v: e for v, e in exp_diff.items() if e != 0}

            T = Monomialvar(coef_ratio, exp_diff)
            old_lt_lex = LT_A.lex()

            # Compute T*B inline — no Polynomialvar construction
            product = []
            for bt in B:
                nc = T.c * bt.c
                if zero(nc): continue
                nt = dict(T.t)
                for v, e in bt.t.items():
                    nt[v] = nt.get(v, 0) + e
                nt = {v: e for v, e in nt.items() if e != 0}
                product.append(Monomialvar(nc, nt))

            # A - product: negate product terms and combine
            neg_product = [Monomialvar(-m.c, m.t) for m in product]
            new_A = _combine(A + neg_product)

            # Termination guarantee: leading term must strictly decrease
            if new_A and new_A[-1].lex() >= old_lt_lex:
                R_terms.append(LT_A); A.pop()
            else:
                Q_terms.append(T)
                A = new_A

        return Polynomialvar._make(_combine(Q_terms)), Polynomialvar._make(_combine(R_terms))

    def __floordiv__(self, other):
        return self.euclidien(other)[0]

    def __mod__(self, other):
        return self.euclidien(other)[1]

    def exact_div(self, other):
        if self.null():
            return Polynomialvar([])
        if other.null():
            return None
        q, r = self.euclidien(other)
        if r.null():
            return q
        return None

    def __neg__(self):
        return Polynomialvar([Monomialvar(-t.c, t.t) for t in self.t])

    def __bool__(self):
        return not self.null()

    def __eq__(self, value):
        x = self - value
        return not bool(x)

class Monomialvar(Scalar):
    def __new__(cls, coef, t):
        # If coef is a multi-term Polynomialvar, expand: (p1+p2+...)*x^e = p1*x^e + p2*x^e + ...
        # We can't store a polynomial as a coefficient — return a Polynomialvar instead.
        if isinstance(coef, Polynomialvar) and len(coef.t) > 1 and not coef.null():
            terms = [Monomialvar(term.c, {**term.t, **{var: term.t.get(var,0)+exp for var,exp in t.items()}})
                     for term in coef.t]
            # Actually simpler: multiply each scalar-coef monomial by the variable part
            var_mono = object.__new__(cls)
            var_mono.c = Integer(1)
            var_mono.t = {var: exp for var, exp in t.items() if exp != 0}
            expanded = [Monomialvar(term.c, {**term.t, **{var: term.t.get(var,0) + (t.get(var,0)) for var in t}})
                        for term in coef.t]
            result = Polynomialvar(expanded)
            return result
        return super().__new__(cls)

    def __init__(self, coef, t):
        if isinstance(self, Polynomialvar):
            return  # __new__ returned a Polynomialvar, skip __init__
        if isinstance(coef, Polynomialvar):
            if len(coef.t) == 1 and coef.t[0].constant():
                coef = coef.t[0].c
            elif coef.null():
                coef = 0
        if isinstance(coef, Monomialvar):
            merged_t = {var: exp for var, exp in coef.t.items()}
            for var, exp in t.items():
                if exp != 0:
                    merged_t[var] = merged_t.get(var, 0) + exp
            t = merged_t
            coef = coef.c
        if isinstance(coef, Rationalfractionvar):
            if coef.denominator.constant() and coef.numerator.constant():
                n = coef.numerator.t[0].c if coef.numerator.t else Integer(0)
                d = coef.denominator.t[0].c if coef.denominator.t else Integer(1)
                coef = n / d
            elif coef.denominator.constant():
                d = coef.denominator.t[0].c if coef.denominator.t else Integer(1)
                new_terms = [Monomialvar(m.c / d, m.t) for m in coef.numerator.t]
                pv = Polynomialvar(new_terms)
                if len(pv.t) == 1 and not pv.t[0].t:
                    coef = pv.t[0].c
                else:
                    coef = pv
        self.c = Integer(coef) if hasattr(coef, 'is_integer') and coef.is_integer() else coef
        self.t = {var: exp for var, exp in t.items() if exp != 0 and not zero(exp)}

    def __add__(self, other):
        if isinstance(other, Polynomialvar):
            return Polynomialvar([self] + list(other.t))
        if isinstance(other, Monomialvar):
            return Polynomialvar([self, other])
        if isinstance(other, (Scalar, float, int)) and not isinstance(other, (Polynomialvar, Monomialvar, Rationalfractionvar)):
            return Polynomialvar([self, Monomialvar(other, {})])
        return NotImplemented

    def __radd__(self, other):
        if isinstance(other, Polynomialvar):
            return Polynomialvar(list(other.t) + [self])
        if isinstance(other, (Scalar, float)) and not isinstance(other, (Polynomialvar, Monomialvar, Rationalfractionvar)):
            return Polynomialvar([Monomialvar(other, {}), self])
        return self.__add__(other)

    def __neg__(self):
        return Monomialvar(-self.c,self.t)

    def __bool__(self):
        return bool(self.c)

    def __sub__(self, other):
        return self + -other

    def __truediv__(self, other):
        if isinstance(other, (Scalar, float,int)) and not isinstance(other, (Polynomialvar, Monomialvar, Rationalfractionvar)):
            return Monomialvar(self.c / other, self.t)
        if isinstance(other, Rationalfractionvar):
            # M / (N/D) = (M * D) / N
            self_pv = Polynomialvar([self])
            return Rationalfractionvar(self_pv * other.denominator, other.numerator)
        if isinstance(other, Monomialvar):
            return Rationalfractionvar(Polynomialvar([self]), Polynomialvar([other]))
        return NotImplemented

    def __rtruediv__(self, other):
        if isinstance(other, (Scalar, float,int)) and not isinstance(other, (Polynomialvar, Monomialvar, Rationalfractionvar)):
            return Rationalfractionvar(Integer(1),Polynomialvar([self]))
        if isinstance(other, Rationalfractionvar):
            # M / (N/D) = (M * D) / N
            self_pv = Polynomialvar([self])
            return Rationalfractionvar(other.numerator, self_pv * other.denominator)
        if isinstance(other, Monomialvar):
            return Rationalfractionvar(Polynomialvar([other]), Polynomialvar([self]))
        return NotImplemented

    def __rsub__(self, other):
        # other - self, not self - other
        return (-self).__add__(other)

    def __mul__(self, other):
        if isinstance(other, int):  # FIX (Dido): 2*a and a*2 with a plain int raised TypeError
            other = Integer(other)
        if isinstance(other, (Scalar, float)) and not isinstance(other, (Polynomialvar, Monomialvar, Rationalfractionvar)):
            return Monomialvar(self.c * other, self.t.copy())
        if hasattr(other, 'null') and callable(other.null) and hasattr(other, 'numerator') and hasattr(other, 'denominator') and not hasattr(other, 'lc'):
            self_pv = Polynomialvar([Monomialvar(self.c, self.t.copy())])
            return Rationalfractionvar(self_pv * other.numerator, other.denominator)
        if not isinstance(other, Monomialvar):
            return NotImplemented
        c = self.c * other.c
        t = self.t.copy()
        for var, exp in other.t.items():
            t[var] = t.get(var, 0) + exp
        return Monomialvar(c, t)

    def __rmul__(self, other):
        return self.__mul__(other)

    def __pow__(self, exponent):
        if exponent == 0:
            return Monomialvar(1, {})
        if exponent == 1:
            return self
        t = {var: exp * exponent for var, exp in self.t.items()}
        c = self.c ** exponent
        return Monomialvar(c, t)

    def __str__(self):
        if self.null():
            return "0"
        elif self.constant():
            return str(self.c)
        terms = {}
        for const in self.t:
            terms[const.name] = self.t[const]
        s = delete(self.c)
        for var in order:
            if var in terms:
                exp = terms[var]
                if exp == 1:
                    s += var
                elif exp > 1:
                    sup = str(exp).translate(superscripts)
                    s += var + sup
        return s

    def __repr__(self):
        return self.__str__()

    def null(self):
        return self.c==0

    def constant(self):
        return self.t == {}

    def identity(self):
        return self.constant() and self.c == 1

    def lex(self):
        # Cache the lex key — Monomialvar is immutable after construction
        try:
            return self._lex_cache
        except AttributeError:
            pass
        deg = sum(self.t.values())
        L = [0] * (len(order) + 1)
        L[0] = deg
        for var, exp in self.t.items():
            i = order_index.get(var.name, -1)
            if i >= 0:
                L[i + 1] = exp
        self._lex_cache = L
        return L

    def __neg__(self):
        return Monomialvar(-self.c, self.t.copy())

    def __eq__(self, other):
        if isinstance(other, Monomialvar):
            return self.c == other.c and self.t == other.t
        if self.constant():
            return self.c == other
        return NotImplemented

    def __hash__(self):
        return hash((self.c, tuple(sorted(self.t.items()))))

    def __bool__(self):
        return not self.null()

def gcd_polyvar(a_in, b_in):
    a_in = Polynomialvar(a_in.t.copy())
    b_in = Polynomialvar(b_in.t.copy())
    if a_in.null(): return b_in if not b_in.null() else Polynomialvar([Monomialvar(1,{})])
    if b_in.null(): return a_in if not a_in.null() else Polynomialvar([Monomialvar(1,{})])

    all_vars = set(v for m in a_in.t + b_in.t for v in m.t)
    if not all_vars:
        return Polynomialvar([Monomialvar(1,{})])

    def deg_in(poly, var):
        return max((m.t.get(var,0) for m in poly.t), default=0)

    # Step 0: extract common monomial factor
    all_vars_ab = set(v for m in a_in.t + b_in.t for v in m.t)
    mono_gcd = {}
    for var in all_vars_ab:
        min_exp = min(m.t.get(var,0) for m in a_in.t + b_in.t)
        if min_exp > 0:
            mono_gcd[var] = min_exp
    from math import gcd as _igcd
    from functools import reduce
    nums = [abs(int(m.c)) for m in a_in.t + b_in.t
            if isinstance(m.c,(int,Integer)) and int(m.c)!=0]
    coef_gcd = reduce(_igcd, nums, 0) if nums else 1
    if mono_gcd or coef_gcd > 1:
        def _strip(poly):
            new_t = []
            for m in poly.t:
                new_exp = {v: m.t.get(v,0)-mono_gcd.get(v,0)
                           for v in set(list(m.t)+list(mono_gcd))}
                new_exp = {v:e for v,e in new_exp.items() if e!=0}
                new_c = m.c/coef_gcd if coef_gcd>1 else m.c
                new_t.append(Monomialvar(new_c, new_exp))
            return Polynomialvar(new_t)
        a = _strip(a_in); b = _strip(b_in)
        mono_factor = Polynomialvar([Monomialvar(coef_gcd if coef_gcd>1 else 1, mono_gcd)])
        if a.null() or b.null():
            return mono_factor
    else:
        a = Polynomialvar(a_in.t.copy())
        b = Polynomialvar(b_in.t.copy())
        mono_factor = Polynomialvar([Monomialvar(1,{})])

    def _divides(g, p):
        if g.null(): return False
        if g.identity(): return True
        _, r = p.euclidien(g)
        return r.null()

    def _normalize(poly):
        if not poly.t: return poly
        lc = poly.t[-1].c
        if lc != 1 and isinstance(lc,(int,Integer,Rational)) and not isinstance(lc,bool):
            try: return Polynomialvar([Monomialvar(t.c/lc,t.t) for t in poly.t])
            except: pass
        return poly

    def _mul_mono(poly, mono_poly):
        if mono_poly.identity(): return poly
        rt = []
        for tm in poly.t:
            for mf in mono_poly.t:
                nc = tm.c*mf.c
                nt = dict(tm.t)
                for v,e in mf.t.items(): nt[v] = nt.get(v,0)+e
                nt = {v:e for v,e in nt.items() if e!=0}
                rt.append(Monomialvar(nc,nt))
        return Polynomialvar(rt)

    def pseudo_rem(A, B, var):
        dA = deg_in(A, var); dB = deg_in(B, var)
        if dB == 0 or dA < dB: return A
        lc_terms = [Monomialvar(m.c,{v:e for v,e in m.t.items() if v!=var})
                    for m in B.t if m.t.get(var,0)==dB]
        lc_B = Polynomialvar(lc_terms) if lc_terms else Polynomialvar([])
        if lc_B.null(): return A
        new_terms = list(A.t); scale_t = list(lc_B.t)
        for _ in range(dA-dB+1):
            scaled = []
            for ta in new_terms:
                for ts in scale_t:
                    nc=ta.c*ts.c; nt=dict(ta.t)
                    for v,e in ts.t.items(): nt[v]=nt.get(v,0)+e
                    nt={v:e for v,e in nt.items() if e!=0}
                    scaled.append(Monomialvar(nc,nt))
            new_terms = list(Polynomialvar(scaled).t)
        _, r = Polynomialvar(new_terms).euclidien(B)
        if r.null(): return r
        other_vars = set(v for m in r.t for v in m.t)-{var}
        if other_vars:
            min_exps={v:min(m.t.get(v,0) for m in r.t) for v in other_vars}
            min_exps={v:e for v,e in min_exps.items() if e>0}
            if min_exps:
                stripped=[]
                for m in r.t:
                    ne={v:m.t.get(v,0)-min_exps.get(v,0) for v in set(list(m.t)+list(min_exps))}
                    ne={v:e for v,e in ne.items() if e!=0}
                    stripped.append(Monomialvar(m.c,ne))
                r=Polynomialvar(stripped)
        return r

    def _run_prs(a0, b0, var):
        """Run pseudo-PRS for a0,b0 in variable var. Returns GCD candidate (not yet normalized)."""
        a_,b_ = Polynomialvar(a0.t.copy()), Polynomialvar(b0.t.copy())
        guard=0; seen=set()
        while not b_.null():
            guard+=1
            if guard>128: return Polynomialvar([Monomialvar(1,{})])
            key=(str(a_),str(b_))
            if key in seen: return Polynomialvar([Monomialvar(1,{})])
            seen.add(key)
            r=pseudo_rem(a_,b_,var)
            if r.null(): break
            dR=deg_in(r,var); dB=deg_in(b_,var)
            if dR>=dB: return Polynomialvar([Monomialvar(1,{})])
            a_=b_; b_=r
        return _normalize(b_) if not b_.null() else _normalize(a_)

    # Try each variable as main variable, keep best result that divides both
    candidates = []
    all_vars2 = set(v for m in a.t+b.t for v in m.t)
    for try_var in sorted(all_vars2, key=lambda v: v.name):
        if deg_in(a, try_var)==0 and deg_in(b, try_var)==0:
            continue
        if deg_in(a, try_var)==0 or deg_in(b, try_var)==0:
            continue  # skip vars not in both
        cand = _run_prs(a, b, try_var)
        if not cand.null() and not cand.identity():
            # Verify it divides both
            if _divides(cand, a) and _divides(cand, b):
                candidates.append(cand)

    if candidates:
        # Pick the GCD with the most terms (highest degree = most common factor)
        best = max(candidates, key=lambda p: (sum(sum(e for e in m.t.values()) for m in p.t), len(p.t)))
        return _mul_mono(best, mono_factor)
    return mono_factor


def _rfv_try_exact_quotient(P1, P2):
    """Return quotient Polynomialvar if P1 is exactly divisible by P2, else None."""
    if P2.null():
        return None
    q, r = P1.euclidien(P2)
    if r.null():
        return q
    return None


def _rfv_termwise_quotient(P1, P2):
    """If P1 = q * P2 and both share the same monomial pattern, return q."""
    if P2.null() or len(P1.t) != len(P2.t):
        return None
    ratio = None
    for m1, m2 in zip(P1.t, P2.t):
        if m1.t != m2.t:
            return None
        if zero(m2.c):
            return None
        r = _divide_leading_coeff(m1.c, m2.c)
        if ratio is None:
            ratio = r
        elif str(r) != str(ratio) and not zero(_coef_sub(r, ratio)):
            return None
    if ratio is None:
        return None
    if isinstance(ratio, (Monomialvar, Integer, Rational, int, float)):
        return ratio
    pv = _as_polyvar(ratio)
    if pv.null():
        return Polynomialvar([Monomialvar(0, {})])
    return _scalar_from_polyvar(pv)


def _rfv_cancel_gcd(P1, P2):
    """Cancel common polynomial factors; return (quotient_or_none, P1, P2, changed)."""
    common = gcd_polyvar(P1, P2)
    if common.identity():
        return None, P1, P2, False
    P1 = P1 // common
    P2 = P2 // common
    if P2.null():
        raise ZeroDivisionError("Denominator reduced to zero")
    if P2.identity():
        return P1, P1, P2, True
    if P2.constant() and P2.t:
        v = P2.t[0].c
        return Polynomialvar([Monomialvar(t.c / v, t.t) for t in P1.t]), P1, P2, True
    twq = _rfv_termwise_quotient(P1, P2)
    if twq is not None:
        return twq, P1, P2, True
    q = _rfv_try_exact_quotient(P1, P2)
    if q is not None:
        return q, P1, P2, True
    return None, P1, P2, True





class Rationalfractionvar(Scalar):
    def __new__(cls, P1, P2):
        if isinstance(P1, Monomialvar):
            P1 = Polynomialvar([P1])
        elif not isinstance(P1, Polynomialvar):
            P1 = _as_polyvar(P1)
        if isinstance(P2, Monomialvar):
            P2 = Polynomialvar([P2])
        elif not isinstance(P2, Polynomialvar):
            P2 = _as_polyvar(P2)
        if P2.null():
            raise ZeroDivisionError("Denominator cannot be zero")
        # Fast path: P1 is zero
        if P1.null():
            return Polynomialvar([Monomialvar(0, {})])
        # Fast path: identical numerator and denominator → result is 1
        if str(P1) == str(P2):
            return Polynomialvar([Monomialvar(1, {})])
        # Check if P1 = -P2 → result is -1
        neg_P2 = Polynomialvar([Monomialvar(-t.c, t.t) for t in P2.t])
        if str(P1) == str(neg_P2):
            return Polynomialvar([Monomialvar(-1, {})])
        # Scalar denominator: just divide each coefficient
        if P2.constant() and P2.t:
            v = P2.t[0].c
            new_t = [Monomialvar(term.c / v, term.t) for term in P1.t]
            return Polynomialvar(new_t)
        # Step 1: cancel common monomial factor from all terms of P1 and P2
        # e.g. (6a²b + 4ab²) / (2ab) → (3a + 2b) / 1
        all_vars = set(v for m in P1.t + P2.t for v in m.t)
        mono_gcd = {}
        for var in all_vars:
            min_exp = min(m.t.get(var, 0) for m in P1.t + P2.t)
            if min_exp > 0:
                mono_gcd[var] = min_exp
        from math import gcd as _gcd
        from functools import reduce
        coef_gcd = reduce(_gcd, [abs(int(m.c)) if hasattr(m.c, '__int__') and not isinstance(m.c, float)
                                  else 1 for m in P1.t + P2.t], 0)
        if mono_gcd or coef_gcd > 1:
            def _cancel(poly, mono, cg):
                new_t = []
                for m in poly.t:
                    new_exp = {v: m.t.get(v,0)-mono.get(v,0) for v in set(list(m.t)+list(mono))}
                    new_exp = {v: e for v,e in new_exp.items() if e != 0}
                    new_c = m.c / cg if cg > 1 else m.c
                    new_t.append(Monomialvar(new_c, new_exp))
                return Polynomialvar(new_t)
            P1 = _cancel(P1, mono_gcd, coef_gcd)
            P2 = _cancel(P2, mono_gcd, coef_gcd)
            if P2.identity():
                return P1
            if P2.constant() and P2.t:
                v = P2.t[0].c
                return Polynomialvar([Monomialvar(t.c/v, t.t) for t in P1.t])

        # Step 2: term-wise quotient when numerator/denominator share monomial pattern
        twq = _rfv_termwise_quotient(P1, P2)
        if twq is not None:
            if isinstance(twq, Polynomialvar):
                if twq.null():
                    return Polynomialvar([Monomialvar(0, {})])
                return _scalar_from_polyvar(twq)
            return twq

        # Step 3: try exact polynomial division via euclidien
        q = _rfv_try_exact_quotient(P1, P2)
        if q is not None:
            if q.null():
                return Polynomialvar([Monomialvar(0, {})])
            return _scalar_from_polyvar(q)

        # Step 4: try to find common polynomial factor by peeling off single variables
        # Pattern: num = k*v1, den = k*v2 → result = v1/v2
        # where k is a polynomial and v1, v2 are single-variable monomials
        all_vars_p1 = set(v for m in P1.t for v in m.t)
        all_vars_p2 = set(v for m in P2.t for v in m.t)
        for var1 in sorted(all_vars_p1, key=lambda v: v.name):
            pv_v1 = Polynomialvar([Monomialvar(1, {var1: 1})])
            k1, r1 = P1.euclidien(pv_v1)
            if not r1.null() or k1.null():
                continue
            # P1 = k1 * var1; check if P2 = k1 * var2 for some var2
            for var2 in sorted(all_vars_p2, key=lambda v: v.name):
                pv_v2 = Polynomialvar([Monomialvar(1, {var2: 1})])
                k2, r2 = P2.euclidien(pv_v2)
                if not r2.null() or k2.null():
                    continue
                # Both divide: check if k1 == k2
                if str(k1) == str(k2):
                    # num/den = var1/var2 — build without recursing into __new__
                    instance = super().__new__(cls)
                    instance.numerator = pv_v1
                    instance.denominator = pv_v2
                    return instance

        # Step 5: multivariate GCD cancellation, then retry exact division
        reduced, P1, P2, gcd_changed = _rfv_cancel_gcd(P1, P2)
        if reduced is not None:
            if isinstance(reduced, Polynomialvar):
                if reduced.null():
                    return Polynomialvar([Monomialvar(0, {})])
                return _scalar_from_polyvar(reduced)
            return reduced
        if gcd_changed:
            return Rationalfractionvar(P1, P2)
        if P2.constant() and P2.null():
            raise ZeroDivisionError("Denominator reduced to zero")
        instance = super().__new__(cls)
        instance.numerator = P1
        instance.denominator = P2
        return instance

    @staticmethod
    def _make_rfv(pv):
        """Wrap a Polynomialvar as a Rationalfractionvar without invoking __new__ simplification."""
        rfv = object.__new__(Rationalfractionvar)
        rfv.numerator = pv if isinstance(pv, Polynomialvar) else _as_polyvar(pv)
        rfv.denominator = Polynomialvar([Monomialvar(1, {})])
        return rfv

    def simplify(self):
        """Re-run cancellation / exact-division simplification on this fraction."""
        return Rationalfractionvar(self.numerator, self.denominator)

    def _coerce(self, other):
        """Coerce other to Rationalfractionvar if needed, bypassing __new__ simplification."""
        if isinstance(other, Rationalfractionvar):
            return other
        if isinstance(other, Polynomialvar):
            return Rationalfractionvar._make_rfv(other)
        if isinstance(other, Monomialvar):
            return Rationalfractionvar._make_rfv(Polynomialvar([other]))
        if isinstance(other, int):
            return Rationalfractionvar._make_rfv(Polynomialvar([Monomialvar(Integer(other), {})]))
        if isinstance(other, (Scalar, float)) and not isinstance(other, (Polynomialvar, Monomialvar, Rationalfractionvar)):
            return Rationalfractionvar._make_rfv(Polynomialvar([Monomialvar(other, {})]))
        return NotImplemented

    def __add__(self, other):
        other = self._coerce(other)
        if other is NotImplemented:
            return NotImplemented
        num_terms = (self.numerator * other.denominator).t + (other.numerator * self.denominator).t
        num = Polynomialvar(num_terms)
        den = self.denominator * other.denominator
        return Rationalfractionvar(num, den)

    def __radd__(self, other):
        other = self._coerce(other)
        if other is NotImplemented:
            return NotImplemented
        return other.__add__(self)

    def __mul__(self, other):
        other = self._coerce(other)
        if other is NotImplemented:
            return NotImplemented
        num = self.numerator * other.numerator
        den = self.denominator * other.denominator
        return Rationalfractionvar(num, den)

    def __rmul__(self, other):
        other = self._coerce(other)
        if other is NotImplemented:
            return NotImplemented
        return other.__mul__(self)

    def __truediv__(self, other):
        if isinstance(other, (Scalar,float,int)):
            Q = self.denominator
            Q *= other
            return Rationalfractionvar(self.numerator,Q)
        other = self._coerce(other)
        if other is NotImplemented:
            return NotImplemented
        num = self.numerator * other.denominator
        den = other.numerator * self.denominator
        return Rationalfractionvar(num, den)

    def __rtruediv__(self, other):
        if isinstance(other, (Scalar,float,int)):
            Q = self.denominator
            Q *= other
            return Rationalfractionvar(Q,self.numerator)
        other = self._coerce(other)
        if other is NotImplemented:
            return NotImplemented
        return other.__truediv__(self)

    def __sub__(self, other):
        other = self._coerce(other)
        if other is NotImplemented:
            return NotImplemented
        num = self.numerator * other.denominator - other.numerator * self.denominator
        den = self.denominator * other.denominator
        return Rationalfractionvar(num, den)

    def __rsub__(self, other):
        other = self._coerce(other)
        if other is NotImplemented:
            return NotImplemented
        return other.__sub__(self)

    def __neg__(self):
        neg_num = Polynomialvar([Monomialvar(-t.c, t.t) for t in self.numerator.t])
        rfv = object.__new__(Rationalfractionvar)
        rfv.numerator = neg_num
        rfv.denominator = self.denominator
        return rfv

    def __pow__(self, exp):
        num = self.numerator ** exp
        den = self.denominator ** exp
        return Rationalfractionvar(num, den)

    def __str__(self):
        n = len(self.numerator.t)
        d = len(self.denominator.t)
        if n == 0:
            return "0"
        if n > 1:
            a = f"({str(self.numerator)})"
        else:
            a = str(self.numerator)
        # Parenthesize denominator if multi-term OR single monomial with coefficient ≠ ±1
        needs_parens = d > 1
        if not needs_parens and d == 1:
            dm = self.denominator.t[0]
            c = dm.c
            c_val = c.int if isinstance(c, Integer) else (c.numerator/c.denominator if isinstance(c, Rational) else None)
            if c_val is not None and abs(c_val) != 1:
                needs_parens = True
        b = f"({str(self.denominator)})" if needs_parens else str(self.denominator)
        return f"{a}/{b}"

    def null(self):
        return self.numerator.null()

    def __bool__(self):
        return not self.null()

class Vector(Vectorspace):
    def __init__(self, components):
        l = []
        for item in components:
            if type(item) is int:
                l.append(Integer(item))
            elif type(item) is float and item.is_integer():
                l.append(Integer(int(item)))
            else:
                l.append(item)
        self.c = l

    def __len__(self):
        return len(self.c)

    def __getitem__(self,i):
        return self.c[i]

    def __setitem__(self, index, value):
        self.c[index] = value

    def __iter__(self):
        for component in self.c:
            yield component

    def __add__(self, other):
        if len(self) != len(other):
            raise TypeError("Vectors of different dimensions")
        l = [Integer(0)] * len(self)
        for i in range(len(self)):
            l[i] = self[i] + other[i]
        return Vector(l)

    def __neg__(self):
        l=[-i for i in self.c]
        return Vector(l)

    def __sub__(self,other):
        return self+-other

    def __rsub__(self,other):
        return -self+other  # FIX (Dido): computed self - other instead of other - self

    def __mul__(self, other):
        if isinstance(other, int):  # FIX (Dido): plain ints returned None
            other = Integer(other)
        if isinstance(other, (Scalar, float, Polynomial)):
            return Vector([other * i for i in self.c])
        return NotImplemented

    def __rmul__(self, other):
        return self.__mul__(other)

    def __str__(self):
        s=""
        for i in self.c:
            s+=","+str(i)
        return("("+s[1:]+")")

    def dot(self, other):
        if len(self) != len(other):
            raise TypeError("Vectors of different dimensions")
        s = Integer(0)
        for i in range(len(self)):
            s = s + self[i] * other[i]
        return s

    def __repr__(self):
            return self.__str__()

    def __eq__(self, other):
        if not isinstance(other,Vectorspace):
            return False
        if len(self)!=len(other):
            return False
        for i,j in zip(self,other):
            if i!=j:
                return False
        return True

    def __ne__(self,other):
        return not(self.__eq__(other))

    def __hash__(self):
        return super().__hash__()

    def __bool__(self):
        if not(self.c):
            return False
        for i in self:
            if i:
                return True
        return False

class Matrix(Vectorspace):
    def __init__(self, columns):
        self.columns = [
            Vector(c) if not isinstance(c, Vector) else c for c in columns
        ]
        dim = len(self.columns[0])
        for i in self.columns:
            if len(i) != dim:
                raise TypeError("All columns must be of the same dimension")

    def __getitem__(self, i):
        return self.columns[i]

    def __iter__(self):
        for vect in self.columns:
            yield vect

    def dim(self):
        return (len(self.columns[0]), len(self.columns))

    def __len__(self):
        return self.dim()[0] * self.dim()[1]

    @staticmethod
    def null_matrix(rows, cols):
        return Matrix([[Integer(0)] * rows for _ in range(cols)])

    def __add__(self, other):
        if self.dim() != other.dim():
            raise TypeError("Matrices must be of the same dimensions")
        M = list()
        for V, U in zip(self.columns, other.columns):
            M.append(V + U) 
        return Matrix(M)

    def __neg__(self):
            return Matrix([-col for col in self])

    def __sub__(self, other):
        return self + -other

    def __rsub__(self, other):
        return other + -self

    def rows(self):
        M = list()
        for i in range(self.dim()[0]):
            R = list()
            for V in self.columns:
                R.append(V[i])
            M.append(Vector(R))
        return M

    def __mul__(self, other):
        if isinstance(other, int):  # FIX (Dido): allow plain ints, e.g. 2*A
            other = Integer(other)
        if isinstance(other, (Scalar, float, Polynomial)):
            return Matrix([V * other for V in self.columns])
            
        is_vec = isinstance(other, Vector)
        M1 = Matrix([other]) if is_vec else other
        
        if hasattr(M1, 'dim'):
            if self.dim()[1] != M1.dim()[0]:
                raise TypeError("The first matrix should have as many columns as the second matrix has rows")
                
            n = self.dim()[0]
            m = M1.dim()[1]
            M = Matrix.null_matrix(n, m)  
            rows = self.rows()
            col = M1.columns
            
            for j in range(m):
                l = []
                for i in range(n):
                    l.append(rows[i].dot(col[j]))
                M.columns[j] = Vector(l)              
                
            return M.columns[0] if is_vec else M
            
        raise TypeError(f"Cannot multiply Matrix by type: {type(other).__name__}")

    def __rmul__(self, other):
        return self.__mul__(other)

    def __pow__(self,exponent):
        if not Matrix.issquare(self):
            raise TypeError("Matrix must be square to be raised to a power")
        if exponent < 0:
            raise TypeError("Negative matrix powers not supported")
        if exponent == 0:
            return Matrix.identity(self.dim()[0])
        result = Matrix.identity(self.dim()[0])
        base = self
        n = exponent
        while n > 0:
            if n % 2 == 1:
                result = result * base
            base = base * base
            n //= 2
        return result

    def __str__(self):

        row_strings = []
        for r in self.rows():
            row_strings.append(str(r))
        return "\n".join(row_strings)

    def __repr__(self):
        return self.__str__()

    def __eq__(self, other):
        if not isinstance(other, Vectorspace):
            return False
        
        # Check explicit matrix vs vector dimension compatibility
        self_has_dim = hasattr(self, 'dim')
        other_has_dim = hasattr(other, 'dim')
        
        if self_has_dim and other_has_dim:
            if self.dim() != other.dim():
                return False
            # Direct value-by-value lookup avoids structural iteration bugs
            n, m = self.dim()
            for r in range(n):
                for c in range(m):
                    if self[r][c] != other[r][c]:
                        return False
            return True
            
        # Fallback handling for pure vector comparisons
        self_size = self.dim() if self_has_dim else len(self)
        other_size = other.dim() if other_has_dim else len(other)
        if self_size != other_size:
            return False  
        for i, j in zip(self, other):
            if i != j:
                return False
        return True

    def __ne__(self,other):
        return not(self.__eq__(other))

    @staticmethod
    def diag(diagonal):
        n=len(diagonal)
        M=Matrix.null_matrix(n,n)
        for i in range(n):
            M[i][i]=diagonal[i]
        return M

    @staticmethod
    def identity(n):
        return Matrix.diag([Integer(1)] * n)

    def transpose(self):
        return Matrix(self.rows())
        
    def tr(self):
        if self.dim()[0] != self.dim()[1]:
            raise TypeError("Trace can only be calculated for square matrices")
        n = self.dim()[0]
        s = self[0][0]
        for i in range(1, n):
            s = s + self[i][i]
        return s

    def comatrix(self,i,j):
        L=self.columns[:j] + self.columns[j+1:]
        M=list()
        for V in L:
            U=V.c[:i]+V.c[i+1:]
            M.append(Vector(U))
        return Matrix(M)

    def det(self):
        if self.dim()[0] != self.dim()[1]:
            raise TypeError("Determinant can only be calculated for square matrices")
        n = self.dim()[0]
        if n == 1:
            return self[0][0]
        if n == 2:
            return self[0][0] * self[1][1] - self[1][0] * self[0][1]
        # Bareiss algorithm: fraction-free Gaussian elimination.
        # Invariant: after step c, rows[i][j] = det of top-(c+1) submatrix / prev_pivot
        # Division by prev_pivot is always exact — no fractions created.
        rows = [[cell for cell in row] for row in self.rows()]
        sign = Integer(1)
        prev_pivot = Integer(1)

        def exact_div(num, den):
            """Exact division guaranteed by the Bareiss identity."""
            if isinstance(den, Integer) and den.int == 1:
                return num
            # Polynomial entries (from characteristic_polynomial): use Polynomial division
            if isinstance(num, Polynomial) or isinstance(den, Polynomial):
                if isinstance(den, (int, Integer, Rational)):
                    return num / den
                if isinstance(den, Polynomial) and isinstance(num, Polynomial):
                    q, r = num.euclidien(den)
                    return q
                return num / den
            # Polynomialvar entries: try exact division
            pv_num = _as_polyvar(num)
            pv_den = _as_polyvar(den)
            if pv_den.null() or (pv_den.constant() and pv_den.identity()):
                return num
            if pv_den.constant() and pv_den.t:
                scalar = pv_den.t[0].c
                new_t = [Monomialvar(m.c / scalar, m.t) for m in pv_num.t]
                if not new_t: return Integer(0)
                if len(new_t) == 1 and not new_t[0].t: return new_t[0].c
                if len(new_t) == 1: return new_t[0]
                return Polynomialvar(new_t)
            if all(isinstance(m.c, (int, Integer, Rational)) for m in pv_num.t) and \
               all(isinstance(m.c, (int, Integer, Rational)) for m in pv_den.t):
                q, r = pv_num.euclidien(pv_den)
                if r.null():
                    if q.null(): return Integer(0)
                    if len(q.t) == 1 and q.t[0].constant(): return q.t[0].c
                    if len(q.t) == 1: return q.t[0]
                    return q
            return num / den

        # Optimization: if all entries are RFV, extract the LCM of denominators,
        # build the numerator matrix, and compute det(M) = det(num_mat) / LCM^n * corrections
        # Simpler version: find common denominator D such that each entry = num_i / D,
        # then det(M) = det(num_matrix) / D^n
        all_rfv = all(isinstance(rows[r][c], Rationalfractionvar)
                      for r in range(n) for c in range(n))
        if all_rfv:
            # Find the LCM denominator: the one with the highest total degree
            dens = [rows[r][c].denominator for r in range(n) for c in range(n)]
            def _total_deg(p):
                pv = _as_polyvar(p)
                return max((sum(e for e in m.t.values()) for m in pv.t), default=0)
            d_lcm = max(dens, key=_total_deg)
            pv_lcm = _as_polyvar(d_lcm)

            # Try to express each entry's denominator as a divisor of d_lcm
            def _try_clear(entry):
                pv_d = _as_polyvar(entry.denominator)
                if str(pv_d) == str(pv_lcm):
                    return entry.numerator
                # d_lcm = q * entry.denominator?
                q, r = pv_lcm.euclidien(pv_d)
                if r.null() and not q.null():
                    # entry = num/d = num*q / (d*q) = num*q / d_lcm
                    return entry.numerator * q
                return None

            num_entries = []
            ok = True
            for r in range(n):
                row_nums = []
                for cc in range(n):
                    cleared = _try_clear(rows[r][cc])
                    if cleared is None:
                        ok = False; break
                    row_nums.append(cleared)
                if not ok: break
                num_entries.append(row_nums)

            if ok:
                num_mat = Matrix([Vector(row_nums) for row_nums in num_entries]).transpose()
                num_det = num_mat.det()
                den_pow = d_lcm
                for _ in range(n - 1):
                    den_pow = den_pow * d_lcm
                return num_det / den_pow

            # Fallback: cofactor expansion (always terminates, O(n!))
            def _cofactor_det(mat_rows):
                n_ = len(mat_rows)
                if n_ == 1: return mat_rows[0][0]
                if n_ == 2:
                    return mat_rows[0][0]*mat_rows[1][1] - mat_rows[0][1]*mat_rows[1][0]
                total = Integer(0)
                for col in range(n_):
                    sub = [[mat_rows[r][c] for c in range(n_) if c != col]
                           for r in range(1, n_)]
                    s = Integer(1) if col % 2 == 0 else Integer(-1)
                    total = total + s * mat_rows[0][col] * _cofactor_det(sub)
                return total
            return _cofactor_det(rows)

        for c in range(n):
            pivot_row = None
            for r in range(c, n):
                if not zero(rows[r][c]):
                    pivot_row = r
                    break
            if pivot_row is None:
                return Integer(0)
            if pivot_row != c:
                rows[c], rows[pivot_row] = rows[pivot_row], rows[c]
                sign = sign * Integer(-1)
            pivot = rows[c][c]
            for k in range(c + 1, n):
                b = rows[k][c]
                for j in range(c, n):
                    new_val = pivot * rows[k][j] - b * rows[c][j]
                    rows[k][j] = exact_div(new_val, prev_pivot)
            prev_pivot = pivot
        return sign * rows[n - 1][n - 1]


    def characteristic_polynomial(self, var=Greek("lambda")):
            lambd = Monomial(1,1,var)
            I = Matrix.identity(self.dim()[0])
            return (lambd * I - self).det()

    def rank(self):
            matrix_data = [[cell for cell in row] for row in self.rows()]
            num_rows = len(matrix_data)
            num_cols = len(matrix_data[0]) if num_rows > 0 else 0
            
            matrix_rank = 0
            current_row = 0
            
            for col in range(num_cols):
                pivot_row = current_row
                while pivot_row < num_rows and matrix_data[pivot_row][col] == 0:
                    pivot_row += 1
                
                if pivot_row == num_rows:
                    continue
                
                matrix_data[current_row], matrix_data[pivot_row] = matrix_data[pivot_row], matrix_data[current_row]
                
                for r in range(current_row + 1, num_rows):
                    if matrix_data[r][col] != 0:
                        factor = matrix_data[r][col] / matrix_data[current_row][col]
                        for c in range(col, num_cols):
                            matrix_data[r][c] -= factor * matrix_data[current_row][c]
                
                matrix_rank += 1
                current_row += 1
                if current_row == num_rows:
                    break
                    
            return matrix_rank

    def rref(self):
        """Return Row Echelon Form (upper triangular) using Bareiss cross-multiplication.
        Entries are Polynomialvar — no fractions created. kernel() handles back-sub."""
        rows = [[cell for cell in row] for row in self.rows()]
        num_rows = self.dim()[0]
        num_cols = self.dim()[1]
        self._pivots = []
        row_index = 0
        for c in range(num_cols):
            r = row_index
            while r < num_rows and zero(rows[r][c]):
                r += 1
            if r == num_rows:
                continue
            if r != row_index:
                rows[r], rows[row_index] = rows[row_index], rows[r]
            self._pivots.append((row_index, c))
            a = rows[row_index][c]
            for k in range(row_index + 1, num_rows):
                b = rows[k][c]
                if not zero(b):
                    for col_idx in range(c, num_cols):
                        rows[k][col_idx] = (a * rows[k][col_idx]) - (b * rows[row_index][col_idx])
            row_index += 1
            if row_index == num_rows:
                break
        final_columns = []
        for c_idx in range(num_cols):
            col_data = [rows[r_idx][c_idx] for r_idx in range(num_rows)]
            final_columns.append(Vector(col_data))
        result = Matrix(final_columns)
        result._pivots = self._pivots
        return result

    def kernel(self):
        """Compute kernel via REF + back-substitution. Uses exact division where possible."""
        R = self.rref()
        num_rows, num_cols = R.dim()
        pivots = getattr(R, '_pivots', None)
        if pivots is None:
            # Re-derive pivots from the REF
            pivots = []
            found_rows = set()
            for r in range(num_rows):
                for c in range(num_cols):
                    if r not in found_rows and not zero(R[c][r]):
                        pivots.append((r, c))
                        found_rows.add(r)
                        break

        pivot_cols = {c: r for r, c in pivots}
        free_cols = [c for c in range(num_cols) if c not in pivot_cols]

        def _safe_div(num, den):
            """Divide num by den without creating RFV if possible."""
            if zero(den):
                raise ZeroDivisionError
            if isinstance(den, Integer) and den.int == 1:
                return num
            if isinstance(num, (Integer, Rational)) and isinstance(den, (Integer, Rational)):
                return num / den
            if isinstance(num, Integer) and num.int == 0:
                return Integer(0)
            pv_num = _as_polyvar(num) if not isinstance(num, Polynomialvar) else num
            pv_den = _as_polyvar(den) if not isinstance(den, Polynomialvar) else den
            # Only try euclidien if both have scalar coefficients
            if (all(isinstance(m.c,(int,Integer,Rational)) for m in pv_num.t) and
                all(isinstance(m.c,(int,Integer,Rational)) for m in pv_den.t) and
                not pv_den.null()):
                q, r = pv_num.euclidien(pv_den)
                if r.null():
                    if q.null(): return Integer(0)
                    if len(q.t)==1 and q.t[0].constant(): return q.t[0].c
                    if len(q.t)==1: return q.t[0]
                    return q
            # Scalar denominator
            if pv_den.constant() and pv_den.t:
                scalar = pv_den.t[0].c
                if all(isinstance(m.c,(int,Integer,Rational)) for m in pv_num.t):
                    result_terms = [Monomialvar(m.c/scalar, m.t) for m in pv_num.t]
                    if not result_terms: return Integer(0)
                    if len(result_terms)==1 and not result_terms[0].t: return result_terms[0].c
                    return Polynomialvar(result_terms)
            return num / den

        basis = []
        for free_col in free_cols:
            # Build solution vector by back-substituting from bottom pivot up
            # sol[free_col] = 1, all other free cols = 0, solve for pivot cols
            sol = {}
            sol[free_col] = Integer(1)

            # Process pivots from last to first (back-substitution order)
            for pivot_row, pivot_col in reversed(pivots):
                # REF equation for this row:
                # pivot_val * x[pivot_col] + sum(R[c][pivot_row]*x[c] for c > pivot_col) = 0
                pivot_val = R[pivot_col][pivot_row]
                # Accumulate contributions from already-solved variables
                rhs = 0  # zero polynomial — subtraction works correctly
                for c in range(pivot_col + 1, num_cols):
                    entry = R[c][pivot_row]
                    if not zero(entry):
                        x_c = sol.get(c, Integer(0))
                        if not zero(x_c):
                            rhs = rhs - entry * x_c
                # x[pivot_col] = rhs / pivot_val
                sol[pivot_col] = _safe_div(rhs, pivot_val)

            sol_vec = [sol.get(c, Integer(0)) for c in range(num_cols)]
            basis.append(Vector(sol_vec))

        return set(basis)

    def image(self):
        R = self.rref()
        num_rows, num_cols = R.dim() 
        basis = []
        current_row = 0
        for c in range(num_cols):
            if current_row < num_rows and not zero(R[c][current_row]):
                basis.append(self.columns[c])
                current_row += 1
        return set(basis)

    def istriangular(self):
            n, m = self.dim()
            if n != m:
                return False
                
            is_upper = True
            is_lower = True
            
            for i in range(n):
                for j in range(m):
                    if i > j and not zero(self[j][i]):
                        is_upper = False
                    if i < j and not zero(self[j][i]):
                        is_lower = False
                        
            return is_upper or is_lower

    def isdiagonal(self):
        n, m = self.dim()
        if n != m:
            return False
            
        for i in range(n):
            for j in range(m):
                if i != j and not zero(self[j][i]):
                    return False
        return True

    def issquare(self):
        return self.dim()[0]==self.dim()[1]

    def issymetrical(self):
        if self.issquare():
            return self.transpose()==self
        return False

    def isantisymertical(self):
        if self.issquare():
            return self.transpose()==-self
        return False

    def __hash__(self):
        return super().__hash__()  # FIX (Dido): `super` must be called

    def inv(self):
        n, m = self.dim()
        if n != m:
            raise ValueError("Matrix must be square to be inverted")
        if n == 1:
            d = self[0][0]
            if zero(d): raise ValueError("Matrix is singular")
            return Matrix([[Integer(1) / d]])
        if n == 2:
            d = self.det()
            if zero(d): raise ValueError("Matrix is singular")
            return Matrix([Vector([self[1][1]/d, -self[0][1]/d]),
                           Vector([-self[1][0]/d, self[0][0]/d])])
        p = self.characteristic_polynomial()
        det = self.det()
        if zero(det):
            raise ValueError("Matrix is singular and cannot be inverted")
        coef = p.lc[1:]
        p1 = Polynomial(coef)
        result_mat = p1(self)
        rows_out = []
        for row in result_mat.rows():
            rows_out.append(Vector([entry / det for entry in row]))
        return Matrix(rows_out).transpose()

    def __bool__(self):
        if not(self.columns[0]):
            return False
        for i in self:
            for j in i:
                if j:
                    return True
        return False  # FIX (Dido): missing `return`

# ADDED (Dido): convenience constructor for symbols, since the demo below no longer
# creates a ... j on import.   a, b, c = symbols("a b c")
def symbols(names):
    out = [Monomialvar(1, {Constant(n): 1}) for n in names.replace(",", " ").split()]
    return out[0] if len(out) == 1 else out

# FIX (Dido): this demo used to run on import. It printed a result and overwrote the
# imaginary unit `i` and the constant `e` with plain symbols. It now runs only when the
# file is executed directly (python linear_algebra_1_1_1.py).
if __name__ == "__main__":
    a = Monomialvar(1,{Constant("a"):1})
    b = Monomialvar(1,{Constant("b"):1})
    c = Monomialvar(1,{Constant("c"):1})
    d = Monomialvar(1,{Constant("d"):1})
    e = Monomialvar(1,{Constant("e"):1})
    f = Monomialvar(1,{Constant("f"):1})
    g = Monomialvar(1,{Constant("g"):1})
    h = Monomialvar(1,{Constant("h"):1})
    i = Monomialvar(1,{Constant("i"):1})
    j = Monomialvar(1,{Constant("j"):1})
    u = Matrix([Vector([a,b,c,d,e])])
    v = Vector([f,g,h,i,j])
    P = v.dot(v)
    print(P)
