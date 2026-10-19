import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { missionStatus } from '../lib/storage.js';
import { Landmark } from './Art.jsx';
import { BIOMES, Decor } from './Terrain.jsx';
import { TextureDefs } from './MapEffects.jsx';
import { STATUS, StatusIcon } from './TopicMarker.jsx';
import SPRITE_SIZES from '../data/sprite-sizes.json';
import PROPS from '../data/props.json';
import SPRITES from '../data/traveller-sprites.json';
import IntroDialog from './IntroDialog.jsx';

// Hiasan bergambar (scripts/make-props.mjs): tinggi paparan (unit peta) bagi setiap jenis, dan
// urutan pilihan supaya semak/bunga/buluh lebih kerap daripada batu besar dan cendawan.
// 1 buluh, 2 pokok, 3 batu besar, 4 batu kecil, 5 semak, 6 bunga, 7 paku-pakis, 8 cendawan
const PROP_HEIGHT = [0, 140, 160, 82, 64, 70, 56, 78, 46];
const PROP_ORDER = [5, 1, 6, 2, 7, 4, 1, 5, 6, 3, 8, 2, 7, 6, 1, 5, 4, 6];

/* Peta tahap (level map) bagi satu kawasan: laluan berliku dengan satu bulatan bagi setiap subtopik.
   Laluan mendatar pada skrin landskap dan menegak (bermula dari bawah) pada skrin potret.
   Tahap dijarakkan jauh, jadi peta lebih panjang daripada skrin dan boleh ditatal; ninja berjalan
   mengikut jalan ke tahap yang ditekan. */

const STEP = 560; // jarak antara tahap (unit peta)
const SINGLE = {
  landscape: { w: 1600, h: 900 },
  portrait: { w: 900, h: 1600 },
};

function useBoxSize(ref) {
  const [size, setSize] = useState({ w: 1200, h: 800 });
  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;
    const measure = () => setSize({ w: el.clientWidth, h: el.clientHeight });
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => ro.disconnect();
  }, [ref]);
  return size;
}

// Titik lengkung tambahan antara dua tahap supaya jalan berliku secara semula jadi.
function wiggle(a, b, k) {
  const mx = (a[0] + b[0]) / 2;
  const my = (a[1] + b[1]) / 2;
  const dx = b[0] - a[0];
  const dy = b[1] - a[1];
  const len = Math.hypot(dx, dy) || 1;
  const off = (k % 2 ? 1 : -1) * Math.min(90, len * 0.18);
  return [mx + (-dy / len) * off, my + (dx / len) * off];
}

// Kedudukan tahap, bangunan dan titik jalan.
function makeLayout(orient, n) {
  let w;
  let h;
  let nodes;
  let start;
  let end;
  let building;
  if (n === 1) {
    ({ w, h } = SINGLE[orient]);
    nodes = [[w / 2, h / 2]];
    if (orient === 'landscape') {
      start = [380, h * 0.62];
      end = [w + 60, h * 0.42];
      building = [250, h * 0.6];
    } else {
      start = [w * 0.56, h - 110];
      end = [w / 2, -80];
      building = [w * 0.72, h - 110];
    }
  } else if (orient === 'landscape') {
    h = 900;
    w = 640 + (n - 1) * STEP + 400;
    nodes = Array.from({ length: n }, (_, i) => [640 + i * STEP, h * (i % 2 ? 0.36 : 0.62)]);
    start = [380, h * 0.62];
    end = [w + 80, h * 0.48];
    building = [250, h * 0.6];
  } else {
    w = 900;
    h = 440 + (n - 1) * STEP + 380;
    nodes = Array.from({ length: n }, (_, i) => [w * (i % 2 ? 0.66 : 0.34), h - 440 - i * STEP]);
    start = [w * 0.56, h - 110];
    end = [w / 2, -80];
    building = [w * 0.72, h - 110];
  }
  const pts = [start];
  nodes.forEach((p, i) => {
    if (i > 0) pts.push(wiggle(nodes[i - 1], p, i));
    pts.push(p);
  });
  pts.push(end);
  return { w, h, nodes, pts, start, building };
}
// Lengkung licin (Catmull-Rom) melalui semua titik.
function smoothPath(pts) {
  let d = `M${pts[0][0]} ${pts[0][1]}`;
  for (let i = 0; i < pts.length - 1; i++) {
    const p0 = pts[i - 1] ?? pts[i];
    const p1 = pts[i];
    const p2 = pts[i + 1];
    const p3 = pts[i + 2] ?? p2;
    const c1 = [p1[0] + (p2[0] - p0[0]) / 6, p1[1] + (p2[1] - p0[1]) / 6];
    const c2 = [p2[0] - (p3[0] - p1[0]) / 6, p2[1] - (p3[1] - p1[1]) / 6];
    d += ` C${c1[0].toFixed(1)} ${c1[1].toFixed(1)} ${c2[0].toFixed(1)} ${c2[1].toFixed(1)} ${p2[0]} ${p2[1]}`;
  }
  return d;
}

const rand = (s) => {
  const x = Math.sin(s * 78.233 + 1.7) * 43758.5453;
  return x - Math.floor(x);
};

// Hiasan biom ditabur jauh dari laluan, bulatan dan bangunan.
function scatterDecor(layout, kinds, orient) {
  const { w, h, pts } = layout;
  const [bx, by] = layout.building;
  const avoid = [...layout.nodes, layout.building, [bx, by - 200], [bx - 160, by - 120], [bx + 160, by - 120]];
  // label tahap di tepi bulatan (potret)
  if (orient === 'portrait') layout.nodes.forEach(([x, y]) => avoid.push([x - 210, y], [x + 210, y]));
  for (let i = 0; i < pts.length - 1; i++) {
    for (let t = 0; t < 1; t += 0.2) {
      avoid.push([pts[i][0] + (pts[i + 1][0] - pts[i][0]) * t, pts[i][1] + (pts[i + 1][1] - pts[i][1]) * t]);
    }
  }
  const max = Math.round((w * h) / 85000);
  const out = [];
  for (let k = 0; k < max * 30 && out.length < max; k++) {
    const x = 40 + rand(k * 2) * (w - 80);
    const y = 140 + rand(k * 2 + 1) * (h - 180);
    // semak kaki dan bahagian atas (hiasan tinggi seperti buluh dilukis ke atas)
    if (avoid.some(([ax, ay]) => Math.hypot(ax - x, ay - y) < 175 || Math.hypot(ax - x, ay - (y - 120)) < 150)) continue;
    if (out.some((o) => Math.hypot(o.x - x, o.y - y) < 120)) continue;
    out.push({ x, y, kind: kinds[out.length % kinds.length], s: 1.3 + rand(k) * 0.6 });
  }
  return out.sort((a, b) => a.y - b.y);
}

// Pecah tajuk panjang kepada dua baris yang seimbang.
function titleLines(text) {
  if (text.length <= 14) return [text];
  const words = text.split(' ');
  let best = [text];
  let bestDiff = Infinity;
  for (let i = 1; i < words.length; i++) {
    const a = words.slice(0, i).join(' ');
    const b = words.slice(i).join(' ');
    const diff = Math.abs(a.length - b.length);
    if (diff < bestDiff) {
      bestDiff = diff;
      best = [a, b];
    }
  }
  return best;
}

function activate(e, fn) {
  if (e.key === 'Enter' || e.key === ' ') {
    e.preventDefault();
    fn();
  }
}

// Tapak batu tahap (scripts/make-sprites.mjs, 3 frame): saiz paparan dan kedudukan pusat permukaan atas.
const STONE_META = SPRITES['tapak-tahap']?.diri ?? { frameW: 338, frameH: 300 };
const STONE = {
  fw: STONE_META.frameW,
  fh: STONE_META.frameH,
  w: 150,
  h: (150 * STONE_META.frameH) / STONE_META.frameW,
  top: 0.47, // pusat permukaan atas, pecahan tinggi dari atas
};

// labelSide: 0 = di bawah batu (landskap), -1 / 1 = di kiri / kanan (potret)
function LevelNode({ x, y, number, sub, status, selected, onSelect, labelSide = 0 }) {
  const st = STATUS[status];
  const lines = titleLines(sub.title);
  const lw = Math.max(150, Math.max(...lines.map((l) => l.length)) * 12.5 + 40);
  const lh = lines.length * 22 + 34;
  const play = sub.playable;
  // frame batu: 0 boleh main, 1 akan datang, 2 selesai
  const frame = status === 'selesai' ? 2 : play ? 0 : 1;
  return (
    <g
      className={`level-node${selected ? ' is-selected' : ''}${play ? '' : ' is-soon'}`}
      transform={`translate(${x} ${y})`}
      role="button"
      tabIndex={0}
      aria-label={`${number}. ${sub.title}, ${st.label}${play ? '' : ', aktiviti akan datang'}`}
      onClick={onSelect}
      onKeyDown={(e) => activate(e, onSelect)}
    >
      <g className="level-lift">
        {/* tapak batu: titik (0,0) = tengah permukaan atas batu */}
        <ellipse cx="4" cy={STONE.h * (1 - STONE.top) - 8} rx={STONE.w * 0.46} ry="13" fill="url(#contact-shade)" />
        <svg
          x={-STONE.w / 2}
          y={-STONE.h * STONE.top}
          width={STONE.w}
          height={STONE.h}
          viewBox={`${frame * STONE.fw} 0 ${STONE.fw} ${STONE.fh}`}
          aria-hidden="true"
        >
          <image href="/map/tapak-tahap.webp" width={STONE.fw * 3} height={STONE.fh} />
        </svg>
        {selected && play && <ellipse className="level-pulse" cx="0" cy="-2" rx={STONE.w * 0.4} ry={STONE.w * 0.22} />}
        {/* nombor "terukir" di atas batu, dileperkan sedikit ikut perspektif */}
        <text className={`level-num${play ? '' : ' is-soon'}`} y="22" textAnchor="middle" transform="scale(1 0.86)">
          {number}
        </text>
        {/* label tajuk dan status */}
        <g transform={labelSide ? `translate(${labelSide * (STONE.w / 2 + 8 + lw / 2)} ${-lh / 2})` : `translate(0 ${STONE.h * (1 - STONE.top) + 6})`}>
          <rect x={-lw / 2} y="3" width={lw} height={lh} rx="16" fill="#1a1006" opacity=".2" />
          <rect x={-lw / 2} y="0" width={lw} height={lh} rx="16" fill="#fffdf6" stroke="#3b2a1a" strokeWidth="2.5" />
          <text className="level-title" textAnchor="middle">
            {lines.map((l, i) => (
              <tspan key={i} x="0" y={24 + i * 22}>
                {l}
              </tspan>
            ))}
          </text>
          <g transform={`translate(0 ${lines.length * 22 + 17})`}>
            {/* ikon + teks status dipusatkan bersama (lebar teks dianggar) */}
            <g transform={`translate(${-(st.label.length * 7.6 + 20) / 2} 0)`}>
              <g transform="translate(8 0)">
                <StatusIcon status={status} size={16} />
              </g>
              <text className={`level-status ${st.className}`} x="20" y="5">
                {st.label}
              </text>
            </g>
          </g>
        </g>
      </g>
    </g>
  );
}

// Sprite ninja berjalan (4 frame sebaris). Pandangan depan bergerak ke kanan bawah, belakang ke kanan atas;
// arah kiri dibuat dengan menterbalikkan gambar.
// 'diri' = berdiri diam menghadap pemain (gelung nafas dan kelip mata).
const NINJA_STRIPS = {
  depan: { href: '/map/ninja-jalan-depan.webp', fw: SPRITES['ninja-jalan'].depan.frameW },
  belakang: { href: '/map/ninja-jalan-belakang.webp', fw: SPRITES['ninja-jalan'].belakang.frameW },
  diri: { href: '/map/ninja-diri.webp', fw: SPRITES['ninja-diri']?.diri.frameW ?? 118 },
};
const NINJA_H = 77; // tinggi paparan (unit peta)
// [frame, tempoh ms]: diam, nafas, diam, kelip mata, diam, ikat kepala bergerak
const IDLE_SEQ = [
  [0, 1500],
  [1, 450],
  [0, 1300],
  [2, 140],
  [0, 900],
  [3, 550],
];
const STRIDE = 26; // unit peta setiap frame langkah
const WALK_SPEED = 340; // unit peta sesaat
const STONE_GAP = 95; // jarak di jalan dari tengah batu ke tempat ninja lompat naik/turun
const JUMP_MS = 560;

// Ninja di atas jalan. Kedudukan dikemas kini terus pada DOM oleh RegionMap (tanpa render semula).
function NinjaWalker({ refs }) {
  return (
    <g ref={refs.root} className="ninja-walker" aria-hidden="true">
      <ellipse ref={refs.shadow} cx="0" cy="0" rx="22" ry="6" fill="#1a1006" opacity=".3" />
      {/* lift = ketinggian lompatan; animasi CSS pada kumpulan dalam supaya tidak menimpa transform */}
      <g ref={refs.lift}>
      <g className="level-ninja">
        <g ref={refs.flip}>
          <svg
            ref={refs.frame}
            x={-(NINJA_H * NINJA_STRIPS.diri.fw) / 320}
            y={1 - NINJA_H}
            width={(NINJA_H * NINJA_STRIPS.diri.fw) / 160}
            height={NINJA_H}
            viewBox={`0 0 ${NINJA_STRIPS.diri.fw} 160`}
          >
            <image ref={refs.img} href={NINJA_STRIPS.diri.href} width={NINJA_STRIPS.diri.fw * 4} height="160" />
          </svg>
        </g>
      </g>
      </g>
    </g>
  );
}

const easeInOut = (t) => 0.5 - Math.cos(Math.PI * t) / 2;
const reducedMotion = () => window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;

// Jalan tanah yang dilukis: tepi rumput gelap, tanah bertekstur, cahaya di tengah dan kerikil.
function DirtTrail({ d }) {
  return (
    <g className="dirt-trail" aria-hidden="true">
      <g filter="url(#dirt-rough)">
        <path d={d} stroke="#2f5a1c" strokeWidth="92" fill="none" strokeLinecap="round" opacity=".35" />
        <path d={d} stroke="#8a5b30" strokeWidth="80" fill="none" strokeLinecap="round" />
        <path d={d} stroke="#c8955a" strokeWidth="70" fill="none" strokeLinecap="round" />
        <path d={d} stroke="url(#dirt-tex)" strokeWidth="70" fill="none" strokeLinecap="round" />
      </g>
      <path d={d} stroke="#e0b77c" strokeWidth="34" fill="none" strokeLinecap="round" opacity=".55" filter="url(#trail-soft)" />
      {/* kerikil kecil */}
      <path d={d} stroke="#7d5a3a" strokeWidth="7" strokeDasharray="1 31 1 53" fill="none" strokeLinecap="round" opacity=".55" transform="translate(-18 6)" />
      <path d={d} stroke="#f2d6a4" strokeWidth="6" strokeDasharray="1 47 1 29" fill="none" strokeLinecap="round" opacity=".7" transform="translate(16 -8)" />
      <path d={d} stroke="#6b4a2c" strokeWidth="5" strokeDasharray="1 61" fill="none" strokeLinecap="round" opacity=".5" transform="translate(4 14)" />
    </g>
  );
}

// Satu hiasan bergambar, kaki pada (x, y), dengan bayang lembut.
// Bayang objek bergambar: (1) bayang jatuh = siluet gambar itu sendiri, digelapkan, dileperkan ke tanah
// dan dicondongkan ke belakang kanan bermula dari kaki (cahaya dari kiri depan); (2) bayang sentuhan gelap
// rapat di kaki.
// base = pecahan tinggi gambar dari bawah yang dianggap kaki objek.
function ObjectShadow({ href, x, y, ww, hh, base = 0 }) {
  const fy = y - hh * base;
  return (
    <>
      <image
        href={href}
        x={x - ww / 2}
        y={y - hh}
        width={ww}
        height={hh}
        filter="url(#cast-shadow)"
        transform={`translate(${x} ${fy}) skewX(-52) scale(1 0.34) translate(${-x} ${-fy})`}
      />
      <ellipse cx={x + ww * 0.04} cy={fy - 1} rx={ww * 0.4} ry={Math.max(5, ww * 0.08)} fill="url(#contact-shade)" />
    </>
  );
}

function PropArt({ prop, kind, x, y, s }) {
  const hh = PROP_HEIGHT[kind] * (0.75 + s * 0.2);
  const ww = (prop.w / prop.h) * hh;
  return (
    <g aria-hidden="true">
      <ObjectShadow href={prop.src} x={x} y={y} ww={ww} hh={hh} base={0.03} />
      <image href={prop.src} x={x - ww / 2} y={y - hh} width={ww} height={hh} />
    </g>
  );
}

function BuildingArt({ region, x, y, scale }) {
  if (!region.sprite) {
    return (
      <g transform={`translate(${x} ${y - 40}) scale(${scale * 1.3})`} aria-hidden="true">
        <Landmark type={region.landmark} />
      </g>
    );
  }
  const size = SPRITE_SIZES[region.sprite.match(/([^/]+)\.webp$/)[1]] ?? { w: 1, h: 1 };
  const k = Math.min((400 * scale) / size.w, (420 * scale) / size.h);
  const w = size.w * k;
  const h = size.h * k;
  return (
    <g aria-hidden="true">
      <ObjectShadow href={region.sprite} x={x} y={y + h * 0.025} ww={w} hh={h} base={0.1} />
      <image href={region.sprite} x={x - w / 2} y={y - h * 0.975} width={w} height={h} />
    </g>
  );
}

// walkFrom (pilihan): subtopik asal ninja; ninja berjalan sendiri dari situ ke selectedSub semasa dibuka
// (cth. selepas misi selesai, ke tahap seterusnya).
// showIntro: tunjuk intro cerita (region.intro) kali pertama; onIntroDone dipanggil selepas dialog.
export default function RegionMap({ region, progress, selectedSub, walkFrom, showIntro, onIntroDone, onSelectSub, onBack }) {
  const boxRef = useRef(null);
  const box = useBoxSize(boxRef);
  const orient = box.w >= box.h * 0.9 ? 'landscape' : 'portrait';
  const biome = BIOMES[region.landmark];
  const subs = region.subtopics;
  const layout = useMemo(() => makeLayout(orient, subs.length), [orient, subs.length]);
  const { w, h } = layout;
  const decor = useMemo(() => scatterDecor(layout, PROPS[region.id] ? PROP_ORDER : biome.kinds, orient), [layout, biome.kinds, region.id, orient]);
  const trail = useMemo(() => smoothPath(layout.pts), [layout]);
  const isPreview = subs.every((s) => !s.playable);
  // intro: 'exit' (ninja keluar dari rumah) | 'talk' (dialog) | null
  const [intro, setIntro] = useState(showIntro && region.intro ? 'exit' : null);
  const indexOf = (id) => Math.max(0, subs.findIndex((s) => s.id === id));

  // Saiz SVG dalam piksel: peta memenuhi tinggi (landskap) atau lebar (potret) dan ditatal pada paksi lain.
  const svgSize =
    orient === 'landscape'
      ? { width: Math.max(box.w, (box.h * w) / h), height: box.h }
      : { width: box.w, height: Math.max(box.h, (box.w * h) / w) };

  /* ---------- Ninja berjalan ---------- */
  const pathRef = useRef(null);
  const ninja = { root: useRef(null), lift: useRef(null), shadow: useRef(null), flip: useRef(null), frame: useRef(null), img: useRef(null) };
  const nodeLens = useRef([]);
  // pos = kedudukan kaki ninja (unit peta); ninja berdiri di atas batu tahap idx bila tidak bergerak
  const cur = useRef({ idx: indexOf(walkFrom ?? selectedSub), pos: [0, 0], flip: false });
  const walking = useRef(false);
  const raf = useRef(0);
  const runId = useRef(0);

  // sx/sy = regangan badan (lompat), lift = tinggi lompatan di atas tanah
  const draw = useCallback((pos, view, frameNo, flip, sx = 1, sy = 1, lift = 0) => {
    const n = ninja;
    if (!n.root.current) return;
    n.root.current.setAttribute('transform', `translate(${pos[0].toFixed(1)} ${pos[1].toFixed(1)})`);
    n.lift.current.setAttribute('transform', `translate(0 ${(-lift).toFixed(1)})`);
    // bayang mengecil bila ninja tinggi di udara
    n.shadow.current.setAttribute('transform', `scale(${(1 - Math.min(lift, 90) / 180).toFixed(3)})`);
    const strip = NINJA_STRIPS[view];
    const fw = strip.fw;
    if (n.img.current.getAttribute('href') !== strip.href) {
      // lebar frame berbeza antara sprite: laras saiz paparan supaya nisbah kekal
      const dw = (NINJA_H * fw) / 160;
      n.img.current.setAttribute('href', strip.href);
      n.img.current.setAttribute('width', fw * 4);
      n.frame.current.setAttribute('width', dw);
      n.frame.current.setAttribute('x', -dw / 2);
    }
    n.frame.current.setAttribute('viewBox', `${frameNo * fw} 0 ${fw} 160`);
    n.flip.current.setAttribute('transform', `scale(${(flip ? -sx : sx).toFixed(3)} ${sy.toFixed(3)})`);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Tatal supaya ninja kekal di tengah skrin (lerp = 1 untuk terus).
  const follow = useCallback((lerp) => {
    const el = boxRef.current;
    const nr = ninja.root.current;
    if (!el || !nr) return;
    const b = el.getBoundingClientRect();
    const r = nr.getBoundingClientRect();
    el.scrollLeft += (r.left + r.width / 2 - (b.left + b.width / 2)) * lerp;
    el.scrollTop += (r.top + r.height / 2 - (b.top + b.height / 2)) * lerp;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Kaki ninja di atas batu: sedikit ke belakang permukaan supaya nombor di depan kekal kelihatan.
  const stonePos = (i) => [layout.nodes[i][0], layout.nodes[i][1] - 22];
  const pathPos = (len) => {
    const p = pathRef.current.getPointAtLength(len);
    return [p.x, p.y];
  };

  // Jalankan fn(t) dari t = 0 hingga 1 dalam dur ms; berhenti jika pergerakan baru bermula.
  const animate = (dur, id, fn) =>
    new Promise((resolve) => {
      const t0 = performance.now();
      const step = (now) => {
        if (runId.current !== id) return;
        const t = Math.min(1, (now - t0) / dur);
        fn(t);
        follow(0.12);
        if (t < 1) raf.current = requestAnimationFrame(step);
        else resolve();
      };
      raf.current = requestAnimationFrame(step);
    });

  // Lompatan dari a ke b: bertinggung, melayang dalam lengkung, mendarat dengan sedikit tekanan.
  const jump = (a, b, id) => {
    const flip = b[0] < a[0] - 1;
    const view = b[1] < a[1] - 4 ? 'belakang' : 'depan';
    const height = 46 + Math.max(0, a[1] - b[1]) * 0.3;
    return animate(JUMP_MS, id, (t) => {
      if (t < 0.2) {
        const k = Math.sin((t / 0.2) * Math.PI);
        draw(a, 'diri', 0, false, 1 + 0.1 * k, 1 - 0.16 * k);
      } else if (t < 0.82) {
        const u = (t - 0.2) / 0.62;
        const e = easeInOut(u);
        const pos = [a[0] + (b[0] - a[0]) * e, a[1] + (b[1] - a[1]) * e];
        draw(pos, view, 1, flip, 0.94, 1.08, height * 4 * u * (1 - u));
      } else {
        const k = Math.sin(((t - 0.82) / 0.18) * Math.PI);
        draw(b, 'diri', 0, false, 1 + 0.12 * k, 1 - 0.18 * k);
      }
    });
  };

  // Berjalan di sepanjang jalan dari panjang `from` ke `to`.
  const walkPath = (from, to, id) => {
    const path = pathRef.current;
    const dir = Math.sign(to - from);
    const dur = Math.max(300, (Math.abs(to - from) / WALK_SPEED) * 1000);
    return animate(dur, id, (t) => {
      const len = from + (to - from) * easeInOut(t);
      const a = path.getPointAtLength(len);
      const b = path.getPointAtLength(Math.max(0, len + dir * 6));
      const flip = b.x - a.x < -0.3;
      cur.current = { ...cur.current, pos: [a.x, a.y], flip };
      draw([a.x, a.y], b.y - a.y < -0.3 ? 'belakang' : 'depan', Math.floor(Math.abs(len - from) / STRIDE) % 4, flip);
    });
  };

  // Lompat turun dari batu semasa, berjalan, kemudian lompat naik ke batu tahap i.
  const walkTo = useCallback(
    async (i, done) => {
      if (!pathRef.current) return;
      cancelAnimationFrame(raf.current);
      const id = ++runId.current;
      const from = cur.current.idx;
      const finish = () => {
        walking.current = false;
        ninja.root.current?.classList.remove('is-walking');
        cur.current = { idx: i, pos: stonePos(i), flip: false };
        draw(cur.current.pos, 'diri', 0, false); // berdiri di atas batu, menghadap pemain
        done?.();
      };
      if (i === from || reducedMotion()) {
        finish();
        follow(1);
        return;
      }
      walking.current = true;
      ninja.root.current?.classList.add('is-walking');
      const dir = Math.sign(i - from);
      const total = pathRef.current.getTotalLength();
      const offLen = Math.min(total, Math.max(0, nodeLens.current[from] + dir * STONE_GAP));
      const onLen = Math.min(total, Math.max(0, nodeLens.current[i] - dir * STONE_GAP));
      await jump(stonePos(from), pathPos(offLen), id);
      if (runId.current !== id) return;
      await walkPath(offLen, onLen, id);
      if (runId.current !== id) return;
      await jump(pathPos(onLen), stonePos(i), id);
      if (runId.current !== id) return;
      finish();
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [draw, follow, layout]
  );


  /* ---------- Intro cerita: keluar dari rumah -> dialog -> ke batu pertama ---------- */
  const doorPos = () => [layout.building[0] + 8, layout.building[1] - 6];

  // Berjalan dalam garis lurus (dari pintu ke permulaan jalan).
  const walkLine = (a, b, id) => {
    const dist = Math.hypot(b[0] - a[0], b[1] - a[1]);
    const flip = b[0] < a[0] - 0.3;
    const view = b[1] < a[1] - 0.3 ? 'belakang' : 'depan';
    return animate(Math.max(250, (dist / WALK_SPEED) * 1000), id, (t) => {
      const pos = [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t];
      cur.current = { ...cur.current, pos, flip };
      draw(pos, view, Math.floor((dist * t) / STRIDE) % 4, flip);
    });
  };

  // Ninja muncul di pintu rumah, melangkah keluar ke jalan, kemudian dialog dibuka.
  const introExit = async () => {
    const id = ++runId.current;
    const root = ninja.root.current;
    const door = doorPos();
    const start = pathPos(0);
    walking.current = true;
    cur.current = { idx: 0, pos: door, flip: false };
    if (reducedMotion()) {
      cur.current.pos = start;
      draw(start, 'diri', 0, false);
      walking.current = false;
      setIntro('talk');
      return;
    }
    root.style.opacity = '0';
    draw(door, 'diri', 0, false, 0.6, 0.6);
    follow(1);
    await new Promise((r) => setTimeout(r, 450));
    if (runId.current !== id) return;
    await animate(380, id, (t) => {
      root.style.opacity = String(Math.min(1, t * 2));
      const s = 0.6 + 0.4 * easeInOut(t);
      draw(door, 'diri', 0, false, s, s, 18 * Math.sin(Math.PI * t));
    });
    if (runId.current !== id) return;
    root.style.opacity = '';
    await walkLine(door, start, id);
    if (runId.current !== id) return;
    cur.current = { idx: 0, pos: start, flip: false };
    draw(start, 'diri', 0, false);
    walking.current = false;
    setTimeout(() => setIntro('talk'), 250);
  };

  // Selepas dialog: berjalan dari permulaan jalan dan lompat ke batu pertama.
  const introWalk = async () => {
    setIntro(null);
    onIntroDone?.();
    const id = ++runId.current;
    const finish = () => {
      walking.current = false;
      cur.current = { idx: 0, pos: stonePos(0), flip: false };
      draw(cur.current.pos, 'diri', 0, false);
    };
    if (reducedMotion()) {
      finish();
      follow(1);
      return;
    }
    walking.current = true;
    const onLen = Math.max(0, nodeLens.current[0] - STONE_GAP);
    await walkPath(0, onLen, id);
    if (runId.current !== id) return;
    await jump(pathPos(onLen), stonePos(0), id);
    if (runId.current !== id) return;
    finish();
  };

  // Ukur kedudukan setiap tahap di sepanjang jalan; letak ninja dan tatal kepadanya.
  useLayoutEffect(() => {
    const path = pathRef.current;
    if (!path) return;
    const total = path.getTotalLength();
    const samples = [];
    for (let l = 0; l <= total; l += 5) samples.push([l, path.getPointAtLength(l)]);
    nodeLens.current = layout.nodes.map(([x, y]) => {
      let best = 0;
      let bd = Infinity;
      for (const [l, p] of samples) {
        const d = (p.x - x) ** 2 + (p.y - y) ** 2;
        if (d < bd) {
          bd = d;
          best = l;
        }
      }
      return best;
    });
    cancelAnimationFrame(raf.current);
    runId.current++;
    walking.current = false;
    if (intro === 'exit') {
      introExit();
      return;
    }
    cur.current = { idx: cur.current.idx, pos: intro === 'talk' ? pathPos(0) : stonePos(cur.current.idx), flip: false };
    draw(cur.current.pos, 'diri', 0, false);
    follow(1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [layout]);

  // Saiz skrin berubah: koordinat jalan tidak berubah, cuma tatal semula ke ninja (jangan ganggu langkah).
  useLayoutEffect(() => {
    if (!walking.current) follow(1);
  }, [svgSize.width, svgSize.height, follow]);

  // Landskap: roda tetikus menatal ke kiri/kanan.
  const onWheel = (e) => {
    if (orient !== 'landscape' || Math.abs(e.deltaX) > Math.abs(e.deltaY)) return;
    boxRef.current.scrollLeft += e.deltaY;
  };

  // Selepas misi selesai: berjalan sendiri ke tahap seterusnya.
  useEffect(() => {
    if (!walkFrom || walkFrom === selectedSub) return;
    const id = setTimeout(() => walkTo(indexOf(selectedSub)), 600);
    return () => clearTimeout(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => () => cancelAnimationFrame(raf.current), []);

  // Gelung diam: nafas, kelip mata dan ikat kepala bergerak (hanya bila tidak berjalan).
  useEffect(() => {
    if (reducedMotion()) return;
    let k = 0;
    let id;
    const tick = () => {
      if (!walking.current) draw(cur.current.pos, 'diri', IDLE_SEQ[k][0], false);
      id = setTimeout(() => {
        k = (k + 1) % IDLE_SEQ.length;
        tick();
      }, IDLE_SEQ[k][1]);
    };
    tick();
    return () => clearTimeout(id);
  }, [draw]);

  const onNode = (i) => {
    if (walking.current || intro) return;
    if (i === cur.current.idx) onSelectSub(subs[i].id);
    else walkTo(i, () => onSelectSub(subs[i].id));
  };

  return (
    <main className="screen region-screen level-screen" style={{ '--biome': biome.ground, '--biome-dark': biome.dark }}>
      <div className="region-bar">
        <button className="glass-pill btn-back" onClick={onBack}>
          <svg width="16" height="16" viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
            <path d="M15 5l-7 7 7 7" />
          </svg>
          Peta Dunia
        </button>
        <div className="region-title glass-chip">
          <h2>{region.topic}</h2>
          <p>{region.name}</p>
        </div>
      </div>

      {isPreview && (
        <p className="region-note" role="note">
          <span aria-hidden="true">🛠️</span> Aktiviti untuk topik ini akan ditambah dalam fasa seterusnya.
        </p>
      )}

      <div className={`level-box is-${orient}${region.background ? ' has-bg' : ''}`} ref={boxRef} onWheel={onWheel} style={region.background ? { backgroundImage: `url(${region.background})` } : undefined}>
        <svg className="level-svg" viewBox={`0 0 ${w} ${h}`} preserveAspectRatio="xMidYMid meet" style={svgSize} role="group" aria-label={`Laluan ${region.topic}`}>
          <defs>
            <TextureDefs />
            <radialGradient id="lvl-ground" cx="50%" cy="45%" r="75%">
              <stop offset="0" stopColor={biome.ground} />
              <stop offset="1" stopColor={biome.dark} />
            </radialGradient>
            {/* tepi jalan tidak rata + tekstur tanah */}
            {/* kawasan penapis dalam unit peta: kotak sempadan tidak mengira ketebalan garis, jadi peratus memotong tepi jalan */}
            <filter id="dirt-rough" filterUnits="userSpaceOnUse" x={-200} y={-200} width={w + 400} height={h + 400}>
              <feTurbulence type="fractalNoise" baseFrequency="0.045" numOctaves="3" seed="7" result="n" />
              <feDisplacementMap in="SourceGraphic" in2="n" scale="14" xChannelSelector="R" yChannelSelector="G" />
            </filter>
            <filter id="dirt-noise" x="0" y="0" width="100%" height="100%">
              <feTurbulence type="fractalNoise" baseFrequency="0.6" numOctaves="2" seed="3" />
              <feColorMatrix values="0 0 0 0 0.35  0 0 0 0 0.22  0 0 0 0 0.1  0 0 0 1.4 -0.55" />
            </filter>
            <filter id="trail-soft" filterUnits="userSpaceOnUse" x={-200} y={-200} width={w + 400} height={h + 400}>
              <feGaussianBlur stdDeviation="8" />
            </filter>
            <pattern id="dirt-tex" width="160" height="160" patternUnits="userSpaceOnUse">
              <rect width="160" height="160" filter="url(#dirt-noise)" />
            </pattern>
            <linearGradient id="coin-gold" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0" stopColor="#ffe27a" />
              <stop offset="1" stopColor="#f4a300" />
            </linearGradient>
            <filter id="cast-shadow" x="-60%" y="-60%" width="220%" height="220%" colorInterpolationFilters="sRGB">
              <feColorMatrix type="matrix" values="0 0 0 0 0.05  0 0 0 0 0.12  0 0 0 0 0.02  0 0 0 0.42 0" />
              <feGaussianBlur stdDeviation="3" />
            </filter>
            <radialGradient id="contact-shade">
              <stop offset="0" stopColor="#0d1a04" stopOpacity=".7" />
              <stop offset="1" stopColor="#0d1a04" stopOpacity="0" />
            </radialGradient>
            <radialGradient id="lvl-shade" cx="50%" cy="50%" r="70%">
              <stop offset=".55" stopColor="#0e2a08" stopOpacity="0" />
              <stop offset="1" stopColor="#0e2a08" stopOpacity=".35" />
            </radialGradient>
            <linearGradient id="coin-grey" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0" stopColor="#f1f3f7" />
              <stop offset="1" stopColor="#aeb6c4" />
            </linearGradient>
          </defs>

          {/* tanah biom SVG hanya bila tiada gambar latar; dilanjutkan melepasi viewBox supaya tepi skrin tidak kosong */}
          {!region.background &&
            (region.ground ? (
              <>
                {/* rumput dilukis (tekstur berulang) + bayang lembut di tepi supaya tidak rata */}
                <pattern id="lvl-grass" width="640" height="640" patternUnits="userSpaceOnUse">
                  <image href={region.ground} width="640" height="640" />
                </pattern>
                <rect x={-w} y={-h} width={w * 3} height={h * 3} fill="url(#lvl-grass)" />
                <rect x={-w} y={-h} width={w * 3} height={h * 3} fill="url(#lvl-shade)" />
              </>
            ) : (
              <>
                <rect x={-w} y={-h} width={w * 3} height={h * 3} fill="url(#lvl-ground)" />
                <rect x={-w} y={-h} width={w * 3} height={h * 3} fill="url(#tex-tufts)" />
                <rect x={-w} y={-h} width={w * 3} height={h * 3} fill="url(#tex-grain)" opacity=".14" />
              </>
            ))}

          {/* laluan tanah */}
          <DirtTrail d={trail} />
          {/* garis tengah jalan (tidak kelihatan) untuk laluan ninja */}
          <path ref={pathRef} d={trail} fill="none" stroke="none" />

          {!region.background &&
            decor.map((d, i) =>
              PROPS[region.id] ? <PropArt key={i} prop={PROPS[region.id][d.kind - 1]} kind={d.kind} x={d.x} y={d.y} s={d.s} /> : <Decor key={i} {...d} />
            )}

          <BuildingArt region={region} x={layout.building[0]} y={layout.building[1]} scale={orient === 'landscape' ? 1 : 0.9} />

          {subs.map((sub, i) => (
            <LevelNode
              key={sub.id}
              x={layout.nodes[i][0]}
              y={layout.nodes[i][1]}
              number={i + 1}
              sub={sub}
              status={missionStatus(progress, region.id, sub.id)}
              selected={sub.id === selectedSub}
              onSelect={() => onNode(i)}
              labelSide={orient === 'portrait' && subs.length > 1 ? (i % 2 ? 1 : -1) : 0}
            />
          ))}

          <NinjaWalker refs={ninja} />
        </svg>
      </div>

      {intro === 'talk' && <IntroDialog lines={region.intro} onDone={introWalk} />}
    </main>
  );
}
