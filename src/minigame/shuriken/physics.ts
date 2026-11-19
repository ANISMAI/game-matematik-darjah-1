// Fizik & membidik Shuriken Master (tulen: tiada DOM). Pratonton garisan dan balingan sebenar guna fungsi
// YANG SAMA (rayHit / targetPos) — garisan bidikan tidak pernah mengelirukan.
import type { ShurikenLevel, TargetDef } from './levels.ts';

/** Arena pseudo-3D (unit logik). Ninja di bawah, papan sasaran di depan. */
export const ARENA = { w: 480, h: 640, horizon: 196 };
/** Titik shuriken dilepaskan (tangan ninja). */
export const HAND = { x: 262, y: 536 };
/** Kelajuan shuriken (unit / saat). */
export const THROW_SPEED = 1100;
/** Bidikan mesti sekurang-kurangnya sejauh ini ke atas tangan (elak baling ke belakang / sisi). */
export const MIN_AIM_RISE = 40;

export interface Pt {
  x: number;
  y: number;
}

/** Kedudukan sasaran pada masa t (saat). Gelongsor mendatar = sinus perlahan (gerakan boleh diramal). */
export function targetPos(t: TargetDef, time: number): Pt {
  if (t.motion.type === 'slide') return { x: t.x + Math.sin(time * t.motion.speed + (t.motion.phase ?? 0)) * t.motion.amp, y: t.y };
  return { x: t.x, y: t.y };
}

/** Arah bidikan (vektor unit) dari tangan ke titik bidik. null = bidikan tidak sah (terlalu rendah). */
export function aimDir(aim: Pt): Pt | null {
  const dx = aim.x - HAND.x;
  const dy = aim.y - HAND.y;
  if (-dy < MIN_AIM_RISE) return null;
  const len = Math.hypot(dx, dy);
  return { x: dx / len, y: dy / len };
}

/** Skala kedalaman: shuriken mengecil bila menjauh (ke atas skrin). */
export function depthScale(y: number): number {
  return Math.max(0.42, Math.min(1, (y - 150) / (HAND.y - 150)));
}

export interface RayHit {
  /** Jarak di sepanjang sinar ke titik kena (unit arena). */
  dist: number;
  point: Pt;
  target: TargetDef | null;
  /** Sejauh mana dari pusat papan (0 = tepat di tengah, 1 = tepi jejari asal). */
  centre: number;
}

/**
 * Titik mendarat = TITIK YANG DIBIDIK (shuriken dibaling melengkung ke arah papan, jadi pemain boleh memilih
 * di mana ia melekat — bidik ke tengah untuk mata lebih). Papan yang bergerak diramal pada masa shuriken tiba.
 * - Titik di dalam papan → kena tepat di situ.
 * - Titik dalam jalur bantuan bidik (r … r + assist) → kena di tepi papan (ditarik ke dalam).
 * - Jika beberapa papan bertindih di titik itu, papan paling hadapan (y terbesar) dikena.
 * - Tiada papan → tersasar (shuriken terbang ke titik itu).
 */
export function rayHit(aim: Pt, targets: TargetDef[], alive: (id: string) => boolean, time: number, assist: number): RayHit {
  const dist = Math.hypot(aim.x - HAND.x, aim.y - HAND.y);
  const arrive = time + dist / THROW_SPEED;
  let best: { t: TargetDef; p: Pt; d: number } | null = null;
  for (const t of targets) {
    if (!alive(t.id)) continue;
    const p = targetPos(t, arrive);
    const d = Math.hypot(aim.x - p.x, aim.y - p.y);
    if (d > t.r + assist) continue;
    // keutamaan: papan yang benar-benar mengandungi titik; kemudian papan paling hadapan
    const inside = d <= t.r;
    const bInside = best ? best.d <= best.t.r : false;
    if (!best || (inside && !bInside) || (inside === bInside && p.y > best.p.y)) best = { t, p, d };
  }
  if (!best) return { dist, point: { ...aim }, target: null, centre: 1 };
  if (best.d <= best.t.r) return { dist, point: { ...aim }, target: best.t, centre: best.d / best.t.r };
  // jalur bantuan bidik: tarik ke tepi papan
  const k = (best.t.r * 0.9) / best.d;
  const point = { x: best.p.x + (aim.x - best.p.x) * k, y: best.p.y + (aim.y - best.p.y) * k };
  return { dist: Math.hypot(point.x - HAND.x, point.y - HAND.y), point, target: best.t, centre: 0.9 };
}

/** Ketepatan (%) dibundarkan; 0 balingan → 0 (tiada bahagi sifar). */
export function accuracy(hits: number, throws: number): number {
  return throws > 0 ? Math.round((hits / throws) * 100) : 0;
}

/**
 * Bintang (deterministik): 3★ = ketepatan ≥ three & tiada petunjuk; 2★ = ketepatan ≥ two, ATAU ≥ three dengan
 * satu petunjuk; 1★ = objektif selesai. Tahap yang selesai sentiasa dapat sekurang-kurangnya 1★.
 */
export function shurikenStars(level: Pick<ShurikenLevel, 'stars'>, acc: number, hintsUsed: number): 1 | 2 | 3 {
  if (acc >= level.stars.three && hintsUsed === 0) return 3;
  if (acc >= level.stars.two || (acc >= level.stars.three && hintsUsed <= 1)) return 2;
  return 1;
}

/** Tukar koordinat penunjuk (clientX/Y) → unit arena, dengan kotak paparan kanvas (letterbox diambil kira). */
export function toArena(clientX: number, clientY: number, box: { left: number; top: number; width: number; height: number }): Pt {
  const k = Math.min(box.width / ARENA.w, box.height / ARENA.h);
  const ox = box.left + (box.width - ARENA.w * k) / 2;
  const oy = box.top + (box.height - ARENA.h * k) / 2;
  return { x: (clientX - ox) / k, y: (clientY - oy) / k };
}
