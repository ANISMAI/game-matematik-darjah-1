// Seni Ninja Mask Designer — dilukis dengan kod dalam gaya Akademi Ninja (garis navy tebal, warna lembut).
// Lapisan: badan topeng (kawasan warna) → corak sisi → jalur mata (wajah) → pelekat → ikat kepala → kilauan.
// ⚠️ Gantian sementara untuk aset lapisan PNG/WebP sebenar (lihat README.md).
import { N, ell, rr, paint, line, shuriken } from '../mall/render.ts';
import { ANCHORS, EYE_BAND, MASK, colorById, itemById } from './data.ts';
import type { MaskDesign, Stroke } from './model.ts';

type Ctx = CanvasRenderingContext2D;
const O = '#26324d';

/** Siluet tudung/topeng ninja. */
export function maskPath(c: Ctx) {
  c.beginPath();
  c.moveTo(200, 34);
  c.bezierCurveTo(326, 34, 358, 140, 352, 246);
  c.bezierCurveTo(346, 352, 284, 430, 200, 436);
  c.bezierCurveTo(116, 430, 54, 352, 48, 246);
  c.bezierCurveTo(42, 140, 74, 34, 200, 34);
  c.closePath();
}

const hexOf = (id: string | undefined) => colorById(id ?? '')?.hex ?? '#f4efe4';

function shade(hex: string, k: number) {
  const n = parseInt(hex.slice(1), 16);
  const f = (v: number) => Math.max(0, Math.min(255, Math.round(v * k)));
  return `rgb(${f(n >> 16)},${f((n >> 8) & 255)},${f(n & 255)})`;
}

// ---------- pelekat / simbol ----------
export function drawSymbol(c: Ctx, id: string, x: number, y: number, s: number) {
  const it = itemById(id);
  if (!it) {
    // aset hilang: penanda ralat lembut (tidak merosakkan permainan)
    ell(c, x, y, s * 0.4, s * 0.4, '#e3e9f2', 2);
    return;
  }
  c.save();
  c.translate(x, y);
  c.lineJoin = 'round';
  const r = s / 2;
  switch (it.family) {
    case 'star': {
      c.beginPath();
      for (let i = 0; i < 10; i++) {
        const a = -Math.PI / 2 + (i * Math.PI) / 5;
        const rr2 = i % 2 ? r * 0.45 : r;
        c.lineTo(Math.cos(a) * rr2, Math.sin(a) * rr2);
      }
      c.closePath();
      paint(c, it.hex, 3);
      ell(c, -r * 0.2, -r * 0.25, r * 0.14, r * 0.09, 'rgba(255,255,255,.7)', 0);
      break;
    }
    case 'leaf': {
      c.rotate(-0.5);
      c.beginPath();
      c.moveTo(0, -r);
      c.quadraticCurveTo(r * 0.95, 0, 0, r);
      c.quadraticCurveTo(-r * 0.95, 0, 0, -r);
      paint(c, it.hex, 3);
      line(c, [0, -r * 0.8, 0, r * 0.85], '#2f7a45', 2);
      line(c, [0, -r * 0.2, r * 0.35, -r * 0.45], '#2f7a45', 1.5);
      line(c, [0, r * 0.2, -r * 0.35, -r * 0.05], '#2f7a45', 1.5);
      break;
    }
    case 'moon': {
      c.beginPath();
      c.arc(0, 0, r, Math.PI * 0.35, Math.PI * 1.65);
      c.arc(r * 0.42, 0, r * 0.75, Math.PI * 1.5, Math.PI * 0.5, true);
      c.closePath();
      paint(c, it.hex, 3);
      break;
    }
    case 'flame': {
      c.beginPath();
      c.moveTo(0, -r);
      c.bezierCurveTo(r * 0.9, -r * 0.2, r * 0.8, r * 0.9, 0, r);
      c.bezierCurveTo(-r * 0.8, r * 0.9, -r * 0.9, -r * 0.1, -r * 0.2, -r * 0.4);
      c.bezierCurveTo(-r * 0.1, -r * 0.1, 0, -r * 0.5, 0, -r);
      paint(c, it.hex, 3);
      c.beginPath();
      c.moveTo(0, -r * 0.1);
      c.bezierCurveTo(r * 0.4, r * 0.3, r * 0.35, r * 0.75, 0, r * 0.75);
      c.bezierCurveTo(-r * 0.35, r * 0.75, -r * 0.35, r * 0.3, 0, -r * 0.1);
      paint(c, '#ffd24d', 0);
      break;
    }
    case 'shuriken':
      shuriken(c, 0, 0, r, it.hex, 3, 0.2);
      ell(c, 0, 0, r * 0.22, r * 0.22, '#3d4c7a', 2);
      break;
    case 'heart': {
      c.beginPath();
      c.moveTo(0, r * 0.8);
      c.bezierCurveTo(-r * 1.2, 0, -r * 0.6, -r * 0.95, 0, -r * 0.35);
      c.bezierCurveTo(r * 0.6, -r * 0.95, r * 1.2, 0, 0, r * 0.8);
      paint(c, it.hex, 3);
      ell(c, -r * 0.4, -r * 0.3, r * 0.14, r * 0.1, 'rgba(255,255,255,.7)', 0);
      break;
    }
  }
  c.restore();
}

// ---------- corak sisi ----------
/** Kawasan sisi tempat corak dilukis (dipotong ikut siluet topeng). */
export function sideZone(anchorX: number) {
  const left = anchorX < 200;
  return { x: left ? 46 : 284, y: 252, w: 70, h: 132, left };
}

export function drawPattern(c: Ctx, id: string, anchorX: number) {
  const it = itemById(id);
  if (!it) return;
  const z = sideZone(anchorX);
  c.save();
  maskPath(c);
  c.clip();
  c.beginPath();
  c.rect(z.x, z.y, z.w, z.h);
  c.clip();
  c.strokeStyle = it.hex;
  c.fillStyle = it.hex;
  c.lineWidth = 6;
  c.lineCap = 'round';
  c.beginPath();
  switch (it.family) {
    case 'stripes':
      for (let y = z.y - 40; y < z.y + z.h + 40; y += 22) (c.moveTo(z.x - 10, y + 20), c.lineTo(z.x + z.w + 10, y - 20));
      c.stroke();
      break;
    case 'dots':
      for (let y = z.y + 12; y < z.y + z.h; y += 24) for (let x = z.x + 12 + ((y / 24) % 2) * 12; x < z.x + z.w; x += 24) (c.moveTo(x + 5, y), c.arc(x, y, 5, 0, Math.PI * 2));
      c.fill();
      break;
    case 'waves':
      for (let y = z.y + 14; y < z.y + z.h; y += 24) {
        c.moveTo(z.x - 4, y);
        for (let x = z.x - 4; x < z.x + z.w + 10; x += 16) c.quadraticCurveTo(x + 4, y - 8, x + 8, y), c.quadraticCurveTo(x + 12, y + 8, x + 16, y);
      }
      c.stroke();
      break;
    case 'zigzag':
      for (let y = z.y + 14; y < z.y + z.h; y += 26) {
        c.moveTo(z.x - 4, y);
        for (let x = z.x - 4, k = 0; x < z.x + z.w + 10; x += 12, k++) c.lineTo(x + 12, y + (k % 2 ? 0 : -10));
      }
      c.stroke();
      break;
  }
  c.restore();
}

// ---------- ikat kepala ----------
export function drawHeadband(c: Ctx, id: string) {
  const it = itemById(id);
  if (!it) return;
  c.save();
  maskPath(c);
  c.clip();
  rr(c, 30, 70, 340, 40, 10);
  paint(c, it.hex, 3);
  c.fillStyle = 'rgba(255,255,255,.25)';
  c.fillRect(40, 76, 320, 6);
  c.restore();
  // simpulan & ekor di sisi kanan (di luar siluet)
  ell(c, 348, 92, 14, 16, it.hex, 3);
  c.beginPath();
  c.moveTo(354, 98);
  c.quadraticCurveTo(388, 120, 378, 156);
  c.lineTo(364, 150);
  c.quadraticCurveTo(370, 124, 346, 106);
  paint(c, it.hex, 3);
  c.beginPath();
  c.moveTo(356, 90);
  c.quadraticCurveTo(394, 88, 396, 118);
  c.lineTo(382, 118);
  c.quadraticCurveTo(378, 100, 352, 100);
  paint(c, shade(it.hex, 0.85), 3);
  // plat logam kecil di tengah
  rr(c, 176, 76, 48, 28, 6);
  paint(c, '#d9dee8', 2.5);
  shuriken(c, 200, 90, 8, '#3d4c7a', 0);
}

export interface DrawOpts {
  /** kawasan yang dipilih (sempadan bercahaya) */
  selectedRegion?: string | null;
  /** lakaran berus yang sedang dilukis (belum masuk sejarah) */
  liveStroke?: Stroke | null;
  /** titik petunjuk yang berdenyut */
  hintAnchor?: string | null;
  time?: number;
}

/** Lukis keseluruhan topeng dalam ruang MASK (400 × 460). */
export function drawMask(c: Ctx, d: MaskDesign, opts: DrawOpts = {}) {
  c.save();
  c.lineJoin = 'round';
  // bayang
  ell(c, 206, 440, 120, 14, 'rgba(38,50,77,.18)', 0);
  // badan & kawasan warna
  maskPath(c);
  c.fillStyle = hexOf(d.regions.main ?? d.regions.upper);
  c.fill();
  if (d.templateId === 'twotone') {
    c.save();
    maskPath(c);
    c.clip();
    c.fillStyle = hexOf(d.regions.lower);
    c.fillRect(0, (EYE_BAND.top + EYE_BAND.bottom) / 2, MASK.w, MASK.h);
    // jahitan pemisah
    c.setLineDash([8, 6]);
    line(c, [40, (EYE_BAND.top + EYE_BAND.bottom) / 2, 360, (EYE_BAND.top + EYE_BAND.bottom) / 2], 'rgba(38,50,77,.4)', 2.5);
    c.setLineDash([]);
    c.restore();
  }
  // lakaran berus (dipotong ikut topeng & kawasan permulaan)
  const strokes = opts.liveStroke ? [...d.strokes, opts.liveStroke] : d.strokes;
  if (strokes.length) drawStrokes(c, d.templateId, strokes);
  // lipatan kain & kilauan
  c.save();
  maskPath(c);
  c.clip();
  c.strokeStyle = 'rgba(38,50,77,.12)';
  c.lineWidth = 3;
  c.beginPath();
  c.moveTo(118, 400);
  c.quadraticCurveTo(140, 330, 132, 268);
  c.moveTo(282, 400);
  c.quadraticCurveTo(260, 330, 268, 268);
  c.stroke();
  const g = c.createRadialGradient(140, 90, 10, 140, 90, 150);
  g.addColorStop(0, 'rgba(255,255,255,.35)');
  g.addColorStop(1, 'rgba(255,255,255,0)');
  c.fillStyle = g;
  c.fillRect(0, 0, MASK.w, MASK.h);
  c.restore();
  // corak sisi
  for (const a of ANCHORS) if (a.accepts === 'pattern' && d.items[a.id]) drawPattern(c, d.items[a.id], a.x);
  // garis luar
  maskPath(c);
  c.strokeStyle = O;
  c.lineWidth = 5;
  c.stroke();
  // sempadan kawasan terpilih
  if (opts.selectedRegion) {
    c.save();
    maskPath(c);
    c.clip();
    c.strokeStyle = 'rgba(255,210,77,.95)';
    c.lineWidth = 6;
    c.setLineDash([12, 8]);
    c.lineDashOffset = -(opts.time ?? 0) * 30;
    if (d.templateId === 'twotone') {
      const mid = (EYE_BAND.top + EYE_BAND.bottom) / 2;
      rr(c, 52, opts.selectedRegion === 'upper' ? 38 : mid + 4, 296, opts.selectedRegion === 'upper' ? mid - 42 : 436 - mid - 8, 30);
      c.stroke();
    } else {
      maskPath(c);
      c.lineWidth = 12;
      c.stroke();
    }
    c.restore();
  }
  // jalur mata (wajah kelihatan) — tidak boleh disunting
  rr(c, 72, EYE_BAND.top, 256, EYE_BAND.bottom - EYE_BAND.top, 30);
  paint(c, '#f6cfa8', 4);
  // kening & mata chibi
  for (const sx of [-1, 1]) {
    const ex = 200 + sx * 58;
    line(c, [ex - 24, EYE_BAND.top + 14 - (sx > 0 ? 2 : 0), ex + 22, EYE_BAND.top + 10], O, 6);
    ell(c, ex, EYE_BAND.top + 34, 20, 17, '#ffffff', 3);
    ell(c, ex + 2, EYE_BAND.top + 35, 11, 12, O, 0);
    ell(c, ex + 6, EYE_BAND.top + 30, 4, 4, '#ffffff', 0);
  }
  ell(c, 124, EYE_BAND.top + 48, 12, 6, 'rgba(240,141,176,.5)', 0);
  ell(c, 276, EYE_BAND.top + 48, 12, 6, 'rgba(240,141,176,.5)', 0);
  // pelekat
  for (const a of ANCHORS) if (a.accepts === 'symbol' && d.items[a.id]) drawSymbol(c, d.items[a.id], a.x, a.y, 54);
  // ikat kepala
  if (d.headband) drawHeadband(c, d.headband);
  // petunjuk: titik yang perlu diisi berdenyut
  if (opts.hintAnchor) {
    const a = ANCHORS.find((q) => q.id === opts.hintAnchor);
    if (a) {
      const p = 1 + Math.sin((opts.time ?? 0) * 6) * 0.12;
      c.strokeStyle = '#ffd24d';
      c.lineWidth = 5;
      c.setLineDash([8, 6]);
      c.beginPath();
      c.arc(a.x, a.y, 38 * p, 0, Math.PI * 2);
      c.stroke();
      c.setLineDash([]);
    }
  }
  c.restore();
}

function drawStrokes(c: Ctx, templateId: string, strokes: Stroke[]) {
  const mid = (EYE_BAND.top + EYE_BAND.bottom) / 2;
  for (const region of templateId === 'twotone' ? ['upper', 'lower'] : ['main']) {
    const list = strokes.filter((s) => s.r === region);
    if (!list.length) continue;
    c.save();
    maskPath(c);
    c.clip();
    if (region !== 'main') {
      c.beginPath();
      if (region === 'upper') c.rect(0, 0, MASK.w, mid);
      else c.rect(0, mid, MASK.w, MASK.h - mid);
      c.clip();
    }
    c.lineCap = 'round';
    c.lineJoin = 'round';
    for (const st of list) {
      c.strokeStyle = hexOf(st.c);
      c.lineWidth = st.w;
      c.beginPath();
      c.moveTo(st.p[0], st.p[1]);
      if (st.p.length === 2) c.lineTo(st.p[0] + 0.01, st.p[1]);
      for (let i = 2; i < st.p.length; i += 2) c.lineTo(st.p[i], st.p[i + 1]);
      c.stroke();
    }
    c.restore();
  }
}

/** Ikon item untuk butang alat (data URL, dicache). */
const iconCache = new Map<string, string>();
export function itemIcon(id: string, size = 96): string {
  const k = `${id}@${size}`;
  const hit = iconCache.get(k);
  if (hit) return hit;
  const cv = document.createElement('canvas');
  cv.width = cv.height = size;
  const c = cv.getContext('2d')!;
  const it = itemById(id);
  if (it?.kind === 'symbol') drawSymbol(c, id, size / 2, size / 2, size * 0.72);
  else if (it?.kind === 'pattern') {
    c.save();
    c.translate(size / 2, size / 2);
    c.scale(size / 110, size / 110);
    rr(c, -40, -40, 80, 80, 14);
    paint(c, '#5a6a8f', 3);
    c.clip();
    drawPatternRaw(c, id, { x: -40, y: -40, w: 80, h: 80 });
    c.restore();
  } else if (it?.kind === 'accessory') {
    c.save();
    c.translate(size / 2, size / 2);
    const s = size / 100;
    c.scale(s, s);
    rr(c, -42, -12, 70, 24, 8);
    paint(c, it.hex, 3);
    ell(c, 32, 0, 10, 11, it.hex, 3);
    c.beginPath();
    c.moveTo(36, 6);
    c.quadraticCurveTo(56, 22, 48, 40);
    c.lineTo(38, 36);
    c.quadraticCurveTo(42, 22, 30, 10);
    paint(c, it.hex, 3);
    rr(c, -16, -8, 22, 16, 4);
    paint(c, '#d9dee8', 2);
    c.restore();
  }
  const url = cv.toDataURL('image/png');
  iconCache.set(k, url);
  return url;
}

/** Lukis corak dalam zon tanpa klip siluet (untuk ikon). */
function drawPatternRaw(c: Ctx, id: string, z: { x: number; y: number; w: number; h: number }) {
  const it = itemById(id)!;
  c.strokeStyle = it.hex;
  c.fillStyle = it.hex;
  c.lineWidth = 6;
  c.lineCap = 'round';
  c.beginPath();
  if (it.family === 'stripes') for (let y = z.y - 40; y < z.y + z.h + 40; y += 22) (c.moveTo(z.x - 30, y + 20), c.lineTo(z.x + z.w + 30, y - 20));
  else if (it.family === 'dots') for (let y = z.y + 12; y < z.y + z.h; y += 24) for (let x = z.x - 12 + ((y / 24) % 2) * 12; x < z.x + z.w + 20; x += 24) (c.moveTo(x + 5, y), c.arc(x, y, 5, 0, Math.PI * 2));
  else if (it.family === 'waves')
    for (let y = z.y + 14; y < z.y + z.h; y += 24) {
      c.moveTo(z.x - 30, y);
      for (let x = z.x - 30; x < z.x + z.w + 30; x += 16) c.quadraticCurveTo(x + 4, y - 8, x + 8, y), c.quadraticCurveTo(x + 12, y + 8, x + 16, y);
    }
  else
    for (let y = z.y + 14; y < z.y + z.h; y += 26) {
      c.moveTo(z.x - 30, y);
      for (let x = z.x - 30, k = 0; x < z.x + z.w + 30; x += 12, k++) c.lineTo(x + 12, y + (k % 2 ? 0 : -10));
    }
  if (it.family === 'dots') c.fill();
  else c.stroke();
}

/** Pratonton kecil topeng (galeri). */
export function renderMaskThumb(d: MaskDesign, size: number): string {
  const cv = document.createElement('canvas');
  cv.width = size;
  cv.height = Math.round((size * MASK.h) / MASK.w);
  const c = cv.getContext('2d')!;
  c.scale(size / MASK.w, size / MASK.w);
  drawMask(c, d);
  return cv.toDataURL('image/png');
}
