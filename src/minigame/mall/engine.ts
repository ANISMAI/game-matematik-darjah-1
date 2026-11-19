// Logik tulen Mini Game Mall (tiada DOM): dinding, perlanggaran, interaksi, kamera.
import { MALL, SHOPS, MALL_PROPS, TALK_NPCS, TALK_RADIUS } from './config.ts';
import type { Rect, Point, PropDef, ShopDef, Facing } from './config.ts';

export interface WallPiece extends Rect {
  kind: 'thin' | 'back' | 'glass';
  accent?: string; // warna jalur dinding belakang
  band?: string;
}

const WT = MALL.wall;
const BACK = MALL.backWall;

/** Pisahkan segi empat di sepanjang paksi untuk buat celah pintu. */
function splitWithGap(r: Rect, axis: 'x' | 'y', gapStart: number, gapEnd: number): Rect[] {
  const out: Rect[] = [];
  if (axis === 'y') {
    if (gapStart > r.y) out.push({ x: r.x, y: r.y, w: r.w, h: gapStart - r.y });
    if (gapEnd < r.y + r.h) out.push({ x: r.x, y: gapEnd, w: r.w, h: r.y + r.h - gapEnd });
  } else {
    if (gapStart > r.x) out.push({ x: r.x, y: r.y, w: gapStart - r.x, h: r.h });
    if (gapEnd < r.x + r.w) out.push({ x: gapEnd, y: r.y, w: r.x + r.w - gapEnd, h: r.h });
  }
  return out;
}

export function shopInterior(shop: ShopDef): Rect {
  const b = shop.bounds;
  return { x: b.x + WT, y: b.y + BACK, w: b.w - WT * 2, h: b.h - BACK - WT };
}

/** Titik tengah pintu (di garisan dinding) + arah ke dalam kedai. */
export function shopEntrance(shop: ShopDef): Point & { inward: Point; gap: Rect } {
  const b = shop.bounds;
  const { side, offset, size } = shop.door;
  if (side === 'left') return { x: b.x + WT / 2, y: b.y + offset + size / 2, inward: { x: 1, y: 0 }, gap: { x: b.x, y: b.y + offset, w: WT, h: size } };
  if (side === 'right') return { x: b.x + b.w - WT / 2, y: b.y + offset + size / 2, inward: { x: -1, y: 0 }, gap: { x: b.x + b.w - WT, y: b.y + offset, w: WT, h: size } };
  return { x: b.x + offset + size / 2, y: b.y + b.h - WT / 2, inward: { x: 0, y: -1 }, gap: { x: b.x + offset, y: b.y + b.h - WT, w: size, h: WT } };
}

export function shopWalls(shop: ShopDef): WallPiece[] {
  const b = shop.bounds;
  const { side, offset, size } = shop.door;
  const pieces: WallPiece[] = [{ x: b.x, y: b.y, w: b.w, h: BACK, kind: 'back', accent: shop.theme.accent, band: shop.theme.band }];
  const sides: Record<string, Rect> = {
    left: { x: b.x, y: b.y + BACK, w: WT, h: b.h - BACK },
    right: { x: b.x + b.w - WT, y: b.y + BACK, w: WT, h: b.h - BACK },
    bottom: { x: b.x, y: b.y + b.h - WT, w: b.w, h: WT },
  };
  for (const [name, r] of Object.entries(sides)) {
    if (name !== side) pieces.push({ ...r, kind: 'thin' });
    else if (side === 'bottom') splitWithGap(r, 'x', b.x + offset, b.x + offset + size).forEach((p) => pieces.push({ ...p, kind: 'thin' }));
    else splitWithGap(r, 'y', b.y + offset, b.y + offset + size).forEach((p) => pieces.push({ ...p, kind: 'thin' }));
  }
  return pieces;
}

export function buildingWalls(): WallPiece[] {
  const B = MALL.building;
  const e = MALL.entrance;
  const bottom: Rect = { x: B.x, y: B.y + B.h - WT, w: B.w, h: WT };
  const lobbyBackY = MALL.lobby.top;
  const cx = MALL.corridor.x;
  const cw = MALL.corridor.w;
  return [
    { x: B.x, y: B.y, w: B.w, h: BACK, kind: 'back', accent: '#d9443a', band: '#f7c948' },
    { x: B.x, y: B.y, w: WT, h: B.h, kind: 'thin' },
    { x: B.x + B.w - WT, y: B.y, w: WT, h: B.h, kind: 'thin' },
    ...splitWithGap(bottom, 'x', e.x, e.x + e.w).map((r) => ({ ...r, kind: 'thin' as const })),
    { x: e.x, y: B.y + B.h - WT - 4, w: e.w, h: WT + 4, kind: 'glass' },
    // muka dinding belakang lobi (kiri & kanan mulut koridor)
    { x: B.x + WT, y: lobbyBackY, w: cx - B.x - WT, h: BACK, kind: 'back', accent: '#d9443a', band: '#f7c948' },
    { x: cx + cw, y: lobbyBackY, w: B.x + B.w - WT - (cx + cw), h: BACK, kind: 'back', accent: '#d9443a', band: '#f7c948' },
  ];
}

/** Semua props dalam koordinat mutlak (props kedai ditukar daripada relatif). */
export function allProps(): (PropDef & { shopId?: string })[] {
  const list: (PropDef & { shopId?: string })[] = [];
  for (const shop of SHOPS) {
    for (const p of shop.props) list.push({ ...p, x: p.x + shop.bounds.x, y: p.y + shop.bounds.y, shopId: shop.id });
  }
  for (const p of MALL_PROPS) list.push({ ...p });
  return list;
}

export const FLAT_PROPS = new Set(['rug']);

export function buildColliders(): Rect[] {
  const rects: Rect[] = [];
  const W = MALL.world;
  const B = MALL.building;
  for (const w of buildingWalls()) rects.push({ x: w.x, y: w.y, w: w.w, h: w.h });
  for (const shop of SHOPS) for (const w of shopWalls(shop)) rects.push({ x: w.x, y: w.y, w: w.w, h: w.h });
  for (const p of allProps()) if (p.solid) rects.push({ x: p.x, y: p.y, w: p.w, h: p.h });
  // NPC interaktif berdiri — pemain tidak boleh berjalan menembusi mereka
  for (const n of TALK_NPCS) rects.push({ x: n.path[0].x - 13, y: n.path[0].y - 12, w: 26, h: 14 });
  // Sempadan dunia (luar bangunan tidak boleh dilalui).
  rects.push({ x: 0, y: 0, w: W.w, h: B.y }, { x: 0, y: B.y + B.h, w: W.w, h: W.h - B.y - B.h });
  rects.push({ x: 0, y: 0, w: B.x, h: W.h }, { x: B.x + B.w, y: 0, w: W.w - B.x - B.w, h: W.h });
  return rects;
}

// ---------- Pergerakan ----------
export const PLAYER_BOX = { w: 22, h: 12 }; // tapak kaki

export function playerBox(x: number, y: number): Rect {
  return { x: x - PLAYER_BOX.w / 2, y: y - PLAYER_BOX.h + 2, w: PLAYER_BOX.w, h: PLAYER_BOX.h };
}

function overlaps(a: Rect, b: Rect) {
  return a.x < b.x + b.w && a.x + a.w > b.x && a.y < b.y + b.h && a.y + a.h > b.y;
}

export function blocked(x: number, y: number, colliders: Rect[]) {
  const box = playerBox(x, y);
  for (const c of colliders) if (overlaps(box, c)) return true;
  return false;
}

/**
 * Gerak dengan perlanggaran paksi-berasingan (meluncur di sepanjang dinding)
 * + bantuan bucu supaya pemain tidak tersangkut pada hujung dinding/perabot.
 */
export function moveWithCollision(p: Point, dx: number, dy: number, colliders: Rect[]): Point {
  const steps = Math.max(1, Math.ceil(Math.max(Math.abs(dx), Math.abs(dy)) / 3));
  const sx = dx / steps;
  const sy = dy / steps;
  let x = p.x;
  let y = p.y;
  for (let i = 0; i < steps; i++) {
    if (sx) {
      if (!blocked(x + sx, y, colliders)) x += sx;
      else if (!sy) y = cornerNudge(x, y, sx, 'x', colliders);
    }
    if (sy) {
      if (!blocked(x, y + sy, colliders)) y += sy;
      else if (!sx) x = cornerNudge(x, y, sy, 'y', colliders);
    }
  }
  return { x, y };
}

const NUDGE_RANGE = 10;
function cornerNudge(x: number, y: number, step: number, axis: 'x' | 'y', colliders: Rect[]): number {
  const amount = Math.abs(step);
  for (let d = 2; d <= NUDGE_RANGE; d += 2) {
    for (const s of [-1, 1]) {
      const free = axis === 'x' ? !blocked(x + step, y + s * d, colliders) : !blocked(x + s * d, y + step, colliders);
      if (!free) continue;
      if (axis === 'x') return blocked(x, y + s * amount, colliders) ? y : y + s * amount;
      return blocked(x + s * amount, y, colliders) ? x : x + s * amount;
    }
  }
  return axis === 'x' ? y : x;
}

/** Gabung input papan kekunci + joystick kepada vektor arah (panjang 0 atau 1). */
export function inputVector(keys: { up: boolean; down: boolean; left: boolean; right: boolean }, joy: Point): Point {
  let x = (keys.right ? 1 : 0) - (keys.left ? 1 : 0) + joy.x;
  let y = (keys.down ? 1 : 0) - (keys.up ? 1 : 0) + joy.y;
  const len = Math.hypot(x, y);
  if (len < 0.2) return { x: 0, y: 0 };
  return { x: x / len, y: y / len }; // dinormalkan: pepenjuru tidak lebih laju
}

export function facingFrom(v: Point, prev: Facing): Facing {
  if (!v.x && !v.y) return prev;
  if (Math.abs(v.x) > Math.abs(v.y) + 0.05) return v.x > 0 ? 'right' : 'left';
  return v.y > 0 ? 'down' : 'up';
}

// ---------- Interaksi ----------
export interface Interactable {
  key: string; // unik
  kind: 'npc' | 'exit' | 'enter';
  refId: string;
  x: number;
  y: number;
  r: number;
}

export function buildInteractables(): Interactable[] {
  const list: Interactable[] = [];
  // Fasa 2: semua interaksi dalam akademi melalui NPC (guru dojo, penjaga kaunter & gerai).
  for (const n of TALK_NPCS) {
    const at = n.talk!.spot ?? n.path[0];
    list.push({ key: `npc:${n.id}`, kind: 'npc', refId: n.id, x: at.x, y: at.y, r: n.talk!.radius ?? TALK_RADIUS });
  }
  list.push({ key: 'exit', kind: 'exit', refId: 'exit', x: MALL.exitZone.x, y: MALL.exitZone.y, r: MALL.exitZone.radius });
  return list;
}

/** Hanya SATU interaksi aktif: yang paling dekat dalam jejari. */
export function nearestInteractable(x: number, y: number, list: Interactable[]): Interactable | null {
  let best: Interactable | null = null;
  let bestD = Infinity;
  for (const it of list) {
    const d = Math.hypot(it.x - x, it.y - y);
    if (d <= it.r && d < bestD) {
      best = it;
      bestD = d;
    }
  }
  return best;
}

// ---------- Kamera ----------
/** Zum supaya kanak-kanak nampak persekitaran; tidak sekali-kali tunjuk ruang kosong di luar peta. */
export function computeZoom(vw: number, vh: number): number {
  // Telefon (sisi pendek < 600px): zum ikut sisi pendek supaya watak & props cukup besar untuk jari kanak-kanak
  // (~360 unit dunia merentasi sisi pendek). Desktop/tablet kekal ikut keluasan skrin.
  const short = Math.min(vw, vh);
  const phone = short < 600 ? short / 360 : 0;
  const base = Math.min(1.6, Math.max(0.6, Math.sqrt(vw * vh) / 760, phone));
  return Math.max(base, vw / MALL.world.w, vh / MALL.world.h);
}

export function clampCamera(cx: number, cy: number, viewW: number, viewH: number): Point {
  const W = MALL.world;
  return {
    x: viewW >= W.w ? (W.w - viewW) / 2 : Math.min(Math.max(cx, 0), W.w - viewW),
    y: viewH >= W.h ? (W.h - viewH) / 2 : Math.min(Math.max(cy, 0), W.h - viewH),
  };
}
