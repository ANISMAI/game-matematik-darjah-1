// Kemajuan Perpustakaan Ilmu Ninja — localStorage 'library:v1' (kunci sendiri; tidak menyentuh simpanan lain).
// { last: { id, cat }, items: { [id]: { pos, total, completed, updatedAt } }, bookmarks: { [noteId]: sectionIndex } }
import { findResource } from './content.js';

const KEY = 'library:v1';
const fresh = () => ({ last: null, items: {}, bookmarks: {} });
const isObj = (v) => v !== null && typeof v === 'object' && !Array.isArray(v);

export function loadLibrary() {
  try {
    const raw = JSON.parse(localStorage.getItem(KEY) || 'null');
    if (!isObj(raw)) return fresh();
    return { last: isObj(raw.last) ? raw.last : null, items: isObj(raw.items) ? raw.items : {}, bookmarks: isObj(raw.bookmarks) ? raw.bookmarks : {} };
  } catch {
    return fresh();
  }
}
function save(d) {
  try {
    localStorage.setItem(KEY, JSON.stringify(d));
  } catch {
    // storan disekat: kemajuan hanya untuk sesi ini
  }
}

/** Rekod kedudukan terkini (dan jadikan bahan ini "Sambung Pembelajaran"). completed hanya naik, tidak turun. */
export function recordProgress(cat, id, patch = {}) {
  const d = loadLibrary();
  const prev = d.items[id] ?? {};
  d.items[id] = { ...prev, ...patch, completed: Boolean(prev.completed || patch.completed), updatedAt: Date.now() };
  d.last = { id, cat };
  save(d);
  return d;
}
export function toggleBookmark(noteId, section) {
  const d = loadLibrary();
  if (d.bookmarks[noteId] === section) delete d.bookmarks[noteId];
  else d.bookmarks[noteId] = section;
  save(d);
  return d;
}

/** Bahan terakhir yang masih sah (bukan dipadam / bukan "Akan Datang"); null jika tiada. */
export function lastValid(d = loadLibrary()) {
  if (!d.last?.id) return null;
  const found = findResource(d.last.id);
  if (!found || found.item.status === 'soon') return null;
  return { ...found, progress: d.items[d.last.id] ?? {} };
}
