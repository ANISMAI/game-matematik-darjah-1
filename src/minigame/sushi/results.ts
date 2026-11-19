// Keputusan & simpanan Sushi Master Ninja — melalui simpanan & dompet akademi yang SAMA (mall/save.ts, mall/rewards.ts).
import { completeLevel } from '../mall/rewards.ts';
import type { RewardResult } from '../mall/rewards.ts';
import { levelProgress } from '../mall/save.ts';
import { SUSHI_GAME_ID } from './levels.ts';
import type { SushiLevel } from './levels.ts';
import { sushiStars } from './session.ts';

export interface SushiResult {
  stars: 1 | 2 | 3;
  /** Bintang terbaik selepas keputusan ini disimpan. */
  best: number;
  served: number;
  total: number;
  wrong: number;
  reward: RewardResult;
}

/**
 * Simpan penyelesaian tahap (sekali setiap percubaan). Ganjaran: XP sekali pada penyelesaian pertama,
 * syiling = beza nilai bintang terbaik (main semula tidak menggandakan ganjaran).
 */
export function saveSushiResult(level: SushiLevel, served: number, wrong: number): SushiResult {
  const stars = sushiStars(level, wrong);
  const before = levelProgress(SUSHI_GAME_ID, level.n).stars;
  const reward = completeLevel(SUSHI_GAME_ID, level.n, stars, { policy: 'bestDelta', stats: { orders: served } });
  return { stars, best: Math.max(before, stars), served, total: level.orders.length, wrong, reward };
}
