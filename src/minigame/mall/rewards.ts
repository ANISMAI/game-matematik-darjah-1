// Penyesuai ganjaran akademi (SEMENTARA) — SATU dompet untuk semua permainan mini akademi.
// Projek belum ada servis syiling/XP bersama yang disimpan (syiling homepage hanya keadaan sesi dalam App.jsx),
// jadi ganjaran dikumpul dalam dompet simpanan akademi (save.ts). Bila ekonomi bersama siap, tukar badan
// completeLevel() sahaja — pemanggil tidak perlu berubah.
import { updateSave, levelProgress } from './save.ts';

/** Nilai sementara — tala selepas ujian main. coinsByStars[bintang]. */
export const REWARD_TABLE = { coinsByStars: [0, 10, 20, 30], xpFirstClear: 20 };

/**
 * Polisi ganjaran:
 * - 'firstClear': syiling + XP sekali sahaja pada penyelesaian pertama (Latihan Mata Ninja).
 * - 'bestDelta' : XP sekali pada penyelesaian pertama; syiling = beza nilai bintang TERBAIK baharu berbanding
 *                 terbaik lama (main semula untuk naik bintang dapat bezanya sahaja — tiada ladang syiling).
 */
export type RewardPolicy = 'firstClear' | 'bestDelta';

/** Jadual ganjaran khusus permainan (pilihan). coins/xp diindeks mengikut bintang [0..3]. */
export interface RewardTable {
  coins: number[];
  /** Tiada = XP tetap REWARD_TABLE.xpFirstClear pada penyelesaian pertama. */
  xp?: number[];
}

export interface RewardResult {
  coins: number;
  xp: number;
  /** true jika ada apa-apa ganjaran diberi kali ini. */
  granted: boolean;
}

/** Kira ganjaran tanpa menyimpan. */
export function previewLevelReward(gameId: string, level: number, stars: number, policy: RewardPolicy = 'firstClear', custom?: RewardTable): RewardResult {
  const prev = levelProgress(gameId, level);
  const table = custom?.coins ?? REWARD_TABLE.coinsByStars;
  const xpOf = (st: number) => (custom?.xp ? (custom.xp[st] ?? 0) : REWARD_TABLE.xpFirstClear);
  let coins = 0;
  let xp = 0;
  if (policy === 'firstClear') {
    if (!prev.rewarded) {
      coins = table[stars] ?? 0;
      xp = xpOf(stars);
    }
  } else {
    // beza nilai bintang terbaik sahaja (syiling; dan XP jika jadual XP ikut bintang)
    const before = prev.rewarded ? (table[prev.stars] ?? 0) : 0;
    coins = Math.max(0, (table[stars] ?? 0) - before);
    if (custom?.xp) xp = Math.max(0, xpOf(stars) - (prev.rewarded ? xpOf(prev.stars) : 0));
    else xp = prev.rewarded ? 0 : REWARD_TABLE.xpFirstClear;
  }
  return { coins, xp, granted: coins > 0 || xp > 0 };
}

/**
 * Rekod penyelesaian tahap + beri ganjaran mengikut polisi.
 * Bintang terbaik dan status buka kunci tidak pernah diturunkan oleh main semula.
 * stats (pilihan) dijumlahkan ke statistik terkumpul tahap (contoh: bilangan pesanan dihidang).
 */
export function completeLevel(
  gameId: string,
  level: number,
  stars: number,
  opts: { policy?: RewardPolicy; stats?: Record<string, number>; maxStats?: Record<string, number>; table?: RewardTable } = {},
): RewardResult {
  const reward = previewLevelReward(gameId, level, stars, opts.policy, opts.table);
  updateSave((s) => {
    const g = (s.games[gameId] ??= {});
    const prev = g[String(level)] ?? { done: false, stars: 0, rewarded: false, plays: 0 };
    const stats = { ...(prev.stats ?? {}) };
    for (const [k, v] of Object.entries(opts.stats ?? {})) stats[k] = (stats[k] ?? 0) + v;
    // statistik "terbaik" (contoh: ketepatan terbaik) — hanya naik
    for (const [k, v] of Object.entries(opts.maxStats ?? {})) stats[k] = Math.max(stats[k] ?? 0, v);
    g[String(level)] = {
      done: true,
      stars: Math.max(prev.stars, stars),
      rewarded: true,
      plays: prev.plays + 1,
      ...(Object.keys(stats).length ? { stats } : {}),
    };
    s.wallet.coins += reward.coins;
    s.wallet.xp += reward.xp;
  });
  return reward;
}
