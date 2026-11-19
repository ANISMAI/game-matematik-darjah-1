// Seni Sushi Master Ninja — dilukis dengan kod dalam gaya Akademi Ninja (garis navy tebal, warna lembut).
// Boleh diganti dengan imej sebenar kemudian tanpa mengubah logik permainan.
import { N, box, ell, rr, paint, line, shuriken, floor } from '../mall/render.ts';
import type { IngredientId, Recipe } from './recipes.ts';
import { RECIPES } from './recipes.ts';
import { BELT_W, STAGE, TRACK } from './layout.ts';
import type { SquareTrack } from './conveyor.ts';

type Ctx = CanvasRenderingContext2D;
const O = '#26324d';
const RICE = '#fffaf0';
const NORI = '#2f4a3a';
const EGG = '#ffd34d';
const CUKE = '#6cc04a';
const SALMON = '#ff8a5c';
const SHRIMP = '#ff7043';

// ---------- hirisan salmon ----------
/**
 * Hirisan salmon tebal (rujukan: kepingan nigiri) — permukaan atas oren, sisi bawah merah gelap,
 * jalur lemak condong melengkung & kilauan. (cx, cy) = tengah; w × h = saiz permukaan atas.
 */
export function salmonSlice(c: Ctx, cx: number, cy: number, w: number, h: number, rot = 0) {
  const shape = (dy: number) => {
    const x0 = -w / 2;
    const x1 = w / 2;
    const t = -h / 2 + dy;
    const b = h / 2 + dy;
    c.beginPath();
    c.moveTo(x0 + h * 0.45, t + h * 0.02);
    c.bezierCurveTo(x0 + w * 0.32, t - h * 0.12, x1 - w * 0.34, t + h * 0.02, x1 - h * 0.42, t + h * 0.14);
    c.bezierCurveTo(x1 + h * 0.08, t + h * 0.26, x1 + h * 0.06, b - h * 0.08, x1 - h * 0.45, b);
    c.bezierCurveTo(x1 - w * 0.3, b + h * 0.12, x0 + w * 0.36, b - h * 0.34, x0 + h * 0.38, b - h * 0.14);
    c.bezierCurveTo(x0 - h * 0.12, b - h * 0.24, x0 - h * 0.1, t + h * 0.12, x0 + h * 0.45, t + h * 0.02);
    c.closePath();
  };
  c.save();
  c.translate(cx, cy);
  c.rotate(rot);
  c.lineJoin = 'round';
  // sisi bawah (ketebalan)
  shape(h * 0.24);
  paint(c, '#b5291a', 3);
  // permukaan atas
  shape(0);
  paint(c, '#ff7a2e', 3);
  c.save();
  shape(0);
  c.clip();
  // jalur lemak condong melengkung
  c.strokeStyle = '#ffab7d';
  c.lineCap = 'round';
  c.lineWidth = Math.max(2, h * 0.12);
  // menyapu dari atas-kiri ke bawah-kanan dengan lengkung (seperti urat lemak salmon)
  const gap = Math.max(w / 6, h * 0.55);
  for (let sx = -w / 2 - w * 0.4; sx < w / 2 + gap; sx += gap) {
    c.beginPath();
    c.moveTo(sx, -h * 0.75);
    c.quadraticCurveTo(sx + w * 0.1, h * 0.15, sx + w * 0.42, h * 0.8);
    c.stroke();
  }
  // kilauan
  c.strokeStyle = 'rgba(255,255,255,.95)';
  c.lineWidth = Math.max(1.5, h * 0.08);
  c.beginPath();
  c.moveTo(-w * 0.32, -h * 0.3);
  c.quadraticCurveTo(-w * 0.1, -h * 0.38, w * 0.12, -h * 0.18);
  c.stroke();
  c.restore();
  c.restore();
}

// ---------- udang ebi (dibelah, dilihat dari atas) ----------
/**
 * Udang ebi untuk sushi: badan lebar leper (hujung kepala bulat di kiri), jalur putih-merah jambu melintang,
 * kilauan lembut di tengah, mengecil ke ekor kipas bertakuk di kanan. (cx, cy) = tengah; w × h = saiz.
 */
export function ebiTop(c: Ctx, cx: number, cy: number, w: number, h: number, rot = 0) {
  c.save();
  c.translate(cx, cy);
  c.rotate(rot);
  c.lineJoin = 'round';
  const x0 = -w / 2;
  const xb = x0 + w * 0.76; // pangkal ekor
  const x1 = w / 2;
  const bodyPath = () => {
    c.beginPath();
    c.moveTo(x0 + h * 0.5, -h / 2);
    c.bezierCurveTo(x0 + w * 0.42, -h * 0.56, xb - w * 0.1, -h * 0.34, xb, -h * 0.2);
    c.lineTo(xb, h * 0.2);
    c.bezierCurveTo(xb - w * 0.1, h * 0.34, x0 + w * 0.42, h * 0.56, x0 + h * 0.5, h / 2);
    c.bezierCurveTo(x0 - h * 0.08, h * 0.46, x0 - h * 0.08, -h * 0.46, x0 + h * 0.5, -h / 2);
    c.closePath();
  };
  // ekor kipas bertakuk (dilukis dahulu, badan menindih pangkalnya)
  c.beginPath();
  c.moveTo(xb - 4, -h * 0.16);
  c.quadraticCurveTo(xb + (x1 - xb) * 0.5, -h * 0.2, x1, -h * 0.36);
  c.lineTo(x1 - (x1 - xb) * 0.14, -h * 0.06);
  c.lineTo(x1 - (x1 - xb) * 0.04, h * 0.02);
  c.lineTo(x1, h * 0.36);
  c.quadraticCurveTo(xb + (x1 - xb) * 0.5, h * 0.2, xb - 4, h * 0.16);
  c.closePath();
  paint(c, '#ee5a2c', 2.5);
  line(c, [xb + 4, 0, x1 - (x1 - xb) * 0.2, -h * 0.16], 'rgba(160,40,20,.45)', 1.5);
  line(c, [xb + 4, 0, x1 - (x1 - xb) * 0.2, h * 0.16], 'rgba(160,40,20,.45)', 1.5);
  // badan
  bodyPath();
  paint(c, '#f2643a', 3);
  c.save();
  bodyPath();
  c.clip();
  // jalur melintang putih-merah jambu (sedikit melengkung)
  c.strokeStyle = 'rgba(255,214,196,.95)';
  c.lineCap = 'round';
  c.lineWidth = Math.max(2, h * 0.09);
  for (let i = 1; i <= 6; i++) {
    const sx = x0 + (xb - x0) * (i / 7) + h * 0.12;
    c.beginPath();
    c.moveTo(sx - h * 0.06, -h * 0.6);
    c.quadraticCurveTo(sx + h * 0.1, 0, sx - h * 0.06, h * 0.6);
    c.stroke();
  }
  // kilauan lembut di tengah
  c.fillStyle = 'rgba(255,255,255,.3)';
  c.beginPath();
  c.ellipse(x0 + (xb - x0) * 0.3, 0, (xb - x0) * 0.16, h * 0.09, 0, 0, Math.PI * 2);
  c.ellipse(x0 + (xb - x0) * 0.68, 0, (xb - x0) * 0.14, h * 0.08, 0, 0, Math.PI * 2);
  c.fill();
  c.restore();
  c.restore();
}

// ---------- isi gulungan: 3 hiris timun / telur ----------
/** Sebatang timun (kulit hijau gelap, isi hijau muda, biji). (x, y) = tengah. */
function cucumberStick(c: Ctx, x: number, y: number, len: number, th: number, tilt: number) {
  c.save();
  c.translate(x, y);
  c.rotate(tilt);
  box(c, -len / 2, -th / 2, len, th, th * 0.4, '#3f8f3a', 2.5);
  rr(c, -len / 2 + 3, -th / 2 + 3, len - 6, th * 0.52, th * 0.25);
  c.fillStyle = '#d6f5b8';
  c.fill();
  c.fillStyle = '#9ccc6a';
  const seeds = Math.max(4, Math.round(len / 14));
  for (let k = 0; k < seeds; k++) (c.beginPath(), c.ellipse(-len / 2 + 8 + k * ((len - 16) / (seeds - 1)), -th / 2 + 3 + th * 0.26, 1.6, 1.1, 0, 0, Math.PI * 2), c.fill());
  c.restore();
}

/**
 * Kepingan tamago (telur dadar gulung): bucu bulat, kuning di tengah & oren di tepi,
 * garis lapisan melengkung + kilauan. (x, y) = tengah; len = panjang, th = tebal (arah lapisan).
 */
export function tamagoBlock(c: Ctx, x: number, y: number, len: number, th: number, tilt = 0, lw = 2.5) {
  c.save();
  c.translate(x, y);
  c.rotate(tilt);
  const r = Math.min(len, th) * 0.32;
  const g = c.createLinearGradient(0, -th / 2, 0, th / 2);
  g.addColorStop(0, '#f2a31c');
  g.addColorStop(0.28, '#ffd24a');
  g.addColorStop(0.62, '#ffdc5e');
  g.addColorStop(1, '#ee9814');
  rr(c, -len / 2, -th / 2, len, th, r);
  paint(c, '#ffd24a', lw);
  c.fillStyle = g;
  rr(c, -len / 2, -th / 2, len, th, r);
  c.fill();
  c.strokeStyle = O;
  c.lineWidth = lw;
  c.stroke();
  // garis lapisan melengkung
  c.save();
  rr(c, -len / 2, -th / 2, len, th, r);
  c.clip();
  c.strokeStyle = 'rgba(212,118,10,.5)';
  c.lineWidth = Math.max(1, th * 0.07);
  c.beginPath();
  for (const f of [-0.2, 0.12]) {
    const yy = th * f;
    c.moveTo(-len / 2 + r * 0.6, yy);
    c.quadraticCurveTo(0, yy + th * 0.12, len / 2 - r * 0.6, yy);
  }
  c.stroke();
  // kilauan
  c.strokeStyle = 'rgba(255,255,255,.65)';
  c.lineWidth = Math.max(1, th * 0.08);
  c.lineCap = 'round';
  c.beginPath();
  c.moveTo(-len / 2 + r, -th * 0.32);
  c.lineTo(-len / 2 + len * 0.42, -th * 0.34);
  c.stroke();
  c.restore();
  c.restore();
}

/** Sekeping tamago untuk isi gulungan. */
function eggStrip(c: Ctx, x: number, y: number, len: number, th: number, tilt: number) {
  tamagoBlock(c, x, y, len, th, tilt, 2.5);
}

/**
 * 3 hiris PANJANG (setiap satu dari hujung ke hujung) ditindih sedikit atas satu sama lain,
 * supaya jelas ada banyak hirisan panjang timun / telur dalam gulungan.
 */
function threeSlices(c: Ctx, cx: number, y: number, totalW: number, kind: 'cucumber' | 'egg') {
  const th = kind === 'cucumber' ? 12 : 13;
  const rows: [number, number, number][] = [
    [-th * 0.62, -4, -0.012], // [anjakan y, anjakan x, condong]
    [th * 0.62, 5, 0.01],
    [0, 0, 0],
  ];
  for (const [dy, dx, tilt] of rows) {
    if (kind === 'cucumber') cucumberStick(c, cx + dx, y + dy, totalW, th, tilt);
    else eggStrip(c, cx + dx, y + dy, totalW, th, tilt);
  }
}

// ---------- bahan (ikon butang & kad resipi) ----------
export function drawIngredient(c: Ctx, id: IngredientId, cx: number, cy: number, s: number) {
  const k = s / 64;
  c.save();
  c.translate(cx, cy);
  c.scale(k, k);
  c.lineJoin = 'round';
  switch (id) {
    case 'rice':
      ell(c, 0, 12, 26, 12, '#c9965f', 3);
      c.beginPath();
      c.moveTo(-26, 10);
      c.quadraticCurveTo(-24, 28, 0, 28);
      c.quadraticCurveTo(24, 28, 26, 10);
      paint(c, '#c9965f', 3);
      c.beginPath();
      c.ellipse(0, 8, 23, 18, 0, Math.PI, 0);
      paint(c, RICE, 3);
      c.fillStyle = '#e8dcc6';
      for (const [x, y] of [[-10, -2], [-2, -6], [8, -3], [-14, 4], [4, 3], [14, 4], [-4, 1]]) (c.beginPath(), c.ellipse(x, y, 2.6, 1.6, 0.4, 0, 7), c.fill());
      line(c, [-22, 18, 22, 18], 'rgba(94,58,28,.45)', 2);
      break;
    case 'nori':
      c.rotate(-0.12);
      box(c, -24, -22, 48, 44, 5, NORI, 3);
      c.strokeStyle = 'rgba(160,210,170,.25)';
      c.lineWidth = 2;
      c.beginPath();
      for (let y = -14; y < 20; y += 9) (c.moveTo(-18, y), c.lineTo(18, y + 3));
      c.stroke();
      break;
    case 'egg':
      tamagoBlock(c, 0, 0, 50, 30, -0.08, 3);
      break;
    case 'cucumber':
      for (const [x, y] of [[-14, 6], [12, 8], [0, -10]]) {
        ell(c, x, y, 14, 14, '#3f8f3a', 3);
        ell(c, x, y, 10, 10, '#d6f5b8', 0);
        c.fillStyle = '#8fbf5a';
        for (let a = 0; a < 6; a++) (c.beginPath(), c.arc(x + Math.cos(a) * 4, y + Math.sin(a) * 4, 1.3, 0, 7), c.fill());
      }
      break;
    case 'salmon':
      salmonSlice(c, 0, -3, 58, 30, -0.18);
      break;
    case 'shrimp':
      ebiTop(c, 0, 0, 62, 28, -0.22);
      break;
  }
  c.restore();
}

// ---------- isi petak dulang bahan ----------
/** Ruang lukisan petak dulang (unit). */
export const TRAY_CELL = { w: 120, h: 60 };

/** Kepingan bahan tersusun di dalam petak dulang (dilihat dari atas), seperti bekas bahan kaunter sushi. */
export function drawTrayContents(c: Ctx, id: IngredientId) {
  c.save();
  c.lineJoin = 'round';
  switch (id) {
    case 'rice':
      riceSheet(c, 60, 31, 100, 44);
      break;
    case 'nori':
      for (let i = 0; i < 4; i++) {
        c.save();
        c.translate(30 + i * 19, 30 + (i % 2) * 2);
        c.rotate(-0.12 + i * 0.05);
        box(c, -22, -20, 44, 40, 3, NORI, 2.5);
        line(c, [-16, -10, 16, -8], 'rgba(160,210,170,.3)', 1.5);
        line(c, [-16, 2, 16, 4], 'rgba(160,210,170,.3)', 1.5);
        c.restore();
      }
      break;
    case 'egg':
      for (let i = 0; i < 4; i++) tamagoBlock(c, 24 + i * 24, 30, 48, 25, Math.PI / 2 + (i % 2 ? 0.04 : -0.03), 2.5);
      break;
    case 'cucumber':
      for (const [y, dx] of [[15, -2], [30, 3], [45, -1]] as const) cucumberStick(c, 60 + dx, y, 100, 13, 0);
      break;
    case 'salmon':
      for (let i = 0; i < 4; i++) salmonSlice(c, 22 + i * 25, 30, 42, 20, -1.05);
      break;
    case 'shrimp':
      for (const y of [15, 30, 45]) ebiTop(c, 60, y, 92, 18);
      break;
  }
  c.restore();
}

// ---------- perasa atas meja (hiasan) ----------
/** Botol kicap masin / kicap manis, atau piring wasabi. Ruang lukisan 64 unit. */
export function drawCondiment(c: Ctx, kind: 'soySalty' | 'wasabi' | 'soySweet', cx: number, cy: number, s: number) {
  const k = s / 64;
  c.save();
  c.translate(cx, cy);
  c.scale(k, k);
  c.lineJoin = 'round';
  if (kind === 'wasabi') {
    // bekas kecil berisi wasabi + sudu plastik terpacak
    // bayang
    ell(c, 0, 28, 20, 4, 'rgba(74,44,20,.25)', 0);
    // badan bekas (sedikit tirus ke bawah)
    c.beginPath();
    c.moveTo(-18, 4);
    c.lineTo(-15, 25);
    c.quadraticCurveTo(0, 30, 15, 25);
    c.lineTo(18, 4);
    c.closePath();
    paint(c, '#ffffff', 3);
    c.save();
    c.clip();
    c.fillStyle = '#3f8f5a';
    c.fillRect(-20, 12, 40, 5);
    c.fillStyle = 'rgba(38,50,77,.08)';
    c.fillRect(6, 0, 14, 30);
    c.restore();
    // bibir bekas + permukaan wasabi di dalam
    ell(c, 0, 4, 18, 6, '#eef2f8', 3);
    ell(c, 0, 4.5, 14.5, 4.2, '#8cc63f', 0);
    // timbunan wasabi kecil
    c.beginPath();
    c.ellipse(-3, 4, 11, 8, 0, Math.PI, 0);
    paint(c, '#8cc63f', 2.5);
    c.fillStyle = '#a6d95a';
    for (const [x, y] of [[-8, 0], [-3, -3], [2, 0], [-5, 2]]) (c.beginPath(), c.arc(x, y, 1.3, 0, 7), c.fill());
    // sudu plastik: pangkal tenggelam dalam wasabi, pemegang menjulur ke atas-kanan
    c.lineCap = 'round';
    c.strokeStyle = O;
    c.lineWidth = 7;
    c.beginPath();
    c.moveTo(4, 1);
    c.lineTo(20, -24);
    c.stroke();
    c.strokeStyle = '#fbe9a8';
    c.lineWidth = 3.5;
    c.stroke();
    ell(c, 3, 2.5, 6, 3.4, '#fbe9a8', 2.5, -0.55);
    c.fillStyle = '#8cc63f'; // wasabi atas mangkuk sudu
    c.beginPath();
    c.ellipse(2.5, 3, 3.6, 1.8, -0.55, 0, Math.PI * 2);
    c.fill();
    c.fillStyle = 'rgba(255,255,255,.7)';
    c.fillRect(16, -21, 1.6, 6);
  } else {
    const sweet = kind === 'soySweet';
    // botol kaca berisi kicap
    c.beginPath();
    c.moveTo(-6, -22);
    c.lineTo(-6, -14);
    c.quadraticCurveTo(-15, -8, -15, 0);
    c.lineTo(-15, 22);
    c.quadraticCurveTo(-15, 28, -9, 28);
    c.lineTo(9, 28);
    c.quadraticCurveTo(15, 28, 15, 22);
    c.lineTo(15, 0);
    c.quadraticCurveTo(15, -8, 6, -14);
    c.lineTo(6, -22);
    c.closePath();
    paint(c, sweet ? '#5a2f15' : '#3b2216', 3);
    c.fillStyle = 'rgba(255,255,255,.35)';
    c.fillRect(-11, -2, 3, 22);
    // label
    box(c, -12, 4, 24, 14, 2, '#fff3d6', 2);
    c.fillStyle = sweet ? '#f2a03a' : N.red;
    c.fillRect(-11, 5, 22, 4);
    shuriken(c, 0, 13, 3.2, sweet ? '#f2a03a' : N.red, 0);
    // penutup
    box(c, -8, -30, 16, 10, 3, sweet ? '#f2a03a' : N.red, 2.5);
  }
  c.restore();
}

// ---------- sushi siap ----------
/**
 * Kepingan nasi leper segi empat panjang, nipis (dilihat dari atas): tepi beralun daripada butir nasi,
 * butir rapat yang timbul (bayang kecil di bawah setiap butir) — nampak macam nasi ditekan, bukan kertas.
 */
function riceSheet(c: Ctx, cx: number, cy: number, w: number, h: number) {
  const x = cx - w / 2;
  const y = cy - h / 2;
  // tepi beralun: bentuk kepingan + bonjolan butir di sekeliling
  const bumps: [number, number][] = [];
  const step = 9;
  for (let bx = x + 6; bx <= x + w - 6; bx += step) bumps.push([bx, y + 2], [bx + step / 2, y + h - 2]);
  for (let by = y + 8; by <= y + h - 8; by += step) bumps.push([x + 2, by], [x + w - 2, by + step / 2]);
  c.save();
  c.strokeStyle = O;
  c.lineWidth = 6;
  c.beginPath();
  c.roundRect(x, y, w, h, 8);
  for (const [px, py] of bumps) (c.moveTo(px + 5, py), c.ellipse(px, py, 5, 3.6, 0, 0, Math.PI * 2));
  c.stroke();
  c.fillStyle = RICE;
  c.fill();
  // bayang lembut ke arah bawah kepingan
  const g = c.createLinearGradient(0, y, 0, y + h);
  g.addColorStop(0, 'rgba(255,255,255,0)');
  g.addColorStop(1, 'rgba(200,180,150,.35)');
  c.fillStyle = g;
  c.fill();
  // butir nasi timbul (jujukan R2: taburan rata, tetap)
  const n = Math.round((w * h) / 70);
  for (let i = 0; i < n; i++) {
    const gx = x + 5 + (w - 10) * ((0.5 + i * 0.7548776662) % 1);
    const gy = y + 5 + (h - 10) * ((0.5 + i * 0.569840291) % 1);
    const rot = ((i * 2.399) % Math.PI) - Math.PI / 2;
    c.fillStyle = 'rgba(170,140,100,.4)'; // bayang butir
    c.beginPath();
    c.ellipse(gx + 0.6, gy + 1.4, 4.2, 2.4, rot, 0, Math.PI * 2);
    c.fill();
    c.fillStyle = '#ffffff';
    c.strokeStyle = 'rgba(160,135,100,.55)';
    c.lineWidth = 0.9;
    c.beginPath();
    c.ellipse(gx, gy, 4, 2.3, rot, 0, Math.PI * 2);
    c.fill();
    c.stroke();
  }
  c.restore();
}

/** Kepingan sushi bulat: pembalut (nori / nasi), lapisan nasi, isi di tengah. */
function makiSlice(c: Ctx, x: number, y: number, r: number, fillings: string[], wrap = NORI) {
  ell(c, x, y, r, r, wrap, 3);
  ell(c, x, y, r * 0.78, r * 0.78, RICE, 0);
  c.fillStyle = '#e8dcc6';
  for (let a = 0; a < 6; a++) (c.beginPath(), c.ellipse(x + Math.cos(a) * r * 0.6, y + Math.sin(a) * r * 0.6, 1.8, 1.1, a, 0, 7), c.fill());
  if (fillings.length === 1) ell(c, x, y, r * 0.34, r * 0.34, fillings[0], 2);
  else fillings.forEach((col, i) => ell(c, x + (i ? r * 0.2 : -r * 0.2), y, r * 0.24, r * 0.3, col, 2));
}

const FILL: Record<string, string> = { cucumber: CUKE, salmon: SALMON, egg: EGG, shrimp: SHRIMP };

/** Sushi siap (tanpa pinggan), berpusat pada (x, y), saiz kira-kira s. */
export function drawFinished(c: Ctx, recipe: Recipe, x: number, y: number, s: number) {
  c.save();
  c.lineJoin = 'round';
  // Semua sushi digulung dengan tikar → kepingan bulat. Resipi tanpa nori: pembalut nasi, isi di tengah.
  const fills = recipe.steps.filter((st) => st !== 'nori' && st !== 'rice').map((st) => FILL[st] ?? '#ccc');
  const wrap = recipe.steps.includes('nori') ? NORI : RICE;
  const r = s * 0.2;
  makiSlice(c, x - r * 2.1, y + r * 0.3, r, fills, wrap);
  makiSlice(c, x + r * 2.1, y + r * 0.3, r, fills, wrap);
  makiSlice(c, x, y - r * 0.15, r, fills, wrap);
  c.restore();
}

export function drawPlate(c: Ctx, x: number, y: number, s: number, recipe: Recipe | null) {
  ell(c, x, y + s * 0.06, s * 0.5, s * 0.24, '#e8f1fb', 3);
  ell(c, x, y + s * 0.04, s * 0.36, s * 0.15, '#ffffff', 0);
  if (recipe) drawFinished(c, recipe, x, y - s * 0.02, s * 0.62);
}

// ---------- tikar penyediaan (meja bawah) ----------
export const MAT = { w: 320, h: 130 };

/** Tikar buluh rata. bottom = tepi bawah bahagian yang masih rata (semasa menggulung, ia naik). */
function bambooMat(c: Ctx, bottom = MAT.h - 10) {
  const { w, h } = MAT;
  if (bottom <= 18) return;
  box(c, 14, 10, w - 28, bottom - 10, 8, '#e6c78e', 3);
  c.save();
  c.beginPath();
  c.rect(14, 10, w - 28, bottom - 12);
  c.clip();
  c.strokeStyle = 'rgba(140,100,40,.45)';
  c.lineWidth = 2;
  c.beginPath();
  for (let x = 26; x < w - 20; x += 11) (c.moveTo(x, 14), c.lineTo(x, h - 14));
  c.stroke();
  line(c, [18, h * 0.32, w - 18, h * 0.32], 'rgba(94,58,28,.35)', 2);
  line(c, [18, h * 0.68, w - 18, h * 0.68], 'rgba(94,58,28,.35)', 2);
  c.restore();
}

/**
 * Lukis tikar + sushi separa siap. steps = bahan yang sudah diletak.
 * roll (0..1) = animasi gulung/tekan; done = tunjuk sushi siap atas pinggan.
 */
export function drawMat(c: Ctx, recipe: Recipe | null, steps: IngredientId[], roll: number | null, time: number) {
  const { w, h } = MAT;
  c.clearRect(0, 0, w, h);
  c.lineJoin = 'round';
  if (!recipe || (!steps.length && roll === null) || (roll !== null && roll >= 0.75)) bambooMat(c);
  if (!recipe || (!steps.length && roll === null)) return;
  const cx = w / 2;
  const cy = h / 2 + 4;
  if (roll !== null && roll >= 0.75) {
    // siap: pinggan dengan sushi siap, berdenyut sedikit
    const k = 1 + Math.sin(Math.min(1, (roll - 0.75) / 0.25) * Math.PI) * 0.08;
    c.save();
    c.translate(cx, cy);
    c.scale(k, k);
    drawPlate(c, 0, 0, 120, recipe);
    c.restore();
    for (let i = 0; i < 4; i++) {
      const a = time * 3 + i * 1.6;
      shuriken(c, cx + Math.cos(a) * 70, cy - 10 + Math.sin(a) * 30, 5, N.gold, 0, a);
    }
    return;
  }
  // isi sushi atas tikar (kandungan penuh); semasa menggulung, hanya bahagian di atas gulungan kelihatan
  const nigiriKind = recipe.kind === 'nigiri';
  const box0 = nigiriKind ? { w: 150, h: 60, y: cy + 4 } : { w: 200, h: 84, y: cy };
  const top = box0.y - box0.h / 2;
  const bot = box0.y + box0.h / 2;
  const fills = steps.filter((st) => st !== 'nori' && st !== 'rice');
  const t = roll === null ? 0 : Math.min(1, roll / 0.75); // 0..1 animasi gulung
  const rollPhase = Math.min(1, t / 0.8); // gulungan bergerak dari bawah ke atas
  const logY = bot + 6 - rollPhase * (bot - top + 4);
  const logH = 16 + rollPhase * 26;
  // tikar YANG SAMA menggulung: bahagian rata berakhir di gulungan (bawahnya kosong)
  bambooMat(c, roll === null ? MAT.h - 10 : logY);

  c.save();
  if (roll !== null) {
    c.beginPath();
    c.rect(0, 0, w, logY);
    c.clip();
  }
  if (nigiriKind) {
    if (steps.includes('rice')) riceSheet(c, cx, box0.y, box0.w, box0.h);
    if (steps.includes('egg')) {
      tamagoBlock(c, cx, box0.y, 116, 34, 0, 3);
    }
    if (steps.includes('shrimp')) ebiTop(c, cx + 10, box0.y, 172, 52);
  } else {
    const x0 = cx - box0.w / 2;
    if (steps.includes('nori')) box(c, x0, top, box0.w, box0.h, 4, NORI, 3);
    if (steps.includes('rice')) riceSheet(c, cx, box0.y - 4, box0.w - 18, box0.h - 26);
    fills.forEach((st, i) => {
      const fy = box0.y - 4 + i * 22 - (fills.length - 1) * 11;
      if (st === 'salmon') salmonSlice(c, cx, fy - 4, box0.w - 50, 28);
      else if (st === 'cucumber' || st === 'egg') threeSlices(c, cx, fy, box0.w - 46, st);
      else box(c, x0 + 22, fy - 5, box0.w - 44, 10, 5, FILL[st] ?? '#ccc', 2.5);
    });
  }
  c.restore();

  if (roll !== null) {
    // tikar yang tergulung (selebar tikar, tiada hujung): naik dari bawah, makin tebal bila isi tergulung masuk
    const lx = 14;
    const lw = w - 28;
    const squeeze = t > 0.8 ? 1 - Math.sin(((t - 0.8) / 0.2) * Math.PI) * 0.12 : 1;
    const lh = logH * squeeze;
    // tepi kiri/kanan lurus seperti tepi tikar (bucu sedikit bulat sahaja) — bukan kapsul silinder
    const cr = Math.min(8, lh * 0.25);
    box(c, lx, logY - lh / 2, lw, lh, cr, '#e6c78e', 3);
    c.save();
    c.beginPath();
    c.roundRect(lx, logY - lh / 2, lw, lh, cr);
    c.clip();
    c.strokeStyle = 'rgba(140,100,40,.55)';
    c.lineWidth = 2;
    c.beginPath();
    for (let x = 26; x < w - 20; x += 11) (c.moveTo(x, logY - lh / 2), c.lineTo(x, logY + lh / 2));
    c.stroke();
    // lengkung cahaya & bayang supaya nampak bulat
    c.fillStyle = 'rgba(255,255,255,.35)';
    c.fillRect(lx, logY - lh * 0.32, lw, lh * 0.14);
    c.fillStyle = 'rgba(94,58,28,.22)';
    c.fillRect(lx, logY + lh * 0.18, lw, lh * 0.32);
    c.restore();

  }
}

// ---------- pentas: lantai, tali sawat segi empat, chef & pelanggan ----------
export function drawStageBackground(c: Ctx) {
  floor(c, 0, 0, STAGE.w, STAGE.h, 'checker', '#fff6ec', '#ffe3cf');
  // dinding atas & noren
  c.fillStyle = '#fffaf0';
  c.fillRect(0, 0, STAGE.w, 26);
  box(c, -4, 22, STAGE.w + 8, 8, 0, N.wood, 3);
  for (let i = 0; i < 6; i++) {
    const nx = 20 + i * 100;
    if (nx > 160 && nx < 440) continue;
    rr(c, nx, -4, 46, 28, 4);
    paint(c, i % 2 ? N.red : '#3d4c7a', 2.5);
    shuriken(c, nx + 23, 10, 6, N.gold, 1);
  }
}

export function drawConveyor(c: Ctx, track: SquareTrack, offset: number) {
  const { x, y, w, h, r } = TRACK;
  const half = BELT_W / 2;
  // rangka kayu luar
  rr(c, x - half - 12, y - half - 12, w + BELT_W + 24, h + BELT_W + 24, r + half + 12);
  paint(c, N.woodLight, 3);
  // tali (jalur kelabu-biru)
  rr(c, x - half, y - half, w + BELT_W, h + BELT_W, r + half);
  paint(c, '#9fb3c8', 2.5);
  // slat bergerak (menunjukkan gerakan ikut jam di keempat-empat sisi)
  c.strokeStyle = 'rgba(38,50,77,.28)';
  c.lineWidth = 2.5;
  c.beginPath();
  const gap = 18;
  for (let s = ((offset % gap) + gap) % gap; s < track.length; s += gap) {
    const p = track.pointAt(s);
    const nx = -Math.sin(p.angle);
    const ny = Math.cos(p.angle);
    c.moveTo(p.x - nx * (half - 4), p.y - ny * (half - 4));
    c.lineTo(p.x + nx * (half - 4), p.y + ny * (half - 4));
  }
  c.stroke();
  // anak panah arah (kecil, di tengah setiap sisi)
  c.fillStyle = 'rgba(255,255,255,.85)';
  for (const f of [0.125, 0.375, 0.625, 0.875]) {
    const p = track.pointAt(track.length * f - 30);
    c.save();
    c.translate(p.x, p.y);
    c.rotate(p.angle);
    c.beginPath();
    c.moveTo(7, 0);
    c.lineTo(-5, -6);
    c.lineTo(-5, 6);
    c.closePath();
    c.fill();
    c.restore();
  }
  // ruang tengah terbuka untuk chef (lantai dalam + rangka dalam)
  rr(c, x + half, y + half, w - BELT_W, h - BELT_W, Math.max(6, r - half));
  paint(c, N.woodLight, 3);
  rr(c, x + half + 8, y + half + 8, w - BELT_W - 16, h - BELT_W - 16, Math.max(4, r - half - 6));
  paint(c, '#f6e2c0', 2);
}

/** Rak kecil di luar tali sawat tempat pinggan diletak untuk pelanggan, dan bangku. */
export function drawSeatFurniture(c: Ctx, seat: { x: number; y: number; dish: { x: number; y: number }; facing: 'left' | 'right' }) {
  // bangku
  ell(c, seat.x, seat.y + 2, 20, 8, N.woodDark, 2.5);
  // rak hidangan
  const lx = seat.facing === 'right' ? seat.dish.x - 30 : seat.dish.x - 30;
  box(c, lx, seat.dish.y - 4, 60, 22, 6, N.woodLight, 3);
  box(c, lx + 4, seat.dish.y + 14, 52, 8, 3, N.wood, 2);
}

/** Gelembung pesanan di atas kepala pelanggan: sushi + lencana nombor. */
export function drawOrderBubble(c: Ctx, x: number, y: number, recipeId: string, badge: number, selected: boolean, pop: number) {
  const recipe = RECIPES[recipeId];
  c.save();
  c.translate(x, y);
  c.scale(pop, pop);
  rr(c, -34, -26, 68, 44, 14);
  paint(c, selected ? '#fff3c4' : '#ffffff', 3, selected ? '#b06a00' : O);
  c.beginPath();
  c.moveTo(-6, 17);
  c.lineTo(0, 27);
  c.lineTo(6, 17);
  paint(c, selected ? '#fff3c4' : '#ffffff', 0);
  c.strokeStyle = selected ? '#b06a00' : O;
  c.lineWidth = 3;
  c.beginPath();
  c.moveTo(-6, 18);
  c.lineTo(0, 27);
  c.lineTo(6, 18);
  c.stroke();
  drawFinished(c, recipe, 0, -2, 50);
  ell(c, -32, -24, 11, 11, selected ? N.red : '#3d4c7a', 2.5);
  c.fillStyle = '#fff';
  c.font = '900 13px system-ui, sans-serif';
  c.textAlign = 'center';
  c.textBaseline = 'middle';
  c.fillText(String(badge), -32, -23);
  c.restore();
}

/** Hati kecil terapung (reaksi gembira pelanggan). */
export function drawHearts(c: Ctx, x: number, y: number, t: number) {
  for (let i = 0; i < 3; i++) {
    const f = (t * 0.9 + i * 0.33) % 1;
    c.globalAlpha = Math.sin(f * Math.PI);
    const hx = x - 14 + i * 14 + Math.sin(t * 4 + i) * 3;
    const hy = y - f * 34;
    c.fillStyle = '#ff6b8b';
    c.beginPath();
    c.moveTo(hx, hy + 5);
    c.bezierCurveTo(hx - 9, hy - 2, hx - 4, hy - 9, hx, hy - 4);
    c.bezierCurveTo(hx + 4, hy - 9, hx + 9, hy - 2, hx, hy + 5);
    c.fill();
  }
  c.globalAlpha = 1;
}

/** Penanda titik muat di sisi bawah tali sawat (arah dari meja penyediaan). */
export function drawLoadMarker(c: Ctx, x: number, y: number, active: boolean, time: number) {
  const bob = active ? Math.sin(time * 6) * 3 : 0;
  c.save();
  c.globalAlpha = active ? 1 : 0.55;
  c.translate(x, y + 40 + bob);
  c.beginPath();
  c.moveTo(0, -12);
  c.lineTo(12, 2);
  c.lineTo(5, 2);
  c.lineTo(5, 12);
  c.lineTo(-5, 12);
  c.lineTo(-5, 2);
  c.lineTo(-12, 2);
  c.closePath();
  paint(c, N.gold, 2.5);
  c.restore();
}

