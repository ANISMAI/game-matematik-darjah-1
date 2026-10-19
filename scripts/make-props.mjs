// Potong sprite sheet hiasan (assets-src/map/hiasan-<id>.png, grid 4 x 2, latar telus) kepada
// 8 fail WebP berasingan: public/map/hiasan/<id>-1..8.webp, dan rekod saiz dalam src/data/props.json.
// Susunan: 1 buluh, 2 pokok, 3 batu besar, 4 batu kecil, 5 semak, 6 bunga, 7 paku-pakis, 8 cendawan.
// Jalankan: node scripts/make-props.mjs
import { mkdir, readdir, readFile, writeFile } from 'node:fs/promises';
import sharp from 'sharp';

const SRC = 'assets-src/map';
const OUT = 'public/map/hiasan';
const JSON_OUT = 'src/data/props.json';
const COLS = 4;
const ROWS = 2;
const MAX = 320; // dipapar <= ~200 unit peta

await mkdir(OUT, { recursive: true });
const props = JSON.parse(await readFile(JSON_OUT, 'utf8').catch(() => '{}'));

for (const file of await readdir(SRC)) {
  const m = file.match(/^hiasan-(.+)\.png$/);
  if (!m) continue;
  const id = m[1];
  const buf = await readFile(`${SRC}/${file}`);
  const { data, info } = await sharp(buf).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
  const { width, height } = info;
  const alpha = (x, y) => data[(y * width + x) * 4 + 3];
  // Objek boleh melepasi garis grid; potong pada baris/lajur paling kosong berhampiran sempadan grid.
  const cut = (n, size, sum) =>
    Array.from({ length: n + 1 }, (_, k) => {
      if (k === 0) return 0;
      if (k === n) return size;
      const mid = Math.round((size * k) / n);
      let best = mid;
      let bestSum = Infinity;
      for (let v = mid - Math.round(size / n / 4); v <= mid + Math.round(size / n / 4); v++) {
        const t = sum(v);
        if (t < bestSum) {
          bestSum = t;
          best = v;
        }
      }
      return best;
    });
  const rows = cut(ROWS, height, (y) => {
    let t = 0;
    for (let x = 0; x < width; x += 2) t += alpha(x, y);
    return t;
  });
  const list = [];
  for (let r = 0; r < ROWS; r++) {
    const top = rows[r];
    const bh = rows[r + 1] - top;
    const cols = cut(COLS, width, (x) => {
      let t = 0;
      for (let y = top; y < top + bh; y += 2) t += alpha(x, y);
      return t;
    });
    for (let c = 0; c < COLS; c++) {
      const cell = await sharp(buf).extract({ left: cols[c], top, width: cols[c + 1] - cols[c], height: bh }).png().toBuffer();
      const trimmed = await sharp(cell).trim({ threshold: 10 }).toBuffer();
      const n = r * COLS + c + 1;
      const info = await sharp(trimmed)
        .resize(MAX, MAX, { fit: 'inside', withoutEnlargement: true })
        .webp({ quality: 85, alphaQuality: 90 })
        .toFile(`${OUT}/${id}-${n}.webp`);
      list.push({ src: `/map/hiasan/${id}-${n}.webp`, w: info.width, h: info.height });
    }
  }
  props[id] = list;
  console.log(`${file} -> ${OUT}/${id}-1..${list.length}.webp`);
}

await writeFile(JSON_OUT, JSON.stringify(props, null, 2) + '\n');
