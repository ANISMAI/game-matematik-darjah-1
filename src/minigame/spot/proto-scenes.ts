// ⚠️ SENI PROTOTAIP — Latihan Mata Ninja.
// Adegan dilukis dengan kod (gaya prop Akademi Ninja) supaya enjin boleh diuji hujung-ke-hujung
// sebelum ilustrasi sebenar siap. GANTIKAN dengan fail imej sebenar: tukar imageA/imageB dalam levels.ts
// kepada URL dan kemas kini koordinat kawasan perbezaan. Fail ini kemudian boleh dibuang.
//
// Setiap adegan: ruang 480×360 unit. Varian 'B' = salinan 'A' dengan perubahan bertanda [beza:<id>],
// sepadan dengan `differences` dalam levels.ts (disahkan oleh ujian perbandingan piksel).
import { drawProp, N, box, ell, rr, paint, line, stick, shuriken, floor, block, bambooClump, outdoorSakura } from '../mall/render.ts';

type Ctx = CanvasRenderingContext2D;
type V = 'A' | 'B';
const O = '#26324d';
export const PROTO_W = 480;
export const PROTO_H = 360;

const prop = (c: Ctx, type: string, x: number, y: number, w: number, h: number, variant?: string) => drawProp(c, { type, x, y, w, h, variant }, 0);

// ---------- Pembantu adegan ----------
function shojiWall(c: Ctx, tone: 'paper' | 'wood' = 'paper') {
  c.fillStyle = tone === 'paper' ? '#fffaf0' : '#d9a66b';
  c.fillRect(0, 0, PROTO_W, 66);
  if (tone === 'paper') {
    c.strokeStyle = 'rgba(154,99,50,.45)';
    c.lineWidth = 1.5;
    c.beginPath();
    for (let x = 20; x < PROTO_W; x += 20) (c.moveTo(x, 10), c.lineTo(x, 58));
    for (let y = 22; y < 58; y += 16) (c.moveTo(0, y), c.lineTo(PROTO_W, y));
    c.stroke();
  } else {
    c.strokeStyle = 'rgba(94,58,28,.4)';
    c.lineWidth = 2;
    c.beginPath();
    for (let y = 18; y < 58; y += 12) (c.moveTo(0, y), c.lineTo(PROTO_W, y));
    c.stroke();
  }
  for (let x = 0; x <= PROTO_W; x += 120) box(c, x - 5, 6, 10, 56, 2, N.wood, 2.5);
  box(c, -6, -4, PROTO_W + 12, 12, 0, N.woodDark, 3);
  box(c, -6, 58, PROTO_W + 12, 10, 0, N.wood, 3);
}

function hangLantern(c: Ctx, x: number, top: number, color: string) {
  line(c, [x, -2, x, top], O, 2);
  ell(c, x, top + 20, 14, 18, color, 2.5);
  c.strokeStyle = 'rgba(38,50,77,.35)';
  c.lineWidth = 1.5;
  c.beginPath();
  for (const dy of [-10, 0, 10]) (c.moveTo(x - 13, top + 20 + dy), c.quadraticCurveTo(x, top + 23 + dy, x + 13, top + 20 + dy));
  c.stroke();
  box(c, x - 7, top + 1, 14, 5, 1, N.ink, 2);
  box(c, x - 7, top + 35, 14, 5, 1, N.ink, 2);
  line(c, [x, top + 40, x, top + 48], N.gold, 3);
}

function wallBanner(c: Ctx, x: number, y: number, w: number, h: number, color: string, mark: boolean) {
  stick(c, [x - 4, y, x + w + 4, y], N.woodDark, 3);
  rr(c, x, y + 2, w, h, 3);
  paint(c, color, 2.5);
  c.fillStyle = 'rgba(255,255,255,.25)';
  c.fillRect(x + 4, y + 6, 3, h - 10);
  if (mark) shuriken(c, x + w / 2, y + 2 + h / 2, Math.min(w, h) * 0.26, N.gold, 1.5);
}

function ringMat(c: Ctx, cx: number, cy: number, rx: number, ry: number) {
  ell(c, cx, cy, rx, ry, '#fff3d6', 3);
  ell(c, cx, cy, rx - 10, ry - 7, '#fff3d6', 0);
  c.strokeStyle = N.red;
  c.lineWidth = 5;
  c.beginPath();
  c.ellipse(cx, cy, rx - 12, ry - 9, 0, 0, Math.PI * 2);
  c.stroke();
  c.globalAlpha = 0.35;
  shuriken(c, cx, cy, ry * 0.55, N.red, 0);
  c.globalAlpha = 1;
}

function noticeBoard(c: Ctx, x: number, y: number) {
  box(c, x, y, 100, 50, 4, N.woodLight, 3);
  box(c, x + 6, y + 6, 88, 38, 2, '#d9b483', 2);
  const papers: [number, number, string][] = [[x + 12, y + 10, '#fffaf0'], [x + 40, y + 13, '#ffe08a'], [x + 68, y + 9, '#c3eedf']];
  for (const [px, py, col] of papers) {
    box(c, px, py, 22, 26, 2, col, 2);
    line(c, [px + 4, py + 9, px + 18, py + 9], 'rgba(43,43,58,.55)', 1.5);
    line(c, [px + 4, py + 15, px + 15, py + 15], 'rgba(43,43,58,.55)', 1.5);
    ell(c, px + 11, py + 2, 2.5, 2.5, N.red, 1);
  }
}

function sleepingCat(c: Ctx, x: number, y: number) {
  c.fillStyle = 'rgba(38,50,77,.16)';
  c.beginPath();
  c.ellipse(x, y + 10, 24, 6, 0, 0, Math.PI * 2);
  c.fill();
  c.lineCap = 'round';
  c.strokeStyle = O;
  c.lineWidth = 8;
  c.beginPath();
  c.arc(x + 4, y + 2, 15, 0.2, 1.9);
  c.stroke();
  c.strokeStyle = '#ffb36b';
  c.lineWidth = 4;
  c.stroke();
  ell(c, x, y, 20, 13, '#ffb36b', 2.5);
  c.strokeStyle = '#e58a3a';
  c.lineWidth = 2.5;
  c.beginPath();
  for (const dx of [-6, 0, 6]) (c.moveTo(x + dx, y - 11), c.lineTo(x + dx + 2, y - 4));
  c.stroke();
  for (const s of [-1, 1]) {
    c.beginPath();
    c.moveTo(x - 16 + s * 6, y - 13);
    c.lineTo(x - 16 + s * 9, y - 22);
    c.lineTo(x - 16 + s * 1, y - 16);
    c.closePath();
    paint(c, '#ffb36b', 2);
  }
  ell(c, x - 16, y - 6, 10, 9, '#ffb36b', 2.5);
  line(c, [x - 21, y - 6, x - 17, y - 5], O, 1.5);
  line(c, [x - 14, y - 5, x - 10, y - 6], O, 1.5);
  ell(c, x - 15, y - 1, 1.5, 1.2, '#f08a7e', 0);
}

function flowerPatch(c: Ctx, x: number, y: number, color: string) {
  for (const [dx, dy] of [[-18, 6], [0, 10], [18, 6], [-9, -4], [10, -6]]) ell(c, x + dx, y + dy, 10, 6, N.bambooDark, 2, 0.3);
  for (const [dx, dy] of [[-16, -2], [2, 2], [18, -2], [-6, -12], [12, -14]]) {
    for (let k = 0; k < 5; k++) {
      const a = (k / 5) * Math.PI * 2;
      ell(c, x + dx + Math.cos(a) * 4.5, y + dy + Math.sin(a) * 4.5, 3.6, 3.6, color, 1.2);
    }
    ell(c, x + dx, y + dy, 2.5, 2.5, '#ffd24d', 1);
  }
}

function rock(c: Ctx, x: number, y: number, rx: number, ry: number) {
  c.fillStyle = 'rgba(38,50,77,.16)';
  c.beginPath();
  c.ellipse(x + 3, y + ry - 2, rx + 2, ry * 0.5, 0, 0, Math.PI * 2);
  c.fill();
  ell(c, x, y, rx, ry, N.stone, 2.5);
  ell(c, x - rx * 0.35, y - ry * 0.35, rx * 0.35, ry * 0.25, '#ece9e2', 0);
}

function bird(c: Ctx, x: number, y: number) {
  stick(c, [x + 9, y - 2, x + 18, y - 8], '#4f86c6', 3);
  ell(c, x, y, 11, 9, '#4f86c6', 2.5);
  ell(c, x - 8, y - 7, 7, 7, '#4f86c6', 2.5);
  ell(c, x - 1, y + 3, 6, 4, '#bfe0ff', 0);
  c.beginPath();
  c.moveTo(x - 14, y - 8);
  c.lineTo(x - 21, y - 5);
  c.lineTo(x - 14, y - 4);
  c.closePath();
  paint(c, '#ffb020', 1.5);
  ell(c, x - 10, y - 9, 1.6, 1.6, O, 0);
  line(c, [x - 2, y + 9, x - 2, y + 12], O, 1.5);
  line(c, [x + 3, y + 9, x + 3, y + 12], O, 1.5);
}

function frog(c: Ctx, x: number, y: number) {
  ell(c, x, y + 2, 13, 9, '#5fbf4a', 2.5);
  ell(c, x - 6, y - 7, 5, 5, '#5fbf4a', 2.5);
  ell(c, x + 6, y - 7, 5, 5, '#5fbf4a', 2.5);
  ell(c, x - 6, y - 7, 2.5, 2.5, '#fff', 0);
  ell(c, x + 6, y - 7, 2.5, 2.5, '#fff', 0);
  ell(c, x - 6, y - 7, 1.3, 1.3, O, 0);
  ell(c, x + 6, y - 7, 1.3, 1.3, O, 0);
  c.strokeStyle = O;
  c.lineWidth = 1.5;
  c.beginPath();
  c.arc(x, y + 1, 5, 0.3, Math.PI - 0.3);
  c.stroke();
}

function kettle(c: Ctx, x: number, y: number, color: string) {
  c.strokeStyle = O;
  c.lineWidth = 6;
  c.beginPath();
  c.arc(x, y - 12, 12, Math.PI * 1.05, Math.PI * 1.95);
  c.stroke();
  c.strokeStyle = N.ink;
  c.lineWidth = 3;
  c.stroke();
  c.beginPath();
  c.moveTo(x + 12, y + 2);
  c.lineTo(x + 24, y - 8);
  c.lineTo(x + 26, y - 4);
  c.lineTo(x + 14, y + 8);
  c.closePath();
  paint(c, color, 2.5);
  ell(c, x, y + 4, 16, 12, color, 2.5);
  ell(c, x, y - 6, 8, 3, N.ink, 2);
  ell(c, x, y - 9, 2.5, 2.5, N.gold, 1.5);
  c.fillStyle = 'rgba(255,255,255,.35)';
  c.fillRect(x - 10, y, 4, 7);
}

function onigiri(c: Ctx, x: number, y: number) {
  c.beginPath();
  c.moveTo(x, y - 12);
  c.quadraticCurveTo(x + 11, y + 6, x + 10, y + 7);
  c.lineTo(x - 10, y + 7);
  c.quadraticCurveTo(x - 11, y + 6, x, y - 12);
  paint(c, '#ffffff', 2);
  box(c, x - 5, y + 1, 10, 6, 1, N.ink, 0);
}

function riceSack(c: Ctx, x: number, y: number) {
  c.fillStyle = 'rgba(38,50,77,.16)';
  c.beginPath();
  c.ellipse(x, y + 18, 22, 6, 0, 0, Math.PI * 2);
  c.fill();
  c.beginPath();
  c.moveTo(x - 18, y + 18);
  c.quadraticCurveTo(x - 24, y - 6, x - 9, y - 16);
  c.lineTo(x + 9, y - 16);
  c.quadraticCurveTo(x + 24, y - 6, x + 18, y + 18);
  c.closePath();
  paint(c, '#f1e3c4', 2.5);
  ell(c, x, y - 18, 9, 4, '#f1e3c4', 2);
  line(c, [x - 9, y - 13, x + 9, y - 13], N.red, 3);
  box(c, x - 8, y - 2, 16, 12, 2, '#fffaf0', 1.5);
  ell(c, x, y + 4, 3, 3, N.red, 0);
}

function mat(c: Ctx, x: number, y: number, w: number, h: number, color: string) {
  box(c, x, y, w, h, 6, color, 2.5);
  c.strokeStyle = 'rgba(255,255,255,.4)';
  c.lineWidth = 3;
  c.beginPath();
  for (let sx = x + 14; sx < x + w - 6; sx += 14) (c.moveTo(sx, y + 6), c.lineTo(sx, y + h - 6));
  c.stroke();
}

function candle(c: Ctx, x: number, y: number, lit: boolean) {
  c.fillStyle = 'rgba(38,50,77,.16)';
  c.beginPath();
  c.ellipse(x, y + 2, 16, 5, 0, 0, Math.PI * 2);
  c.fill();
  ell(c, x, y, 14, 5, N.woodDark, 2.5);
  box(c, x - 3, y - 26, 6, 26, 2, N.woodDark, 2);
  ell(c, x, y - 26, 11, 4, N.gold, 2);
  box(c, x - 5, y - 44, 10, 18, 3, '#fffaf0', 2);
  line(c, [x, y - 44, x, y - 48], O, 1.5);
  if (lit) {
    const g = c.createRadialGradient(x, y - 54, 1, x, y - 54, 14);
    g.addColorStop(0, 'rgba(255,214,120,.8)');
    g.addColorStop(1, 'rgba(255,214,120,0)');
    c.fillStyle = g;
    c.fillRect(x - 14, y - 68, 28, 28);
    c.beginPath();
    c.moveTo(x, y - 62);
    c.quadraticCurveTo(x + 6, y - 52, x, y - 48);
    c.quadraticCurveTo(x - 6, y - 52, x, y - 62);
    paint(c, '#ff9a2e', 1.5);
    ell(c, x, y - 52, 1.8, 3, '#fff3c4', 0);
  }
}

function goldKey(c: Ctx, x: number, y: number) {
  ell(c, x - 10, y, 7, 7, N.gold, 2.5);
  ell(c, x - 10, y, 2.5, 2.5, '#c9965f', 1.5);
  stick(c, [x - 3, y, x + 14, y], N.gold, 3);
  stick(c, [x + 10, y, x + 10, y + 5], N.gold, 2);
  stick(c, [x + 14, y, x + 14, y + 5], N.gold, 2);
}

function chest(c: Ctx, x: number, y: number, w: number, h: number, color: string) {
  block(c, x, y, w, h, 26, color, color, 6);
  c.fillStyle = 'rgba(0,0,0,.18)';
  c.fillRect(x + 3, y + h - 30, w - 6, 3);
  box(c, x + w / 2 - 6, y + h - 26, 12, 12, 2, N.gold, 2);
  for (const bx of [x + 10, x + w - 14]) box(c, bx, y - 24, 4, h + 18, 1, N.gold, 1.5);
}

function crate(c: Ctx, x: number, y: number, w: number, h: number) {
  box(c, x, y, w, h, 3, N.woodLight, 2.5);
  box(c, x + 4, y + 4, w - 8, h - 8, 2, N.wood, 1.5);
  line(c, [x + 5, y + 5, x + w - 5, y + h - 5], N.woodDark, 3);
  line(c, [x + w - 5, y + 5, x + 5, y + h - 5], N.woodDark, 3);
}

function cobweb(c: Ctx, x: number, y: number) {
  c.strokeStyle = 'rgba(255,255,255,.95)';
  c.lineWidth = 1.6;
  c.beginPath();
  const R = 40;
  for (let k = 0; k <= 4; k++) {
    const a = (k / 4) * (Math.PI / 2);
    c.moveTo(x, y);
    c.lineTo(x + Math.cos(a) * R, y + Math.sin(a) * R);
  }
  for (const r of [12, 22, 32]) {
    c.moveTo(x + r, y);
    for (let k = 1; k <= 4; k++) {
      const a = (k / 4) * (Math.PI / 2);
      c.lineTo(x + Math.cos(a) * r, y + Math.sin(a) * r);
    }
  }
  c.stroke();
  c.strokeStyle = 'rgba(38,50,77,.5)';
  c.lineWidth = 0.8;
  c.stroke();
  ell(c, x + 22, y + 20, 4, 4, N.ink, 1);
}

function scrollPile(c: Ctx, x: number, y: number) {
  const cols = ['#fff3d6', '#f7c948', '#f08a7e', '#9fc6ef', '#fff3d6'];
  const pos: [number, number][] = [[-24, 6], [0, 8], [24, 6], [-12, -4], [12, -4]];
  pos.forEach(([dx, dy], i) => {
    box(c, x + dx - 14, y + dy - 5, 28, 10, 5, cols[i], 2);
    ell(c, x + dx + 14, y + dy, 3, 5, N.woodDark, 1.5);
  });
}

function lowTable(c: Ctx, x: number, y: number, w: number, h: number) {
  block(c, x, y, w, h, 14, N.woodPale, N.wood, 7);
}

// ---------- Adegan ----------
const SCENES: Record<string, (c: Ctx, v: V) => void> = {
  // Tahap 1 — Dojo latihan asas (3 beza, sangat jelas)
  dojo(c, v) {
    floor(c, 0, 66, PROTO_W, PROTO_H - 66, 'tatami', '#e9e3a8', '#dcd592');
    shojiWall(c);
    wallBanner(c, 216, 8, 48, 52, N.red, v === 'A'); // [beza:sepanduk]
    hangLantern(c, 70, 8, v === 'A' ? N.red : '#4f86c6'); // [beza:tanglung]
    hangLantern(c, 410, 8, N.red);
    ringMat(c, 240, 236, 96, 52);
    prop(c, 'dummy', 50, 130, 40, 32);
    if (v === 'A') prop(c, 'dummy', 130, 130, 40, 32); // [beza:patung]
    prop(c, 'weaponRack', 330, 104, 120, 40);
    prop(c, 'target', 410, 236, 50, 28);
    prop(c, 'cushion', 52, 296, 50, 42, '#e8554a');
    prop(c, 'cushion', 128, 300, 50, 42, '#4f86c6');
    prop(c, 'taiko', 330, 300, 60, 40);
  },

  // Tahap 2 — Kaunter misi ninja (3 beza: objek & warna)
  kaunter(c, v) {
    floor(c, 0, 66, PROTO_W, PROTO_H - 66, 'planks', '#f0cf9f', '#e6c08a');
    shojiWall(c);
    noticeBoard(c, 112, 8);
    wallBanner(c, 398, 8, 44, 52, v === 'A' ? N.red : '#3f8f5a', true); // [beza:bendera]
    prop(c, 'shelf', 262, 104, 120, 40, 'scrolls');
    if (v === 'A') prop(c, 'plant', 38, 112, 40, 36); // [beza:pasu]
    else prop(c, 'stoneLantern', 40, 118, 36, 30);
    prop(c, 'infoDesk', 160, 200, 150, 54);
    prop(c, 'bench', 30, 300, 112, 30);
    prop(c, 'cushion', 290, 292, 50, 42, '#f7c948');
    prop(c, 'cushion', 378, 282, 56, 44, '#4f86c6');
    if (v === 'A') sleepingCat(c, 408, 296); // [beza:kucing]
  },

  // Tahap 3 — Taman buluh akademi (4 beza, imbas seluruh gambar)
  taman(c, v) {
    c.fillStyle = '#a6d97f';
    c.fillRect(0, 0, PROTO_W, PROTO_H);
    c.fillStyle = '#8cc867';
    for (let gy = 8; gy < PROTO_H; gy += 26) for (let gx = (gy / 26) % 2 ? 14 : 0; gx < PROTO_W; gx += 36) c.fillRect(gx, gy, 3, 6);
    for (const [sx, sy] of [[240, 342], [228, 310], [236, 280], [222, 252]] as const) ell(c, sx, sy, 16, 9, N.stone, 2.5);
    for (let x = 30; x <= 450; x += 60) if (v === 'A' || x !== 450) bambooClump(c, x, 40); // [beza:buluh] x=450
    outdoorSakura(c, 92, 120, 46);
    prop(c, 'fountain', 250, 150, 150, 90);
    if (v === 'B') frog(c, 347, 194); // [beza:katak]
    prop(c, 'stoneLantern', 150, 236, 36, 30);
    prop(c, 'bench', 300, 296, 100, 28);
    rock(c, 432, 288, 22, 13);
    if (v === 'A') bird(c, 430, 270); // [beza:burung]
    flowerPatch(c, 92, 326, v === 'A' ? '#ff8fb8' : '#ffd24d'); // [beza:bunga]
  },

  // Tahap 4 — Dapur bento ninja (4 beza, lebih padat)
  dapur(c, v) {
    floor(c, 0, 66, PROTO_W, PROTO_H - 66, 'checker', '#fff6ec', '#ffe3cf');
    shojiWall(c);
    prop(c, 'kitchen', 14, 104, 232, 48);
    prop(c, 'fridge', 256, 104, 60, 50);
    prop(c, 'shelf', 328, 100, 136, 40, 'jars');
    if (v === 'A') riceSack(c, 44, 178); // [beza:guni]
    prop(c, 'serveCounter', 130, 196, 200, 56);
    lowTable(c, 398, 196, 68, 40);
    kettle(c, 432, 186, v === 'A' ? N.red : '#4f86c6'); // [beza:cerek]
    mat(c, 176, 268, 108, 36, v === 'A' ? '#5fb87a' : '#ff9a4d'); // [beza:tikar]
    prop(c, 'roundTable', 40, 290, 58, 44);
    lowTable(c, 352, 300, 74, 44);
    ell(c, 389, 294, 30, 12, '#ffffff', 2.5);
    onigiri(c, 374, 294);
    onigiri(c, 390, 290);
    if (v === 'A') onigiri(c, 405, 296); // [beza:onigiri]
  },

  // Tahap 5 — Stor skrol rahsia (5 beza, kecil tetapi jelas)
  stor(c, v) {
    floor(c, 0, 66, PROTO_W, PROTO_H - 66, 'planks', '#d9a66b', '#cf9a5e');
    shojiWall(c, 'wood');
    if (v === 'B') cobweb(c, 6, 8); // [beza:sawang]
    prop(c, 'shelf', 70, 104, 130, 40, 'scrolls');
    prop(c, 'shelf', 280, 104, 130, 40, 'scrolls');
    candle(c, 240, 180, v === 'A'); // [beza:lilin]
    chest(c, 60, 210, 70, 44, v === 'A' ? N.red : '#4f86c6'); // [beza:peti]
    scrollPile(c, 236, 262);
    if (v === 'A') goldKey(c, 132, 306); // [beza:kunci]
    crate(c, 388, 268, 46, 42);
    crate(c, 434, 268, 40, 42);
    if (v === 'A') crate(c, 404, 228, 40, 38); // [beza:kotak]
    prop(c, 'stoneLantern', 30, 300, 36, 30);
  },
};

/** Lukis adegan prototaip ke kanvas baharu bersaiz w×h piksel. */
export function renderProtoScene(id: string, variant: V, w: number, h: number): HTMLCanvasElement {
  const draw = SCENES[id];
  if (!draw) throw new Error(`Adegan prototaip tidak wujud: ${id}`);
  const cv = document.createElement('canvas');
  cv.width = w;
  cv.height = h;
  const c = cv.getContext('2d')!;
  c.scale(w / PROTO_W, h / PROTO_H);
  c.lineJoin = 'round';
  draw(c, variant);
  return cv;
}
