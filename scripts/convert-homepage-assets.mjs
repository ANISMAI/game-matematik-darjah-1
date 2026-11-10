import { readdir, stat, unlink } from 'node:fs/promises';
import path from 'node:path';
import sharp from 'sharp';

const directory = path.resolve('public/home/homepage');
const expectedDirectory = path.resolve('public/home/homepage');

if (directory !== expectedDirectory) {
  throw new Error(`Folder sasaran tidak sah: ${directory}`);
}

const files = (await readdir(directory)).filter((file) => file.toLowerCase().endsWith('.png')).sort();
if (!files.length) {
  console.log('Tiada fail PNG untuk ditukar.');
  process.exit(0);
}

const converted = [];
for (const file of files) {
  const source = path.join(directory, file);
  const target = path.join(directory, `${path.parse(file).name}.webp`);
  const before = (await stat(source)).size;
  await sharp(source)
    .webp({ quality: 88, alphaQuality: 95, effort: 6, smartSubsample: true })
    .toFile(target);
  const metadata = await sharp(target).metadata();
  if (metadata.format !== 'webp' || !metadata.width || !metadata.height) {
    throw new Error(`Pengesahan WebP gagal: ${target}`);
  }
  const after = (await stat(target)).size;
  converted.push({ source, target, file, before, after, width: metadata.width, height: metadata.height });
}

if (converted.length !== files.length) {
  throw new Error(`Hanya ${converted.length}/${files.length} fail berjaya ditukar. PNG tidak dipadam.`);
}

for (const item of converted) {
  await unlink(item.source);
  const saved = Math.round((1 - item.after / item.before) * 100);
  console.log(`${item.file} -> ${path.basename(item.target)} | ${item.width}x${item.height} | jimat ${saved}%`);
}

console.log(`Selesai: ${converted.length} WebP disahkan dan ${converted.length} PNG dipadam secara kekal.`);
