// Jana mask darat (putih = darat termasuk tebing, hitam = laut) daripada pulau-tanah.webp.
// Air dikesan ikut warna, kemudian hanya air yang bersambung dengan tepi gambar dikira laut,
// jadi tasik dan sungai di dalam pulau kekal sebagai darat. Jalankan: node scripts/make-mask.mjs
import sharp from 'sharp';

const SRC = 'public/map/pulau-tanah.webp';
const OUT = 'public/map/pulau-mask.png';

const { data, info } = await sharp(SRC).removeAlpha().raw().toBuffer({ resolveWithObject: true });
const { width: w, height: h } = info;
const n = w * h;

const water = new Uint8Array(n);
for (let i = 0; i < n; i++) {
  const r = data[i * 3];
  const g = data[i * 3 + 1];
  const b = data[i * 3 + 2];
  // biru / biru kehijauan laut, termasuk buih yang kebiruan
  water[i] = b > r + 45 && b > 90 ? 1 : 0;
}

// Isi banjir dari tepi gambar melalui piksel air -> laut
const sea = new Uint8Array(n);
const stack = [];
const push = (i) => {
  if (water[i] && !sea[i]) {
    sea[i] = 1;
    stack.push(i);
  }
};
for (let x = 0; x < w; x++) {
  push(x);
  push((h - 1) * w + x);
}
for (let y = 0; y < h; y++) {
  push(y * w);
  push(y * w + w - 1);
}
while (stack.length) {
  const i = stack.pop();
  const x = i % w;
  if (x > 0) push(i - 1);
  if (x < w - 1) push(i + 1);
  if (i >= w) push(i - w);
  if (i < n - w) push(i + w);
}

const mask = Buffer.alloc(n);
for (let i = 0; i < n; i++) mask[i] = sea[i] ? 0 : 255;

// Buang bintik kecil (buih putih di laut) dan lembutkan tepi
await sharp(mask, { raw: { width: w, height: h, channels: 1 } })
  .median(7)
  .blur(1.2)
  .png({ compressionLevel: 9 })
  .toFile(OUT);

const land = mask.reduce((s, v) => s + (v ? 1 : 0), 0);
console.log(`${OUT} siap. Darat: ${Math.round((land / n) * 100)}%`);
