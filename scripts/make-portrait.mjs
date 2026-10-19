// Peta anjakan untuk lambaian berterusan: seluruh potret kekal satu imej.
// Gerakan berkurang secara licin di pergelangan/lengan, tanpa mask yang membuka celah.
import { readFile, writeFile } from 'node:fs/promises';
import sharp from 'sharp';

const SRC = 'assets-src/map/ninja-potret.png';
const buf = await readFile(SRC).catch(() => null);
if (!buf) {
  console.log('ninja-potret.png tiada, langkau');
  process.exit(0);
}

const { width, height } = await sharp(buf).metadata();
const size = 1254;
const wrist = [330, 840];
const waveScale = 96;
const map = Buffer.alloc(width * height * 3);
const smooth = (start, end, value) => {
  const t = Math.max(0, Math.min(1, (value - start) / (end - start)));
  return t * t * (3 - 2 * t);
};

for (let y = 0; y < height; y++) {
  for (let x = 0; x < width; x++) {
    const px = (x * size) / width;
    const py = (y * size) / height;
    // Jari bergerak paling banyak; siku, muka dan ikatan kepala kekal stabil.
    // Sempadan serong memisahkan jari daripada hujung kain merah di atasnya.
    const top = Math.max(500, 790 - 1.1 * px);
    const weight = smooth(top - 20, top + 60, py)
      * (1 - smooth(780, 990, py))
      * smooth(65, 115, px)
      * (1 - smooth(350, 475, px));
    const dx = (py - wrist[1]) * 0.055 * weight;
    const dy = -(px - wrist[0]) * 0.055 * weight;
    const i = (y * width + x) * 3;
    map[i] = Math.round(255 * (0.5 + dx / waveScale));
    map[i + 1] = Math.round(255 * (0.5 + dy / waveScale));
    map[i + 2] = 128;
  }
}

await sharp(map, { raw: { width, height, channels: 3 } })
  .png()
  .toFile('public/map/ninja-potret-lambai.png');
await writeFile('src/data/portrait.json', JSON.stringify({ size, waveScale }) + '\n');
console.log('Potret: peta lambaian berterusan (tanpa potongan tangan)');
