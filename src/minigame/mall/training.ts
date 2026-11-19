// Data latihan dojo, misi & ganjaran.
// Satu dojo = SATU permainan mini, banyak tahap. Fasa 3: Dojo Teka-Teki → Latihan Mata Ninja (cari perbezaan).
// Fasa 4: Dapur Bento Ninja → Sushi Master Ninja. Fasa 5: Arena Latihan Ninja → Shuriken Master.
// Dojo lain masih paparan "Akan Datang" (tiada gameId).
import { loadSave, updateSave, levelProgress } from './save.ts';
import { SPOT_GAME_ID, SPOT_LEVELS } from '../spot/levels.ts';
import { SUSHI_GAME_ID, SUSHI_LEVELS } from '../sushi/levels.ts';
import { SHURIKEN_GAME_ID, SHURIKEN_LEVELS } from '../shuriken/levels.ts';
import { MASK_GAME_ID, MASK_LEVELS } from '../mask/levels.ts';

export interface LevelDef {
  /** Nombor tahap (1, 2, 3…). */
  n: number;
  /** id permainan mini. null = paparan "Akan Datang". */
  gameId: string | null;
}

const PLACEHOLDER_LEVELS = 6;
export const placeholder = (): LevelDef[] => Array.from({ length: PLACEHOLDER_LEVELS }, (_, i) => ({ n: i + 1, gameId: null }));

/** Tahap bagi setiap dojo (id kedai dalam config.ts). */
export const DOJO_LEVELS: Record<string, LevelDef[]> = {
  puzzle: SPOT_LEVELS.map((l) => ({ n: l.n, gameId: SPOT_GAME_ID })),
  food: SUSHI_LEVELS.map((l) => ({ n: l.n, gameId: SUSHI_GAME_ID })),
  arcade: SHURIKEN_LEVELS.map((l) => ({ n: l.n, gameId: SHURIKEN_GAME_ID })),
  creative: MASK_LEVELS.map((l) => ({ n: l.n, gameId: MASK_GAME_ID })),
};

/** Tahap 1 sentiasa dibuka; tahap seterusnya dibuka bila tahap sebelumnya pernah selesai. */
export function isLevelUnlocked(shopId: string, level: number): boolean {
  if (level === 1) return true;
  const gameId = DOJO_LEVELS[shopId]?.[level - 2]?.gameId;
  return gameId ? levelProgress(gameId, level - 1).done : false;
}

/** Bintang terbaik yang disimpan (0–3). */
export function levelStars(shopId: string, level: number): number {
  const gameId = DOJO_LEVELS[shopId]?.[level - 1]?.gameId;
  return gameId ? levelProgress(gameId, level).stars : 0;
}

/** Contoh misi akademi (semua Akan Datang). */
export const MISSIONS: { icon: string; key: string }[] = [
  { icon: '🧩', key: 'mission.1' },
  { icon: '🍱', key: 'mission.2' },
  { icon: '🥋', key: 'mission.3' },
  { icon: '🖌️', key: 'mission.4' },
];

/** Contoh ganjaran (semua berkunci). */
export const REWARDS: { icon: string; key: string; cat: 'acc' | 'costume' | 'decor' }[] = [
  { icon: '🎗️', key: 'reward.item.1', cat: 'acc' },
  { icon: '✴️', key: 'reward.item.2', cat: 'acc' },
  { icon: '🥋', key: 'reward.item.3', cat: 'costume' },
  { icon: '👘', key: 'reward.item.4', cat: 'costume' },
  { icon: '🏮', key: 'reward.item.5', cat: 'decor' },
  { icon: '🌸', key: 'reward.item.6', cat: 'decor' },
];

// ---------- Tutorial ----------
export function tutorialDone(): boolean {
  return loadSave().tutorialDone;
}

export function markTutorialDone() {
  if (!tutorialDone()) updateSave((s) => (s.tutorialDone = true));
}
