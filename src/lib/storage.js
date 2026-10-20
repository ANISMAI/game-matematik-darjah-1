import { useCallback, useEffect, useState } from 'react';
import { activitiesFor } from '../data/activities.js';

// Kunci asal dikekalkan; data dinaik taraf di tempat (version) supaya kemajuan Fasa 1 tidak hilang.
const KEY = 'youedu-pulau-ninja-v1';
const VERSION = 2;

const DEFAULTS = {
  version: VERSION,
  completed: {}, // Fasa 1: { 'nombor/bilang': true } (dikekalkan untuk keserasian)
  started: {}, // Fasa 1: subtopik yang pernah dimulakan
  // Fasa 2: { [activityId]: { started, ever, run } }
  //   ever = pernah selesai (tidak dipadam oleh main semula); run = percubaan aktif yang boleh disambung
  activities: {},
  lastRegion: null,
  lastMission: null, // { regionId, subId, activityId }
  sound: true,
  introSeen: {}, // { nombor: true } intro cerita kawasan sudah ditonton
};

const isObj = (v) => v !== null && typeof v === 'object' && !Array.isArray(v);

export function migrate(raw) {
  const p = { ...DEFAULTS, ...(isObj(raw) ? raw : {}) };
  for (const k of ['completed', 'started', 'activities', 'introSeen']) if (!isObj(p[k])) p[k] = {};
  if (typeof p.sound !== 'boolean') p.sound = true;
  if (!isObj(p.lastMission)) p.lastMission = null;

  const activities = {};
  for (const [id, a] of Object.entries(p.activities)) {
    if (!isObj(a)) continue;
    activities[id] = { started: Boolean(a.started), ever: Boolean(a.ever), run: isObj(a.run) ? a.run : null };
  }
  if (!(p.version >= 2)) {
    // Fasa 1 → Fasa 2: Bilang Objek disimpan sebagai subtopik 'nombor/bilang'
    const b = activities.bilang ?? { started: false, ever: false, run: null };
    if (p.completed['nombor/bilang']) b.ever = true;
    if (p.started['nombor/bilang'] || b.ever) b.started = true;
    activities.bilang = b;
  }
  p.activities = activities;
  p.version = VERSION;
  return p;
}

function load() {
  try {
    const raw = localStorage.getItem(KEY);
    return migrate(raw ? JSON.parse(raw) : null);
  } catch {
    // storan rosak atau disekat: mula dengan kemajuan kosong (data asal tidak ditulis ganti sehingga ada perubahan)
    return migrate(null);
  }
}

export const missionKey = (regionId, subId) => `${regionId}/${subId}`;

export function useProgress() {
  const [progress, setProgress] = useState(load);

  useEffect(() => {
    try {
      localStorage.setItem(KEY, JSON.stringify(progress));
    } catch {
      // storan disekat: kemajuan hanya kekal untuk sesi ini
    }
  }, [progress]);

  const update = useCallback((fn) => setProgress((prev) => ({ ...prev, ...fn(prev) })), []);
  return [progress, update];
}

// Kemas kini satu rekod aktiviti (digunakan dalam update()).
export function patchActivity(p, id, patch) {
  const prev = p.activities[id] ?? { started: false, ever: false, run: null };
  return { activities: { ...p.activities, [id]: { ...prev, ...patch } } };
}

// 'selesai' | 'sedang' | 'belum'
export function activityStatus(progress, id) {
  const a = progress.activities[id];
  if (a?.ever) return 'selesai';
  if (a?.started || a?.run) return 'sedang';
  return 'belum';
}

// Subtopik selesai bila semua aktiviti yang tersedia di dalamnya selesai. Subtopik pratonton tidak pernah selesai.
export function missionStatus(progress, regionId, subId) {
  const list = activitiesFor(regionId, subId);
  if (!list.length) return 'belum';
  const st = list.map((a) => activityStatus(progress, a.id));
  if (st.every((s) => s === 'selesai')) return 'selesai';
  if (st.some((s) => s !== 'belum')) return 'sedang';
  return 'belum';
}

// Kemajuan kawasan dikira daripada aktiviti tersedia sahaja.
export function regionStats(progress, region) {
  const list = activitiesFor(region.id);
  return { total: list.length, done: list.filter((a) => progress.activities[a.id]?.ever).length };
}

export function completedInRegion(progress, region) {
  return regionStats(progress, region).done;
}
