// Jalan pintas PEMBANGUNAN sahaja (import.meta.env.DEV) — tidak aktif dalam binaan production.
// URL:  #mall/dalam          → terus ke dalam akademi (langkau babak luar & tutorial)
//       #mall/sushi/3        → terus buka Sushi Master Ninja Tahap 3
//       #mall/spot/2         → terus buka Latihan Mata Ninja Tahap 2
//       #mall/shuriken/1     → terus buka Shuriken Master Tahap 1
//       #mall/mask/1         → terus buka Ninja Mask Designer Tahap 1
import { SPOT_GAME_ID, SPOT_LEVELS } from './spot/levels.ts';
import { SUSHI_GAME_ID, SUSHI_LEVELS } from './sushi/levels.ts';
import { SHURIKEN_GAME_ID, SHURIKEN_LEVELS } from './shuriken/levels.ts';
import { MASK_GAME_ID, MASK_LEVELS } from './mask/levels.ts';
import { reloadSave, updateSave } from './mall/save.ts';
import type { Facing } from './mall/config.ts';

export interface DevGame {
  key: string;
  gameId: string;
  name: string;
  npcId: string;
  /** Tempat pemain berdiri (depan NPC dojo) supaya "Kembali ke Dojo" mendarat di tempat betul. */
  at: { x: number; y: number; facing: Facing };
  levels: number;
}

export const DEV_GAMES: DevGame[] = [
  { key: 'spot', gameId: SPOT_GAME_ID, name: 'Latihan Mata Ninja', npcId: 'tekateki', at: { x: 346, y: 400, facing: 'up' }, levels: SPOT_LEVELS.length },
  { key: 'sushi', gameId: SUSHI_GAME_ID, name: 'Sushi Master Ninja', npcId: 'chef', at: { x: 460, y: 742, facing: 'up' }, levels: SUSHI_LEVELS.length },
  { key: 'shuriken', gameId: SHURIKEN_GAME_ID, name: 'Shuriken Master', npcId: 'jurulatih', at: { x: 1140, y: 262, facing: 'up' }, levels: SHURIKEN_LEVELS.length },
  { key: 'mask', gameId: MASK_GAME_ID, name: 'Ninja Mask Designer', npcId: 'seni', at: { x: 1184, y: 780, facing: 'up' }, levels: MASK_LEVELS.length },
];

export interface DevJump {
  game: DevGame | null;
  level: number;
}

/** Baca hash URL (DEV sahaja). null = aliran biasa. */
export function readDevJump(): DevJump | null {
  if (!import.meta.env.DEV) return null;
  const m = /^#mall\/([a-z-]+)(?:\/(\d+))?/.exec(window.location.hash);
  if (!m) return null;
  const game = DEV_GAMES.find((g) => g.key === m[1] || g.gameId === m[1]) ?? null;
  return { game, level: game ? Math.min(game.levels, Math.max(1, Number(m[2]) || 1)) : 1 };
}

export function setDevHash(hash: string) {
  history.replaceState(null, '', window.location.pathname + window.location.search + hash);
}

/** Tandakan semua tahap semua permainan sebagai selesai (buka kunci) — tanpa memberi ganjaran. */
export function devUnlockAll() {
  updateSave((s) => {
    s.tutorialDone = true;
    for (const g of DEV_GAMES) {
      const lv = (s.games[g.gameId] ??= {});
      for (let n = 1; n <= g.levels; n++) lv[String(n)] = { ...(lv[String(n)] ?? { stars: 0, rewarded: false, plays: 0 }), done: true };
    }
  });
}

/** Padam semua kemajuan akademi (tutorial, tahap, dompet). */
export function devResetProgress() {
  try {
    localStorage.removeItem('mall:save');
    localStorage.removeItem('mall:tutorialDone');
  } catch {
    /* abaikan */
  }
  reloadSave();
}
