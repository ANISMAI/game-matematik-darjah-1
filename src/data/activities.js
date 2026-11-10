// Bank aktiviti. DIKOSONGKAN untuk mula semula reka bentuk gameplay dari awal.
// Struktur app (peta, subtopik, navigasi) & latar game kekal; tiada aktiviti bermakna
// semua subtopik memaparkan "Aktiviti akan datang".
// Untuk tambah aktiviti baru nanti: masukkan objek ke dalam ACTIVITIES dengan
// { id, regionId, subId, title, mechanic, mechanicLabel, instruction, questions:[...] }.

const MELON_HINT = 'Kira biji pada belahan kiri, kemudian belahan kanan. Belahan mana ada lebih banyak biji?';
const OWL_HINT = 'Kira bulu oren pada sayap kiri, kemudian sayap kanan. Sayap mana ada lebih banyak bulu?';
const TRACE_HINT = 'Letak jari pada kereta merah. Ikut titik kuning yang bergerak dan anak panah putih.';
const PARK_HINT = 'Tekan kereta untuk keluarkan. Kemudian kira kereta yang masih ada di petak. Tiada kereta = 0.';
const BAMBOO_HINT = 'Digit puluh = bilangan ikat buluh. Digit sa = bilangan batang buluh.';
const BUTTERFLY_HINT = 'Kira pom-pom pada sayap kiri, kemudian sayap kanan. Sayap mana ada lebih banyak?';

export const ACTIVITIES = [
  {
    id: 'rama-rama',
    regionId: 'nombor',
    subId: 'banyak-sedikit',
    title: 'Rama-rama Pom-pom',
    mechanic: 'butterfly',
    mechanicLabel: 'Bandingkan sayap',
    instruction: 'Bandingkan pom-pom pada sayap kiri dan kanan. Letakkan sambungan badan yang betul pada rama-rama.',
    // left/right = bilangan pom-pom pada sayap. showNumbers: true untuk paparkan nombor pada bunga.
    questions: [
      { id: 'q1', left: 6, right: 2, hint: BUTTERFLY_HINT },
      { id: 'q2', left: 3, right: 5, hint: BUTTERFLY_HINT },
      { id: 'q3', left: 4, right: 4, hint: BUTTERFLY_HINT },
      { id: 'q4', left: 8, right: 5, hint: BUTTERFLY_HINT },
      { id: 'q5', left: 2, right: 7, hint: BUTTERFLY_HINT },
    ],
  },
  {
    id: 'tembikai',
    regionId: 'nombor',
    subId: 'banyak-sedikit',
    title: 'Biji Tembikai',
    mechanic: 'watermelon',
    mechanicLabel: 'Bandingkan biji',
    instruction: 'Kira biji pada belahan kiri dan kanan. Lengkapkan tembikai dengan hati yang betul di tengah.',
    // left/right = bilangan biji pada belahan tembikai (maksimum 10).
    questions: [
      { id: 'q1', left: 5, right: 3, hint: MELON_HINT },
      { id: 'q2', left: 2, right: 6, hint: MELON_HINT },
      { id: 'q3', left: 7, right: 7, hint: MELON_HINT },
      { id: 'q4', left: 9, right: 4, hint: MELON_HINT },
      { id: 'q5', left: 3, right: 8, hint: MELON_HINT },
    ],
  },
  {
    id: 'burung-hantu',
    regionId: 'nombor',
    subId: 'banyak-sedikit',
    title: 'Paruh Burung Hantu',
    mechanic: 'owl',
    mechanicLabel: 'Bandingkan bulu',
    instruction: 'Kira bulu oren pada sayap kiri dan kanan. Lengkapkan muka burung hantu dengan paruh yang betul.',
    // left/right = bilangan bulu oren pada sayap (maksimum 10).
    questions: [
      { id: 'q1', left: 4, right: 1, hint: OWL_HINT },
      { id: 'q2', left: 3, right: 7, hint: OWL_HINT },
      { id: 'q3', left: 6, right: 6, hint: OWL_HINT },
      { id: 'q4', left: 10, right: 8, hint: OWL_HINT },
      { id: 'q5', left: 5, right: 9, hint: OWL_HINT },
    ],
  },
  {
    id: 'surih-1-5',
    regionId: 'nombor',
    subId: 'kenali-1-10',
    title: 'Surih Nombor 1 hingga 5',
    mechanic: 'trace',
    mechanicLabel: 'Surih nombor',
    instruction: 'Letakkan jari pada kereta merah. Pandu ikut jalan sampai ke lampu isyarat. Kira kereta di bawah.',
    // n = nombor yang disurih (0 hingga 10); bilangan kereta di bawah sama dengan n.
    questions: [1, 2, 3, 4, 5].map((n) => ({ id: `n${n}`, n, hint: TRACE_HINT })),
  },
  {
    id: 'surih-6-10',
    regionId: 'nombor',
    subId: 'kenali-1-10',
    title: 'Surih Nombor 6 hingga 10',
    mechanic: 'trace',
    mechanicLabel: 'Surih nombor',
    instruction: 'Letakkan jari pada kereta merah. Pandu ikut jalan sampai ke lampu isyarat. Kira kereta di bawah.',
    questions: [6, 7, 8, 9, 10].map((n) => ({ id: `n${n}`, n, hint: TRACE_HINT })),
  },
  {
    id: 'surih-11-15',
    regionId: 'nombor',
    subId: 'kombinasi-11-20',
    title: 'Surih Nombor 11 hingga 15',
    mechanic: 'trace',
    mechanicLabel: 'Surih puluh & sa',
    instruction: 'Pandu kereta ikut jalan nombor. Satu lori bawa 10 kereta (1 puluh). Kira kereta lain (sa).',
    // n = 11 hingga 20: di bawah jalan, lori 10 kereta (puluh) + kereta sa.
    questions: [11, 12, 13, 14, 15].map((n) => ({ id: `n${n}`, n, hint: TRACE_HINT })),
  },
  {
    id: 'surih-16-20',
    regionId: 'nombor',
    subId: 'kombinasi-11-20',
    title: 'Surih Nombor 16 hingga 20',
    mechanic: 'trace',
    mechanicLabel: 'Surih puluh & sa',
    instruction: 'Pandu kereta ikut jalan nombor. Satu lori bawa 10 kereta (1 puluh). Kira kereta lain (sa).',
    questions: [16, 17, 18, 19, 20].map((n) => ({ id: `n${n}`, n, hint: TRACE_HINT })),
  },
  {
    id: 'surih-21-50',
    regionId: 'nombor',
    subId: 'kenali-21-100',
    title: 'Surih Nombor 21 hingga 50',
    mechanic: 'trace',
    mechanicLabel: 'Surih puluh & sa',
    instruction: 'Pandu kereta ikut jalan nombor. Setiap lori bawa 10 kereta (1 puluh). Kira lori dan kereta (sa).',
    questions: [23, 31, 38, 45, 50].map((n) => ({ id: `n${n}`, n, hint: TRACE_HINT })),
  },
  {
    id: 'surih-51-100',
    regionId: 'nombor',
    subId: 'kenali-21-100',
    title: 'Surih Nombor 51 hingga 100',
    mechanic: 'trace',
    mechanicLabel: 'Surih puluh & sa',
    instruction: 'Pandu kereta ikut jalan nombor. Setiap lori bawa 10 kereta (1 puluh). Kira lori dan kereta (sa).',
    questions: [56, 67, 74, 89, 100].map((n) => ({ id: `n${n}`, n, hint: TRACE_HINT })),
  },
  {
    id: 'ikat-buluh',
    regionId: 'nombor',
    subId: 'nilai-tempat',
    title: 'Ikat Buluh',
    mechanic: 'bamboo',
    mechanicLabel: 'Puluh & sa',
    instruction: 'Seret ikat buluh ke bakul PULUH dan batang buluh ke bakul SA untuk membina nombor. Kemudian tekan Semak.',
    // n = nombor sasaran (10 hingga 99): ikat = digit puluh, batang = digit sa.
    questions: [23, 35, 41, 60, 57].map((n) => ({ id: `n${n}`, n, hint: BAMBOO_HINT })),
  },
  {
    id: 'sifar',
    regionId: 'nombor',
    subId: 'kenali-sifar',
    title: 'Tempat Letak Kosong',
    mechanic: 'zero',
    mechanicLabel: 'Kenali sifar',
    instruction: 'Keluarkan kereta dari tempat letak. Bila tiada kereta tinggal, itu sifar (0).',
    // type 'parking': start = kereta di petak (0 hingga 5), out = kereta yang perlu dikeluarkan; jawapan = start - out.
    // type 'trace': surih nombor n (0) dengan tempat letak kosong di bawah.
    questions: [
      { id: 'p1', type: 'parking', start: 3, out: 3, hint: PARK_HINT },
      { id: 't0', type: 'trace', n: 0, hint: TRACE_HINT },
      { id: 'p2z', type: 'parking', start: 2, out: 2, hint: PARK_HINT },
      { id: 'p3', type: 'parking', start: 5, out: 5, hint: PARK_HINT },
      { id: 'p4', type: 'parking', start: 0, out: 0, hint: PARK_HINT },
    ],
  },
];

// Susunan dalam senarai Pratonton Gameplay.
export const SHORTCUT_ORDER = ['rama-rama', 'tembikai', 'burung-hantu', 'surih-1-5', 'surih-6-10', 'sifar', 'surih-11-15', 'surih-16-20', 'surih-21-50', 'surih-51-100', 'ikat-buluh'];

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
// Kekal untuk digunakan semula bila aktiviti ditambah balik. Senarai kosong lulus tanpa ralat.

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
    // Peraturan khusus mekanik ditambah semula di sini apabila mekanik baru direka.
  }
  return errors;
}
