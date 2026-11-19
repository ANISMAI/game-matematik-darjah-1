// Sushi Master Ninja — GEOMETRI PENTAS & TEMPAT DUDUK (data sahaja; unit logik pentas).
// Rujukan lakaran pasukan: tali sawat SEGI EMPAT (donut) mengelilingi chef di tengah; pelanggan duduk
// DI LUAR sisi tali sawat; meja bahan/penyediaan ialah zon berasingan DI BAWAH (DOM, bukan dalam pentas ini).

export const STAGE = { w: 600, h: 330 };

/** Garis tengah tali sawat (segi empat bucu bulat). Lebar tali = BELT_W. Arah gerakan: ikut jam. */
export const TRACK = { x: 202, y: 62, w: 196, h: 196, r: 34 };
export const BELT_W = 46;

/** Chef berdiri di ruang terbuka tengah segi empat. */
export const CHEF = { x: 300, y: 196 };

/** Titik sushi siap dimasukkan ke tali sawat (tengah sisi bawah — paling dekat dengan meja penyediaan). */
export const LOAD_POINT = { x: 300, y: TRACK.y + TRACK.h };

export interface SeatDef {
  /** ID stabil — pesanan sentiasa merujuk tempat duduk ini. */
  id: string;
  /** Nombor lencana pada gelembung & kad pesanan. */
  badge: number;
  /** Kedudukan kaki pelanggan. */
  x: number;
  y: number;
  facing: 'left' | 'right';
  /** Titik pada tali sawat di mana pinggan diambil untuk pelanggan ini. */
  belt: { x: number; y: number };
  /** Tempat pinggan diletak di depan pelanggan (atas rak kecil di luar tali sawat). */
  dish: { x: number; y: number };
}

export const SEATS: Record<string, SeatDef> = {
  L1: { id: 'L1', badge: 1, x: 92, y: 146, facing: 'right', belt: { x: TRACK.x, y: 118 }, dish: { x: 150, y: 120 } },
  R1: { id: 'R1', badge: 2, x: 508, y: 146, facing: 'left', belt: { x: TRACK.x + TRACK.w, y: 118 }, dish: { x: 450, y: 120 } },
  L2: { id: 'L2', badge: 3, x: 92, y: 282, facing: 'right', belt: { x: TRACK.x, y: 236 }, dish: { x: 150, y: 240 } },
  R2: { id: 'R2', badge: 4, x: 508, y: 282, facing: 'left', belt: { x: TRACK.x + TRACK.w, y: 236 }, dish: { x: 450, y: 240 } },
};
