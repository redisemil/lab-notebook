import { useState, useCallback, type ReactNode } from 'react';

const COLS = 10;
const ROWS = 5;
const TOTAL = COLS * ROWS;

type Node = { value: number; addr: number };

function fmtAddr(i: number) {
  return '0x' + (0x40 + i * 8).toString(16).toUpperCase().padStart(3, '0');
}

function pickAddr(used: Set<number>): number | null {
  const free: number[] = [];
  for (let i = 0; i < TOTAL; i++) if (!used.has(i)) free.push(i);
  if (!free.length) return null;
  return free[Math.floor(Math.random() * free.length)];
}

function initialNodes(): Node[] {
  const used = new Set<number>();
  const ns: Node[] = [];
  for (const v of [10, 20, 30, 40]) {
    const a = pickAddr(used);
    if (a === null) break;
    used.add(a);
    ns.push({ value: v, addr: a });
  }
  return ns;
}

export function LinkedListDualView() {
  const [nodes, setNodes] = useState<Node[]>(() => initialNodes());
  const [caption, setCaption] = useState<ReactNode>(
    'Click a button to begin. Notice how the logical view stays orderly while the memory view shows nodes scattered at unrelated addresses.',
  );
  const [valueInput, setValueInput] = useState('');

  const used = new Set(nodes.map((n) => n.addr));

  const reset = useCallback(() => {
    setNodes(initialNodes());
    setCaption(
      <>
        Re-scrambled. Same logical list, but the four nodes now sit at <b>different random addresses</b>. The list order has nothing to do with the memory order.
      </>,
    );
  }, []);

  const insertHead = () => {
    const a = pickAddr(used);
    if (a === null) {
      setCaption('Out of memory in this demo grid. Re-scramble or delete first.');
      return;
    }
    const v = valueInput ? parseInt(valueInput, 10) : Math.floor(Math.random() * 90) + 5;
    setNodes([{ value: v, addr: a }, ...nodes]);
    setValueInput('');
    setCaption(
      <>
        Inserted <b>{v}</b> at head — landed at <b>{fmtAddr(a)}</b>. We allocated one node and rewired two pointers (head → new, new → old head). <b>O(1)</b>, no walking required.
      </>,
    );
  };

  const insertTail = () => {
    const a = pickAddr(used);
    if (a === null) {
      setCaption('Out of memory in this demo grid. Re-scramble or delete first.');
      return;
    }
    const v = valueInput ? parseInt(valueInput, 10) : Math.floor(Math.random() * 90) + 5;
    const stepCount = nodes.length;
    setNodes([...nodes, { value: v, addr: a }]);
    setValueInput('');
    setCaption(
      <>
        Inserted <b>{v}</b> at tail — landed at <b>{fmtAddr(a)}</b>. To find the last node we had to follow {stepCount} pointer hop{stepCount === 1 ? '' : 's'} through scattered memory. <b>O(n)</b> — the cost of not knowing where the end is.
      </>,
    );
  };

  const deleteHead = () => {
    if (!nodes.length) {
      setCaption('List is empty. Insert something first.');
      return;
    }
    const removed = nodes[0];
    setNodes(nodes.slice(1));
    setCaption(
      <>
        Deleted head (value <b>{removed.value}</b>). Address <b>{fmtAddr(removed.addr)}</b> is freed. The head pointer now points to whatever node was second. <b>O(1)</b>.
      </>,
    );
  };

  return (
    <div className="my-8 not-prose">
      <div className="mb-5">
        <p className="text-xs uppercase tracking-wide text-slate-500 font-medium mb-2">
          Logical view — what we usually draw
        </p>
        <LogicalView nodes={nodes} />
      </div>

      <div className="mb-5">
        <p className="text-xs uppercase tracking-wide text-slate-500 font-medium mb-2">
          Memory view — what actually exists in RAM
        </p>
        <MemoryView nodes={nodes} />
      </div>

      <div className="flex flex-wrap gap-2 items-center mb-3">
        <input
          type="number"
          value={valueInput}
          onChange={(e) => setValueInput(e.target.value)}
          placeholder="value"
          className="w-20 px-2 py-1.5 text-sm border border-slate-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
        />
        <button onClick={insertHead} className="px-3 py-1.5 text-sm border border-slate-300 rounded hover:bg-slate-50 active:bg-slate-100">Insert at head</button>
        <button onClick={insertTail} className="px-3 py-1.5 text-sm border border-slate-300 rounded hover:bg-slate-50 active:bg-slate-100">Insert at tail</button>
        <button onClick={deleteHead} className="px-3 py-1.5 text-sm border border-slate-300 rounded hover:bg-slate-50 active:bg-slate-100">Delete head</button>
        <button onClick={reset} className="px-3 py-1.5 text-sm border border-slate-300 rounded hover:bg-slate-50 active:bg-slate-100">Re-scramble</button>
      </div>

      <div className="text-sm leading-relaxed text-slate-700 px-3.5 py-2.5 bg-slate-50 rounded min-h-[2.5rem]">
        {caption}
      </div>
    </div>
  );
}

function LogicalView({ nodes }: { nodes: Node[] }) {
  const W = 680, H = 80, NODE_W = 64, NODE_H = 36, GAP = 22;
  const startX = 50;
  const y = (H - NODE_H) / 2;

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full block" preserveAspectRatio="xMidYMid meet">
      <defs>
        <marker id="ll-arr-logical" markerWidth="8" markerHeight="8" refX="7" refY="4" orient="auto">
          <polygon points="0,0 8,4 0,8" fill="#64748b" />
        </marker>
      </defs>
      <text x={startX - 12} y={y + NODE_H / 2 + 4} textAnchor="end" fontSize="11" fill="#2563eb" fontWeight={500}>
        head →
      </text>
      {nodes.length === 0 && (
        <text x={startX + 10} y={y + NODE_H / 2 + 4} fontSize="13" fill="#94a3b8">∅</text>
      )}
      {nodes.map((n, i) => {
        const x = startX + i * (NODE_W + GAP);
        const isLast = i === nodes.length - 1;
        return (
          <g key={n.addr}>
            <rect x={x} y={y} width={NODE_W} height={NODE_H} rx="4" fill="#f1f5f9" stroke="#cbd5e1" strokeWidth="0.5" />
            <line x1={x + NODE_W * 0.6} y1={y + 4} x2={x + NODE_W * 0.6} y2={y + NODE_H - 4} stroke="#e2e8f0" strokeWidth="0.5" />
            <text x={x + NODE_W * 0.3} y={y + NODE_H / 2 + 4} textAnchor="middle" fontSize="14" fontWeight={500} fill="#0f172a">{n.value}</text>
            <text x={x + NODE_W * 0.8} y={y + NODE_H / 2 + 4} textAnchor="middle" fontSize="13" fill="#64748b">{isLast ? '∅' : '•'}</text>
            {!isLast && (
              <line x1={x + NODE_W} y1={y + NODE_H / 2} x2={x + NODE_W + GAP - 2} y2={y + NODE_H / 2} stroke="#64748b" strokeWidth="1" markerEnd="url(#ll-arr-logical)" />
            )}
          </g>
        );
      })}
    </svg>
  );
}

function MemoryView({ nodes }: { nodes: Node[] }) {
  const W = 680, H = 250, PAD_X = 14, PAD_TOP = 26, PAD_BOT = 14;
  const CELL_W = (W - 2 * PAD_X) / COLS;
  const CELL_H = (H - PAD_TOP - PAD_BOT) / ROWS;

  const addrMap: Record<number, Node> = {};
  for (const n of nodes) addrMap[n.addr] = n;

  const cells: { idx: number; x: number; y: number; node: Node | undefined }[] = [];
  for (let r = 0; r < ROWS; r++) {
    for (let c = 0; c < COLS; c++) {
      const idx = r * COLS + c;
      const x = PAD_X + c * CELL_W;
      const y = PAD_TOP + r * CELL_H;
      cells.push({ idx, x, y, node: addrMap[idx] });
    }
  }

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full block" preserveAspectRatio="xMidYMid meet">
      <defs>
        <marker id="ll-arr-memory" markerWidth="9" markerHeight="9" refX="8" refY="4.5" orient="auto">
          <polygon points="0,0 9,4.5 0,9" fill="#7F77DD" />
        </marker>
      </defs>
      {cells.map(({ idx, x, y, node }) => (
        <g key={idx}>
          <rect
            x={x + 1}
            y={y + 1}
            width={CELL_W - 2}
            height={CELL_H - 2}
            rx="3"
            fill={node ? '#f1f5f9' : 'transparent'}
            stroke={node ? '#cbd5e1' : '#e2e8f0'}
            strokeWidth="0.5"
          />
          <text x={x + 5} y={y + 12} fontSize="9" fill="#94a3b8" fontFamily="ui-monospace, SFMono-Regular, Menlo, monospace">
            {fmtAddr(idx)}
          </text>
          {node && (
            <text x={x + CELL_W / 2} y={y + CELL_H / 2 + 6} textAnchor="middle" fontSize="13" fontWeight={500} fill="#0f172a">
              {node.value}
            </text>
          )}
        </g>
      ))}
      {nodes.map((n, i) => {
        if (i === nodes.length - 1) return null;
        const a = n.addr, b = nodes[i + 1].addr;
        const ar = Math.floor(a / COLS), ac = a % COLS;
        const br = Math.floor(b / COLS), bc = b % COLS;
        const ax = PAD_X + ac * CELL_W + CELL_W / 2;
        const ay = PAD_TOP + ar * CELL_H + CELL_H / 2;
        const bx = PAD_X + bc * CELL_W + CELL_W / 2;
        const by = PAD_TOP + br * CELL_H + CELL_H / 2;
        const dx = bx - ax, dy = by - ay;
        const len = Math.sqrt(dx * dx + dy * dy) || 1;
        const nx = -dy / len, ny = dx / len;
        const off = Math.min(36, len * 0.18);
        const cx = (ax + bx) / 2 + nx * off;
        const cy = (ay + by) / 2 + ny * off;
        const tEnd = 0.92;
        const ex = (1 - tEnd) * (1 - tEnd) * ax + 2 * (1 - tEnd) * tEnd * cx + tEnd * tEnd * bx;
        const ey = (1 - tEnd) * (1 - tEnd) * ay + 2 * (1 - tEnd) * tEnd * cy + tEnd * tEnd * by;
        return (
          <path
            key={`${a}-${b}`}
            d={`M${ax},${ay} Q${cx},${cy} ${ex},${ey}`}
            fill="none"
            stroke="#7F77DD"
            strokeWidth="1.2"
            opacity="0.85"
            markerEnd="url(#ll-arr-memory)"
          />
        );
      })}
      {nodes.length > 0 && (() => {
        const ha = nodes[0].addr;
        const hr = Math.floor(ha / COLS), hc = ha % COLS;
        const hx = PAD_X + hc * CELL_W + CELL_W / 2;
        const hy = PAD_TOP + hr * CELL_H;
        return (
          <text x={hx} y={hy - 5} textAnchor="middle" fontSize="10" fill="#2563eb" fontWeight={500}>
            head
          </text>
        );
      })()}
    </svg>
  );
}
