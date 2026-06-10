import { useMemo } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Svg, { Path, Line, Circle, Text as SvgText, G } from 'react-native-svg';

// ─── Types ────────────────────────────────────────────────────────────────────
interface Point { x: number; y: number; }
interface MiniGraphProps {
  points:   Point[];
  roots?:   number[];   // x-values to mark with orange dot
  label?:   string;     // title shown above graph
  W?:       number;
  H?:       number;
}

// ─── Helpers ─────────────────────────────────────────────────────────────────
const pad = { top: 16, right: 12, bottom: 28, left: 40 };

function autoScale(points: Point[]): { xMin:number; xMax:number; yMin:number; yMax:number } {
  const xs = points.map(p => p.x);
  const ys = points.map(p => p.y).filter(y => isFinite(y));
  const xMin = Math.min(...xs), xMax = Math.max(...xs);
  let   yMin = Math.min(...ys), yMax = Math.max(...ys);
  const yPad = (yMax - yMin) * 0.12 || 1;
  return { xMin, xMax, yMin: yMin - yPad, yMax: yMax + yPad };
}

function toCanvas(
  x: number, y: number,
  sc: ReturnType<typeof autoScale>,
  W: number, H: number,
): { cx: number; cy: number } {
  const iw = W - pad.left - pad.right;
  const ih = H - pad.top  - pad.bottom;
  const cx = pad.left + ((x - sc.xMin) / (sc.xMax - sc.xMin)) * iw;
  const cy = pad.top  + (1 - (y - sc.yMin) / (sc.yMax - sc.yMin)) * ih;
  return { cx, cy };
}

function niceTicks(min: number, max: number, count = 5): number[] {
  const range = max - min;
  const raw   = range / (count - 1);
  const mag   = Math.pow(10, Math.floor(Math.log10(raw)));
  const step  = [1,2,2.5,5,10].map(f => f*mag).find(s => range/s <= count+1) || mag;
  const start = Math.ceil(min / step) * step;
  const ticks: number[] = [];
  for (let v = start; v <= max + 1e-9; v += step) ticks.push(parseFloat(v.toPrecision(6)));
  return ticks;
}

function fmt(n: number): string {
  if (Math.abs(n) >= 1000 || (Math.abs(n) < 0.01 && n !== 0)) return n.toExponential(1);
  return parseFloat(n.toPrecision(4)).toString();
}

// ─── Component ───────────────────────────────────────────────────────────────
export default function MiniGraph({ points, roots = [], label, W = 320, H = 200 }: MiniGraphProps) {
  const sc = useMemo(() => autoScale(points), [points]);

  // SVG curve path — split on discontinuities (when y jumps wildly)
  const pathD = useMemo(() => {
    const maxJump = (sc.yMax - sc.yMin) * 3;
    let d = '';
    let pen = false;
    for (let i = 0; i < points.length; i++) {
      const { x, y } = points[i];
      if (!isFinite(y)) { pen = false; continue; }
      const { cx, cy } = toCanvas(x, y, sc, W, H);
      if (!pen || (i > 0 && Math.abs(y - points[i-1].y) > maxJump)) {
        d += `M${cx.toFixed(1)} ${cy.toFixed(1)} `;
        pen = true;
      } else {
        d += `L${cx.toFixed(1)} ${cy.toFixed(1)} `;
      }
    }
    return d.trim();
  }, [points, sc, W, H]);

  // Axis positions in canvas space
  const ox = toCanvas(0, sc.yMin, sc, W, H).cx;  // x=0 vertical line
  const oy = toCanvas(sc.xMin, 0, sc, W, H).cy;  // y=0 horizontal line
  const clampX = (v: number) => Math.max(pad.left, Math.min(W - pad.right, v));
  const clampY = (v: number) => Math.max(pad.top,  Math.min(H - pad.bottom, v));

  const xTicks = niceTicks(sc.xMin, sc.xMax, 6);
  const yTicks = niceTicks(sc.yMin, sc.yMax, 5);

  return (
    <View style={mg.wrapper}>
      {label && <Text style={mg.label}>{label}</Text>}
      <Svg width={W} height={H}>
        {/* Grid lines */}
        <G opacity="0.25">
          {xTicks.map(v => {
            const cx = toCanvas(v, 0, sc, W, H).cx;
            return <Line key={`gx${v}`} x1={cx} y1={pad.top} x2={cx} y2={H-pad.bottom} stroke="#888" strokeWidth="0.5" />;
          })}
          {yTicks.map(v => {
            const cy = toCanvas(0, v, sc, W, H).cy;
            return <Line key={`gy${v}`} x1={pad.left} y1={cy} x2={W-pad.right} y2={cy} stroke="#888" strokeWidth="0.5" />;
          })}
        </G>

        {/* Axes */}
        <Line x1={clampX(ox)} y1={pad.top} x2={clampX(ox)} y2={H-pad.bottom} stroke="#555" strokeWidth="1" />
        <Line x1={pad.left} y1={clampY(oy)} x2={W-pad.right} y2={clampY(oy)} stroke="#555" strokeWidth="1" />

        {/* X-axis tick labels */}
        {xTicks.map(v => {
          const cx = toCanvas(v, 0, sc, W, H).cx;
          return (
            <SvgText key={`tx${v}`} x={cx} y={H-pad.bottom+11} fontSize="8" fill="#777" textAnchor="middle">
              {fmt(v)}
            </SvgText>
          );
        })}

        {/* Y-axis tick labels */}
        {yTicks.map(v => {
          const cy = toCanvas(0, v, sc, W, H).cy;
          return (
            <SvgText key={`ty${v}`} x={pad.left-3} y={cy+3} fontSize="8" fill="#777" textAnchor="end">
              {fmt(v)}
            </SvgText>
          );
        })}

        {/* Curve */}
        <Path d={pathD} stroke="#44aaff" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" />

        {/* Root markers */}
        {roots.map((rx, i) => {
          const { cx, cy } = toCanvas(rx, 0, sc, W, H);
          if (cx < pad.left || cx > W - pad.right) return null;
          return (
            <G key={`root${i}`}>
              <Circle cx={cx} cy={cy} r={5} fill="#cc6600" stroke="#ffaa44" strokeWidth="1.5" />
              <SvgText x={cx} y={cy - 9} fontSize="8" fill="#cc6600" textAnchor="middle">
                {fmt(rx)}
              </SvgText>
            </G>
          );
        })}
      </Svg>
    </View>
  );
}

const mg = StyleSheet.create({
  wrapper: { backgroundColor: '#0d0d0d', borderRadius: 8, marginTop: 10, alignItems: 'center', borderWidth: 1, borderColor: '#1e1e1e', paddingVertical: 6 },
  label:   { color: '#888', fontSize: 11, letterSpacing: 0.5, marginBottom: 2 },
});