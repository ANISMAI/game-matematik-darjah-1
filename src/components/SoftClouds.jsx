// Awan lembut realistik (public/map/awan-*.webp, dijana oleh scripts/make-clouds.mjs)
// yang hanyut perlahan di atas laut sekeliling pulau. Koordinat ikut pulau-tanah.webp.

// [gambar, x, y, lebar, kelegapan, tempoh hanyut (s)]
const CLOUDS = [
  ['awan-1', -60, 20, 360, 0.9, 70],
  ['awan-3', 980, -40, 300, 0.85, 90],
  ['awan-2', 1290, 840, 340, 0.9, 80],
  ['awan-3', -40, 860, 280, 0.8, 95],
  ['awan-2', 1380, 300, 220, 0.6, 110],
];

const RATIO = { 'awan-1': 267 / 564, 'awan-2': 239 / 506, 'awan-3': 218 / 430 };

export default function SoftClouds() {
  return (
    <g className="soft-clouds" aria-hidden="true">
      {CLOUDS.map(([name, x, y, w, o, dur], i) => (
        <g key={i} className="soft-cloud" style={{ animationDuration: `${dur}s`, animationDelay: `${-i * 13}s` }}>
          <image href={`/map/${name}.webp`} x={x} y={y} width={w} height={w * RATIO[name]} opacity={o} />
        </g>
      ))}
    </g>
  );
}
