<p align="center">
  <img src="favicon.svg" width="72" alt="Dido logo">
</p>

<h1 align="center">Dido</h1>

<p align="center"><strong>A Desmos-style calculator for exact symbolic algebra and linear algebra.</strong><br>
Type maths as you would write it. Get exact answers, with letters, fractions, roots and complex numbers kept exact, even inside matrices.</p>

---

## Why Dido?

Graphing calculators like Desmos are wonderful to type into, but they work with decimal numbers.
Ask one for the determinant of a matrix containing `a`, `b` and `√2`, and it can't answer.
Computer algebra systems can, but they make you write code.

Dido combines the two. You get a Desmos-like sheet of typeset lines, and behind it an exact symbolic engine:

```
det([[a, b], [c, d]])          =  ad − bc
inv([[1, 2+i], [i, 3]])        =  exact inverse with complex entries
sqrt(3 + 2√2)                  =  1 + √2
(a² − b²)/(a − b)              =  a + b
charpoly([[1/a, b], [i, a]])   =  λ² − ((a²+1)/a)·λ + (1 − ib)
```

## Features

**A live sheet**
- Every line is typeset as you type: `/` makes a fraction, `^` makes a power, `sqrt` makes √, and Greek letter names (`alpha`, `lambda`, `pi`) become symbols.
- Lines can be in **any order**. A line can use a name defined further down, and everything updates instantly when you edit or reorder.
- Reorder lines by dragging the line number, with the arrow buttons, or with <kbd>Alt</kbd>+<kbd>↑</kbd>/<kbd>↓</kbd>.
- Letters without a definition stay **symbolic**. `i` is predefined as the imaginary unit (i² = −1).
- Results are exact. Non-integer constants also show a decimal approximation.
- Your sheet is saved in your browser between visits.

**Matrices**
- Type the word `matrix` to get a 2×2 grid. Drag its corner to add rows and columns, and press <kbd>Tab</kbd> to move between entries.
- Entries can be anything: fractions, roots, complex numbers, letters, whole expressions.
- **Operations:** `det` (Bareiss, fraction-free), `inv` (Cayley–Hamilton), `transpose` / `A^T`, `A^n`, `tr`, `rank`, `rref`, `ref`, `kernel`, `image`, `charpoly`, `minor`, `dot`, `identity`, `zeros`, `diag`.
- **Tests:** `issymmetric`, `isantisymmetric`, `isdiagonal`, `istriangular`, `issquare`.

**Polynomials and fractions**
- Fractions of polynomials in several letters are simplified automatically, with common factors cancelled.
- **One-variable polynomials** keep a main variable and a list of coefficients, and the coefficients may themselves contain letters, roots or `i`. `charpoly`, `quo`, `rem`, `lagrange`, `polyroots` and `poly(e, x)` return this form.
- **Calling a polynomial** plugs in a value: `p = x² + 1` gives `p(1) = 2`; `p(a + 1)` substitutes an expression; `p(q)` composes two polynomials; `p(A)` evaluates at a matrix. `P = charpoly(A)` then `P(A)` gives the zero matrix.
- **Lagrange interpolation** through points whose coordinates can be whole numbers, fractions, complex numbers or symbols: `lagrange((0, i), (1, 1+i), (i, 2))`.
- Also: `gcd`, `lcm`, `deg`, `coeff`, `numer`, `denom`, `expand`, and your own functions such as `f(x, y) = x² + y`.

**Numbers, roots and complex numbers**
- Roots are simplified exactly: `sqrt(72) = 6√2`, `cbrt(54) = 3∛2`, `8^(2/3) = 4`.
- Nested roots are denested: `sqrt(5 + 2√6) = √2 + √3`.
- Square-root denominators are rationalised: `1/(1 + √2) = √2 − 1`.
- Complex arithmetic is exact, including `sqrt(3 + 4i) = 2 + i`, `conj`, `re`, `im` and `abs`.
- Number theory: `factor`, `isprime`, `primes`.

**Interface**
- **Inspector:** shows the selected line at full size, lists every name defined on the sheet, and has a one-click *Copy LaTeX*.
- **Reference:** a built-in manual. Click any entry to insert it.
- **Light and dark** themes.
- **Phones and tablets:** an on-screen maths keypad replaces the phone keyboard, as in Desmos.

## Quick start

Open the site and type. Try these on separate lines, in this order (yes, `M` is used before it is defined):

```
det(M)
M = matrix                  ← fill in the grid: 1, 2+i, a / 0, 3, b / i, 1, 2 (drag the corner to make it 3×3)
p = x^2 - 5x + 6
p(M)
charpoly(M)
lagrange((0,1), (1,3), (2,7))
```

The **Examples** menu has ready-made sheets for linear algebra, polynomials, and radicals and complex numbers.

## How it works

Dido started as a Python library, [`python/linear_algebra_1_1_1.py`](python/engine.py). It is a from-scratch computer algebra system with exact integers and rationals, Gaussian complex numbers, radicals and algebraic numbers, univariate and multivariate polynomials, rational functions, and vectors and matrices.

The web app runs a **JavaScript port of that library's design** (`js/engine.js`), so the site opens instantly and works offline:

| Library (Python) | Engine (JavaScript) | |
|---|---|---|
| `Integer`, `Rational` | `Q` | exact rationals using BigInt |
| `C` | `G` | Gaussian rationals (complex numbers with exact parts) |
| `Radical`, `AlgebraicNumber` | `Alg` | radicals stored as prime factors with fractional exponents; simplification, denesting, rationalisation |
| `Monomialvar`, `Polynomialvar` | `Poly` | multivariate polynomials |
| `Rationalfractionvar` | `RF` | rational functions, cancelled with a multivariate GCD |
| `Polynomial` | `UPoly` | one main variable with a list of coefficients; evaluation by Horner's method |
| `Matrix` | `Matrix` | Bareiss determinant, Cayley–Hamilton inverse, fraction-free echelon form |
| `lagrange` | `lagrange` | exact interpolation over symbols, fractions and complex numbers |

On top of the engine sit a parser for typed maths, and an evaluator that works out which lines depend on which, so the order of lines doesn't matter.

## Project structure

```
index.html              page structure
css/styles.css          all styling (theme colours are the variables at the top)
js/engine.js            maths engine: parser, exact arithmetic, polynomials, matrices
js/app.js               interface: lines, matrix editor, keypad, inspector, reference
js/viewport.js          stops iPhones zooming in when a line is tapped
vendor/katex/           KaTeX: typesets the maths
vendor/mathquill/       MathQuill: the editor used to type each line
vendor/jquery/          jQuery: required by MathQuill
python/                 the original Python library and its change log
favicon.svg, favicon-32.png, apple-touch-icon.png
```

## Running it

There's no build step and nothing to install.

- **Locally:** open `index.html` in a browser, or serve the folder with `python -m http.server` and visit `http://localhost:8000`.
- **GitHub Pages:** in the repository settings, go to *Pages* and deploy from the branch root.

The page only reaches outside your own site for the interface fonts (Google Fonts). The maths works without them.

## Limitations

- **Roots** are taken of constants only. `sqrt(x + 1)` isn't simplified, and denominators containing cube or higher roots aren't rationalised.
- **Exponents** must be numbers. Variables can't be exponents (`2^x`).
- **Symbolic matrices** are treated as generic. For example, `rank([[a, b], [c, d]])` is 2, without considering the special case ad − bc = 0.
- **No calculus:** Dido is deliberately about algebra and linear algebra.

## Credits

- Mathematics engine and Python library: the author of this repository.
- [KaTeX](https://katex.org) (MIT licence): maths typesetting.
- [MathQuill](https://mathquill.com) (Mozilla Public License 2.0): the maths editor.
- [jQuery](https://jquery.com) (MIT licence).
- Named after Dido of Carthage, whose legendary problem of enclosing the most land with an ox-hide is one of the oldest problems in mathematics.
