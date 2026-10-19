// Tukar gambar asal (assets-src/map/*.png|jpg) kepada WebP dalam public/map/.
// Bangunan dipotong rapat (tiada ruang telus) dan saiznya dicatat dalam
// src/data/sprite-sizes.json supaya kaki bangunan boleh diletak tepat di tanah.
// Jalankan: npm run images
import { readdir, mkdir, readFile, stat, writeFile } from 'node:fs/promises';
import path from 'node:path';
import sharp from 'sharp';

const SRC = 'assets-src/map';
const OUT = 'public/map';
const SIZES = 'src/data/sprite-sizes.json';
const GROUND = 'pulau-tanah';
// Sprite sheet pengembara diproses oleh scripts/make-sprites.mjs
const SHEETS = ['ninja-jalan', 'kereta-sorong'];
const SPRITE_MAX = 1024; // dipapar ~170px; besar supaya kekal tajam bila peta dizum 2x

await mkdir(OUT, { recursive: true });
// Gabung dengan saiz sedia ada supaya bangunan yang PNG asalnya tiada tidak hilang.
const sizes = JSON.parse(await readFile(SIZES, 'utf8').catch(() => '{}'));

for (const file of (await readdir(SRC)).sort()) {
  if (!/\.(png|jpe?g|webp)$/i.test(file)) continue;
  const name = path.parse(file).name;
  if (SHEETS.includes(name)) continue;
  const target = path.join(OUT, `${name}.webp`);
  if (name === GROUND) {
    // 3072px (2x koordinat peta) supaya kekal tajam bila dizum; koordinat peta kekal 1536 x 1024
    await sharp(path.join(SRC, file)).resize({ width: 3072, withoutEnlargement: true }).webp({ quality: 80 }).toFile(target);
  } else {
    const trimmed = await sharp(path.join(SRC, file)).trim({ threshold: 10 }).toBuffer();
    const info = await sharp(trimmed)
      .resize(SPRITE_MAX, SPRITE_MAX, { fit: 'inside' })
      .webp({ quality: 85, alphaQuality: 90 })
      .toFile(target);
    sizes[name] = { w: info.width, h: info.height };
  }
  const kb = Math.round((await stat(target)).size / 1024);
  console.log(`${file} -> ${target} (${kb} KB)`);
}

await writeFile(SIZES, JSON.stringify(sizes, null, 2) + '\n');
console.log(`Saiz bangunan -> ${SIZES}`);
