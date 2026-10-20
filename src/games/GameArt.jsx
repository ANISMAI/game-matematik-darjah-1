// Seni SVG untuk permainan Fasa 2. Semua bentuk dilukis di sekitar (0,0) dan diletakkan dengan transform.
import NinjaCharacter from '../components/NinjaCharacter.jsx';

export const OUT = '#3b2a1a';

export function Lantern({ x = 0, y = 0, s = 1 }) {
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`}>
      <line x1="0" y1="-34" x2="0" y2="-27" stroke={OUT} strokeWidth="2.5" />
      <rect x="-11" y="-28" width="22" height="6" rx="2" fill="#ffb703" stroke={OUT} strokeWidth="1.8" />
      <ellipse cx="0" cy="0" rx="22" ry="24" fill="#e63946" stroke={OUT} strokeWidth="2.5" />
      <path d="M-11 -20 q-8 20 0 40 M11 -20 q8 20 0 40 M0 -23 v46" stroke="#7a1030" strokeOpacity=".3" strokeWidth="2" fill="none" />
      <ellipse cx="-8" cy="-7" rx="4" ry="7" fill="#ff8fa3" opacity=".75" />
      <rect x="-11" y="22" width="22" height="6" rx="2" fill="#ffb703" stroke={OUT} strokeWidth="1.8" />
      <path d="M-5 28 v6 M0 28 v8 M5 28 v6" stroke="#ffb703" strokeWidth="2.5" strokeLinecap="round" />
    </g>
  );
}

// Buah oren (sama saiz untuk semua bakul)
export function Fruit({ x = 0, y = 0, r = 16 }) {
  return (
    <g transform={`translate(${x} ${y})`}>
      <circle r={r} fill="#ff9f1c" stroke={OUT} strokeWidth="2" />
      <ellipse cx={-r * 0.35} cy={-r * 0.35} rx={r * 0.25} ry={r * 0.35} fill="#ffd29a" opacity=".8" />
      <path d={`M0 ${-r} q${r * 0.5} ${-r * 0.6} ${r * 0.9} ${-r * 0.35}`} fill="#4caf50" stroke={OUT} strokeWidth="1.5" />
    </g>
  );
}

export function Apple({ x = 0, y = 0, s = 1 }) {
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`}>
      <path d="M0 -18 q-2 -8 3 -13" stroke="#6b4423" strokeWidth="3" fill="none" strokeLinecap="round" />
      <ellipse cx="9" cy="-24" rx="7" ry="3.5" fill="#4caf50" transform="rotate(-25 9 -24)" />
      <path d="M0 -16 C-14 -26 -24 -12 -21 3 C-18 18 -8 22 0 18 C8 22 18 18 21 3 C24 -12 14 -26 0 -16Z" fill="#ef476f" stroke={OUT} strokeWidth="2.2" />
      <ellipse cx="-10" cy="-4" rx="4" ry="7" fill="#ff99ac" opacity=".75" />
    </g>
  );
}

// Skrol kertas bernombor (lebar w, tinggi h, berpusat)
export function ScrollCard({ w = 170, h = 112, label, fontSize = 64 }) {
  return (
    <g>
      <rect x={-w / 2 + 4} y={-h / 2 + 6} width={w} height={h} rx="12" fill="#1a1006" opacity=".18" />
      <rect x={-w / 2} y={-h / 2} width={w} height={h} rx="12" fill="#fdf0d5" stroke={OUT} strokeWidth="3" />
      <rect x={-w / 2 - 8} y={-h / 2 - 8} width="18" height={h + 16} rx="9" fill="#c68b4e" stroke={OUT} strokeWidth="2.5" />
      <rect x={w / 2 - 10} y={-h / 2 - 8} width="18" height={h + 16} rx="9" fill="#c68b4e" stroke={OUT} strokeWidth="2.5" />
      {label !== undefined && (
        <text className="g-num" y={fontSize * 0.35} textAnchor="middle" fontSize={fontSize}>
          {label}
        </text>
      )}
    </g>
  );
}

// Bakul anyaman (berpusat). Isi buah dilukis oleh pemanggil.
export function Basket({ w = 230, h = 150, tag }) {
  const top = -h / 2 + 30;
  return (
    <g>
      <ellipse cx="0" cy={h / 2 + 4} rx={w * 0.45} ry="10" fill="#1a1006" opacity=".2" />
      <path d={`M${-w * 0.36} ${top} Q0 ${top - 70} ${w * 0.36} ${top}`} stroke="#a66a2c" strokeWidth="7" fill="none" />
      <path
        d={`M${-w / 2} ${top} h${w} l${-w * 0.08} ${h - 30} q${-w * 0.42} 12 ${-w * 0.84} 0z`}
        fill="#e0a95a"
        stroke={OUT}
        strokeWidth="3"
        strokeLinejoin="round"
      />
      <path d={`M${-w / 2 + 6} ${top + 40} h${w - 12} M${-w / 2 + 10} ${top + 80} h${w - 20}`} stroke="#a66a2c" strokeWidth="3" opacity=".7" />
      {tag && (
        <g transform={`translate(${-w / 2 + 6} ${top - 8})`}>
          <circle r="20" fill="#fffdf6" stroke={OUT} strokeWidth="3" />
          <text className="g-tag" y="9" textAnchor="middle">
            {tag}
          </text>
        </g>
      )}
    </g>
  );
}

// Batu sungai bernombor (berpusat)
export function Stone({ rx = 70, ry = 52, label }) {
  return (
    <g>
      <ellipse cx="0" cy={ry * 0.35} rx={rx} ry={ry} fill="#5d6675" />
      <ellipse cx="0" cy="0" rx={rx} ry={ry} fill="#aab3c0" stroke={OUT} strokeWidth="3" />
      <ellipse cx={-rx * 0.3} cy={-ry * 0.4} rx={rx * 0.35} ry={ry * 0.22} fill="#d6dce4" opacity=".8" />
      {label !== undefined && (
        <text className="g-num" y="20" textAnchor="middle" fontSize="58">
          {label}
        </text>
      )}
    </g>
  );
}

// Papan jambatan / jubin nombor (berpusat)
export function Plank({ w = 150, h = 100, label, fontSize = 58 }) {
  return (
    <g>
      <rect x={-w / 2 + 3} y={-h / 2 + 6} width={w} height={h} rx="10" fill="#1a1006" opacity=".22" />
      <rect x={-w / 2} y={-h / 2} width={w} height={h} rx="10" fill="#d9a35e" stroke={OUT} strokeWidth="3" />
      <path d={`M${-w / 2 + 10} ${-h / 4} h${w * 0.35} M${w * 0.05} ${h / 4} h${w * 0.35}`} stroke="#a8703a" strokeWidth="2.5" opacity=".7" />
      <circle cx={-w / 2 + 12} cy={-h / 2 + 12} r="4" fill="#5c3a1c" />
      <circle cx={w / 2 - 12} cy={-h / 2 + 12} r="4" fill="#5c3a1c" />
      {label !== undefined && (
        <g>
          <circle r={h * 0.4} fill="#fffdf6" stroke={OUT} strokeWidth="2.5" />
          <text className="g-num" y={fontSize * 0.35} textAnchor="middle" fontSize={fontSize}>
            {label}
          </text>
        </g>
      )}
    </g>
  );
}

// Pintu dojo (shoji). Semua pintu sama kecuali nombor. open = panel bergerak ke tepi.
export function Door({ w = 170, h = 240, label, open = false, tried = false }) {
  const pw = w / 2 - 10;
  const panel = (side) => (
    <g className={`door-panel door-${side}${open ? ' is-open' : ''}`}>
      <rect x={side === 'l' ? -w / 2 + 10 : 0} y={-h / 2 + 46} width={pw} height={h - 56} fill="#fff8e7" stroke={OUT} strokeWidth="2.5" />
      {[1, 2, 3].map((i) => (
        <line
          key={i}
          x1={side === 'l' ? -w / 2 + 10 : 0}
          x2={side === 'l' ? -10 : pw}
          y1={-h / 2 + 46 + ((h - 56) / 4) * i}
          y2={-h / 2 + 46 + ((h - 56) / 4) * i}
          stroke="#c9a46b"
          strokeWidth="2"
        />
      ))}
      <line
        x1={side === 'l' ? -w / 4 - 5 : pw / 2}
        x2={side === 'l' ? -w / 4 - 5 : pw / 2}
        y1={-h / 2 + 46}
        y2={h / 2 - 10}
        stroke="#c9a46b"
        strokeWidth="2"
      />
    </g>
  );
  return (
    <g>
      <rect x={-w / 2 + 4} y={-h / 2 + 8} width={w} height={h} rx="8" fill="#1a1006" opacity=".2" />
      {/* bingkai dan bahagian dalam */}
      <rect x={-w / 2} y={-h / 2 + 36} width={w} height={h - 36} rx="6" fill="#7a4a26" stroke={OUT} strokeWidth="3" />
      <rect x={-w / 2 + 10} y={-h / 2 + 46} width={w - 20} height={h - 56} fill="#ffe7a8" />
      {open && (
        <g transform={`translate(0 ${h / 2 - 12})`}>
          <g transform="translate(-34 -92)">
            <NinjaCharacter size={68} mood="cheer" className="ninja-jump" />
          </g>
        </g>
      )}
      <g clipPath={undefined}>
        {panel('l')}
        {panel('r')}
      </g>
      {/* bumbung */}
      <path d={`M${-w / 2 - 16} ${-h / 2 + 40} L0 ${-h / 2 + 6} L${w / 2 + 16} ${-h / 2 + 40}z`} fill="#c0392b" stroke={OUT} strokeWidth="3" strokeLinejoin="round" />
      {/* papan nombor */}
      <circle cx="0" cy={-h / 2 + 4} r="34" fill="#fffdf6" stroke={OUT} strokeWidth="3" />
      <text className="g-num" y={-h / 2 + 22} textAnchor="middle" fontSize="50">
        {label}
      </text>
      {tried && (
        <g transform={`translate(0 ${h / 2 - 50})`}>
          <rect x="-58" y="-20" width="116" height="40" rx="20" fill="#fffdf6" stroke={OUT} strokeWidth="2.5" strokeDasharray="6 4" />
          <text className="g-small" y="8" textAnchor="middle">
            ✗ Cuba lagi
          </text>
        </g>
      )}
    </g>
  );
}

// Kepingan teka-teki skrol: penyambung neutral (tab kanan / soket kiri) sama untuk semua calon jawapan.
export function piecePath(w, h, socketLeft, tabRight) {
  const r = 16;
  const x0 = -w / 2;
  const x1 = w / 2;
  const y0 = -h / 2;
  const y1 = h / 2;
  const left = socketLeft ? `L${x0} ${r} A${r} ${r} 0 0 0 ${x0} ${-r}` : '';
  const right = tabRight ? `L${x1} ${-r} A${r} ${r} 0 0 1 ${x1} ${r}` : '';
  return `M${x0 + 10} ${y0} H${x1 - 10} Q${x1} ${y0} ${x1} ${y0 + 10} ${right} L${x1} ${y1 - 10} Q${x1} ${y1} ${x1 - 10} ${y1} H${x0 + 10} Q${x0} ${y1} ${x0} ${y1 - 10} ${left} L${x0} ${y0 + 10} Q${x0} ${y0} ${x0 + 10} ${y0}Z`;
}

export const PIECE_SHAPE = {
  start: [false, true],
  op: [true, true],
  result: [true, false],
};

export function PuzzlePiece({ kind, label, w = 200, h = 110, dashed = false, fill = '#fdf0d5' }) {
  const [socket, tab] = PIECE_SHAPE[kind];
  return (
    <g>
      {!dashed && <path d={piecePath(w, h, socket, tab)} transform="translate(4 6)" fill="#1a1006" opacity=".18" />}
      <path
        d={piecePath(w, h, socket, tab)}
        fill={dashed ? 'rgba(255,253,246,.55)' : fill}
        stroke={OUT}
        strokeWidth="3"
        strokeDasharray={dashed ? '10 7' : undefined}
      />
      {label !== undefined && (
        <text className="g-num" y="22" textAnchor="middle" fontSize="62">
          {label}
        </text>
      )}
    </g>
  );
}

// Tanda status (bukan warna sahaja): ✓ dalam bulatan
export function Tick({ x = 0, y = 0, r = 18 }) {
  return (
    <g transform={`translate(${x} ${y})`} aria-hidden="true">
      <circle r={r} fill="#2a9d8f" stroke="#fff" strokeWidth="3" />
      <path d={`M${-r * 0.45} 0 l${r * 0.3} ${r * 0.35} l${r * 0.6} ${-r * 0.7}`} stroke="#fff" strokeWidth="4" fill="none" strokeLinecap="round" strokeLinejoin="round" />
    </g>
  );
}

// Tanda "belum betul": ! dalam bulatan bergaris putus
export function Bang({ x = 0, y = 0, r = 18 }) {
  return (
    <g transform={`translate(${x} ${y})`} aria-hidden="true">
      <circle r={r} fill="#fff4dd" stroke="#b5541c" strokeWidth="3" strokeDasharray="5 3" />
      <text className="g-small" y="9" textAnchor="middle" fill="#8a4b12">
        !
      </text>
    </g>
  );
}

// Bendera mula
export function StartFlag({ x = 0, y = 0 }) {
  return (
    <g transform={`translate(${x} ${y})`} aria-hidden="true">
      <rect x="-3" y="-80" width="6" height="84" rx="2" fill="#7a4a26" stroke={OUT} strokeWidth="1.5" />
      <path d="M3 -78 h44 l-10 14 l10 14 h-44z" fill="#ef476f" stroke={OUT} strokeWidth="2.5" strokeLinejoin="round" />
      <text className="g-tiny" x="22" y="-60" textAnchor="middle" fill="#fff">
        Mula
      </text>
    </g>
  );
}

// Ninja kecil berdiri (berpusat pada kaki)
export function MiniNinja({ x = 0, y = 0, size = 70, mood = 'idle', className = '' }) {
  return (
    <g transform={`translate(${x - size / 2} ${y - size * (140 / 120)})`} className={className}>
      <NinjaCharacter size={size} mood={mood} className={mood === 'cheer' ? 'ninja-jump' : ''} />
    </g>
  );
}

// Tangan penunjuk untuk demo
export function Hand() {
  return (
    <g aria-hidden="true">
      <path
        d="M0 0 l0 -34 q0 -9 8 -9 q8 0 8 9 v22 q4 -6 10 -3 q5 3 4 9 q5 -4 10 -1 q5 3 3 10 q5 -3 9 1 q4 4 1 13 l-8 24 q-4 10 -14 10 h-18 q-9 0 -14 -8 l-14 -24 q-5 -8 2 -12 q7 -4 13 4z"
        fill="#ffe0bd"
        stroke={OUT}
        strokeWidth="3"
        strokeLinejoin="round"
        transform="translate(-8 34)"
      />
    </g>
  );
}

// Grid susunan objek: n objek, maks `per` sebaris, berpusat pada (cx, cy)
export function gridPositions(n, cx, cy, gapX, gapY, per = 5) {
  const rows = Math.ceil(n / per);
  const out = [];
  for (let i = 0; i < n; i++) {
    const row = Math.floor(i / per);
    const inRow = row === rows - 1 ? n - row * per : per;
    const col = i - row * per;
    out.push([cx + (col - (inRow - 1) / 2) * gapX, cy + (row - (rows - 1) / 2) * gapY]);
  }
  return out;
}
