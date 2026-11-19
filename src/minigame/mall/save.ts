// Simpanan tunggal Akademi Ninja (localStorage, satu kunci, berversi).
// Semua data akademi — tutorial, kemajuan permainan mini, dompet ganjaran — disimpan di sini sahaja
// supaya tiada beberapa stor yang tidak serasi. Kemajuan utama aplikasi (lib/storage.js) tidak disentuh.

export interface LevelProgress {
  /** Pernah selesai (tidak dipadam oleh main semula). */
  done: boolean;
  /** Bintang terbaik (0–3). Main semula hanya boleh menaikkan. */
  stars: number;
  /** Ganjaran penyelesaian pertama sudah diberi. */
  rewarded: boolean;
  plays: number;
  /** Statistik terkumpul pilihan setiap permainan (contoh: { orders: 12 }). */
  stats?: Record<string, number>;
}

export interface MallSave {
  v: 1;
  tutorialDone: boolean;
  /** { [gameId]: { [levelNo]: LevelProgress } } */
  games: Record<string, Record<string, LevelProgress>>;
  /** Dompet sementara akademi (penyesuai rewards.ts) sehingga ekonomi bersama siap. */
  wallet: { coins: number; xp: number };
  /** Bendera "sudah dilihat" (contoh: tutorial dalam permainan mini). */
  seen: Record<string, boolean>;
  /** Galeri peribadi (topeng ninja dll.) — komposisi berstruktur, bukan tangkapan skrin. */
  gallery: unknown[];
}

const KEY = 'mall:save';
const OLD_TUTORIAL_KEY = 'mall:tutorialDone'; // Fasa 2

const isObj = (v: unknown): v is Record<string, unknown> => v !== null && typeof v === 'object' && !Array.isArray(v);

function fresh(): MallSave {
  return { v: 1, tutorialDone: false, games: {}, wallet: { coins: 0, xp: 0 }, seen: {}, gallery: [] };
}

function migrate(raw: unknown): MallSave {
  const s = fresh();
  if (isObj(raw)) {
    s.tutorialDone = raw.tutorialDone === true;
    if (isObj(raw.games)) {
      for (const [gid, levels] of Object.entries(raw.games)) {
        if (!isObj(levels)) continue;
        s.games[gid] = {};
        for (const [n, lv] of Object.entries(levels)) {
          if (!isObj(lv)) continue;
          s.games[gid][n] = {
            done: lv.done === true,
            stars: Math.max(0, Math.min(3, Number(lv.stars) || 0)),
            rewarded: lv.rewarded === true,
            plays: Math.max(0, Number(lv.plays) || 0),
          };
          if (isObj(lv.stats)) {
            const st: Record<string, number> = {};
            for (const [k, v] of Object.entries(lv.stats)) if (Number.isFinite(Number(v))) st[k] = Number(v);
            s.games[gid][n].stats = st;
          }
        }
      }
    }
    if (Array.isArray(raw.gallery)) s.gallery = raw.gallery.filter(isObj);
    if (isObj(raw.seen)) for (const [k, v] of Object.entries(raw.seen)) if (v === true) s.seen[k] = true;
    if (isObj(raw.wallet)) s.wallet = { coins: Math.max(0, Number(raw.wallet.coins) || 0), xp: Math.max(0, Number(raw.wallet.xp) || 0) };
  }
  return s;
}

let cache: MallSave | null = null;

export function loadSave(): MallSave {
  if (cache) return cache;
  let s = fresh();
  try {
    const raw = localStorage.getItem(KEY);
    s = migrate(raw ? JSON.parse(raw) : null);
    // naik taraf daripada kunci tutorial Fasa 2
    if (!s.tutorialDone && localStorage.getItem(OLD_TUTORIAL_KEY) === '1') s.tutorialDone = true;
  } catch {
    /* storan rosak / disekat: guna simpanan kosong untuk sesi ini */
  }
  cache = s;
  return s;
}

/** Ubah simpanan secara atomik dan tulis ke localStorage. */
/**
 * Seperti updateSave, tetapi melaporkan kegagalan storan (contoh: storan penuh / disekat).
 * Jika gagal, simpanan dalam memori TIDAK diubah — UI boleh tunjuk ralat & cuba semula (tiada "Disimpan" palsu).
 */
export function updateSaveStrict(fn: (s: MallSave) => void): boolean {
  const s = structuredClone(loadSave());
  fn(s);
  try {
    localStorage.setItem(KEY, JSON.stringify(s));
  } catch {
    return false;
  }
  cache = s;
  return true;
}

export function updateSave(fn: (s: MallSave) => void): MallSave {
  const s = structuredClone(loadSave());
  fn(s);
  cache = s;
  try {
    localStorage.setItem(KEY, JSON.stringify(s));
  } catch {
    /* storan disekat: kekal dalam memori sahaja */
  }
  return s;
}

/** Untuk ujian: lupakan cache supaya simpanan dibaca semula daripada localStorage. */
export function reloadSave() {
  cache = null;
}

export function levelProgress(gameId: string, level: number): LevelProgress {
  return loadSave().games[gameId]?.[String(level)] ?? { done: false, stars: 0, rewarded: false, plays: 0 };
}

/** Bendera "sudah dilihat" (tutorial permainan mini dll.). */
export function hasSeen(key: string): boolean {
  return loadSave().seen[key] === true;
}
export function markSeen(key: string) {
  if (!hasSeen(key)) updateSave((sv) => (sv.seen[key] = true));
}

/** Tambah kiraan percubaan tahap (dipanggil setiap kali tahap dimulakan). */
export function recordAttempt(gameId: string, level: number) {
  updateSave((sv) => {
    const g = (sv.games[gameId] ??= {});
    const prev = g[String(level)] ?? { done: false, stars: 0, rewarded: false, plays: 0 };
    g[String(level)] = { ...prev, stats: { ...(prev.stats ?? {}), attempts: (prev.stats?.attempts ?? 0) + 1 } };
  });
}
