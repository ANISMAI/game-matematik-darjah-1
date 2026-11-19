// Sushi Master Ninja — KONFIGURASI TAHAP (data sahaja; tiada syarat tahap dalam kod permainan).
// Tambah tahap: tambah objek di bawah. Resipi: recipes.ts. Tempat duduk: layout.ts.

export const SUSHI_GAME_ID = 'sushi-master';

export interface SushiLevel {
  n: number;
  titleKey: string;
  /** Turutan pesanan (id resipi) — deterministik, mudah diuji & disemak. Panjang = sasaran pesanan. */
  orders: string[];
  /** Tempat duduk digunakan (id dalam layout.ts), mengikut turutan diisi. */
  seats: string[];
  /** Maksimum pesanan aktif serentak (pelanggan yang menunggu / sedang dihantar). */
  maxActive: number;
  /** Bahan yang dipaparkan di meja (termasuk pengalih perhatian yang tidak diperlukan). */
  ingredients: string[];
  /** Anak panah menunjuk bahan seterusnya (tahap berpandu). */
  guided: boolean;
  tutorial?: boolean;
  /** Ambang bintang: 3★ = salah ≤ three; 2★ = salah ≤ two; 1★ = selesai. */
  starRules: { three: number; two: number };
  /** Petunjuk percuma (tunjuk bahan seterusnya seketika). */
  hints: number;
}

export const SUSHI_LEVELS: SushiLevel[] = [
  { n: 1, titleKey: 'sushi.l1', orders: ['tamago', 'tamago'], seats: ['L1'], maxActive: 1, ingredients: ['rice', 'egg'], guided: true, tutorial: true, starRules: { three: 1, two: 4 }, hints: 0 },
  { n: 2, titleKey: 'sushi.l2', orders: ['kappa', 'kappa', 'kappa'], seats: ['R1'], maxActive: 1, ingredients: ['nori', 'rice', 'cucumber'], guided: false, starRules: { three: 1, two: 4 }, hints: 1 },
  { n: 3, titleKey: 'sushi.l3', orders: ['kappa', 'salmon', 'salmon', 'kappa'], seats: ['L1', 'R1'], maxActive: 1, ingredients: ['nori', 'rice', 'cucumber', 'salmon', 'egg', 'shrimp'], guided: false, starRules: { three: 1, two: 4 }, hints: 1 },
  { n: 4, titleKey: 'sushi.l4', orders: ['ebi', 'salmon', 'tamago', 'ebi', 'kappa'], seats: ['L1', 'R2'], maxActive: 2, ingredients: ['rice', 'nori', 'egg', 'cucumber', 'salmon', 'shrimp'], guided: false, starRules: { three: 1, two: 4 }, hints: 2 },
  { n: 5, titleKey: 'sushi.l5', orders: ['mixed', 'tamago', 'salmon', 'mixed', 'ebi', 'kappa'], seats: ['L1', 'R1', 'L2'], maxActive: 3, ingredients: ['rice', 'nori', 'egg', 'cucumber', 'salmon', 'shrimp'], guided: false, starRules: { three: 1, two: 4 }, hints: 2 },
];

export const sushiLevel = (n: number) => SUSHI_LEVELS.find((l) => l.n === n);
