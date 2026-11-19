// Sprite sheet watak (4 baris × 3 kolum) untuk Mini Game Mall.
// Baris: 0 depan · 1 kiri · 2 kanan · 3 belakang. Kolum: 0 berdiri · 1 & 2 langkah berjalan.
// Setiap petak dikesan automatik (kotak sempadan piksel legap) supaya kaki sejajar & saiz konsisten
// walaupun imej janaan AI tidak tersusun tepat pada grid.
import type { Facing } from './config.ts';

export interface SheetDef {
  src: string;
  /** Tinggi watak (unit dunia) bagi bingkai berdiri menghadap depan. */
  height: number;
  /** Tukar warna pakaian (contoh: gi hijau → ungu) supaya satu sprite boleh jadi beberapa watak. */
  recolor?: Recolor[];
}

/**
 * Peraturan tukar warna mengikut julat hue (darjah). Piksel kulit (hue ~15–40, tepu rendah) tidak terjejas
 * selagi julat tidak merangkuminya. Garis luar gelap dilindungi oleh minLight.
 */
export interface Recolor {
  from: [number, number];
  /** hue baharu (darjah) */
  to: number;
  minSat?: number;
  minLight?: number;
  /** abaikan piksel lebih cerah (contoh: pemerah pipi merah jambu) */
  maxLight?: number;
  /** darab ketepuan / kecerahan */
  sat?: number;
  light?: number;
}

interface Frame {
  cv: HTMLCanvasElement | null; // null = petak kosong
  w: number; // unit dunia
  h: number;
  ax: number; // jarak dari tepi kiri ke titik tengah kaki (unit dunia)
}

export interface Sheet {
  ready: boolean;
  failed: boolean;
  frames: Frame[][]; // [baris][kolum]
}

const ROWS = 4;
const COLS = 3;
const RENDER_RES = 3; // bingkai disimpan pada 3× saiz dunia supaya tajam bila dizum / skrin retina
const ROW_OF: Record<Facing, number> = { down: 0, left: 1, right: 2, up: 3 };
const WALK_SEQ = [1, 0, 2, 0];

const cache = new Map<string, Sheet>();

export function loadSheet(def: SheetDef): Sheet {
  const key = `${def.src}@${def.height}${def.recolor ? JSON.stringify(def.recolor) : ''}`;
  const hit = cache.get(key);
  if (hit) return hit;
  const sheet: Sheet = { ready: false, failed: false, frames: [] };
  cache.set(key, sheet);
  const img = new Image();
  img.decoding = 'async';
  img.src = def.src;
  img
    .decode()
    .then(() => {
      sheet.frames = sliceSheet(img, def.height, def.recolor);
      sheet.ready = true;
    })
    .catch(() => {
      sheet.failed = true; // render.ts akan guna watak prosedural sebagai ganti
    });
  return sheet;
}

function sliceSheet(img: HTMLImageElement, targetH: number, recolor?: Recolor[]): Frame[][] {
  const W = img.naturalWidth;
  const H = img.naturalHeight;
  const src = document.createElement('canvas');
  src.width = W;
  src.height = H;
  const sc = src.getContext('2d', { willReadFrequently: true })!;
  sc.drawImage(img, 0, 0);
  const imgData = sc.getImageData(0, 0, W, H);
  const data = imgData.data;
  if (recolor?.length) {
    applyRecolor(data, recolor);
    sc.putImageData(imgData, 0, 0);
  }
  const cw = W / COLS;
  const ch = H / ROWS;

  type Box = { x0: number; y0: number; x1: number; y1: number; footX: number } | null;
  const boxes: Box[][] = [];
  for (let r = 0; r < ROWS; r++) {
    boxes.push([]);
    for (let c = 0; c < COLS; c++) {
      const cx0 = Math.floor(c * cw) + 2;
      const cy0 = Math.floor(r * ch) + 2;
      const cx1 = Math.floor((c + 1) * cw) - 2;
      const cy1 = Math.floor((r + 1) * ch) - 2;
      let x0 = Infinity;
      let y0 = Infinity;
      let x1 = -1;
      let y1 = -1;
      for (let y = cy0; y < cy1; y++) {
        for (let x = cx0; x < cx1; x++) {
          if (data[(y * W + x) * 4 + 3] > 40) {
            if (x < x0) x0 = x;
            if (x > x1) x1 = x;
            if (y < y0) y0 = y;
            if (y > y1) y1 = y;
          }
        }
      }
      if (x1 < 0) {
        boxes[r].push(null);
        continue;
      }
      // titik tengah kaki = purata x piksel legap di 18% bawah (abaikan reben yang berkibar ke tepi)
      const fy0 = Math.floor(y1 - (y1 - y0) * 0.18);
      let sum = 0;
      let n = 0;
      for (let y = fy0; y <= y1; y++) for (let x = x0; x <= x1; x++) if (data[(y * W + x) * 4 + 3] > 40) (sum += x, n++);
      boxes[r].push({ x0, y0, x1, y1, footX: n ? sum / n : (x0 + x1) / 2 });
    }
  }

  const ref = boxes[0][0] || boxes.flat().find(Boolean);
  const scale = ref ? targetH / (ref.y1 - ref.y0 + 1) : 1;
  return boxes.map((row) =>
    row.map((b) => {
      if (!b) return { cv: null, w: 0, h: 0, ax: 0 };
      const bw = b.x1 - b.x0 + 1;
      const bh = b.y1 - b.y0 + 1;
      return { cv: downscale(src, b.x0, b.y0, bw, bh, Math.max(1, Math.round(bw * scale * RENDER_RES)), Math.max(1, Math.round(bh * scale * RENDER_RES))), w: bw * scale, h: bh * scale, ax: (b.footX - b.x0) * scale };
    }),
  );
}

function applyRecolor(d: Uint8ClampedArray, rules: Recolor[]) {
  for (let i = 0; i < d.length; i += 4) {
    if (d[i + 3] < 10) continue;
    const r = d[i] / 255;
    const g = d[i + 1] / 255;
    const b = d[i + 2] / 255;
    const mx = Math.max(r, g, b);
    const mn = Math.min(r, g, b);
    const l = (mx + mn) / 2;
    const dl = mx - mn;
    if (dl < 1e-3) continue;
    const s = l > 0.5 ? dl / (2 - mx - mn) : dl / (mx + mn);
    let h = mx === r ? (g - b) / dl + (g < b ? 6 : 0) : mx === g ? (b - r) / dl + 2 : (r - g) / dl + 4;
    h *= 60;
    for (const rule of rules) {
      const [h0, h1] = rule.from;
      const inRange = h0 <= h1 ? h >= h0 && h <= h1 : h >= h0 || h <= h1;
      if (!inRange || s < (rule.minSat ?? 0.15) || l < (rule.minLight ?? 0.1) || l > (rule.maxLight ?? 1)) continue;
      const [nr, ng, nb] = hsl2rgb(rule.to / 360, Math.min(1, s * (rule.sat ?? 1)), Math.min(1, l * (rule.light ?? 1)));
      d[i] = nr;
      d[i + 1] = ng;
      d[i + 2] = nb;
      break;
    }
  }
}

function hsl2rgb(h: number, s: number, l: number): [number, number, number] {
  const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
  const p = 2 * l - q;
  const f = (t: number) => {
    if (t < 0) t += 1;
    if (t > 1) t -= 1;
    if (t < 1 / 6) return p + (q - p) * 6 * t;
    if (t < 1 / 2) return q;
    if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
    return p;
  };
  return [Math.round(f(h + 1 / 3) * 255), Math.round(f(h) * 255), Math.round(f(h - 1 / 3) * 255)];
}

/** Bingkai berdiri menghadap depan (untuk potret dialog). */
export function idleFrame(sheet: Sheet): { cv: HTMLCanvasElement; w: number; h: number } | null {
  const f = sheet.ready ? sheet.frames[0]?.[0] : null;
  return f?.cv ? { cv: f.cv, w: f.w, h: f.h } : null;
}

/** Kecilkan berperingkat (separuh demi separuh) supaya garisan tebal kekal licin. */
function downscale(src: HTMLCanvasElement, sx: number, sy: number, sw: number, sh: number, tw: number, th: number): HTMLCanvasElement {
  let cur = document.createElement('canvas');
  cur.width = sw;
  cur.height = sh;
  cur.getContext('2d')!.drawImage(src, sx, sy, sw, sh, 0, 0, sw, sh);
  while (cur.width / 2 > tw && cur.height / 2 > th) {
    const next = document.createElement('canvas');
    next.width = Math.ceil(cur.width / 2);
    next.height = Math.ceil(cur.height / 2);
    const nc = next.getContext('2d')!;
    nc.imageSmoothingQuality = 'high';
    nc.drawImage(cur, 0, 0, next.width, next.height);
    cur = next;
  }
  const out = document.createElement('canvas');
  out.width = tw;
  out.height = th;
  const oc = out.getContext('2d')!;
  oc.imageSmoothingQuality = 'high';
  oc.drawImage(cur, 0, 0, tw, th);
  return out;
}

/** Lukis watak dari sprite sheet dengan kaki pada (x, y). Pulangkan false jika belum sedia. */
export function drawSprite(c: CanvasRenderingContext2D, sheet: Sheet, x: number, y: number, facing: Facing, walk: number | null): boolean {
  const col = walk === null ? 0 : WALK_SEQ[Math.floor(walk / (Math.PI / 2)) % 4];
  return drawFrame(c, sheet, x, y, facing, col);
}

/** Langkah animasi aksi: [kolum, tempoh dalam saat]. */
export type ActionStep = [number, number];

/** Rentak latihan tumbuk: kuda-kuda → tumbuk → tarik → tumbuk → tarik → rehat. */
export const PUNCH_SEQ: ActionStep[] = [
  [0, 0.3],
  [1, 0.09],
  [2, 0.07],
  [0, 0.12],
  [1, 0.09],
  [2, 0.07],
  [0, 0.12],
  [1, 0.09],
  [2, 0.1],
  [0, 0.5],
];

/** Mainkan animasi aksi berulang (contoh: tumbuk) berdasarkan masa. */
export function drawAction(c: CanvasRenderingContext2D, sheet: Sheet, x: number, y: number, facing: Facing, time: number, seq: ActionStep[] = PUNCH_SEQ): boolean {
  const total = seq.reduce((s, [, d]) => s + d, 0);
  let tt = ((time % total) + total) % total;
  let col = seq[0][0];
  for (const [cIdx, d] of seq) {
    if (tt < d) {
      col = cIdx;
      break;
    }
    tt -= d;
  }
  return drawFrame(c, sheet, x, y, facing, col);
}

function drawFrame(c: CanvasRenderingContext2D, sheet: Sheet, x: number, y: number, facing: Facing, col: number): boolean {
  if (!sheet.ready) return false;
  let f = sheet.frames[ROW_OF[facing]]?.[col];
  if (!f?.cv) f = sheet.frames[ROW_OF[facing]]?.[0];
  if (!f?.cv) return false;
  c.fillStyle = 'rgba(38,50,77,.18)';
  c.beginPath();
  c.ellipse(x, y - 1, Math.max(13, f.w * 0.26), 5.5, 0, 0, Math.PI * 2);
  c.fill();
  c.imageSmoothingEnabled = true;
  c.drawImage(f.cv, x - f.ax, y - f.h, f.w, f.h);
  return true;
}
