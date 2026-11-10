import { useEffect } from 'react';

// Tirai awan sebelum peta dipaparkan: awan menutup seluruh skrin, tahan 1 saat,
// kemudian terbelah di tengah (kiri dan kanan) untuk mendedahkan peta.
// Awan dilukis dengan SVG (bulat dan gebu, tajam pada semua saiz) dan saiznya ikut vmax.

const HOLD_MS = 1000;
const OPEN_MS = 1200;

// Bentuk awan: bulatan bertindih [cx, cy, r] dalam viewBox 0 0 200 170.
const SHAPES = [
  [[100, 72, 52], [56, 98, 40], [148, 96, 42], [30, 128, 28], [174, 126, 26], [100, 118, 50], [72, 132, 34], [130, 132, 34]],
  [[88, 64, 46], [132, 80, 44], [52, 104, 38], [160, 116, 32], [104, 116, 52], [36, 134, 26], [76, 138, 30], [138, 140, 30]],
  [[104, 56, 40], [70, 84, 42], [140, 86, 40], [100, 104, 54], [44, 120, 32], [164, 124, 30], [100, 140, 40]],
];

function Puff({ shape, x, y, w, rot, flip, z }) {
  const circles = SHAPES[shape];
  return (
    <svg
      className="cloud-puff"
      viewBox="0 0 200 170"
      style={{ left: `${x}%`, top: `${y}%`, width: `${w}vmax`, zIndex: z, '--rot': `${rot}deg`, '--flip': flip ? -1 : 1 }}
    >
      {/* bayang lembut di bawah */}
      <g fill="#b9cfe6" transform="translate(0 7)">
        {circles.map(([cx, cy, r], i) => <circle key={i} cx={cx} cy={cy} r={r} />)}
      </g>
      <g fill="url(#cloud-body)">
        {circles.map(([cx, cy, r], i) => <circle key={i} cx={cx} cy={cy} r={r} />)}
      </g>
      {/* kilauan di bahagian atas */}
      <g fill="#fff" opacity=".9">
        {circles.slice(0, 3).map(([cx, cy, r], i) => <circle key={i} cx={cx - r * 0.18} cy={cy - r * 0.22} r={r * 0.55} />)}
      </g>
    </svg>
  );
}

// [bentuk, x (% lebar separuh), y (% tinggi), lebar (vmax), putaran, terbalik]
// Separuh kiri; separuh kanan ialah cerminannya (dengan susunan berbeza sedikit).
const LEFT = [
  // garis belahan di tengah - rapat dan bertindih
  [0, 94, 2, 26, -6, 0],
  [1, 88, 20, 22, 8, 1],
  [2, 97, 36, 25, -4, 0],
  [0, 87, 52, 23, 10, 1],
  [1, 96, 68, 26, -8, 0],
  [2, 88, 85, 22, 5, 1],
  [0, 95, 100, 26, -3, 0],
  // bahagian dalam
  [2, 64, 10, 30, 4, 1],
  [1, 70, 44, 28, -10, 0],
  [0, 62, 78, 31, 7, 1],
  [1, 34, 0, 32, -5, 0],
  [2, 30, 32, 30, 12, 0],
  [0, 36, 62, 33, -7, 1],
  [1, 30, 96, 32, 6, 0],
  [2, 4, 16, 30, -12, 1],
  [0, 2, 50, 32, 8, 0],
  [1, 6, 84, 30, -4, 1],
];
const RIGHT = LEFT.map(([s, x, y, w, r, f], i) => [(s + 1) % 3, x, (y + 9 + (i % 3) * 3) % 108 - 4, w, -r, f ? 0 : 1]);

function Half({ side, puffs }) {
  return (
    <div className={`cloud-half ${side}`}>
      <div className="cloud-half-inner">
        <div className="cloud-fill" />
        {puffs.map(([shape, x, y, w, rot, flip], i) => (
          <Puff key={i} shape={shape} x={x} y={y} w={w} rot={rot} flip={flip} z={Math.round(y)} />
        ))}
      </div>
    </div>
  );
}

export default function CloudCurtain({ onDone }) {
  useEffect(() => {
    const reduce = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
    const t = setTimeout(onDone, reduce ? 0 : HOLD_MS + OPEN_MS);
    return () => clearTimeout(t);
  }, [onDone]);

  return (
    <div
      className="cloud-curtain"
      aria-hidden="true"
      style={{ '--cloud-hold': `${HOLD_MS}ms`, '--cloud-open': `${OPEN_MS}ms` }}
    >
      <svg width="0" height="0" style={{ position: 'absolute' }}>
        <defs>
          <linearGradient id="cloud-body" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#ffffff" />
            <stop offset=".55" stopColor="#f3f8fd" />
            <stop offset="1" stopColor="#d6e5f3" />
          </linearGradient>
        </defs>
      </svg>
      <Half side="left" puffs={LEFT} />
      <Half side="right" puffs={RIGHT} />
    </div>
  );
}
