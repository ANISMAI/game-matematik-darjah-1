// Repositori galeri topeng — peribadi, disimpan dalam simpanan akademi (localStorage). Tiada perkongsian luar.
import { loadSave, updateSaveStrict } from '../mall/save.ts';
import { sanitizeDesign } from './model.ts';
import type { MaskDesign } from './model.ts';

export interface GalleryEntry extends MaskDesign {
  id: string;
  kind: 'mask';
  levelId: string;
  title: string;
  /** = templateId (nama medan mengikut brief). */
  baseTemplateId: string;
  createdAt: number;
  updatedAt: number;
}

export type SaveResult = { ok: true; entry: GalleryEntry } | { ok: false };

function parse(raw: unknown): GalleryEntry | null {
  if (!raw || typeof raw !== 'object') return null;
  const r = raw as Partial<GalleryEntry>;
  if (r.kind !== 'mask' || typeof r.id !== 'string') return null;
  const d = sanitizeDesign(r);
  if (!d) return null;
  return {
    ...d,
    id: r.id,
    kind: 'mask',
    levelId: String(r.levelId ?? ''),
    title: String(r.title ?? 'Topeng'),
    baseTemplateId: d.templateId,
    createdAt: Number(r.createdAt) || Date.now(),
    updatedAt: Number(r.updatedAt) || Date.now(),
  };
}

/** Senarai topeng (terbaharu dahulu). Entri rosak diabaikan (tidak merosakkan permainan). */
export function listMasks(): GalleryEntry[] {
  return loadSave()
    .gallery.map(parse)
    .filter((e): e is GalleryEntry => !!e)
    .sort((a, b) => b.updatedAt - a.updatedAt);
}

const newId = () => `m${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`;

/** Simpan baharu atau kemas kini (jika id diberi). Pulang ok:false jika storan gagal. */
export function saveMask(design: MaskDesign, meta: { id?: string; levelId: string; title: string }): SaveResult {
  const now = Date.now();
  const existing = meta.id ? listMasks().find((e) => e.id === meta.id) : null;
  const entry: GalleryEntry = {
    ...design,
    regions: { ...design.regions },
    items: { ...design.items },
    id: existing?.id ?? newId(),
    kind: 'mask',
    levelId: meta.levelId,
    title: meta.title,
    baseTemplateId: design.templateId,
    createdAt: existing?.createdAt ?? now,
    updatedAt: now,
  };
  const ok = updateSaveStrict((s) => {
    const i = s.gallery.findIndex((g) => (g as { id?: string }).id === entry.id);
    if (i >= 0) s.gallery[i] = entry;
    else s.gallery.push(entry);
  });
  return ok ? { ok: true, entry } : { ok: false };
}

export function renameMask(id: string, title: string): boolean {
  return updateSaveStrict((s) => {
    const g = s.gallery.find((x) => (x as { id?: string }).id === id) as GalleryEntry | undefined;
    if (g) {
      g.title = title;
      g.updatedAt = Date.now();
    }
  });
}

export function deleteMask(id: string): boolean {
  return updateSaveStrict((s) => {
    s.gallery = s.gallery.filter((x) => (x as { id?: string }).id !== id);
  });
}
