// Kandungan pulau: kawasan, topik dan subtopik.
// Label topik/subtopik ialah cadangan kandungan prototaip, bukan kurikulum rasmi.
// `available` boleh ditukar kepada false untuk peraturan buka kunci pada masa depan.

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
    topic: 'Nombor Bulat',
    name: 'Kampung Buluh',
    landmark: 'bamboo',
    color: '#9fdc6f',
    edge: '#5f9e3c',
    map: { cx: 330, cy: 235 },
    available: true,
    subtopics: [
      { id: 'kenal', title: 'Kenal Nombor', instruction: 'Kenali nombor 1 hingga 10.', playable: false },
      {
        id: 'bilang',
        title: 'Bilang Objek',
        instruction: 'Kira objek dan pilih nombor yang betul.',
        playable: true,
        questionCount: 5,
      },
      { id: 'banding', title: 'Banding Nombor', instruction: 'Cari nombor yang lebih besar atau lebih kecil.', playable: false },
      { id: 'susun', title: 'Susun Nombor', instruction: 'Susun nombor mengikut tertib.', playable: false },
    ],
  },
  {
    id: 'tambah-tolak',
    topic: 'Tambah dan Tolak',
    name: 'Dojo Ninja',
    landmark: 'dojo',
    color: '#f6c48a',
    edge: '#c68b4e',
    map: { cx: 610, cy: 205 },
    available: true,
    subtopics: [
      { id: 'kenal-tambah', title: 'Kenal Tambah', instruction: 'Gabungkan dua kumpulan objek.', playable: false },
      { id: 'tambah-mudah', title: 'Tambah Mudah', instruction: 'Tambah nombor dalam lingkungan 10.', playable: false },
      { id: 'kenal-tolak', title: 'Kenal Tolak', instruction: 'Ambil objek keluar daripada kumpulan.', playable: false },
      { id: 'tolak-mudah', title: 'Tolak Mudah', instruction: 'Tolak nombor dalam lingkungan 10.', playable: false },
    ],
  },
  {
    id: 'masa',
    topic: 'Masa dan Waktu',
    name: 'Menara Jam',
    landmark: 'clock',
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
    color: '#f2cfa6',
    edge: '#c49463',
    map: { cx: 785, cy: 655 },
    available: true,
    subtopics: PREVIEW('Baca dan buat piktograf mudah.'),
  },
];

export const START_REGION = 'nombor';

export function getRegion(id) {
  return REGIONS.find((r) => r.id === id);
}

export function getSubtopic(regionId, subId) {
  return getRegion(regionId)?.subtopics.find((s) => s.id === subId);
}
