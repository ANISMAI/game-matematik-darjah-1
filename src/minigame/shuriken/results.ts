// Keputusan & simpanan Shuriken Master — melalui simpanan & dompet akademi yang SAMA (mall/save.ts, mall/rewards.ts).
import { completeLevel } from '../mall/rewards.ts';
import type { RewardResult, RewardTable } from '../mall/rewards.ts';
import { levelProgress } from '../mall/save.ts';
import { SHURIKEN_GAME_ID } from './levels.ts';
import type { ShurikenLevel } from './levels.ts';
import { accuracy, shurikenStars } from './physics.ts';

/** Ganjaran cadangan brief (boleh ditala): 1★ 10🪙+15XP, 2★ 20🪙+25XP, 3★ 30🪙+40XP. */
export const SHURIKEN_REWARDS: RewardTable = { coins: [0, 10, 20, 30], xp: [0, 15, 25, 40] };

export interface ShurikenResult {
  stars: 1 | 2 | 3;
  best: number;
  accuracy: number;
  bestAccuracy: number;
  hits: number;
  throws: number;
  misses: number;
  score: number;
  reward: RewardResult;
}

/** Simpan penyelesaian: bintang & ketepatan terbaik hanya naik; ganjaran = beza nilai bintang terbaik (tiada ganda). */
export function saveShurikenResult(level: ShurikenLevel, hits: number, throws: number, hintsUsed: number, score: number): ShurikenResult {
  const acc = accuracy(hits, throws);
  const stars = shurikenStars(level, acc, hintsUsed);
  const prev = levelProgress(SHURIKEN_GAME_ID, level.n);
  const reward = completeLevel(SHURIKEN_GAME_ID, level.n, stars, {
    policy: 'bestDelta',
    table: SHURIKEN_REWARDS,
    maxStats: { bestAccuracy: acc, bestScore: score },
  });
  return {
    stars,
    best: Math.max(prev.stars, stars),
    accuracy: acc,
    bestAccuracy: Math.max(prev.stats?.bestAccuracy ?? 0, acc),
    hits,
    throws,
    misses: throws - hits,
    score,
    reward,
  };
}
