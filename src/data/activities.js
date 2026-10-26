// Bank aktiviti. DIKOSONGKAN untuk mula semula reka bentuk gameplay dari awal.
// Struktur app (peta, subtopik, navigasi) & latar game kekal; tiada aktiviti bermakna
// semua subtopik memaparkan "Aktiviti akan datang".
// Untuk tambah aktiviti baru nanti: masukkan objek ke dalam ACTIVITIES dengan
// { id, regionId, subId, title, mechanic, mechanicLabel, instruction, questions:[...] }.

export const ACTIVITIES = [];

// Susunan dalam senarai Pratonton Gameplay.
export const SHORTCUT_ORDER = [];

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
