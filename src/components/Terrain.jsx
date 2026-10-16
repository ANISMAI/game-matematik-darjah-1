// Rupa bumi pulau: garis pantai, hiasan biom, pulau kecil, air terjun dan pusaran air.
import { Bamboo, blobPath, Tree } from './Art.jsx';

export const ISLAND = { cx: 600, cy: 440, rx: 545, ry: 372, p: 3.2 };

const OUT = '#3b2a1a';

// Jejari relatif garis pantai (teluk dan tanjung) pada sudut a.
const coastNoise = (a) => 1 + 0.05 * Math.sin(3 * a + 1) + 0.035 * Math.sin(7 * a + 2) + 0.02 * Math.sin(13 * a + 0.5);

export function islandPoint(a, shrink = 0) {
  const { cx, cy, rx, ry, p } = ISLAND;
  const c = Math.cos(a);
  const s = Math.sin(a);
  const r = coastNoise(a) - shrink;
  return [cx + rx * r * Math.sign(c) * Math.abs(c) ** (2 / p), cy + ry * r * Math.sign(s) * Math.abs(s) ** (2 / p)];
}

export function smoothClosed(pts) {
  const n = pts.length;
  const p = (i) => pts[(i + n) % n];
  let d = `M${p(0)[0].toFixed(1)},${p(0)[1].toFixed(1)}`;
  for (let i = 0; i < n; i++) {
    const [p0, p1, p2, p3] = [p(i - 1), p(i), p(i + 1), p(i + 2)];
    d += ` C${(p1[0] + (p2[0] - p0[0]) / 6).toFixed(1)},${(p1[1] + (p2[1] - p0[1]) / 6).toFixed(1)} ${(p2[0] - (p3[0] - p1[0]) / 6).toFixed(1)},${(p2[1] - (p3[1] - p1[1]) / 6).toFixed(1)} ${p2[0].toFixed(1)},${p2[1].toFixed(1)}`;
  }
  return d + 'Z';
}

export function islandPath(shrink = 0) {
  return smoothClosed(Array.from({ length: 72 }, (_, i) => islandPoint((i / 72) * Math.PI * 2, shrink)));
}

export function inIsland(x, y, margin = 0.06) {
  const { cx, cy, rx, ry, p } = ISLAND;
  const u = (x - cx) / rx;
  const v = (y - cy) / ry;
  const rho = (Math.abs(u) ** p + Math.abs(v) ** p) ** (1 / p);
  if (rho === 0) return true;
  const a = Math.atan2(Math.sign(v) * (Math.abs(v) / rho) ** (p / 2), Math.sign(u) * (Math.abs(u) / rho) ** (p / 2));
  return rho < coastNoise(a) - margin;
}

export function pointInPoly(x, y, poly) {
  let inside = false;
  for (let i = 0, j = poly.length - 1; i < poly.length; j = i++) {
    const [xi, yi] = poly[i];
    const [xj, yj] = poly[j];
    if (yi > y !== yj > y && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi) inside = !inside;
  }
  return inside;
}

const rand = (s) => {
  const x = Math.sin(s * 91.345 + 7.13) * 43758.5453;
  return x - Math.floor(x);
};

// Taburkan hiasan dalam kawasan, jauh dari mercu tanda dan label.
export function scatter({ poly, keepOut, kinds, seed, max = 9, minDist = 58, tries = 90 }) {
  const xs = poly.map((p) => p[0]);
  const ys = poly.map((p) => p[1]);
  const [x0, x1, y0, y1] = [Math.min(...xs), Math.max(...xs), Math.min(...ys), Math.max(...ys)];
  const out = [];
  for (let t = 0; t < tries && out.length < max; t++) {
    const x = x0 + rand(seed * 100 + t * 2) * (x1 - x0);
    const y = y0 + rand(seed * 100 + t * 2 + 1) * (y1 - y0);
    if (!pointInPoly(x, y, poly) || !inIsland(x, y, 0.07)) continue;
    if (keepOut.some(([a, b, c, d]) => x > a && x < c && y > b && y < d)) continue;
    if (out.some((o) => Math.hypot(o.x - x, o.y - y) < minDist)) continue;
    out.push({ x, y, kind: kinds[out.length % kinds.length], s: 0.8 + rand(seed + t) * 0.4 });
  }
  return out;
}

/* ---------- Hiasan biom ---------- */

function Pillar({ side, top, h = 46 }) {
  return (
    <g>
      <path d={`M-22 0 L-24 ${-h} Q0 ${-h - 8} 24 ${-h} L22 0 Q0 9 -22 0Z`} fill={side} stroke={OUT} strokeWidth="2" strokeLinejoin="round" />
      <path d={`M-8 -6 L-10 ${-h + 8} M9 -4 L11 ${-h + 12}`} stroke={OUT} strokeOpacity=".25" strokeWidth="3" />
      <ellipse cx="0" cy={-h} rx="24" ry="9" fill={top} stroke={OUT} strokeWidth="2" />
      <ellipse cx="-6" cy={-h - 2} rx="9" ry="3" fill="#fff" opacity=".35" />
    </g>
  );
}

function Mountain({ color, shade, snow }) {
  return (
    <g strokeLinejoin="round">
      <path d="M-46 0 L0 -78 L46 0Z" fill={color} stroke={OUT} strokeWidth="2.5" />
      <path d="M0 -78 L46 0 L8 0Z" fill={shade} />
      {snow && <path d="M-17 -49 L0 -78 L17 -49 L8 -54 L0 -46 L-8 -54Z" fill="#fff" stroke={OUT} strokeWidth="2" />}
    </g>
  );
}

function Pine({ snow }) {
  const leaf = snow ? '#2f7a63' : '#2e8b57';
  return (
    <g>
      <rect x="-4" y="-10" width="8" height="12" fill="#7a4a26" />
      {[0, 1, 2].map((i) => (
        <path key={i} d={`M-${20 - i * 4} ${-8 - i * 14} L0 ${-34 - i * 14} L${20 - i * 4} ${-8 - i * 14}Z`} fill={leaf} stroke={OUT} strokeWidth="2" strokeLinejoin="round" />
      ))}
      {snow && <path d="M-7 -52 L0 -62 L7 -52Z M-12 -30 L-4 -38 L2 -30Z" fill="#fff" />}
    </g>
  );
}

function Palm() {
  return (
    <g>
      <path d="M0 0 Q-4 -26 6 -50" stroke="#8a5a33" strokeWidth="7" fill="none" strokeLinecap="round" />
      {[-60, -20, 20, 60, 160].map((r) => (
        <ellipse key={r} cx="18" cy="0" rx="18" ry="6" fill="#3fae4a" stroke={OUT} strokeWidth="1.5" transform={`translate(6 -50) rotate(${r - 90}) translate(-2 0)`} />
      ))}
    </g>
  );
}

function Cactus() {
  return (
    <g fill="#4caf50" stroke={OUT} strokeWidth="2">
      <rect x="-7" y="-40" width="14" height="40" rx="7" />
      <path d="M-7 -20 h-8 a5 5 0 0 1 -5 -5 v-8 a4 4 0 0 1 8 0 v5 h5" />
      <path d="M7 -26 h7 a5 5 0 0 0 5 -5 v-6 a4 4 0 0 0 -8 0 v3 h-4" />
    </g>
  );
}

function Rock({ color = '#a7adb5' }) {
  return (
    <g>
      <path d="M-20 0 Q-22 -16 -8 -22 Q6 -28 16 -16 Q24 -6 20 0Z" fill={color} stroke={OUT} strokeWidth="2" />
      <path d="M-8 -18 Q0 -22 8 -16" stroke="#fff" strokeOpacity=".45" strokeWidth="3" fill="none" strokeLinecap="round" />
    </g>
  );
}

function Hill({ color }) {
  return (
    <g>
      <path d="M-44 0 Q-34 -36 0 -40 Q34 -36 44 0Z" fill={color} stroke={OUT} strokeOpacity=".5" strokeWidth="2" />
      <ellipse cx="-12" cy="-26" rx="14" ry="6" fill="#fff" opacity=".3" />
    </g>
  );
}

function Flowers() {
  return (
    <g>
      {[[-12, -4, '#ff6b9a'], [0, -10, '#ffd166'], [12, -3, '#ffffff'], [-4, 2, '#c77dff'], [8, 6, '#ff6b9a']].map(([x, y, c], i) => (
        <g key={i} transform={`translate(${x} ${y})`}>
          <circle r="5" fill={c} stroke={OUT} strokeWidth="1.2" />
          <circle r="1.8" fill="#f4a261" />
        </g>
      ))}
    </g>
  );
}

function Block() {
  return (
    <g strokeLinejoin="round" stroke={OUT} strokeWidth="2">
      <path d="M-18 -8 l18 -9 l18 9 l-18 9z" fill="#e9edf3" />
      <path d="M-18 -8 v20 l18 9 v-20z" fill="#c4cad4" />
      <path d="M18 -8 v20 l-18 9 v-20z" fill="#9aa3b2" />
    </g>
  );
}

export function Decor({ kind, x, y, s = 1 }) {
  let el;
  switch (kind) {
    case 'bamboo':
      el = (
        <>
          <Bamboo x={-8} y={0} h={62} />
          <Bamboo x={6} y={4} h={48} />
        </>
      );
      break;
    case 'tree':
      el = <Tree x={0} y={0} s={1} />;
      break;
    case 'fruit':
      el = <Tree x={0} y={0} s={0.95} fruit={rand(x + y) > 0.5 ? '#ff7b39' : '#ef476f'} />;
      break;
    case 'maple':
      el = (
        <g>
          <rect x="-5" y="-6" width="10" height="20" rx="3" fill="#7a4a26" />
          <circle cx="0" cy="-20" r="22" fill="#e4572e" stroke="#9c2c13" strokeWidth="3" />
          <circle cx="-8" cy="-27" r="8" fill="#f3a712" />
          <circle cx="9" cy="-15" r="6" fill="#f08a24" />
        </g>
      );
      break;
    case 'pillar':
      el = <Pillar side="#9aa0a6" top="#8ccf5a" />;
      break;
    case 'mesa':
      el = <Pillar side="#d9893f" top="#f5c46a" h={40} />;
      break;
    case 'pine':
      el = <Pine />;
      break;
    case 'snowpine':
      el = <Pine snow />;
      break;
    case 'snowmtn':
      el = <Mountain color="#dfeaf5" shade="#b7c9de" snow />;
      break;
    case 'mtn':
      el = <Mountain color="#c08b5c" shade="#9a6a42" />;
      break;
    case 'palm':
      el = <Palm />;
      break;
    case 'cactus':
      el = <Cactus />;
      break;
    case 'rock':
      el = <Rock />;
      break;
    case 'block':
      el = <Block />;
      break;
    case 'hill':
      el = <Hill color="#f0b56e" />;
      break;
    case 'flowers':
      el = <Flowers />;
      break;
    default:
      return null;
  }
  const shadow = { snowmtn: 46, mtn: 46, pillar: 28, mesa: 28, hill: 44, bamboo: 18 }[kind] ?? 20;
  return (
    <g transform={`translate(${x.toFixed(1)} ${y.toFixed(1)}) scale(${s.toFixed(2)})`} aria-hidden="true">
      <ellipse cx="4" cy="3" rx={shadow} ry={shadow * 0.28} fill="#1a1006" opacity=".22" />
      {el}
    </g>
  );
}

// Jenis hiasan dan rupa tanah bagi setiap biom (ikut `landmark` kawasan).
export const BIOMES = {
  bamboo: { kinds: ['bamboo', 'tree', 'bamboo', 'tree', 'bamboo'], ground: '#7cd04f', dark: '#4f9e2f' },
  dojo: { kinds: ['pillar', 'pine', 'pillar', 'rock', 'pillar'], ground: '#b5c48f', dark: '#7f8f5d' },
  clock: { kinds: ['maple', 'hill', 'maple', 'maple', 'rock'], ground: '#f1b46a', dark: '#c47c35' },
  shapes: { kinds: ['block', 'rock', 'tree', 'block', 'rock'], ground: '#ddd3b4', dark: '#a8986e' },
  garden: { kinds: ['fruit', 'flowers', 'fruit', 'fruit', 'flowers'], ground: '#92dc62', dark: '#5aa834' },
  market: { kinds: ['mesa', 'palm', 'cactus', 'mesa', 'palm'], ground: '#f4cc72', dark: '#d39a3f' },
  bridge: { kinds: ['tree', 'rock', 'pine', 'tree', 'flowers'], ground: '#70d07e', dark: '#3f9a52' },
  records: { kinds: ['snowpine', 'snowmtn', 'snowpine', 'snowpine', 'snowmtn'], ground: '#e7f1fa', dark: '#a9c3dc' },
};

export function Islet({ x, y, rx, ry, seed, ground = '#7cd04f', children }) {
  const d = blobPath(x, y, rx, ry, seed, 9, 0.14);
  return (
    <g aria-hidden="true">
      <path d={blobPath(x, y, rx + 12, ry + 10, seed, 9, 0.14)} fill="#7fd6e6" opacity=".55" />
      <path d={d} transform="translate(0 14)" fill="#7a5638" />
      <path d={d} transform="translate(0 7)" fill="#9c7048" />
      <path d={d} fill={ground} stroke="#4f9e2f" strokeWidth="3" />
      {children}
    </g>
  );
}

export function Waterfall({ x, y, h = 34 }) {
  return (
    <g aria-hidden="true">
      <rect x={x - 14} y={y - 4} width="28" height={h + 4} rx="6" fill="#7fd0f5" />
      <path className="falls" d={`M${x - 8} ${y} v${h} M${x} ${y} v${h} M${x + 8} ${y} v${h}`} stroke="#fff" strokeWidth="3" strokeDasharray="8 8" strokeLinecap="round" />
      <ellipse cx={x} cy={y + h + 4} rx="26" ry="8" fill="#fff" opacity=".8" />
    </g>
  );
}

export function Whirlpool({ x, y }) {
  return (
    <g transform={`translate(${x} ${y})`} aria-hidden="true">
      <g className="whirl">
        <path
          d="M0 0 m-4 0 a4 4 0 1 1 8 0 a10 10 0 1 1 -18 2 a17 17 0 1 1 32 -4 a26 26 0 1 1 -48 6 a34 34 0 1 1 64 -6"
          fill="none"
          stroke="#e8fbff"
          strokeOpacity=".75"
          strokeWidth="5"
          strokeLinecap="round"
        />
      </g>
    </g>
  );
}
