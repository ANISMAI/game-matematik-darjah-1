// Potong sprite sheet pengembara (assets-src/map/<nama>.png, grid 4 lajur x 2 baris) kepada
// jalur WebP: <nama>-depan.webp (baris 1) dan <nama>-belakang.webp (baris 2), 4 frame sebaris.
// Saiz frame dicatat dalam src/data/traveller-sprites.json. Jalankan: npm run images
import { readFile, writeFile } from 'node:fs/promises';
import sharp from 'sharp';

export const SHEETS = ['ninja-jalan', 'kereta-sorong'];
const COLS = 4;
const ROWS = 2;
const FRAME_H = 160; // tinggi frame dalam fail (dipapar ~35px, jadi tajam di skrin 2x+)
const ROW_NAMES = ['depan', 'belakang'];
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

const meta = {};
for (const name of SHEETS) {
  const src = `assets-src/map/${name}.png`;
  const buf = await readFile(src).catch(() => null);
  if (!buf) continue;
  const { data, info } = await sharp(buf).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
  const { width: W, height: H, channels: c } = info;
  const cw = Math.floor(W / COLS);
  const ch = Math.floor(H / ROWS);
  meta[name] = {};

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
    const out = `public/map/${name}-${ROW_NAMES[row]}.webp`;
    await sharp({ create: { width: outW * COLS, height: FRAME_H, channels: 4, background: { r: 0, g: 0, b: 0, alpha: 0 } } })
      .composite(frames)
      .webp({ quality: 88, alphaQuality: 90 })
      .toFile(out);
    meta[name][ROW_NAMES[row]] = { frameW: outW, frameH: FRAME_H, frames: COLS };
    console.log(`${src} baris ${row + 1} -> ${out} (${COLS} x ${outW}x${FRAME_H})`);
  }
}

if (Object.keys(meta).length) await writeFile(OUT_JSON, JSON.stringify(meta, null, 2) + '\n');
