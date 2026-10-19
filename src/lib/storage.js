import { useCallback, useEffect, useState } from 'react';

const KEY = 'youedu-pulau-ninja-v1';

const DEFAULTS = {
  completed: {}, // { 'nombor/bilang': true }
  started: {}, // misi yang pernah dimulakan
  lastRegion: null,
  lastMission: null, // { regionId, subId }
  sound: true,
  introSeen: {}, // { nombor: true } intro cerita kawasan sudah ditonton
};

function load() {
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? { ...DEFAULTS, ...JSON.parse(raw) } : { ...DEFAULTS };
  } catch {
    return { ...DEFAULTS };
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

// 'selesai' | 'sedang' | 'belum'
export function missionStatus(progress, regionId, subId) {
  const key = missionKey(regionId, subId);
  if (progress.completed[key]) return 'selesai';
  if (progress.started[key]) return 'sedang';
  return 'belum';
}

export function completedInRegion(progress, region) {
  return region.subtopics.filter((s) => progress.completed[missionKey(region.id, s.id)]).length;
}
