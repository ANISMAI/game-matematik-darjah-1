// Bank aktiviti. DIKOSONGKAN untuk mula semula reka bentuk gameplay dari awal.
// Struktur app (peta, subtopik, navigasi) & latar game kekal; tiada aktiviti bermakna
// semua subtopik memaparkan "Aktiviti akan datang".
// Untuk tambah aktiviti baru nanti: masukkan objek ke dalam ACTIVITIES dengan
// { id, regionId, subId, title, mechanic, mechanicLabel, instruction, questions:[...] }.

const MELON_HINT = 'Kira biji pada belahan kiri, kemudian belahan kanan. Belahan mana ada lebih banyak biji?';
const OWL_HINT = 'Kira bulu oren pada sayap kiri, kemudian sayap kanan. Sayap mana ada lebih banyak bulu?';
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
];

// Susunan dalam senarai Pratonton Gameplay.
export const SHORTCUT_ORDER = ['rama-rama', 'tembikai', 'burung-hantu'];

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
