// Ninja Mask Designer — PENDAFTARAN TAHAP (data sahaja). Tambah tahap = tambah objek; editor & pengesah sama.
import type { Tool } from './data.ts';

export const MASK_GAME_ID = 'mask-designer';

/** Objektif misi berstruktur (disahkan pada data reka bentuk, bukan piksel). */
export type Objective =
  | { type: 'regionColor'; region: string; color: string }
  | { type: 'decalCount'; item: string; count: number }
  | { type: 'decalAt'; family: string; anchor: string }
  | { type: 'mirrorPair'; kind: 'symbol' | 'pattern' }
  | { type: 'accessory'; family: 'headband' };

export interface MaskLevel {
  id: string;
  n: number;
  titleKey: string;
  /** Arahan ringkas guru (BM). */
  briefKey: string;
  templateId: 'basic' | 'twotone';
  objectives: Objective[];
  /** Alat dibuka semasa misi (mod bebas: semua alat). */
  allowedTools: Tool[];
  /** Pelekat/corak/aksesori yang dipaparkan semasa misi (termasuk pengalih). */
  items: string[];
  /** Tutorial mikro 1–2 langkah untuk alat baharu tahap ini. */
  tutorial: { icon: string; key: string }[];
  /** Ambang bintang (semakan gagal = mismatch). */
  stars: { threeMaxFails: number; twoMaxFails: number };
  unlockAfter: number | null;
}

const STARS = { threeMaxFails: 1, twoMaxFails: 3 };

export const MASK_LEVELS: MaskLevel[] = [
  {
    id: 'mask-01',
    n: 1,
    titleKey: 'mask.l1',
    briefKey: 'mask.l1.brief',
    templateId: 'basic',
    objectives: [
      { type: 'regionColor', region: 'main', color: 'blue' },
      { type: 'decalCount', item: 'star-yellow', count: 2 },
    ],
    allowedTools: ['colors', 'symbols'],
    items: ['star-yellow', 'star-red', 'moon-white', 'leaf-green'],
    tutorial: [
      { icon: '🎨', key: 'mask.tut.color' },
      { icon: '⭐', key: 'mask.tut.symbol' },
    ],
    stars: STARS,
    unlockAfter: null,
  },
  {
    id: 'mask-02',
    n: 2,
    titleKey: 'mask.l2',
    briefKey: 'mask.l2.brief',
    templateId: 'twotone',
    objectives: [
      { type: 'regionColor', region: 'upper', color: 'orange' },
      { type: 'regionColor', region: 'lower', color: 'teal' },
    ],
    allowedTools: ['colors'],
    items: [],
    tutorial: [{ icon: '🖌️', key: 'mask.tut.regions' }],
    stars: STARS,
    unlockAfter: 1,
  },
  {
    id: 'mask-03',
    n: 3,
    titleKey: 'mask.l3',
    briefKey: 'mask.l3.brief',
    templateId: 'basic',
    objectives: [
      { type: 'decalAt', family: 'leaf', anchor: 'forehead' },
      { type: 'decalAt', family: 'star', anchor: 'cheekL' },
    ],
    allowedTools: ['colors', 'symbols'],
    items: ['leaf-green', 'star-yellow', 'star-red', 'moon-white', 'flame-orange'],
    tutorial: [
      { icon: '📍', key: 'mask.tut.anchor' },
      { icon: '✋', key: 'mask.tut.drag' },
    ],
    stars: STARS,
    unlockAfter: 2,
  },
  {
    id: 'mask-04',
    n: 4,
    titleKey: 'mask.l4',
    briefKey: 'mask.l4.brief',
    templateId: 'basic',
    objectives: [{ type: 'mirrorPair', kind: 'symbol' }],
    allowedTools: ['colors', 'symbols'],
    items: ['star-yellow', 'moon-white', 'flame-orange', 'heart-pink', 'leaf-green'],
    tutorial: [{ icon: '🪞', key: 'mask.tut.mirror' }],
    stars: STARS,
    unlockAfter: 3,
  },
  {
    id: 'mask-05',
    n: 5,
    titleKey: 'mask.l5',
    briefKey: 'mask.l5.brief',
    templateId: 'basic',
    objectives: [
      { type: 'regionColor', region: 'main', color: 'purple' },
      { type: 'decalAt', family: 'shuriken', anchor: 'forehead' },
      { type: 'mirrorPair', kind: 'pattern' },
      { type: 'accessory', family: 'headband' },
    ],
    allowedTools: ['colors', 'symbols', 'patterns', 'accessories'],
    items: ['shuriken-silver', 'star-yellow', 'flame-orange', 'pat-stripes', 'pat-dots', 'pat-waves', 'band-red', 'band-gold', 'band-blue'],
    tutorial: [
      { icon: '〰️', key: 'mask.tut.pattern' },
      { icon: '🎀', key: 'mask.tut.accessory' },
    ],
    stars: STARS,
    unlockAfter: 4,
  },
];

export const maskLevel = (n: number) => MASK_LEVELS.find((l) => l.n === n);
