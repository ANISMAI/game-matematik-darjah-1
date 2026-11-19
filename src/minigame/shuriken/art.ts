// Seni Shuriken Master — dilukis dengan kod dalam gaya Akademi Ninja (garis navy tebal, warna lembut).
// Hanya papan latihan kayu dikena — tiada orang / haiwan.
import { N, box, ell, rr, paint, line, shuriken, bambooClump, drawProp } from '../mall/render.ts';
import type { TargetDef } from './levels.ts';
import { ARENA, HAND, depthScale } from './physics.ts';
import type { Pt, RayHit } from './physics.ts';

type Ctx = CanvasRenderingContext2D;
const O = '#26324d';
/** Titik lenyap lantai (perspektif). */
const VP = { x: ARENA.w / 2, y: -260 };
/** Garisan baling di lantai. */
export const THROW_LINE_Y = 482;

// ---------- latar arena (statik, disimpan dalam kanvas) ----------
/**
 * Lukis latar dalam koordinat ruang main (0…ARENA.w), dipanjangkan `extra` unit ke kiri & kanan supaya arena
 * memenuhi skrin lebar. Kawasan main (papan & ninja) kekal 480 unit di tengah — kesukaran sama di semua skrin.
 */
export function drawArenaBackground(c: Ctx, extra = 0) {
  const { h, horizon } = ARENA;
  const x0 = -extra;
  const x1 = ARENA.w + extra;
  const w = x1 - x0;
  const inRange = (x: number, pad: number) => x >= x0 + pad && x <= x1 - pad;
  // dinding shoji
  c.fillStyle = '#fffaf0';
  c.fillRect(x0, 0, w, horizon);
  c.strokeStyle = 'rgba(154,99,50,.4)';
  c.lineWidth = 1.5;
  c.beginPath();
  for (let x = 16 - Math.ceil(extra / 22) * 22; x < x1; x += 22) (c.moveTo(x, 24), c.lineTo(x, horizon - 14));
  for (let y = 40; y < horizon - 14; y += 22) (c.moveTo(x0, y), c.lineTo(x1, y));
  c.stroke();
  for (let x = -Math.ceil(extra / 120) * 120; x <= x1; x += 120) box(c, x - 6, 14, 12, horizon - 20, 2, N.wood, 2.5);
  box(c, x0 - 6, -4, w + 12, 22, 0, N.woodDark, 3);
  box(c, x0 - 6, horizon - 12, w + 12, 14, 0, N.wood, 3);
  // sepanduk (berselang merah / biru, berulang ke tepi)
  const banners: [number, string][] = [[64, N.red], [416, '#3d4c7a'], [-116, '#3d4c7a'], [596, N.red], [-296, N.red], [776, '#3d4c7a'], [-476, '#3d4c7a'], [956, N.red]];
  for (const [x, col] of banners) {
    if (!inRange(x, 30)) continue;
    line(c, [x - 26, 34, x + 26, 34], N.woodDark, 5);
    rr(c, x - 22, 36, 44, 84, 4);
    paint(c, col, 2.5);
    shuriken(c, x, 76, 13, N.gold, 1.5);
  }
  // tanglung tergantung
  for (const x of [168, 312, -12, 492, -192, 672, -372, 852]) {
    if (!inRange(x, 16)) continue;
    line(c, [x, 18, x, 40], O, 2);
    ell(c, x, 58, 12, 16, N.red, 2.5);
    box(c, x - 6, 40, 12, 5, 1, N.ink, 1.5);
    box(c, x - 6, 72, 12, 5, 1, N.ink, 1.5);
  }

  // lantai tatami berperspektif
  c.save();
  c.beginPath();
  c.rect(x0, horizon, w, h - horizon);
  c.clip();
  c.fillStyle = '#e9e3a8';
  c.fillRect(x0, horizon, w, h - horizon);
  let prevY = horizon;
  for (let k = 1; k < 12; k++) {
    const y = horizon + Math.pow(k / 11, 1.55) * (h - horizon + 40);
    if (k % 2) {
      c.fillStyle = '#dcd592';
      c.fillRect(x0, prevY, w, y - prevY);
    }
    prevY = y;
  }
  c.strokeStyle = '#5f7a3a';
  c.lineWidth = 2.5;
  c.beginPath();
  for (let k = 0; k < 12; k++) {
    const y = horizon + Math.pow(k / 11, 1.55) * (h - horizon + 40);
    c.moveTo(x0, y);
    c.lineTo(x1, y);
  }
  const span = 720 + extra * 4;
  for (let bx = -Math.ceil(span / 120) * 120; bx <= ARENA.w + span; bx += 120) {
    c.moveTo(bx, h + 40);
    c.lineTo(VP.x + (bx - VP.x) * ((horizon - VP.y) / (h + 40 - VP.y)), horizon);
  }
  c.stroke();
  const g = c.createLinearGradient(0, horizon, 0, horizon + 40);
  g.addColorStop(0, 'rgba(38,50,77,.18)');
  g.addColorStop(1, 'rgba(38,50,77,0)');
  c.fillStyle = g;
  c.fillRect(x0, horizon, w, 40);
  c.restore();

  // prop tepi (di tepi kawasan main + di hujung skrin lebar)
  const edges: number[] = [0];
  if (extra > 90) edges.push(extra);
  for (const e of edges) {
    bambooClump(c, -e + 26, horizon + 2);
    bambooClump(c, ARENA.w + e - 26, horizon + 2);
    drawProp(c, { type: 'stoneLantern', x: -e + 6, y: 420, w: 36, h: 30 }, 0);
    drawProp(c, { type: 'stoneLantern', x: ARENA.w + e - 42, y: 420, w: 36, h: 30 }, 0);
  }
  if (extra > 200) {
    drawProp(c, { type: 'taiko', x: -extra / 2 - 30, y: 330, w: 60, h: 40 }, 0);
    drawProp(c, { type: 'dummy', x: ARENA.w + extra / 2 - 20, y: 320, w: 40, h: 32 }, 0);
  }

  // garisan baling (pita putih putus-putus)
  c.strokeStyle = 'rgba(255,255,255,.9)';
  c.lineWidth = 5;
  c.setLineDash([16, 12]);
  c.beginPath();
  c.moveTo(70, THROW_LINE_Y);
  c.lineTo(ARENA.w - 70, THROW_LINE_Y);
  c.stroke();
  c.setLineDash([]);
  // tikar tempat ninja berdiri
  ell(c, HAND.x - 22, h - 26, 92, 30, '#c73a2e', 3);
  ell(c, HAND.x - 22, h - 26, 76, 22, '#d9534a', 0);
  shuriken(c, HAND.x - 22, h - 26, 14, 'rgba(255,233,168,.8)', 0);
}

// ---------- papan sasaran ----------
export interface TargetVisual {
  down: number | null; // masa sejak jatuh (s) — papan terbalik ke belakang
  wobble: number | null; // masa sejak bergoyang (kena sasaran salah)
  aimed: boolean; // garisan bidikan menunjuk papan ini
  hint: number | null; // petunjuk aktif (s)
  valid: boolean; // tahap petanda: papan ini sah?
}

/** Paras lantai di bawah papan (tapak tiang). */
export function floorYOf(t: TargetDef, py: number) {
  return py + t.r + 30 + (py - ARENA.horizon) * 0.12;
}

/**
 * Landasan rel untuk papan bergerak: dua rel besi atas bantalan kayu sepanjang laluan papan (± amp),
 * dengan penahan di kedua-dua hujung. Dilukis SEBELUM semua papan.
 */
export function drawRail(c: Ctx, t: TargetDef) {
  if (t.motion.type !== 'slide') return;
  const k = depthScale(t.y);
  const fy = floorYOf(t, t.y);
  const x0 = t.x - t.motion.amp - t.r * 0.8;
  const x1 = t.x + t.motion.amp + t.r * 0.8;
  const gap = 10 * k; // jarak antara dua rel
  // bayang & bantalan kayu
  c.fillStyle = 'rgba(38,50,77,.14)';
  c.fillRect(x0, fy - gap - 3, x1 - x0, gap * 2 + 8);
  for (let x = x0 + 6; x < x1 - 4; x += 18 * k + 6) box(c, x, fy - gap - 6 * k, 9 * k, gap * 2 + 12 * k, 2, N.woodDark, 2);
  // dua rel besi
  for (const dy of [-gap, gap]) {
    line(c, [x0, fy + dy, x1, fy + dy], O, 7 * k + 2);
    line(c, [x0, fy + dy, x1, fy + dy], '#c9d3e3', 4.5 * k);
  }
  // penahan hujung
  for (const x of [x0, x1]) box(c, x - 7 * k, fy - gap - 12 * k, 14 * k, gap * 2 + 22 * k, 4, N.red, 2.5);
}

export function drawTarget(c: Ctx, t: TargetDef, p: Pt, v: TargetVisual) {
  const { r } = t;
  const floorY = floorYOf(t, p.y);
  const k = depthScale(p.y);
  // tiang & tapak (papan bergerak: troli beroda atas rel)
  ell(c, p.x, floorY, r * 0.62, r * 0.18, 'rgba(38,50,77,.18)', 0);
  if (t.motion.type === 'slide') {
    const wr = 10 * k;
    box(c, p.x - r * 0.62, floorY - 20 * k, r * 1.24, 15 * k, 5, N.red, 2.5);
    for (const sx of [-1, 1]) {
      const wx = p.x + sx * r * 0.42;
      const wy = floorY - 1;
      ell(c, wx, wy, wr, wr, '#3d4c7a', 2.5);
      // jejari roda berpusing ikut kedudukan
      const a = p.x / wr;
      line(c, [wx - Math.cos(a) * wr * 0.7, wy - Math.sin(a) * wr * 0.7, wx + Math.cos(a) * wr * 0.7, wy + Math.sin(a) * wr * 0.7], '#c9d3e3', 2);
      line(c, [wx + Math.sin(a) * wr * 0.7, wy - Math.cos(a) * wr * 0.7, wx - Math.sin(a) * wr * 0.7, wy + Math.cos(a) * wr * 0.7], '#c9d3e3', 2);
      ell(c, wx, wy, wr * 0.25, wr * 0.25, N.gold, 0);
    }
    box(c, p.x - r * 0.12, p.y, r * 0.24, floorY - 20 * k - p.y + 2, 3, N.wood, 2.5);
  } else {
    box(c, p.x - r * 0.42, floorY - 7 * k, r * 0.84, 10 * k, 4, N.woodDark, 2.5);
    box(c, p.x - r * 0.12, p.y, r * 0.24, floorY - p.y - 4, 3, N.wood, 2.5);
  }

  c.save();
  c.translate(p.x, p.y + r); // pangsi di tepi bawah papan
  if (v.wobble !== null) c.rotate(Math.sin(v.wobble * 28) * 0.18 * (1 - v.wobble / 0.5));
  if (v.down !== null) c.scale(1, Math.max(0.28, 1 - Math.min(1, v.down / 0.3) * 0.72));
  c.translate(0, -r);
  // sinaran sasaran yang dibidik / petunjuk
  if (v.aimed && v.down === null) {
    c.save();
    c.shadowColor = '#ffd24d';
    c.shadowBlur = 18;
    ell(c, 0, 0, r + 5, r + 5, 'rgba(255,210,77,.55)', 0);
    c.restore();
  }
  const blue = t.cue === 'star';
  const ringCol = t.cue ? (blue ? '#4f86c6' : '#d9443a') : '#d9443a';
  ell(c, 0, 0, r, r, '#9a6332', 3);
  ell(c, 0, 0, r * 0.82, r * 0.82, '#fff1d6', 2);
  ell(c, 0, 0, r * 0.6, r * 0.6, ringCol, 2);
  ell(c, 0, 0, r * 0.38, r * 0.38, '#fff1d6', 2);
  if (t.cue === 'star') {
    // bintang 5 bucu (petanda sah)
    c.beginPath();
    for (let i = 0; i < 10; i++) {
      const a = -Math.PI / 2 + (i * Math.PI) / 5;
      const rr2 = i % 2 ? r * 0.15 : r * 0.33;
      c.lineTo(Math.cos(a) * rr2, Math.sin(a) * rr2);
    }
    c.closePath();
    paint(c, N.gold, 2);
  } else if (t.cue === 'circle') ell(c, 0, 0, r * 0.22, r * 0.22, '#d9443a', 2);
  else ell(c, 0, 0, r * 0.17, r * 0.17, N.gold, 2);
  // urat kayu pada gelang luar
  c.strokeStyle = 'rgba(74,44,20,.35)';
  c.lineWidth = 1.5;
  c.beginPath();
  c.arc(0, 0, r * 0.91, 0.4, 1.4);
  c.arc(0, 0, r * 0.91, 3.4, 4.2);
  c.stroke();
  if (v.down !== null) {
    c.fillStyle = 'rgba(255,255,255,.35)';
    c.beginPath();
    c.arc(0, 0, r, 0, Math.PI * 2);
    c.fill();
  }
  c.restore();
  // tanda selesai
  if (v.down !== null) {
    const by = p.y + r * 0.45;
    ell(c, p.x + r * 0.7, by, 11, 11, '#3fbf6f', 2.5);
    line(c, [p.x + r * 0.7 - 5, by, p.x + r * 0.7 - 1, by + 4, p.x + r * 0.7 + 6, by - 4], '#ffffff', 2.5);
  }
  if (v.hint !== null && v.down === null) {
    c.save();
    c.setLineDash([8, 6]);
    c.lineDashOffset = -v.hint * 30;
    c.strokeStyle = '#ffd24d';
    c.lineWidth = 4;
    c.beginPath();
    c.arc(p.x, p.y, r + 10 + Math.sin(v.hint * 6) * 3, 0, Math.PI * 2);
    c.stroke();
    c.restore();
  }
}

/** Shuriken latihan (tumpul, kartun). */
export function drawShuriken(c: Ctx, x: number, y: number, size: number, rot: number) {
  shuriken(c, x, y, size, '#c9d3e3', 2.5, rot);
  ell(c, x, y, size * 0.22, size * 0.22, '#3d4c7a', 2);
}

/** Garisan bidikan bertitik dari tangan ke titik kena yang diramal (sama dengan balingan sebenar). */
export function drawAim(c: Ctx, hit: RayHit, time: number) {
  const dx = hit.point.x - HAND.x;
  const dy = hit.point.y - HAND.y;
  const len = Math.hypot(dx, dy);
  const off = (time * 60) % 18;
  for (let d = 18 - off; d < len - 6; d += 18) {
    const x = HAND.x + (dx * d) / len;
    const y = HAND.y + (dy * d) / len;
    const s = depthScale(y);
    ell(c, x, y, 4.5 * s, 4.5 * s, '#ffffff', 2);
  }
  const ok = !!hit.target;
  c.save();
  c.translate(hit.point.x, hit.point.y);
  c.strokeStyle = O;
  c.lineWidth = 5;
  c.beginPath();
  c.arc(0, 0, 11, 0, Math.PI * 2);
  c.stroke();
  c.strokeStyle = ok ? '#ffd24d' : '#ffffff';
  c.lineWidth = 3;
  c.stroke();
  line(c, [-16, 0, -6, 0], ok ? '#ffd24d' : '#ffffff', 3);
  line(c, [6, 0, 16, 0], ok ? '#ffd24d' : '#ffffff', 3);
  line(c, [0, -16, 0, -6], ok ? '#ffd24d' : '#ffffff', 3);
  line(c, [0, 6, 0, 16], ok ? '#ffd24d' : '#ffffff', 3);
  c.restore();
}

/** Percikan bintang kecil bila kena. */
export function drawSparks(c: Ctx, x: number, y: number, t: number) {
  const f = Math.min(1, t / 0.6);
  c.globalAlpha = 1 - f;
  for (let i = 0; i < 8; i++) {
    const a = (i / 8) * Math.PI * 2;
    const d = 10 + f * 40;
    shuriken(c, x + Math.cos(a) * d, y + Math.sin(a) * d, 5 * (1 - f * 0.5), N.gold, 0, a);
  }
  c.globalAlpha = 1;
}
