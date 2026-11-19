// Bilik Harta Karun Ninja — data & logik ganjaran (tulen, tanpa UI).
// Sumber kebenaran sedia ada dikekalkan:
//   • Peti Harian  → lib/daily.js (sama dengan peti dalam Misi Harian)
//   • Bintang / tahap permainan mini / galeri topeng → minigame/mall/save.ts ('mall:save')
//   • Latihan tamat → kemajuan utama App (dihantar sebagai prop)
// Data baharu bilik ini sahaja (peringkat peti yang dituntut) disimpan dalam 'vault:v1'.
// Untuk menambah peti / hadiah / lencana: tambah entri dalam CHESTS, GIFTS atau BADGES — UI ikut sendiri.
import { DAILY_CHEST, DAILY_MISSIONS, claimChest, dailyChestsOpened, loadDaily } from '../../lib/daily.js';
import { loadSave } from '../../minigame/mall/save.ts';

const KEY = 'vault:v1';
// id permainan mini (lihat minigame/*/levels.ts)
const GAME = { spot: 'mata-ninja', sushi: 'sushi-master', shuriken: 'shuriken-master', mask: 'mask-designer' };

function loadVault() {
  try {
    const raw = JSON.parse(localStorage.getItem(KEY) || 'null');
    return { claimed: raw && typeof raw.claimed === 'object' && raw.claimed ? { ...raw.claimed } : {}, seen: raw?.seen && typeof raw.seen === 'object' ? { ...raw.seen } : {} };
  } catch {
    return { claimed: {}, seen: {} };
  }
}
function saveVault(v) {
  try {
    localStorage.setItem(KEY, JSON.stringify(v));
    return true;
  } catch {
    return false;
  }
}

/** Ringkasan semua statistik yang diperlukan oleh peti, hadiah & lencana. */
export function readStats({ latihanDone = 0 } = {}) {
  const save = loadSave();
  let stars = 0;
  const games = {};
  for (const [gid, levels] of Object.entries(save.games || {})) {
    let done = 0;
    let best = 0;
    for (const lv of Object.values(levels)) {
      stars += lv.stars || 0;
      if (lv.done) done += 1;
      best = Math.max(best, lv.stars || 0);
    }
    games[gid] = { done, best };
  }
  const g = (id) => games[id] ?? { done: 0, best: 0 };
  const daily = loadDaily();
  return {
    latihan: latihanDone,
    stars,
    spot: g(GAME.spot),
    sushi: g(GAME.sushi),
    shuriken: g(GAME.shuriken),
    mask: g(GAME.mask),
    masks: (save.gallery || []).length,
    dailyChests: dailyChestsOpened(),
    daily,
    vault: loadVault(),
  };
}

/* ───────────── PETI ───────────── */
// Peti berperingkat: setiap peringkat dibuka sekali apabila syarat dicapai (tiada ladang ganjaran).
export const CHESTS = [
  {
    id: 'harian',
    name: 'Peti Harian',
    variant: 'harian',
    hero: true,
    info: 'Lengkapkan dan tuntut semua misi harian untuk membuka peti ini.',
  },
  {
    id: 'minigame',
    name: 'Peti Mini Game',
    variant: 'minigame',
    info: 'Kumpul bintang dalam permainan mini Akademi Ninja.',
    unit: 'bintang',
    stat: (s) => s.stars,
    tiers: [
      { id: 'mg1', at: 3, coins: 30, gift: 'trofi-gangsa' },
      { id: 'mg2', at: 10, coins: 60, gems: 1, gift: 'pelekat-shuriken' },
      { id: 'mg3', at: 20, coins: 100, gems: 2, gift: 'corak-emas' },
    ],
  },
  {
    id: 'pencapaian',
    name: 'Peti Pencapaian',
    variant: 'pencapaian',
    info: 'Tamatkan latihan matematik untuk mencapai sasaran.',
    unit: 'latihan',
    stat: (s) => s.latihan,
    tiers: [
      { id: 'pc1', at: 1, coins: 20, gift: 'skrol-pelajar' },
      { id: 'pc2', at: 5, coins: 50, gems: 1, gift: 'bingkai-sakura' },
      { id: 'pc3', at: 15, coins: 100, gems: 2, gift: 'trofi-emas' },
    ],
  },
  {
    id: 'istimewa',
    name: 'Peti Istimewa',
    variant: 'istimewa',
    soon: true,
    info: 'Hadiah jarang untuk acara & musim istimewa.',
  },
];

/**
 * Keadaan semasa sesuatu peti.
 * state: 'locked' | 'ready' | 'opened' | 'soon'
 * have/need: kemajuan ke peringkat seterusnya; reward: { coins, gems, gift }; next: mesej langkah seterusnya.
 */
export function chestStatus(chest, st) {
  if (chest.soon) return { state: 'soon', next: 'Akan datang tidak lama lagi!', reward: null };
  if (chest.id === 'harian') {
    const d = st.daily;
    const total = DAILY_MISSIONS.length;
    const claimed = DAILY_MISSIONS.filter((m) => d.claimed[m.id]).length;
    const reward = { ...DAILY_CHEST, gift: st.dailyChests === 0 ? 'ikat-merah' : null };
    if (d.chest) return { state: 'opened', have: total, need: total, reward, next: 'Sudah dibuka hari ini. Peti baharu esok!' };
    if (claimed === total) return { state: 'ready', have: total, need: total, reward, next: 'Peti sedia dibuka!' };
    const left = total - claimed;
    return { state: 'locked', have: claimed, need: total, reward, next: `Tuntut ${left} lagi misi harian untuk membuka peti ini.` };
  }
  const v = st.vault;
  const tierIdx = chest.tiers.findIndex((t) => !v.claimed[t.id]);
  if (tierIdx < 0) {
    const last = chest.tiers[chest.tiers.length - 1];
    return { state: 'opened', have: last.at, need: last.at, tier: chest.tiers.length, tiers: chest.tiers.length, reward: null, next: 'Semua peringkat sudah dibuka. Hebat!' };
  }
  const t = chest.tiers[tierIdx];
  const have = Math.min(t.at, chest.stat(st));
  const reward = { coins: t.coins || 0, gems: t.gems || 0, gift: t.gift || null };
  const base = { have, need: t.at, tier: tierIdx + 1, tiers: chest.tiers.length, tierId: t.id, reward };
  if (have >= t.at) return { ...base, state: 'ready', next: 'Peti sedia dibuka!' };
  const left = t.at - have;
  return { ...base, state: 'locked', next: `Lagi ${left} ${chest.unit} untuk membuka peti ini.` };
}

/** Buka peti. Pulangkan { coins, gems, gift } atau null jika tidak layak. Disimpan sebelum ganjaran diberi. */
export function openChest(chestId, st) {
  const chest = CHESTS.find((c) => c.id === chestId);
  if (!chest) return null;
  const status = chestStatus(chest, st);
  if (status.state !== 'ready') return null;
  if (chest.id === 'harian') {
    const r = claimChest();
    return r ? { coins: r.coins || 0, gems: r.gems || 0, gift: status.reward.gift } : null;
  }
  const v = loadVault();
  if (v.claimed[status.tierId]) return null;
  v.claimed[status.tierId] = true;
  return saveVault(v) ? status.reward : null;
}

/* ───────────── HADIAH (rak pameran) ───────────── */
// art: jenis lukisan dalam RewardArt; tone: warna utama.
export const GIFTS = [
  { id: 'ikat-merah', name: 'Ikat Kepala Merah', art: 'headband', tone: '#e5432d', hint: 'Buka Peti Harian pertama', got: (s) => s.dailyChests >= 1 },
  { id: 'skrol-pelajar', name: 'Skrol Pelajar', art: 'scroll', tone: '#e2b65c', hint: 'Peti Pencapaian · peringkat 1', got: (s) => !!s.vault.claimed.pc1 },
  { id: 'trofi-gangsa', name: 'Trofi Mini Gangsa', art: 'trophy', tone: '#c9793a', hint: 'Peti Mini Game · peringkat 1', got: (s) => !!s.vault.claimed.mg1 },
  { id: 'topeng-karya', name: 'Topeng Karya Saya', art: 'mask', tone: '#3c6fd1', hint: 'Simpan topeng di Studio Seni Shinobi', got: (s) => s.masks >= 1 },
  { id: 'bingkai-sakura', name: 'Bingkai Sakura', art: 'frame', tone: '#f28bb3', hint: 'Peti Pencapaian · peringkat 2', got: (s) => !!s.vault.claimed.pc2 },
  { id: 'pelekat-shuriken', name: 'Pelekat Shuriken', art: 'sticker', tone: '#5b6b8c', hint: 'Peti Mini Game · peringkat 2', got: (s) => !!s.vault.claimed.mg2 },
  { id: 'ikat-biru', name: 'Ikat Kepala Biru', art: 'headband', tone: '#2f8fe0', hint: 'Buka Peti Harian 3 kali', got: (s) => s.dailyChests >= 3 },
  { id: 'corak-emas', name: 'Corak Topeng Emas', art: 'pattern', tone: '#f0b43a', hint: 'Peti Mini Game · peringkat 3', got: (s) => !!s.vault.claimed.mg3 },
  { id: 'trofi-emas', name: 'Trofi Mini Emas', art: 'trophy', tone: '#f5c518', hint: 'Peti Pencapaian · peringkat 3', got: (s) => !!s.vault.claimed.pc3 },
  { id: 'kilauan', name: 'Kesan Kilauan', art: 'sparkle', tone: '#a77bf0', hint: 'Peti Istimewa (akan datang)', got: () => false, soon: true },
];

/* ───────────── LENCANA NINJA ───────────── */
// prog: [ada, sasaran] untuk bar kemajuan lencana berkunci.
export const BADGES = [
  { id: 'pelajar', name: 'Ninja Pelajar', icon: 'book', tone: '#2f8fe0', hint: 'Tamatkan 1 latihan', prog: (s) => [s.latihan, 1] },
  { id: 'rajin', name: 'Ninja Rajin', icon: 'flame', tone: '#ee7b00', hint: 'Tamatkan 10 latihan', prog: (s) => [s.latihan, 10] },
  { id: 'misi', name: 'Pemburu Misi', icon: 'scroll', tone: '#c94a2b', hint: 'Buka Peti Harian', prog: (s) => [s.dailyChests, 1] },
  { id: 'helang', name: 'Mata Helang', icon: 'eye', tone: '#2f9a4a', hint: 'Lulus Latihan Mata Ninja', prog: (s) => [s.spot.done, 1] },
  { id: 'sushi', name: 'Chef Sushi Muda', icon: 'sushi', tone: '#e5537a', hint: 'Lulus satu tahap Sushi', prog: (s) => [s.sushi.done, 1] },
  { id: 'shuriken', name: 'Pakar Shuriken', icon: 'shuriken', tone: '#5b6b8c', hint: 'Dapat 3 bintang dalam Shuriken', prog: (s) => [s.shuriken.best, 3] },
  { id: 'seniman', name: 'Seniman Shinobi', icon: 'brush', tone: '#8a55d6', hint: 'Simpan 1 topeng ke galeri', prog: (s) => [s.masks, 1] },
  { id: 'bintang', name: 'Bintang Akademi', icon: 'star', tone: '#f0a500', hint: 'Kumpul 20 bintang mini game', prog: (s) => [s.stars, 20] },
];

export const badgeGot = (b, s) => {
  const [have, need] = b.prog(s);
  return have >= need;
};

/** Tanda hadiah sebagai sudah dilihat (lencana "Baru!" hilang). */
export function markGiftsSeen(ids) {
  const v = loadVault();
  let changed = false;
  for (const id of ids) if (!v.seen[id]) (v.seen[id] = true), (changed = true);
  if (changed) saveVault(v);
}

/** Bilangan peti yang sedia dibuka (untuk lencana butang Ganjaran di homepage). */
export function vaultBadge(opts) {
  const st = readStats(opts);
  return CHESTS.filter((c) => chestStatus(c, st).state === 'ready').length;
}
