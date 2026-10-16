import { missionStatus } from '../lib/storage.js';
import { usePanZoom } from '../lib/usePanZoom.js';
import { blobPath, Cloud, Landmark } from './Art.jsx';
import { BIOMES, Decor } from './Terrain.jsx';
import { SunLight, TerrainOverlay, TextureDefs } from './MapEffects.jsx';

const ISLE_D = blobPath(600, 400, 565, 365, 11, 14, 0.05);
import { NinjaMarker } from './NinjaCharacter.jsx';
import TopicMarker from './TopicMarker.jsx';
import MapControls from './MapControls.jsx';
import Sea from './Sea.jsx';
import SPRITE_SIZES from '../data/sprite-sizes.json';

// Tempat hiasan biom (jauh dari lokasi subtopik)
const DECOR_SPOTS = [
  [110, 420, 1.3],
  [130, 600, 1.2],
  [680, 170, 1.1],
  [960, 170, 1.3],
  [1100, 470, 1.2],
  [420, 700, 1.1],
  [960, 690, 1.2],
  [1080, 600, 1],
  [380, 160, 1],
];

const W = 1200;
const H = 760;

const LAYOUTS = {
  1: [[700, 400]],
  4: [
    [250, 560],
    [520, 360],
    [800, 540],
    [1010, 330],
  ],
};

function trailPath(points) {
  return points.reduce((d, [x, y], i) => {
    if (i === 0) return `M${x} ${y}`;
    const [px, py] = points[i - 1];
    const mx = (px + x) / 2;
    return `${d} C${mx} ${py} ${mx} ${y} ${x} ${y}`;
  }, '');
}

export default function RegionMap({ region, progress, selectedSub, onSelectSub, onBack }) {
  const pz = usePanZoom({ aspect: W / H });
  const biome = BIOMES[region.landmark];
  const pos = LAYOUTS[region.subtopics.length] ?? region.subtopics.map((_, i) => [200 + i * 220, 450]);
  const numbered = region.subtopics.length > 1;
  const selIndex = Math.max(0, region.subtopics.findIndex((s) => s.id === selectedSub));
  const [nx, ny] = pos[selIndex];
  const isPreview = region.subtopics.every((s) => !s.playable) && !numbered;
  const big = isPreview ? { x: 330, y: 330, s: 1.7 } : { x: 230, y: 250, s: 1.25 };

  return (
    <main className="screen region-screen">
      <div className="region-bar">
        <button className="btn btn-light btn-back" onClick={onBack}>
          <span aria-hidden="true">←</span> Peta Dunia
        </button>
        <div className="region-title">
          <h2>{region.topic}</h2>
          <p>{region.name}</p>
        </div>
      </div>

      {isPreview && (
        <p className="region-note" role="note">
          <span aria-hidden="true">🛠️</span> Aktiviti untuk topik ini akan ditambah dalam fasa seterusnya. Lihat pratonton latihan dahulu.
        </p>
      )}

      <Sea />
      <div className="map-scroll" ref={pz.ref} {...pz.handlers}>
        <svg className="map-svg region-svg" viewBox={`0 0 ${W} ${H}`} style={{ width: pz.width }} role="group" aria-label={`Peta ${region.name}`}>
          <defs>
            <TextureDefs />
            <clipPath id="region-clip">
              <path d={ISLE_D} />
            </clipPath>
          </defs>
          <path d={ISLE_D} transform="translate(0 40)" fill="#4f3220" />
          <path d={ISLE_D} transform="translate(0 28)" fill="#8a5a33" />
          <path d={ISLE_D} transform="translate(0 28)" fill="url(#tex-cliff)" />
          <path d={ISLE_D} fill={biome.ground} stroke={biome.dark} strokeWidth="6" />
          <g clipPath="url(#region-clip)">
            <TerrainOverlay width={W} height={H} coast={ISLE_D} />
            <SunLight width={W} height={H} />
          </g>
          <path d={blobPath(600, 420, 480, 270, 5, 12, 0.08)} fill="#ffffff" opacity=".18" />

          {region.sprite ? (
            (() => {
              // kaki bangunan pada (big.x, base), saiz ikut nisbah sebenar gambar
              const size = SPRITE_SIZES[region.sprite.match(/([^/]+)\.webp$/)[1]] ?? { w: 1, h: 1 };
              const k = Math.min((170 * big.s) / size.w, (195 * big.s) / size.h);
              const w = size.w * k;
              const h = size.h * k;
              const base = big.y + 30 * big.s;
              return (
                <g aria-hidden="true">
                  <ellipse cx={big.x} cy={base - h * 0.06} rx={w * 0.48} ry={w * 0.15} fill="#1a1006" opacity=".3" />
                  <image href={region.sprite} x={big.x - w / 2} y={base - h} width={w} height={h} />
                </g>
              );
            })()
          ) : (
            <g transform={`translate(${big.x} ${big.y}) scale(${big.s})`} aria-hidden="true">
              <Landmark type={region.landmark} />
            </g>
          )}
          {DECOR_SPOTS.map(([x, y, s], i) => (
            <Decor key={i} kind={biome.kinds[i % biome.kinds.length]} x={x} y={y} s={s} />
          ))}

          {pos.length > 1 && (
            <>
              <path d={trailPath(pos)} stroke="#a0703f" strokeWidth="34" fill="none" strokeLinecap="round" opacity=".35" transform="translate(0 6)" />
              <path d={trailPath(pos)} stroke="#f7e3b5" strokeWidth="28" fill="none" strokeLinecap="round" />
              <path d={trailPath(pos)} stroke="#d9b77a" strokeWidth="4" strokeDasharray="4 18" fill="none" strokeLinecap="round" />
            </>
          )}

          {region.subtopics.map((sub, i) => (
            <TopicMarker
              key={sub.id}
              x={pos[i][0]}
              y={pos[i][1]}
              number={numbered ? i + 1 : null}
              sub={sub}
              status={missionStatus(progress, region.id, sub.id)}
              color={biome.ground}
              edge={biome.dark}
              selected={sub.id === selectedSub}
              onSelect={() => onSelectSub(sub.id)}
            />
          ))}

          <NinjaMarker x={nx - 78} y={ny - 30} scale={0.62} />

          <Cloud x={1080} y={70} s={0.9} className="drift-b" />
          <Cloud x={100} y={60} s={0.8} className="drift-a" />
        </svg>
      </div>

      <MapControls pz={pz} />
    </main>
  );
}
