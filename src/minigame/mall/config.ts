// Mini Game Mall (tema Akademi Ninja YOU EDU) — definisi data (Fasa 1).
// Semua kedudukan dalam unit dunia (px dunia). Ubah / tambah kedai di sini sahaja:
// dinding, pintu, perlanggaran, penanda, peta dan prompt dijana daripada data ini.

export type Rect = { x: number; y: number; w: number; h: number };
export type Point = { x: number; y: number };
export type Facing = 'up' | 'down' | 'left' | 'right';
export type DoorSide = 'left' | 'right' | 'bottom';

export interface PropDef {
  type: string; // lihat drawProp() dalam render.ts
  x: number; // tapak (footprint) di lantai
  y: number;
  w: number;
  h: number;
  solid?: boolean;
  variant?: string;
}

export interface ShopDef {
  id: string;
  category: 'puzzle' | 'food' | 'arcade' | 'creative' | string;
  nameKey: string; // kunci teks (strings.ts)
  signKey: string;
  descKey: string;
  icon: string;
  enabled: boolean;
  /** Fasa 2: id permainan mini. null = panel "Akan Datang". */
  miniGameId: string | null;
  bounds: Rect; // termasuk dinding
  door: { side: DoorSide; offset: number; size: number };
  interactionRadius: number;
  /** Titik interaksi kedua di dalam kedai (paparan utama), relatif kepada bounds. */
  display?: Point & { radius: number };
  theme: { floor: 'tiles' | 'checker' | 'carpet' | 'planks' | 'tatami'; floorA: string; floorB: string; accent: string; band: string };
  /** Props relatif kepada bounds — pindah kedai, props ikut sekali. */
  props: PropDef[];
  /** Rujukan aset sebenar. null = seni placeholder prosedural (render.ts). */
  spriteRefs: { sign: string | null; floor: string | null; props: string | null };
}

export interface UtilityDef {
  id: string;
  kind: 'info' | 'reward';
  nameKey: string;
  descKey: string;
  icon: string;
  position: Point; // tempat pemain berdiri untuk berinteraksi
  interactionRadius: number;
}

// ---------- Palet (token warna; boleh ditukar tanpa sentuh logik) ----------
export const PAL = {
  outline: '#26324d',
  outlineSoft: 'rgba(38,50,77,.55)',
  shadow: 'rgba(38,50,77,.16)',
  grass: '#a6d97f',
  grassDark: '#8cc867',
  bush: '#5fb860',
  bushLight: '#86d07a',
  cream: '#fbf3e4',
  creamLine: '#ecdfc6',
  carpet: '#4f679c',
  carpetRing: '#6079ae',
  woodA: '#e3b37a',
  woodB: '#d9a66b',
  woodMid: '#e8bd88',
  wood: '#f0cf9f',
  woodLine: '#ddb27c',
  woodDark: '#c98f55',
  wallTop: '#eef1f7',
  wallFace: '#fff8ec',
  wallCap: '#d7dce8',
  sky: '#9fd3f2',
  mint: '#8fdcc2',
  peach: '#ffc9a8',
  yellow: '#ffd96a',
  lilac: '#cdbdf2',
  navyUi: '#1f2a44',
  white: '#ffffff',
};

// ---------- Susun atur mall ----------
export const MALL = {
  mallId: 'mall-utama',
  world: { w: 1536, h: 1488 },
  building: { x: 96, y: 96, w: 1344, h: 1200 },
  wall: 16,
  backWall: 56, // ketinggian muka dinding belakang (nampak dari depan)
  corridor: { x: 648, w: 240, top: 152 },
  lobby: { top: 864 },
  entrance: { x: 696, w: 144 }, // celah pintu kaca di dinding bawah
  spawnPoint: { x: 768, y: 1168, facing: 'up' as Facing },
  exitZone: { x: 768, y: 1252, radius: 64 },
  playerSpeed: 250, // px dunia / saat — sama untuk papan kekunci & joystick
  npcSpeed: 120, // lalai; setiap NPC boleh ada `speed` sendiri
  /** Jarak (px dunia) bagi setiap bingkai langkah. Animasi ikut jarak, bukan masa, supaya kaki tak tergelincir. */
  playerStride: 36,
  npcStride: 13,
  /** 'entrance' = sentiasa mula di pintu masuk; 'restore' = sambung kedudukan terakhir (sessionStorage). */
  reentry: 'entrance' as 'entrance' | 'restore',
};

const S = (x: number, y: number, w: number, h: number): Rect => ({ x, y, w, h });

// Interior kedai: x 16..536, y 56..368 (relatif). Pintu kiri/kanan pada y 168..312 — biar kosong.
export const SHOPS: ShopDef[] = [
  {
    id: 'puzzle',
    category: 'puzzle',
    nameKey: 'shop.puzzle.name',
    signKey: 'shop.puzzle.sign',
    descKey: 'shop.puzzle.desc',
    icon: '🧩',
    enabled: true,
    miniGameId: null,
    bounds: S(96, 96, 552, 384),
    door: { side: 'right', offset: 168, size: 144 },
    interactionRadius: 92,
    display: { x: 250, y: 302, radius: 64 },
    theme: { floor: 'tiles', floorA: '#e4f3fd', floorB: '#d3e9f8', accent: '#4fa8e0', band: '#8ccbf0' },
    props: [
      { type: 'shelf', x: 40, y: 58, w: 160, h: 40, solid: true, variant: 'puzzle' },
      { type: 'shelf', x: 220, y: 58, w: 120, h: 40, solid: true, variant: 'scrolls' },
      { type: 'rubik', x: 446, y: 66, w: 56, h: 52, solid: true },
      { type: 'rug', x: 52, y: 168, w: 92, h: 92, variant: 'puzzle' },
      { type: 'puzzleTable', x: 170, y: 196, w: 160, h: 82, solid: true },
      { type: 'cushion', x: 70, y: 296, w: 50, h: 42, solid: true, variant: '#e8554a' },
      { type: 'cushion', x: 336, y: 300, w: 50, h: 42, solid: true, variant: '#4f86c6' },
      { type: 'plant', x: 486, y: 326, w: 38, h: 34, solid: true },
      { type: 'plant', x: 24, y: 104, w: 38, h: 34, solid: true },
    ],
    spriteRefs: { sign: null, floor: null, props: null },
  },
  {
    id: 'food',
    category: 'food',
    nameKey: 'shop.food.name',
    signKey: 'shop.food.sign',
    descKey: 'shop.food.desc',
    icon: '🍱',
    enabled: true,
    miniGameId: null,
    bounds: S(96, 480, 552, 384),
    door: { side: 'right', offset: 168, size: 144 },
    interactionRadius: 92,
    display: { x: 220, y: 272, radius: 64 },
    theme: { floor: 'checker', floorA: '#fff6ec', floorB: '#ffe3cf', accent: '#ff8f5e', band: '#ffb48f' },
    props: [
      { type: 'kitchen', x: 34, y: 58, w: 250, h: 48, solid: true },
      { type: 'fridge', x: 300, y: 58, w: 62, h: 50, solid: true },
      { type: 'shelf', x: 378, y: 58, w: 124, h: 40, solid: true, variant: 'jars' },
      { type: 'serveCounter', x: 120, y: 184, w: 200, h: 56, solid: true },
      { type: 'roundTable', x: 92, y: 300, w: 58, h: 44, solid: true },
      { type: 'roundTable', x: 268, y: 304, w: 58, h: 44, solid: true },
      { type: 'plant', x: 486, y: 326, w: 38, h: 34, solid: true },
    ],
    spriteRefs: { sign: null, floor: null, props: null },
  },
  {
    id: 'arcade',
    category: 'arcade',
    nameKey: 'shop.arcade.name',
    signKey: 'shop.arcade.sign',
    descKey: 'shop.arcade.desc',
    icon: '🥋',
    enabled: true,
    miniGameId: null,
    bounds: S(888, 96, 552, 384),
    door: { side: 'left', offset: 168, size: 144 },
    interactionRadius: 92,
    display: { x: 296, y: 242, radius: 64 },
    theme: { floor: 'tatami', floorA: '#e9e3a8', floorB: '#dcd592', accent: '#d9443a', band: '#f08a7e' },
    props: [
      { type: 'dummy', x: 172, y: 70, w: 40, h: 32, solid: true },
      { type: 'dummy', x: 252, y: 70, w: 40, h: 32, solid: true },
      { type: 'dummy', x: 332, y: 70, w: 40, h: 32, solid: true },
      { type: 'weaponRack', x: 400, y: 58, w: 112, h: 40, solid: true },
      { type: 'rug', x: 196, y: 176, w: 200, h: 132, variant: 'ring' },
      { type: 'target', x: 458, y: 196, w: 50, h: 28, solid: true },
      { type: 'cushion', x: 446, y: 300, w: 50, h: 42, solid: true, variant: '#f7c948' },
      { type: 'plant', x: 26, y: 326, w: 38, h: 34, solid: true },
    ],
    spriteRefs: { sign: null, floor: null, props: null },
  },
  {
    id: 'creative',
    category: 'creative',
    nameKey: 'shop.creative.name',
    signKey: 'shop.creative.sign',
    descKey: 'shop.creative.desc',
    icon: '🖌️',
    enabled: true,
    miniGameId: null,
    bounds: S(888, 480, 552, 384),
    door: { side: 'left', offset: 168, size: 144 },
    interactionRadius: 92,
    display: { x: 296, y: 300, radius: 64 },
    theme: { floor: 'tiles', floorA: '#e2f6ec', floorB: '#d0eee0', accent: '#3fbf8f', band: '#86dbb9' },
    props: [
      { type: 'shelf', x: 150, y: 58, w: 160, h: 40, solid: true, variant: 'ink' },
      { type: 'easel', x: 340, y: 64, w: 50, h: 40, solid: true, variant: 'mountain' },
      { type: 'easel', x: 410, y: 64, w: 50, h: 40, solid: true, variant: 'sakura' },
      { type: 'rug', x: 400, y: 196, w: 110, h: 76, variant: 'ink' },
      { type: 'craftTable', x: 206, y: 196, w: 172, h: 80, solid: true },
      { type: 'cushion', x: 440, y: 300, w: 50, h: 42, solid: true, variant: '#5fb87a' },
      { type: 'plant', x: 486, y: 104, w: 38, h: 34, solid: true },
      { type: 'plant', x: 26, y: 326, w: 38, h: 34, solid: true },
    ],
    spriteRefs: { sign: null, floor: null, props: null },
  },
];

export const UTILITIES: UtilityDef[] = [
  { id: 'info', kind: 'info', nameKey: 'info.name', descKey: 'info.desc', icon: '📜', position: { x: 545, y: 1192 }, interactionRadius: 70 },
  { id: 'reward', kind: 'reward', nameKey: 'reward.name', descKey: 'reward.desc', icon: '🎁', position: { x: 990, y: 1192 }, interactionRadius: 70 },
];

// Props lobi & koridor (koordinat mutlak). Laluan tengah dari pintu ke koridor dibiar kosong.
export const MALL_PROPS: PropDef[] = [
  // koridor
  { type: 'fountain', x: 712, y: 168, w: 112, h: 66, solid: true },
  // lobi kiri
  { type: 'plant', x: 126, y: 928, w: 40, h: 36, solid: true },
  { type: 'stoneLantern', x: 600, y: 930, w: 36, h: 30, solid: true },
  { type: 'bench', x: 196, y: 1000, w: 124, h: 34, solid: true },
  { type: 'rug', x: 186, y: 1060, w: 150, h: 76, variant: 'play' },
  { type: 'bench', x: 196, y: 1168, w: 124, h: 34, solid: true },
  { type: 'infoDesk', x: 470, y: 1108, w: 150, h: 54, solid: true },
  { type: 'sakura', x: 130, y: 1234, w: 40, h: 30, solid: true },
  // lobi kanan
  { type: 'stoneLantern', x: 900, y: 930, w: 36, h: 30, solid: true },
  { type: 'taiko', x: 1336, y: 934, w: 60, h: 40, solid: true },
  { type: 'bench', x: 1200, y: 1000, w: 124, h: 34, solid: true },
  { type: 'rewardBooth', x: 918, y: 1104, w: 144, h: 58, solid: true },
  { type: 'bench', x: 1200, y: 1168, w: 124, h: 34, solid: true },
  { type: 'sakura', x: 1366, y: 1234, w: 40, h: 30, solid: true },
  // tikar pintu masuk
  { type: 'rug', x: 674, y: 1188, w: 188, h: 50, variant: 'welcome' },
];

// ---------- NPC ----------
// Dua jenis: NPC ambien (berjalan di laluan, tidak boleh diajak bercakap) dan NPC interaktif (berdiri,
// ada `talk`). Hanya DATA di sini — logik interaksi dalam engine.ts / MinigamePage.tsx, teks dalam strings.ts.

/** Peranan NPC interaktif menentukan butang di halaman dialog terakhir. */
export type NpcRole = 'guide' | 'mission' | 'reward' | 'dojo';

export interface NpcTalk {
  nameKey: string;
  role: NpcRole;
  /** Kunci teks bagi setiap halaman dialog (strings.ts). */
  lines: string[];
  /** Dojo yang dikendalikan (role 'dojo'). */
  shopId?: string;
  /** Tempat pemain berdiri untuk bercakap (contoh: depan kaunter). Tiada = kedudukan NPC. */
  spot?: Point;
  radius?: number;
}

type RecolorRule = { from: [number, number]; to: number; minSat?: number; minLight?: number; maxLight?: number; sat?: number; light?: number };
type SpriteRef = { src: string; height: number; recolor?: RecolorRule[] };

export interface NpcDef {
  id: string;
  look: { skin: string; hair: string; shirt: string; pants: string; hijab?: string; apron?: boolean; gi?: boolean; belt?: string; headband?: string };
  /** Titik laluan gelung; satu titik = berdiri. */
  path: Point[];
  facing?: Facing;
  /** Sprite sheet 4×3 (boleh ditukar warna dengan `recolor`). Jika gagal dimuat, `look` dilukis secara prosedural. */
  sprite?: SpriteRef;
  /** Animasi aksi berulang semasa berdiri (sheet 4×3 yang sama susunan), contoh: latihan tumbuk. */
  action?: SpriteRef;
  /** Kelajuan berjalan sendiri (px dunia / saat). Tiada = MALL.npcSpeed. */
  speed?: number;
  /** Rentak langkah sendiri: jarak (px dunia) bagi setiap bingkai. Besar = gambar kaki bertukar lebih perlahan. Tiada = MALL.npcStride. */
  stride?: number;
  /** NPC interaktif: boleh diajak bercakap (sentiasa berdiri & pepejal). */
  talk?: NpcTalk;
}

/** Sprite sheet pemain (watak utama). */
export const PLAYER_SPRITE = { src: '/mall/character/player.webp', height: 74 };

const CH = '/mall/character/';
/** Jejari lalai untuk butang Bercakap muncul (px dunia). */
export const TALK_RADIUS = 72;

export const NPCS: NpcDef[] = [
  // --- NPC ambien ---
  { id: 'n1', look: { skin: '#f6d2b0', hair: '#3b2a22', shirt: '#ffffff', pants: '#3d4c7a', hijab: '#4f86c6', gi: true, belt: '#e8554a' }, path: [{ x: 380, y: 966 }, { x: 580, y: 966 }, { x: 580, y: 1036 }, { x: 380, y: 1036 }], sprite: { src: CH + 'student-hijab.webp', height: 70 }, speed: 112 },
  { id: 'n2', look: { skin: '#e7b48c', hair: '#1f1a1a', shirt: '#3d4c7a', pants: '#26324d', gi: true, belt: '#f7c948', headband: '#e8554a' }, path: [{ x: 712, y: 420 }, { x: 712, y: 820 }], sprite: { src: CH + 'student-navy.webp', height: 72 }, speed: 135, stride: 21 },
  { id: 'n3', look: { skin: '#c98d66', hair: '#2a1f1d', shirt: '#5fb87a', pants: '#2f3a5a', gi: true, belt: '#26324d', headband: '#f7c948' }, path: [{ x: 1170, y: 1230 }, { x: 1380, y: 1230 }, { x: 1380, y: 1084 }, { x: 1170, y: 1084 }], sprite: { src: CH + 'student-green.webp', height: 70 }, speed: 122 },

  // --- NPC interaktif (Fasa 2) ---
  {
    id: 'guru', // Guru Ninja — gi ungu, tali pinggang hitam, di tepi laluan masuk
    look: { skin: '#e7b48c', hair: '#1f1a1a', shirt: '#6a4c9c', pants: '#3a2a5a', gi: true, belt: '#1f1a1a', headband: '#e8554a' },
    path: [{ x: 872, y: 1150 }],
    facing: 'left',
    sprite: { src: CH + 'student-navy.webp', height: 76, recolor: [{ from: [200, 255], to: 268, light: 1.15, minLight: 0.12 }, { from: [38, 62], to: 30, sat: 0.15, light: 0.25 }] },
    talk: { nameKey: 'npc.guru.name', role: 'guide', lines: ['tut.1', 'tut.2', 'tut.3'] },
  },
  {
    id: 'misi', // Penjaga Misi — di belakang Kaunter Misi
    look: { skin: '#f6d2b0', hair: '#3b2a22', shirt: '#ffffff', pants: '#3d4c7a', hijab: '#2fa39a', gi: true, belt: '#f7c948' },
    path: [{ x: 545, y: 1102 }],
    facing: 'down',
    sprite: { src: CH + 'student-hijab.webp', height: 70, recolor: [{ from: [190, 235], to: 172, minLight: 0.3 }, { from: [345, 15], to: 45, light: 1.25, minSat: 0.45, maxLight: 0.6 }] },
    talk: { nameKey: 'npc.misi.name', role: 'mission', lines: ['npc.misi.1', 'npc.misi.2'], spot: { x: 545, y: 1192 } },
  },
  {
    id: 'ganjaran', // Penjaga Ganjaran — berdiri di sisi Gerai Ganjaran
    look: { skin: '#c98d66', hair: '#2a1f1d', shirt: '#d9443a', pants: '#2f3a5a', gi: true, belt: '#26324d', headband: '#f7c948' },
    path: [{ x: 1094, y: 1150 }],
    facing: 'left',
    sprite: { src: CH + 'student-green.webp', height: 70, recolor: [{ from: [85, 175], to: 356, light: 1.05 }] },
    talk: { nameKey: 'npc.ganjaran.name', role: 'reward', lines: ['npc.ganjaran.1', 'npc.ganjaran.2'] },
  },
  {
    id: 'tekateki', // Guru Teka-Teki — di belakang meja teka-teki
    look: { skin: '#e2a982', hair: '#1d1b22', shirt: '#ffffff', pants: '#2f6fb0', gi: true, belt: '#2f6fb0', headband: '#4fa8e0' },
    path: [{ x: 346, y: 286 }],
    facing: 'down',
    sprite: { src: CH + 'student-arena.webp', height: 74, recolor: [{ from: [340, 20], to: 205, minSat: 0.45, maxLight: 0.6 }, { from: [200, 250], to: 210, sat: 1.6, light: 1.5, minLight: 0.12 }] },
    talk: { nameKey: 'npc.tekateki.name', role: 'dojo', shopId: 'puzzle', lines: ['npc.tekateki.1', 'npc.tekateki.2'], spot: { x: 346, y: 400 } },
  },
  {
    id: 'chef', // Chef Ninja
    look: { skin: '#f3c9a3', hair: '#3a2a20', shirt: '#ffffff', pants: '#3d4c7a', apron: true },
    path: [{ x: 460, y: 710 }],
    facing: 'down',
    sprite: { src: CH + 'chef-bento.webp', height: 78 },
    talk: { nameKey: 'npc.chef.name', role: 'dojo', shopId: 'food', lines: ['npc.chef.1', 'npc.chef.2'] },
  },
  {
    id: 'jurulatih', // Jurulatih Ninja — berlatih tumbuk di depan patung latihan
    look: { skin: '#e2a982', hair: '#1d1b22', shirt: '#ffffff', pants: '#3d4c7a', gi: true, belt: '#26324d', headband: '#e8554a' },
    path: [{ x: 1140, y: 228 }],
    facing: 'up',
    sprite: { src: CH + 'student-arena.webp', height: 72 },
    action: { src: CH + 'student-arena-tumbuk.webp', height: 72 },
    talk: { nameKey: 'npc.jurulatih.name', role: 'dojo', shopId: 'arcade', lines: ['npc.jurulatih.1', 'npc.jurulatih.2'] },
  },
  {
    id: 'seni', // Guru Seni Shinobi — di belakang meja kraf
    look: { skin: '#c98d66', hair: '#2a1f1d', shirt: '#b04fc0', pants: '#2f3a5a', gi: true, belt: '#26324d', headband: '#ff8fb8' },
    path: [{ x: 1180, y: 668 }],
    facing: 'down',
    sprite: { src: CH + 'student-green.webp', height: 70, recolor: [{ from: [85, 175], to: 292, light: 1.1 }, { from: [38, 70], to: 335, sat: 0.9, light: 1.05 }] },
    talk: { nameKey: 'npc.seni.name', role: 'dojo', shopId: 'creative', lines: ['npc.seni.1', 'npc.seni.2'], spot: { x: 1184, y: 780 } },
  },
];

/** NPC interaktif sahaja. */
export const TALK_NPCS = NPCS.filter((n) => n.talk);
