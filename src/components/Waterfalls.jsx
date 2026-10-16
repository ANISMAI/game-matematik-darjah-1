// Animasi air terjun di atas gambar pulau (koordinat piksel pulau-tanah.webp).
// Setiap air terjun: jalur air yang mengalir ke bawah, buih di kaki dan wap air.

// x, y (atas), lebar, tinggi. bright = air dalam gambar sangat putih, jadi jalur biru ditambah
// supaya pergerakan kelihatan.
const FALLS = [
  { id: 'kiri-atas', x: 250, y: 482, w: 38, h: 40, bright: true },
  { id: 'kiri-tengah', x: 258, y: 675, w: 26, h: 28 },
  { id: 'kiri-besar-1', x: 180, y: 735, w: 42, h: 92 },
  { id: 'kiri-besar-2', x: 228, y: 740, w: 36, h: 88 },
  { id: 'kanan', x: 1444, y: 536, w: 46, h: 136, bright: true },
];

const TILE = 96; // tinggi jubin corak; animasi bergerak tepat satu jubin supaya gelung lancar

// Jalur air: [x, y, lebar, panjang, kelegapan] dalam satu jubin 24 x TILE
const STREAKS = [
  [2, 0, 1.6, 54, 0.55],
  [6, 40, 2.2, 70, 0.45],
  [10, 10, 1.2, 40, 0.6],
  [13, 58, 1.8, 50, 0.5],
  [17, 22, 2.4, 64, 0.4],
  [21, 70, 1.4, 44, 0.55],
  [4, 76, 1.2, 36, 0.4],
  [19, -20, 1.6, 50, 0.45],
];

export function WaterfallDefs() {
  return (
    <>
      <linearGradient id="streak-grad" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stopColor="#fff" stopOpacity="0" />
        <stop offset=".5" stopColor="#fff" stopOpacity="1" />
        <stop offset="1" stopColor="#fff" stopOpacity="0" />
      </linearGradient>
      <pattern id="falls-streaks" width="24" height={TILE} patternUnits="userSpaceOnUse">
        {STREAKS.flatMap(([x, y, w, h, o], i) =>
          // ulang jalur yang melintasi tepi jubin supaya corak bersambung
          [0, TILE, -TILE].map((off) => (
            <rect key={`${i}-${off}`} x={x} y={y + off} width={w} height={h} rx={w / 2} fill="url(#streak-grad)" opacity={o} />
          ))
        )}
      </pattern>
      <linearGradient id="streak-grad-blue" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stopColor="#2a78b0" stopOpacity="0" />
        <stop offset=".5" stopColor="#2a78b0" stopOpacity="1" />
        <stop offset="1" stopColor="#2a78b0" stopOpacity="0" />
      </linearGradient>
      <pattern id="falls-shade" width="24" height={TILE} patternUnits="userSpaceOnUse" patternTransform="translate(11 37)">
        {STREAKS.flatMap(([x, y, w, h, o], i) =>
          [0, TILE, -TILE].map((off) => (
            <rect key={`${i}-${off}`} x={x} y={y + off} width={w * 1.8} height={h} rx={w} fill="url(#streak-grad-blue)" opacity={Math.min(1, o * 1.6)} />
          ))
        )}
      </pattern>
      <linearGradient id="falls-fade-v" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stopColor="#fff" stopOpacity="0" />
        <stop offset=".2" stopColor="#fff" stopOpacity="1" />
        <stop offset=".8" stopColor="#fff" stopOpacity="1" />
        <stop offset="1" stopColor="#fff" stopOpacity="0" />
      </linearGradient>
      <filter id="falls-soft" x="-20%" y="-20%" width="140%" height="140%">
        <feGaussianBlur stdDeviation="0.7 1.4" />
      </filter>
      {FALLS.map((f) => (
        <mask key={f.id} id={`fall-${f.id}`} maskUnits="userSpaceOnUse">
          {/* pudar di atas/bawah, dan tepi kiri/kanan dilembutkan dengan kabur */}
          <rect x={f.x + 2} y={f.y} width={f.w - 4} height={f.h} rx={f.w * 0.3} fill="url(#falls-fade-v)" filter="url(#soft-3)" />
        </mask>
      ))}
    </>
  );
}

export default function Waterfalls() {
  return (
    <g className="waterfalls" aria-hidden="true">
      {FALLS.map((f, i) => (
        <g key={f.id}>
          <g mask={`url(#fall-${f.id})`} className="falls-water" filter="url(#falls-soft)">
            <rect
              className="falls-flow"
              style={{ animationDuration: `${1.3 + (i % 3) * 0.15}s` }}
              x={f.x}
              y={f.y - TILE}
              width={f.w}
              height={f.h + TILE}
              fill="url(#falls-streaks)"
            />
          </g>
          {f.bright && (
            <g mask={`url(#fall-${f.id})`} className="falls-shade" filter="url(#falls-soft)">
              <rect
                className="falls-flow"
                style={{ animationDuration: `${1.15 + (i % 3) * 0.15}s` }}
                x={f.x}
                y={f.y - TILE}
                width={f.w}
                height={f.h + TILE}
                fill="url(#falls-shade)"
              />
            </g>
          )}
          {/* buih dan wap di kaki air terjun */}
          <ellipse className="falls-foam" cx={f.x + f.w / 2} cy={f.y + f.h - 2} rx={f.w * 0.6} ry={Math.max(4, f.w * 0.16)} fill="#fff" filter="url(#soft-3)" style={{ animationDelay: `${i * 0.2}s` }} />
          <ellipse className="falls-mist" cx={f.x + f.w / 2} cy={f.y + f.h - 4} rx={f.w * 1.1} ry={f.w * 0.45} fill="url(#mist)" style={{ animationDelay: `${i * 0.5}s` }} />
        </g>
      ))}
    </g>
  );
}
