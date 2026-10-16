// Kesan visual peta: tekstur, cahaya, buih pantai, kilauan, kabus, burung dan awan pembuka.

const svgUri = (s) => `data:image/svg+xml,${encodeURIComponent(s)}`;

// Tekstur dijana sekali oleh feTurbulence di dalam imej, jadi pelayar hanya merasternya sekali.
const GRAIN = svgUri(
  `<svg xmlns='http://www.w3.org/2000/svg' width='240' height='240'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='.85' numOctaves='2' stitchTiles='stitch'/><feColorMatrix values='0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 .6 0'/></filter><rect width='100%' height='100%' filter='url(#n)'/></svg>`
);
const BLOTCH = svgUri(
  `<svg xmlns='http://www.w3.org/2000/svg' width='520' height='520'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='.011' numOctaves='3' seed='4' stitchTiles='stitch'/><feColorMatrix values='0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 1.6 0 0 0 -.7'/></filter><rect width='100%' height='100%' filter='url(#n)'/></svg>`
);
const SHINE = svgUri(
  `<svg xmlns='http://www.w3.org/2000/svg' width='520' height='520'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='.018' numOctaves='2' seed='9' stitchTiles='stitch'/><feColorMatrix values='0 0 0 0 1 0 0 0 0 1 0 0 0 0 1 1.5 0 0 0 -.75'/></filter><rect width='100%' height='100%' filter='url(#n)'/></svg>`
);

export function TextureDefs() {
  return (
    <>
      <pattern id="tex-grain" width="240" height="240" patternUnits="userSpaceOnUse">
        <image href={GRAIN} width="240" height="240" />
      </pattern>
      <pattern id="tex-blotch" width="520" height="520" patternUnits="userSpaceOnUse">
        <image href={BLOTCH} width="520" height="520" />
      </pattern>
      <pattern id="tex-shine" width="520" height="520" patternUnits="userSpaceOnUse">
        <image href={SHINE} width="520" height="520" />
      </pattern>
      <pattern id="tex-tufts" width="64" height="56" patternUnits="userSpaceOnUse">
        <path d="M8 14 l3 -6 l2 6 M40 40 l3 -7 l3 7 M28 24 l2 -5 l2 5 M54 10 l2 -5 l2 5 M14 46 l2 -5 l2 5" stroke="#000" strokeOpacity=".16" strokeWidth="2" fill="none" strokeLinecap="round" />
      </pattern>
      <pattern id="tex-cliff" width="22" height="60" patternUnits="userSpaceOnUse">
        <path d="M6 0 v60 M15 10 v30" stroke="#000" strokeOpacity=".16" strokeWidth="3" />
        <path d="M10 4 v22" stroke="#fff" strokeOpacity=".12" strokeWidth="2" />
      </pattern>
      <linearGradient id="sunlight" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0" stopColor="#fff6d6" stopOpacity=".75" />
        <stop offset=".45" stopColor="#fff6d6" stopOpacity="0" />
        <stop offset=".75" stopColor="#0b2a4a" stopOpacity="0" />
        <stop offset="1" stopColor="#0b2a4a" stopOpacity=".45" />
      </linearGradient>
      <linearGradient id="ray" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stopColor="#fffbe6" stopOpacity=".38" />
        <stop offset="1" stopColor="#fffbe6" stopOpacity="0" />
      </linearGradient>
      <radialGradient id="mist">
        <stop offset="0" stopColor="#fff" stopOpacity=".75" />
        <stop offset="1" stopColor="#fff" stopOpacity="0" />
      </radialGradient>
    </>
  );
}

// Lapisan tekstur dan cahaya di atas tanah (letak di dalam kumpulan yang dipotong ikut pulau).
export function TerrainOverlay({ width, height, coast }) {
  return (
    <g className="no-hit" aria-hidden="true">
      <rect width={width} height={height} fill="url(#tex-blotch)" opacity=".22" style={{ mixBlendMode: 'multiply' }} />
      <rect width={width} height={height} fill="url(#tex-shine)" opacity=".28" />
      <rect width={width} height={height} fill="url(#tex-tufts)" />
      <rect width={width} height={height} fill="url(#tex-grain)" opacity=".16" />
      {coast && <path d={coast} fill="none" stroke="#2b1a0e" strokeOpacity=".22" strokeWidth="34" />}
    </g>
  );
}

export function SunLight({ width, height }) {
  return <rect className="no-hit" width={width} height={height} fill="url(#sunlight)" style={{ mixBlendMode: 'soft-light' }} aria-hidden="true" />;
}

const rand = (s) => {
  const x = Math.sin(s * 47.77 + 3.1) * 43758.5453;
  return x - Math.floor(x);
};

// Titik rawak di laut (di luar `isLand`) untuk kilauan air.
export function seaSparkles(width, height, isLand, count = 18) {
  return Array.from({ length: count * 4 }, (_, i) => [rand(i * 2) * width, rand(i * 2 + 1) * height])
    .filter(([x, y]) => !isLand(x, y))
    .slice(0, count);
}

let revealed = false;

// Lapisan animasi (tidak menerima klik). Skala reka bentuk asas: 1200 unit lebar.
export function AnimatedFx({ width, height, mists = [], sparkles = [], foamPath }) {
  const showReveal = !revealed;
  revealed = true;
  const k = width / 1200;
  return (
    <g aria-hidden="true">
      {/* buih di kaki tebing; mask `sea-only` (ditakrif oleh peta) menyembunyikannya di atas tanah */}
      {foamPath && (
        <g mask="url(#sea-only)">
          <path className="foam" d={foamPath} transform="translate(0 40)" fill="none" stroke="#fff" strokeWidth="5" strokeDasharray="18 14" strokeLinecap="round" opacity=".85" />
          <path className="foam foam-2" d={foamPath} transform="translate(0 40)" fill="none" stroke="#e6fbff" strokeWidth="9" strokeDasharray="4 40" strokeLinecap="round" opacity=".6" />
        </g>
      )}

      {sparkles.map(([x, y], i) => (
        <g key={i} transform={`translate(${x.toFixed(0)} ${y.toFixed(0)})`}>
          <path
            className="sparkle"
            style={{ animationDelay: `${(i * 0.37) % 4}s` }}
            d="M0 -8 L1.6 -1.6 L8 0 L1.6 1.6 L0 8 L-1.6 1.6 L-8 0 L-1.6 -1.6Z"
            fill="#fff"
          />
        </g>
      ))}

      {mists.map(([x, y, rx, ry], i) => (
        <ellipse key={i} className={`mist mist-${i % 2}`} cx={x} cy={y} rx={rx} ry={ry} fill="url(#mist)" />
      ))}

      <g className="rays" transform={`scale(${k})`}>
        <path d="M-60 -40 L60 -40 L560 900 L380 900Z" fill="url(#ray)" />
        <path className="ray-2" d="M90 -40 L170 -40 L820 900 L700 900Z" fill="url(#ray)" />
        <path d="M230 -40 L270 -40 L1050 900 L980 900Z" fill="url(#ray)" />
      </g>

      <g className="birds">
        <path d="M0 130 q8 -8 16 0 q8 -8 16 0" stroke="#1d3557" strokeWidth="3" fill="none" strokeLinecap="round" />
        <path d="M-34 150 q6 -6 12 0 q6 -6 12 0" stroke="#1d3557" strokeWidth="3" fill="none" strokeLinecap="round" />
        <path d="M-20 112 q6 -6 12 0 q6 -6 12 0" stroke="#1d3557" strokeWidth="3" fill="none" strokeLinecap="round" />
      </g>

      {showReveal && (
        <g transform={`scale(${k})`}>
          <g className="reveal reveal-l">
            {[[80, 120], [220, 330], [90, 520], [260, 700], [400, 140], [430, 480], [560, 300], [540, 680], [120, 820]].map(([x, y], i) => (
              <circle key={i} cx={x} cy={y} r="190" fill={i % 2 ? '#ffffff' : '#eef7fd'} />
            ))}
          </g>
          <g className="reveal reveal-r">
            {[[1120, 120], [980, 330], [1110, 520], [940, 700], [800, 140], [770, 480], [640, 300], [660, 680], [1080, 820]].map(([x, y], i) => (
              <circle key={i} cx={x} cy={y} r="190" fill={i % 2 ? '#eef7fd' : '#ffffff'} />
            ))}
          </g>
        </g>
      )}
      <rect width={width} height={height} fill="none" />
    </g>
  );
}

// Bayang lembut di kaki objek
export function GroundShadow({ rx = 22, ry = 6, y = 2 }) {
  return <ellipse cx="0" cy={y} rx={rx} ry={ry} fill="#1a1006" opacity=".22" />;
}
