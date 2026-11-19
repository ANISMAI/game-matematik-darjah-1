// Logik tulen Latihan Mata Ninja (tiada DOM / React): penukaran koordinat, ujian ketikan, bintang, susun atur.
import type { Hotspot, SpotDifference, SpotLevel } from './levels.ts';

export interface Pt {
  x: number;
  y: number;
}

/**
 * Tukar koordinat penunjuk (clientX/Y) kepada koordinat imej ternormal 0–1.
 * Mengambil kira letterbox bila imej dipapar dengan object-fit: contain dalam kotak yang nisbahnya berbeza.
 * Pulangkan null jika ketikan jatuh pada jidar/letterbox (di luar imej).
 */
export function toNormalized(clientX: number, clientY: number, box: { left: number; top: number; width: number; height: number }, imgW: number, imgH: number): Pt | null {
  const scale = Math.min(box.width / imgW, box.height / imgH);
  const dw = imgW * scale;
  const dh = imgH * scale;
  const ox = box.left + (box.width - dw) / 2;
  const oy = box.top + (box.height - dh) / 2;
  const x = (clientX - ox) / dw;
  const y = (clientY - oy) / dh;
  if (x < 0 || y < 0 || x > 1 || y > 1) return null;
  return { x, y };
}

/**
 * Jarak (dalam unit LEBAR imej) dari titik ke tepi bentuk. Negatif/0 = di dalam.
 * aspect = tinggi/lebar imej (supaya bulatan kekal bulat).
 */
export function distanceTo(shape: Hotspot, p: Pt, aspect: number): number {
  if (shape.type === 'circle') return Math.hypot(p.x - shape.cx, (p.y - shape.cy) * aspect) - shape.r;
  if (shape.type === 'rect') {
    const dx = Math.max(shape.x - p.x, 0, p.x - (shape.x + shape.w));
    const dy = Math.max(shape.y - p.y, 0, p.y - (shape.y + shape.h)) * aspect;
    const outside = Math.hypot(dx, dy);
    if (outside > 0) return outside;
    // di dalam: jarak negatif ke tepi terdekat
    return -Math.min(p.x - shape.x, shape.x + shape.w - p.x, (p.y - shape.y) * aspect, (shape.y + shape.h - p.y) * aspect);
  }
  // poligon: dalam = negatif
  const pts = shape.points;
  let inside = false;
  let best = Infinity;
  for (let i = 0, j = pts.length - 1; i < pts.length; j = i++) {
    const [xi, yi] = pts[i];
    const [xj, yj] = pts[j];
    if (yi > p.y !== yj > p.y && p.x < ((xj - xi) * (p.y - yi)) / (yj - yi) + xi) inside = !inside;
    // jarak ke segmen (ruang beraspek)
    const ax = xi, ay = yi * aspect, bx = xj, by = yj * aspect, px = p.x, py = p.y * aspect;
    const t = Math.max(0, Math.min(1, ((px - ax) * (bx - ax) + (py - ay) * (by - ay)) / ((bx - ax) ** 2 + (by - ay) ** 2 || 1)));
    best = Math.min(best, Math.hypot(px - (ax + t * (bx - ax)), py - (ay + t * (by - ay))));
  }
  return inside ? -best : best;
}

export type TapResult = { kind: 'hit'; id: string } | { kind: 'already'; id: string } | { kind: 'miss' };

/**
 * Ujian ketikan. tolerance = kelonggaran sentuhan (unit lebar imej) supaya jari kanak-kanak tidak perlu tepat.
 * - Kawasan yang sudah ditemui tidak dikira lagi ('already' — tiada maklum balas salah).
 * - Jika beberapa kawasan belum ditemui berada dalam jarak, pilih yang PALING DALAM (paling hampir ke pusat),
 *   supaya kawasan bertindih tidak tercetus secara tidak sengaja.
 */
export function hitTest(p: Pt, diffs: SpotDifference[], found: ReadonlySet<string>, aspect: number, tolerance: number): TapResult {
  let best: { id: string; d: number } | null = null;
  let already: string | null = null;
  for (const df of diffs) {
    const d = distanceTo(df.shape, p, aspect);
    if (found.has(df.id)) {
      if (d <= 0) already = df.id;
      continue;
    }
    if (d <= tolerance && (!best || d < best.d)) best = { id: df.id, d };
  }
  if (best && !(already && best.d > 0)) return { kind: 'hit', id: best.id };
  if (already) return { kind: 'already', id: already };
  return { kind: 'miss' };
}

/** Bintang: 3 = tanpa petunjuk & sedikit salah; 2 = lebih banyak cubaan atau guna petunjuk; 1 = selesai. */
export function computeStars(level: Pick<SpotLevel, 'starRules'>, wrong: number, hintsUsed: number): 1 | 2 | 3 {
  const { three, two } = level.starRules;
  if (hintsUsed === 0 && wrong <= three) return 3;
  if (wrong <= two) return 2;
  return 1;
}

/** Pusat & jejari (unit ternormal, mengikut lebar) untuk melukis penanda bulat di sekeliling kawasan. */
export function markerOf(shape: Hotspot, aspect: number): { cx: number; cy: number; r: number } {
  if (shape.type === 'circle') return { cx: shape.cx, cy: shape.cy, r: shape.r };
  if (shape.type === 'rect') return { cx: shape.x + shape.w / 2, cy: shape.y + shape.h / 2, r: (Math.max(shape.w, shape.h * aspect) / 2) * 0.95 };
  const xs = shape.points.map((q) => q[0]);
  const ys = shape.points.map((q) => q[1]);
  const x0 = Math.min(...xs), x1 = Math.max(...xs), y0 = Math.min(...ys), y1 = Math.max(...ys);
  return { cx: (x0 + x1) / 2, cy: (y0 + y1) / 2, r: (Math.max(x1 - x0, (y1 - y0) * aspect) / 2) * 0.95 };
}

/**
 * Pilih susun atur: sebelah-menyebelah atau bertindan, yang memberi imej paling besar.
 * Pulangkan lebar & tinggi setiap imej (px CSS).
 */
export function chooseLayout(availW: number, availH: number, imgAspect: number, gap: number): { stacked: boolean; w: number; h: number } {
  const side = Math.min((availW - gap) / 2, availH / imgAspect);
  const stack = Math.min(availW, (availH - gap) / 2 / imgAspect);
  const stacked = stack > side * 1.08; // utamakan sebelah-menyebelah bila hampir sama
  const w = Math.max(80, Math.floor(stacked ? stack : side));
  return { stacked, w, h: Math.floor(w * imgAspect) };
}

/** Kawasan petunjuk: bulatan lebih besar, pusat dianjak sedikit — menunjuk KAWASAN, bukan jawapan tepat. */
export function hintArea(shape: Hotspot, aspect: number, seed: number): { cx: number; cy: number; r: number } {
  const m = markerOf(shape, aspect);
  const a = seed * Math.PI * 2;
  const off = m.r * 0.45;
  return { cx: m.cx + Math.cos(a) * off, cy: m.cy + (Math.sin(a) * off) / aspect, r: m.r * 2.1 };
}
