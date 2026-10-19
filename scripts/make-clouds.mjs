// Jana awan lembut realistik (public/map/awan-1..3.webp, latar telus) sekali sahaja.
// Bentuk (alfa) dan warna dijana berasingan, kemudian digabung:
//  - alfa: gugusan elips, tepi dikembangkan oleh feTurbulence supaya berkepul dan berjurai
//  - warna: putih di atas, biru kelabu di bawah, dengan tompok cahaya/bayang lembut
// Jalankan: node scripts/make-clouds.mjs
import sharp from 'sharp';

const W = 640;
const H = 320;

// [cx, cy, rx, ry] gumpalan bagi setiap awan
const SHAPES = [
  [
    [200, 200, 150, 70],
    [330, 170, 130, 85],
    [450, 205, 120, 60],
    [270, 230, 210, 45],
  ],
  [
    [180, 210, 120, 55],
    [300, 180, 110, 75],
    [420, 195, 95, 60],
    [300, 235, 190, 40],
  ],
  [
    [240, 200, 110, 60],
    [370, 190, 120, 70],
    [310, 235, 170, 40],
  ],
];

const ellipses = (blobs, dy = 0) => blobs.map(([cx, cy, rx, ry]) => `<ellipse cx="${cx}" cy="${cy + dy}" rx="${rx}" ry="${ry}"/>`).join('');

// Mask alfa: putih = awan
function alphaSvg(blobs, seed) {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}">
  <filter id="puff" x="-10%" y="-20%" width="120%" height="140%" color-interpolation-filters="sRGB">
    <feGaussianBlur in="SourceGraphic" stdDeviation="12" result="soft"/>
    <feTurbulence type="fractalNoise" baseFrequency="0.016" numOctaves="4" seed="${seed}" result="noise"/>
    <feDisplacementMap in="soft" in2="noise" scale="80" xChannelSelector="R" yChannelSelector="G" result="billow"/>
    <feGaussianBlur in="billow" stdDeviation="3"/>
  </filter>
  <rect width="100%" height="100%" fill="#000"/>
  <g fill="#fff" filter="url(#puff)">${ellipses(blobs)}</g>
</svg>`;
}

// Warna: kecerunan menegak + kepulan cahaya (atas) dan bayang (bawah) ikut bentuk
function colorSvg(blobs, seed) {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}">
  <defs>
    <linearGradient id="g" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="#ffffff"/>
      <stop offset=".5" stop-color="#eef4fa"/>
      <stop offset=".78" stop-color="#b9cde0"/>
      <stop offset="1" stop-color="#93aecb"/>
    </linearGradient>
    <filter id="blur"><feGaussianBlur stdDeviation="22"/></filter>
    <filter id="tex" color-interpolation-filters="sRGB">
      <feTurbulence type="fractalNoise" baseFrequency="0.03" numOctaves="3" seed="${seed + 3}"/>
      <feColorMatrix type="matrix" values="0 0 0 0 1  0 0 0 0 1  0 0 0 0 1  1.2 0 0 0 -0.55"/>
    </filter>
  </defs>
  <rect width="100%" height="100%" fill="url(#g)"/>
  <g fill="#7f9bbb" opacity=".45" filter="url(#blur)">${ellipses(blobs, 28)}</g>
  <g fill="#ffffff" opacity=".85" filter="url(#blur)">${ellipses(blobs.map(([x, y, rx, ry]) => [x - 10, y, rx * 0.75, ry * 0.6]), -22)}</g>
  <rect width="100%" height="100%" filter="url(#tex)" opacity=".5"/>
</svg>`;
}

for (let i = 0; i < SHAPES.length; i++) {
  const seed = 11 + i * 5;
  const alpha = await sharp(Buffer.from(alphaSvg(SHAPES[i], seed))).greyscale().raw().toBuffer();
  const color = await sharp(Buffer.from(colorSvg(SHAPES[i], seed))).removeAlpha().raw().toBuffer();
  const rgba = Buffer.alloc(W * H * 4);
  for (let p = 0; p < W * H; p++) {
    rgba[p * 4] = color[p * 3];
    rgba[p * 4 + 1] = color[p * 3 + 1];
    rgba[p * 4 + 2] = color[p * 3 + 2];
    rgba[p * 4 + 3] = Math.round(alpha[p] * 0.95);
  }
  const out = `public/map/awan-${i + 1}.webp`;
  const trimmed = await sharp(rgba, { raw: { width: W, height: H, channels: 4 } }).png().toBuffer();
  const info = await sharp(trimmed).trim({ threshold: 1 }).webp({ quality: 85, alphaQuality: 85 }).toFile(out);
  console.log(`${out} ${info.width}x${info.height}`);
}
