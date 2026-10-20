// Kandungan pulau: kawasan, topik dan subtopik.
// Label topik/subtopik ialah cadangan kandungan prototaip, bukan kurikulum rasmi.
// `available` boleh ditukar kepada false untuk peraturan buka kunci pada masa depan.
// `sprite` (pilihan): gambar bangunan dalam public/map; tanpanya, bangunan SVG digunakan.
// `background` (pilihan): gambar latar penuh peta tahap kawasan (menggantikan tanah dan hiasan).
// `intro` (pilihan): dialog cerita yang dipaparkan sekali sahaja bila kawasan dibuka kali pertama.
// `ground` (pilihan): tekstur rumput berulang untuk tanah peta tahap (scripts/make-ground.mjs).
// `playable` diisi daripada data/activities.js: subtopik yang ada sekurang-kurangnya satu aktiviti.

import { activitiesFor } from './activities.js';

const PREVIEW = (instruction) => [
  {
    id: 'pratonton',
    title: 'Pratonton Latihan',
    instruction,
    playable: false,
  },
];

export const REGIONS = [
  {
    id: 'nombor',
    topic: 'Nombor Bulat hingga 100',
    name: 'Kampung Buluh',
    landmark: 'bamboo',
    sprite: '/map/kampung-buluh.webp',
    ground: '/map/rumput-nombor.webp',
    // Intro cerita (kali pertama masuk kawasan): ninja keluar dari rumah dan bercakap.
    intro: [
      'Hai! Saya Ninja Kira. Selamat datang ke Kampung Buluh!',
      'Kampung ini penuh dengan nombor. Jom kita belajar kenal nombor hingga 100!',
      'Lompat ke setiap batu dan selesaikan cabaran untuk kumpul bintang!',
      'Sedia? Jom ikut saya ke batu pertama!',
    ],
    color: '#9fdc6f',
    edge: '#5f9e3c',
    map: { cx: 330, cy: 235 },
    available: true,
    subtopics: [
      {
        // id 'bilang' dikekalkan supaya kemajuan yang disimpan tidak hilang
        id: 'bilang',
        title: 'Mengenal dan Menulis Nombor',
        instruction: 'Kira objek dan padankan nombor dengan kumpulan.',
      },
      { id: 'nilai', title: 'Nilai Nombor', instruction: 'Kenali nilai puluh dan sa dalam nombor.' },
      { id: 'urutan', title: 'Urutan Nombor', instruction: 'Susun nombor secara menaik dan menurun.' },
      { id: 'pola', title: 'Pola Nombor', instruction: 'Cari nombor seterusnya dalam pola.' },
      { id: 'anggar', title: 'Anggar dan Banding', instruction: 'Anggar dan bandingkan kuantiti objek.' },
    ],
  },
  {
    id: 'tambah-tolak',
    topic: 'Tambah dan Tolak',
    name: 'Dojo Ninja',
    landmark: 'dojo',
    sprite: '/map/dojo.webp',
    color: '#f6c48a',
    edge: '#c68b4e',
    map: { cx: 610, cy: 205 },
    available: true,
    subtopics: [
      { id: 'kenal-tambah', title: 'Kenal Tambah', instruction: 'Gabungkan dua kumpulan objek.' },
      { id: 'tambah-mudah', title: 'Tambah Mudah', instruction: 'Tambah nombor dalam lingkungan 10.' },
      { id: 'kenal-tolak', title: 'Kenal Tolak', instruction: 'Ambil objek keluar daripada kumpulan.' },
      { id: 'tolak-mudah', title: 'Tolak Mudah', instruction: 'Tolak nombor dalam lingkungan 10.' },
    ],
  },
  {
    id: 'masa',
    topic: 'Masa dan Waktu',
    name: 'Menara Jam',
    landmark: 'clock',
    sprite: '/map/menara-jam.webp',
    color: '#cdbaf0',
    edge: '#8f78c4',
    map: { cx: 885, cy: 240 },
    available: true,
    subtopics: PREVIEW('Kenali waktu pagi, tengah hari dan malam.'),
  },
  {
    id: 'ruang',
    topic: 'Ruang',
    name: 'Kubu Bentuk',
    landmark: 'shapes',
    sprite: '/map/kubu-bentuk.webp',
    color: '#cfd4de',
    edge: '#8c94a6',
    map: { cx: 250, cy: 455 },
    available: true,
    subtopics: PREVIEW('Kenali bentuk seperti kubus, kon dan sfera.'),
  },
  {
    id: 'pecahan',
    topic: 'Pecahan',
    name: 'Kebun Ninja',
    landmark: 'garden',
    sprite: '/map/kebun.webp',
    color: '#86d68a',
    edge: '#4f9e58',
    map: { cx: 585, cy: 440 },
    available: true,
    subtopics: PREVIEW('Bahagikan buah kepada bahagian yang sama besar.'),
  },
  {
    id: 'wang',
    topic: 'Wang',
    name: 'Pasar Ninja',
    landmark: 'market',
    sprite: '/map/pasar.webp',
    color: '#ffd77e',
    edge: '#d0a43e',
    map: { cx: 925, cy: 465 },
    available: true,
    subtopics: PREVIEW('Kenali duit syiling dan wang kertas.'),
  },
  {
    id: 'ukuran',
    topic: 'Ukuran dan Sukatan',
    name: 'Lembah Jambatan',
    landmark: 'bridge',
    sprite: '/map/jambatan.webp',
    color: '#a9e0c0',
    edge: '#5fae86',
    map: { cx: 400, cy: 650 },
    available: true,
    subtopics: PREVIEW('Bandingkan panjang, berat dan isi padu.'),
  },
  {
    id: 'data',
    topic: 'Pengurusan Data',
    name: 'Pusat Rekod Ninja',
    landmark: 'records',
    sprite: '/map/pusat-rekod.webp',
    color: '#f2cfa6',
    edge: '#c49463',
    map: { cx: 785, cy: 655 },
    available: true,
    subtopics: PREVIEW('Baca dan buat piktograf mudah.'),
  },
];

for (const region of REGIONS) {
  for (const sub of region.subtopics) sub.playable = activitiesFor(region.id, sub.id).length > 0;
}

export const START_REGION = 'nombor';

export function getRegion(id) {
  return REGIONS.find((r) => r.id === id);
}

export function getSubtopic(regionId, subId) {
  return getRegion(regionId)?.subtopics.find((s) => s.id === subId);
}
