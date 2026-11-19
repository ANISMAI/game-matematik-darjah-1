// Pemuat imej tahap: URL sebenar ATAU seni prototaip (dilukis sekali, disimpan sebagai blob URL).
// Imej hanya dimuat bila tahap dibuka (malas), dan disimpan dalam cache untuk main semula.
import type { ImageSource, SpotLevel } from './levels.ts';

const cache = new Map<string, Promise<string>>();

function keyOf(src: ImageSource, w: number, h: number) {
  return typeof src === 'string' ? src : `proto:${src.proto}:${src.variant}@${w}x${h}`;
}

async function resolve(src: ImageSource, w: number, h: number): Promise<string> {
  if (typeof src === 'string') return src;
  // seni prototaip dimuat secara malas — tidak masuk ke bundle utama akademi
  const { renderProtoScene } = await import('./proto-scenes.ts');
  const cv = renderProtoScene(src.proto, src.variant, w, h);
  const blob = await new Promise<Blob | null>((ok) => cv.toBlob(ok, 'image/png'));
  return blob ? URL.createObjectURL(blob) : cv.toDataURL('image/png');
}

/** Pastikan imej sudah dinyahkod sebelum interaksi dibenarkan. */
async function decoded(url: string): Promise<string> {
  const img = new Image();
  img.src = url;
  await img.decode();
  return url;
}

export function loadImage(src: ImageSource, w: number, h: number): Promise<string> {
  const k = keyOf(src, w, h);
  let p = cache.get(k);
  if (!p) {
    p = resolve(src, w, h).then(decoded);
    p.catch(() => cache.delete(k)); // benarkan cuba semula
    cache.set(k, p);
  }
  return p;
}

export async function loadLevelImages(level: SpotLevel): Promise<{ a: string; b: string }> {
  const [a, b] = await Promise.all([loadImage(level.imageA, level.width, level.height), loadImage(level.imageB, level.width, level.height)]);
  return { a, b };
}
