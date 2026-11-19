// Misi Harian — penjejak kiraan harian dalam localStorage (set semula setiap tengah malam, waktu peranti).
// Permainan memanggil recordDaily(); popup Misi Harian membaca loadDaily() & MISSIONS.
const KEY = 'daily:v1';

/** Misi harian (lencana pada butang Misi = bilangan belum dituntut). Lebih 3 misi → kad boleh ditatal kiri/kanan. */
export const DAILY_MISSIONS = [
  { id: 'latihan', icon: 'book', title: 'Selesaikan 1 latihan', desc: 'Main mana-mana latihan matematik hingga tamat.', counter: 'activity', target: 1, coins: 20, go: 'belajar' },
  { id: 'soalan', icon: 'pencil', title: 'Jawab 20 soalan', desc: 'Soalan daripada latihan yang ditamatkan dikira.', counter: 'questions', target: 20, coins: 20, go: 'belajar' },
  { id: 'rajin', icon: 'star', title: 'Selesaikan 3 latihan', desc: 'Jadi ninja rajin — tamatkan 3 latihan hari ini.', counter: 'activity', target: 3, coins: 30, go: 'belajar' },
  { id: 'pakar', icon: 'trophy', title: 'Jawab 50 soalan', desc: 'Cabaran ninja pakar — kumpul 50 soalan hari ini.', counter: 'questions', target: 50, coins: 30, go: 'belajar' },
];
/** Peti bonus bila semua misi dituntut. */
export const DAILY_CHEST = { coins: 50, gems: 1 };

const today = (d = new Date()) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
const fresh = () => ({ date: today(), counts: { activity: 0, questions: 0 }, claimed: {}, chest: false });

export function loadDaily() {
  try {
    const raw = JSON.parse(localStorage.getItem(KEY) || 'null');
    if (!raw || raw.date !== today()) return fresh();
    return { ...fresh(), ...raw, counts: { ...fresh().counts, ...(raw.counts || {}) }, claimed: { ...(raw.claimed || {}) } };
  } catch {
    return fresh();
  }
}
function save(d) {
  try {
    localStorage.setItem(KEY, JSON.stringify(d));
    return true;
  } catch {
    return false;
  }
}

/** Tambah kiraan harian (contoh: recordDaily('activity'), recordDaily('questions', 10)). */
export function recordDaily(counter, n = 1) {
  if (!(n > 0)) return;
  const d = loadDaily();
  d.counts[counter] = (d.counts[counter] || 0) + n;
  save(d);
}

export const missionProgress = (d, m) => Math.min(m.target, d.counts[m.counter] || 0);
export const missionState = (d, m) => (d.claimed[m.id] ? 'claimed' : missionProgress(d, m) >= m.target ? 'ready' : 'todo');
/** Bilangan misi yang belum dituntut (untuk lencana butang). */
export const dailyBadge = (d = loadDaily()) => DAILY_MISSIONS.filter((m) => !d.claimed[m.id]).length;

/** Tuntut ganjaran misi — sekali sahaja sehari. Pulangkan syiling yang diberi (0 jika tidak layak). */
export function claimMission(id) {
  const d = loadDaily();
  const m = DAILY_MISSIONS.find((x) => x.id === id);
  if (!m || missionState(d, m) !== 'ready') return 0;
  d.claimed[id] = true;
  return save(d) ? m.coins : 0;
}
export function claimChest() {
  const d = loadDaily();
  if (d.chest || !DAILY_MISSIONS.every((m) => d.claimed[m.id])) return null;
  d.chest = true;
  if (!save(d)) return null;
  try {
    // jumlah Peti Harian pernah dibuka (untuk hadiah & lencana Bilik Harta Karun) — tidak direset setiap hari
    localStorage.setItem(TOTAL_KEY, String(dailyChestsOpened() + 1));
  } catch {
    // storan disekat: abaikan
  }
  return DAILY_CHEST;
}
const TOTAL_KEY = 'daily:chests';
/** Berapa kali Peti Harian pernah dibuka (semua hari). */
export function dailyChestsOpened() {
  try {
    return Math.max(0, Number(localStorage.getItem(TOTAL_KEY)) || 0);
  } catch {
    return 0;
  }
}

/** Saat hingga misi baharu (tengah malam). */
export function secondsToReset(now = new Date()) {
  const next = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);
  return Math.max(0, Math.round((next - now) / 1000));
}
