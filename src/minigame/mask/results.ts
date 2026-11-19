// Keputusan & ganjaran Ninja Mask Designer — simpanan & dompet akademi yang SAMA (mall/save.ts, mall/rewards.ts).
import { completeLevel } from '../mall/rewards.ts';
import type { RewardResult } from '../mall/rewards.ts';
import { levelProgress } from '../mall/save.ts';
import { MASK_GAME_ID } from './levels.ts';
import type { MaskLevel } from './levels.ts';
import { maskStars } from './model.ts';

export interface MaskResult {
  stars: 1 | 2 | 3;
  best: number;
  fails: number;
  hints: number;
  reward: RewardResult;
}

/**
 * Rekod misi lulus (dipanggil SEKALI semasa misi lulus — sebelum mod bebas). Formula sama seperti Sushi:
 * syiling ikut beza bintang terbaik + XP sekali; main semula tidak menggandakan ganjaran.
 */
export function recordMaskPass(level: MaskLevel, fails: number, hints: number): MaskResult {
  const stars = maskStars(level, fails, hints);
  const prev = levelProgress(MASK_GAME_ID, level.n);
  const reward = completeLevel(MASK_GAME_ID, level.n, stars, { policy: 'bestDelta', stats: { missionChecks: fails + 1 } });
  return { stars, best: Math.max(prev.stars, stars), fails, hints, reward };
}
