// Scene LUAR Akademi Ninja — pintu masuk sinematik dengan perspektif 2D palsu (tiada 3D).
// Pemain dilihat dari belakang; laluan batu menyempit ke arah gerbang, objek mengecil mengikut kedalaman.
// Koordinat pemain: gx = sisi (−1..1 = tepi laluan), z = kedalaman (0 = dekat kamera, 1 = pintu dojo).
// PLACEHOLDER ART: dilukis secara prosedural, gaya sama dengan render.ts (garisan tebal, warna lembut).
import type { Facing } from './config.ts';
import { N, rr, paint, box, ell, line, stick, shuriken, blob, label, sakuraCanopy, hangingLantern } from './render.ts';
import { t } from './strings.ts';

type Ctx = CanvasRenderingContext2D;
const O = '#26324d';

/** Tetapan pergerakan & zon scene luar (boleh laras). */
export const EXT = {
  spawn: { gx: 0, z: 0.1, facing: 'up' as Facing },
  /** Kedudukan selepas keluar dari akademi (di depan gerbang, menghadap kamera). */
  exitSpot: { gx: 0, z: 0.74, facing: 'down' as Facing },
  zMin: 0.03,
  zMax: 0.95,
  pathLimit: 1.25, // had sisi di luar gerbang (sedikit ke atas rumput)
  gateZ: 0.86, // selepas ini hanya celah gerbang boleh dilalui
  gateHalf: 0.55,
  enterZ: 0.8, // butang MASUK AKADEMI muncul dari sini
  speedZ: 0.3, // kedalaman / saat
  speedX: 1.05, // sisi / saat
  /** Jarak skrin bagi satu bingkai langkah, sebagai pecahan tinggi pemain. Kecil = kaki bertukar lebih cepat. */
  strideFactor: 0.14,
  /** Babak automatik: ninja berjalan sendiri ke gerbang & masuk; semasa keluar berjalan pulang lalu ke homepage. false = kawalan manual. */
  auto: true,
  autoStartDelay: 0.6, // saat sebelum mula berjalan (biar pemain nampak pemandangan)
  autoEnterZ: 0.9, // berhenti di sini (bawah gerbang) sebelum masuk
  autoLeaveZ: 0.3, // semasa keluar: berjalan pulang sehingga sini
  autoPause: 0.3, // saat berhenti sebelum pudar
};

export interface ExtState {
  gx: number;
  z: number;
  facing: Facing;
  walk: number | null;
}

export interface ExtLayout {
  vw: number;
  vh: number;
  horizonY: number;
  nearY: number;
  half0: number; // separuh lebar laluan pada z=0 (px)
  playerH0: number; // tinggi pemain pada z=0 (px)
  K: number;
  s1: number;
  bw: number; // lebar bangunan
}

export function extLayout(vw: number, vh: number): ExtLayout {
  const portrait = vh > vw * 1.05;
  const K = 1.6;
  return {
    vw,
    vh,
    horizonY: vh * (portrait ? 0.44 : 0.5),
    nearY: vh * 1.04,
    half0: Math.min(vw * 0.34, vh * 0.3),
    playerH0: Math.max(110, Math.min(vh * 0.3, vw * 0.48, 300)),
    K,
    s1: 1 / (1 + K),
    bw: Math.min(vw * 0.98, vh * (portrait ? 0.95 : 1.05)),
  };
}

export function proj(L: ExtLayout, gx: number, z: number) {
  const s = 1 / (1 + L.K * z);
  const y = L.horizonY + ((L.nearY - L.horizonY) * (s - L.s1)) / (1 - L.s1);
  return { x: L.vw / 2 + gx * L.half0 * s, y, s };
}

/** Kemas kini pergerakan scene luar. Pulangkan true jika pemain di zon pintu masuk. */
export function updateExterior(st: ExtState, v: { x: number; y: number }, dt: number, L: ExtLayout, _facingFrom?: (v: { x: number; y: number }, f: Facing) => Facing) {
  // Scene luar: DEPAN / BELAKANG sahaja. Input kiri/kanan diabaikan; pemain kekal di tengah laluan.
  // Joystick condong pepenjuru masih dikira jika komponen menegaknya cukup (kelajuan tetap penuh).
  const dir = v.y < -0.35 ? -1 : v.y > 0.35 ? 1 : 0;
  if (dir) {
    const before = proj(L, st.gx, st.z);
    st.z = Math.min(EXT.zMax, Math.max(EXT.zMin, st.z - dir * EXT.speedZ * dt));
    st.gx = 0;
    st.facing = dir < 0 ? 'up' : 'down';
    const after = proj(L, st.gx, st.z);
    const dist = Math.hypot(after.x - before.x, after.y - before.y);
    const stride = L.playerH0 * after.s * EXT.strideFactor;
    st.walk = dist > 0.05 ? (st.walk ?? 0) + (dist / stride) * (Math.PI / 2) : null;
  } else st.walk = null;
  return st.z >= EXT.enterZ && Math.abs(st.gx) <= EXT.gateHalf + 0.05;
}

// ---------- Latar statik (langit, gunung, bangunan, tanah, laluan) ----------
export function buildExteriorBackground(L: ExtLayout, dpr: number): HTMLCanvasElement {
  const cv = document.createElement('canvas');
  cv.width = Math.round(L.vw * dpr);
  cv.height = Math.round(L.vh * dpr);
  const c = cv.getContext('2d')!;
  c.scale(dpr, dpr);
  const { vw, vh, horizonY } = L;
  const cx = vw / 2;

  // langit
  const sky = c.createLinearGradient(0, 0, 0, horizonY);
  sky.addColorStop(0, '#7cc8f2');
  sky.addColorStop(0.7, '#bfe6f7');
  sky.addColorStop(1, '#fff1d6');
  c.fillStyle = sky;
  c.fillRect(0, 0, vw, horizonY + 2);

  // gunung jauh
  const mBase = horizonY - L.bw * 0.12;
  c.fillStyle = '#9fc6e6';
  c.strokeStyle = 'rgba(38,50,77,.35)';
  c.lineWidth = 2.5;
  c.beginPath();
  c.moveTo(0, mBase + 40);
  const peaks = [[0.08, 0.2], [0.22, 0.32], [0.38, 0.18], [0.62, 0.26], [0.8, 0.36], [0.95, 0.2]];
  for (const [px, ph] of peaks) {
    c.quadraticCurveTo(vw * (px - 0.06), mBase - L.bw * ph * 0.6, vw * px, mBase - L.bw * ph);
    c.quadraticCurveTo(vw * (px + 0.04), mBase - L.bw * ph * 0.6, vw * (px + 0.08), mBase);
  }
  c.lineTo(vw, mBase + 40);
  c.lineTo(vw, horizonY);
  c.lineTo(0, horizonY);
  c.closePath();
  c.fill();
  c.stroke();
  // puncak bersalji
  c.fillStyle = '#ffffff';
  for (const [px, ph] of peaks) {
    if (ph < 0.25) continue;
    const tx = vw * px;
    const ty = mBase - L.bw * ph;
    c.beginPath();
    c.moveTo(tx, ty);
    c.lineTo(tx - L.bw * 0.03, ty + L.bw * 0.05);
    c.lineTo(tx + L.bw * 0.03, ty + L.bw * 0.05);
    c.closePath();
    c.fill();
  }

  // tanah & rumput
  const grass = c.createLinearGradient(0, horizonY, 0, vh);
  grass.addColorStop(0, '#9ed27a');
  grass.addColorStop(1, '#7fc35e');
  c.fillStyle = grass;
  c.fillRect(0, horizonY, vw, vh - horizonY);
  let seed = 11;
  const rnd = () => (seed = (seed * 16807) % 2147483647) / 2147483647;
  c.strokeStyle = 'rgba(70,140,60,.55)';
  for (let i = 0; i < 160; i++) {
    const z = rnd();
    const gx = (rnd() * 2 - 1) * 5.5;
    if (Math.abs(gx) < 1.15) continue;
    const p = proj(L, gx, z);
    const h = 9 * p.s + 3;
    c.lineWidth = 1.5 * p.s + 0.8;
    c.beginPath();
    c.moveTo(p.x - h * 0.4, p.y);
    c.lineTo(p.x - h * 0.2, p.y - h);
    c.moveTo(p.x, p.y);
    c.lineTo(p.x + h * 0.15, p.y - h * 1.2);
    c.stroke();
  }

  drawBuilding(c, L);

  // laluan batu (trapezium perspektif)
  const steps = 40;
  c.beginPath();
  for (let i = 0; i <= steps; i++) {
    const p = proj(L, -1, i / steps);
    i ? c.lineTo(p.x, p.y) : c.moveTo(p.x, p.y);
  }
  for (let i = steps; i >= 0; i--) {
    const p = proj(L, 1, i / steps);
    c.lineTo(p.x, p.y);
  }
  c.closePath();
  c.fillStyle = '#ebe5d6';
  c.fill();
  c.save();
  c.clip();
  // jubin batu: baris mengecil ke arah gerbang
  const rows = 14;
  for (let r = 0; r < rows; r++) {
    const z0 = r / rows;
    const z1 = (r + 1) / rows;
    const a = proj(L, -1, z0);
    const b = proj(L, 1, z1);
    if (r % 2) {
      c.fillStyle = '#e0d8c6';
      c.fillRect(a.x - 400, b.y, vw + 800, a.y - b.y);
    }
    c.strokeStyle = 'rgba(120,105,80,.45)';
    c.lineWidth = 2 * a.s + 0.5;
    c.beginPath();
    c.moveTo(0, a.y);
    c.lineTo(vw, a.y);
    for (const gx of r % 2 ? [-0.5, 0.5] : [-0.75, 0, 0.75]) {
      const p0 = proj(L, gx, z0);
      const p1 = proj(L, gx, z1);
      c.moveTo(p0.x, p0.y);
      c.lineTo(p1.x, p1.y);
    }
    c.stroke();
  }
  // kilauan lembut di tengah laluan
  const shine = c.createLinearGradient(cx - L.half0, 0, cx + L.half0, 0);
  shine.addColorStop(0, 'rgba(255,255,255,0)');
  shine.addColorStop(0.5, 'rgba(255,255,255,.25)');
  shine.addColorStop(1, 'rgba(255,255,255,0)');
  c.fillStyle = shine;
  c.fillRect(0, horizonY, vw, vh);
  c.restore();
  // bingkai laluan
  for (const side of [-1, 1]) {
    c.beginPath();
    for (let i = 0; i <= steps; i++) {
      const p = proj(L, side, i / steps);
      i ? c.lineTo(p.x, p.y) : c.moveTo(p.x, p.y);
    }
    c.strokeStyle = O;
    c.lineWidth = 3;
    c.stroke();
  }
  // batu sempadan bulat di tepi laluan
  for (let i = 0; i < 16; i++) {
    const z = i / 16 + 0.02;
    for (const side of [-1.08, 1.08]) {
      const p = proj(L, side, z);
      ell(c, p.x, p.y, 9 * p.s + 2, 5 * p.s + 1.5, i % 2 ? '#cfc8b8' : '#bdb5a3', 2);
    }
  }
  return cv;
}

function drawBuilding(c: Ctx, L: ExtLayout) {
  const cx = L.vw / 2;
  const by = L.horizonY;
  const BW = L.bw;
  const wallH = BW * 0.17;
  const doorHalf = L.half0 * L.s1 * 1.35;
  const wallL = cx - BW * 0.4;
  const wallR = cx + BW * 0.4;

  // pelantar batu & tangga
  box(c, cx - BW * 0.45, by - 10, BW * 0.9, 16, 4, '#d9d5cc', 3);
  box(c, cx - doorHalf * 1.3, by - 2, doorHalf * 2.6, 10, 3, '#e9e4d8', 2.5);

  // dinding shoji
  rr(c, wallL, by - wallH - 8, wallR - wallL, wallH, 3);
  paint(c, N.paper);
  c.save();
  rr(c, wallL, by - wallH - 8, wallR - wallL, wallH, 3);
  c.clip();
  c.strokeStyle = 'rgba(138,90,43,.35)';
  c.lineWidth = 1.5;
  c.beginPath();
  const cell = Math.max(10, BW * 0.022);
  for (let x = wallL + cell; x < wallR; x += cell) (c.moveTo(x, by - wallH - 8), c.lineTo(x, by - 8));
  for (let y = by - wallH - 8 + cell; y < by - 8; y += cell) (c.moveTo(wallL, y), c.lineTo(wallR, y));
  c.stroke();
  c.restore();
  // tiang kayu
  const postW = Math.max(7, BW * 0.016);
  for (const fx of [-0.4, -0.27, 0.27, 0.4]) box(c, cx + BW * fx - postW / 2, by - wallH - 10, postW, wallH + 4, 2, N.wood, 2.5);
  // jalur merah bawah dinding
  c.fillStyle = N.red;
  c.fillRect(wallL + 2, by - 22, wallR - wallL - 4, 8);
  // pintu terbuka dengan cahaya hangat
  const dh = Math.min(wallH * 0.92, doorHalf * 2.4);
  const glow = c.createLinearGradient(0, by - dh, 0, by);
  glow.addColorStop(0, '#ffcf7a');
  glow.addColorStop(1, '#fff2c8');
  rr(c, cx - doorHalf, by - 8 - dh, doorHalf * 2, dh, 4);
  c.fillStyle = glow;
  c.fill();
  c.lineWidth = 3;
  c.strokeStyle = O;
  c.stroke();
  // pintu gelangsar terbuka ke tepi
  for (const side of [-1, 1]) {
    const x = side < 0 ? cx - doorHalf - doorHalf * 0.55 : cx + doorHalf;
    box(c, x, by - 8 - dh, doorHalf * 0.55, dh, 3, N.paper, 2.5);
    c.strokeStyle = 'rgba(138,90,43,.45)';
    c.lineWidth = 1.2;
    c.beginPath();
    for (let k = 1; k < 3; k++) (c.moveTo(x + (doorHalf * 0.55 * k) / 3, by - 8 - dh), c.lineTo(x + (doorHalf * 0.55 * k) / 3, by - 8));
    for (let k = 1; k < 5; k++) (c.moveTo(x, by - 8 - dh + (dh * k) / 5), c.lineTo(x + doorHalf * 0.55, by - 8 - dh + (dh * k) / 5));
    c.stroke();
  }
  // noren merah di pintu
  const nw = (doorHalf * 2) / 3;
  for (let k = 0; k < 3; k++) {
    rr(c, cx - doorHalf + k * nw + 2, by - 8 - dh, nw - 4, dh * 0.32, 3);
    paint(c, k === 1 ? N.redDark : N.red, 2.5);
  }
  shuriken(c, cx, by - 8 - dh + dh * 0.16, Math.max(6, dh * 0.09), '#fff3d6', 1.5);

  // bumbung bawah (hujung melengkung ke atas)
  const roofY = by - wallH - 8;
  const roofH = BW * 0.09;
  drawRoof(c, cx, roofY, BW * 0.5, roofH, BW);
  // tingkat atas
  const upW = BW * 0.26;
  const upH = BW * 0.07;
  const upY = roofY - roofH * 0.75;
  rr(c, cx - upW, upY - upH, upW * 2, upH + 4, 3);
  paint(c, N.paper);
  for (const fx of [-1, -0.45, 0.45, 1]) box(c, cx + upW * fx - postW / 2 - (fx > 0 ? postW / 2 : -postW / 2) * 0, upY - upH, postW, upH + 4, 2, N.wood, 2);
  drawRoof(c, cx, upY - upH, upW * 1.45, BW * 0.1, BW);
  // hiasan puncak: shuriken emas
  shuriken(c, cx, upY - upH - BW * 0.1 - BW * 0.015, Math.max(9, BW * 0.03), N.gold, 2.5, Math.PI / 4);
  // papan nama
  label(c, cx, upY - upH * 0.45, 'YOU EDU', Math.max(12, Math.min(26, BW * 0.034)), 'red');
  // tanglung tergantung di bawah bumbung
  for (const fx of [-0.33, 0.33]) hangingLantern(c, cx + BW * fx, roofY + 2, Math.max(0.7, BW / 700));
}

function drawRoof(c: Ctx, cx: number, baseY: number, half: number, h: number, BW: number) {
  const lift = h * 0.55;
  const roof = new Path2D();
  roof.moveTo(cx - half - h * 0.3, baseY - lift);
  roof.quadraticCurveTo(cx - half * 0.8, baseY + h * 0.05, cx - half * 0.55, baseY - h * 0.25);
  roof.lineTo(cx - half * 0.3, baseY - h);
  roof.lineTo(cx + half * 0.3, baseY - h);
  roof.lineTo(cx + half * 0.55, baseY - h * 0.25);
  roof.quadraticCurveTo(cx + half * 0.8, baseY + h * 0.05, cx + half + h * 0.3, baseY - lift);
  roof.quadraticCurveTo(cx + half * 0.7, baseY + h * 0.3, cx, baseY + h * 0.18);
  roof.quadraticCurveTo(cx - half * 0.7, baseY + h * 0.3, cx - half - h * 0.3, baseY - lift);
  roof.closePath();
  c.fillStyle = '#3d4c7a';
  c.fill(roof);
  c.save();
  c.clip(roof);
  c.strokeStyle = 'rgba(255,255,255,.18)';
  c.lineWidth = 2;
  c.beginPath();
  const step = Math.max(8, BW * 0.018);
  for (let x = cx - half * 1.3; x < cx + half * 1.3; x += step) (c.moveTo(x, baseY - h), c.lineTo(x + (x - cx) * 0.25, baseY + h * 0.3));
  c.stroke();
  c.restore();
  c.lineWidth = 3;
  c.strokeStyle = O;
  c.stroke(roof);
  // lis emas di tepi bumbung
  c.strokeStyle = N.gold;
  c.lineWidth = Math.max(3, BW * 0.006);
  c.beginPath();
  c.moveTo(cx - half - h * 0.3, baseY - lift);
  c.quadraticCurveTo(cx - half * 0.7, baseY + h * 0.3, cx, baseY + h * 0.18);
  c.quadraticCurveTo(cx + half * 0.7, baseY + h * 0.3, cx + half + h * 0.3, baseY - lift);
  c.stroke();
  // rabung
  box(c, cx - half * 0.32, baseY - h - 5, half * 0.64, 8, 4, '#26324d', 2);
}

// ---------- Props luar (disusun mengikut kedalaman bersama pemain) ----------
interface ExtProp {
  type: 'torii' | 'lantern' | 'sakura' | 'bamboo' | 'flag';
  gx: number;
  z: number;
  variant?: string;
}

export const EXT_PROPS: ExtProp[] = [
  { type: 'torii', gx: 0, z: 0.88 },
  { type: 'lantern', gx: -1.5, z: 0.22 },
  { type: 'lantern', gx: 1.5, z: 0.22 },
  { type: 'lantern', gx: -1.45, z: 0.55 },
  { type: 'lantern', gx: 1.45, z: 0.55 },
  { type: 'flag', gx: -1.9, z: 0.4, variant: '#d9443a' },
  { type: 'flag', gx: 1.9, z: 0.4, variant: '#3d4c7a' },
  { type: 'flag', gx: -1.75, z: 0.72, variant: '#3d4c7a' },
  { type: 'flag', gx: 1.75, z: 0.72, variant: '#d9443a' },
  { type: 'sakura', gx: -3.1, z: 0.1 },
  { type: 'sakura', gx: 3.1, z: 0.1 },
  { type: 'sakura', gx: -2.7, z: 0.6 },
  { type: 'sakura', gx: 2.7, z: 0.6 },
  { type: 'bamboo', gx: -4.2, z: 0.35 },
  { type: 'bamboo', gx: 4.2, z: 0.35 },
  { type: 'bamboo', gx: -3.4, z: 0.92 },
  { type: 'bamboo', gx: 3.4, z: 0.92 },
];

/** u = skala piksel per unit reka bentuk (unit 100 = tinggi pemain). */
export function drawExtProp(c: Ctx, L: ExtLayout, p: ExtProp, time: number) {
  const pt = proj(L, p.gx, p.z);
  const u = (L.playerH0 * pt.s) / 100;
  const lw = Math.max(1.6, 3 / u);
  c.save();
  c.translate(pt.x, pt.y);
  c.scale(u, u);
  switch (p.type) {
    case 'torii': {
      const half = (L.half0 * 0.95) / (L.playerH0 / 100); // tiang pada gx ±0.95
      ell(c, -half, 0, 22, 7, 'rgba(38,50,77,.18)', 0);
      ell(c, half, 0, 22, 7, 'rgba(38,50,77,.18)', 0);
      for (const sx of [-half, half]) {
        box(c, sx - 11, -235, 22, 235, 5, N.red, lw);
        box(c, sx - 15, -14, 30, 14, 4, '#26324d', lw);
      }
      box(c, -half - 40, -200, half * 2 + 80, 18, 4, N.red, lw);
      rr(c, -half - 62, -248, half * 2 + 124, 24, 10);
      paint(c, '#26324d', lw);
      box(c, -half - 48, -228, half * 2 + 96, 16, 4, N.red, lw);
      box(c, -70, -225, 140, 30, 5, '#9a6332', lw);
      c.font = `900 14px system-ui, "Segoe UI", Arial, sans-serif`;
      c.textAlign = 'center';
      c.textBaseline = 'middle';
      c.fillStyle = '#fff3d6';
      c.fillText(t('banner.mall'), 0, -209);
      hangingLantern(c, -half * 0.55, -180, 1.3);
      hangingLantern(c, half * 0.55, -180, 1.3);
      break;
    }
    case 'lantern': {
      const flick = time ? 0.78 + Math.sin(time * 8 + p.gx) * 0.1 + Math.sin(time * 21 + p.z * 9) * 0.07 : 0.85;
      ell(c, 0, 0, 30, 9, 'rgba(38,50,77,.18)', 0);
      box(c, -24, -16, 48, 16, 4, '#d9d5cc', lw);
      box(c, -9, -60, 18, 46, 4, '#d9d5cc', lw);
      const g = c.createRadialGradient(0, -82, 2, 0, -82, 55);
      g.addColorStop(0, `rgba(255,214,120,${0.6 * flick})`);
      g.addColorStop(1, 'rgba(255,214,120,0)');
      c.fillStyle = g;
      c.fillRect(-60, -140, 120, 120);
      box(c, -22, -102, 44, 42, 6, '#d9d5cc', lw);
      box(c, -11, -94, 22, 24, 3, `rgb(255,${205 + flick * 40},${100 + flick * 50})`, lw * 0.8);
      c.beginPath();
      c.moveTo(-38, -98);
      c.quadraticCurveTo(0, -140, 38, -98);
      c.closePath();
      paint(c, '#aaa49a', lw);
      ell(c, 0, -132, 7, 7, '#aaa49a', lw);
      break;
    }
    case 'flag': {
      // bendera nobori
      ell(c, 0, 0, 14, 5, 'rgba(38,50,77,.18)', 0);
      stick(c, [0, 0, 0, -190], N.woodDark, 5);
      stick(c, [0, -186, 36, -186], N.woodDark, 4);
      const sway = time ? Math.sin(time * 1.8 + p.gx) * 4 : 0;
      c.beginPath();
      c.moveTo(4, -184);
      c.lineTo(36, -184);
      c.lineTo(36 + sway, -70);
      c.lineTo(20 + sway * 0.5, -82);
      c.lineTo(4, -70);
      c.closePath();
      paint(c, p.variant || N.red, lw);
      shuriken(c, 20 + sway * 0.4, -140, 11, '#fff3d6', lw * 0.7);
      break;
    }
    case 'sakura': {
      ell(c, 0, 0, 70, 16, 'rgba(38,50,77,.16)', 0);
      stick(c, [0, 0, -4, -120], N.woodDark, 16);
      stick(c, [-3, -80, -40, -130], N.woodDark, 9);
      stick(c, [-2, -95, 38, -142], N.woodDark, 9);
      sakuraCanopy(c, 0, -170, 72);
      break;
    }
    case 'bamboo': {
      for (const [dx, hgt] of [[-18, 230], [0, 280], [18, 210], [34, 250]]) {
        rr(c, dx - 7, -hgt, 14, hgt, 6);
        paint(c, N.bamboo, lw);
        c.strokeStyle = N.bambooDark;
        c.lineWidth = lw * 0.8;
        c.beginPath();
        for (let ny = -hgt + 30; ny < -6; ny += 30) (c.moveTo(dx - 6, ny), c.lineTo(dx + 6, ny));
        c.stroke();
        ell(c, dx + 16, -hgt + 12, 16, 5, N.bamboo, lw * 0.8, -0.5);
        ell(c, dx - 16, -hgt + 30, 16, 5, N.bamboo, lw * 0.8, 0.5);
      }
      break;
    }
  }
  c.restore();
}

// ---------- Kelopak sakura gugur (ruang skrin) ----------
export interface Petal { x: number; y: number; vy: number; ph: number; r: number }
export function makePetals(L: ExtLayout, n = 18): Petal[] {
  const out: Petal[] = [];
  for (let i = 0; i < n; i++) out.push({ x: Math.random() * L.vw, y: Math.random() * L.vh, vy: 18 + Math.random() * 26, ph: Math.random() * 6.28, r: 3 + Math.random() * 3 });
  return out;
}
export function drawPetals(c: Ctx, L: ExtLayout, petals: Petal[], dt: number, time: number) {
  c.fillStyle = N.sakuraDark;
  for (const p of petals) {
    p.y += p.vy * dt;
    p.x += Math.sin(time * 0.9 + p.ph) * 14 * dt;
    if (p.y > L.vh + 10) {
      p.y = -10;
      p.x = Math.random() * L.vw;
    }
    c.globalAlpha = 0.85;
    c.beginPath();
    c.ellipse(p.x, p.y, p.r, p.r * 0.6, time + p.ph, 0, Math.PI * 2);
    c.fill();
  }
  c.globalAlpha = 1;
}

export { blob, line };
