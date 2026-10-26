// Seni SVG untuk permainan Fasa 2. Semua bentuk dilukis di sekitar (0,0) dan diletakkan dengan transform.
import NinjaCharacter from '../components/NinjaCharacter.jsx';

export const OUT = '#3b2a1a';

// Gradien dikongsi untuk buah (ditakrif sekali; dirujuk oleh Apple/Fruit).
// Letak <ArtDefs /> sekali di dalam setiap <svg> game yang guna buah.
export function ArtDefs() {
  return (
    <defs>
      <radialGradient id="art-apple" cx="38%" cy="32%" r="72%">
        <stop offset="0" stopColor="#ff8aa0" />
        <stop offset="45%" stopColor="#ef476f" />
        <stop offset="100%" stopColor="#c9184a" />
      </radialGradient>
      <radialGradient id="art-orange" cx="38%" cy="32%" r="72%">
        <stop offset="0" stopColor="#ffd08a" />
        <stop offset="45%" stopColor="#ff9f1c" />
        <stop offset="100%" stopColor="#e07b00" />
      </radialGradient>
      <linearGradient id="art-leaf" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0" stopColor="#7ed957" />
        <stop offset="1" stopColor="#3c8c22" />
      </linearGradient>
    </defs>
  );
}

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

// Buah oren berkilat (guna gradien dari <ArtDefs />). Saiz melalui r.
export function Fruit({ x = 0, y = 0, r = 16 }) {
  return (
    <g transform={`translate(${x} ${y})`}>
      <ellipse cx="0" cy={r * 0.95} rx={r * 0.85} ry={r * 0.25} fill="#1a1006" opacity="0.18" />
      <circle r={r} fill="url(#art-orange)" stroke="#b86500" strokeWidth="1.5" />
      <ellipse cx={-r * 0.34} cy={-r * 0.36} rx={r * 0.3} ry={r * 0.42} fill="#fff" opacity="0.55" />
      <circle cx={0} cy={-r} r={r * 0.14} fill="#7a4a12" />
      <path d={`M${r * 0.08} ${-r} q${r * 0.55} ${-r * 0.5} ${r * 0.95} ${-r * 0.18}`} fill="url(#art-leaf)" stroke="#2e6b18" strokeWidth="1" />
    </g>
  );
}

export function Apple({ x = 0, y = 0, s = 1 }) {
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`}>
      <ellipse cx="0" cy="21" rx="18" ry="5" fill="#1a1006" opacity="0.18" />
      {/* tangkai & daun */}
      <path d="M0 -17 q-3 -9 2 -14" stroke="#7a4a12" strokeWidth="3.4" fill="none" strokeLinecap="round" />
      <path d="M2 -24 q10 -8 17 -3 q-5 9 -17 3Z" fill="url(#art-leaf)" stroke="#2e6b18" strokeWidth="1.2" />
      {/* badan epal berkilat */}
      <path
        d="M0 -15 C-14 -25 -25 -11 -22 4 C-19 19 -8 23 0 19 C8 23 19 19 22 4 C25 -11 14 -25 0 -15Z"
        fill="url(#art-apple)"
        stroke="#9e1239"
        strokeWidth="1.6"
      />
      {/* kilauan */}
      <ellipse cx="-9" cy="-4" rx="4.5" ry="8" fill="#fff" opacity="0.6" transform="rotate(-18 -9 -4)" />
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

// Bakul rotan (berpusat). Isi buah dilukis oleh pemanggil.
export function Basket({ w = 230, h = 150, tag }) {
  const top = -h / 2 + 30;
  const bw = w * 0.84; // lebar dasar (badan mengecut ke bawah)
  const gid = `art-basket-${Math.round(w)}-${Math.round(h)}`;
  // garis anyaman menegak
  const weaves = [];
  for (let i = 1; i < 9; i++) {
    const t = i / 9;
    const xTop = -w / 2 + w * t;
    const xBot = -bw / 2 + bw * t;
    weaves.push(<path key={i} d={`M${xTop} ${top + 6} L${xBot} ${top + h - 32}`} stroke="#9c5e28" strokeWidth="2" opacity="0.4" />);
  }
  return (
    <g>
      <defs>
        <linearGradient id={gid} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#f0bd77" />
          <stop offset="1" stopColor="#c6823a" />
        </linearGradient>
      </defs>
      <ellipse cx="0" cy={h / 2 + 4} rx={w * 0.45} ry="11" fill="#1a1006" opacity=".2" />
      {/* pemegang */}
      <path d={`M${-w * 0.34} ${top} Q0 ${top - 72} ${w * 0.34} ${top}`} stroke="#b06f2e" strokeWidth="9" fill="none" strokeLinecap="round" />
      <path d={`M${-w * 0.34} ${top} Q0 ${top - 72} ${w * 0.34} ${top}`} stroke="#d99a50" strokeWidth="3.5" fill="none" strokeLinecap="round" />
      {/* badan */}
      <path
        d={`M${-w / 2} ${top} h${w} l${-(w - bw) / 2} ${h - 32} q${-bw / 2} 14 ${-bw} 0z`}
        fill={`url(#${gid})`}
        stroke="#7a4a12"
        strokeWidth="3"
        strokeLinejoin="round"
      />
      <g clipPath="none">{weaves}</g>
      {/* bibir atas bakul */}
      <rect x={-w / 2 - 3} y={top - 9} width={w + 6} height="16" rx="8" fill="#d99a50" stroke="#7a4a12" strokeWidth="3" />
      <path d={`M${-w / 2 + 2} ${top - 1} h${w - 4}`} stroke="#b06f2e" strokeWidth="2" opacity="0.6" />
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

// Shuriken (bintang ninja) berpusat. Senang dikira; warna keluli dengan kilauan.
export function Shuriken({ x = 0, y = 0, s = 1 }) {
  // 4 bilah bintang
  const blade = 'M0 -22 L7 -7 L22 0 L7 7 L0 22 L-7 7 L-22 0 L-7 -7 Z';
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`}>
      <ellipse cx="0" cy="24" rx="18" ry="4.5" fill="#1a1006" opacity="0.14" />
      <path d={blade} fill="#5b6472" stroke="#2f3640" strokeWidth="2.2" strokeLinejoin="round" transform="rotate(45)" />
      <path d={blade} fill="#8d97a6" stroke="#2f3640" strokeWidth="2.2" strokeLinejoin="round" />
      <path d="M0 -12 L4 -4 L-3 -2 Z" fill="#cfd6df" opacity="0.8" />
      <circle r="6.5" fill="#39404b" stroke="#2f3640" strokeWidth="2" />
      <circle r="2.6" fill="#aeb6c2" />
    </g>
  );
}

// Bekas ninja: mangkuk kayu Jepun (berpusat). Isi objek dilukis oleh pemanggil.
export function NinjaPot({ w = 220, h = 150, tag }) {
  const top = -h / 2 + 24;
  const bw = w * 0.74;
  const gid = `art-pot-${Math.round(w)}-${Math.round(h)}`;
  return (
    <g>
      <defs>
        <linearGradient id={gid} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#7a4a2b" />
          <stop offset="1" stopColor="#4e2d17" />
        </linearGradient>
      </defs>
      <ellipse cx="0" cy={h / 2 + 2} rx={w * 0.42} ry="10" fill="#1a1006" opacity="0.2" />
      {/* badan mangkuk */}
      <path
        d={`M${-w / 2} ${top} h${w} l${-(w - bw) / 2} ${h - 26} q${-bw / 2} 16 ${-bw} 0z`}
        fill={`url(#${gid})`}
        stroke="#2e1a0d"
        strokeWidth="3"
        strokeLinejoin="round"
      />
      {/* jalur kain merah ninja */}
      <rect x={-w / 2 - 2} y={top + 10} width={w + 4} height="20" fill="#c1121f" opacity="0.92" />
      <rect x={-w / 2 - 2} y={top + 10} width={w + 4} height="5" fill="#8a0c16" />
      {/* bibir atas */}
      <rect x={-w / 2 - 3} y={top - 10} width={w + 6} height="18" rx="9" fill="#8a5a30" stroke="#2e1a0d" strokeWidth="3" />
      {tag && (
        <g transform={`translate(${-w / 2 + 8} ${top - 10})`}>
          <circle r="20" fill="#fffdf6" stroke={OUT} strokeWidth="3" />
          <text className="g-tag" y="9" textAnchor="middle">
            {tag}
          </text>
        </g>
      )}
    </g>
  );
}

// Biskut coklat cip (berpusat)
export function Cookie({ x = 0, y = 0, r = 18 }) {
  const chips = [
    [-0.3, -0.3],
    [0.35, -0.15],
    [-0.1, 0.35],
    [0.15, 0.1],
    [-0.45, 0.2],
    [0.4, 0.4],
  ];
  return (
    <g transform={`translate(${x} ${y})`}>
      <ellipse cx="0" cy={r * 0.9} rx={r * 0.85} ry={r * 0.22} fill="#1a1006" opacity="0.14" />
      <circle r={r} fill="#d9a35c" stroke="#a9742f" strokeWidth="2" />
      <circle r={r * 0.82} fill="#e8b878" opacity="0.6" />
      {chips.map(([cx, cy], i) => (
        <circle key={i} cx={cx * r} cy={cy * r} r={r * 0.14} fill="#5a3416" />
      ))}
    </g>
  );
}

// Balang kaca bernombor (berpusat). Angka dipaparkan pada label.
export function Jar({ w = 150, h = 180, label }) {
  const top = -h / 2;
  return (
    <g>
      <ellipse cx="0" cy={h / 2 + 2} rx={w * 0.42} ry="10" fill="#1a1006" opacity="0.18" />
      {/* badan kaca */}
      <rect x={-w / 2} y={top + 24} width={w} height={h - 24} rx="26" fill="#bfe8fb" stroke="#5aa6cf" strokeWidth="3" opacity="0.85" />
      {/* kilauan kaca */}
      <rect x={-w / 2 + 12} y={top + 40} width="14" height={h - 70} rx="7" fill="#fff" opacity="0.5" />
      {/* leher & penutup */}
      <rect x={-w * 0.34} y={top + 10} width={w * 0.68} height="22" rx="8" fill="#bfe8fb" stroke="#5aa6cf" strokeWidth="3" />
      <rect x={-w * 0.4} y={top - 6} width={w * 0.8} height="22" rx="10" fill="#e07b43" stroke="#a9531f" strokeWidth="3" />
      {label !== undefined && (
        <text y={h * 0.12} textAnchor="middle" fontSize={h * 0.34} fontWeight="800" fill="#1d3a4f">
          {label}
        </text>
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
