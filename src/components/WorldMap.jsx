import { useEffect, useRef, useState } from 'react';
import { REGIONS } from '../data/topics.js';
import { completedInRegion } from '../lib/storage.js';
import { usePanZoom } from '../lib/usePanZoom.js';
import { Landmark } from './Art.jsx';
import { pointInPoly, smoothClosed } from './Terrain.jsx';
import { AnimatedFx, seaSparkles, TextureDefs } from './MapEffects.jsx';
import { NinjaMarker } from './NinjaCharacter.jsx';
import MapControls from './MapControls.jsx';
import Sea from './Sea.jsx';
import SoftClouds from './SoftClouds.jsx';
import Travellers from './Travellers.jsx';
import Waterfalls, { WaterfallDefs } from './Waterfalls.jsx';
import SPRITE_SIZES from '../data/sprite-sizes.json';

// Koordinat peta ikut piksel gambar tanah (public/map/pulau-tanah.webp, 1536 x 1024).
const W = 1536;
const H = 1024;
const GROUND = '/map/pulau-tanah.webp';

/* Sempadan 8 kawasan disurih ikut garis tengah laluan tanah dalam gambar, supaya kepingan
   yang terangkat terpotong di laluan. Sempadan dikongsi antara kawasan jiran (tiada celah).
   Simpang: J1 Nombor/Tambah/Ruang/Pecahan, J2 Tambah/Masa/Pecahan/Data,
            J3 Ruang/Pecahan/Ukuran, J4 Pecahan/Data/Wang, J5 Pecahan/Wang/Ukuran. */
const J1 = [560, 272];
const J2 = [985, 240];
const J3 = [555, 428];
const J4 = [966, 512];
const J5 = [660, 482];
const E = {
  top1: [[550, 0], [548, 60], [560, 120], [570, 160], [576, 200], [566, 240], J1], // Nombor | Tambah
  top2: [[985, 0], [976, 80], [964, 150], [974, 200], J2], // Tambah | Masa
  left1: [[0, 250], [130, 250], [230, 262], [330, 252], [430, 236], [470, 232], [520, 250], J1], // Nombor | Ruang
  mid1: [J1, [610, 270], [700, 264], [768, 270], [808, 268], [860, 256], [920, 245], J2], // Tambah | Pecahan
  right1: [J2, [1040, 248], [1120, 254], [1200, 250], [1270, 262], [1330, 290], [1380, 318], [1440, 330], [1536, 330]], // Masa | Data
  v1: [J1, [566, 310], [551, 350], [545, 386], J3], // Ruang | Pecahan
  v2: [J2, [1010, 280], [1030, 330], [1025, 390], [1006, 440], [986, 480], J4], // Pecahan | Data
  left2: [[0, 452], [130, 442], [220, 456], [330, 446], [430, 440], [510, 432], J3], // Ruang | Ukuran
  e58: [J3, [575, 445], [602, 455], [630, 468], J5], // Pecahan | Ukuran
  e57: [J5, [700, 494], [768, 504], [868, 494], [920, 500], J4], // Pecahan | Wang
  b1: [J5, [630, 510], [602, 548], [590, 584], [578, 632], [565, 680], [530, 735], [575, 790], [600, 860], [600, 1024]], // Ukuran | Wang
  b2: [J4, [1010, 520], [1070, 578], [1165, 620], [1205, 655], [1215, 720], [1225, 800], [1240, 1024]], // Wang | Data
};
// Laluan pengembara (ninja dan kereta sorong): disurih ikut garis tengah jalan tanah dalam gambar.
const ROADS = [
  // utara: padang buluh -> bawah dojo -> ke hutan musim luruh
  [[440, 218], [490, 226], [525, 240], [545, 268], [575, 285], [615, 293], [660, 285], [710, 277], [760, 274], [810, 270], [860, 258], [925, 240], [970, 224], [988, 200], [975, 165]],
  // barat: dari utara Nombor turun ke kebun, kemudian ke timur di tepi padang pasir
  [[566, 150], [575, 190], [555, 215], [535, 242], [548, 272], [552, 302], [538, 332], [522, 360], [530, 386], [562, 410], [578, 438], [575, 455], [600, 470], [650, 485], [700, 495], [750, 495], [800, 486], [850, 481], [900, 485], [950, 488]],
  // timur: tepi salji turun ke padang pasir
  [[925, 242], [965, 265], [980, 290], [1000, 318], [1030, 345], [1040, 380], [1035, 412], [1030, 448], [1018, 478], [995, 490], [985, 515], [1003, 548], [1050, 580], [1100, 610], [1140, 635]],
  // ke menara jam
  [[980, 284], [1040, 262], [1120, 255]],
  // barat daya: tepi padang pasir turun ke lembah
  [[688, 505], [680, 540], [640, 564], [614, 588], [601, 621], [603, 650], [604, 672], [578, 700], [542, 715], [515, 725]],
];

const fwd = (k) => E[k];
const rev = (k) => [...E[k]].reverse();
const POLYS = {
  nombor: [[0, 0], ...fwd('top1'), ...rev('left1')],
  'tambah-tolak': [...fwd('top2'), ...rev('mid1'), ...rev('top1')],
  masa: [[1536, 0], ...rev('right1'), ...rev('top2')],
  ruang: [...fwd('left1'), ...fwd('v1'), ...rev('left2')],
  pecahan: [...fwd('mid1'), ...fwd('v2'), ...rev('e57'), ...rev('e58'), ...rev('v1')],
  data: [...fwd('right1'), [1536, 1024], ...rev('b2'), ...rev('v2')],
  wang: [...fwd('e57'), ...fwd('b2'), ...rev('b1')],
  ukuran: [...fwd('left2'), ...fwd('e58'), ...fwd('b1'), [0, 1024]],
};


// Garis pantai anggaran (untuk hover dan kilauan laut sahaja).
const COAST = [
  [175, 120], [300, 40], [560, 20], [800, 15], [1000, 25], [1250, 30], [1400, 90], [1470, 250],
  [1515, 420], [1525, 560], [1490, 700], [1420, 790], [1270, 830], [1100, 900], [900, 940],
  [700, 900], [580, 950], [420, 960], [250, 900], [110, 820], [40, 680], [15, 520], [30, 380], [100, 230],
];
const COAST_D = smoothClosed(COAST);
const scaleCoast = (k) => smoothClosed(COAST.map(([x, y]) => [770 + (x - 770) * k, 500 + (y - 500) * k]));
// Kepingan tanah = gambar ∩ sempadan kawasan ∩ (mask darat ∪ pedalaman pulau) ∩ pantai luas.
// Mask darat dijana oleh scripts/make-mask.mjs; pedalaman menampal tasik/sungai yang dikesan sebagai laut.
const LAND_MASK = '/map/pulau-mask.png';
const COAST_WIDE_D = scaleCoast(1.05);
const COAST_INNER_D = scaleCoast(0.82);

// Titik tanah (kaki bangunan) di tengah kawasan lapang setiap kawasan dalam gambar.
const BASES = {
  nombor: [360, 215],
  'tambah-tolak': [785, 215],
  masa: [1155, 187],
  ruang: [380, 420],
  pecahan: [805, 445],
  data: [1215, 495],
  wang: [880, 728],
  ukuran: [395, 670],
};

// Kotak maksimum bangunan; saiz sebenar ikut nisbah gambar (src/data/sprite-sizes.json).
const SPRITE_MAX_W = 175;
const SPRITE_MAX_H = 200;
// Skala tambahan untuk bangunan yang nampak kecil kerana bentuknya (cth. pasar lebar dan rendah).
const SPRITE_SCALE = { wang: 1.3 };

function spriteBox(region) {
  const [bx, by] = BASES[region.id];
  const name = region.sprite?.match(/([^/]+)\.webp$/)?.[1];
  const size = SPRITE_SIZES[name] ?? { w: 1, h: 1 };
  const k = Math.min(SPRITE_MAX_W / size.w, SPRITE_MAX_H / size.h) * (SPRITE_SCALE[region.id] ?? 1);
  const w = size.w * k;
  const h = size.h * k;
  // Kaki bangunan (bahagian bawah gambar) duduk tepat pada titik tanah.
  // +2.5%: gambar ada bayang samar di bawah kaki; turunkan supaya kaki sebenar menyentuh tanah.
  return { x: bx - w / 2, y: by - h * 0.975, w, h, bx, by };
}

const SPARKLES = seaSparkles(W, H, (x, y) => pointInPoly(x, y, COAST), 20);
const polyD = (pts) => 'M' + pts.map((p) => p.join(',')).join(' L') + 'Z';
const LABEL_SCALE = 1.2;
// Sementara: label topik disembunyikan untuk menilai paparan pulau. Tukar ke true untuk paparkan semula.
const SHOW_LABELS = false;

function activate(e, fn) {
  if (e.key === 'Enter' || e.key === ' ') {
    e.preventDefault();
    fn();
  }
}

const labelWidth = (region) => Math.max(region.topic.length * 14 + 44, 170);

function RegionShape({ region, done, selected, hover, onHover, onFocusChange, onOpen }) {
  const d = polyD(POLYS[region.id]);
  const open = () => region.available && onOpen(region.id);
  return (
    <g
      className={`region${selected ? ' is-selected' : ''}${hover ? ' is-hover' : ''}${region.available ? '' : ' is-locked'}`}
      role="button"
      tabIndex={0}
      aria-label={`${region.topic}, ${region.name}${done ? `, ${done} aktiviti selesai` : ''}`}
      onClick={open}
      onKeyDown={(e) => activate(e, open)}
      onMouseEnter={() => onHover(region.id)}
      onMouseLeave={() => onHover(null)}
      onFocus={() => onFocusChange(region.id)}
      onBlur={() => onFocusChange(null)}
    >
      <path className="region-hit" d={d} />
    </g>
  );
}

// Salinan tanah kawasan yang terangkat (bersama bangunan dan label) bila dihover/ditekan/difokus.
function LandPiece({ region, up, focused }) {
  const d = polyD(POLYS[region.id]);
  return (
    <g className={`land-piece${up ? ' is-up' : ''}${focused ? ' is-focused' : ''}`} aria-hidden="true">
      <g clipPath="url(#coast-wide)">
        <g clipPath={`url(#clip-${region.id})`}>
          <image href={GROUND} width={W} height={H} mask="url(#land)" />
        </g>
        <g mask="url(#land)">
          <path className="piece-edge" d={d} />
        </g>
      </g>
    </g>
  );
}

// Lubang gelap yang tertinggal di bawah kepingan yang terangkat.
function LandSocket({ region, up }) {
  return (
    <g className={`land-socket${up ? ' is-up' : ''}`} clipPath="url(#coast-wide)" aria-hidden="true">
      <path d={polyD(POLYS[region.id])} fill="#06243f" mask="url(#land)" />
    </g>
  );
}

/* ---------- Menanam bangunan ke dalam tanah ---------- */

// Warna tanah di bawah setiap bangunan (disampel daripada pulau-tanah.webp, dicerahkan sedikit).
const GROUND_TINT = {
  nombor: '#7da352',
  'tambah-tolak': '#8c9068',
  masa: '#c08a55',
  ruang: '#b3ab7a',
  pecahan: '#a2b056',
  data: '#dfe9f5',
  wang: '#e2ab62',
  ukuran: '#8eaa58',
};

// Laras bayang untuk bangunan yang bentuknya luar biasa:
// pad = tompok warna tanah (0 = tiada), cast = panjang bayang condong (gandaan lebar),
// depth = jarak pusat tapak dari bucu depan (gandaan lebar), contact = saiz bayang rapat.
const SHADOW_TWEAK = {
  masa: { pad: 0, cast: 1.4, castOpacity: 0.32, depth: 0.18, contact: 1.05 }, // menara sempit: bayang dekat kaki dan panjang supaya kelihatan
  wang: { pad: 0 }, // tompok cerah di pasir nampak macam cahaya keliling gerai
};

// Tompok tanah + bayang condong (cahaya dari kiri atas) + bayang rapat di kaki.
function BuildingGround({ region, box }) {
  const { bx, by, w } = box;
  // Tapak bangunan isometrik berbentuk berlian: bucu depan di `by`, pusat tapak lebih tinggi.
  // Kedalaman tapak ikut LEBAR bangunan (bukan tinggi), jadi menara tinggi dan gerai rendah
  // kedua-duanya mendapat bayang di tempat yang betul.
  const t = { pad: 0.6, cast: 1, castOpacity: 0.28, depth: 0.17, contact: 1, ...SHADOW_TWEAK[region.id] };
  const fy = by - w * t.depth;
  return (
    <g className="building-ground" aria-hidden="true">
      {t.pad > 0 && <ellipse cx={bx} cy={fy} rx={w * 0.6} ry={w * 0.2} fill={GROUND_TINT[region.id]} opacity={t.pad} filter="url(#soft-12)" />}
      {/* bayang condong ke kanan (cahaya dari kiri atas) */}
      <ellipse cx={bx + w * 0.16 * t.cast} cy={fy - w * 0.02} rx={w * 0.46 * t.cast} ry={w * 0.13} fill="#1a1006" opacity={t.castOpacity} filter="url(#soft-8)" />
      <ellipse cx={bx} cy={fy} rx={w * 0.5 * t.contact} ry={w * 0.15 * t.contact} fill="url(#contact-shadow)" />
    </g>
  );
}

// Dilukis dua kali: semua bangunan dahulu (part="sprite"), kemudian semua label (part="label"),
// supaya bangunan kawasan jiran tidak menutup label.
function RegionLabel({ region, done, hover, onHover, onOpen, part }) {
  const box = spriteBox(region);
  const { bx: cx, by: cy } = box;
  const w = labelWidth(region);
  return (
    <g
      className={`region-label-wrap${hover ? ' is-hover' : ''}`}
      aria-hidden="true"
      onClick={() => region.available && onOpen(region.id)}
      onMouseEnter={() => onHover(region.id)}
      onMouseLeave={() => onHover(null)}
    >
      <g className="region-lift">
        {part === 'sprite' && <BuildingGround region={region} box={box} />}
        {part === 'sprite' &&
          (region.sprite ? (
            <image href={region.sprite} x={box.x} y={box.y} width={box.w} height={box.h} filter="url(#sprite-blend)" />
          ) : (
            <g transform={`translate(${cx} ${cy - 40}) scale(1.1)`}>
              <Landmark type={region.landmark} />
            </g>
          ))}
        {part === 'label' && (
        <g transform={`translate(${cx} ${cy + 10}) scale(${LABEL_SCALE})`}>
          <rect x={-w / 2} y="0" width={w} height="58" rx="18" fill="#fffdf6" stroke="#3b2a1a" strokeWidth="3" />
          <text x="0" y="29" textAnchor="middle" className="label-topic">
            {region.topic}
          </text>
          <text x="0" y="48" textAnchor="middle" className="label-name">
            {region.name}
          </text>
          {done > 0 && (
            <g transform={`translate(${w / 2 - 4} 2)`}>
              <circle r="15" fill="#2a9d8f" stroke="#fff" strokeWidth="3" />
              <path d="M-6 0 l4 5 l8 -10" stroke="#fff" strokeWidth="3.5" fill="none" strokeLinecap="round" strokeLinejoin="round" />
            </g>
          )}
        </g>
        )}
      </g>
    </g>
  );
}

const reducedMotion = () => window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;

export default function WorldMap({ progress, onOpenRegion, onContinue }) {
  const pz = usePanZoom({ aspect: W / H });
  const [hover, setHover] = useState(null);
  const [focus, setFocus] = useState(null);
  const [popping, setPopping] = useState(null);
  const popTimer = useRef(null);
  const hasMission = Boolean(progress.lastMission);
  const sel = REGIONS.find((r) => r.id === progress.lastRegion);
  const active = popping ?? hover ?? focus;

  useEffect(() => () => clearTimeout(popTimer.current), []);

  // Tekan: kepingan pulau terangkat dahulu (penting untuk skrin sentuh), kemudian kawasan dibuka.
  const open = (id) => {
    if (popping) return;
    if (reducedMotion()) {
      onOpenRegion(id);
      return;
    }
    setPopping(id);
    popTimer.current = setTimeout(() => onOpenRegion(id), 380);
  };

  return (
    <main className="screen world-screen">
      <div className="map-bar">
        <h2 className="map-heading">Pilih kawasan pengembaraan!</h2>
        <button className="btn btn-primary btn-cta" onClick={onContinue}>
          <span aria-hidden="true">▶</span> {hasMission ? 'Sambung Misi' : 'Mula Pengembaraan'}
        </button>
      </div>

      <Sea />
      <div className="map-scroll" ref={pz.ref} {...pz.handlers}>
        <div className="map-stack" style={{ width: pz.width }}>
          {/* Lapisan 1: gambar tanah + kawasan boleh ditekan */}
          <svg className="map-svg map-layer" viewBox={`0 0 ${W} ${H}`} role="group" aria-label="Peta Pulau Ninja">
            <defs>
              <TextureDefs />
              <clipPath id="island-clip">
                <path d={COAST_D} />
              </clipPath>
              {/* tepi gambar dilembutkan supaya bercantum dengan laut di belakang */}
              <filter id="feather" x="-10%" y="-10%" width="120%" height="120%">
                <feGaussianBlur stdDeviation="40" />
              </filter>
              <filter id="coast-soft" x="-5%" y="-5%" width="110%" height="110%">
                <feGaussianBlur stdDeviation="22" />
              </filter>
              {/* tepi gambar sentiasa pudar ke laut, walaupun pengesan darat tersalah anggap buih/awan sebagai darat */}
              <mask id="image-border" maskUnits="userSpaceOnUse" x="0" y="0" width={W} height={H}>
                <rect x="30" y="30" width={W - 60} height={H - 60} fill="#fff" filter="url(#soft-edge)" />
              </mask>
              <filter id="soft-edge" x="-5%" y="-5%" width="110%" height="110%">
                <feGaussianBlur stdDeviation="14" />
              </filter>
              <mask id="edge-fade" maskUnits="userSpaceOnUse" x="0" y="0" width={W} height={H}>
                <rect x="85" y="80" width={W - 170} height={H - 160} fill="#fff" filter="url(#feather)" />
                {/* darat (termasuk tebing dan air terjun) sentiasa penuh; hanya laut di tepi dipudarkan.
                    Dihadkan ke kawasan pulau supaya awan putih di tepi gambar tidak dikira darat. */}
                <g filter="url(#coast-soft)" mask="url(#image-border)">
                <g clipPath="url(#coast-wide)">
                  <image href={LAND_MASK} width={W} height={H} style={{ mixBlendMode: 'lighten' }} />
                </g>
                </g>
              </mask>
            </defs>
            <image href={GROUND} width={W} height={H} mask="url(#edge-fade)" />
            <g clipPath="url(#island-clip)">
              {REGIONS.map((r) => (
                <RegionShape
                  key={r.id}
                  region={r}
                  done={completedInRegion(progress, r)}
                  selected={progress.lastRegion === r.id}
                  hover={active === r.id}
                  onHover={setHover}
                  onFocusChange={setFocus}
                  onOpen={open}
                />
              ))}
            </g>
          </svg>

          {/* Lapisan 2: animasi (tidak menerima klik) */}
          <svg className="map-svg map-layer map-fx" viewBox={`0 0 ${W} ${H}`} aria-hidden="true">
            <defs>
              <WaterfallDefs />
            </defs>
            <Waterfalls />
            <Travellers roads={ROADS} />
            <AnimatedFx
              width={W}
              height={H}
              sparkles={SPARKLES}
              mists={[
                [1270, 470, 220, 70],
                [230, 820, 150, 50],
                [1460, 640, 110, 60],
              ]}
            />
            <SoftClouds />
          </svg>

          {/* Lapisan 3: kepingan tanah yang terangkat, bangunan dan label */}
          <svg className="map-svg map-layer map-top" viewBox={`0 0 ${W} ${H}`}>
            <defs>
              <clipPath id="coast-wide">
                <path d={COAST_WIDE_D} />
              </clipPath>
              {REGIONS.map((r) => (
                <clipPath key={r.id} id={`clip-${r.id}`}>
                  <path d={polyD(POLYS[r.id])} />
                </clipPath>
              ))}
              <radialGradient id="contact-shadow">
                <stop offset="0" stopColor="#1a1006" stopOpacity=".7" />
                <stop offset=".55" stopColor="#1a1006" stopOpacity=".4" />
                <stop offset="1" stopColor="#1a1006" stopOpacity="0" />
              </radialGradient>
              {[
                ['soft-05', 0.5],
                ['soft-3', 3],
                ['soft-8', 8],
                ['soft-12', 12],
              ].map(([id, sd]) => (
                <filter key={id} id={id} x="-50%" y="-50%" width="200%" height="200%">
                  <feGaussianBlur stdDeviation={sd} />
                </filter>
              ))}
              {/* Padankan bangunan dengan lukisan pulau: tepi dilembutkan, ketepuan dikurangkan,
                  dan cahaya matahari hangat dari kiri atas ditambah. */}
              <filter id="sprite-blend" x="0" y="0" width="100%" height="100%" colorInterpolationFilters="sRGB">
                <feGaussianBlur in="SourceGraphic" stdDeviation="0.3" result="soft" />
                <feColorMatrix in="soft" type="saturate" values="0.86" result="desat" />
                <feComponentTransfer in="desat" result="graded">
                  <feFuncR type="linear" slope="0.97" intercept="0.03" />
                  <feFuncG type="linear" slope="0.95" intercept="0.025" />
                  <feFuncB type="linear" slope="0.9" intercept="0.02" />
                </feComponentTransfer>
                <feFlood floodColor="#fff1c9" result="sunColor" />
                <feComposite in="sunColor" in2="SourceAlpha" operator="in" result="sunMask" />
                <feOffset in="SourceAlpha" dx="6" dy="6" result="shift" />
                <feComposite in="sunMask" in2="shift" operator="out" result="rim" />
                <feGaussianBlur in="rim" stdDeviation="2" result="rimSoft" />
                <feComposite in="rimSoft" in2="SourceAlpha" operator="in" result="rimIn" />
                <feBlend in="rimIn" in2="graded" mode="screen" result="lit" />
                <feComposite in="lit" in2="SourceAlpha" operator="in" />
              </filter>
              <mask id="land" maskUnits="userSpaceOnUse" x="0" y="0" width={W} height={H}>
                <image href={LAND_MASK} width={W} height={H} />
                <path d={COAST_INNER_D} fill="#fff" />
              </mask>
            </defs>
            {REGIONS.map((r) => (
              <LandSocket key={r.id} region={r} up={active === r.id} />
            ))}
            {REGIONS.map((r) => (
              <LandPiece key={r.id} region={r} up={active === r.id} focused={focus === r.id} />
            ))}
            {(SHOW_LABELS ? ['sprite', 'label'] : ['sprite']).map((part) =>
              REGIONS.map((r) => (
                <RegionLabel
                  key={`${part}-${r.id}`}
                  part={part}
                  region={r}
                  done={completedInRegion(progress, r)}
                  hover={active === r.id}
                  onHover={setHover}
                  onOpen={open}
                />
              ))
            )}
          </svg>

          {/* Lapisan 4: ninja (beranimasi, diasingkan supaya lapisan 3 tidak dilukis semula setiap bingkai) */}
          {sel && (
            <svg className="map-svg map-layer map-fx" viewBox={`0 0 ${W} ${H}`} aria-hidden="true">
              <NinjaMarker x={BASES[sel.id][0] + 120} y={BASES[sel.id][1]} scale={0.62} />
            </svg>
          )}
        </div>
      </div>

      <MapControls pz={pz} />
    </main>
  );
}
