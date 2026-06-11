import { router } from 'expo-router';
import { useState } from 'react';
import { Modal, Pressable, ScrollView, StatusBar, StyleSheet, Text, TextInput, View } from 'react-native';
import CalcButton from '../../components/CalcButton';
import Display from '../../components/Display';
import { saveToHistory } from '../../utils/history';
import { computeExpression, computeStats, getLastAnswer, setAngleMode, setLastAnswer } from '../../utils/mathEngine';
import MiniGraph from '../../components/MiniGraph';
import { evaluate } from 'mathjs'

const ALL_MODES = [
  { id: 'COMP',   num: '1',  name: 'COMP',   desc: 'General Computations (Default)' },
  { id: 'CMPLX',  num: '2',  name: 'CMPLX',  desc: 'Complex Number Arithmetic' },
  { id: 'STAT',   num: '3',  name: 'STAT',   desc: 'Statistics & Regression' },
  { id: 'BASE-N', num: '4',  name: 'BASE-N', desc: 'Binary / Octal / Hex Converter' },
  { id: 'EQN',    num: '5',  name: 'EQN',    desc: 'Equation Solver (Quadratic/Cubic)' },
  { id: 'MATRIX', num: '6',  name: 'MATRIX', desc: 'Matrix Operations' },
  { id: 'TABLE',  num: '7',  name: 'TABLE',  desc: 'Create Function Tables' },
  { id: 'VECTOR', num: '8',  name: 'VECTOR', desc: 'Vector Calculations' },
  { id: 'INEQ',   num: '9',  name: 'INEQ',   desc: 'Inequality Solver' },
  { id: 'VERIF',  num: '10', name: 'VERIF',  desc: 'Verification / Proof' },
  { id: 'DIST',   num: '11', name: 'DIST',   desc: 'Statistical Distribution' },
  { id: 'ECON',   num: '★',  name: 'ECON',   desc: 'Cash Flow Analyzer — Original Feature' },
];

const erf = (x: number): number => {
  const t = 1 / (1 + 0.3275911 * Math.abs(x));
  const poly =
    t * (0.254829592 +
    t * (-0.284496736 +
    t * (1.421413741 +
    t * (-1.453152027 +
    t * 1.061405429))));
  const result = 1 - poly * Math.exp(-x * x);
  return x >= 0 ? result : -result;
};

const normalCDF = (x: number, mu: number, sigma: number): number => {
  if (sigma <= 0) return NaN;
  return 0.5 * (1 + erf((x - mu) / (sigma * Math.SQRT2)));
};

const binomialCDF = (n: number, p: number, k: number): number => {
  if (p < 0 || p > 1 || n < 1 || k < 0) return NaN;
  k = Math.floor(k);
  const logFact = (m: number) => {
    let s = 0; for (let i = 2; i <= m; i++) s += Math.log(i); return s;
  };
  let cdf = 0;
  for (let i = 0; i <= k; i++) {
    const logP = logFact(n) - logFact(i) - logFact(n - i) + i * Math.log(p) + (n - i) * Math.log(1 - p);
    cdf += Math.exp(logP);
  }
  return Math.min(cdf, 1);
};

const poissonCDF = (lambda: number, k: number): number => {
  if (lambda <= 0 || k < 0) return NaN;
  k = Math.floor(k);
  let cdf = 0;
  let term = Math.exp(-lambda);
  cdf += term;
  for (let i = 1; i <= k; i++) { term *= lambda / i; cdf += term; }
  return Math.min(cdf, 1);
};

export default function Calculator() {
  const [expression, setExpression] = useState('');
  const [result, setResult] = useState<string | null>(null);
  const [shiftActive, setShift] = useState(false);
  const [alphaActive, setAlpha] = useState(false);
  const [angleModeLabel, setAngleLabel] = useState('DEG');
  const [currentMode, setCurrentMode] = useState('COMP');
  const [showModeModal, setShowModeModal] = useState(false);

  const [baseInput, setBaseInput] = useState('');
  const [baseFrom, setBaseFrom] = useState<'DEC' | 'BIN' | 'OCT' | 'HEX'>('DEC');

  const [statValues, setStatValues] = useState<number[]>([]);
  const [statInputRaw, setStatInputRaw] = useState('');
  const [statResult, setStatResult] = useState<any>(null);

  const [eqnType, setEqnType] = useState<'quad' | 'cubic'>('quad');
  const [eqnA, setEqnA] = useState('');
  const [eqnB, setEqnB] = useState('');
  const [eqnC, setEqnC] = useState('');
  const [eqnD, setEqnD] = useState('');
  const [eqnResult, setEqnResult] = useState<string[]>([]);
  const [eqnGraph, setEqnGraph] = useState<{points:{x:number;y:number}[]; roots:number[]} | null>(null);
  const [tableGraph, setTableGraph] = useState<{x:number;y:number}[] | null>(null);

  const [cmplxA, setCmplxA] = useState('');
  const [cmplxB, setCmplxB] = useState('');
  const [cmplxC, setCmplxC] = useState('');
  const [cmplxD, setCmplxD] = useState('');
  const [cmplxOp, setCmplxOp] = useState<'+' | '-' | '*' | '/'>('+');
  const [cmplxRes, setCmplxRes] = useState<string | null>(null);

  const [matA, setMatA] = useState('');
  const [matB, setMatB] = useState('');
  const [matOp, setMatOp] = useState<'+' | '-' | '*'>('*');
  const [matRes, setMatRes] = useState<string | null>(null);

  const [tableExpr, setTableExpr] = useState('');
  const [tableStart, setTableStart] = useState('');
  const [tableEnd, setTableEnd] = useState('');
  const [tableStep, setTableStep] = useState('');
  const [tableResult, setTableResult] = useState<{ x: number; y: number }[]>([]);

  const [vecA, setVecA] = useState('');
  const [vecB, setVecB] = useState('');
  const [vecOp, setVecOp] = useState<'·' | '×'>('·');
  const [vecRes, setVecRes] = useState<string | null>(null);

  const [ineqLeft, setIneqLeft] = useState('');
  const [ineqOp, setIneqOp] = useState<'<' | '≤' | '>' | '≥'>('<');
  const [ineqRight, setIneqRight] = useState('');
  const [ineqRes, setIneqRes] = useState<string | null>(null);

  const [verifExpr, setVerifExpr] = useState('');
  const [verifRes, setVerifRes] = useState<boolean | null>(null);

  const [distType, setDistType] = useState<'normal' | 'binomial' | 'poisson'>('normal');
  const [distParam1, setDistParam1] = useState('');
  const [distParam2, setDistParam2] = useState('');
  const [distValue, setDistValue] = useState('');
  const [distRes, setDistRes] = useState<string | null>(null);

  const press = (val: string) => { setResult(null); setShift(false); setExpression(prev => prev + val); };
  const calculate = () => {
    if (!expression) return;
    const res = computeExpression(expression);
    setResult(res);
    if (!res.includes('ERROR')) { setLastAnswer(res); saveToHistory(expression, res); }
  };
  const clear = () => { setExpression(''); setResult(null); setShift(false); setAlpha(false); };
  const del = () => { setExpression(prev => prev.slice(0, -1)); setResult(null); };
  const toggleAngle = () => { const next = angleModeLabel === 'DEG' ? 'RAD' : 'DEG'; setAngleLabel(next); setAngleMode(next); };

  const convertBase = (val: string, from: string) => {
    try {
      const dec = from === 'BIN' ? parseInt(val, 2) : from === 'OCT' ? parseInt(val, 8) : from === 'HEX' ? parseInt(val, 16) : parseInt(val, 10);
      if (isNaN(dec)) return null;
      return { DEC: dec.toString(10), BIN: dec.toString(2), OCT: dec.toString(8), HEX: dec.toString(16).toUpperCase() };
    } catch { return null; }
  };
  const bConv = baseInput ? convertBase(baseInput, baseFrom) : null;
  const baseDigits = baseFrom === 'BIN' ? ['0', '1'] : baseFrom === 'OCT' ? ['0','1','2','3','4','5','6','7'] : baseFrom === 'HEX' ? ['0','1','2','3','4','5','6','7','8','9','A','B','C','D','E','F'] : ['0','1','2','3','4','5','6','7','8','9'];

  const addStatValue = () => {
    const v = parseFloat(statInputRaw);
    if (!isNaN(v)) { setStatValues(p => [...p, v]); setStatInputRaw(''); }
  };
  const runStats = () => setStatResult(computeStats(statValues));

  const bisectScan = (fn: (x:number)=>number, lo=-12, hi=12, steps=2000): number[] => {
    const dx = (hi - lo) / steps;
    const found: number[] = [];
    for (let i = 0; i < steps; i++) {
      const x1 = lo + i * dx, x2 = x1 + dx;
      if (fn(x1) * fn(x2) <= 0) {
        let a = x1, b = x2;
        for (let j = 0; j < 60; j++) {
          const m = (a + b) / 2;
          if (Math.abs(b - a) < 1e-9) { found.push(m); break; }
          fn(a) * fn(m) <= 0 ? b = m : a = m;
        }
      }
    }
    return found.reduce((acc: number[], v) =>
      acc.some(u => Math.abs(u - v) < 1e-5) ? acc : [...acc, v], []).sort((a,b)=>a-b);
  };

  const buildGraph = (fn: (x:number)=>number, roots: number[], xMin: number, xMax: number) => {
    const pts = Array.from({ length: 300 }, (_, i) => {
      const x = xMin + i * (xMax - xMin) / 299;
      return { x, y: fn(x) };
    });
    setEqnGraph({ points: pts, roots });
  };

  const solveEqn = () => {
    const a = parseFloat(eqnA), b = parseFloat(eqnB), c = parseFloat(eqnC), d = parseFloat(eqnD);
    if (eqnType === 'quad') {
      if (isNaN(a) || isNaN(b) || isNaN(c) || a === 0) { setEqnResult(['Enter valid a, b, c (a ≠ 0)']); setEqnGraph(null); return; }
      const disc = b * b - 4 * a * c;
      let realRoots: number[] = [];
      if (disc < 0) {
        const re = (-b) / (2 * a);
        const im = Math.sqrt(-disc) / (2 * a);
        setEqnResult([`x₁ = ${re.toFixed(6)} + ${im.toFixed(6)}i`, `x₂ = ${re.toFixed(6)} - ${im.toFixed(6)}i`]);
      } else {
        const x1 = (-b + Math.sqrt(disc)) / (2 * a);
        const x2 = (-b - Math.sqrt(disc)) / (2 * a);
        realRoots = [...new Set([x1, x2])].sort((p,q)=>p-q);
        setEqnResult(realRoots.map((r, i) => `x${i+1} = ${r.toFixed(8)}`));
      }
      const vertex = -b / (2 * a);
      const spread = Math.max(4, Math.abs(vertex) * 0.5 + 4);
      const fn = (x: number) => a*x*x + b*x + c;
      buildGraph(fn, realRoots, vertex - spread, vertex + spread);
    } else {
      if (isNaN(a) || isNaN(b) || isNaN(c) || isNaN(d) || a === 0) { setEqnResult(['Enter valid a,b,c,d (a ≠ 0)']); setEqnGraph(null); return; }
      const fn = (x: number) => a*x**3 + b*x**2 + c*x + d;
      const roots = bisectScan(fn);
      setEqnResult(roots.length > 0
        ? roots.map((r, i) => `x${i+1} = ${r.toFixed(8)}`)
        : ['No real roots found in [-12, 12]']);
      const xMin = roots.length > 0 ? Math.min(...roots) - 2.5 : -5;
      const xMax = roots.length > 0 ? Math.max(...roots) + 2.5 : 5;
      buildGraph(fn, roots, xMin, xMax);
    }
  };

  const calcDist = () => {
    const p1 = parseFloat(distParam1);
    const p2 = parseFloat(distParam2);
    const x  = parseFloat(distValue);
    if (isNaN(x)) { setDistRes('Enter a valid x value'); return; }
    if (distType === 'normal') {
      if (isNaN(p1) || isNaN(p2) || p2 <= 0) { setDistRes('Enter valid μ and σ (σ > 0)'); return; }
      const prob = normalCDF(x, p1, p2);
      const z    = (x - p1) / p2;
      setDistRes(`z = ${z.toFixed(4)}\nP(X ≤ ${x}) = ${prob.toFixed(6)}\nP(X > ${x}) = ${(1 - prob).toFixed(6)}`);
    } else if (distType === 'binomial') {
      const n = Math.round(p1);
      if (isNaN(n) || isNaN(p2) || p2 < 0 || p2 > 1 || n < 1) { setDistRes('Enter valid n (integer ≥ 1) and p (0 ≤ p ≤ 1)'); return; }
      const cdf = binomialCDF(n, p2, x);
      const mean = n * p2;
      const std  = Math.sqrt(n * p2 * (1 - p2));
      setDistRes(`P(X ≤ ${Math.floor(x)}) = ${cdf.toFixed(6)}\nMean = ${mean.toFixed(4)}\nσ = ${std.toFixed(4)}`);
    } else {
      if (isNaN(p1) || p1 <= 0) { setDistRes('Enter valid λ (λ > 0)'); return; }
      const cdf = poissonCDF(p1, x);
      setDistRes(`P(X ≤ ${Math.floor(x)}) = ${cdf.toFixed(6)}\nMean = λ = ${p1}\nσ = ${Math.sqrt(p1).toFixed(4)}`);
    }
  };

  // ── COMP ──────────────────────────────────────────────────────────────────
  const renderComp = () => (
    // ↓ justifyContent moved here from stylesheet (fixes ScrollView error)
    <View style={[s.buttons, { justifyContent: 'space-between' }]}>
      <View style={s.row}>
        <CalcButton label="SHIFT" type={shiftActive ? 'equals' : 'shift'} onPress={() => setShift(p => !p)} />
        <CalcButton label="ALPHA" type={alphaActive ? 'equals' : 'shift'} onPress={() => setAlpha(p => !p)} />
        <CalcButton label={angleModeLabel} type="special" onPress={toggleAngle} />
        <CalcButton label="MODE" type="special" onPress={() => setShowModeModal(true)} />
        <CalcButton label="AC" type="clear" onPress={clear} />
      </View>
      <View style={s.row}>
        <CalcButton label={shiftActive ? 'x³' : 'x²'} type="scientific" onPress={() => press(shiftActive ? '^3' : '^2')} />
        <CalcButton label={shiftActive ? '∛(' : '√('} type="scientific" onPress={() => press(shiftActive ? 'cbrt(' : 'sqrt(')} />
        <CalcButton label="x⁻¹" type="scientific" onPress={() => press('^(-1)')} />
        <CalcButton label={shiftActive ? 'ˣ√' : 'xʸ'} type="scientific" onPress={() => press(shiftActive ? '^(1/' : '^')} />
        <CalcButton label={shiftActive ? '10ˣ(' : 'log('} type="scientific" onPress={() => press(shiftActive ? '10^(' : 'log(')} />
      </View>
      <View style={s.row}>
        <CalcButton label={shiftActive ? 'eˣ(' : 'ln('} type="scientific" onPress={() => press(shiftActive ? 'exp(' : 'ln(')} />
        <CalcButton label={shiftActive ? 'sin⁻¹(' : 'sin('} type="scientific" onPress={() => press(shiftActive ? 'asin(' : 'sin(')} />
        <CalcButton label={shiftActive ? 'cos⁻¹(' : 'cos('} type="scientific" onPress={() => press(shiftActive ? 'acos(' : 'cos(')} />
        <CalcButton label={shiftActive ? 'tan⁻¹(' : 'tan('} type="scientific" onPress={() => press(shiftActive ? 'atan(' : 'tan(')} />
        <CalcButton label="abs(" type="scientific" onPress={() => press('abs(')} />
      </View>
      <View style={s.row}>
        <CalcButton label="(" type="scientific" onPress={() => press('(')} />
        <CalcButton label=")" type="scientific" onPress={() => press(')')} />
        <CalcButton label="π" type="scientific" onPress={() => press('π')} />
        <CalcButton label={shiftActive ? 'e' : 'n!'} type="scientific" onPress={() => press(shiftActive ? String(Math.E) : 'factorial(')} />
        <CalcButton label="%" type="scientific" onPress={() => press('/100')} />
      </View>
      <View style={s.row}>
        <CalcButton label="7" type="number" onPress={() => press('7')} />
        <CalcButton label="8" type="number" onPress={() => press('8')} />
        <CalcButton label="9" type="number" onPress={() => press('9')} />
        <CalcButton label="DEL" type="special" onPress={del} />
        <CalcButton label="÷" type="operator" onPress={() => press('÷')} />
      </View>
      <View style={s.row}>
        <CalcButton label="4" type="number" onPress={() => press('4')} />
        <CalcButton label="5" type="number" onPress={() => press('5')} />
        <CalcButton label="6" type="number" onPress={() => press('6')} />
        <CalcButton label="×" type="operator" onPress={() => press('×')} />
        <CalcButton label="−" type="operator" onPress={() => press('−')} />
      </View>
      <View style={s.row}>
        <CalcButton label="1" type="number" onPress={() => press('1')} />
        <CalcButton label="2" type="number" onPress={() => press('2')} />
        <CalcButton label="3" type="number" onPress={() => press('3')} />
        <CalcButton label="+" type="operator" onPress={() => press('+')} />
        <CalcButton label={shiftActive ? 'nCr(' : 'nPr('} type="scientific" onPress={() => press(shiftActive ? 'nCr(' : 'nPr(')} />
      </View>
      <View style={s.row}>
        <CalcButton label="0" type="number" wide onPress={() => press('0')} />
        <CalcButton label="." type="number" onPress={() => press('.')} />
        <CalcButton label="×10ˣ" type="scientific" onPress={() => press('*10^(')} />
        <CalcButton label="Ans" type="special" onPress={() => press(getLastAnswer())} />
        <CalcButton label="=" type="equals" onPress={calculate} />
      </View>
    </View>
  );

  const renderBaseN = () => (
    <ScrollView style={s.buttons}>
      <View style={s.row}>
        <CalcButton label="MODE" type="special" onPress={() => setShowModeModal(true)} />
        <CalcButton label="AC" type="clear" onPress={() => setBaseInput('')} />
        <CalcButton label="DEL" type="special" onPress={() => setBaseInput(p => p.slice(0, -1))} />
      </View>
      <View style={s.row}>
        {(['DEC', 'BIN', 'OCT', 'HEX'] as const).map(b => (
          <CalcButton key={b} label={b} type={baseFrom === b ? 'equals' : 'special'} onPress={() => { setBaseFrom(b); setBaseInput(''); }} />
        ))}
      </View>
      <View style={[s.displayBox, { marginVertical: 8 }]}>
        <Text style={s.baseInputText}>{baseInput || '0'} ({baseFrom})</Text>
      </View>
      {bConv && (
        <View style={s.resultBox}>
          {['DEC', 'BIN', 'OCT', 'HEX'].map(b => (
            <Text key={b} style={s.baseResultRow}><Text style={s.baseLabel}>{b}: </Text>{bConv[b as keyof typeof bConv]}</Text>
          ))}
        </View>
      )}
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', padding: 6 }}>
        {baseDigits.map(d => (
          <Pressable key={d} style={s.baseDigitBtn} onPress={() => setBaseInput(p => p + d)}>
            <Text style={s.baseDigitText}>{d}</Text>
          </Pressable>
        ))}
      </View>
    </ScrollView>
  );

  const renderStat = () => (
    <ScrollView style={s.buttons}>
      <View style={s.row}>
        <CalcButton label="MODE" type="special" onPress={() => setShowModeModal(true)} />
        <CalcButton label="AC" type="clear" onPress={() => { setStatValues([]); setStatInputRaw(''); setStatResult(null); }} />
      </View>
      <View style={s.row}>
        <TextInput style={s.textInput} keyboardType="numeric" value={statInputRaw} onChangeText={setStatInputRaw} placeholder="Enter value" placeholderTextColor="#555" />
        <CalcButton label="ADD" type="operator" onPress={addStatValue} />
        <CalcButton label="CALC" type="equals" onPress={runStats} />
      </View>
      {statValues.length > 0 && (
        <View style={[s.displayBox, { padding: 8 }]}>
          <Text style={{ color: '#888', fontSize: 11 }}>Data ({statValues.length}): {statValues.join(', ')}</Text>
        </View>
      )}
      {statResult && (
        <View style={s.resultBox}>
          {[['n', statResult.n], ['Σx', statResult.sum.toFixed(6)], ['x̄', statResult.mean.toFixed(6)], ['Med', statResult.median.toFixed(6)], ['σ(pop)', statResult.sigma.toFixed(6)], ['σ(samp)', statResult.sigmaS.toFixed(6)], ['Var', statResult.variance.toFixed(6)], ['Min', statResult.min], ['Max', statResult.max]].map(([k, v]) => (
            <Text key={String(k)} style={s.statRow}><Text style={s.statKey}>{k}: </Text>{String(v)}</Text>
          ))}
        </View>
      )}
    </ScrollView>
  );

  const renderEqn = () => (
    <ScrollView style={s.buttons}>
      <View style={s.row}>
        <CalcButton label="MODE" type="special" onPress={() => setShowModeModal(true)} />
        <CalcButton label="AC" type="clear" onPress={() => { setEqnA(''); setEqnB(''); setEqnC(''); setEqnD(''); setEqnResult([]); setEqnGraph(null); }} />
      </View>
      <View style={s.row}>
        <CalcButton label="Quadratic" type={eqnType === 'quad' ? 'equals' : 'special'} onPress={() => { setEqnType('quad'); setEqnResult([]); }} />
        <CalcButton label="Cubic" type={eqnType === 'cubic' ? 'equals' : 'special'} onPress={() => { setEqnType('cubic'); setEqnResult([]); }} />
      </View>
      <View style={s.eqnLabel}>
        <Text style={s.eqnFormula}>{eqnType === 'quad' ? 'ax² + bx + c = 0' : 'ax³ + bx² + cx + d = 0'}</Text>
      </View>
      {[['a', eqnA, setEqnA], ['b', eqnB, setEqnB], ['c', eqnC, setEqnC], ...(eqnType === 'cubic' ? [['d', eqnD, setEqnD]] : [])].map(([label, val, setter]) => (
        <View key={String(label)} style={s.eqnRow}>
          <Text style={s.eqnCoeffLabel}>{String(label)} =</Text>
          <TextInput style={s.textInput} keyboardType="numeric" value={String(val)} onChangeText={setter as any} placeholder="0" placeholderTextColor="#555" />
        </View>
      ))}
      <View style={{ margin: 8 }}>
        <CalcButton label="SOLVE =" type="equals" onPress={solveEqn} />
      </View>
      {eqnResult.length > 0 && (
        <View style={s.resultBox}>
          {eqnResult.map((r, i) => <Text key={i} style={s.statRow}>{r}</Text>)}
        </View>
      )}
      {eqnGraph && (
        <MiniGraph
          points={eqnGraph.points}
          roots={eqnGraph.roots}
          label={eqnType === 'quad'
            ? `f(x) = ${eqnA}x² + ${eqnB}x + ${eqnC}`
            : `f(x) = ${eqnA}x³ + ${eqnB}x² + ${eqnC}x + ${eqnD}`}
          W={320}
          H={200}
        />
      )}
    </ScrollView>
  );

  const renderCmplx = () => (
    <ScrollView style={s.buttons}>
      <View style={s.row}>
        <CalcButton label="MODE" type="special" onPress={() => setShowModeModal(true)} />
        <CalcButton label="AC" type="clear" onPress={() => { setCmplxA(''); setCmplxB(''); setCmplxC(''); setCmplxD(''); setCmplxRes(null); }} />
      </View>
      <Text style={{ color: '#cc6600', marginLeft: 8, marginTop: 12 }}>a + bi</Text>
      {[['a', cmplxA, setCmplxA], ['b', cmplxB, setCmplxB], ['c', cmplxC, setCmplxC], ['d', cmplxD, setCmplxD]].map(([l, v, set]) => (
        <TextInput key={String(l)} style={s.textInput} keyboardType="numeric" value={String(v)} onChangeText={set as any} placeholder={String(l)} placeholderTextColor="#555" />
      ))}
      <View style={s.row}>
        {['+', '-', '*', '/'].map(op => <CalcButton key={op} label={op} type={cmplxOp === op as any ? 'equals' : 'operator'} onPress={() => setCmplxOp(op as any)} />)}
      </View>
      <View style={{ margin: 8 }}>
        <CalcButton label="CALC =" type="equals" onPress={() => {
          const z1 = { r: parseFloat(cmplxA) || 0, i: parseFloat(cmplxB) || 0 };
          const z2 = { r: parseFloat(cmplxC) || 0, i: parseFloat(cmplxD) || 0 };
          let res: { r: number; i: number };
          if (cmplxOp === '+')      res = { r: z1.r + z2.r, i: z1.i + z2.i };
          else if (cmplxOp === '-') res = { r: z1.r - z2.r, i: z1.i - z2.i };
          else if (cmplxOp === '*') res = { r: z1.r * z2.r - z1.i * z2.i, i: z1.r * z2.i + z1.i * z2.r };
          else {
            const denom = z2.r * z2.r + z2.i * z2.i;
            res = { r: (z1.r * z2.r + z1.i * z2.i) / denom, i: (z1.i * z2.r - z1.r * z2.i) / denom };
          }
          setCmplxRes(`${res.r.toFixed(6)} ${res.i >= 0 ? '+' : ''} ${res.i.toFixed(6)}i`);
        }} />
      </View>
      {cmplxRes && <View style={s.resultBox}><Text style={s.statRow}>{cmplxRes}</Text></View>}
    </ScrollView>
  );

  const renderMatrix = () => (
    <ScrollView style={s.buttons}>
      <View style={s.row}>
        <CalcButton label="MODE" type="special" onPress={() => setShowModeModal(true)} />
        <CalcButton label="AC" type="clear" onPress={() => { setMatA(''); setMatB(''); setMatRes(null); }} />
      </View>
      <Text style={{ color: '#cc6600', marginLeft: 8, marginTop: 12 }}>Matrix A (rows separated by ;)</Text>
      <TextInput style={s.textInput} value={matA} onChangeText={setMatA} placeholder="1,2;3,4" placeholderTextColor="#555" />
      <Text style={{ color: '#cc6600', marginLeft: 8, marginTop: 8 }}>Matrix B</Text>
      <TextInput style={s.textInput} value={matB} onChangeText={setMatB} placeholder="5,6;7,8" placeholderTextColor="#555" />
      <View style={s.row}>
        {(['+', '-', '*'] as const).map(op => (
          <CalcButton key={op} label={op} type={matOp === op ? 'equals' : 'operator'} onPress={() => setMatOp(op)} />
        ))}
      </View>
      <View style={{ margin: 8 }}>
        <CalcButton label="CALC =" type="equals" onPress={() => {
          try {
            const parse = (s: string) => s.split(';').map(row => row.split(',').map(Number));
            const A = parse(matA); const B = parse(matB);
            const rows = A.length;
            let R: number[][];
            if (matOp === '+' || matOp === '-') {
              R = A.map((row, i) => row.map((v, j) => matOp === '+' ? v + B[i][j] : v - B[i][j]));
            } else {
              const bCols = B[0].length;
              R = Array.from({ length: rows }, (_, i) =>
                Array.from({ length: bCols }, (_, j) =>
                  A[i].reduce((sum, _, k) => sum + A[i][k] * B[k][j], 0)));
            }
            setMatRes(R.map(row => '[' + row.map(v => v.toFixed(2)).join(', ') + ']').join('\n'));
          } catch { setMatRes('Error: check matrix format (e.g. 1,2;3,4)'); }
        }} />
      </View>
      {matRes && <View style={s.resultBox}>{matRes.split('\n').map((line, i) => <Text key={i} style={s.statRow}>{line}</Text>)}</View>}
    </ScrollView>
  );

  const renderTable = () => (
    <ScrollView style={s.buttons}>
      <View style={s.row}>
        <CalcButton label="MODE" type="special" onPress={() => setShowModeModal(true)} />
        <CalcButton label="AC" type="clear" onPress={() => { setTableExpr(''); setTableStart(''); setTableEnd(''); setTableStep(''); setTableResult([]); setTableGraph(null); }} />
      </View>
      <Text style={{ color: '#cc6600', marginLeft: 8, marginTop: 12 }}>f(x) = </Text>
      <TextInput style={s.textInput} value={tableExpr} onChangeText={setTableExpr} placeholder="x^2+2*x" placeholderTextColor="#555" />
      <TextInput style={s.textInput} value={tableStart} onChangeText={setTableStart} placeholder="Start" placeholderTextColor="#555" keyboardType="numeric" />
      <TextInput style={s.textInput} value={tableEnd} onChangeText={setTableEnd} placeholder="End" placeholderTextColor="#555" keyboardType="numeric" />
      <TextInput style={s.textInput} value={tableStep} onChangeText={setTableStep} placeholder="Step" placeholderTextColor="#555" keyboardType="numeric" />
      <View style={{ margin: 8 }}>
        <CalcButton label="TABLE =" type="equals" onPress={() => {
          const start = parseFloat(tableStart) || 0;
          const end   = parseFloat(tableEnd)   || 10;
          const step  = parseFloat(tableStep)  || 1;
          const res: { x: number; y: number }[] = [];
          for (let x = start; x <= end + 1e-9; x += step) {
            const y = (() => { try { return evaluate(tableExpr, { x }); } catch { return NaN; } })();
            res.push({ x: parseFloat(x.toFixed(6)), y: parseFloat(y) });
          }
          setTableResult(res);
          setTableGraph(res.filter(p => isFinite(p.y)));
        }} />
      </View>
      {tableResult.length > 0 && (
        <View style={s.resultBox}>
          {tableResult.map((r, i) => (
            <Text key={i} style={s.statRow}>x = {r.x.toFixed(4)}    f(x) = {isNaN(r.y) ? 'ERROR' : r.y.toFixed(6)}</Text>
          ))}
        </View>
      )}
      {tableGraph && tableGraph.length > 1 && (
        <MiniGraph points={tableGraph} label={`f(x) = ${tableExpr}`} W={320} H={180} />
      )}
    </ScrollView>
  );

  const renderVector = () => (
    <ScrollView style={s.buttons}>
      <View style={s.row}>
        <CalcButton label="MODE" type="special" onPress={() => setShowModeModal(true)} />
        <CalcButton label="AC" type="clear" onPress={() => { setVecA(''); setVecB(''); setVecRes(null); }} />
      </View>
      <Text style={{ color: '#cc6600', marginLeft: 8, marginTop: 12 }}>Vector A: a, b, c</Text>
      <TextInput style={s.textInput} value={vecA} onChangeText={setVecA} placeholder="1,2,3" placeholderTextColor="#555" />
      <Text style={{ color: '#cc6600', marginLeft: 8, marginTop: 8 }}>Vector B: d, e, f</Text>
      <TextInput style={s.textInput} value={vecB} onChangeText={setVecB} placeholder="4,5,6" placeholderTextColor="#555" />
      <View style={s.row}>
        <CalcButton label="· dot" type={vecOp === '·' ? 'equals' : 'operator'} onPress={() => setVecOp('·')} />
        <CalcButton label="× cross" type={vecOp === '×' ? 'equals' : 'operator'} onPress={() => setVecOp('×')} />
      </View>
      <View style={{ margin: 8 }}>
        <CalcButton label="CALC =" type="equals" onPress={() => {
          const a = vecA.split(',').map(Number);
          const b = vecB.split(',').map(Number);
          if (a.length < 3 || b.length < 3 || a.some(isNaN) || b.some(isNaN)) {
            setVecRes('Enter 3 comma-separated values for each vector'); return;
          }
          if (vecOp === '·') {
            const res = a[0]*b[0] + a[1]*b[1] + a[2]*b[2];
            setVecRes(`A · B = ${res.toFixed(6)}\n|A| = ${Math.sqrt(a[0]**2+a[1]**2+a[2]**2).toFixed(6)}\n|B| = ${Math.sqrt(b[0]**2+b[1]**2+b[2]**2).toFixed(6)}`);
          } else {
            const cx = a[1]*b[2] - a[2]*b[1];
            const cy = a[2]*b[0] - a[0]*b[2];
            const cz = a[0]*b[1] - a[1]*b[0];
            setVecRes(`A × B = [${cx.toFixed(6)}, ${cy.toFixed(6)}, ${cz.toFixed(6)}]\n|A × B| = ${Math.sqrt(cx**2+cy**2+cz**2).toFixed(6)}`);
          }
        }} />
      </View>
      {vecRes && <View style={s.resultBox}>{vecRes.split('\n').map((line, i) => <Text key={i} style={s.statRow}>{line}</Text>)}</View>}
    </ScrollView>
  );

  const renderIneq = () => (
    <ScrollView style={s.buttons}>
      <View style={s.row}>
        <CalcButton label="MODE" type="special" onPress={() => setShowModeModal(true)} />
        <CalcButton label="AC" type="clear" onPress={() => { setIneqLeft(''); setIneqRight(''); setIneqRes(null); }} />
      </View>
      <TextInput style={s.textInput} value={ineqLeft} onChangeText={setIneqLeft} placeholder="Left expression (e.g. 2+3)" placeholderTextColor="#555" />
      <View style={s.row}>
        {(['<', '≤', '>', '≥'] as const).map(op => (
          <CalcButton key={op} label={op} type={ineqOp === op ? 'equals' : 'operator'} onPress={() => setIneqOp(op)} />
        ))}
      </View>
      <TextInput style={s.textInput} value={ineqRight} onChangeText={setIneqRight} placeholder="Right expression (e.g. 10)" placeholderTextColor="#555" />
      <View style={{ margin: 8 }}>
        <CalcButton label="TEST =" type="equals" onPress={() => {
          const l  = parseFloat(computeExpression(ineqLeft));
          const r  = parseFloat(computeExpression(ineqRight));
          const ok = ineqOp === '<' ? l < r : ineqOp === '≤' ? l <= r : ineqOp === '>' ? l > r : l >= r;
          setIneqRes(`${l} ${ineqOp} ${r}  →  ${ok ? 'TRUE' : 'FALSE'}`);
        }} />
      </View>
      {ineqRes && (
        <View style={s.resultBox}>
          <Text style={[s.statRow, { color: ineqRes.includes('TRUE') ? '#007700' : '#aa0000', fontWeight: '700' }]}>{ineqRes}</Text>
        </View>
      )}
    </ScrollView>
  );

  const renderVerif = () => (
    <ScrollView style={s.buttons}>
      <View style={s.row}>
        <CalcButton label="MODE" type="special" onPress={() => setShowModeModal(true)} />
        <CalcButton label="AC" type="clear" onPress={() => { setVerifExpr(''); setVerifRes(null); }} />
      </View>
      <Text style={{ color: '#cc6600', marginLeft: 8, marginTop: 12 }}>Enter equation to verify (use = to compare)</Text>
      <TextInput style={s.textInput} value={verifExpr} onChangeText={setVerifExpr} placeholder="e.g.  sin(30)^2 + cos(30)^2 = 1" placeholderTextColor="#555" />
      <View style={{ margin: 8 }}>
        <CalcButton label="VERIFY =" type="equals" onPress={() => {
          const parts = verifExpr.split('=');
          if (parts.length !== 2) { setVerifRes(false); return; }
          const l = computeExpression(parts[0].trim());
          const r = computeExpression(parts[1].trim());
          setVerifRes(Math.abs(parseFloat(l) - parseFloat(r)) < 1e-4);
        }} />
      </View>
      {verifRes !== null && (
        <View style={s.resultBox}>
          <Text style={[s.statRow, { color: verifRes ? '#007700' : '#aa0000', fontWeight: '700', fontSize: 16 }]}>
            {verifRes ? '✓  TRUE' : '✗  FALSE'}
          </Text>
        </View>
      )}
    </ScrollView>
  );

  const renderDist = () => (
    <ScrollView style={s.buttons}>
      <View style={s.row}>
        <CalcButton label="MODE" type="special" onPress={() => setShowModeModal(true)} />
        <CalcButton label="AC" type="clear" onPress={() => { setDistRes(null); setDistParam1(''); setDistParam2(''); setDistValue(''); }} />
      </View>
      <View style={s.row}>
        {(['normal', 'binomial', 'poisson'] as const).map((d, i) => (
          <CalcButton key={d} label={['Normal', 'Binom', 'Poisson'][i]} type={distType === d ? 'equals' : 'special'} onPress={() => { setDistType(d); setDistRes(null); }} />
        ))}
      </View>
      <Text style={{ color: '#888', marginLeft: 8, marginTop: 10, fontSize: 11 }}>
        {distType === 'normal' ? 'Normal Distribution: enter μ, σ, then x' : distType === 'binomial' ? 'Binomial Distribution: enter n (trials), p (prob), then k' : 'Poisson Distribution: enter λ (rate), then k'}
      </Text>
      <TextInput style={s.textInput} keyboardType="numeric" value={distParam1} onChangeText={setDistParam1}
        placeholder={distType === 'normal' ? 'μ  (mean)' : distType === 'binomial' ? 'n  (number of trials)' : 'λ  (average rate)'}
        placeholderTextColor="#555" />
      {distType !== 'poisson' && (
        <TextInput style={s.textInput} keyboardType="numeric" value={distParam2} onChangeText={setDistParam2}
          placeholder={distType === 'normal' ? 'σ  (std deviation, σ > 0)' : 'p  (probability, 0 ≤ p ≤ 1)'}
          placeholderTextColor="#555" />
      )}
      <TextInput style={s.textInput} keyboardType="numeric" value={distValue} onChangeText={setDistValue}
        placeholder={distType === 'normal' ? 'x  (value)' : 'k  (integer value)'}
        placeholderTextColor="#555" />
      <View style={{ margin: 8 }}>
        <CalcButton label="P(X) =" type="equals" onPress={calcDist} />
      </View>
      {distRes && (
        <View style={s.resultBox}>
          {distRes.split('\n').map((line, i) => (
            <Text key={i} style={[s.statRow, i === 0 && { fontWeight: '700', fontSize: 14 }]}>{line}</Text>
          ))}
        </View>
      )}
    </ScrollView>
  );

  return (
    <View style={s.container}>
      <StatusBar barStyle="light-content" backgroundColor="#0a0a0a" />
      <View style={s.header}>
        <Text style={s.headerText}>fx-991ES PLUS | EconCalc</Text>
        <Text style={s.modeTag}>{currentMode} | {angleModeLabel}</Text>
      </View>

      {currentMode === 'COMP'   && <Display expression={expression} result={result ? parseFloat(result) : null} shiftActive={shiftActive} />}
      {currentMode === 'COMP'   && renderComp()}
      {currentMode === 'CMPLX'  && renderCmplx()}
      {currentMode === 'STAT'   && renderStat()}
      {currentMode === 'BASE-N' && renderBaseN()}
      {currentMode === 'EQN'    && renderEqn()}
      {currentMode === 'MATRIX' && renderMatrix()}
      {currentMode === 'TABLE'  && renderTable()}
      {currentMode === 'VECTOR' && renderVector()}
      {currentMode === 'INEQ'   && renderIneq()}
      {currentMode === 'VERIF'  && renderVerif()}
      {currentMode === 'DIST'   && renderDist()}
      {currentMode === 'ECON'   && (
        <View style={s.buttons}>
          <View style={s.row}>
            <CalcButton label="MODE" type="special" onPress={() => setShowModeModal(true)} />
          </View>
          <Pressable
            onPress={() => router.push('/(tabs)/cashflow')}
            style={[s.displayBox, { justifyContent: 'center', marginVertical: 80 }]}
          >
            <Text style={{ color: '#88ff88', fontSize: 26, fontWeight: '700', textAlign: 'center' }}>CASH FLOW</Text>
            <Text style={{ color: '#66cc66', fontSize: 14, textAlign: 'center', marginTop: 12 }}>Tap to open analyzer</Text>
          </Pressable>
        </View>
      )}

      <Modal visible={showModeModal} transparent animationType="fade">
        <View style={s.overlay}>
          <View style={s.modal}>
            <Text style={s.modalTitle}>SELECT MODE</Text>
            <ScrollView>
              {ALL_MODES.map(m => (
                <Pressable key={m.id} style={s.modeRow} onPress={() => {
                  setShowModeModal(false);
                  if (m.id === 'ECON') { router.push('/(tabs)/cashflow'); }
                  else { setCurrentMode(m.id); }
                }}>
                  <Text style={s.modeNum}>{m.num}</Text>
                  <View>
                    <Text style={s.modeName}>{m.name}</Text>
                    <Text style={s.modeDesc}>{m.desc}</Text>
                  </View>
                </Pressable>
              ))}
            </ScrollView>
            <Pressable style={s.modalCancel} onPress={() => setShowModeModal(false)}>
              <Text style={{ color: '#fff', fontWeight: '600' }}>CANCEL</Text>
            </Pressable>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const s = StyleSheet.create({
  container:    { flex: 1, backgroundColor: '#0a0a0a', paddingTop: 36 },
  header:       { flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: 12, paddingBottom: 4 },
  headerText:   { color: '#cc6600', fontSize: 12, fontWeight: '700', letterSpacing: 1.5 },
  modeTag:      { color: '#666', fontSize: 12 },
  // ↓ justifyContent removed from here
  buttons:      { flex: 1, padding: 6 },
  row:          { flexDirection: 'row', flex: 1 },
  displayBox:   { backgroundColor: '#111', margin: 8, borderRadius: 6, padding: 12 },
  baseInputText:{ color: '#88ff88', fontSize: 22 },
  resultBox:    { backgroundColor: '#c8d8a0', margin: 8, borderRadius: 6, padding: 10 },
  baseResultRow:{ color: '#1a3a1a', fontSize: 13, marginVertical: 1 },
  baseLabel:    { fontWeight: '700' },
  baseDigitBtn: { backgroundColor: '#2a2a2a', margin: 3, borderRadius: 5, padding: 12, minWidth: 48, alignItems: 'center' },
  baseDigitText:{ color: '#fff', fontSize: 16, fontWeight: '600' },
  textInput:    { flex: 1, backgroundColor: '#1a1a1a', color: '#fff', borderRadius: 4, padding: 8, fontSize: 16, margin: 4, borderWidth: 1, borderColor: '#333' },
  statRow:      { color: '#1a3a1a', fontSize: 13, marginVertical: 2 },
  statKey:      { fontWeight: '700' },
  eqnLabel:     { backgroundColor: '#1a2a1a', margin: 8, padding: 8, borderRadius: 6 },
  eqnFormula:   { color: '#88dd88', fontSize: 14, textAlign: 'center' },
  eqnRow:       { flexDirection: 'row', alignItems: 'center', marginHorizontal: 8, marginVertical: 4 },
  eqnCoeffLabel:{ color: '#cc6600', width: 32, fontSize: 18, fontWeight: '700' },
  overlay:      { flex: 1, backgroundColor: 'rgba(0,0,0,0.88)', justifyContent: 'center', alignItems: 'center' },
  modal:        { backgroundColor: '#1a1a1a', width: '85%', borderRadius: 10, padding: 16, maxHeight: '78%' },
  modalTitle:   { color: '#cc6600', fontSize: 16, fontWeight: '700', letterSpacing: 2, textAlign: 'center', marginBottom: 12 },
  modeRow:      { flexDirection: 'row', alignItems: 'center', paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: '#2a2a2a' },
  modeNum:      { color: '#cc6600', width: 40, fontSize: 15, fontWeight: '700' },
  modeName:     { color: '#fff', fontSize: 14, fontWeight: '600' },
  modeDesc:     { color: '#777', fontSize: 11 },
  modalCancel:  { marginTop: 12, backgroundColor: '#333', padding: 10, borderRadius: 6, alignItems: 'center' },
});