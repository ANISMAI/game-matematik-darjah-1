// Seni Mini Game Mall — tema AKADEMI NINJA YOU EDU — dilukis secara prosedural pada <canvas>.
// PLACEHOLDER ART: semua lantai, dinding, props & watak di sini adalah seni sementara yang
// konsisten dengan palet. Gantikan melalui spriteRefs dalam config.ts apabila aset sebenar siap.
import { MALL, SHOPS, PAL } from './config.ts';
import type { PropDef, ShopDef, Facing } from './config.ts';
import { allProps, buildingWalls, shopEntrance, shopInterior, shopWalls, FLAT_PROPS } from './engine.ts';
import type { WallPiece } from './engine.ts';
import { t } from './strings.ts';

type Ctx = CanvasRenderingContext2D;
const O = PAL.outline;
const FONT = 'system-ui, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif';

// Palet ninja (kayu, lakuer merah, emas, kertas shoji, sakura, buluh, batu)
const N = {
  wood: '#c98a4b',
  woodLight: '#e8b77a',
  woodPale: '#f2d3a6',
  woodDark: '#8a5a2b',
  woodDeep: '#5e3a1c',
  red: '#d9443a',
  redDark: '#9c2a22',
  gold: '#f7c948',
  paper: '#fffaf0',
  sakura: '#ffb7cf',
  sakuraLight: '#ffdbe8',
  sakuraDark: '#f08db0',
  bamboo: '#7cc35a',
  bambooDark: '#4f9a3a',
  stone: '#d9d5cc',
  stoneDark: '#aaa49a',
  ink: '#2b2b3a',
  navy: '#26324d',
};

// ---------- Pembantu ----------
function rr(c: Ctx, x: number, y: number, w: number, h: number, r: number) {
  c.beginPath();
  c.roundRect(x, y, w, h, Math.max(0, Math.min(r, w / 2, h / 2)));
}
function paint(c: Ctx, fill: string, lw = 3, stroke = O) {
  c.fillStyle = fill;
  c.fill();
  if (lw > 0) {
    c.lineWidth = lw;
    c.strokeStyle = stroke;
    c.lineJoin = 'round';
    c.stroke();
  }
}
function box(c: Ctx, x: number, y: number, w: number, h: number, r: number, fill: string, lw = 3) {
  rr(c, x, y, w, h, r);
  paint(c, fill, lw);
}
function ell(c: Ctx, cx: number, cy: number, rx: number, ry: number, fill: string, lw = 3, rot = 0) {
  c.beginPath();
  c.ellipse(cx, cy, Math.max(rx, 0.1), Math.max(ry, 0.1), rot, 0, Math.PI * 2);
  paint(c, fill, lw);
}
function line(c: Ctx, pts: number[], color: string, lw: number) {
  c.strokeStyle = color;
  c.lineWidth = lw;
  c.lineCap = 'round';
  c.lineJoin = 'round';
  c.beginPath();
  c.moveTo(pts[0], pts[1]);
  for (let i = 2; i < pts.length; i += 2) c.lineTo(pts[i], pts[i + 1]);
  c.stroke();
}
/** Garis tebal bergaris luar (batang, kaki, tiang). */
function stick(c: Ctx, pts: number[], color: string, lw: number) {
  line(c, pts, O, lw + 4);
  line(c, pts, color, lw);
}
function shadow(c: Ctx, x: number, y: number, w: number, h: number) {
  c.fillStyle = PAL.shadow;
  c.beginPath();
  c.ellipse(x + w / 2, y + h - 1, w / 2 + 5, Math.min(12, h / 2.5) + 2, 0, 0, Math.PI * 2);
  c.fill();
}
/** Blok perabot: muka atas dianjak ke atas sebanyak `lift`, muka depan menunjukkan ketinggian. */
function block(c: Ctx, x: number, y: number, w: number, h: number, lift: number, top: string, front: string, r = 7) {
  shadow(c, x, y, w, h);
  rr(c, x, y + h - lift - r, w, lift + r, r);
  paint(c, front);
  rr(c, x, y - lift, w, h, r);
  paint(c, top);
}
function grain(c: Ctx, x: number, y: number, w: number, h: number, step = 7, alpha = 0.22) {
  c.strokeStyle = `rgba(94,58,28,${alpha})`;
  c.lineWidth = 1.2;
  c.beginPath();
  for (let gy = y + step; gy < y + h - 2; gy += step) {
    c.moveTo(x + 4, gy);
    c.quadraticCurveTo(x + w / 2, gy + 2, x + w - 4, gy);
  }
  c.stroke();
}
/** Bintang ninja (shuriken) 4 mata. */
function shuriken(c: Ctx, cx: number, cy: number, r: number, fill: string, lw = 2, rot = 0) {
  c.beginPath();
  for (let i = 0; i < 8; i++) {
    const a = rot + (i * Math.PI) / 4;
    const rad = i % 2 ? r * 0.32 : r;
    c.lineTo(cx + Math.cos(a) * rad, cy + Math.sin(a) * rad);
  }
  c.closePath();
  paint(c, fill, lw);
  ell(c, cx, cy, r * 0.16, r * 0.16, N.navy, 0);
}
function blob(c: Ctx, circles: [number, number, number][], fill: string, light: string) {
  c.strokeStyle = O;
  c.lineWidth = 6;
  for (const [x, y, r] of circles) {
    c.beginPath();
    c.arc(x, y, r, 0, Math.PI * 2);
    c.stroke();
  }
  c.fillStyle = fill;
  for (const [x, y, r] of circles) {
    c.beginPath();
    c.arc(x, y, r, 0, Math.PI * 2);
    c.fill();
  }
  c.fillStyle = light;
  for (const [x, y, r] of circles) {
    c.beginPath();
    c.arc(x - r * 0.3, y - r * 0.35, r * 0.38, 0, Math.PI * 2);
    c.fill();
  }
}
/** Papan tanda kayu (atau sepanduk merah) dengan teks besar. */
function label(c: Ctx, cx: number, cy: number, text: string, size = 18, style: 'wood' | 'red' | 'green' = 'wood') {
  const sty = {
    wood: { bg: '#9a6332', border: '#4a2c14', fg: '#fff3d6' },
    red: { bg: '#c73a2e', border: '#6e1d14', fg: '#ffe08a' },
    green: { bg: '#3f8f5a', border: '#1f4f31', fg: '#fff3d6' },
  }[style];
  c.font = `900 ${size}px ${FONT}`;
  const tw = c.measureText(text).width;
  const h = size + 14;
  const w = tw + size * 1.7;
  const x = cx - w / 2;
  const y = cy - h / 2;
  rr(c, x + 2, y + 4, w, h, 7);
  c.fillStyle = 'rgba(40,24,10,.35)';
  c.fill();
  rr(c, x, y, w, h, 7);
  paint(c, sty.bg, 3, sty.border);
  if (style === 'wood') grain(c, x, y, w, h, 7, 0.28);
  c.fillStyle = 'rgba(255,255,255,.2)';
  c.fillRect(x + 5, y + 3, w - 10, 3);
  for (const nx of [x + 8, x + w - 8]) ell(c, nx, cy, 2.6, 2.6, sty.fg, 1.5, 0);
  c.textAlign = 'center';
  c.textBaseline = 'middle';
  c.fillStyle = 'rgba(40,20,8,.55)';
  c.fillText(text, cx, cy + 2.5);
  c.fillStyle = sty.fg;
  c.fillText(text, cx, cy + 1);
}

// ---------- Lantai ----------
const CARPET_R = 24;
const carpetCache = new Map<string, HTMLCanvasElement>();

/** Jubin corak seigaiha (2r × r) yang boleh diulang tanpa sambungan. */
function carpetPattern(c: Ctx, base: string, ring: string): CanvasPattern {
  const key = base + ring;
  let tile = carpetCache.get(key);
  if (!tile) {
    const r = CARPET_R;
    const k = 4; // resolusi lebih tinggi supaya garisan tajam bila dizum
    tile = document.createElement('canvas');
    tile.width = 2 * r * k;
    tile.height = r * k;
    const t = tile.getContext('2d')!;
    t.scale(k, k);
    // baris atas dahulu supaya baris bawah menindih (susunan sisik ombak)
    const centers: [number, number][] = [[0, 0], [2 * r, 0], [r, r / 2], [0, r], [2 * r, r]];
    for (const [cx, cy] of centers) {
      t.fillStyle = base;
      t.beginPath();
      t.arc(cx, cy, r, 0, Math.PI * 2);
      t.fill();
      t.strokeStyle = ring;
      t.lineWidth = 2.2;
      for (const f of [0.92, 0.66, 0.4]) {
        t.beginPath();
        t.arc(cx, cy, r * f, Math.PI, Math.PI * 2);
        t.stroke();
      }
    }
    carpetCache.set(key, tile);
  }
  const p = c.createPattern(tile, 'repeat')!;
  p.setTransform(new DOMMatrix().scale(1 / 4));
  return p;
}

function floor(c: Ctx, x: number, y: number, w: number, h: number, kind: string, a: string, b: string) {
  c.save();
  c.beginPath();
  c.rect(x, y, w, h);
  c.clip();
  c.fillStyle = a;
  c.fillRect(x, y, w, h);
  if (kind === 'carpet') {
    // Karpet akademi bercorak ombak seigaiha. Corak diselaraskan pada koordinat dunia
    // supaya karpet lobi & koridor bersambung tanpa garis sambungan.
    c.fillStyle = carpetPattern(c, a, b);
    c.fillRect(x, y, w, h);
    // tekstur bulu karpet (titik halus, rawak tetap)
    c.fillStyle = 'rgba(20,28,60,.16)';
    for (let ty = Math.floor(y / 6) * 6; ty < y + h; ty += 6) for (let tx = Math.floor(x / 6) * 6; tx < x + w; tx += 6) {
      const hash = ((tx / 6) * 73856093) ^ ((ty / 6) * 19349663);
      if (Math.abs(hash) % 5 === 0) c.fillRect(tx, ty, 2, 2);
    }
  } else if (kind === 'wood') {
    // Lantai papan kayu dojo. Diselaraskan pada koordinat dunia supaya lobi & koridor bersambung.
    const ph = 32; // lebar papan
    const seg = 192; // panjang papan
    const y0 = Math.floor(y / ph) * ph;
    for (let ty = y0; ty < y + h; ty += ph) {
      const r = ty / ph;
      const off = ((r * 7) % 6) * 32; // sambungan papan berselang-seli
      for (let tx = Math.floor((x - off) / seg) * seg + off; tx < x + w; tx += seg) {
        const hash = Math.abs(((tx / 32) * 73856093) ^ (r * 19349663));
        c.fillStyle = hash % 3 === 0 ? b : hash % 3 === 1 ? a : PAL.woodMid;
        c.fillRect(tx, ty, seg, ph);
        // urat kayu
        c.strokeStyle = 'rgba(120,70,30,.16)';
        c.lineWidth = 1.2;
        c.beginPath();
        for (let k = 0; k < 2; k++) {
          const gy = ty + 9 + k * 12 + (hash % 5);
          c.moveTo(tx + 10 + (hash % 30), gy);
          c.bezierCurveTo(tx + 60, gy - 3, tx + 110, gy + 3, tx + seg - 20 - (hash % 25), gy);
        }
        c.stroke();
        // mata kayu sekali-sekala
        if (hash % 7 === 0) {
          c.strokeStyle = 'rgba(120,70,30,.22)';
          c.beginPath();
          c.ellipse(tx + 40 + (hash % 100), ty + ph / 2, 7, 3, 0, 0, Math.PI * 2);
          c.stroke();
        }
        // garis sambungan hujung papan
        c.fillStyle = 'rgba(94,58,28,.35)';
        c.fillRect(tx, ty, 2, ph);
      }
      // celah antara baris papan + kilauan nipis di atasnya
      c.fillStyle = 'rgba(94,58,28,.4)';
      c.fillRect(x, ty, w, 2);
      c.fillStyle = 'rgba(255,240,210,.35)';
      c.fillRect(x, ty + 2, w, 1.5);
    }
  } else if (kind === 'cream') {
    // Jubin batu berkilat. Grid diselaraskan pada koordinat dunia supaya lobi & koridor bersambung.
    const s = 48;
    const x0 = Math.floor(x / s) * s;
    const y0 = Math.floor(y / s) * s;
    c.fillStyle = b;
    for (let ty = y0; ty < y + h; ty += s) for (let tx = x0; tx < x + w; tx += s) if ((tx / s + ty / s) % 2 === 0) c.fillRect(tx, ty, s, s);
    // kilauan kecil di bucu SEBAHAGIAN jubin sahaja (~1 daripada 7, rawak tetap)
    c.fillStyle = 'rgba(255,255,255,.55)';
    for (let ty = y0; ty < y + h; ty += s) for (let tx = x0; tx < x + w; tx += s) {
      const hash = ((tx / s) * 73856093) ^ ((ty / s) * 19349663);
      if (Math.abs(hash) % 7 !== 0) continue;
      c.beginPath();
      c.roundRect(tx + 6, ty + 6, 14, 3.5, 2);
      c.roundRect(tx + 6, ty + 6, 3.5, 10, 2);
      c.fill();
    }
    c.strokeStyle = PAL.creamLine;
    c.lineWidth = 1.5;
    c.beginPath();
    for (let tx = x0; tx <= x + w; tx += s) (c.moveTo(tx, y), c.lineTo(tx, y + h));
    for (let ty = y0; ty <= y + h; ty += s) (c.moveTo(x, ty), c.lineTo(x + w, ty));
    c.stroke();
    // jalur pantulan cahaya pepenjuru (lantai digilap)
    for (let k = -MALL.world.h; k < MALL.world.w; k += 300) {
      const g = c.createLinearGradient(k, 0, k + 90, 0);
      g.addColorStop(0, 'rgba(255,255,255,0)');
      g.addColorStop(0.5, 'rgba(255,255,255,.28)');
      g.addColorStop(1, 'rgba(255,255,255,0)');
      c.save();
      c.transform(1, 0, -0.6, 1, 0, 0);
      c.fillStyle = g;
      c.fillRect(k + y * 0.6, y, 90, h);
      c.restore();
    }
  } else if (kind === 'tatami') {
    // tikar tatami 96×48 bersilang, berbingkai hijau gelap
    const tw = 96;
    const th = 48;
    let row = 0;
    for (let ty = y; ty < y + h; ty += th, row++) {
      for (let tx = x - (row % 2) * (tw / 2); tx < x + w; tx += tw) {
        c.fillStyle = (row + Math.round(tx / tw)) % 2 ? a : b;
        c.fillRect(tx, ty, tw, th);
        c.strokeStyle = 'rgba(120,110,40,.18)';
        c.lineWidth = 1;
        c.beginPath();
        for (let lx = tx + 6; lx < tx + tw; lx += 6) (c.moveTo(lx, ty + 3), c.lineTo(lx, ty + th - 3));
        c.stroke();
        c.strokeStyle = '#5f7a3a';
        c.lineWidth = 3;
        c.strokeRect(tx + 1.5, ty + 1.5, tw - 3, th - 3);
      }
    }
  } else if (kind === 'tiles') {
    const s = 40;
    c.fillStyle = b;
    for (let ty = y; ty < y + h; ty += s) for (let tx = x; tx < x + w; tx += s) if (((tx - x) / s + (ty - y) / s) % 2 === 0) c.fillRect(tx, ty, s, s);
    c.strokeStyle = 'rgba(38,50,77,.08)';
    c.lineWidth = 1.5;
    c.beginPath();
    for (let tx = x; tx <= x + w; tx += s) (c.moveTo(tx, y), c.lineTo(tx, y + h));
    for (let ty = y; ty <= y + h; ty += s) (c.moveTo(x, ty), c.lineTo(x + w, ty));
    c.stroke();
  } else if (kind === 'checker') {
    const s = 32;
    c.fillStyle = b;
    for (let ty = y; ty < y + h; ty += s) for (let tx = x; tx < x + w; tx += s) if ((Math.round((tx - x) / s) + Math.round((ty - y) / s)) % 2 === 0) c.fillRect(tx, ty, s, s);
  } else if (kind === 'planks') {
    const ph = 26;
    c.fillStyle = b;
    let row = 0;
    for (let ty = y; ty < y + h; ty += ph, row++) if (row % 2) c.fillRect(x, ty, w, ph);
    c.strokeStyle = 'rgba(38,50,77,.12)';
    c.lineWidth = 1.5;
    c.beginPath();
    row = 0;
    for (let ty = y; ty < y + h; ty += ph, row++) {
      c.moveTo(x, ty);
      c.lineTo(x + w, ty);
      for (let tx = x + (row % 3) * 46; tx < x + w; tx += 138) (c.moveTo(tx, ty), c.lineTo(tx, ty + ph));
    }
    c.stroke();
  }
  c.restore();
}

// ---------- Dinding ----------
function drawWall(c: Ctx, w: WallPiece) {
  if (w.kind === 'glass') {
    // ambang pintu kayu + langsir noren merah bercorak shuriken
    box(c, w.x - 6, w.y, w.w + 12, w.h, 4, N.woodLight, 3);
    grain(c, w.x - 6, w.y, w.w + 12, w.h, 6, 0.3);
    const n = 4;
    const fw = w.w / n;
    for (let i = 0; i < n; i++) {
      const fx = w.x + i * fw + 2;
      rr(c, fx, w.y - 20, fw - 4, 22, 3);
      paint(c, i % 2 ? N.redDark : N.red, 2.5);
      if (i === 1 || i === 2) shuriken(c, fx + (fw - 4) / 2, w.y - 9, 6, '#fff3d6', 1.5);
    }
    box(c, w.x - 8, w.y - 26, w.w + 16, 8, 3, N.woodDark, 2.5);
    return;
  }
  if (w.kind === 'back') {
    // dinding shoji: kertas putih, kekisi kayu, tiang kayu & jalur kain berwarna
    rr(c, w.x, w.y, w.w, w.h, 3);
    paint(c, N.paper);
    c.save();
    rr(c, w.x + 2, w.y + 10, w.w - 4, w.h - 28, 2);
    c.clip();
    c.strokeStyle = 'rgba(138,90,43,.32)';
    c.lineWidth = 1.5;
    c.beginPath();
    for (let lx = w.x + 12; lx < w.x + w.w; lx += 16) (c.moveTo(lx, w.y + 10), c.lineTo(lx, w.y + w.h - 18));
    for (let ly = w.y + 22; ly < w.y + w.h - 18; ly += 12) (c.moveTo(w.x, ly), c.lineTo(w.x + w.w, ly));
    c.stroke();
    c.restore();
    for (let px = w.x + 48; px < w.x + w.w - 20; px += 96) box(c, px - 3.5, w.y + 8, 7, w.h - 16, 2, N.wood, 1.5);
    c.fillStyle = w.band || N.gold;
    c.fillRect(w.x + 1.5, w.y + w.h - 18, w.w - 3, 12);
    c.fillStyle = w.accent || N.red;
    c.fillRect(w.x + 1.5, w.y + w.h - 6, w.w - 3, 4.5);
    c.strokeStyle = O;
    c.lineWidth = 2;
    c.beginPath();
    c.moveTo(w.x + 1, w.y + w.h - 18);
    c.lineTo(w.x + w.w - 1, w.y + w.h - 18);
    c.stroke();
    box(c, w.x, w.y, w.w, 11, 3, N.woodDark);
    c.fillStyle = 'rgba(255,255,255,.18)';
    c.fillRect(w.x + 3, w.y + 2, w.w - 6, 2.5);
    c.fillStyle = 'rgba(38,50,77,.12)';
    c.fillRect(w.x + 2, w.y + w.h, w.w - 4, 6);
    return;
  }
  // rasuk kayu rendah (dinding potong)
  box(c, w.x, w.y, w.w, w.h, 4, N.wood);
  c.fillStyle = 'rgba(255,240,210,.45)';
  if (w.w > w.h) c.fillRect(w.x + 4, w.y + 3, w.w - 8, 3);
  else c.fillRect(w.x + 3, w.y + 4, 3, w.h - 8);
  c.fillStyle = 'rgba(94,58,28,.22)';
  if (w.w > w.h) c.fillRect(w.x + 3, w.y + w.h - 5, w.w - 6, 3);
  else c.fillRect(w.x + w.w - 5, w.y + 3, 3, w.h - 6);
}

function doorPosts(c: Ctx, shop: ShopDef) {
  const g = shopEntrance(shop).gap;
  const vertical = g.h > g.w;
  const posts = vertical
    ? [[g.x + g.w / 2, g.y], [g.x + g.w / 2, g.y + g.h]]
    : [[g.x, g.y + g.h / 2], [g.x + g.w, g.y + g.h / 2]];
  for (const [px, py] of posts) {
    ell(c, px, py, 12, 12, N.red, 3);
    ell(c, px, py, 6, 6, N.gold, 2);
    ell(c, px - 3, py - 4, 3, 2.5, 'rgba(255,255,255,.6)', 0);
  }
}

/**
 * Karpet pintu bertema ninja (dilukis setiap bingkai, di bawah props):
 * permaidani merah berbingkai emas, jalur warna kedai, rumbai di hujung dan
 * shuriken emas di tengah yang berputar perlahan (lebih laju & bercahaya bila pemain dekat).
 */
export function drawDoorPad(c: Ctx, shop: ShopDef, time: number, active: boolean, reduced: boolean) {
  const e = shopEntrance(shop);
  const outward = -e.inward.x;
  const mw = 48;
  const mh = 108;
  const mx = outward > 0 ? e.x + 14 : e.x - 14 - mw;
  const my = e.y - mh / 2;
  const cx = mx + mw / 2;
  const acc = shop.theme.accent;
  const T = reduced ? 0 : time;
  const pulse = reduced ? 0.6 : 0.5 + 0.5 * Math.sin(T * (active ? 5 : 2) + e.y);

  c.save();
  c.lineCap = 'round';

  // rumbai (tassel) di hujung atas & bawah
  c.strokeStyle = N.paper;
  c.lineWidth = 2;
  c.beginPath();
  for (let fx = mx + 6; fx <= mx + mw - 6; fx += 5) {
    c.moveTo(fx, my - 6);
    c.lineTo(fx, my + 2);
    c.moveTo(fx, my + mh - 2);
    c.lineTo(fx, my + mh + 6);
  }
  c.stroke();

  // cahaya emas lembut bila pemain dekat
  if (active) {
    c.shadowColor = N.gold;
    c.shadowBlur = 14 + pulse * 14;
  }
  // badan karpet: tepi navy, isi merah lakuer
  box(c, mx, my, mw, mh, 5, N.navy, 3);
  c.shadowBlur = 0;
  rr(c, mx + 5, my + 5, mw - 10, mh - 10, 3);
  c.fillStyle = N.red;
  c.fill();

  // corak asanoha halus (berlian kecil) pada merah
  c.fillStyle = N.redDark;
  for (let py = my + 14; py < my + mh - 10; py += 12) {
    for (let px = mx + 12 + (((py - my) / 12) % 2 ? 6 : 0); px < mx + mw - 8; px += 12) {
      c.beginPath();
      c.moveTo(px, py - 3);
      c.lineTo(px + 3, py);
      c.lineTo(px, py + 3);
      c.lineTo(px - 3, py);
      c.closePath();
      c.fill();
    }
  }

  // jalur warna kedai di kedua-dua hujung (pengenalan kedai)
  for (const by of [my + 12, my + mh - 20]) {
    c.fillStyle = acc;
    c.fillRect(mx + 5, by, mw - 10, 8);
    c.fillStyle = N.gold;
    c.fillRect(mx + 5, by - 2, mw - 10, 2);
    c.fillRect(mx + 5, by + 8, mw - 10, 2);
  }

  // bingkai emas dalam
  c.strokeStyle = N.gold;
  c.lineWidth = 2;
  rr(c, mx + 8, my + 8, mw - 16, mh - 16, 2);
  c.stroke();

  // medalion tengah: bulatan navy + shuriken emas berputar
  const spin = reduced ? 0 : T * (active ? 2.4 : 0.6);
  ell(c, cx, e.y, 15, 15, N.navy, 2.5);
  c.strokeStyle = N.gold;
  c.lineWidth = 1.5;
  c.beginPath();
  c.arc(cx, e.y, 12, 0, Math.PI * 2);
  c.stroke();
  shuriken(c, cx, e.y, 10, N.gold, 1.5, spin);
  ell(c, cx, e.y, 2.5, 2.5, N.navy, 0);

  // kilauan emas pada bingkai bila aktif
  if (active && !reduced) {
    c.globalAlpha = 0.35 + pulse * 0.5;
    c.strokeStyle = '#fff3c4';
    c.lineWidth = 2;
    rr(c, mx + 8, my + 8, mw - 16, mh - 16, 2);
    c.stroke();
  }
  c.restore();
}

// ---------- Hiasan rata (permaidani / tikar) ----------
function drawRug(c: Ctx, p: PropDef) {
  const { x, y, w, h, variant } = p;
  if (variant === 'welcome') {
    box(c, x, y, w, h, 10, N.red, 3);
    rr(c, x + 6, y + 6, w - 12, h - 12, 6);
    c.strokeStyle = N.gold;
    c.lineWidth = 3;
    c.stroke();
    let fs = 14;
    c.font = `900 ${fs}px ${FONT}`;
    while (fs > 8 && c.measureText(t('mat.welcome')).width > w - 22) c.font = `900 ${--fs}px ${FONT}`;
    c.fillStyle = '#ffe9a8';
    c.textAlign = 'center';
    c.textBaseline = 'middle';
    c.fillText(t('mat.welcome'), x + w / 2, y + h / 2 + 1);
    return;
  }
  if (variant === 'puzzle') {
    box(c, x, y, w, h, 14, N.woodPale, 3);
    const cols = ['#f08a7e', '#7fb6e8', '#8fd3a8', '#f7c948'];
    const s = (w - 20) / 2;
    cols.forEach((col, i) => {
      const px = x + 10 + (i % 2) * s;
      const py = y + 10 + Math.floor(i / 2) * s;
      box(c, px + 2, py + 2, s - 4, s - 4, 6, col, 2);
      ell(c, px + s - 3, py + s / 2, 6, 6, col, 2);
    });
    return;
  }
  if (variant === 'ring') {
    // gelanggang latihan: bulatan merah + lambang shuriken besar
    ell(c, x + w / 2, y + h / 2, w / 2, h / 2, '#f6efc8', 3);
    c.strokeStyle = N.red;
    c.lineWidth = 7;
    c.beginPath();
    c.ellipse(x + w / 2, y + h / 2, w / 2 - 12, h / 2 - 10, 0, 0, Math.PI * 2);
    c.stroke();
    c.globalAlpha = 0.35;
    shuriken(c, x + w / 2, y + h / 2, Math.min(w, h) * 0.3, N.red, 0, Math.PI / 4);
    c.globalAlpha = 1;
    return;
  }
  if (variant === 'ink') {
    box(c, x, y, w, h, 14, N.paper, 3);
    const dots: [number, number, number, string][] = [[0.25, 0.4, 11, N.ink], [0.55, 0.3, 8, N.red], [0.78, 0.6, 12, '#3d4c7a'], [0.42, 0.72, 7, N.ink]];
    for (const [dx, dy, r, col] of dots) ell(c, x + dx * w, y + dy * h, r, r * 0.8, col, 0);
    line(c, [x + 14, y + h - 14, x + w * 0.4, y + h - 22, x + w - 16, y + h - 16], N.ink, 3);
    return;
  }
  // 'play' — tikar bulat dengan lambang shuriken
  ell(c, x + w / 2, y + h / 2, w / 2, h / 2, '#e9e3a8', 3);
  c.strokeStyle = '#5f7a3a';
  c.lineWidth = 3;
  c.beginPath();
  c.ellipse(x + w / 2, y + h / 2, w / 2 - 9, h / 2 - 7, 0, 0, Math.PI * 2);
  c.stroke();
  shuriken(c, x + w / 2, y + h / 2, 20, '#7f8aa8', 2, Math.PI / 8);
}

// ---------- Luar bangunan ----------
function sakuraCanopy(c: Ctx, cx: number, cy: number, r: number) {
  blob(c, [[cx, cy, r], [cx - r * 0.85, cy + r * 0.35, r * 0.72], [cx + r * 0.85, cy + r * 0.35, r * 0.72], [cx, cy - r * 0.55, r * 0.7]], N.sakura, N.sakuraLight);
  c.fillStyle = N.sakuraDark;
  for (let i = 0; i < 7; i++) {
    const a = i * 2.4;
    c.beginPath();
    c.arc(cx + Math.cos(a) * r * 0.7, cy + Math.sin(a) * r * 0.5, 2.6, 0, Math.PI * 2);
    c.fill();
  }
}
function outdoorSakura(c: Ctx, x: number, y: number, r: number) {
  stick(c, [x, y + r * 0.9, x, y + r * 0.2], N.woodDark, 7);
  sakuraCanopy(c, x, y, r);
}
function bambooClump(c: Ctx, x: number, y: number) {
  for (const [dx, hgt] of [[-9, 46], [0, 58], [9, 40]]) {
    const sx = x + dx;
    rr(c, sx - 3.5, y + 14 - hgt, 7, hgt, 3);
    paint(c, N.bamboo, 2);
    c.strokeStyle = N.bambooDark;
    c.lineWidth = 1.5;
    c.beginPath();
    for (let ny = y + 14 - hgt + 12; ny < y + 12; ny += 12) (c.moveTo(sx - 3, ny), c.lineTo(sx + 3, ny));
    c.stroke();
    ell(c, sx + 7, y + 14 - hgt + 6, 7, 2.6, N.bamboo, 1.5, -0.5);
    ell(c, sx - 7, y + 14 - hgt + 12, 7, 2.6, N.bamboo, 1.5, 0.5);
  }
}
function torii(c: Ctx) {
  const e = MALL.entrance;
  const B = MALL.building;
  const top = B.y + B.h + 54;
  const lx = e.x - 18;
  const rx = e.x + e.w + 18;
  for (const px of [lx, rx]) box(c, px - 9, top, 18, MALL.world.h - top + 10, 4, N.red, 3);
  box(c, lx - 34, top + 22, rx - lx + 68, 12, 3, N.red, 3);
  rr(c, lx - 50, top - 4, rx - lx + 100, 16, 6);
  paint(c, N.ink, 3);
  box(c, lx - 40, top + 8, rx - lx + 80, 10, 3, N.red, 3);
}

// Tanglung kertas merah (statik) untuk dinding
function hangingLantern(c: Ctx, x: number, y: number, s = 1) {
  const g = c.createRadialGradient(x, y + 12 * s, 2, x, y + 12 * s, 30 * s);
  g.addColorStop(0, 'rgba(255,214,120,.55)');
  g.addColorStop(1, 'rgba(255,214,120,0)');
  c.fillStyle = g;
  c.fillRect(x - 32 * s, y - 20 * s, 64 * s, 64 * s);
  line(c, [x, y - 6 * s, x, y], N.ink, 2);
  ell(c, x, y + 12 * s, 11 * s, 13 * s, N.red, 2.5);
  c.strokeStyle = 'rgba(110,29,20,.5)';
  c.lineWidth = 1.2;
  for (const dx of [-5, 0, 5]) {
    c.beginPath();
    c.ellipse(x + dx * s * 0.3, y + 12 * s, Math.abs(dx) * s * 0.9 + 1, 12 * s, 0, 0, Math.PI * 2);
    c.stroke();
  }
  box(c, x - 6 * s, y - 1 * s, 12 * s, 4 * s, 1.5, N.ink, 1.5);
  box(c, x - 6 * s, y + 23 * s, 12 * s, 4 * s, 1.5, N.ink, 1.5);
  line(c, [x, y + 27 * s, x, y + 33 * s], N.gold, 2);
}
// Sepanduk latihan kain dengan lambang shuriken
function trainingBanner(c: Ctx, x: number, y: number, col: string) {
  line(c, [x - 20, y, x + 20, y], N.woodDark, 4);
  c.beginPath();
  c.moveTo(x - 15, y + 2);
  c.lineTo(x + 15, y + 2);
  c.lineTo(x + 15, y + 34);
  c.lineTo(x, y + 28);
  c.lineTo(x - 15, y + 34);
  c.closePath();
  paint(c, col, 2.5);
  shuriken(c, x, y + 15, 9, '#fff3d6', 1.5);
}

function wallDecor(c: Ctx) {
  const top = MALL.lobby.top;
  hangingLantern(c, 150, top + 10);
  trainingBanner(c, 232, top + 12, N.navy);
  trainingBanner(c, 316, top + 12, N.red);
  hangingLantern(c, 398, top + 10);
  hangingLantern(c, 1160, top + 10);
  trainingBanner(c, 1236, top + 12, N.red);
  trainingBanner(c, 1312, top + 12, N.navy);
  hangingLantern(c, 1392, top + 10);
  // tanglung di kiri-kanan sepanduk koridor
  const cx = MALL.corridor.x + MALL.corridor.w / 2;
  hangingLantern(c, cx - 104, MALL.building.y + 12, 0.85);
  hangingLantern(c, cx + 104, MALL.building.y + 12, 0.85);
}

// ---------- Lapisan statik (lantai + dinding) ----------
export function buildStaticLayer(scale: number): HTMLCanvasElement {
  const W = MALL.world;
  const B = MALL.building;
  const cv = document.createElement('canvas');
  cv.width = Math.round(W.w * scale);
  cv.height = Math.round(W.h * scale);
  const c = cv.getContext('2d')!;
  c.scale(scale, scale);

  // taman di luar: rumput, laluan batu, sakura & buluh
  c.fillStyle = PAL.grass;
  c.fillRect(0, 0, W.w, W.h);
  c.fillStyle = PAL.grassDark;
  for (let gy = 10; gy < W.h; gy += 34) for (let gx = gy % 68 ? 18 : 0; gx < W.w; gx += 52) c.fillRect(gx, gy, 4, 7);
  const e = MALL.entrance;
  floor(c, e.x + 8, B.y + B.h, e.w - 16, W.h - B.y - B.h, 'tiles', '#e9e4d8', '#ddd6c6');
  c.strokeStyle = O;
  c.lineWidth = 3;
  c.strokeRect(e.x + 8, B.y + B.h, e.w - 16, W.h - B.y - B.h + 4);
  let i = 0;
  for (let bx = 46; bx < W.w; bx += 78, i++) (i % 3 === 1 ? outdoorSakura(c, bx, 40, 24) : bambooClump(c, bx, 46));
  i = 0;
  for (let by = 150; by < W.h - 60; by += 90, i++) {
    if (i % 2) (outdoorSakura(c, 48, by, 22), outdoorSakura(c, W.w - 48, by, 22));
    else (bambooClump(c, 48, by), bambooClump(c, W.w - 48, by));
  }
  i = 0;
  for (let bx = 46; bx < W.w; bx += 78, i++) {
    if (bx > e.x - 70 && bx < e.x + e.w + 70) continue;
    i % 2 ? outdoorSakura(c, bx, B.y + B.h + 70, 24) : bambooClump(c, bx, B.y + B.h + 82);
  }

  c.fillStyle = 'rgba(38,50,77,.22)';
  c.fillRect(B.x + 8, B.y + 10, B.w, B.h);
  floor(c, B.x, MALL.lobby.top, B.w, B.y + B.h - MALL.lobby.top, 'wood', PAL.woodA, PAL.woodB);
  floor(c, MALL.corridor.x, B.y, MALL.corridor.w, MALL.lobby.top - B.y, 'wood', PAL.woodA, PAL.woodB);
  for (const shop of SHOPS) {
    const r = shopInterior(shop);
    floor(c, r.x, r.y, r.w, r.h, shop.theme.floor, shop.theme.floorA, shop.theme.floorB);
    const g = shopEntrance(shop).gap;
    floor(c, g.x, g.y, g.w, g.h, shop.theme.floor, shop.theme.floorA, shop.theme.floorB);
  }

  for (const p of allProps()) if (FLAT_PROPS.has(p.type)) drawRug(c, p);
  for (const w of buildingWalls()) drawWall(c, w);
  for (const shop of SHOPS) for (const w of shopWalls(shop)) drawWall(c, w);
  for (const shop of SHOPS) doorPosts(c, shop);
  for (const shop of SHOPS) {
    hangingLantern(c, shop.bounds.x + 30, shop.bounds.y + 14, 0.8);
    hangingLantern(c, shop.bounds.x + shop.bounds.w - 30, shop.bounds.y + 14, 0.8);
  }
  wallDecor(c);
  torii(c);
  return cv;
}

/** Papan tanda kayu dilukis SELEPAS props supaya rak/perabot tinggi tidak menutupnya. */
export function drawSigns(c: Ctx) {
  const B = MALL.building;
  const cx = MALL.corridor.x + MALL.corridor.w / 2;
  for (const shop of SHOPS) label(c, shop.bounds.x + shop.bounds.w / 2, shop.bounds.y + 22, `${shop.icon} ${t(shop.signKey)}`, 19);
  label(c, cx, B.y + 24, `🥷 ${t('banner.mall')}`, 17, 'red');
  label(c, 545, MALL.lobby.top + 26, `📜 ${t('info.name').toUpperCase()}`, 15);
  label(c, 990, MALL.lobby.top + 26, `🎁 ${t('reward.name').toUpperCase()}`, 15);
  label(c, cx, B.y + B.h + 62, `⛩️ ${t('map.entrance').toUpperCase()}`, 13, 'red');
}

// ---------- Props (dilukis setiap bingkai, disusun mengikut kedalaman) ----------
export function drawProp(c: Ctx, p: PropDef, time: number) {
  const { x, y, w, h } = p;
  switch (p.type) {
    case 'plant': {
      // buluh dalam pasu kayu
      shadow(c, x, y, w, h);
      const pt = y + h - 22;
      for (const [fx, hgt] of [[0.3, 54], [0.52, 70], [0.72, 46]]) {
        const sx = x + w * fx;
        rr(c, sx - 3.5, pt - hgt, 7, hgt + 4, 3);
        paint(c, N.bamboo, 2);
        c.strokeStyle = N.bambooDark;
        c.lineWidth = 1.5;
        c.beginPath();
        for (let ny = pt - hgt + 13; ny < pt; ny += 13) (c.moveTo(sx - 3, ny), c.lineTo(sx + 3, ny));
        c.stroke();
        ell(c, sx + 8, pt - hgt + 6, 8, 3, N.bamboo, 1.5, -0.5);
        ell(c, sx - 8, pt - hgt + 14, 8, 3, N.bamboo, 1.5, 0.5);
      }
      box(c, x + 2, pt, w - 4, 22, 4, N.wood);
      c.fillStyle = N.woodDark;
      c.fillRect(x + 4, pt + 8, w - 8, 3);
      return;
    }
    case 'sakura': {
      shadow(c, x - 20, y, w + 40, h);
      const cx = x + w / 2;
      stick(c, [cx, y + h - 4, cx, y - 40], N.woodDark, 9);
      stick(c, [cx, y - 20, cx - 18, y - 46], N.woodDark, 5);
      stick(c, [cx, y - 28, cx + 18, y - 52], N.woodDark, 5);
      ell(c, cx, y + h - 6, 16, 6, N.woodDark, 2);
      sakuraCanopy(c, cx, y - 66, 34);
      if (time) {
        // kelopak gugur perlahan
        c.fillStyle = N.sakuraDark;
        for (let k = 0; k < 3; k++) {
          const f = (time * 0.18 + k / 3) % 1;
          c.globalAlpha = Math.sin(f * Math.PI);
          c.beginPath();
          c.ellipse(cx - 30 + k * 26 + Math.sin(time + k) * 8, y - 40 + f * 70, 3, 2, f * 6, 0, Math.PI * 2);
          c.fill();
        }
        c.globalAlpha = 1;
      }
      return;
    }
    case 'stoneLantern': {
      shadow(c, x, y, w, h);
      const cx = x + w / 2;
      box(c, x + 2, y + h - 10, w - 4, 10, 3, N.stone);
      box(c, cx - 6, y + h - 34, 12, 26, 3, N.stone);
      box(c, x + 1, y + h - 58, w - 2, 26, 5, N.stone);
      const flick = time ? 0.75 + Math.sin(time * 9) * 0.12 + Math.sin(time * 23) * 0.08 : 0.85;
      const g = c.createRadialGradient(cx, y + h - 45, 1, cx, y + h - 45, 30);
      g.addColorStop(0, `rgba(255,214,120,${0.55 * flick})`);
      g.addColorStop(1, 'rgba(255,214,120,0)');
      c.fillStyle = g;
      c.fillRect(cx - 30, y + h - 75, 60, 60);
      box(c, cx - 7, y + h - 52, 14, 13, 2, `rgba(255,${200 + flick * 40},${90 + flick * 40},1)`, 2);
      c.beginPath();
      c.moveTo(x - 7, y + h - 56);
      c.quadraticCurveTo(cx, y + h - 80, x + w + 7, y + h - 56);
      c.closePath();
      paint(c, N.stoneDark);
      ell(c, cx, y + h - 74, 5, 5, N.stoneDark, 2);
      return;
    }
    case 'taiko': {
      shadow(c, x, y, w, h);
      const cx = x + w / 2;
      stick(c, [x + 6, y + h, x + 14, y + h - 30], N.woodDark, 4);
      stick(c, [x + w - 6, y + h, x + w - 14, y + h - 30], N.woodDark, 4);
      rr(c, x + 4, y + h - 58, w - 8, 34, 14);
      paint(c, N.redDark);
      c.fillStyle = N.gold;
      for (let k = 0; k < 6; k++) {
        c.beginPath();
        c.arc(x + 10 + k * ((w - 20) / 5), y + h - 54, 2, 0, Math.PI * 2);
        c.arc(x + 10 + k * ((w - 20) / 5), y + h - 28, 2, 0, Math.PI * 2);
        c.fill();
      }
      ell(c, cx, y + h - 58, w / 2 - 4, 9, '#fff1d6', 3);
      ell(c, cx, y + h - 58, 8, 4, N.red, 1.5);
      stick(c, [x + w - 4, y + h - 70, x + w + 8, y + h - 82], N.woodLight, 3);
      return;
    }
    case 'bench': {
      block(c, x, y, w, h, 14, N.woodLight, N.wood, 6);
      grain(c, x, y - 14, w, h, 9, 0.3);
      return;
    }
    case 'shelf': {
      block(c, x, y, w, h, 50, N.woodPale, N.woodLight, 5);
      const rows = [y + h - 46, y + h - 24];
      for (const ry of rows) {
        line(c, [x + 4, ry + 19, x + w - 4, ry + 19], 'rgba(94,58,28,.6)', 2);
        let bx = x + 8;
        let k = ry === rows[0] ? 0 : 2;
        while (bx < x + w - 18) {
          if (p.variant === 'scrolls') {
            const col = ['#fff3d6', '#f7c948', '#f08a7e', '#9fc6ef'][k++ % 4];
            box(c, bx, ry + 7, 22, 10, 5, col, 2);
            ell(c, bx + 22, ry + 12, 3, 5, N.woodDark, 1.5);
            bx += 27;
          } else if (p.variant === 'jars' || p.variant === 'ink') {
            const col = p.variant === 'ink' ? ['#2b2b3a', '#3d4c7a', '#c73a2e', '#3f8f5a'][k++ % 4] : ['#ffe08a', '#ffc9a8', '#ff9f80', '#c3eedf'][k++ % 4];
            box(c, bx, ry + 3, 14, 16, 5, col, 2);
            box(c, bx + 2, ry, 10, 5, 2, p.variant === 'ink' ? '#fff' : N.woodDark, 1.5);
            bx += 19;
          } else {
            box(c, bx, ry + 2, 18, 17, 3, ['#f08a7e', '#7fb6e8', '#f7c948', '#8fd3a8', '#c8b4f5'][k++ % 5], 2);
            bx += 23;
          }
        }
      }
      return;
    }
    case 'rubik': {
      block(c, x, y, w, h, 34, '#ffffff', '#ffffff', 6);
      const top = ['#f08a7e', '#f7c948', '#7fb6e8', '#8fd3a8', '#ffffff', '#ff9a4d', '#7fb6e8', '#f08a7e', '#f7c948'];
      const cs = (w - 10) / 3;
      const chs = (h - 10) / 3;
      top.forEach((col, i) => box(c, x + 5 + (i % 3) * cs, y - 29 + Math.floor(i / 3) * chs, cs - 2, chs - 2, 3, col, 1.5));
      ['#8fd3a8', '#ff9a4d', '#7fb6e8'].forEach((col, i) => box(c, x + 5 + i * cs, y + h - 32, cs - 2, 26, 3, col, 1.5));
      return;
    }
    case 'puzzleTable': {
      // meja rendah kayu (chabudai) dengan kepingan teka-teki
      block(c, x, y, w, h, 18, N.woodPale, N.wood, 10);
      grain(c, x, y - 18, w, h, 10, 0.18);
      const cols = ['#f08a7e', '#7fb6e8', '#8fd3a8', '#c8b4f5', '#ffb36b', '#f7c948'];
      for (let i = 0; i < 6; i++) {
        const px = x + 14 + (i % 3) * ((w - 28) / 3);
        const py = y - 18 + 10 + Math.floor(i / 3) * 28;
        box(c, px, py, 30, 22, 4, cols[i], 2);
        ell(c, px + 30, py + 11, 5, 5, cols[i], 2);
      }
      return;
    }
    case 'craftTable': {
      // meja kaligrafi: kertas washi, batu dakwat, berus
      block(c, x, y, w, h, 18, N.woodPale, N.wood, 10);
      box(c, x + 14, y - 12, 50, 40, 2, N.paper, 2);
      c.strokeStyle = N.ink;
      c.lineCap = 'round';
      c.lineWidth = 4;
      c.beginPath();
      c.moveTo(x + 22, y + 2);
      c.bezierCurveTo(x + 32, y - 10, x + 44, y - 4, x + 38, y + 8);
      c.bezierCurveTo(x + 34, y + 16, x + 48, y + 20, x + 56, y + 12);
      c.stroke();
      ell(c, x + 26, y + 18, 3, 3, N.red, 0);
      box(c, x + 74, y - 10, 30, 22, 4, N.ink, 2);
      ell(c, x + 89, y - 1, 9, 6, '#3d4c7a', 0);
      for (let k = 0; k < 3; k++) {
        stick(c, [x + w - 54 + k * 12, y + 26, x + w - 44 + k * 12, y - 8], N.woodLight, 3);
        ell(c, x + w - 44 + k * 12, y - 10, 3, 4, N.ink, 1);
      }
      ell(c, x + w - 22, y + 14, 9, 8, N.red, 2);
      return;
    }
    case 'serveCounter': {
      // kaunter bento
      block(c, x, y, w, h, 30, N.woodPale, N.red, 8);
      c.fillStyle = 'rgba(255,233,168,.85)';
      for (let sx = x + 12; sx < x + w - 10; sx += 32) shuriken(c, sx + 8, y + h - 16, 6, '#ffe9a8', 1);
      for (let k = 0; k < 2; k++) {
        const bx = x + 18 + k * 66;
        box(c, bx, y - 26, 54, 34, 5, N.ink, 2.5);
        box(c, bx + 4, y - 22, 22, 26, 3, '#ffffff', 1.5);
        box(c, bx + 29, y - 22, 21, 12, 3, '#f08a7e', 1.5);
        box(c, bx + 29, y - 8, 21, 12, 3, '#8fd3a8', 1.5);
        ell(c, bx + 15, y - 9, 3, 3, N.red, 0);
      }
      // onigiri
      for (let k = 0; k < 2; k++) {
        const ox = x + w - 42 + k * 24;
        c.beginPath();
        c.moveTo(ox, y - 24);
        c.quadraticCurveTo(ox + 13, y + 2, ox + 12, y + 4);
        c.lineTo(ox - 12, y + 4);
        c.quadraticCurveTo(ox - 13, y + 2, ox, y - 24);
        paint(c, '#ffffff', 2.5);
        box(c, ox - 7, y - 4, 14, 8, 1, N.ink, 0);
      }
      return;
    }
    case 'kitchen': {
      block(c, x, y, w, h, 40, '#f4efe4', N.woodLight, 6);
      c.strokeStyle = 'rgba(94,58,28,.5)';
      c.lineWidth = 2;
      for (let dx = x + w / 4; dx < x + w - 2; dx += w / 4) (c.beginPath(), c.moveTo(dx, y + h - 36), c.lineTo(dx, y + h - 4), c.stroke());
      box(c, x + 16, y - 34, 70, 36, 6, '#3a4466', 2.5);
      ell(c, x + 34, y - 16, 12, 9, '#9aa3bd', 2);
      ell(c, x + 34, y - 18, 8, 5, '#fff', 1.5);
      ell(c, x + 68, y - 16, 10, 8, '#59627f', 2);
      box(c, x + 104, y - 34, 36, 30, 10, '#ffffff', 2.5); // periuk nasi
      ell(c, x + 122, y - 30, 12, 4, '#e8e8e8', 2);
      box(c, x + 154, y - 30, 72, 24, 4, N.woodPale, 2); // papan pemotong
      ell(c, x + 176, y - 18, 7, 5, '#ff9a4d', 1.5);
      ell(c, x + 196, y - 18, 7, 5, '#8fd3a8', 1.5);
      return;
    }
    case 'fridge': {
      // almari kayu
      block(c, x, y, w, h, 64, N.woodLight, N.wood, 8);
      line(c, [x + w / 2, y + h - 62, x + w / 2, y + h - 4], O, 2.5);
      box(c, x + w / 2 - 9, y + h - 40, 4, 14, 2, N.gold, 1.5);
      box(c, x + w / 2 + 5, y + h - 40, 4, 14, 2, N.gold, 1.5);
      return;
    }
    case 'roundTable': {
      shadow(c, x, y, w, h);
      box(c, x - 6, y + h - 16, 16, 14, 4, N.red, 2.5);
      box(c, x + w - 10, y + h - 16, 16, 14, 4, N.red, 2.5);
      box(c, x + w / 2 - 5, y + h - 24, 10, 20, 3, N.woodDark, 2.5);
      ell(c, x + w / 2, y + h / 2 - 10, w / 2, h / 2 - 4, N.woodLight, 3);
      ell(c, x + w / 2 - 8, y + h / 2 - 12, 7, 6, '#9fd3a8', 2);
      ell(c, x + w / 2 + 10, y + h / 2 - 10, 5, 4, '#fff', 2);
      return;
    }
    case 'cushion':
    case 'beanbag': {
      // kusyen zabuton
      shadow(c, x, y, w, h);
      const col = p.variant || N.red;
      box(c, x, y + 2, w, h - 6, 12, col, 3);
      ell(c, x + w / 2, y + h / 2 - 1, 4, 3, N.gold, 1.5);
      for (const [tx, ty] of [[x + 3, y + 5], [x + w - 3, y + 5], [x + 3, y + h - 7], [x + w - 3, y + h - 7]]) ell(c, tx, ty, 3, 3, N.gold, 1.5);
      c.fillStyle = 'rgba(255,255,255,.3)';
      c.fillRect(x + 8, y + 6, w - 16, 3);
      return;
    }
    case 'dummy': {
      // patung latihan kayu
      shadow(c, x, y, w, h);
      const cx = x + w / 2;
      ell(c, cx, y + h - 6, w / 2, 7, N.woodDark, 2.5);
      box(c, cx - 5, y + h - 52, 10, 48, 3, N.wood, 2.5);
      stick(c, [cx - 22, y + h - 40, cx + 22, y + h - 40], N.woodLight, 5);
      box(c, cx - 12, y + h - 60, 24, 30, 9, '#e9d38a', 2.5);
      line(c, [cx - 11, y + h - 50, cx + 11, y + h - 50], N.woodDark, 2);
      line(c, [cx - 11, y + h - 42, cx + 11, y + h - 42], N.woodDark, 2);
      ell(c, cx, y + h - 70, 10, 10, '#e9d38a', 2.5);
      c.fillStyle = N.red;
      c.fillRect(cx - 10, y + h - 74, 20, 4);
      return;
    }
    case 'target': {
      shadow(c, x, y, w, h);
      const cx = x + w / 2;
      stick(c, [x + 6, y + h, cx, y + h - 34], N.woodDark, 4);
      stick(c, [x + w - 6, y + h, cx, y + h - 34], N.woodDark, 4);
      const ty = y + h - 46;
      ell(c, cx, ty, 22, 22, '#ffffff', 3);
      ell(c, cx, ty, 16, 16, N.red, 0);
      ell(c, cx, ty, 10, 10, '#ffffff', 0);
      ell(c, cx, ty, 5, 5, N.gold, 1.5);
      shuriken(c, cx + 7, ty - 6, 6, '#b8c0d0', 1.5, time * 0);
      return;
    }
    case 'weaponRack': {
      // rak kayu dengan tongkat bo & perisai latihan
      block(c, x, y, w, h, 52, N.woodPale, N.wood, 5);
      line(c, [x + 6, y + h - 40, x + w - 6, y + h - 40], N.woodDark, 3);
      for (let k = 0; k < 4; k++) {
        const sx = x + 14 + k * 14;
        stick(c, [sx, y + h - 6, sx, y - 48], k % 2 ? N.woodLight : '#c27a3e', 3);
      }
      ell(c, x + w - 30, y + h - 30, 16, 16, N.red, 2.5);
      shuriken(c, x + w - 30, y + h - 30, 9, N.gold, 1.5);
      return;
    }
    case 'easel': {
      // gantungan skrol lukisan dakwat
      shadow(c, x, y, w, h);
      stick(c, [x + 8, y + h, x + 10, y - 40], N.woodDark, 3);
      stick(c, [x + w - 8, y + h, x + w - 10, y - 40], N.woodDark, 3);
      stick(c, [x + 2, y - 40, x + w - 2, y - 40], N.woodLight, 4);
      box(c, x + 8, y - 38, w - 16, 52, 2, N.paper, 2.5);
      if (p.variant === 'mountain') {
        line(c, [x + 12, y + 2, x + 22, y - 16, x + 30, y - 6, x + 38, y - 20], N.ink, 2.5);
        ell(c, x + w - 18, y - 26, 5, 5, N.red, 0);
      } else {
        line(c, [x + 12, y + 6, x + 26, y - 6, x + 38, y - 24], N.woodDark, 2.5);
        for (const [dx, dy] of [[20, -6], [30, -16], [36, -26], [26, -2]]) ell(c, x + dx, y + dy, 3.5, 3.5, N.sakuraDark, 0);
      }
      box(c, x + 8, y + 12, w - 16, 4, 1, N.woodDark, 1.5);
      return;
    }
    case 'infoDesk': {
      // Kaunter Misi: meja kayu, skrol misi & kain merah
      block(c, x, y, w, h, 36, N.woodPale, N.wood, 10);
      box(c, x + w / 2 - 34, y + h - 34, 68, 28, 4, N.red, 2.5);
      shuriken(c, x + w / 2, y + h - 20, 9, N.gold, 1.5);
      for (let k = 0; k < 3; k++) {
        box(c, x + 14, y - 30 + k * 9, 34, 9, 4, ['#fff3d6', '#f7c948', '#f08a7e'][k], 2);
        ell(c, x + 48, y - 26 + k * 9, 2.5, 4, N.woodDark, 1);
      }
      box(c, x + 62, y - 30, 48, 28, 2, N.paper, 2);
      line(c, [x + 68, y - 22, x + 100, y - 22], 'rgba(43,43,58,.6)', 2);
      line(c, [x + 68, y - 14, x + 92, y - 14], 'rgba(43,43,58,.6)', 2);
      ell(c, x + w - 20, y - 18, 9, 9, N.ink, 2);
      return;
    }
    case 'rewardBooth': {
      // gerai pesta: kanopi merah, tanglung & peti harta
      block(c, x, y, w, h, 36, N.woodPale, N.wood, 10);
      c.fillStyle = 'rgba(255,233,168,.7)';
      for (let sx = x + 12; sx < x + w - 8; sx += 26) shuriken(c, sx + 6, y + h - 16, 6, '#ffe9a8', 1);
      for (let k = 0; k < 3; k++) {
        const bx = x + 14 + k * 42;
        box(c, bx, y - 32, 32, 24, 4, k === 1 ? N.gold : N.red, 2.5);
        box(c, bx, y - 32, 32, 9, 4, k === 1 ? '#ffe08a' : N.redDark, 2);
        box(c, bx + 13, y - 26, 6, 7, 1, k === 1 ? N.red : N.gold, 1.5);
      }
      stick(c, [x + 6, y + 6, x + 6, y - 74], N.woodDark, 4);
      stick(c, [x + w - 6, y + 6, x + w - 6, y - 74], N.woodDark, 4);
      const n = 6;
      const sw = (w + 8) / n;
      for (let k = 0; k < n; k++) {
        c.beginPath();
        c.moveTo(x - 4 + k * sw, y - 92);
        c.lineTo(x - 4 + (k + 1) * sw, y - 92);
        c.lineTo(x - 4 + (k + 1) * sw, y - 72);
        c.arc(x - 4 + k * sw + sw / 2, y - 72, sw / 2, 0, Math.PI);
        c.closePath();
        paint(c, k % 2 ? '#fff3d6' : N.red, 2.5);
      }
      const sway = time ? Math.sin(time * 1.6) * 2 : 0;
      hangingLantern(c, x + 18 + sway, y - 64, 0.6);
      hangingLantern(c, x + w - 18 - sway, y - 64, 0.6);
      return;
    }
    case 'fountain': {
      // kolam koi
      shadow(c, x, y, w, h);
      ell(c, x + w / 2, y + h / 2, w / 2, h / 2, N.stone, 3);
      ell(c, x + w / 2, y + h / 2, w / 2 - 9, h / 2 - 8, '#7fc8ef', 2.5);
      for (let k = 0; k < 9; k++) {
        const a = (k / 9) * Math.PI * 2;
        ell(c, x + w / 2 + Math.cos(a) * (w / 2 - 2), y + h / 2 + Math.sin(a) * (h / 2 - 2), 7, 5, k % 2 ? N.stone : N.stoneDark, 2);
      }
      ell(c, x + w / 2 + 22, y + h / 2 + 6, 9, 6, '#6fbf5a', 2);
      ell(c, x + w / 2 + 22, y + h / 2 + 4, 3, 3, N.sakura, 1);
      for (let k = 0; k < 2; k++) {
        const a = time * 0.7 + k * Math.PI;
        const fx = x + w / 2 + Math.cos(a) * (w / 2 - 26);
        const fy = y + h / 2 + Math.sin(a) * (h / 2 - 18);
        const dir = a + Math.PI / 2;
        ell(c, fx, fy, 8, 4, k ? '#ff9a4d' : '#ffffff', 1.5, dir);
        ell(c, fx - Math.cos(dir) * 8, fy - Math.sin(dir) * 8, 3.5, 3, k ? '#ff9a4d' : '#f08a7e', 1, dir);
      }
      return;
    }
    default:
      box(c, x, y, w, h, 6, '#ff00ff', 2);
  }
}

// ---------- Watak chibi ----------
export interface Look {
  skin: string;
  hair: string;
  shirt: string;
  pants: string;
  hijab?: string;
  apron?: boolean;
  headband?: string;
  gi?: boolean;
  belt?: string;
}

export const PLAYER_LOOK: Look = { skin: '#f6cfa8', hair: '#2b2230', shirt: '#4f86c6', pants: '#26324d', headband: '#ff8a1f', gi: true, belt: '#26324d' };

/** Kaki pada (x, y). walk = fasa langkah (radian) atau null bila diam. */
export function drawChibi(c: Ctx, x: number, y: number, facing: Facing, walk: number | null, look: Look, time: number) {
  const step = walk === null ? 0 : Math.sin(walk);
  const bob = walk === null ? Math.sin(time * 2.2 + x) * 0.6 : Math.abs(Math.cos(walk)) * -1.8;
  const side = facing === 'left' ? -1 : facing === 'right' ? 1 : 0;
  c.fillStyle = PAL.shadow;
  c.beginPath();
  c.ellipse(x, y, 14, 5, 0, 0, Math.PI * 2);
  c.fill();
  const legY = y - 12;
  if (side) {
    box(c, x - 4 + step * 4, legY, 8, 12, 3, look.pants, 2.5);
    box(c, x - 4 - step * 4, legY, 8, 12, 3, look.pants, 2.5);
  } else {
    box(c, x - 9, legY - Math.max(0, step) * 2, 8, 12 + Math.max(0, step) * 2, 3, look.pants, 2.5);
    box(c, x + 1, legY - Math.max(0, -step) * 2, 8, 12 + Math.max(0, -step) * 2, 3, look.pants, 2.5);
  }
  const by = y - 31 + bob;
  const swing = step * 3;
  if (!side) {
    box(c, x - 16, by + 4 + swing, 7, 15, 3.5, look.shirt, 2.5);
    box(c, x + 9, by + 4 - swing, 7, 15, 3.5, look.shirt, 2.5);
  }
  box(c, x - 11, by, 22, 22, 8, look.shirt, 2.5);
  if (look.gi) {
    if (facing !== 'up') line(c, [x - 7, by + 2, x + side * 2, by + 11, x + 7, by + 2], 'rgba(38,50,77,.55)', 2);
    box(c, x - 11, by + 12, 22, 4.5, 1.5, look.belt || O, 1.5);
  }
  if (look.apron) box(c, x - 7, by + 6, 14, 15, 3, '#ffffff', 2);
  if (side) box(c, x - 4 + swing * side, by + 4, 8, 15, 3.5, look.shirt, 2.5);
  const hy = by - 13;
  if (look.hijab) {
    ell(c, x, hy + 1, 17, 17, look.hijab, 2.5);
    c.beginPath();
    c.moveTo(x - 15, hy + 8);
    c.quadraticCurveTo(x, hy + 26, x + 15, hy + 8);
    c.lineTo(x + 13, by + 6);
    c.lineTo(x - 13, by + 6);
    c.closePath();
    paint(c, look.hijab, 2.5);
    if (facing !== 'up') ell(c, x + side * 4, hy + 3, 10, 11, look.skin, 2);
  } else {
    ell(c, x, hy, 15, 15, look.skin, 2.5);
    c.beginPath();
    if (facing === 'up') c.arc(x, hy, 15, 0, Math.PI * 2);
    else {
      c.arc(x, hy, 15, Math.PI * 1.02, Math.PI * 1.98);
      c.quadraticCurveTo(x + 6 + side * 6, hy - 1, x - side * 2, hy - 5);
      c.quadraticCurveTo(x - 8 + side * 6, hy - 1, x - 15, hy - 1);
    }
    c.closePath();
    paint(c, look.hair, 2.5);
  }
  if (look.headband && !look.hijab) {
    c.save();
    c.beginPath();
    c.arc(x, hy, 15.5, 0, Math.PI * 2);
    c.clip();
    c.fillStyle = look.headband;
    c.fillRect(x - 17, hy - 6, 34, 6);
    c.restore();
    c.strokeStyle = O;
    c.lineWidth = 1.5;
    c.beginPath();
    c.arc(x, hy, 15, 0, Math.PI * 2);
    c.stroke();
    const wave = Math.sin(time * 6) * 1.5;
    if (side) {
      const tx = x - side * 14;
      c.beginPath();
      c.moveTo(tx, hy - 5);
      c.lineTo(tx - side * 11, hy + 1 + wave);
      c.lineTo(tx - side * 8, hy + 6 + wave);
      c.lineTo(tx, hy);
      c.closePath();
      paint(c, look.headband, 2);
    } else if (facing === 'up') {
      for (const s of [-1, 1]) {
        c.beginPath();
        c.moveTo(x + s * 1, hy - 1);
        c.lineTo(x + s * 8 + wave, hy + 12);
        c.lineTo(x + s * 3 + wave, hy + 13);
        c.closePath();
        paint(c, look.headband, 2);
      }
      box(c, x - 4, hy - 5, 8, 6, 2, look.headband, 2);
    }
  }
  if (facing !== 'up') {
    const ex = x + side * 5;
    c.fillStyle = '#26324d';
    for (const dx of side ? [-3.5, 4.5] : [-5.5, 5.5]) {
      c.beginPath();
      c.ellipse(ex + dx, hy + 3, 2.4, 3.2, 0, 0, Math.PI * 2);
      c.fill();
    }
    c.fillStyle = 'rgba(255,140,140,.45)';
    c.beginPath();
    c.ellipse(ex - 9, hy + 8, 3, 2, 0, 0, Math.PI * 2);
    c.ellipse(ex + 9, hy + 8, 3, 2, 0, 0, Math.PI * 2);
    c.fill();
  }
}

/** Gelembung ikon (skrol kayu) di atas Kaunter Misi / Gerai Ganjaran. */
export function drawUtilityMarker(c: Ctx, x: number, y: number, icon: string, time: number, active: boolean, reduced: boolean) {
  const my = y + (reduced ? 0 : Math.sin(time * 2.4 + x) * 3);
  ell(c, x, my, 18, 18, active ? N.gold : '#fff3d6', 3);
  c.strokeStyle = active ? N.redDark : N.woodDark;
  c.lineWidth = 2;
  c.beginPath();
  c.arc(x, my, 13, 0, Math.PI * 2);
  c.stroke();
  c.font = `16px ${FONT}`;
  c.textAlign = 'center';
  c.textBaseline = 'middle';
  c.fillText(icon, x, my + 1);
}

/** Gelembung "…" melantun di atas NPC bila pemain dalam jarak bercakap, supaya kanak-kanak tahu NPC itu boleh disapa. */
export function drawTalkBubble(c: Ctx, x: number, headY: number, active: boolean, time: number, reduced: boolean) {
  if (!active) return;
  const bob = reduced ? 0 : Math.sin(time * 5) * 2;
  // gelembung bual "…" di atas kepala (nama NPC dipaparkan pada butang Bercakap & panel dialog)
  const by = headY - 16 + bob;
  rr(c, x - 15, by - 10, 30, 20, 9);
  paint(c, '#fffaf0', 2.5);
  c.beginPath();
  c.moveTo(x - 4, by + 9);
  c.lineTo(x, by + 15);
  c.lineTo(x + 4, by + 9);
  c.fillStyle = '#fffaf0';
  c.fill();
  c.strokeStyle = O;
  c.lineWidth = 2.5;
  c.stroke();
  c.fillStyle = '#fffaf0';
  c.fillRect(x - 3.5, by + 7, 7, 3);
  c.fillStyle = O;
  for (let i = -1; i <= 1; i++) {
    const a = reduced ? 1 : 0.4 + 0.6 * Math.max(0, Math.sin(time * 6 - i * 0.9));
    c.globalAlpha = a;
    c.beginPath();
    c.arc(x + i * 7, by, 2.4, 0, Math.PI * 2);
    c.fill();
  }
  c.globalAlpha = 1;
}

export { SHOPS };

// Pembantu lukisan dikongsi dengan scene luar (exterior.ts) supaya gaya garisan & warna sama.
export { N, rr, paint, box, ell, line, stick, grain, shuriken, blob, label, sakuraCanopy, hangingLantern, floor, block, shadow, bambooClump, outdoorSakura };
