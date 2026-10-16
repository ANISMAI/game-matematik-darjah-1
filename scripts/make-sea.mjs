// Jana tekstur laut berulang (public/map/laut.webp) sekali sahaja, supaya pelayar
// tidak perlu mengira penapis SVG semasa animasi. Jalankan: node scripts/make-sea.mjs
import sharp from 'sharp';

const S = 512;

const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${S}" height="${S}">
  <filter id="w" x="0" y="0" width="100%" height="100%" color-interpolation-filters="sRGB">
    <feTurbulence type="fractalNoise" baseFrequency="0.0059 0.0215" numOctaves="4" seed="7" stitchTiles="stitch" result="n"/>
    <feColorMatrix in="n" type="matrix" result="base" values="
      0.10 0 0 0 0.00
      0.34 0 0 0 0.30
      0.30 0 0 0 0.55
      0    0 0 0 1"/>
    <feSpecularLighting in="n" surfaceScale="4" specularConstant="0.85" specularExponent="22" lighting-color="#dff8ff" result="spec">
      <feDistantLight azimuth="235" elevation="38"/>
    </feSpecularLighting>
    <feComposite in="base" in2="spec" operator="arithmetic" k1="0" k2="1" k3="0.42" k4="0"/>
  </filter>
  <rect width="${S}" height="${S}" filter="url(#w)"/>
</svg>`;

// Tepi kesan cahaya tidak bercantum, jadi jubin dicerminkan menjadi 2x2 (1024px) yang bersambung lancar.
const tile = await sharp(Buffer.from(svg)).png().toBuffer();
const flop = await sharp(tile).flop().toBuffer();
const flip = await sharp(tile).flip().toBuffer();
const both = await sharp(tile).flip().flop().toBuffer();

await sharp({ create: { width: S * 2, height: S * 2, channels: 3, background: '#0a78b8' } })
  .composite([
    { input: tile, left: 0, top: 0 },
    { input: flop, left: S, top: 0 },
    { input: flip, left: 0, top: S },
    { input: both, left: S, top: S },
  ])
  .webp({ quality: 85 })
  .toFile('public/map/laut.webp');

const stats = await sharp('public/map/laut.webp').stats();
console.log('laut.webp siap. Purata RGB:', stats.channels.slice(0, 3).map((c) => Math.round(c.mean)).join(', '));
