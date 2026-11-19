// Pembina bahan: menyusun sushi langkah demi langkah di atas tikar penyediaan (meja BAWAH).
// Ketikan salah TIDAK ditambah ke sushi — hanya dikira dan diberi maklum balas lembut.
import type { IngredientId, Recipe } from './recipes.ts';

export type TapResult = 'correct' | 'complete' | 'wrong' | 'noOrder' | 'locked';

export class IngredientBuilder {
  recipe: Recipe | null = null;
  steps: IngredientId[] = [];
  /** true semasa animasi gulung / menunggu dihantar — ketikan diabaikan (elak hantar berganda). */
  locked = false;

  /** Tukar resipi sasaran. Langkah dikekalkan jika resipi sama. */
  setRecipe(r: Recipe | null) {
    if (this.locked) return;
    if (this.recipe?.id !== r?.id) {
      this.recipe = r;
      this.steps = [];
    }
  }

  get expected(): IngredientId | null {
    return this.recipe?.steps[this.steps.length] ?? null;
  }

  get complete(): boolean {
    return !!this.recipe && this.steps.length === this.recipe.steps.length;
  }

  tap(id: IngredientId): TapResult {
    if (this.locked) return 'locked';
    if (!this.recipe) return 'noOrder';
    if (id !== this.expected) return 'wrong';
    this.steps.push(id);
    if (this.complete) {
      this.locked = true;
      return 'complete';
    }
    return 'correct';
  }

  /** Buang bahan terakhir. */
  undo(): boolean {
    if (this.locked || !this.steps.length) return false;
    this.steps.pop();
    return true;
  }

  /** Mula semula sushi ini (kosongkan tikar). */
  restart(): boolean {
    if (this.locked || !this.steps.length) return false;
    this.steps = [];
    return true;
  }

  /** Selepas sushi dipindah ke tali sawat. */
  clear() {
    this.locked = false;
    this.steps = [];
    this.recipe = null;
  }
}
