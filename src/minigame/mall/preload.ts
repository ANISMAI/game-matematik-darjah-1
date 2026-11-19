// Pramuat sprite Mini Game Mall semasa aplikasi dibuka (di homepage), supaya bila pemain
// menekan "Mini Game", semua watak sudah siap dan tiada watak sementara yang berkelip.
// loadSheet() menyimpan hasil dalam cache, jadi MinigamePage menggunakan semula sheet yang sama.
import { NPCS, PLAYER_SPRITE } from './config.ts';
import { loadSheet } from './sprites.ts';

/** Tinggi rujukan sprite pemain untuk scene luar (resolusi lebih tinggi kerana watak dilukis besar). */
export const EXT_PLAYER_HEIGHT = 170;

let started = false;

export function preloadMallSprites() {
  if (started) return;
  started = true;
  const run = () => {
    loadSheet({ src: PLAYER_SPRITE.src, height: EXT_PLAYER_HEIGHT }); // scene luar (dilihat dahulu)
    loadSheet(PLAYER_SPRITE);
    for (const n of NPCS) {
      if (n.sprite) loadSheet(n.sprite);
      if (n.action) loadSheet(n.action);
    }
  };
  // jalankan ketika pelayar lapang supaya homepage tidak tersekat
  const w = window as Window & { requestIdleCallback?: (cb: () => void, o?: { timeout: number }) => number };
  if (w.requestIdleCallback) w.requestIdleCallback(run, { timeout: 1500 });
  else setTimeout(run, 300);
}
