// Jana tekstur rumput berulang (public/map/rumput-<id>.webp) daripada bahagian tengah gambar latar
// assets-src/map/latar-<id>.png. Kepingan dicerminkan 2x2 supaya bercantum tanpa garis sambungan.
// Jalankan: node scripts/make-ground.mjs
import { readdir } from 'node:fs/promises';
import sharp from 'sharp';

const SRC = 'assets-src/map';
const TILE = 384;

for (const file of await readdir(SRC)) {
  const m = file.match(/^latar-(.+)\.png$/);
  if (!m) continue;
  const src = `${SRC}/${file}`;
  const { width, height } = await sharp(src).metadata();
  // ambil kepingan dari tengah (kawasan rumput lapang)
  const left = Math.round(width / 2 - TILE / 2);
  const top = Math.round(height * 0.42 - TILE / 2);
  const tile = await sharp(src).extract({ left, top, width: TILE, height: TILE }).png().toBuffer();
  const flop = await sharp(tile).flop().toBuffer();
  const flip = await sharp(tile).flip().toBuffer();
  const both = await sharp(tile).flip().flop().toBuffer();
  const out = `public/map/rumput-${m[1]}.webp`;
  await sharp({ create: { width: TILE * 2, height: TILE * 2, channels: 3, background: '#6aa83a' } })
    .composite([
      { input: tile, left: 0, top: 0 },
      { input: flop, left: TILE, top: 0 },
      { input: flip, left: 0, top: TILE },
      { input: both, left: TILE, top: TILE },
    ])
    .webp({ quality: 82 })
    .toFile(out);
  console.log(`${file} -> ${out}`);
}
