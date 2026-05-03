import { useState, useRef, useEffect } from 'react';

// ── Circuit path (clockwise rectangle) ──

type Pt = [number, number];

const NODES: Pt[] = [[80, 150], [80, 50], [420, 50], [420, 150]];
const SEGS = NODES.map((p, i) => {
  const q = NODES[(i + 1) % NODES.length];
  return { from: p, to: q, len: Math.hypot(q[0] - p[0], q[1] - p[1]) };
});
const PATH_LEN = SEGS.reduce((s, { len }) => s + len, 0);

function ptAt(d: number): Pt {
  let r = ((d % PATH_LEN) + PATH_LEN) % PATH_LEN;
  for (const { from: [ax, ay], to: [bx, by], len } of SEGS) {
    if (r <= len) {
      const t = r / len;
      return [ax + (bx - ax) * t, ay + (by - ay) * t];
    }
    r -= len;
  }
  return NODES[0];
}

// ── Formatting ──

function sig(n: number, f = 3): string {
  const s = n.toPrecision(f);
  return s.includes('.') ? s.replace(/\.?0+$/, '') : s;
}
function fmtI(a: number): string {
  if (a < 0.001) return `${sig(a * 1e6)} µA`;
  if (a < 1) return `${sig(a * 1000)} mA`;
  return `${sig(a)} A`;
}
function fmtR(r: number): string {
  return r >= 1000 ? `${sig(r / 1000)} kΩ` : `${r} Ω`;
}
function fmtP(w: number): string {
  if (w < 0.001) return `${sig(w * 1e6)} µW`;
  if (w < 1) return `${sig(w * 1000)} mW`;
  return `${sig(w)} W`;
}
function niceMax(val: number): number {
  const exp = Math.pow(10, Math.floor(Math.log10(val)));
  const norm = val / exp;
  if (norm <= 1) return exp;
  if (norm <= 2) return 2 * exp;
  if (norm <= 5) return 5 * exp;
  return 10 * exp;
}

// ── Constants ──

const R_VALS = [47, 100, 220, 330, 470, 1000, 2200, 4700, 10000];
const N_DOTS = 14;
const V_AXIS_MAX = 26;

export function OhmsExplorer() {
  const [voltage, setVoltage] = useState(5);
  const [ri, setRi] = useState(4); // 470 Ω
  const R = R_VALS[ri];
  const I = voltage / R;
  const P = voltage * I;

  // ── Dot animation ──
  const [off, setOff] = useState(0);
  const speedRef = useRef(I * 5000);
  speedRef.current = I * 5000;
  const tRef = useRef(0);
  const rafRef = useRef(0);

  useEffect(() => {
    let live = true;
    const tick = (t: number) => {
      if (!live) return;
      if (tRef.current) {
        const dt = Math.min((t - tRef.current) / 1000, 0.1);
        setOff(prev => (prev + speedRef.current * dt) % PATH_LEN);
      }
      tRef.current = t;
      rafRef.current = requestAnimationFrame(tick);
    };
    rafRef.current = requestAnimationFrame(tick);
    return () => { live = false; cancelAnimationFrame(rafRef.current); };
  }, []);

  const dots = Array.from({ length: N_DOTS }, (_, i) =>
    ptAt(off + (i * PATH_LEN) / N_DOTS)
  );

  // ── V-I graph geometry ──
  const gx = 55, gy = 12, gw = 400, gh = 140;
  const iAxisMax = niceMax(V_AXIS_MAX / R);
  const toX = (v: number) => gx + (v / V_AXIS_MAX) * gw;
  const toY = (i: number) => gy + gh - (i / iAxisMax) * gh;

  const lineEndV = Math.min(V_AXIS_MAX, iAxisMax * R);
  const lineEndI = lineEndV / R;
  const yTicks = [0, 0.25, 0.5, 0.75, 1].map(f => f * iAxisMax);

  return (
    <div className="my-8 not-prose">
      {/* ── Circuit ── */}
      <svg viewBox="0 0 500 200" className="w-full block">
        {/* Wires */}
        <polyline
          points={NODES.map(p => p.join(',')).join(' ') + ` ${NODES[0].join(',')}`}
          fill="none" stroke="#cbd5e1" strokeWidth="2"
        />

        {/* Battery */}
        <rect x="64" y="82" width="32" height="36" fill="white" />
        <line x1="66" y1="88" x2="94" y2="88" stroke="#334155" strokeWidth="1.5" />
        <line x1="72" y1="112" x2="88" y2="112" stroke="#334155" strokeWidth="3.5" />
        <text x="97" y="92" fontSize="10" fill="#64748b">+</text>
        <text x="97" y="116" fontSize="10" fill="#64748b">−</text>

        {/* Resistor zigzag */}
        <rect x="406" y="69" width="28" height="62" fill="white" />
        <polyline
          points="420,72 433,81 407,93 433,105 407,117 420,128"
          fill="none" stroke="#334155" strokeWidth="1.8" strokeLinejoin="round"
        />

        {/* Labels */}
        <text x="42" y="104" textAnchor="middle" fontSize="14" fill="#0f172a" fontWeight="600">
          {sig(voltage)} V
        </text>
        <text x="458" y="104" textAnchor="start" fontSize="13" fill="#0f172a" fontWeight="600">
          {fmtR(R)}
        </text>

        {/* Current direction */}
        <polygon points="240,44 250,50 240,56" fill="#3b82f6" opacity="0.6" />
        <text x="254" y="54" fontSize="10" fill="#3b82f6" opacity="0.7" fontStyle="italic">I</text>

        {/* Animated charge dots */}
        {dots.map(([x, y], i) => (
          <circle key={i} cx={x} cy={y} r="3.5" fill="#3b82f6" opacity="0.8" />
        ))}
      </svg>

      {/* ── Sliders ── */}
      <div className="grid grid-cols-2 gap-x-6 gap-y-1 px-3 mb-3">
        <label className="block">
          <span className="text-xs uppercase tracking-wide text-slate-500 font-medium">
            Voltage — {sig(voltage)} V
          </span>
          <input type="range" min="0.5" max="24" step="0.5" value={voltage}
            onChange={e => setVoltage(+e.target.value)} className="w-full mt-1 accent-blue-500" />
        </label>
        <label className="block">
          <span className="text-xs uppercase tracking-wide text-slate-500 font-medium">
            Resistance — {fmtR(R)}
          </span>
          <input type="range" min="0" max={R_VALS.length - 1} step="1" value={ri}
            onChange={e => setRi(+e.target.value)} className="w-full mt-1 accent-blue-500" />
        </label>
      </div>

      {/* ── V-I graph ── */}
      <svg viewBox="0 0 500 195" className="w-full block">
        {/* Grid */}
        {yTicks.slice(1).map((iv, i) => (
          <line key={i} x1={gx} y1={toY(iv)} x2={gx + gw} y2={toY(iv)} stroke="#f1f5f9" strokeWidth="1" />
        ))}
        {[5, 10, 15, 20, 25].map(v => (
          <line key={v} x1={toX(v)} y1={gy} x2={toX(v)} y2={gy + gh} stroke="#f1f5f9" strokeWidth="1" />
        ))}

        {/* Axes */}
        <line x1={gx} y1={gy + gh} x2={gx + gw} y2={gy + gh} stroke="#94a3b8" strokeWidth="1" />
        <line x1={gx} y1={gy} x2={gx} y2={gy + gh} stroke="#94a3b8" strokeWidth="1" />

        {/* X-axis ticks + labels */}
        {[0, 5, 10, 15, 20, 25].map(v => (
          <g key={v}>
            <line x1={toX(v)} y1={gy + gh} x2={toX(v)} y2={gy + gh + 4} stroke="#94a3b8" strokeWidth="1" />
            <text x={toX(v)} y={gy + gh + 16} textAnchor="middle" fontSize="10" fill="#94a3b8">{v}</text>
          </g>
        ))}
        <text x={gx + gw / 2} y={gy + gh + 32} textAnchor="middle" fontSize="11" fill="#64748b">
          Voltage (V)
        </text>

        {/* Y-axis ticks + labels */}
        {yTicks.map((iv, i) => (
          <g key={i}>
            <line x1={gx - 4} y1={toY(iv)} x2={gx} y2={toY(iv)} stroke="#94a3b8" strokeWidth="1" />
            <text x={gx - 7} y={toY(iv) + 3} textAnchor="end" fontSize="9" fill="#94a3b8">
              {i === 0 ? '0' : fmtI(iv)}
            </text>
          </g>
        ))}
        <text x="14" y={gy + gh / 2} textAnchor="middle" fontSize="11" fill="#64748b"
          transform={`rotate(-90 14 ${gy + gh / 2})`}>
          Current
        </text>

        {/* Ohm's law line (slope = 1/R) */}
        <line x1={toX(0)} y1={toY(0)} x2={toX(lineEndV)} y2={toY(lineEndI)}
          stroke="#3b82f6" strokeWidth="2" opacity="0.35" />

        {/* Dashed projections from operating point to axes */}
        <line x1={toX(voltage)} y1={toY(I)} x2={toX(voltage)} y2={toY(0)}
          stroke="#3b82f6" strokeWidth="1" strokeDasharray="3 3" opacity="0.25" />
        <line x1={toX(voltage)} y1={toY(I)} x2={toX(0)} y2={toY(I)}
          stroke="#3b82f6" strokeWidth="1" strokeDasharray="3 3" opacity="0.25" />

        {/* Operating point */}
        <circle cx={toX(voltage)} cy={toY(I)} r="5" fill="#3b82f6" />

        {/* Slope label near midpoint of line */}
        <text
          x={toX(lineEndV * 0.5) + 14}
          y={toY(lineEndI * 0.5) - 8}
          fontSize="11" fill="#3b82f6" fontWeight="500" opacity="0.7"
        >
          slope = 1/R
        </text>
      </svg>

      {/* ── Readouts ── */}
      <div className="flex flex-wrap gap-6 justify-center text-sm text-slate-600 mt-1">
        <span>I = <b className="text-slate-900">{fmtI(I)}</b></span>
        <span>P = <b className="text-slate-900">{fmtP(P)}</b></span>
      </div>
    </div>
  );
}
