// Sushi Master Ninja — BAHAN & RESIPI (data sahaja).
// Resipi permainan yang dipermudah, bukan arahan masakan sebenar. Tiada aksi pisau untuk pemain.

export type IngredientId = 'rice' | 'nori' | 'egg' | 'cucumber' | 'salmon' | 'shrimp';

export interface Ingredient {
  id: IngredientId;
  /** Kunci teks nama (strings.ts). */
  nameKey: string;
  /** Warna utama (untuk sempadan butang & label bukan-warna-sahaja, ikon tetap dilukis). */
  color: string;
}

export const INGREDIENTS: Record<IngredientId, Ingredient> = {
  rice: { id: 'rice', nameKey: 'sushi.ing.rice', color: '#f4efe4' },
  nori: { id: 'nori', nameKey: 'sushi.ing.nori', color: '#2f4a3a' },
  egg: { id: 'egg', nameKey: 'sushi.ing.egg', color: '#ffd34d' },
  cucumber: { id: 'cucumber', nameKey: 'sushi.ing.cucumber', color: '#6cc04a' },
  salmon: { id: 'salmon', nameKey: 'sushi.ing.salmon', color: '#ff8a5c' },
  shrimp: { id: 'shrimp', nameKey: 'sushi.ing.shrimp', color: '#ff7043' },
};

export interface Recipe {
  id: string;
  nameKey: string;
  /** 'nigiri' = nasi + hirisan di atas; 'roll' = digulung dalam nori (maki). Menentukan cara lukisan. */
  kind: 'nigiri' | 'roll';
  /** Turutan ketikan bahan. */
  steps: IngredientId[];
}

export const RECIPES: Record<string, Recipe> = {
  tamago: { id: 'tamago', nameKey: 'sushi.r.tamago', kind: 'nigiri', steps: ['rice', 'egg'] },
  kappa: { id: 'kappa', nameKey: 'sushi.r.kappa', kind: 'roll', steps: ['nori', 'rice', 'cucumber'] },
  salmon: { id: 'salmon', nameKey: 'sushi.r.salmon', kind: 'roll', steps: ['nori', 'rice', 'salmon'] },
  ebi: { id: 'ebi', nameKey: 'sushi.r.ebi', kind: 'nigiri', steps: ['rice', 'shrimp'] },
  mixed: { id: 'mixed', nameKey: 'sushi.r.mixed', kind: 'roll', steps: ['nori', 'rice', 'cucumber', 'egg'] },
};

/**
 * Susunan petak dulang bahan (8 petak, 4 × 2) — tetap untuk semua tahap.
 * Bahan yang tiada dalam tahap = petak kosong; null = petak simpanan untuk bahan masa depan.
 */
export const TRAY_ORDER: (IngredientId | null)[] = ['rice', 'nori', 'egg', 'cucumber', 'salmon', 'shrimp', null, null];
