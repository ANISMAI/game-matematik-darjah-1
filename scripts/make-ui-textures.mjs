// Optimumkan tekstur UI yang dijana kepada WebP untuk digunakan dalam CSS.
import { access, mkdir } from 'node:fs/promises';
import sharp from 'sharp';

await mkdir('public/ui', { recursive: true });
for (const name of ['scroll-paper', 'scroll-wood']) {
  const src = `assets-src/ui/${name}.png`;
  if (!(await access(src).then(() => true, () => false))) continue;
  const out = `public/ui/${name}.webp`;
  const info = await sharp(src)
    .resize(768, 768, { fit: 'inside', withoutEnlargement: true })
    .webp({ quality: 82 })
    .toFile(out);
  console.log(`${src} -> ${out} (${Math.round(info.size / 1024)} KB)`);
}
