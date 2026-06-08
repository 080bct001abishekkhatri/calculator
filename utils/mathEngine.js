import { evaluate } from 'mathjs';

let _memory = 0;
let _lastAnswer = '0';
let _angleMode = 'DEG';

export const setAngleMode = (m) => { _angleMode = m; };
export const getAngleMode = () => _angleMode;
export const setLastAnswer = (v) => { _lastAnswer = String(v); };
export const getLastAnswer = () => _lastAnswer;
export const memAdd    = (v) => { _memory += parseFloat(v) || 0; };
export const memSub    = (v) => { _memory -= parseFloat(v) || 0; };
export const memRecall = ()  => String(_memory);
export const memStore  = (v) => { _memory = parseFloat(v) || 0; };
export const memClear  = ()  => { _memory = 0; };

const toRad = (x) =>
  _angleMode === 'DEG' ? (x * Math.PI) / 180
  : _angleMode === 'GRAD' ? (x * Math.PI) / 200 : x;

const fromRad = (x) =>
  _angleMode === 'DEG' ? (x * 180) / Math.PI
  : _angleMode === 'GRAD' ? (x * 200) / Math.PI : x;

const factorial = (n) => {
  n = Math.round(n);
  if (n < 0 || n > 170) return n < 0 ? NaN : Infinity;
  let r = 1; for (let i = 2; i <= n; i++) r *= i; return r;
};

const buildScope = () => ({
  sin:  (x) => Math.sin(toRad(x)),
  cos:  (x) => Math.cos(toRad(x)),
  tan:  (x) => { const c = Math.cos(toRad(x)); if (Math.abs(c)<1e-12) return NaN; return Math.tan(toRad(x)); },
  asin: (x) => fromRad(Math.asin(x)),
  acos: (x) => fromRad(Math.acos(x)),
  atan: (x) => fromRad(Math.atan(x)),
  sinh: Math.sinh,  cosh: Math.cosh,  tanh: Math.tanh,
  asinh: Math.asinh, acosh: Math.acosh, atanh: Math.atanh,
  log:   (x) => Math.log10(x),
  log10: (x) => Math.log10(x),
  ln:    (x) => Math.log(x),
  exp:   (x) => Math.exp(x),
  sqrt:  (x) => Math.sqrt(x),
  cbrt:  (x) => Math.cbrt(x),
  abs:   (x) => Math.abs(x),
  factorial: (n) => factorial(n),
  nCr: (n,r) => factorial(n)/(factorial(r)*factorial(n-r)),
  nPr: (n,r) => factorial(n)/factorial(n-r),
  pi: Math.PI,
  e:  Math.E,
});

export const computeExpression = (expression) => {
  if (!expression.trim()) return '';
  try {
    const expr = expression
      .replace(/×/g, '*').replace(/÷/g, '/').replace(/−/g, '-')
      .replace(/π/g, 'pi')
      .replace(/Ans/g, `(${_lastAnswer})`);
    const result = evaluate(expr, buildScope());
    if (typeof result !== 'number') return String(result);
    if (!isFinite(result)) return result > 0 ? 'Math ERROR: Overflow' : 'Math ERROR: Div/0';
    if (isNaN(result)) return 'Math ERROR: Domain';
    if (Number.isInteger(result)) return String(result);
    return String(parseFloat(result.toPrecision(10)));
  } catch(e) {
    const msg = (e?.message||'').toLowerCase();
    if (msg.includes('zero')||msg.includes('division')) return 'Math ERROR: Div/0';
    if (msg.includes('domain')||msg.includes('nan'))    return 'Math ERROR: Domain';
    return 'Syntax ERROR';
  }
};

export const explainError = (error, expression) => {
  if (error.includes('Div/0'))   return '÷0 Error: A denominator equals zero. Division by zero is undefined in mathematics.';
  if (error.includes('Domain')) {
    if (/sqrt|√/.test(expression)) return 'Domain Error: √ of a negative number is undefined. Input must be ≥ 0.';
    if (/log|ln/.test(expression)) return 'Domain Error: log/ln requires input > 0. Zero and negative inputs are invalid.';
    if (/asin|acos/.test(expression)) return 'Domain Error: sin⁻¹ and cos⁻¹ require input between −1 and 1.';
    return 'Domain Error: A function received an invalid input. Check allowed ranges.';
  }
  if (error.includes('Syntax')) return 'Syntax Error: Missing parenthesis, back-to-back operators, or invalid character. Review the expression.';
  return 'Unknown error. Re-enter the expression carefully.';
};

export const computeStats = (values) => {
  const n = values.length; if (!n) return null;
  const sum  = values.reduce((a,b)=>a+b,0);
  const mean = sum/n;
  const vPop = values.reduce((a,b)=>a+(b-mean)**2,0)/n;
  const vSam = n>1 ? values.reduce((a,b)=>a+(b-mean)**2,0)/(n-1) : 0;
  const sorted = [...values].sort((a,b)=>a-b);
  const median = n%2===0 ? (sorted[n/2-1]+sorted[n/2])/2 : sorted[Math.floor(n/2)];
  return { n, sum, mean, median, sigma: Math.sqrt(vPop), sigmaS: Math.sqrt(vSam),
           variance: vPop, sVariance: vSam, min: sorted[0], max: sorted[n-1], range: sorted[n-1]-sorted[0] };
};