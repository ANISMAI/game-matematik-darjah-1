// Latihan Mata Ninja (cari perbezaan) — DEFINISI TAHAP.
// Kandungan sahaja; enjin dalam engine.ts / SpotGame.tsx. Panduan menambah tahap: lihat README.md (folder ini).
//
// Koordinat kawasan perbezaan disimpan dalam unit TERNORMAL 0–1 (x mengikut lebar imej, y mengikut tinggi).
// Bulatan: r ialah pecahan LEBAR imej. Segi empat: x,y,w,h. Poligon: senarai [x,y].

export type Hotspot =
  | { type: 'circle'; cx: number; cy: number; r: number }
  | { type: 'rect'; x: number; y: number; w: number; h: number }
  | { type: 'poly'; points: [number, number][] };

export interface SpotDifference {
  id: string;
  shape: Hotspot;
  /** Penerangan untuk penyemak (bukan dipaparkan kepada pemain). */
  note: string;
}

/**
 * Sumber imej: URL fail sebenar (contoh '/minigame/mata-ninja/tahap-1-a.webp'),
 * atau { proto } = seni PROTOTAIP yang dilukis dengan kod (proto-scenes.ts) sehingga ilustrasi sebenar siap.
 */
export type ImageSource = string | { proto: string; variant: 'A' | 'B' };

export interface SpotLevel {
  id: string;
  n: number;
  /** Kunci teks tajuk (strings.ts). */
  titleKey: string;
  /** Saiz asli imej (piksel). Imej A & B MESTI sama saiz dan sama bingkai. */
  width: number;
  height: number;
  imageA: ImageSource;
  imageB: ImageSource;
  differences: SpotDifference[];
  /** Polisi petunjuk: bilangan petunjuk percuma setiap percubaan. */
  hints: number;
  difficulty: 'sangat mudah' | 'mudah' | 'mudah-sederhana' | 'sederhana';
  /** Tunjuk tutorial ringkas sebelum mula. */
  tutorial?: boolean;
  /** Ambang bintang: 3★ = tanpa petunjuk & salah ≤ three; 2★ = salah ≤ two (atau guna petunjuk); 1★ = selesai. */
  starRules: { three: number; two: number };
  /** true = seni prototaip yang perlu diganti dengan ilustrasi sebenar. */
  placeholderArt: boolean;
}

export const SPOT_GAME_ID = 'mata-ninja';

// Seni prototaip dilukis dalam ruang 480×360 unit, dieksport pada 960×720 piksel.
const SW = 480;
const SH = 360;
/** Bulatan dalam unit adegan prototaip → koordinat ternormal. */
const C = (x: number, y: number, r: number): Hotspot => ({ type: 'circle', cx: x / SW, cy: y / SH, r: r / SW });
/** Segi empat dalam unit adegan prototaip → koordinat ternormal. */
const R = (x: number, y: number, w: number, h: number): Hotspot => ({ type: 'rect', x: x / SW, y: y / SH, w: w / SW, h: h / SH });
/** Segi empat dalam PIKSEL imej sebenar (lebar W, tinggi H) → koordinat ternormal. */
const PX = (x: number, y: number, w: number, h: number, W: number, H: number): Hotspot => ({ type: 'rect', x: x / W, y: y / H, w: w / W, h: h / H });
const proto = (id: string) => ({ imageA: { proto: id, variant: 'A' as const }, imageB: { proto: id, variant: 'B' as const } });
const BASE = { width: 960, height: 720, hints: 1, placeholderArt: true };

export const SPOT_LEVELS: SpotLevel[] = [
  {
    // ILUSTRASI SEBENAR (1672×941). Kawasan dikira daripada perbandingan piksel A/B + jidar ±12px.
    id: 'mata-ninja-1',
    n: 1,
    titleKey: 'spot.l1',
    width: 1672,
    height: 941,
    imageA: '/mall/mini%20game%201/tahap-1-a.webp',
    imageB: '/mall/mini%20game%201/tahap-1-b.webp',
    hints: 1,
    placeholderArt: false,
    difficulty: 'sangat mudah',
    tutorial: true,
    starRules: { three: 3, two: 8 },
    differences: [
      { id: 'tanglung', shape: PX(92, 48, 144, 144, 1672, 941), note: 'Tanglung kiri: merah (A) → biru (B)' },
      { id: 'patung', shape: PX(304, 228, 228, 384, 1672, 941), note: 'Patung latihan kedua hilang dalam B' },
      { id: 'sepanduk', shape: PX(724, 68, 228, 216, 1672, 941), note: 'Shuriken emas pada sepanduk hilang dalam B' },
    ],
  },
  {
    // ILUSTRASI SEBENAR (A 1671×941, B 1672×941 — beza 1px, dipapar dalam kotak sama). Kawasan + jidar ±12px.
    id: 'mata-ninja-2',
    n: 2,
    titleKey: 'spot.l2',
    width: 1671,
    height: 941,
    imageA: '/mall/mini%20game%201/tahap-2-a.webp',
    imageB: '/mall/mini%20game%201/tahap-2-b.webp',
    hints: 1,
    placeholderArt: false,
    difficulty: 'mudah',
    starRules: { three: 3, two: 8 },
    differences: [
      { id: 'pasu', shape: PX(32, 228, 280, 444, 1671, 941), note: 'Kiri: tanglung batu (A) ↔ pasu buluh (B)' },
      { id: 'bendera', shape: PX(1272, 0, 332, 352, 1671, 941), note: 'Sepanduk kanan atas: hijau (A) ↔ merah (B)' },
      { id: 'kucing', shape: PX(1284, 640, 360, 240, 1671, 941), note: 'Kucing tidur atas kusyen biru hanya dalam B' },
    ],
  },
  {
    ...BASE,
    id: 'mata-ninja-3',
    n: 3,
    titleKey: 'spot.l3',
    ...proto('taman'),
    difficulty: 'mudah-sederhana',
    starRules: { three: 3, two: 8 },
    differences: [
      { id: 'buluh', shape: R(421, 0, 57, 60), note: 'Rumpun buluh paling kanan hilang dalam B' },
      { id: 'katak', shape: C(347, 193, 23), note: 'Katak atas daun teratai muncul dalam B' },
      { id: 'bunga', shape: C(93, 320, 31), note: 'Bunga kiri bawah: merah jambu (A) → kuning (B)' },
      { id: 'burung', shape: C(430, 268, 28), note: 'Burung atas batu hilang dalam B' },
    ],
  },
  {
    ...BASE,
    id: 'mata-ninja-4',
    n: 4,
    titleKey: 'spot.l4',
    ...proto('dapur'),
    difficulty: 'sederhana',
    starRules: { three: 3, two: 8 },
    differences: [
      { id: 'cerek', shape: C(437, 190, 25), note: 'Cerek: merah (A) → biru (B)' },
      { id: 'onigiri', shape: C(405, 294, 20), note: 'Onigiri ketiga atas pinggan hilang dalam B' },
      { id: 'guni', shape: C(44, 178, 34), note: 'Guni beras hilang dalam B' },
      { id: 'tikar', shape: R(171, 263, 117, 45), note: 'Tikar depan kaunter: hijau (A) → oren (B)' },
    ],
  },
  {
    ...BASE,
    id: 'mata-ninja-5',
    n: 5,
    titleKey: 'spot.l5',
    ...proto('stor'),
    difficulty: 'sederhana',
    starRules: { three: 4, two: 10 },
    differences: [
      { id: 'sawang', shape: C(25, 27, 30), note: 'Sarang labah-labah di bucu kiri atas muncul dalam B' },
      { id: 'lilin', shape: C(239, 126, 19), note: 'Api lilin padam dalam B' },
      { id: 'kunci', shape: C(131, 306, 22), note: 'Kunci emas di lantai hilang dalam B' },
      { id: 'peti', shape: R(55, 179, 79, 79), note: 'Peti kiri: merah (A) → biru (B)' },
      { id: 'kotak', shape: C(424, 247, 32), note: 'Kotak paling atas di timbunan kanan hilang dalam B' },
    ],
  },
];

export const spotLevel = (n: number) => SPOT_LEVELS.find((l) => l.n === n);
