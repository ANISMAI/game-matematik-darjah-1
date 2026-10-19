// Potong sprite sheet (assets-src/map/<nama>.png) kepada jalur WebP, semua frame sebaris:
//  - 2 baris: <nama>-depan.webp (baris 1) dan <nama>-belakang.webp (baris 2)
//  - 1 baris: <nama>.webp (cth. ninja-diri, ninja berdiri menghadap depan; tapak-tahap, 3 keadaan batu tahap)
// Saiz frame dicatat dalam src/data/traveller-sprites.json. Jalankan: npm run images
import { readFile, writeFile } from 'node:fs/promises';
import sharp from 'sharp';

// nama sheet -> nama baris (string kosong = satu baris, fail tanpa akhiran)
// cols = bilangan lajur, h = tinggi frame dalam fail (cukup tajam untuk saiz paparan di skrin 2x+)
const SHEET_ROWS = {
  'ninja-jalan': { rows: ['depan', 'belakang'], cols: 4, h: 160 },
  'kereta-sorong': { rows: ['depan', 'belakang'], cols: 4, h: 160 },
  'ninja-diri': { rows: [''], cols: 4, h: 160 },
  // batu tahap: 1 boleh main, 2 akan datang, 3 selesai (dipapar ~150 unit lebar)
  'tapak-tahap': { rows: [''], cols: 3, h: 300 },
};
export const SHEETS = Object.keys(SHEET_ROWS);
const OUT_JSON = 'src/data/traveller-sprites.json';

// Kotak sempadan piksel yang kelihatan dalam satu kawasan
function bounds(data, W, c, x0, y0, w, h) {
  let [l, t, r, b] = [Infinity, Infinity, -1, -1];
  for (let y = y0; y < y0 + h; y++)
    for (let x = x0; x < x0 + w; x++)
      if (data[(y * W + x) * c + 3] > 20) {
        l = Math.min(l, x);
        r = Math.max(r, x);
        t = Math.min(t, y);
        b = Math.max(b, y);
      }
  return { l, t, r, b };
}

// Gabung dengan data sedia ada supaya sheet yang PNG-nya sudah dipadam tidak hilang.
const meta = JSON.parse(await readFile(OUT_JSON, 'utf8').catch(() => '{}'));
for (const name of SHEETS) {
  const src = `assets-src/map/${name}.png`;
  const buf = await readFile(src).catch(() => null);
  if (!buf) continue;
  const { data, info } = await sharp(buf).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
  const { width: W, height: H, channels: c } = info;
  const ROW_NAMES = SHEET_ROWS[name].rows;
  const COLS = SHEET_ROWS[name].cols;
  const cw = Math.floor(W / COLS);
  const FRAME_H = SHEET_ROWS[name].h;
  const ROWS = ROW_NAMES.length;
  const ch = Math.floor(H / ROWS);
  meta[name] = meta[name] ?? {};

  for (let row = 0; row < ROWS; row++) {
    // Kotak sama untuk semua frame dalam baris (ikut kedudukan relatif dalam sel),
    // supaya watak tidak "melompat" antara frame.
    let [l, t, r, b] = [Infinity, Infinity, -1, -1];
    for (let col = 0; col < COLS; col++) {
      const bb = bounds(data, W, c, col * cw, row * ch, cw, ch);
      l = Math.min(l, bb.l - col * cw);
      r = Math.max(r, bb.r - col * cw);
      t = Math.min(t, bb.t - row * ch);
      b = Math.max(b, bb.b - row * ch);
    }
    const fw = r - l + 1;
    const fh = b - t + 1;
    const outW = Math.round((fw / fh) * FRAME_H);
    const frames = [];
    for (let col = 0; col < COLS; col++) {
      const f = await sharp(buf)
        .extract({ left: col * cw + l, top: row * ch + t, width: fw, height: fh })
        .resize(outW, FRAME_H)
        .png()
        .toBuffer();
      frames.push({ input: f, left: col * outW, top: 0 });
    }
    const key = ROW_NAMES[row] || 'diri';
    const out = ROW_NAMES[row] ? `public/map/${name}-${ROW_NAMES[row]}.webp` : `public/map/${name}.webp`;
    await sharp({ create: { width: outW * COLS, height: FRAME_H, channels: 4, background: { r: 0, g: 0, b: 0, alpha: 0 } } })
      .composite(frames)
      .webp({ quality: 88, alphaQuality: 90 })
      .toFile(out);
    meta[name][key] = { frameW: outW, frameH: FRAME_H, frames: COLS };
    console.log(`${src} baris ${row + 1} -> ${out} (${COLS} x ${outW}x${FRAME_H})`);
  }
}

if (Object.keys(meta).length) await writeFile(OUT_JSON, JSON.stringify(meta, null, 2) + '\n');
