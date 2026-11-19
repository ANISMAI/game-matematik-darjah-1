// Model reka bentuk topeng + editor (undur/buat semula) + pengesah misi. Tulen — tiada DOM, diuji secara unit.
import { ANCHORS, EYE_BAND, MASK, TEMPLATES, anchorById, colorById, itemById } from './data.ts';
import type { MaskLevel, Objective } from './levels.ts';

/** Komposisi topeng (disimpan dalam galeri; dilukis semula pada sebarang saiz skrin). */
export interface MaskDesign {
  templateId: string;
  /** warna setiap kawasan: { main: 'blue' } atau { upper, lower } */
  regions: Record<string, string>;
  /** item pada setiap titik letak: { forehead: 'leaf-green', cheekL: 'star-yellow' } */
  items: Record<string, string>;
  /** aksesori: ikat kepala (id item) atau null */
  headband: string | null;
  /** lakaran berus (atas warna kawasan, dipotong ikut kawasan permulaan) */
  strokes: Stroke[];
}

/** Satu lakaran berus: warna, kawasan, lebar & titik rata [x0,y0,x1,y1,…] dalam ruang MASK. */
export interface Stroke {
  c: string;
  r: string;
  w: number;
  p: number[];
}
export const BRUSH_SIZES = { small: 18, big: 40 } as const;
const MAX_POINTS = 8000; // had keseluruhan titik lakaran (saiz storan galeri)
/** Warna dikira "siap" jika menutup sekurang-kurangnya 80% kawasan (berus tidak perlu sempurna). */
export const COVER_OK = 0.8;

// ---------- geometri topeng (tulen, untuk ketik baldi & liputan berus) ----------
const MID = (EYE_BAND.top + EYE_BAND.bottom) / 2;
const OUTLINE: number[] = (() => {
  // sama dengan maskPath() dalam art.ts — 4 lengkung bezier kubik
  const segs = [
    [200, 34, 326, 34, 358, 140, 352, 246],
    [352, 246, 346, 352, 284, 430, 200, 436],
    [200, 436, 116, 430, 54, 352, 48, 246],
    [48, 246, 42, 140, 74, 34, 200, 34],
  ];
  const pts: number[] = [];
  for (const [x0, y0, x1, y1, x2, y2, x3, y3] of segs)
    for (let i = 0; i < 24; i++) {
      const t = i / 24;
      const u = 1 - t;
      pts.push(u * u * u * x0 + 3 * u * u * t * x1 + 3 * u * t * t * x2 + t * t * t * x3, u * u * u * y0 + 3 * u * u * t * y1 + 3 * u * t * t * y2 + t * t * t * y3);
    }
  return pts;
})();
export function insideMask(x: number, y: number): boolean {
  let inside = false;
  for (let i = 0, j = OUTLINE.length - 2; i < OUTLINE.length; j = i, i += 2) {
    const xi = OUTLINE[i], yi = OUTLINE[i + 1], xj = OUTLINE[j], yj = OUTLINE[j + 1];
    if (yi > y !== yj > y && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi) inside = !inside;
  }
  return inside;
}
/** Jalur mata (wajah) — bukan kain, tidak boleh diwarna. */
export const inEyeBand = (x: number, y: number) => x >= 72 && x <= 328 && y >= EYE_BAND.top && y <= EYE_BAND.bottom;
/** Kawasan warna pada titik (atau null jika luar topeng / pada wajah). */
export function regionAt(templateId: string, x: number, y: number): string | null {
  if (!insideMask(x, y) || inEyeBand(x, y)) return null;
  return templateId === 'twotone' ? (y < MID ? 'upper' : 'lower') : 'main';
}
/** Grid sampel kawasan (dikira sekali). */
const SAMPLES: Record<string, number[]> = {};
function samplesOf(templateId: string, region: string): number[] {
  const k = templateId + ':' + region;
  if (!SAMPLES[k]) {
    const out: number[] = [];
    for (let y = 4; y < MASK.h; y += 8) for (let x = 4; x < MASK.w; x += 8) if (regionAt(templateId, x, y) === region) out.push(x, y);
    SAMPLES[k] = out;
  }
  return SAMPLES[k];
}
function nearStroke(st: Stroke, x: number, y: number): boolean {
  const r2 = (st.w / 2) * (st.w / 2);
  const p = st.p;
  if (p.length === 2) return (x - p[0]) ** 2 + (y - p[1]) ** 2 <= r2;
  for (let i = 0; i + 3 < p.length; i += 2) {
    const ax = p[i], ay = p[i + 1], bx = p[i + 2], by = p[i + 3];
    const dx = bx - ax, dy = by - ay, L = dx * dx + dy * dy;
    const t = L ? Math.max(0, Math.min(1, ((x - ax) * dx + (y - ay) * dy) / L)) : 0;
    if ((ax + t * dx - x) ** 2 + (ay + t * dy - y) ** 2 <= r2) return true;
  }
  return false;
}
/** Pecahan kawasan yang ditutupi setiap warna (warna isi + lakaran berus teratas). */
export function coverage(d: MaskDesign, region: string): Record<string, number> {
  const pts = samplesOf(d.templateId, region);
  const strokes = d.strokes.filter((s) => s.r === region);
  const boxes = strokes.map((s) => {
    let x0 = Infinity, y0 = Infinity, x1 = -Infinity, y1 = -Infinity;
    for (let i = 0; i < s.p.length; i += 2) {
      x0 = Math.min(x0, s.p[i]); x1 = Math.max(x1, s.p[i]); y0 = Math.min(y0, s.p[i + 1]); y1 = Math.max(y1, s.p[i + 1]);
    }
    const h = s.w / 2;
    return [x0 - h, y0 - h, x1 + h, y1 + h];
  });
  const count: Record<string, number> = {};
  const n = pts.length / 2;
  for (let i = 0; i < pts.length; i += 2) {
    const x = pts[i], y = pts[i + 1];
    let col = d.regions[region];
    for (let k = strokes.length - 1; k >= 0; k--) {
      const b = boxes[k];
      if (x < b[0] || x > b[2] || y < b[1] || y > b[3]) continue;
      if (nearStroke(strokes[k], x, y)) {
        col = strokes[k].c;
        break;
      }
    }
    count[col] = (count[col] ?? 0) + 1;
  }
  for (const c of Object.keys(count)) count[c] /= n || 1;
  return count;
}

export function emptyDesign(templateId: string): MaskDesign {
  const regions: Record<string, string> = {};
  for (const r of TEMPLATES[templateId]?.regions ?? []) regions[r.id] = 'white';
  return { templateId, regions, items: {}, headband: null, strokes: [] };
}

export const cloneDesign = (d: MaskDesign): MaskDesign => ({ templateId: d.templateId, regions: { ...d.regions }, items: { ...d.items }, headband: d.headband, strokes: d.strokes.slice() });
export const sameDesign = (a: MaskDesign, b: MaskDesign) => JSON.stringify(a) === JSON.stringify(b);

/** Pastikan reka bentuk sah (contoh dari galeri lama / storan rosak). Item tidak dikenali dibuang. */
export function sanitizeDesign(raw: unknown): MaskDesign | null {
  if (!raw || typeof raw !== 'object') return null;
  const r = raw as Partial<MaskDesign>;
  const tpl = TEMPLATES[r.templateId ?? ''];
  if (!tpl) return null;
  const d = emptyDesign(tpl.id);
  for (const reg of tpl.regions) if (typeof r.regions?.[reg.id] === 'string') d.regions[reg.id] = r.regions[reg.id];
  for (const [a, it] of Object.entries(r.items ?? {})) {
    const an = anchorById(a);
    const item = itemById(String(it));
    if (an && item && item.kind === an.accepts) d.items[a] = item.id;
  }
  if (r.headband && itemById(r.headband)?.kind === 'accessory') d.headband = r.headband;
  let total = 0;
  for (const st of Array.isArray(r.strokes) ? r.strokes : []) {
    if (!st || typeof st !== 'object' || !colorById(st.c) || !(st.r in d.regions) || !Array.isArray(st.p)) continue;
    const p = st.p.filter((v) => typeof v === 'number' && Number.isFinite(v)).map((v) => Math.round(Math.max(0, Math.min(MASK.h, v))));
    if (p.length < 2 || p.length % 2 || total + p.length / 2 > MAX_POINTS) continue;
    total += p.length / 2;
    d.strokes.push({ c: st.c, r: st.r, w: Math.max(6, Math.min(60, Number(st.w) || BRUSH_SIZES.small)), p });
  }
  return d;
}

// ---------- operasi editor (tulen) ----------
/** Baldi cat: isi seluruh kawasan dengan satu warna (lakaran berus dalam kawasan itu ditimpa). */
export function recolor(d: MaskDesign, region: string, color: string): MaskDesign {
  if (!(region in d.regions) || !colorById(color)) return d;
  const strokes = d.strokes.filter((s) => s.r !== region);
  if (d.regions[region] === color && strokes.length === d.strokes.length) return d;
  return { ...cloneDesign(d), regions: { ...d.regions, [region]: color }, strokes };
}
/** Berus: tambah satu lakaran (diabaikan jika tidak sah atau melebihi had storan). */
export function addStroke(d: MaskDesign, st: Stroke): MaskDesign {
  if (!colorById(st.c) || !(st.r in d.regions) || st.p.length < 2 || st.p.length % 2) return d;
  if (strokeBudgetLeft(d) < st.p.length / 2) return d;
  return { ...cloneDesign(d), strokes: [...d.strokes, { c: st.c, r: st.r, w: st.w, p: st.p.map(Math.round) }] };
}
/** Baki titik berus sebelum had storan. */
export const strokeBudgetLeft = (d: MaskDesign) => MAX_POINTS - d.strokes.reduce((n, s) => n + s.p.length / 2, 0);
export function placeItem(d: MaskDesign, anchor: string, item: string): MaskDesign {
  const an = anchorById(anchor);
  const it = itemById(item);
  if (!an || !it || it.kind !== an.accepts || d.items[anchor] === item) return d;
  return { ...cloneDesign(d), items: { ...d.items, [anchor]: item } };
}
export function removeItem(d: MaskDesign, anchor: string): MaskDesign {
  if (!(anchor in d.items)) return d;
  const items = { ...d.items };
  delete items[anchor];
  return { ...cloneDesign(d), items };
}
export function setHeadband(d: MaskDesign, item: string | null): MaskDesign {
  if (d.headband === item) return d;
  return { ...cloneDesign(d), headband: item };
}

/** Sejarah undur / buat semula (meliputi warna, pelekat, corak & aksesori). */
export class History {
  private past: MaskDesign[] = [];
  private future: MaskDesign[] = [];
  current: MaskDesign;
  constructor(start: MaskDesign) {
    this.current = start;
  }
  /** Rekod perubahan (abaikan jika tiada perubahan). Pulangkan true jika berubah. */
  apply(next: MaskDesign): boolean {
    if (next === this.current || sameDesign(next, this.current)) return false;
    this.past.push(this.current);
    if (this.past.length > 80) this.past.shift();
    this.future = [];
    this.current = next;
    return true;
  }
  undo(): boolean {
    const p = this.past.pop();
    if (!p) return false;
    this.future.push(this.current);
    this.current = p;
    return true;
  }
  redo(): boolean {
    const f = this.future.pop();
    if (!f) return false;
    this.past.push(this.current);
    this.current = f;
    return true;
  }
  get canUndo() {
    return this.past.length > 0;
  }
  get canRedo() {
    return this.future.length > 0;
  }
}

// ---------- pengesah misi ----------
export interface CheckItem {
  ok: boolean;
  /** Teks arahan objektif (sentiasa dipaparkan dalam senarai semak). */
  label: { key: string; params: Record<string, string | number> };
  /** Maklum balas khusus bila belum lulus (contoh: "Tambah 1 lagi Bintang Kuning"). */
  fix: { key: string; params: Record<string, string | number> } | null;
  /** Apa yang perlu ditonjolkan oleh petunjuk. */
  focus: { tool: 'colors' | 'symbols' | 'patterns' | 'accessories'; region?: string; anchor?: string; item?: string };
}

const pairs = (kind: 'symbol' | 'pattern') => ANCHORS.filter((a) => a.accepts === kind && a.mirror && a.id < a.mirror).map((a) => [a.id, a.mirror!] as const);

export function checkObjective(d: MaskDesign, o: Objective): CheckItem {
  switch (o.type) {
    case 'regionColor': {
      const cov = coverage(d, o.region)[o.color] ?? 0;
      const ok = cov >= COVER_OK;
      const params = { region: `@mask.r.${o.region}`, color: `@mask.c.${o.color}` };
      return {
        ok,
        label: { key: 'mask.o.regionColor', params },
        // sudah separuh diwarna dengan berus → minta habiskan; jika tidak → warnakan
        fix: ok ? null : cov >= 0.25 ? { key: 'mask.f.regionMore', params: { ...params, pct: Math.round(cov * 100) } } : { key: 'mask.f.regionColor', params },
        focus: { tool: 'colors', region: o.region },
      };
    }
    case 'decalCount': {
      const have = Object.values(d.items).filter((i) => i === o.item).length;
      const name = `@${itemById(o.item)?.nameKey ?? o.item}`;
      const ok = have === o.count;
      return {
        ok,
        label: { key: 'mask.o.decalCount', params: { n: o.count, item: name } },
        fix: ok ? null : have < o.count ? { key: 'mask.f.decalMore', params: { n: o.count - have, item: name } } : { key: 'mask.f.decalLess', params: { n: have - o.count, item: name } },
        focus: { tool: 'symbols', item: o.item },
      };
    }
    case 'decalAt': {
      const at = d.items[o.anchor];
      const ok = !!at && itemById(at)?.family === o.family;
      const famName = `@mask.fam.${o.family}`;
      const anchor = `@${anchorById(o.anchor)?.nameKey ?? o.anchor}`;
      // salah letak: keluarga betul ada di titik lain
      const elsewhere = Object.entries(d.items).find(([a, i]) => a !== o.anchor && itemById(i)?.family === o.family);
      return {
        ok,
        label: { key: 'mask.o.decalAt', params: { item: famName, anchor } },
        fix: ok ? null : elsewhere ? { key: 'mask.f.decalMove', params: { item: famName, anchor } } : { key: 'mask.f.decalAt', params: { item: famName, anchor } },
        focus: { tool: anchorById(o.anchor)?.accepts === 'pattern' ? 'patterns' : 'symbols', anchor: o.anchor },
      };
    }
    case 'mirrorPair': {
      const ps = pairs(o.kind);
      const ok = ps.some(([l, r]) => !!d.items[l] && d.items[l] === d.items[r]);
      // ada separuh pasangan? beritahu pasangan yang perlu dilengkapkan
      const half = ps.find(([l, r]) => !!d.items[l] !== !!d.items[r] || (d.items[l] && d.items[r] && d.items[l] !== d.items[r]));
      const kindName = o.kind === 'symbol' ? '@mask.kind.symbol' : '@mask.kind.pattern';
      let fix: CheckItem['fix'] = null;
      if (!ok) {
        if (half && d.items[half[0]] && d.items[half[1]]) fix = { key: 'mask.f.mirrorDiff', params: { kind: kindName } };
        else if (half) fix = { key: 'mask.f.mirrorOther', params: { kind: kindName, anchor: `@${anchorById(d.items[half[0]] ? half[1] : half[0])!.nameKey}` } };
        else fix = { key: 'mask.f.mirror', params: { kind: kindName } };
      }
      const target = half ? (d.items[half[0]] ? half[1] : half[0]) : ps[0]?.[0];
      return { ok, label: { key: 'mask.o.mirror', params: { kind: kindName } }, fix, focus: { tool: o.kind === 'symbol' ? 'symbols' : 'patterns', anchor: target } };
    }
    case 'accessory': {
      const ok = !!d.headband;
      return { ok, label: { key: 'mask.o.headband', params: {} }, fix: ok ? null : { key: 'mask.f.headband', params: {} }, focus: { tool: 'accessories' } };
    }
  }
}

export function validate(d: MaskDesign, level: MaskLevel): CheckItem[] {
  return level.objectives.map((o) => checkObjective(d, o));
}

/** Bintang: 3★ tanpa petunjuk & ≤1 semakan gagal; 2★ ≤3 semakan gagal atau 1 petunjuk; 1★ selesai. */
export function maskStars(level: Pick<MaskLevel, 'stars'>, fails: number, hints: number): 1 | 2 | 3 {
  if (hints === 0 && fails <= level.stars.threeMaxFails) return 3;
  if (fails <= level.stars.twoMaxFails && hints <= 1) return 2;
  return 1;
}

/** Tajuk selamat: huruf, nombor, ruang & tanda ringkas; maksimum 24 aksara. */
export function safeTitle(raw: string, fallback: string): string {
  const s = raw.replace(/[^\p{L}\p{N} '\-!.]/gu, '').replace(/\s+/g, ' ').trim().slice(0, 24);
  return s || fallback;
}
