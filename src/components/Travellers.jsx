// Ninja berjalan dan kereta sorong yang bergerak di sepanjang jalan tanah peta.
// Gambar: jalur 4 frame (public/map/<nama>-depan.webp / -belakang.webp, dijana oleh
// scripts/make-sprites.mjs). Setiap bingkai, arah gerak dikira daripada laluan:
//   ke bawah -> pandangan depan, ke atas -> pandangan belakang, ke kiri -> gambar diterbalikkan.
// Kemas kini dibuat terus pada elemen SVG (tanpa render semula React) supaya ringan.
import { useEffect, useRef } from 'react';
import SHEETS from '../data/traveller-sprites.json';

// Lengkung licin (Catmull-Rom → Bézier) melalui titik-titik terbuka
export function smoothOpen(pts) {
  let d = `M${pts[0][0]},${pts[0][1]}`;
  for (let i = 0; i < pts.length - 1; i++) {
    const p0 = pts[Math.max(0, i - 1)];
    const [p1, p2] = [pts[i], pts[i + 1]];
    const p3 = pts[Math.min(pts.length - 1, i + 2)];
    const c1 = [p1[0] + (p2[0] - p0[0]) / 6, p1[1] + (p2[1] - p0[1]) / 6];
    const c2 = [p2[0] - (p3[0] - p1[0]) / 6, p2[1] - (p3[1] - p1[1]) / 6];
    d += ` C${c1[0].toFixed(1)},${c1[1].toFixed(1)} ${c2[0].toFixed(1)},${c2[1].toFixed(1)} ${p2[0]},${p2[1]}`;
  }
  return d;
}

// Jenis pengembara: tinggi dipapar (unit peta), kelajuan (unit/s), jarak satu kitaran 4 frame
const KINDS = {
  ninja: { sheet: 'ninja-jalan', height: 27, speed: 22, stride: 17 },
  kereta: { sheet: 'kereta-sorong', height: 32, speed: 26, stride: 24 },
};

const FADE = 0.06; // bahagian awal/akhir laluan untuk pudar masuk/keluar

const reducedMotion = () => typeof window !== 'undefined' && window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;

function makeTravellers(roads) {
  const list = [];
  roads.forEach((pts, r) => {
    const count = pts.length > 8 ? 2 : 1;
    for (let k = 0; k < count; k++) {
      const i = list.length;
      list.push({
        id: `${r}-${k}`,
        road: r,
        kind: i % 3 === 2 ? 'kereta' : 'ninja',
        reverse: (r + k) % 2 === 1,
        offset: (i * 0.37) % 1, // kedudukan mula di sepanjang laluan
      });
    }
  });
  return list;
}

export default function Travellers({ roads }) {
  const pathRefs = useRef([]);
  const nodeRefs = useRef({});
  const travellers = useRef(makeTravellers(roads)).current;

  useEffect(() => {
    if (reducedMotion()) return undefined;
    const lengths = pathRefs.current.map((p) => p.getTotalLength());
    let raf;
    const start = performance.now();

    const tick = (now) => {
      const t = (now - start) / 1000;
      for (const tr of travellers) {
        const node = nodeRefs.current[tr.id];
        const path = pathRefs.current[tr.road];
        if (!node || !path) continue;
        const kind = KINDS[tr.kind];
        const len = lengths[tr.road];
        const cycle = len / kind.speed;
        let u = ((t / cycle + tr.offset) % 1 + 1) % 1; // 0..1 sepanjang laluan
        const fade = Math.min(1, u / FADE, (1 - u) / FADE);
        if (tr.reverse) u = 1 - u;

        const s = u * len;
        const p = path.getPointAtLength(s);
        const q = path.getPointAtLength(Math.min(len, Math.max(0, s + (tr.reverse ? -2 : 2))));
        const dx = q.x - p.x;
        const dy = q.y - p.y;

        const view = dy > 0 ? 'depan' : 'belakang';
        const meta = SHEETS[kind.sheet][view];
        const h = kind.height;
        const w = (meta.frameW / meta.frameH) * h;
        const frame = Math.floor(((u * len) / kind.stride) * meta.frames) % meta.frames;
        const flip = dx < 0 ? -1 : 1;

        node.g.setAttribute('transform', `translate(${p.x.toFixed(1)} ${p.y.toFixed(1)}) scale(${flip} 1)`);
        node.g.setAttribute('opacity', fade.toFixed(2));
        node.clip.setAttribute('width', w.toFixed(1));
        node.clip.setAttribute('height', h);
        node.clip.setAttribute('x', (-w / 2).toFixed(1));
        node.clip.setAttribute('y', -h + 2);
        node.clip.setAttribute('viewBox', `${frame * meta.frameW} 0 ${meta.frameW} ${meta.frameH}`);
        if (node.view !== view) {
          node.img.setAttribute('href', `/map/${kind.sheet}-${view}.webp`);
          node.img.setAttribute('width', meta.frameW * meta.frames);
          node.img.setAttribute('height', meta.frameH);
          node.view = view;
        }
        node.shadow.setAttribute('rx', (w * 0.32).toFixed(1));
        node.shadow.setAttribute('ry', (w * 0.1).toFixed(1));
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [travellers]);

  if (reducedMotion()) return null;

  return (
    <g className="travellers" aria-hidden="true">
      {roads.map((pts, r) => (
        <path key={r} ref={(el) => (pathRefs.current[r] = el)} d={smoothOpen(pts)} fill="none" stroke="none" />
      ))}
      {travellers.map((tr) => (
        <g
          key={tr.id}
          opacity="0"
          ref={(el) => {
            if (!el) return;
            const n = (nodeRefs.current[tr.id] ||= { view: null });
            n.g = el;
            n.shadow = el.querySelector('ellipse');
            n.clip = el.querySelector('svg');
            n.img = el.querySelector('image');
          }}
        >
          <ellipse cx="0" cy="1" rx="10" ry="3" fill="#1a1006" opacity=".3" />
          <svg overflow="hidden" preserveAspectRatio="xMidYMax meet">
            <image />
          </svg>
        </g>
      ))}
    </g>
  );
}
