// Shuriken Master (Arena Latihan Ninja) — DEFINISI TAHAP (data sahaja; tiada syarat tahap dalam kod permainan).
// Koordinat dalam unit arena (ARENA.w × ARENA.h dalam physics.ts). Panduan menambah tahap: README.md.
// Papan diletak jauh ke belakang (y ≈ 190–360, dekat dinding) supaya ada jarak membaling yang jelas.

export const SHURIKEN_GAME_ID = 'shuriken-master';

/** Jenis gerakan sasaran (Fasa 5: pegun & gelongsor mendatar perlahan). */
export type Motion = { type: 'static' } | { type: 'slide'; amp: number; speed: number; phase?: number };

/** Petanda sasaran (tahap 'Pilih Sasaran'): warna + simbol, supaya tidak bergantung pada warna sahaja. */
export type Cue = 'star' | 'circle';

export interface TargetDef {
  id: string;
  /** Pusat papan sasaran (unit arena). */
  x: number;
  y: number;
  /** Jejari papan (unit arena). */
  r: number;
  motion: Motion;
  /** Tiada = papan sasaran biasa (bullseye). */
  cue?: Cue;
}

export interface ShurikenLevel {
  id: string;
  n: number;
  titleKey: string;
  introKey: string;
  targets: TargetDef[];
  /** Objektif: bilangan sasaran sah yang mesti dikena. */
  requiredHits: number;
  /** Jika ditetapkan, hanya sasaran dengan petanda ini dikira; yang lain = balingan tersasar (bukan gagal). */
  validCue?: Cue;
  /** Bantuan membidik: tambahan jejari kena (unit arena). Besar = lebih mudah. */
  aimAssist: number;
  /** Ambang bintang (peratus ketepatan). */
  stars: { three: number; two: number };
  /** Petunjuk percuma (tunjuk laluan ke satu sasaran). */
  hints: number;
  /** Tutorial dalam babak pada permainan pertama. */
  tutorial?: boolean;
  /** Tahap yang mesti selesai dahulu (null = dibuka dari awal). */
  unlockAfter: number | null;
}

const S = { type: 'static' } as const;
const slide = (amp: number, speed: number, phase = 0): Motion => ({ type: 'slide', amp, speed, phase });
const STARS = { three: 85, two: 60 };

export const SHURIKEN_LEVELS: ShurikenLevel[] = [
  {
    id: 'shuriken-1',
    n: 1,
    titleKey: 'shu.l1',
    introKey: 'shu.l1.intro',
    requiredHits: 3,
    aimAssist: 26,
    stars: STARS,
    hints: 1,
    tutorial: true,
    unlockAfter: null,
    targets: [
      { id: 'a', x: 128, y: 268, r: 41, motion: S },
      { id: 'b', x: 240, y: 228, r: 45, motion: S },
      { id: 'c', x: 352, y: 268, r: 41, motion: S },
    ],
  },
  {
    id: 'shuriken-2',
    n: 2,
    titleKey: 'shu.l2',
    introKey: 'shu.l2.intro',
    requiredHits: 4,
    aimAssist: 15,
    stars: STARS,
    hints: 1,
    unlockAfter: 1,
    targets: [
      { id: 'a', x: 92, y: 310, r: 31, motion: S },
      { id: 'b', x: 196, y: 224, r: 25, motion: S },
      { id: 'c', x: 304, y: 238, r: 38, motion: S },
      { id: 'd', x: 398, y: 318, r: 27, motion: S },
    ],
  },
  {
    id: 'shuriken-3',
    n: 3,
    titleKey: 'shu.l3',
    introKey: 'shu.l3.intro',
    requiredHits: 3,
    aimAssist: 16,
    stars: STARS,
    hints: 1,
    unlockAfter: 2,
    targets: [
      { id: 'a', x: 240, y: 200, r: 32, motion: slide(130, 0.7, 0) },
      { id: 'b', x: 240, y: 270, r: 36, motion: slide(150, 0.55, 2.1) },
      { id: 'c', x: 240, y: 342, r: 38, motion: slide(120, 0.8, 4.2) },
    ],
  },
  {
    id: 'shuriken-4',
    n: 4,
    titleKey: 'shu.l4',
    introKey: 'shu.l4.intro',
    requiredHits: 4,
    validCue: 'star',
    aimAssist: 10,
    stars: STARS,
    hints: 1,
    unlockAfter: 3,
    targets: [
      // setiap papan ⭐ ada laluan bersih dari tangan ninja (papan ● hanya menghalang papan ● lain)
      { id: 'a', x: 100, y: 212, r: 29, motion: S, cue: 'star' },
      { id: 'b', x: 240, y: 206, r: 29, motion: S, cue: 'circle' },
      { id: 'c', x: 380, y: 212, r: 29, motion: S, cue: 'star' },
      { id: 'd', x: 432, y: 266, r: 28, motion: S, cue: 'circle' },
      { id: 'e', x: 64, y: 334, r: 31, motion: S, cue: 'star' },
      { id: 'f', x: 250, y: 334, r: 31, motion: S, cue: 'circle' },
      { id: 'g', x: 420, y: 334, r: 31, motion: S, cue: 'star' },
    ],
  },
  {
    id: 'shuriken-5',
    n: 5,
    titleKey: 'shu.l5',
    introKey: 'shu.l5.intro',
    requiredHits: 5,
    aimAssist: 8,
    stars: STARS,
    hints: 2,
    unlockAfter: 4,
    targets: [
      { id: 'a', x: 240, y: 196, r: 27, motion: slide(140, 0.6, 0) },
      { id: 'b', x: 240, y: 260, r: 29, motion: slide(110, 0.75, 1.6) },
      { id: 'c', x: 96, y: 330, r: 27, motion: S },
      { id: 'd', x: 384, y: 330, r: 27, motion: S },
      { id: 'e', x: 240, y: 356, r: 25, motion: S },
    ],
  },
];

export const shurikenLevel = (n: number) => SHURIKEN_LEVELS.find((l) => l.n === n);
