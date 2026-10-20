// Bank aktiviti Fasa 2. Kandungan prototaip yang boleh disunting, bukan kurikulum rasmi.
// Setiap aktiviti: id stabil, kawasan/subtopik sedia ada, mekanik dan lima soalan dengan jawapan + petunjuk.
// Nilai dalam 0–10, jumlah tambah paling banyak 10.

export const ACTIVITIES = [
  {
    // id 'bilang' dikekalkan daripada Fasa 1 supaya penyelesaian lama tidak hilang
    id: 'bilang',
    regionId: 'nombor',
    subId: 'bilang',
    title: 'Bilang Objek',
    mechanic: 'counting',
    mechanicLabel: 'Kira objek',
    instruction: 'Kira objek dan pilih nombor yang betul.',
    questionCount: 5,
  },
  {
    id: 'matching_lanterns',
    regionId: 'nombor',
    subId: 'bilang',
    title: 'Skrol Tanglung',
    mechanic: 'matching',
    mechanicLabel: 'Padanan',
    instruction: 'Padankan nombor dengan kumpulan tanglung.',
    questions: [
      { id: 'ml-1', values: [1, 2, 3] },
      { id: 'ml-2', values: [2, 4, 5] },
      { id: 'ml-3', values: [3, 6, 7] },
      { id: 'ml-4', values: [4, 8, 9] },
      { id: 'ml-5', values: [5, 9, 10] },
    ].map((q) => ({ ...q, answer: q.values, hint: 'Jom kira tanglung dalam satu kumpulan.' })),
  },
  {
    id: 'sorting_baskets',
    regionId: 'nombor',
    subId: 'anggar',
    title: 'Bakul Ninja',
    mechanic: 'sorting',
    mechanicLabel: 'Isihan',
    instruction: 'Letakkan bakul pada tempat yang betul.',
    questions: [
      { id: 'sb-1', counts: [2, 5] },
      { id: 'sb-2', counts: [3, 6] },
      { id: 'sb-3', counts: [1, 4] },
      { id: 'sb-4', counts: [5, 8] },
      { id: 'sb-5', counts: [7, 10] },
    ].map((q) => ({
      ...q,
      answer: { less: Math.min(...q.counts), more: Math.max(...q.counts) },
      hint: 'Pasangkan buah satu dengan satu. Bakul yang ada buah lebih ialah lebih banyak.',
    })),
  },
  {
    id: 'ordering_stones',
    regionId: 'nombor',
    subId: 'urutan',
    title: 'Batu Sungai',
    mechanic: 'ordering',
    mechanicLabel: 'Susunan',
    instruction: 'Susun nombor mengikut arahan.',
    questions: [
      { id: 'os-1', dir: 'asc', answer: [1, 2, 3, 4] },
      { id: 'os-2', dir: 'asc', answer: [3, 4, 5, 6] },
      { id: 'os-3', dir: 'asc', answer: [2, 4, 6, 8] },
      { id: 'os-4', dir: 'desc', answer: [5, 4, 3, 2] },
      { id: 'os-5', dir: 'desc', answer: [10, 9, 8, 7] },
    ].map((q) => ({
      ...q,
      instruction: q.dir === 'asc' ? 'Susun nombor daripada kecil ke besar.' : 'Susun nombor daripada besar ke kecil.',
      hint: q.dir === 'asc' ? 'Cari nombor paling kecil yang tinggal.' : 'Cari nombor paling besar yang tinggal.',
    })),
  },
  {
    id: 'fill_bridge',
    regionId: 'nombor',
    subId: 'urutan',
    title: 'Jambatan Hilang',
    mechanic: 'fill',
    mechanicLabel: 'Isi tempat kosong',
    instruction: 'Lengkapkan nombor yang hilang.',
    questions: [
      { id: 'fb-1', sequence: [1, 2, null, 4], options: [2, 3, 5], answer: 3 },
      { id: 'fb-2', sequence: [3, null, 5, 6], options: [2, 4, 6], answer: 4 },
      { id: 'fb-3', sequence: [5, 6, null, 8], options: [6, 7, 9], answer: 7 },
      { id: 'fb-4', sequence: [null, 7, 8, 9], options: [5, 6, 10], answer: 6 },
      { id: 'fb-5', sequence: [7, 8, 9, null], options: [6, 8, 10], answer: 10 },
    ].map((q) => ({ ...q, hint: 'Lihat nombor di sebelah. Kira mengikut urutan.' })),
  },
  {
    id: 'pick_addition',
    regionId: 'tambah-tolak',
    subId: 'tambah-mudah',
    title: 'Pintu Dojo: Tambah',
    mechanic: 'pick',
    mechanicLabel: 'Pilih jawapan',
    instruction: 'Kira jumlah. Pilih pintu yang betul.',
    questions: [
      { id: 'pa-1', a: 1, b: 2, options: [2, 3, 4], answer: 3 },
      { id: 'pa-2', a: 2, b: 2, options: [3, 4, 5], answer: 4 },
      { id: 'pa-3', a: 3, b: 2, options: [4, 5, 6], answer: 5 },
      { id: 'pa-4', a: 4, b: 3, options: [6, 7, 8], answer: 7 },
      { id: 'pa-5', a: 5, b: 4, options: [8, 9, 10], answer: 9 },
    ].map((q) => ({ ...q, hint: 'Kira semua objek dalam kedua-dua kumpulan.' })),
  },
  {
    id: 'puzzle_subtraction',
    regionId: 'tambah-tolak',
    subId: 'tolak-mudah',
    title: 'Skrol Rahsia: Tolak',
    mechanic: 'puzzle',
    mechanicLabel: 'Teka-teki',
    instruction: 'Cantumkan skrol supaya ayat matematik betul.',
    questions: [
      { id: 'ps-1', start: 3, take: 1, answer: 2, distractor: 1 },
      { id: 'ps-2', start: 5, take: 2, answer: 3, distractor: 4 },
      { id: 'ps-3', start: 6, take: 4, answer: 2, distractor: 3 },
      { id: 'ps-4', start: 8, take: 3, answer: 5, distractor: 4 },
      { id: 'ps-5', start: 10, take: 5, answer: 5, distractor: 6 },
    ].map((q) => ({ ...q, hint: 'Mula dengan semua objek. Ambil keluar objek yang ditolak, kemudian kira bakinya.' })),
  },
];

// Susunan dalam senarai Pratonton Gameplay (enam mekanik baharu)
export const SHORTCUT_ORDER = [
  'matching_lanterns',
  'pick_addition',
  'puzzle_subtraction',
  'sorting_baskets',
  'ordering_stones',
  'fill_bridge',
];

export function getActivity(id) {
  return ACTIVITIES.find((a) => a.id === id);
}

export function activitiesFor(regionId, subId) {
  return ACTIVITIES.filter((a) => a.regionId === regionId && (subId === undefined || a.subId === subId));
}

export function questionTotal(activity) {
  return activity.questions?.length ?? activity.questionCount ?? 5;
}

// ---------- Pengesahan bank soalan ----------

const inRange = (n) => Number.isInteger(n) && n >= 0 && n <= 10;
const distinct = (list) => new Set(list).size === list.length;

export function validateBank(list = ACTIVITIES) {
  const errors = [];
  const err = (a, q, msg) => errors.push(`${a.id}/${q?.id ?? '-'}: ${msg}`);
  if (!distinct(list.map((a) => a.id))) errors.push('id aktiviti berulang');
  for (const a of list) {
    if (!a.questions) continue;
    if (a.questions.length !== 5) err(a, null, 'perlu 5 soalan');
    if (!distinct(a.questions.map((q) => q.id))) err(a, null, 'id soalan berulang');
    for (const q of a.questions) {
      switch (a.mechanic) {
        case 'matching':
          if (q.values.length !== 3 || !distinct(q.values) || !q.values.every((v) => inRange(v) && v > 0))
            err(a, q, 'perlu tiga kuantiti unik 1–10');
          break;
        case 'pick':
          if (!distinct(q.options)) err(a, q, 'pilihan berulang');
          if (q.a + q.b !== q.answer || q.answer > 10) err(a, q, 'jawapan tambah salah');
          if (q.options.filter((o) => o === q.a + q.b).length !== 1) err(a, q, 'perlu tepat satu pilihan betul');
          if (![q.a, q.b, ...q.options].every(inRange)) err(a, q, 'nilai luar 0–10');
          break;
        case 'puzzle':
          if (q.start - q.take !== q.answer || q.answer < 0) err(a, q, 'jawapan tolak salah');
          if (q.distractor === q.answer) err(a, q, 'pengganggu sama dengan jawapan');
          if (![q.start, q.take, q.answer, q.distractor].every(inRange)) err(a, q, 'nilai luar 0–10');
          break;
        case 'sorting':
          if (q.counts.length !== 2 || q.counts[0] === q.counts[1] || !q.counts.every(inRange))
            err(a, q, 'perlu dua kuantiti berbeza');
          break;
        case 'ordering': {
          const sorted = [...q.answer].sort((x, y) => (q.dir === 'asc' ? x - y : y - x));
          if (q.answer.length !== 4 || !distinct(q.answer) || sorted.join() !== q.answer.join() || !q.answer.every(inRange))
            err(a, q, 'urutan tidak sah');
          break;
        }
        case 'fill': {
          const gap = q.sequence.indexOf(null);
          const full = q.sequence.map((v, i) => (i === gap ? q.answer : v));
          if (q.sequence.filter((v) => v === null).length !== 1) err(a, q, 'perlu satu tempat kosong');
          if (!full.every((v, i) => i === 0 || v === full[i - 1] + 1)) err(a, q, 'jujukan tidak berturutan');
          if (!distinct(q.options) || q.options.filter((o) => o === q.answer).length !== 1) err(a, q, 'pilihan tidak sah');
          if (![...full, ...q.options].every(inRange)) err(a, q, 'nilai luar 0–10');
          break;
        }
        default:
          err(a, q, `mekanik tidak dikenali: ${a.mechanic}`);
      }
    }
  }
  return errors;
}
