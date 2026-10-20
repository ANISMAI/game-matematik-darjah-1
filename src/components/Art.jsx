// Karya seni SVG dikongsi: bentuk tanah, mercu tanda kawasan, hiasan dan objek kiraan.

const rand = (s) => {
  const x = Math.sin(s * 12.9898) * 43758.5453;
  return x - Math.floor(x);
};

// Bentuk organik licin (Catmull-Rom → Bézier) untuk pulau dan kawasan.
export function blobPath(cx, cy, rx, ry, seed = 1, n = 11, jitter = 0.1) {
  const pts = Array.from({ length: n }, (_, i) => {
    const a = (i / n) * Math.PI * 2;
    const r = 1 + (rand(seed * 31 + i) - 0.5) * 2 * jitter;
    return [cx + Math.cos(a) * rx * r, cy + Math.sin(a) * ry * r];
  });
  const p = (i) => pts[(i + n) % n];
  let d = `M${p(0)[0].toFixed(1)},${p(0)[1].toFixed(1)}`;
  for (let i = 0; i < n; i++) {
    const [p0, p1, p2, p3] = [p(i - 1), p(i), p(i + 1), p(i + 2)];
    const c1 = [p1[0] + (p2[0] - p0[0]) / 6, p1[1] + (p2[1] - p0[1]) / 6];
    const c2 = [p2[0] - (p3[0] - p1[0]) / 6, p2[1] - (p3[1] - p1[1]) / 6];
    d += ` C${c1[0].toFixed(1)},${c1[1].toFixed(1)} ${c2[0].toFixed(1)},${c2[1].toFixed(1)} ${p2[0].toFixed(1)},${p2[1].toFixed(1)}`;
  }
  return d + 'Z';
}

const OUT = '#3b2a1a';

export function Tree({ x, y, s = 1, fruit }) {
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`}>
      <rect x="-5" y="-6" width="10" height="22" rx="3" fill="#8a5a33" />
      <circle cx="0" cy="-20" r="22" fill="#4caf50" stroke="#2e7d32" strokeWidth="3" />
      <circle cx="-8" cy="-26" r="7" fill="#7bd17f" />
      {fruit && (
        <>
          <circle cx="8" cy="-14" r="5" fill={fruit} />
          <circle cx="-10" cy="-10" r="5" fill={fruit} />
          <circle cx="4" cy="-30" r="5" fill={fruit} />
        </>
      )}
    </g>
  );
}

export function Bamboo({ x, y, h = 80, s = 1 }) {
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`}>
      <rect x="-4" y={-h} width="8" height={h} rx="3" fill="#5aa53a" stroke="#3c7d24" strokeWidth="2" />
      {[0.25, 0.5, 0.75].map((f) => (
        <line key={f} x1="-4" x2="4" y1={-h * f} y2={-h * f} stroke="#3c7d24" strokeWidth="2" />
      ))}
      <ellipse cx="10" cy={-h * 0.7} rx="10" ry="4" fill="#7cc95a" transform={`rotate(-25 10 ${-h * 0.7})`} />
      <ellipse cx="-10" cy={-h * 0.45} rx="10" ry="4" fill="#7cc95a" transform={`rotate(25 -10 ${-h * 0.45})`} />
    </g>
  );
}

function Flag({ x, y, color, text }) {
  return (
    <g transform={`translate(${x} ${y})`}>
      <rect x="-2" y="-62" width="4" height="62" rx="2" fill="#6b4423" />
      <g className="flag">
        <path d="M2 -60 h30 v34 l-15 -6 l-15 6z" fill={color} stroke={OUT} strokeWidth="2" strokeLinejoin="round" />
        <text x="17" y="-34" textAnchor="middle" className="flag-text">{text}</text>
      </g>
    </g>
  );
}

function Roof({ w, y, color }) {
  return (
    <path
      d={`M${-w / 2 - 10} ${y} Q0 ${y - 30} ${w / 2 + 10} ${y} Q${w / 2 - 4} ${y - 14} ${w / 2 - 14} ${y - 20} H${-w / 2 + 14} Q${-w / 2 + 4} ${y - 14} ${-w / 2 - 10} ${y}Z`}
      fill={color}
      stroke={OUT}
      strokeWidth="2.5"
      strokeLinejoin="round"
    />
  );
}

function Coin({ x, y, r = 10 }) {
  return (
    <g transform={`translate(${x} ${y})`}>
      <circle r={r} fill="#ffcf3f" stroke="#b8860b" strokeWidth="2.5" />
      <circle r={r * 0.6} fill="none" stroke="#e0a800" strokeWidth="1.5" />
    </g>
  );
}

// Mercu tanda bagi setiap kawasan (berpusat pada 0,0; ~150px lebar)
export function Landmark({ type }) {
  switch (type) {
    case 'bamboo':
      return (
        <g>
          <Bamboo x={-70} y={10} h={90} />
          <Bamboo x={-56} y={16} h={70} />
          <Bamboo x={66} y={12} h={86} />
          <rect x="-34" y="-22" width="68" height="40" rx="4" fill="#f7e2b5" stroke={OUT} strokeWidth="2.5" />
          <rect x="-9" y="-6" width="18" height="24" rx="3" fill="#8a5a33" />
          <path d="M-46 -20 L0 -56 L46 -20Z" fill="#d9a441" stroke={OUT} strokeWidth="2.5" strokeLinejoin="round" />
          <path d="M-30 -32 L30 -32" stroke="#b07f25" strokeWidth="3" />
          <Flag x={-30} y={-48} color="#ef476f" text="1" />
          <Flag x={22} y={-50} color="#ffb703" text="2" />
          <Flag x={44} y={-6} color="#4cc9f0" text="3" />
        </g>
      );
    case 'dojo':
      return (
        <g>
          <rect x="-62" y="10" width="124" height="14" rx="4" fill="#d9c1a0" stroke={OUT} strokeWidth="2.5" />
          <rect x="-50" y="-26" width="100" height="38" fill="#fff5e4" stroke={OUT} strokeWidth="2.5" />
          {[-38, -12, 12, 38].map((x) => (
            <rect key={x} x={x - 3} y="-26" width="6" height="38" fill="#a0522d" />
          ))}
          <rect x="-10" y="-16" width="20" height="28" fill="#6b3a1f" />
          <Roof w={110} y={-24} color="#d62839" />
          <rect x="-28" y="-60" width="56" height="18" fill="#fff5e4" stroke={OUT} strokeWidth="2.5" />
          <Roof w={66} y={-58} color="#d62839" />
          <circle cx="0" cy="-51" r="7" fill="#ffd166" stroke={OUT} strokeWidth="2" />
          <Flag x={-74} y={18} color="#06d6a0" text="+" />
          <Flag x={70} y={18} color="#118ab2" text="−" />
        </g>
      );
    case 'clock':
      return (
        <g>
          <rect x="-26" y="-74" width="52" height="96" rx="6" fill="#f6e7c1" stroke={OUT} strokeWidth="2.5" />
          <path d="M-36 -72 L0 -112 L36 -72Z" fill="#7b5cc4" stroke={OUT} strokeWidth="2.5" strokeLinejoin="round" />
          <circle cx="0" cy="-44" r="20" fill="#fff" stroke={OUT} strokeWidth="2.5" />
          <g className="clock-hand">
            <line x1="0" y1="-44" x2="0" y2="-58" stroke={OUT} strokeWidth="3" strokeLinecap="round" />
          </g>
          <line x1="0" y1="-44" x2="10" y2="-44" stroke={OUT} strokeWidth="3" strokeLinecap="round" />
          <circle cx="-6" cy="-6" r="3" fill={OUT} />
          <circle cx="6" cy="-6" r="3" fill={OUT} />
          <path d="M-6 3 q6 6 12 0" stroke={OUT} strokeWidth="2.5" fill="none" strokeLinecap="round" />
          <rect x="-10" y="8" width="20" height="14" rx="6" fill="#8a5a33" />
          <Tree x={-56} y={16} s={0.8} />
          <Tree x={58} y={18} s={0.7} />
        </g>
      );
    case 'shapes':
      return (
        <g strokeLinejoin="round">
          {/* kubus */}
          <path d="M-70 -10 l26 -12 l26 12 l-26 12z" fill="#ffd166" stroke={OUT} strokeWidth="2.5" />
          <path d="M-70 -10 v34 l26 12 v-34z" fill="#f4a261" stroke={OUT} strokeWidth="2.5" />
          <path d="M-18 -10 v34 l-26 12 v-34z" fill="#e76f51" stroke={OUT} strokeWidth="2.5" />
          {/* piramid */}
          <path d="M8 26 L30 -54 L40 32Z" fill="#4cc9f0" stroke={OUT} strokeWidth="2.5" />
          <path d="M40 32 L30 -54 L66 22Z" fill="#3a86ff" stroke={OUT} strokeWidth="2.5" />
          {/* silinder */}
          <rect x="-22" y="-40" width="36" height="58" fill="#b5e48c" stroke={OUT} strokeWidth="2.5" />
          <ellipse cx="-4" cy="18" rx="18" ry="7" fill="#99d98c" stroke={OUT} strokeWidth="2.5" />
          <ellipse cx="-4" cy="-40" rx="18" ry="7" fill="#d9ed92" stroke={OUT} strokeWidth="2.5" />
          {/* sfera */}
          <circle cx="76" cy="10" r="16" fill="#ff8fab" stroke={OUT} strokeWidth="2.5" />
          <circle cx="71" cy="4" r="5" fill="#ffc2d1" />
          <Flag x={30} y={-52} color="#ef476f" text="▲" />
        </g>
      );
    case 'garden':
      return (
        <g>
          <Tree x={-58} y={4} s={1.1} fruit="#ff7b39" />
          <Tree x={60} y={0} s={1} fruit="#ef476f" />
          <ellipse cx="0" cy="18" rx="40" ry="12" fill="#fff" stroke={OUT} strokeWidth="2.5" />
          <circle cx="0" cy="-6" r="24" fill="#ff9f1c" stroke={OUT} strokeWidth="2.5" />
          <circle cx="0" cy="-6" r="17" fill="#ffd27f" />
          <line x1="0" y1="-30" x2="0" y2="18" stroke={OUT} strokeWidth="3" />
          <line x1="-24" y1="-6" x2="24" y2="-6" stroke={OUT} strokeWidth="3" />
          <path d="M0 -30 q6 -10 14 -8" stroke="#2e7d32" strokeWidth="4" fill="none" strokeLinecap="round" />
        </g>
      );
    case 'market':
      return (
        <g>
          {[-40, 40].map((x, k) => (
            <g key={x} transform={`translate(${x} 0)`}>
              <rect x="-30" y="-14" width="60" height="34" fill="#fff5e4" stroke={OUT} strokeWidth="2.5" />
              <rect x="-34" y="-4" width="68" height="10" fill="#c68b4e" stroke={OUT} strokeWidth="2" />
              {[0, 1, 2, 3].map((i) => (
                <path
                  key={i}
                  d={`M${-34 + i * 17} -40 h17 v18 q-8.5 8 -17 0z`}
                  fill={i % 2 ? '#fff' : k ? '#118ab2' : '#ef476f'}
                  stroke={OUT}
                  strokeWidth="2"
                />
              ))}
              <rect x="-31" y="-40" width="3" height="40" fill="#6b4423" />
              <rect x="28" y="-40" width="3" height="40" fill="#6b4423" />
            </g>
          ))}
          <Coin x={-48} y={-12} r={8} />
          <Coin x={-30} y={-12} r={8} />
          <Coin x={4} y={30} r={11} />
          <Coin x={22} y={34} r={9} />
          <Coin x={40} y={-12} r={8} />
        </g>
      );
    case 'bridge':
      return (
        <g>
          <path d="M-90 10 q40 -16 90 0 t90 0 v18 q-50 16 -90 0 t-90 0z" fill="#4fb3e8" stroke="#2a85b8" strokeWidth="2.5" />
          <path className="water-line" d="M-70 18 q20 -6 40 0 M10 20 q20 -6 40 0" stroke="#bfe9ff" strokeWidth="3" fill="none" strokeLinecap="round" />
          <path d="M-44 20 Q0 -36 44 20" stroke="#8a5a33" strokeWidth="12" fill="none" strokeLinecap="round" />
          <path d="M-44 6 Q0 -50 44 6" stroke="#c68b4e" strokeWidth="4" fill="none" />
          {[-30, -15, 0, 15, 30].map((x) => (
            <line key={x} x1={x} x2={x} y1={x === 0 ? -22 : Math.abs(x) === 15 ? -18 : -8} y2={x === 0 ? -8 : Math.abs(x) === 15 ? -4 : 6} stroke="#c68b4e" strokeWidth="3" />
          ))}
          {/* pembaris */}
          <rect x="-88" y="-42" width="12" height="52" rx="2" fill="#ffd166" stroke={OUT} strokeWidth="2" />
          {[0, 1, 2, 3, 4].map((i) => (
            <line key={i} x1="-88" x2={i % 2 ? -82 : -79} y1={-36 + i * 10} y2={-36 + i * 10} stroke={OUT} strokeWidth="2" />
          ))}
          {/* bekas */}
          <path d="M62 -34 h24 l-3 40 h-18z" fill="#e0f4ff" stroke={OUT} strokeWidth="2.5" strokeLinejoin="round" />
          <path d="M64 -12 h20 l-1.5 18 h-17z" fill="#4fb3e8" />
          <line x1="82" x2="78" y1="-24" y2="-24" stroke={OUT} strokeWidth="2" />
        </g>
      );
    case 'records':
      return (
        <g>
          <rect x="-40" y="-20" width="80" height="44" fill="#fff5e4" stroke={OUT} strokeWidth="2.5" />
          <Roof w={92} y={-18} color="#2a9d8f" />
          <rect x="-10" y="0" width="20" height="24" rx="3" fill="#8a5a33" />
          {/* skrol piktograf */}
          <g transform="translate(64 -24)">
            <rect x="-22" y="-28" width="44" height="58" fill="#fdf0d5" stroke={OUT} strokeWidth="2.5" />
            <rect x="-26" y="-34" width="52" height="9" rx="4.5" fill="#c68b4e" stroke={OUT} strokeWidth="2" />
            <rect x="-26" y="26" width="52" height="9" rx="4.5" fill="#c68b4e" stroke={OUT} strokeWidth="2" />
            {[0, 1, 2].map((r) =>
              Array.from({ length: [3, 2, 4][r] }, (_, c) => (
                <circle key={`${r}-${c}`} cx={-14 + c * 9} cy={-14 + r * 14} r="3.6" fill={['#ef476f', '#ffb703', '#06d6a0'][r]} />
              ))
            )}
          </g>
          {/* carta bar */}
          <g transform="translate(-74 22)">
            {[22, 36, 14].map((h, i) => (
              <rect key={i} x={i * 12 - 16} y={-h} width="9" height={h} fill={['#118ab2', '#ef476f', '#ffb703'][i]} stroke={OUT} strokeWidth="2" />
            ))}
          </g>
        </g>
      );
    default:
      return null;
  }
}

export function Cloud({ x, y, s = 1, className = '' }) {
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`} aria-hidden="true">
      <g className={`cloud ${className}`}>
        <ellipse cx="0" cy="0" rx="46" ry="20" fill="#fff" />
        <circle cx="-18" cy="-10" r="20" fill="#fff" />
        <circle cx="12" cy="-16" r="24" fill="#fff" />
        <ellipse cx="0" cy="6" rx="46" ry="10" fill="#e6f2fb" />
      </g>
    </g>
  );
}

/* ---------- Objek kiraan ---------- */

export function CountObject({ type }) {
  if (type === 'tanglung') {
    return (
      <svg viewBox="0 0 80 100" className="count-svg" aria-hidden="true">
        <line x1="40" y1="2" x2="40" y2="14" stroke={OUT} strokeWidth="3" />
        <rect x="26" y="12" width="28" height="8" rx="3" fill="#ffb703" stroke={OUT} strokeWidth="2" />
        <ellipse cx="40" cy="50" rx="30" ry="32" fill="#e63946" stroke={OUT} strokeWidth="3" />
        <path d="M25 24 q-10 26 0 52 M55 24 q10 26 0 52 M40 18 v64" stroke="#b5179e" strokeOpacity=".35" strokeWidth="3" fill="none" />
        <ellipse cx="30" cy="40" rx="6" ry="10" fill="#ff8fa3" opacity=".7" />
        <rect x="26" y="80" width="28" height="8" rx="3" fill="#ffb703" stroke={OUT} strokeWidth="2" />
        <path d="M34 88 v8 M40 88 v10 M46 88 v8" stroke="#ffb703" strokeWidth="3" strokeLinecap="round" />
      </svg>
    );
  }
  if (type === 'bakul') {
    return (
      <svg viewBox="0 0 80 100" className="count-svg" aria-hidden="true">
        <path d="M18 44 Q40 4 62 44" stroke="#a66a2c" strokeWidth="6" fill="none" />
        <path d="M8 42 h64 l-8 46 q-24 8 -48 0z" fill="#e0a95a" stroke={OUT} strokeWidth="3" strokeLinejoin="round" />
        <path d="M11 56 h58 M13 70 h54" stroke="#a66a2c" strokeWidth="3" />
        {[24, 40, 56].map((x) => (
          <line key={x} x1={x} y1="42" x2={x - (x - 40) * 0.2} y2="90" stroke="#a66a2c" strokeWidth="3" />
        ))}
        <circle cx="30" cy="38" r="8" fill="#06d6a0" stroke={OUT} strokeWidth="2" />
        <circle cx="48" cy="36" r="8" fill="#ffd166" stroke={OUT} strokeWidth="2" />
      </svg>
    );
  }
  return (
    <svg viewBox="0 0 80 100" className="count-svg" aria-hidden="true">
      <path d="M40 30 q-4 -14 4 -22" stroke="#6b4423" strokeWidth="5" fill="none" strokeLinecap="round" />
      <ellipse cx="54" cy="18" rx="12" ry="6" fill="#4caf50" transform="rotate(-25 54 18)" />
      <path d="M40 32 C18 18 4 40 10 62 C16 86 32 92 40 86 C48 92 64 86 70 62 C76 40 62 18 40 32Z" fill="#ef476f" stroke={OUT} strokeWidth="3" />
      <ellipse cx="24" cy="50" rx="6" ry="11" fill="#ff99ac" opacity=".75" />
    </svg>
  );
}

export function Badge({ size = 140, label = 'Lencana Bilang Objek' }) {
  return (
    <svg width={size} height={size} viewBox="0 0 140 140" className="badge" role="img" aria-label={label}>
      <path d="M44 92 L30 134 L50 124 L60 140 L70 100Z" fill="#ef476f" stroke={OUT} strokeWidth="3" strokeLinejoin="round" />
      <path d="M96 92 L110 134 L90 124 L80 140 L70 100Z" fill="#118ab2" stroke={OUT} strokeWidth="3" strokeLinejoin="round" />
      <circle cx="70" cy="62" r="50" fill="#ffd166" stroke={OUT} strokeWidth="4" />
      <circle cx="70" cy="62" r="38" fill="#ffe8a3" stroke="#e0a800" strokeWidth="3" />
      {/* shuriken */}
      <path d="M70 32 L78 54 L100 62 L78 70 L70 92 L62 70 L40 62 L62 54Z" fill="#4a5a8c" stroke={OUT} strokeWidth="3" strokeLinejoin="round" />
      <circle cx="70" cy="62" r="7" fill="#ffe8a3" stroke={OUT} strokeWidth="2.5" />
    </svg>
  );
}
