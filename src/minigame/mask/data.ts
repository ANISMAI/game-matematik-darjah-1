// Ninja Mask Designer — DATA ASET (warna, pelekat, corak, aksesori, templat & titik letak).
// Semua kedudukan dalam koordinat topeng (MASK.w × MASK.h) — bukan piksel skrin, jadi paparan responsif.

export const MASK = { w: 400, h: 460 };

export type Tool = 'colors' | 'symbols' | 'patterns' | 'accessories';

export interface ColorDef {
  id: string;
  nameKey: string;
  hex: string;
}

/** Palet (setiap warna ada nama — pilihan tidak bergantung pada warna sahaja). */
export const COLORS: ColorDef[] = [
  { id: 'blue', nameKey: 'mask.c.blue', hex: '#4f86c6' },
  { id: 'red', nameKey: 'mask.c.red', hex: '#d9443a' },
  { id: 'orange', nameKey: 'mask.c.orange', hex: '#ff9a4d' },
  { id: 'teal', nameKey: 'mask.c.teal', hex: '#2fa39a' },
  { id: 'green', nameKey: 'mask.c.green', hex: '#5fb87a' },
  { id: 'purple', nameKey: 'mask.c.purple', hex: '#8a5cc7' },
  { id: 'yellow', nameKey: 'mask.c.yellow', hex: '#f7c948' },
  { id: 'pink', nameKey: 'mask.c.pink', hex: '#f08db0' },
  { id: 'black', nameKey: 'mask.c.black', hex: '#2f3447' },
  { id: 'white', nameKey: 'mask.c.white', hex: '#f4efe4' },
];
export const colorById = (id: string) => COLORS.find((c) => c.id === id);

export type ItemKind = 'symbol' | 'pattern' | 'accessory';

export interface ItemDef {
  id: string;
  kind: ItemKind;
  /** Keluarga (contoh: semua bintang = 'star') — untuk objektif yang tidak kisah warna pelekat. */
  family: string;
  nameKey: string;
  /** Warna utama lukisan. */
  hex: string;
}

export const ITEMS: ItemDef[] = [
  // simbol (pelekat)
  { id: 'star-yellow', kind: 'symbol', family: 'star', nameKey: 'mask.i.starYellow', hex: '#f7c948' },
  { id: 'star-red', kind: 'symbol', family: 'star', nameKey: 'mask.i.starRed', hex: '#e8554a' },
  { id: 'leaf-green', kind: 'symbol', family: 'leaf', nameKey: 'mask.i.leaf', hex: '#5fb87a' },
  { id: 'moon-white', kind: 'symbol', family: 'moon', nameKey: 'mask.i.moon', hex: '#fff6d6' },
  { id: 'flame-orange', kind: 'symbol', family: 'flame', nameKey: 'mask.i.flame', hex: '#ff8a3d' },
  { id: 'shuriken-silver', kind: 'symbol', family: 'shuriken', nameKey: 'mask.i.shuriken', hex: '#c9d3e3' },
  { id: 'heart-pink', kind: 'symbol', family: 'heart', nameKey: 'mask.i.heart', hex: '#f08db0' },
  // corak (diletak pada kawasan sisi)
  { id: 'pat-stripes', kind: 'pattern', family: 'stripes', nameKey: 'mask.i.stripes', hex: '#fff3d6' },
  { id: 'pat-dots', kind: 'pattern', family: 'dots', nameKey: 'mask.i.dots', hex: '#fff3d6' },
  { id: 'pat-waves', kind: 'pattern', family: 'waves', nameKey: 'mask.i.waves', hex: '#ffd24d' },
  { id: 'pat-zigzag', kind: 'pattern', family: 'zigzag', nameKey: 'mask.i.zigzag', hex: '#ffd24d' },
  // aksesori (ikat kepala)
  { id: 'band-red', kind: 'accessory', family: 'headband', nameKey: 'mask.i.bandRed', hex: '#d9443a' },
  { id: 'band-blue', kind: 'accessory', family: 'headband', nameKey: 'mask.i.bandBlue', hex: '#3d6fb0' },
  { id: 'band-gold', kind: 'accessory', family: 'headband', nameKey: 'mask.i.bandGold', hex: '#f2b632' },
  { id: 'band-purple', kind: 'accessory', family: 'headband', nameKey: 'mask.i.bandPurple', hex: '#7a4fc0' },
];
export const itemById = (id: string) => ITEMS.find((i) => i.id === id);

export interface AnchorDef {
  id: string;
  nameKey: string;
  x: number;
  y: number;
  accepts: 'symbol' | 'pattern';
  /** Pasangan cermin (kiri ↔ kanan). */
  mirror?: string;
}

/** Titik letak (zon snap). "Kiri/kanan" = kiri/kanan seperti dilihat pada skrin. */
export const ANCHORS: AnchorDef[] = [
  { id: 'forehead', nameKey: 'mask.a.forehead', x: 200, y: 134, accepts: 'symbol' },
  { id: 'templeL', nameKey: 'mask.a.templeL', x: 112, y: 150, accepts: 'symbol', mirror: 'templeR' },
  { id: 'templeR', nameKey: 'mask.a.templeR', x: 288, y: 150, accepts: 'symbol', mirror: 'templeL' },
  { id: 'cheekL', nameKey: 'mask.a.cheekL', x: 132, y: 300, accepts: 'symbol', mirror: 'cheekR' },
  { id: 'cheekR', nameKey: 'mask.a.cheekR', x: 268, y: 300, accepts: 'symbol', mirror: 'cheekL' },
  { id: 'chin', nameKey: 'mask.a.chin', x: 200, y: 378, accepts: 'symbol' },
  { id: 'sideL', nameKey: 'mask.a.sideL', x: 80, y: 318, accepts: 'pattern', mirror: 'sideR' },
  { id: 'sideR', nameKey: 'mask.a.sideR', x: 320, y: 318, accepts: 'pattern', mirror: 'sideL' },
];
export const anchorById = (id: string) => ANCHORS.find((a) => a.id === id);

export interface TemplateDef {
  id: string;
  /** Kawasan warna boleh sunting. */
  regions: { id: string; nameKey: string }[];
}

export const TEMPLATES: Record<string, TemplateDef> = {
  basic: { id: 'basic', regions: [{ id: 'main', nameKey: 'mask.r.main' }] },
  twotone: { id: 'twotone', regions: [{ id: 'upper', nameKey: 'mask.r.upper' }, { id: 'lower', nameKey: 'mask.r.lower' }] },
};

/** Garis pemisah atas/bawah (templat dua warna) — di bawah jalur mata. */
export const EYE_BAND = { top: 186, bottom: 246 };
