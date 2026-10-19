// Tukar gambar halaman utama (assets-src/home/**/*.png) kepada WebP dalam public/home/ (struktur folder sama).
// Kod merujuk fail ini sebagai "/home/<folder>/<nama>.webp". Jalankan: node scripts/home-to-webp.mjs
import { mkdir, readdir, stat } from 'node:fs/promises';
import path from 'node:path';
import sharp from 'sharp';

const SRC = 'assets-src/home';
const OUT = 'public/home';
const MAX = 1600; // latar paling besar dipapar penuh skrin; yang lain lebih kecil

async function* walk(dir) {
  for (const e of await readdir(dir, { withFileTypes: true }).catch(() => [])) {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) yield* walk(p);
    else if (/\.(png|jpe?g)$/i.test(e.name)) yield p;
  }
}

for await (const file of walk(SRC)) {
  const rel = path.relative(SRC, file).replace(/\.(png|jpe?g)$/i, '.webp');
  const target = path.join(OUT, rel);
  await mkdir(path.dirname(target), { recursive: true });
  await sharp(file)
    .resize(MAX, MAX, { fit: 'inside', withoutEnlargement: true })
    .webp({ quality: 85, alphaQuality: 90 })
    .toFile(target);
  const kb = (p) => stat(p).then((s) => Math.round(s.size / 1024));
  console.log(`${rel.padEnd(36)} ${await kb(file)} KB -> ${await kb(target)} KB`);
}
