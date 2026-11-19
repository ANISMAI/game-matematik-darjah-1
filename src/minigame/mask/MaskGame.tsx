// Ninja Mask Designer (Studio Seni Shinobi) — Mod B: siapkan misi guru → hias bebas → simpan ke galeri.
// Keadaan: pengenalan → sunting misi → misi lulus (hias bebas) → simpan → keputusan; galeri boleh dibuka bila-bila.
// Logik dalam model.ts (tulen); galeri dalam gallery.ts; ganjaran dalam results.ts.
import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { Brush, Check, ChevronRight, PaintBucket, DoorOpen, Images, Lightbulb, Lock, Pencil, Play, Redo2, RotateCcw, Save, Star, Trash2, Undo2, X } from 'lucide-react';
import { NPCS } from '../mall/config.ts';
import { idleFrame, loadSheet } from '../mall/sprites.ts';
import { hasSeen, markSeen } from '../mall/save.ts';
import { t } from '../mall/strings.ts';
import { playSound } from '../../lib/sound.js';
import { ANCHORS, COLORS, ITEMS, MASK, colorById, itemById } from './data.ts';
import type { Tool } from './data.ts';
import { MASK_LEVELS, maskLevel } from './levels.ts';
import type { MaskLevel } from './levels.ts';
import { BRUSH_SIZES, History, addStroke, regionAt, strokeBudgetLeft, emptyDesign, placeItem, recolor, removeItem, safeTitle, sameDesign, setHeadband, validate, cloneDesign } from './model.ts';
import type { CheckItem, MaskDesign, Stroke } from './model.ts';
import { deleteMask, listMasks, renameMask, saveMask } from './gallery.ts';
import type { GalleryEntry } from './gallery.ts';
import { recordMaskPass } from './results.ts';
import type { MaskResult } from './results.ts';
import { drawMask, itemIcon, renderMaskThumb } from './art.ts';
import '../spot/spot.css';
import './mask.css';

type Phase = 'intro' | 'edit' | 'result' | 'gallery';
type Mode = 'mission' | 'free';
type Confirm = null | { kind: 'reset' } | { kind: 'leave' } | { kind: 'delete'; entry: GalleryEntry };
const TOOLS: { id: Tool; icon: string }[] = [
  { id: 'colors', icon: '🎨' },
  { id: 'symbols', icon: '⭐' },
  { id: 'patterns', icon: '〰️' },
  { id: 'accessories', icon: '🎀' },
];
const fmt = (s: string, v: Record<string, string | number>) => s.replace(/\{(\w+)\}/g, (_, k) => String(v[k] ?? ''));
/** Parameter '@kunci' diterjemah (nama warna / item / titik). */
const tp = (m: { key: string; params: Record<string, string | number> }) =>
  fmt(t(m.key), Object.fromEntries(Object.entries(m.params).map(([k, v]) => [k, typeof v === 'string' && v.startsWith('@') ? t(v.slice(1)) : v])));
const guruDef = NPCS.find((n) => n.id === 'seni');

export default function MaskGame({ startLevel, sound, onExit }: { startLevel: number; sound: boolean; onExit: () => void }) {
  const [levelN, setLevelN] = useState(startLevel);
  const level: MaskLevel = maskLevel(levelN) ?? MASK_LEVELS[0];
  const [phase, setPhase] = useState<Phase>('intro');
  const [mode, setMode] = useState<Mode>('mission');
  const histRef = useRef(new History(emptyDesign(level.templateId)));
  const liveRef = useRef<{ id: number; st: Stroke } | null>(null);
  const [, setVer] = useState(0);
  const bump = () => setVer((v) => v + 1);
  const design = histRef.current.current;
  const [tool, setTool] = useState<Tool>('colors');
  // cat: pilih warna dahulu (tidak terus diwarnakan), kemudian Berus (lukis sendiri) atau Baldi Cat (ketik = isi penuh)
  const [paintColor, setPaintColor] = useState<string | null>(null);
  const [paintMode, setPaintMode] = useState<'brush' | 'bucket' | null>(null);
  const [brushSize, setBrushSize] = useState<keyof typeof BRUSH_SIZES>('big');
  const [selItem, setSelItem] = useState<string | null>(null);
  const [checks, setChecks] = useState<CheckItem[] | null>(null);
  const [fails, setFails] = useState(0);
  const [hints, setHints] = useState(0);
  const [hint, setHint] = useState<CheckItem['focus'] | null>(null);
  const [passedSnap, setPassedSnap] = useState<MaskDesign | null>(null);
  const [result, setResult] = useState<MaskResult | null>(null);
  const [lastSaved, setLastSaved] = useState<{ design: MaskDesign; title: string; id: string } | null>(null);
  const [editingEntry, setEditingEntry] = useState<GalleryEntry | null>(null);
  const [confirm, setConfirm] = useState<Confirm>(null);
  const [saveDlg, setSaveDlg] = useState<null | { title: string; status: 'idle' | 'saving' | 'error' }>(null);
  const [tut, setTut] = useState<number | null>(null);
  const [toast, setToast] = useState<{ id: number; text: string; good?: boolean } | null>(null);
  const [gallery, setGallery] = useState<GalleryEntry[]>([]);
  const [renaming, setRenaming] = useState<{ id: string; title: string } | null>(null);
  const [galleryFrom, setGalleryFrom] = useState<Phase>('intro');
  const [drag, setDrag] = useState<{ item: string; x: number; y: number } | null>(null);
  const savingRef = useRef(false);
  const passedRef = useRef(false);
  const fxId = useRef(0);
  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);
  useEffect(() => () => timers.current.forEach(clearTimeout), []);

  const showToast = useCallback((text: string, good = false) => {
    const id = ++fxId.current;
    setToast({ id, text, good });
    timers.current.push(setTimeout(() => setToast((x) => (x?.id === id ? null : x)), 1800));
  }, []);

  // ---- mula / reset sesi tahap ----
  const beginLevel = useCallback((lv: MaskLevel, start?: { design: MaskDesign; entry: GalleryEntry }) => {
    histRef.current = new History(start ? cloneDesign(start.design) : emptyDesign(lv.templateId));
    setMode(start ? 'free' : 'mission');
    setTool(start ? 'colors' : lv.allowedTools[0]);
    liveRef.current = null;
    setSelItem(null);
    setChecks(null);
    setFails(0);
    setHints(0);
    setHint(null);
    setPassedSnap(start ? cloneDesign(start.design) : null);
    setResult(null);
    setLastSaved(start ? { design: cloneDesign(start.design), title: start.entry.title, id: start.entry.id } : null);
    setEditingEntry(start?.entry ?? null);
    setConfirm(null);
    setSaveDlg(null);
    passedRef.current = !!start;
    savingRef.current = false;
    setPhase('edit');
    if (!start && !hasSeen(`mask:tut:${lv.n}`)) setTut(0);
    else setTut(null);
    bump();
  }, []);

  // ---- tindakan editor ----
  const apply = (next: MaskDesign, msg?: string) => {
    if (histRef.current.apply(next)) {
      if (msg) showToast(msg, true);
      playSound('tap', sound);
      bump();
      if (hint) setHint(null);
    }
  };
  const allowed = (tl: Tool) => mode === 'free' || level.allowedTools.includes(tl);
  const itemsFor = (kind: 'symbol' | 'pattern' | 'accessory') => (mode === 'free' ? ITEMS : ITEMS.filter((i) => level.items.includes(i.id))).filter((i) => i.kind === kind);
  const placeAt = (anchor: string, item: string) => {
    const before = histRef.current.current;
    const next = placeItem(before, anchor, item);
    if (next !== before) apply(next, t('mask.placed'));
  };
  const undo = () => histRef.current.undo() && (bump(), playSound('tap', sound));
  const redo = () => histRef.current.redo() && (bump(), playSound('tap', sound));

  const runCheck = () => {
    if (mode !== 'mission' || passedRef.current) return;
    const res = validate(histRef.current.current, level);
    setChecks(res);
    setHint(null);
    if (res.every((c) => c.ok)) {
      // misi lulus: rekod sekali (ganjaran tidak berganda walaupun ketik laju)
      passedRef.current = true;
      setResult(recordMaskPass(level, fails, hints));
      setPassedSnap(cloneDesign(histRef.current.current));
      setMode('free');
      setSelItem(null);
      playSound('done', sound);
      showToast(t('mask.passed'), true);
    } else {
      setFails((f) => f + 1);
      playSound('wrong', sound);
      showToast(t('mask.notYet'));
    }
  };

  const useHint = () => {
    if (mode !== 'mission') return;
    const first = validate(histRef.current.current, level).find((c) => !c.ok);
    if (!first) return void showToast(t('mask.allDone'), true);
    setHints((h) => h + 1);
    setHint(first.focus);
    setTool(first.focus.tool);
    showToast(fmt(t('mask.hintMsg'), { fix: tp(first.fix!) }));
    timers.current.push(setTimeout(() => setHint((h) => (h === first.focus ? null : h)), 6000));
  };

  // ---- simpan ke galeri ----
  const openSave = () => {
    if (mode !== 'free') return;
    setSaveDlg({ title: lastSaved?.title ?? editingEntry?.title ?? `Topeng ${t(level.titleKey)}`, status: 'idle' });
  };
  const doSave = () => {
    if (!saveDlg || savingRef.current) return; // elak simpan berganda
    savingRef.current = true;
    const title = safeTitle(saveDlg.title, `Topeng ${t(level.titleKey)}`);
    setSaveDlg({ title, status: 'saving' });
    const res = saveMask(histRef.current.current, { id: lastSaved?.id ?? editingEntry?.id, levelId: level.id, title });
    savingRef.current = false;
    if (!res.ok) return setSaveDlg({ title, status: 'error' }); // jangan tunjuk "Disimpan" jika gagal
    setLastSaved({ design: cloneDesign(histRef.current.current), title: res.entry.title, id: res.entry.id });
    setSaveDlg(null);
    playSound('correct', sound);
    showToast(t('mask.saved'), true);
    if (editingEntry) openGallery('edit');
    else setPhase('result');
  };

  // ---- galeri ----
  const openGallery = (from: Phase) => {
    setGallery(listMasks());
    setGalleryFrom(from);
    setRenaming(null);
    setPhase('gallery');
  };
  const reopen = (e: GalleryEntry) => {
    const lv = MASK_LEVELS.find((l) => l.id === e.levelId) ?? level;
    setLevelN(lv.n);
    beginLevel(lv, { design: e, entry: e });
  };

  // ---- keluar dengan suntingan belum disimpan ----
  const dirty = phase === 'edit' && (lastSaved ? !sameDesign(design, lastSaved.design) : !sameDesign(design, emptyDesign(level.templateId)));
  const requestExit = () => {
    if (dirty) setConfirm({ kind: 'leave' });
    else onExit();
  };

  // ---- tutorial mikro ----
  const tutSteps = level.tutorial;
  const closeTut = () => {
    markSeen(`mask:tut:${level.n}`);
    setTut(null);
  };

  // Papan kekunci: Escape = tutup dialog / keluar; Ctrl+Z / Ctrl+Y = undur / buat semula
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement) return;
      if (e.key === 'Escape') {
        e.stopPropagation();
        if (saveDlg) setSaveDlg(null);
        else if (confirm) setConfirm(null);
        else if (tut !== null) closeTut();
        else if (selItem) setSelItem(null);
        else if (phase === 'gallery') setPhase(galleryFrom);
        else requestExit();
      } else if (phase === 'edit' && (e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'z') {
        e.preventDefault();
        if (e.shiftKey) redo();
        else undo();
      } else if (phase === 'edit' && (e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'y') {
        e.preventDefault();
        redo();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  });

  // ---- pentas topeng ----
  const stageWrapRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [stage, setStage] = useState({ w: 0, h: 0 });
  useLayoutEffect(() => {
    const el = stageWrapRef.current;
    if (!el) return undefined;
    const measure = () => {
      const k = Math.max(0.1, Math.min((el.clientWidth - 8) / MASK.w, (el.clientHeight - 8) / MASK.h));
      setStage({ w: Math.floor(MASK.w * k), h: Math.floor(MASK.h * k) });
    };
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => ro.disconnect();
  }, [phase]);
  const dpr = typeof window !== 'undefined' ? Math.min(window.devicePixelRatio || 1, 2.5) : 1;
  useEffect(() => {
    let raf = 0;
    const draw = (now: number) => {
      raf = requestAnimationFrame(draw);
      const cv = canvasRef.current;
      if (!cv || !cv.width) return;
      const c = cv.getContext('2d')!;
      c.setTransform(cv.width / MASK.w, 0, 0, cv.width / MASK.w, 0, 0);
      c.clearRect(0, 0, MASK.w, MASK.h);
      drawMask(c, histRef.current.current, {
        selectedRegion: tool === 'colors' && phase === 'edit' ? (hint?.region ?? null) : null,
        liveStroke: liveRef.current?.st ?? null,
        hintAnchor: hint?.anchor ?? null,
        time: now / 1000,
      });
    };
    raf = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(raf);
  }, [tool, hint, phase]);

  // ---- cat pada topeng: Baldi Cat (ketik = isi kawasan) / Berus (lukis sendiri) ----
  const toMask = (e: React.PointerEvent<HTMLDivElement>) => {
    const r = e.currentTarget.getBoundingClientRect();
    return { x: ((e.clientX - r.left) / r.width) * MASK.w, y: ((e.clientY - r.top) / r.height) * MASK.h };
  };
  const onStageDown = (e: React.PointerEvent<HTMLDivElement>) => {
    if (e.target !== e.currentTarget && !(e.target instanceof HTMLCanvasElement)) return;
    if (phase !== 'edit' || tool !== 'colors' || !e.isPrimary) return;
    if (!paintColor) return showToast(t('mask.tip.pickColor'));
    if (!paintMode) return showToast(t('mask.tip.pickTool'));
    const { x, y } = toMask(e);
    const reg = regionAt(design.templateId, x, y);
    if (!reg) return; // luar topeng / pada wajah
    if (paintMode === 'bucket') return apply(recolor(histRef.current.current, reg, paintColor));
    if (strokeBudgetLeft(histRef.current.current) < 40) return showToast(t('mask.brushFull'));
    e.currentTarget.setPointerCapture(e.pointerId);
    liveRef.current = { id: e.pointerId, st: { c: paintColor, r: reg, w: BRUSH_SIZES[brushSize], p: [Math.round(x), Math.round(y)] } };
  };
  const onStageMove = (e: React.PointerEvent<HTMLDivElement>) => {
    const live = liveRef.current;
    if (!live || live.id !== e.pointerId) return;
    const p = live.st.p;
    const evs = typeof e.nativeEvent.getCoalescedEvents === 'function' ? e.nativeEvent.getCoalescedEvents() : [];
    const r = e.currentTarget.getBoundingClientRect();
    for (const ev of evs.length ? evs : [e.nativeEvent]) {
      const x = Math.round(((ev.clientX - r.left) / r.width) * MASK.w);
      const y = Math.round(((ev.clientY - r.top) / r.height) * MASK.h);
      if (Math.hypot(x - p[p.length - 2], y - p[p.length - 1]) >= 4 && p.length < 1200 && p.length / 2 < strokeBudgetLeft(histRef.current.current)) p.push(x, y);
    }
  };
  const onStageUp = (e: React.PointerEvent<HTMLDivElement>) => {
    const live = liveRef.current;
    if (!live || live.id !== e.pointerId) return;
    liveRef.current = null;
    if (e.type !== 'pointercancel') apply(addStroke(histRef.current.current, live.st));
  };

  // seret pelekat ke topeng (alternatif kepada ketik-pilih → ketik-titik)
  const dragRef = useRef<{ item: string; sx: number; sy: number; moved: boolean; id: number } | null>(null);
  const suppressClick = useRef(false);
  const onItemDown = (item: string) => (e: React.PointerEvent<HTMLButtonElement>) => {
    if (!e.isPrimary) return;
    dragRef.current = { item, sx: e.clientX, sy: e.clientY, moved: false, id: e.pointerId };
    e.currentTarget.setPointerCapture(e.pointerId);
  };
  const onItemMove = (e: React.PointerEvent<HTMLButtonElement>) => {
    const d = dragRef.current;
    if (!d || d.id !== e.pointerId) return;
    if (!d.moved && Math.hypot(e.clientX - d.sx, e.clientY - d.sy) > 10) d.moved = true;
    if (d.moved) {
      e.preventDefault();
      setDrag({ item: d.item, x: e.clientX, y: e.clientY });
    }
  };
  const onItemUp = (e: React.PointerEvent<HTMLButtonElement>) => {
    const d = dragRef.current;
    dragRef.current = null;
    setDrag(null);
    if (!d || d.id !== e.pointerId) return;
    if (!d.moved) return; // ketik biasa dikendalikan oleh onClick
    suppressClick.current = true;
    timers.current.push(setTimeout(() => (suppressClick.current = false), 0));
    // lepas atas topeng → titik sah terdekat (toleransi)
    const el = canvasRef.current?.parentElement;
    if (!el) return;
    const r = el.getBoundingClientRect();
    const mx = ((e.clientX - r.left) / r.width) * MASK.w;
    const my = ((e.clientY - r.top) / r.height) * MASK.h;
    const kind = itemById(d.item)?.kind;
    const near = ANCHORS.filter((a) => a.accepts === kind)
      .map((a) => ({ a, dist: Math.hypot(a.x - mx, a.y - my) }))
      .sort((p, q) => p.dist - q.dist)[0];
    if (near && near.dist < 80) placeAt(near.a.id, d.item);
  };

  // kail ujian (pembangunan sahaja)
  useEffect(() => {
    if (import.meta.env.DEV) (window as unknown as { __mask: unknown }).__mask = { design, level: level.n, phase, mode, fails, hints };
  });
  const s = { design, checks };
  const title = `${t('spot.level')} ${level.n} · ${t(level.titleKey)}`;
  const liveChecks = useMemo(() => validate(design, level), [design, level]);
  const selKind = selItem ? itemById(selItem)?.kind : null;
  const showAnchors = phase === 'edit' && (selKind === 'symbol' || selKind === 'pattern');
  const removable = phase === 'edit' && (tool === 'symbols' || tool === 'patterns') && !selItem;
  void s;

  // ---------- paparan ----------
  return (
    <div className="spot-root mask-root" role="dialog" aria-modal="true" aria-label={t('mask.title')}>
      <header className="spot-top">
        <button type="button" className="spot-icon-btn" onClick={() => (phase === 'gallery' ? setPhase(galleryFrom) : requestExit())} aria-label={t('spot.backDojo')}>
          {phase === 'gallery' ? <X aria-hidden="true" /> : <DoorOpen aria-hidden="true" />}
        </button>
        <div className="spot-title">
          <b>{t('mask.title')}</b>
          <span>{phase === 'gallery' ? t('mask.galleryTitle') : title}</span>
        </div>
        {phase === 'edit' && <span className={`mask-mode ${mode}`}>{t(mode === 'mission' ? 'mask.mode.mission' : 'mask.mode.free')}</span>}
        {phase === 'edit' && mode === 'mission' && (
          <button type="button" className="spot-hint-btn" onClick={useHint}>
            <Lightbulb aria-hidden="true" />
            <span>{t('spot.hint')}</span>
          </button>
        )}
        {phase !== 'gallery' && (
          <button type="button" className="spot-icon-btn" onClick={() => openGallery(phase)} aria-label={t('mask.gallery')}>
            <Images aria-hidden="true" />
          </button>
        )}
      </header>

      {phase === 'edit' && (
        <div className="mask-editor">
          {/* kad misi */}
          <section className="mask-mission" aria-label={t('mask.guru')}>
            <GuruPortrait />
            <div className="mask-mission-main">
              <b>{editingEntry ? fmt(t('mask.editing'), { title: editingEntry.title }) : t(level.briefKey)}</b>
              {!editingEntry && (
                <ul className="mask-checklist">
                  {liveChecks.map((c, i) => {
                    const shown = checks?.[i];
                    const state = mode === 'free' ? 'ok' : shown ? (shown.ok ? 'ok' : 'bad') : 'todo';
                    return (
                      <li key={i} className={state}>
                        <i aria-hidden="true">{state === 'ok' ? '✓' : state === 'bad' ? '!' : '○'}</i>
                        <span>{tp(c.label)}</span>
                        {state === 'bad' && shown?.fix && <em>{tp(shown.fix)}</em>}
                      </li>
                    );
                  })}
                </ul>
              )}
            </div>
          </section>

          {/* kotak alat */}
          <section className="mask-tools" aria-label="Alat">
            <div className="mask-tabs" role="tablist">
              {TOOLS.map((tl) => (
                <button
                  key={tl.id}
                  type="button"
                  role="tab"
                  aria-selected={tool === tl.id}
                  className={`mask-tab ${tool === tl.id ? 'on' : ''} ${hint?.tool === tl.id && tool !== tl.id ? 'hinted' : ''}`}
                  disabled={!allowed(tl.id)}
                  onClick={() => {
                    setTool(tl.id);
                    setSelItem(null);
                  }}
                >
                  <span aria-hidden="true">{allowed(tl.id) ? tl.icon : <Lock />}</span>
                  {t(`mask.tool.${tl.id}`)}
                </button>
              ))}
            </div>
            <div className="mask-panel">
              {tool === 'colors' && (
                <>
                  <p className="mask-tip" aria-live="polite">
                    {!paintColor
                      ? t('mask.tip.pickColor')
                      : !paintMode
                        ? t('mask.tip.pickTool')
                        : fmt(t(paintMode === 'brush' ? 'mask.tip.brush' : design.templateId === 'twotone' ? 'mask.tip.bucket2' : 'mask.tip.bucket'), { color: t(colorById(paintColor)!.nameKey) })}
                  </p>
                  <div className="mask-swatches">
                    {COLORS.map((col) => (
                      <button key={col.id} type="button" className={`mask-swatch ${paintColor === col.id ? 'on' : ''}`} onClick={() => (setPaintColor(col.id), playSound('tap', sound))} aria-pressed={paintColor === col.id}>
                        <i style={{ background: col.hex }} aria-hidden="true">
                          {paintColor === col.id && <Check />}
                        </i>
                        <span>{t(col.nameKey)}</span>
                      </button>
                    ))}
                  </div>
                  <div className={`mask-paint-tools ${paintColor && !paintMode ? 'ask' : ''}`} role="radiogroup" aria-label={t('mask.paintTool')}>
                    {(['brush', 'bucket'] as const).map((m) => (
                      <button key={m} type="button" role="radio" aria-checked={paintMode === m} className={`mask-paint ${paintMode === m ? 'on' : ''}`} onClick={() => setPaintMode(m)}>
                        <span className="mask-paint-ico" style={paintColor ? { color: colorById(paintColor)!.hex } : undefined} aria-hidden="true">
                          {m === 'brush' ? <Brush /> : <PaintBucket />}
                        </span>
                        <b>{t(m === 'brush' ? 'mask.brush' : 'mask.bucket')}</b>
                        <small>{t(m === 'brush' ? 'mask.brushDesc' : 'mask.bucketDesc')}</small>
                      </button>
                    ))}
                  </div>
                  {paintMode === 'brush' && (
                    <div className="mask-regions" role="radiogroup" aria-label={t('mask.brushSize')}>
                      {(Object.keys(BRUSH_SIZES) as (keyof typeof BRUSH_SIZES)[]).map((k) => (
                        <button key={k} type="button" role="radio" aria-checked={brushSize === k} className={`mask-chip ${brushSize === k ? 'on' : ''}`} onClick={() => setBrushSize(k)}>
                          <i className="mask-dot" style={{ width: BRUSH_SIZES[k] / 2, height: BRUSH_SIZES[k] / 2 }} aria-hidden="true" /> {t(`mask.size.${k}`)}
                        </button>
                      ))}
                    </div>
                  )}
                </>
              )}
              {(tool === 'symbols' || tool === 'patterns') && (
                <>
                  <p className="mask-tip">{selItem ? fmt(t('mask.pickAnchor'), { item: t(itemById(selItem)!.nameKey) }) : t('mask.dragTip')}</p>
                  <div className="mask-items">
                    {itemsFor(tool === 'symbols' ? 'symbol' : 'pattern').map((it) => (
                      <button
                        key={it.id}
                        type="button"
                        className={`mask-item ${selItem === it.id ? 'on' : ''} ${hint?.item === it.id ? 'hinted' : ''}`}
                        aria-pressed={selItem === it.id}
                        onPointerDown={onItemDown(it.id)}
                        onPointerMove={onItemMove}
                        onPointerUp={onItemUp}
                        onPointerCancel={() => ((dragRef.current = null), setDrag(null))}
                        onClick={() => !suppressClick.current && setSelItem((x) => (x === it.id ? null : it.id))}
                      >
                        <img src={itemIcon(it.id)} alt="" draggable={false} />
                        <span>{t(it.nameKey)}</span>
                      </button>
                    ))}
                  </div>
                </>
              )}
              {tool === 'accessories' && (
                <div className="mask-items">
                  <button type="button" className={`mask-item ${!design.headband ? 'on' : ''}`} onClick={() => apply(setHeadband(design, null))}>
                    <span className="mask-none" aria-hidden="true">
                      <X />
                    </span>
                    <span>{t('mask.none')}</span>
                  </button>
                  {itemsFor('accessory').map((it) => (
                    <button key={it.id} type="button" className={`mask-item ${design.headband === it.id ? 'on' : ''}`} onClick={() => apply(setHeadband(design, it.id))} aria-pressed={design.headband === it.id}>
                      <img src={itemIcon(it.id)} alt="" />
                      <span>{t(it.nameKey)}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </section>

          {/* pratonton topeng */}
          <div className="mask-stage-wrap" ref={stageWrapRef}>
            <div
              className={`mask-stage ${tool === 'colors' && paintColor && paintMode ? `paint-${paintMode}` : ''}`}
              style={{ width: stage.w, height: stage.h }}
              onPointerDown={onStageDown}
              onPointerMove={onStageMove}
              onPointerUp={onStageUp}
              onPointerCancel={onStageUp}
            >
              <canvas ref={canvasRef} width={Math.max(1, Math.round(stage.w * dpr))} height={Math.max(1, Math.round(stage.h * dpr))} role="img" aria-label={t('mask.stageLabel')} />
              {showAnchors &&
                ANCHORS.filter((a) => a.accepts === selKind).map((a) => (
                  <button
                    key={a.id}
                    type="button"
                    className={`mask-anchor ${design.items[a.id] ? 'filled' : ''} ${hint?.anchor === a.id ? 'hinted' : ''}`}
                    style={{ left: `${(a.x / MASK.w) * 100}%`, top: `${(a.y / MASK.h) * 100}%` }}
                    onClick={() => placeAt(a.id, selItem!)}
                    aria-label={`${t(itemById(selItem!)!.nameKey)} → ${t(a.nameKey)}`}
                  />
                ))}
              {removable &&
                ANCHORS.filter((a) => design.items[a.id] && a.accepts === (tool === 'symbols' ? 'symbol' : 'pattern')).map((a) => (
                  <button
                    key={a.id}
                    type="button"
                    className="mask-remove"
                    style={{ left: `${(a.x / MASK.w) * 100 + 5}%`, top: `${(a.y / MASK.h) * 100 - 5}%` }}
                    onClick={() => apply(removeItem(design, a.id), t('mask.removed'))}
                    aria-label={`${t('mask.remove')} ${t(itemById(design.items[a.id])!.nameKey)} (${t(a.nameKey)})`}
                  >
                    <X aria-hidden="true" />
                  </button>
                ))}
              {toast && (
                <div className={`spot-toast ${toast.good ? 'good' : ''}`} key={toast.id} aria-live="polite">
                  {toast.text}
                </div>
              )}
            </div>
          </div>

          {/* tindakan */}
          <section className="mask-actions">
            <button type="button" className="mask-act" onClick={undo} disabled={!histRef.current.canUndo}>
              <Undo2 aria-hidden="true" />
              <span>{t('mask.undo')}</span>
            </button>
            <button type="button" className="mask-act" onClick={redo} disabled={!histRef.current.canRedo}>
              <Redo2 aria-hidden="true" />
              <span>{t('mask.redo')}</span>
            </button>
            {mode === 'free' && passedSnap ? (
              <button type="button" className="mask-act" onClick={() => apply(cloneDesign(passedSnap))} disabled={sameDesign(design, passedSnap)}>
                <RotateCcw aria-hidden="true" />
                <span>{t('mask.restore')}</span>
              </button>
            ) : (
              <button type="button" className="mask-act" onClick={() => setConfirm({ kind: 'reset' })}>
                <RotateCcw aria-hidden="true" />
                <span>{t('mask.reset')}</span>
              </button>
            )}
          </section>

          <div className="mask-bottom">
            <button type="button" className="mall-btn mask-check" onClick={runCheck} disabled={mode !== 'mission'}>
              <Check aria-hidden="true" /> {mode === 'mission' ? t('mask.check') : t('mask.allDone')}
            </button>
            <button type="button" className="mall-btn go mask-save" onClick={openSave} disabled={mode !== 'free'}>
              <Save aria-hidden="true" /> {t('mask.saveGallery')}
            </button>
          </div>
        </div>
      )}

      {drag && (
        <div className="mask-ghost" style={{ left: drag.x, top: drag.y }} aria-hidden="true">
          <img src={itemIcon(drag.item)} alt="" />
        </div>
      )}

      {phase === 'intro' && (
        <div className="spot-layer">
          <section className="spot-panel" aria-labelledby="mask-intro-h">
            <header className="spot-panel-head">
              <span aria-hidden="true">🎭</span>
              <h2 id="mask-intro-h">{title}</h2>
            </header>
            <div className="spot-panel-body">
              <div className="mask-intro">
                <GuruPortrait />
                <p>{t(level.briefKey)}</p>
              </div>
              <ul className="mask-checklist intro">
                {validate(emptyDesign(level.templateId), level).map((c, i) => (
                  <li key={i} className="todo">
                    <i aria-hidden="true">○</i>
                    <span>{tp(c.label)}</span>
                  </li>
                ))}
              </ul>
              <div className="mall-dialog-actions">
                <button type="button" className="mall-btn light" onClick={() => openGallery('intro')}>
                  <Images aria-hidden="true" /> {t('mask.gallery')}
                </button>
                <button type="button" className="mall-btn go" onClick={() => beginLevel(level)} autoFocus>
                  <Play aria-hidden="true" /> {t('spot.start')}
                </button>
              </div>
            </div>
          </section>
        </div>
      )}

      {tut !== null && phase === 'edit' && tutSteps[tut] && (
        <div className="spot-layer">
          <section className="spot-panel small" aria-labelledby="mask-tut-h">
            <header className="spot-panel-head">
              <span aria-hidden="true">{tutSteps[tut].icon}</span>
              <h2 id="mask-tut-h">
                {t('mask.tutTitle')} ({tut + 1}/{tutSteps.length})
              </h2>
            </header>
            <div className="spot-panel-body">
              <div className="mask-tut-pic" aria-hidden="true">
                {tutSteps[tut].icon}
              </div>
              <p className="mask-text">{t(tutSteps[tut].key)}</p>
              <div className="mall-dialog-actions">
                <button type="button" className="mall-btn light" onClick={closeTut}>
                  {t('mask.skip')}
                </button>
                <button type="button" className="mall-btn go" onClick={() => (tut + 1 < tutSteps.length ? setTut(tut + 1) : closeTut())} autoFocus>
                  {tut + 1 < tutSteps.length ? t('mask.next') : t('mask.start')} <ChevronRight aria-hidden="true" />
                </button>
              </div>
            </div>
          </section>
        </div>
      )}

      {confirm && (
        <div className="spot-layer">
          <section className="spot-panel small" aria-labelledby="mask-confirm-h">
            <header className="spot-panel-head">
              <span aria-hidden="true">{confirm.kind === 'delete' ? '🗑️' : confirm.kind === 'reset' ? '↺' : '🚪'}</span>
              <h2 id="mask-confirm-h">{t(confirm.kind === 'delete' ? 'mask.confirmDelete' : confirm.kind === 'reset' ? 'mask.confirmReset' : 'mask.confirmLeave')}</h2>
            </header>
            <div className="spot-panel-body spot-stack">
              <p className="mask-text">
                {confirm.kind === 'delete' ? fmt(t('mask.confirmDeleteText'), { title: confirm.entry.title }) : t(confirm.kind === 'reset' ? 'mask.confirmResetText' : 'mask.confirmLeaveText')}
              </p>
              <button type="button" className="mall-btn light" onClick={() => setConfirm(null)} autoFocus>
                {confirm.kind === 'leave' ? t('mask.stay') : t('mask.cancel')}
              </button>
              <button
                type="button"
                className="mall-btn exit"
                onClick={() => {
                  if (confirm.kind === 'leave') return onExit();
                  if (confirm.kind === 'reset') apply(emptyDesign(level.templateId));
                  if (confirm.kind === 'delete') {
                    if (deleteMask(confirm.entry.id)) setGallery(listMasks());
                    else showToast(t('mask.saveError'));
                  }
                  setConfirm(null);
                }}
              >
                {t(confirm.kind === 'delete' ? 'mask.yesDelete' : confirm.kind === 'reset' ? 'mask.yesReset' : 'mask.exit')}
              </button>
            </div>
          </section>
        </div>
      )}

      {saveDlg && (
        <div className="spot-layer">
          <section className="spot-panel small" aria-labelledby="mask-save-h">
            <header className="spot-panel-head">
              <span aria-hidden="true">🖼️</span>
              <h2 id="mask-save-h">{t('mask.saveTitle')}</h2>
            </header>
            <div className="spot-panel-body spot-stack">
              <img className="mask-save-thumb" src={renderMaskThumb(design, 160)} alt="" />
              <label className="mask-field">
                <span>{t('mask.titleLabel')}</span>
                <input value={saveDlg.title} maxLength={24} onChange={(e) => setSaveDlg({ ...saveDlg, title: e.target.value, status: 'idle' })} onKeyDown={(e) => e.key === 'Enter' && doSave()} autoFocus />
              </label>
              {saveDlg.status === 'error' && <p className="mask-error" role="alert">{t('mask.saveError')}</p>}
              <button type="button" className="mall-btn go" onClick={doSave} disabled={saveDlg.status === 'saving'}>
                <Save aria-hidden="true" /> {saveDlg.status === 'saving' ? t('mask.saving') : saveDlg.status === 'error' ? t('mask.retry') : t('mask.save')}
              </button>
              <button type="button" className="mall-btn light" onClick={() => setSaveDlg(null)}>
                {t('mask.cancel')}
              </button>
            </div>
          </section>
        </div>
      )}

      {phase === 'result' && result && (
        <div className="spot-layer">
          <section className="spot-panel" aria-labelledby="mask-result-h">
            <header className="spot-panel-head">
              <span aria-hidden="true">🏆</span>
              <h2 id="mask-result-h">{t('spot.done')}</h2>
            </header>
            <div className="spot-panel-body">
              <p className="spot-result-sub">{title}</p>
              <img className="mask-save-thumb" src={renderMaskThumb(design, 150)} alt="" />
              <div className="spot-stars" aria-label={`${result.stars} / 3`}>
                {[0, 1, 2].map((i) => (
                  <Star key={i} className={i < result.stars ? 'on' : ''} style={{ animationDelay: `${0.1 + i * 0.18}s` }} />
                ))}
              </div>
              <p className="spot-result-best">{fmt(t('mask.checksInfo'), { n: result.fails, h: result.hints })}</p>
              {lastSaved && <p className="spot-result-line">{fmt(t('mask.resultSaved'), { title: lastSaved.title })}</p>}
              <div className="spot-reward">
                <b>{t('spot.reward')}</b>
                {result.reward.granted ? (
                  <span>
                    {result.reward.coins > 0 && (
                      <em>
                        🪙 +{result.reward.coins} {t('spot.coins')}
                      </em>
                    )}
                    {result.reward.xp > 0 && (
                      <em>
                        ⭐ +{result.reward.xp} {t('spot.xp')}
                      </em>
                    )}
                  </span>
                ) : (
                  <small>{t('sushi.noNewReward')}</small>
                )}
              </div>
              {!maskLevel(level.n + 1) && <p className="spot-result-best">{t('spot.lastLevel')}</p>}
              <div className="spot-result-actions">
                {maskLevel(level.n + 1) && (
                  <button
                    type="button"
                    className="mall-btn go"
                    onClick={() => {
                      setLevelN(level.n + 1);
                      setPhase('intro');
                    }}
                    autoFocus
                  >
                    {t('spot.next')} <ChevronRight aria-hidden="true" />
                  </button>
                )}
                <button type="button" className="mall-btn light" onClick={() => openGallery('result')}>
                  <Images aria-hidden="true" /> {t('mask.gallery')}
                </button>
                <button type="button" className="mall-btn light" onClick={() => beginLevel(level)}>
                  <RotateCcw aria-hidden="true" /> {t('spot.retry')}
                </button>
                <button type="button" className="mall-btn light" onClick={onExit}>
                  <DoorOpen aria-hidden="true" /> {t('spot.backDojo')}
                </button>
              </div>
            </div>
          </section>
        </div>
      )}

      {phase === 'gallery' && (
        <main className="mask-gallery">
          {gallery.length === 0 && <p className="mask-gallery-empty">{t('mask.galleryEmpty')}</p>}
          <ul>
            {gallery.map((g) => (
              <li key={g.id} className="mask-card">
                <img src={renderMaskThumb(g, 140)} alt="" />
                {renaming?.id === g.id ? (
                  <form
                    className="mask-rename"
                    onSubmit={(e) => {
                      e.preventDefault();
                      const nt = safeTitle(renaming.title, g.title);
                      if (renameMask(g.id, nt)) {
                        setGallery(listMasks());
                        setRenaming(null);
                      } else showToast(t('mask.saveError'));
                    }}
                  >
                    <input value={renaming.title} maxLength={24} onChange={(e) => setRenaming({ id: g.id, title: e.target.value })} aria-label={t('mask.titleLabel')} autoFocus />
                    <button type="submit" className="mask-act small">
                      <Check aria-hidden="true" />
                    </button>
                  </form>
                ) : (
                  <b>{g.title}</b>
                )}
                <small>{t(MASK_LEVELS.find((l) => l.id === g.levelId)?.titleKey ?? 'mask.title')}</small>
                <div className="mask-card-actions">
                  <button type="button" className="mask-act small" onClick={() => reopen(g)} aria-label={`${t('mask.open')}: ${g.title}`}>
                    <Pencil aria-hidden="true" />
                    <span>{t('mask.open')}</span>
                  </button>
                  <button type="button" className="mask-act small" onClick={() => setRenaming({ id: g.id, title: g.title })} aria-label={`${t('mask.rename')}: ${g.title}`}>
                    <span aria-hidden="true">✏️</span>
                    <span>{t('mask.rename')}</span>
                  </button>
                  <button type="button" className="mask-act small danger" onClick={() => setConfirm({ kind: 'delete', entry: g })} aria-label={`${t('mask.delete')}: ${g.title}`}>
                    <Trash2 aria-hidden="true" />
                    <span>{t('mask.delete')}</span>
                  </button>
                </div>
              </li>
            ))}
          </ul>
          {toast && (
            <div className={`spot-toast ${toast.good ? 'good' : ''}`} key={toast.id} aria-live="polite">
              {toast.text}
            </div>
          )}
        </main>
      )}
    </div>
  );
}

/** Potret Guru Seni Shinobi (sprite NPC sedia ada, warna gi ditukar). */
function GuruPortrait() {
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    if (!guruDef?.sprite) return undefined;
    const sheet = loadSheet(guruDef.sprite);
    let raf = 0;
    const paint = () => {
      const f = idleFrame(sheet);
      const cv = ref.current;
      if (!f || !cv) {
        if (!sheet.failed) raf = requestAnimationFrame(paint);
        return;
      }
      const c = cv.getContext('2d')!;
      c.clearRect(0, 0, cv.width, cv.height);
      const cropH = f.cv.height * 0.62;
      const k = Math.min(cv.width / f.cv.width, cv.height / cropH) * 1.05;
      c.drawImage(f.cv, 0, 0, f.cv.width, cropH, (cv.width - f.cv.width * k) / 2, cv.height - cropH * k + 4, f.cv.width * k, cropH * k);
    };
    paint();
    return () => cancelAnimationFrame(raf);
  }, []);
  return <canvas ref={ref} className="mask-guru" width={128} height={128} aria-hidden="true" />;
}
