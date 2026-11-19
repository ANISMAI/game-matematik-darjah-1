// Shuriken Master (Arena Latihan Ninja) — seret untuk sasarkan, lepaskan untuk baling.
// Logik dalam session.ts / physics.ts (tulen & deterministik). Komponen ini: input, lukisan & panel.
import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';
import { ChevronRight, CircleHelp, DoorOpen, LayoutGrid, Lightbulb, Pause, Play, RotateCcw, Star } from 'lucide-react';
import { PLAYER_SPRITE } from '../mall/config.ts';
import { drawSprite, loadSheet } from '../mall/sprites.ts';
import { hasSeen, markSeen, recordAttempt } from '../mall/save.ts';
import { t } from '../mall/strings.ts';
import { playSound } from '../../lib/sound.js';
import { SHURIKEN_GAME_ID, SHURIKEN_LEVELS, shurikenLevel } from './levels.ts';
import type { ShurikenLevel } from './levels.ts';
import { ARENA, HAND, depthScale, targetPos } from './physics.ts';
import type { Pt } from './physics.ts';
import { ShurikenSession } from './session.ts';
import { saveShurikenResult } from './results.ts';
import type { ShurikenResult } from './results.ts';
import { drawAim, drawArenaBackground, drawRail, drawShuriken, drawSparks, drawTarget } from './art.ts';
import '../spot/spot.css';
import './shuriken.css';

type Phase = 'intro' | 'play' | 'result';
const fmt = (s: string, v: Record<string, string | number>) => s.replace(/\{(\w+)\}/g, (_, k) => String(v[k] ?? ''));
/**
 * Seretan minimum (px CSS) sebelum bidikan aktif. 0 = tekan sahaja pun boleh: bulatan sasaran keluar serta-merta
 * di tempat jari ditekan & kekal selagi ditekan; lepas = baling. (Naikkan, contoh 14, jika mahu wajib seret.)
 * Tekanan dekat ninja (bawah garisan baling) tetap tidak membaling — lihat MIN_AIM_RISE dalam physics.ts.
 */
const DRAG_THRESHOLD = 0;
const TUTORIAL_KEY = 'shuriken:tutorial';
const NINJA_H = 190;

/** Latar arena disimpan dalam kanvas; dibina semula hanya bila lebar logik berubah. */
let bgCache: { key: string; cv: HTMLCanvasElement } | null = null;
function buildBg(lw: number, extra: number): HTMLCanvasElement {
  const key = `${Math.round(lw)}:${extra}`;
  if (bgCache?.key === key) return bgCache.cv;
  const cv = document.createElement('canvas');
  cv.width = Math.round(lw * 2);
  cv.height = ARENA.h * 2;
  const c = cv.getContext('2d')!;
  c.scale(2, 2);
  c.translate(extra, 0);
  drawArenaBackground(c, extra);
  bgCache = { key, cv };
  return cv;
}

export default function ShurikenGame({ startLevel, sound, onExit, onLevelSelect }: { startLevel: number; sound: boolean; onExit: () => void; onLevelSelect?: () => void }) {
  const [levelN, setLevelN] = useState(startLevel);
  const level: ShurikenLevel = shurikenLevel(levelN) ?? SHURIKEN_LEVELS[0];
  const [phase, setPhase] = useState<Phase>('intro');
  const [paused, setPaused] = useState(false);
  const [confirmLeave, setConfirmLeave] = useState(false);
  const [tutorial, setTutorial] = useState(false);
  const [result, setResult] = useState<ShurikenResult | null>(null);
  const [, setVersion] = useState(0);
  const [toast, setToast] = useState<{ id: number; text: string; good?: boolean } | null>(null);
  // w/h = saiz paparan (px CSS); lw = lebar logik kanvas (>= ARENA.w); extra = lanjutan latar setiap sisi (unit)
  const [box, setBox] = useState({ w: 0, h: 0, lw: ARENA.w, extra: 0 });
  const boxRef = useRef(box);
  boxRef.current = box;

  const sessionRef = useRef<ShurikenSession>(null as unknown as ShurikenSession);
  if (!sessionRef.current) sessionRef.current = new ShurikenSession(level);
  const wrapRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const live = useRef({ phase, paused, tutorial, sound, fxId: 0, savedFor: null as ShurikenSession | null, throwAnim: 0 });
  live.current.phase = phase;
  live.current.paused = paused || confirmLeave;
  live.current.tutorial = tutorial;
  live.current.sound = sound;
  // gerak isyarat semasa: satu balingan sahaja setiap gerak isyarat
  const gesture = useRef<{ id: number; sx: number; sy: number; aiming: boolean; aim: Pt | null; inside: boolean } | null>(null);
  const fx = useRef<{ sparks: { x: number; y: number; t0: number }[]; pops: { x: number; y: number; t0: number; text: string }[] }>({ sparks: [], pops: [] });
  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);
  useEffect(() => () => timers.current.forEach(clearTimeout), []);
  const sheet = useRef(loadSheet({ src: PLAYER_SPRITE.src, height: NINJA_H })).current;

  const showToast = useCallback((text: string, good = false) => {
    const id = ++live.current.fxId;
    setToast({ id, text, good });
    timers.current.push(setTimeout(() => setToast((x) => (x?.id === id ? null : x)), 1400));
  }, []);

  const newSession = useCallback((lv: ShurikenLevel) => {
    sessionRef.current = new ShurikenSession(lv);
    gesture.current = null;
    fx.current = { sparks: [], pops: [] };
    setResult(null);
    setToast(null);
    setPaused(false);
    setConfirmLeave(false);
    setVersion((v) => v + 1);
  }, []);

  // ---- saiz arena: tinggi tetap 640 unit; lebar memanjang ikut skrin (kawasan main 480 unit di tengah) ----
  useLayoutEffect(() => {
    const el = wrapRef.current;
    if (!el) return undefined;
    const measure = () => {
      // ruang kandungan sebenar: tolak padding bekas + sempadan bingkai arena (4px × 2) + bayang
      const cs = getComputedStyle(el);
      const aw = el.clientWidth - parseFloat(cs.paddingLeft) - parseFloat(cs.paddingRight) - 8;
      const ah = el.clientHeight - parseFloat(cs.paddingTop) - parseFloat(cs.paddingBottom) - 16;
      const k = Math.max(0.1, Math.min(aw / ARENA.w, ah / ARENA.h));
      const lw = Math.min(aw / k, ARENA.w * 2.4);
      setBox({ w: Math.floor(lw * k), h: Math.floor(ARENA.h * k), lw, extra: Math.round((lw - ARENA.w) / 2) });
    };
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  // ---- gelung animasi ----
  useEffect(() => {
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    // latar dibina semula hanya bila lebar logik berubah (buildBg)
    if (import.meta.env.DEV) (window as unknown as { __shuriken: unknown }).__shuriken = { get session() { return sessionRef.current; } };
    let raf = 0;
    let last = performance.now();
    let lastVersion = -1;
    let clock = 0; // masa paparan (untuk animasi kesan)
    const frame = (now: number) => {
      raf = requestAnimationFrame(frame);
      const dt = Math.min(0.1, (now - last) / 1000);
      last = now;
      const L = live.current;
      const s = sessionRef.current;
      const playing = L.phase === 'play' && !L.paused && !L.tutorial;
      if (playing) {
        s.tick(dt);
        clock += dt;
        L.throwAnim = Math.max(0, L.throwAnim - dt);
      }
      for (const e of s.drain()) {
        if (e.type === 'throw') {
          playSound('tap', L.sound);
          L.throwAnim = 0.28;
        } else if (e.type === 'hit') {
          playSound('correct', L.sound);
          fx.current.sparks.push({ x: e.point.x, y: e.point.y, t0: clock });
          fx.current.pops.push({ x: e.point.x, y: e.point.y - 20, t0: clock, text: `+${e.points}` });
          showToast(t(e.ring === 'bull' ? 'shu.bull' : e.ring === 'inner' ? 'shu.inner' : 'shu.hit'), true);
        } else if (e.type === 'wrong') {
          playSound('wrong', L.sound);
          showToast(t('shu.wrong'));
        } else if (e.type === 'miss') {
          playSound('wrong', L.sound);
          showToast(t('shu.miss'));
        } else if (e.type === 'levelDone' && L.savedFor !== s) {
          L.savedFor = s; // simpan sekali sahaja setiap sesi
          playSound('done', L.sound);
          setResult(saveShurikenResult(s.level, s.hits, s.throws, s.hintsUsed, s.score));
          setPhase('result');
        }
      }
      if (s.version !== lastVersion) {
        lastVersion = s.version;
        setVersion(s.version);
      }
      draw(clock, reduced);
    };

    const draw = (clock: number, reduced: boolean) => {
      const cv = canvasRef.current;
      if (!cv || !cv.width) return;
      const c = cv.getContext('2d')!;
      const s = sessionRef.current;
      const { lw, extra } = boxRef.current;
      const k = cv.height / ARENA.h;
      c.setTransform(k, 0, 0, k, 0, 0);
      c.clearRect(0, 0, lw, ARENA.h);
      c.drawImage(buildBg(lw, extra), 0, 0, lw, ARENA.h);
      // kandungan permainan dalam koordinat ruang main (480 unit) di tengah
      c.setTransform(k, 0, 0, k, extra * k, 0);
      const g = gesture.current;
      const pv = g?.aiming && g.aim && g.inside && s.canThrow ? s.preview(g.aim) : null;
      // sasaran: jauh (atas) dahulu
      const order = [...s.level.targets].sort((a, b) => a.y - b.y);
      for (const tg of order) drawRail(c, tg); // rel di lantai dahulu (di bawah semua papan)
      for (const tg of order) {
        const p = targetPos(tg, s.time);
        const downAt = s.down.has(tg.id) ? s.stuck.find((q) => q.targetId === tg.id) : null;
        const w0 = s.wobble.get(tg.id);
        drawTarget(c, tg, p, {
          down: downAt ? 0.3 : null,
          wobble: w0 !== undefined ? s.time - w0 : null,
          aimed: pv?.hit.target?.id === tg.id,
          hint: s.hintTarget === tg.id ? (s.hintT ?? 0) : null,
          valid: s.isValid(tg),
        });
        // shuriken yang melekat pada papan ini
        // shuriken melekat ikut papan yang terbalik ke belakang (pangsi di tepi bawah, skala menegak 0.28)
        for (const st of s.stuck) if (st.targetId === tg.id) drawShuriken(c, p.x + st.dx, p.y + tg.r + (st.dy - tg.r) * 0.28, 11 * depthScale(p.y), st.rot);
      }
      // petunjuk: garisan ke sasaran
      if (s.hintTarget && s.hintT !== null) {
        const tg = s.level.targets.find((q) => q.id === s.hintTarget)!;
        const p = targetPos(tg, s.time);
        c.save();
        c.setLineDash([6, 8]);
        c.strokeStyle = 'rgba(255,210,77,.95)';
        c.lineWidth = 4;
        c.beginPath();
        c.moveTo(HAND.x, HAND.y);
        c.lineTo(p.x, p.y);
        c.stroke();
        c.restore();
      }
      // garisan bidikan (sama dengan balingan sebenar)
      if (pv) drawAim(c, pv.hit, reduced ? 0 : clock);
      // ninja (belakang) di bawah
      const lean = live.current.throwAnim > 0 ? Math.sin((live.current.throwAnim / 0.28) * Math.PI) * 8 : 0;
      const walk = live.current.throwAnim > 0 ? (live.current.throwAnim > 0.14 ? 0 : Math.PI) : null;
      drawSprite(c, sheet, 240, ARENA.h + 24 - lean, 'up', walk);
      // shuriken dalam penerbangan
      const fp = s.flightPos();
      if (fp) drawShuriken(c, fp.x, fp.y, 15 * depthScale(fp.y), clock * 22);
      else if (s.canThrow && !s.finished) drawShuriken(c, HAND.x, HAND.y, 13, reduced ? 0 : clock * 2); // shuriken di tangan
      // kesan
      fx.current.sparks = fx.current.sparks.filter((q) => clock - q.t0 < 0.6);
      for (const q of fx.current.sparks) drawSparks(c, q.x, q.y, clock - q.t0);
      fx.current.pops = fx.current.pops.filter((q) => clock - q.t0 < 0.9);
      for (const q of fx.current.pops) {
        const f = (clock - q.t0) / 0.9;
        c.globalAlpha = 1 - f;
        c.font = '900 22px system-ui, sans-serif';
        c.textAlign = 'center';
        c.lineWidth = 5;
        c.strokeStyle = '#26324d';
        c.strokeText(q.text, q.x, q.y - f * 30);
        c.fillStyle = '#ffd24d';
        c.fillText(q.text, q.x, q.y - f * 30);
        c.globalAlpha = 1;
      }
    };

    raf = requestAnimationFrame(frame);
    return () => cancelAnimationFrame(raf); // bersihkan gelung (tiada objek tertinggal)
  }, [showToast, sheet]);

  // ---- input: seret untuk sasarkan, lepaskan untuk baling ----
  const canAim = () => live.current.phase === 'play' && !live.current.paused && !live.current.tutorial;
  // klien -> ruang main (tolak lanjutan kiri)
  const arenaPt = (e: React.PointerEvent) => {
    const r = e.currentTarget.getBoundingClientRect();
    const k = r.height / ARENA.h;
    return { x: (e.clientX - r.left) / k - boxRef.current.extra, y: (e.clientY - r.top) / k };
  };
  const insideCanvas = (p: Pt) => p.x >= -boxRef.current.extra && p.x <= ARENA.w + boxRef.current.extra && p.y >= 0 && p.y <= ARENA.h;
  const onDown = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!e.isPrimary || !canAim() || gesture.current) return;
    e.preventDefault();
    e.currentTarget.setPointerCapture(e.pointerId);
    gesture.current = { id: e.pointerId, sx: e.clientX, sy: e.clientY, aiming: DRAG_THRESHOLD <= 0, aim: arenaPt(e), inside: true };
  };
  const onMove = (e: React.PointerEvent<HTMLDivElement>) => {
    const g = gesture.current;
    if (!g || g.id !== e.pointerId) return;
    if (!canAim()) return void (gesture.current = null);
    if (!g.aiming && Math.hypot(e.clientX - g.sx, e.clientY - g.sy) >= DRAG_THRESHOLD) g.aiming = true;
    const p = arenaPt(e);
    g.aim = p;
    // seret ke luar arena = batal
    g.inside = insideCanvas(p);
  };
  const onUp = (e: React.PointerEvent<HTMLDivElement>) => {
    const g = gesture.current;
    if (!g || g.id !== e.pointerId) return;
    gesture.current = null;
    // kedudukan LEPAS ialah bidikan akhir (lebih tepat daripada gerakan terakhir sebelumnya)
    const p = arenaPt(e);
    const aiming = g.aiming || Math.hypot(e.clientX - g.sx, e.clientY - g.sy) >= DRAG_THRESHOLD;
    const inside = insideCanvas(p);
    if (!canAim() || !aiming || !inside) return; // ketikan tanpa seret / dilepaskan di luar arena = batal
    sessionRef.current.throwAt(p);
  };
  const onCancel = (e: React.PointerEvent<HTMLDivElement>) => {
    if (gesture.current?.id === e.pointerId) gesture.current = null;
  };

  // ---- kawalan ----
  const begin = (lv: ShurikenLevel) => {
    newSession(lv);
    recordAttempt(SHURIKEN_GAME_ID, lv.n);
    setPhase('play');
    if (lv.tutorial && !hasSeen(TUTORIAL_KEY)) setTutorial(true);
  };
  const start = () => {
    playSound('tap', sound);
    begin(level);
  };
  const retry = () => begin(level);
  const nextLevel = () => {
    const nx = shurikenLevel(level.n + 1);
    if (!nx) return;
    setLevelN(nx.n);
    newSession(nx);
    setPhase('intro');
  };
  const closeTutorial = () => {
    markSeen(TUTORIAL_KEY);
    setTutorial(false);
  };

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== 'Escape' || e.repeat) return;
      e.stopPropagation();
      gesture.current = null;
      if (tutorial) closeTutorial();
      else if (confirmLeave) setConfirmLeave(false);
      else if (phase === 'play') setPaused((p) => !p);
      else onExit();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }); // sentiasa guna keadaan terkini

  const s = sessionRef.current;
  const title = `${t('spot.level')} ${level.n} · ${t(level.titleKey)}`;
  const objective = fmt(t(level.validCue ? 'shu.objCue' : 'shu.obj'), { n: level.requiredHits });
  const hintsLeft = level.hints - s.hintsUsed;
  const canPlay = phase === 'play' && !paused && !tutorial;
  const dpr = typeof window !== 'undefined' ? Math.min(window.devicePixelRatio || 1, 2.5) : 1;
  const pct = (v: number, of: number) => `${(v / of) * 100}%`;
  const tutTarget = level.targets[Math.min(1, level.targets.length - 1)];

  return (
    <div className="spot-root shu-root" role="dialog" aria-modal="true" aria-label={t('shu.title')}>
      <header className="spot-top">
        <button type="button" className="spot-icon-btn" onClick={() => (phase === 'play' ? setPaused(true) : onExit())} aria-label={phase === 'play' ? t('spot.pause') : t('spot.backDojo')}>
          {phase === 'play' ? <Pause aria-hidden="true" /> : <DoorOpen aria-hidden="true" />}
        </button>
        <div className="spot-title">
          <b>{title}</b>
          <span>{objective}</span>
        </div>
        <div className="shu-stats" aria-live="polite">
          <span className="shu-score" aria-label={`${t('shu.score')}: ${s.score}`}>
            ⭐ <b>{s.score}</b>
          </span>
          <span className="spot-counter" aria-label={`${t('shu.hits')}: ${s.hits} / ${level.requiredHits}`}>
            <span aria-hidden="true">🎯</span>
            <b>
              {s.hits}/{level.requiredHits}
            </b>
          </span>
          {s.throws > 0 && (
            <small className="shu-acc">
              {t('shu.acc')} {s.accuracy}%
            </small>
          )}
        </div>
        <button type="button" className="spot-icon-btn shu-help" onClick={() => canPlay && setTutorial(true)} disabled={!canPlay} aria-label={t('shu.help')}>
          <CircleHelp aria-hidden="true" />
        </button>
        {level.hints > 0 && (
          <button type="button" className="spot-hint-btn" onClick={() => canPlay && s.useHint() && playSound('tap', sound)} disabled={!canPlay || hintsLeft <= 0}>
            <Lightbulb aria-hidden="true" />
            <span>{t('spot.hint')}</span>
            <i>{hintsLeft}</i>
          </button>
        )}
      </header>

      <div className="shu-wrap" ref={wrapRef}>
        <div
          className="shu-arena"
          style={{ width: box.w, height: box.h }}
          data-extra={box.extra}
          onPointerDown={onDown}
          onPointerMove={onMove}
          onPointerUp={onUp}
          onPointerCancel={onCancel}
          onLostPointerCapture={onCancel}
        >
          <canvas ref={canvasRef} width={Math.max(1, Math.round(box.w * dpr))} height={Math.max(1, Math.round(box.h * dpr))} role="img" aria-label={t('shu.arena')} />
          {canPlay && s.throws === 0 && <p className="shu-prompt">{t('shu.prompt')}</p>}
          {toast && (
            <div className={`spot-toast ${toast.good ? 'good' : ''}`} key={toast.id} aria-live="polite">
              {toast.text}
            </div>
          )}
          {tutorial && (
            <div className="shu-tut" role="dialog" aria-labelledby="shu-tut-h">
              {/* tangan & garisan contoh: dari tangan ninja ke papan sasaran */}
              <svg className="shu-tut-path" viewBox={`${-box.extra} 0 ${box.lw} ${ARENA.h}`} preserveAspectRatio="none" aria-hidden="true">
                <line x1={HAND.x} y1={HAND.y} x2={tutTarget.x} y2={tutTarget.y} />
              </svg>
              <span
                className="shu-tut-hand"
                aria-hidden="true"
                style={{ ['--x0' as string]: pct(HAND.x + box.extra, box.lw), ['--y0' as string]: pct(HAND.y, ARENA.h), ['--x1' as string]: pct(tutTarget.x + box.extra, box.lw), ['--y1' as string]: pct(tutTarget.y, ARENA.h) }}
              >
                👆
              </span>
              <section className="shu-tut-card">
                <h2 id="shu-tut-h">{t('shu.tut.title')}</h2>
                <ol>
                  <li>
                    <span aria-hidden="true">👆</span> {t('shu.tut.1')}
                  </li>
                  <li>
                    <span aria-hidden="true">•••</span> {t('shu.tut.2')}
                  </li>
                  <li>
                    <span aria-hidden="true">✴️</span> {t('shu.tut.3')}
                  </li>
                </ol>
                <button type="button" className="mall-btn go" onClick={closeTutorial} autoFocus>
                  <Play aria-hidden="true" /> {t('shu.tut.go')}
                </button>
              </section>
            </div>
          )}
        </div>
      </div>

      {phase === 'intro' && (
        <div className="spot-layer">
          <section className="spot-panel" aria-labelledby="shu-intro-h">
            <header className="spot-panel-head">
              <span aria-hidden="true">🎯</span>
              <h2 id="shu-intro-h">{title}</h2>
            </header>
            <div className="spot-panel-body">
              <p className="spot-intro-goal">{objective}</p>
              <p className="shu-intro-text">{t(level.introKey)}</p>
              <p className="shu-tip">🎯 {t('shu.centerTip')}</p>
              {level.validCue && (
                <div className="shu-cue">
                  <span className="shu-cue-ok">⭐ {t('shu.cueYes')}</span>
                  <span className="shu-cue-no">● {t('shu.cueNo')}</span>
                </div>
              )}
              <p className="spot-intro-note">{t('shu.noTimer')}</p>
              <div className="mall-dialog-actions">
                <button type="button" className="mall-btn light" onClick={onExit}>
                  <DoorOpen aria-hidden="true" /> {t('spot.backDojo')}
                </button>
                <button type="button" className="mall-btn go" onClick={start} autoFocus>
                  <Play aria-hidden="true" /> {t('spot.start')}
                </button>
              </div>
            </div>
          </section>
        </div>
      )}

      {paused && phase === 'play' && (
        <div className="spot-layer">
          <section className="spot-panel small" aria-labelledby="shu-pause-h">
            <header className="spot-panel-head">
              <span aria-hidden="true">⏸</span>
              <h2 id="shu-pause-h">{t(confirmLeave ? 'shu.leaveTitle' : 'spot.pause')}</h2>
            </header>
            {confirmLeave ? (
              <div className="spot-panel-body spot-stack">
                <p className="shu-intro-text">{t('shu.leaveText')}</p>
                <button type="button" className="mall-btn exit" onClick={() => (onLevelSelect ?? onExit)()} autoFocus>
                  <LayoutGrid aria-hidden="true" /> {t('shu.leaveYes')}
                </button>
                <button type="button" className="mall-btn light" onClick={() => setConfirmLeave(false)}>
                  {t('shu.leaveNo')}
                </button>
              </div>
            ) : (
              <div className="spot-panel-body spot-stack">
                <button type="button" className="mall-btn go" onClick={() => setPaused(false)} autoFocus>
                  <Play aria-hidden="true" /> {t('spot.resume')}
                </button>
                <button type="button" className="mall-btn light" onClick={retry}>
                  <RotateCcw aria-hidden="true" /> {t('spot.retry')}
                </button>
                <button type="button" className="mall-btn light" onClick={() => setConfirmLeave(true)}>
                  <LayoutGrid aria-hidden="true" /> {t('shu.toLevels')}
                </button>
                <button type="button" className="mall-btn light" onClick={onExit}>
                  <DoorOpen aria-hidden="true" /> {t('spot.backDojo')}
                </button>
              </div>
            )}
          </section>
        </div>
      )}

      {phase === 'result' && result && (
        <div className="spot-layer">
          <section className="spot-panel" aria-labelledby="shu-result-h">
            <header className="spot-panel-head">
              <span aria-hidden="true">🏆</span>
              <h2 id="shu-result-h">{t('spot.done')}</h2>
            </header>
            <div className="spot-panel-body">
              <p className="spot-result-sub">{title}</p>
              <div className="spot-stars" aria-label={`${result.stars} / 3`}>
                {[0, 1, 2].map((i) => (
                  <Star key={i} className={i < result.stars ? 'on' : ''} style={{ animationDelay: `${0.1 + i * 0.18}s` }} />
                ))}
              </div>
              <ul className="shu-result-grid">
                <li>
                  <b>{result.accuracy}%</b>
                  <span>{t('shu.acc')}</span>
                </li>
                <li>
                  <b>{result.hits}</b>
                  <span>{t('shu.hits')}</span>
                </li>
                <li>
                  <b>{result.misses}</b>
                  <span>{t('shu.misses')}</span>
                </li>
                <li>
                  <b>{result.score}</b>
                  <span>{t('shu.score')}</span>
                </li>
              </ul>
              {(result.best > result.stars || result.bestAccuracy > result.accuracy) && (
                <p className="spot-result-best">
                  {t('spot.best')}: {'★'.repeat(result.best)}
                  {'☆'.repeat(3 - result.best)} · {t('shu.acc')} {result.bestAccuracy}%
                </p>
              )}
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
              {!shurikenLevel(level.n + 1) && <p className="spot-result-best">{t('spot.lastLevel')}</p>}
              <div className="spot-result-actions">
                {shurikenLevel(level.n + 1) && (
                  <button type="button" className="mall-btn go" onClick={nextLevel} autoFocus>
                    {t('spot.next')} <ChevronRight aria-hidden="true" />
                  </button>
                )}
                <button type="button" className="mall-btn light" onClick={retry} autoFocus={!shurikenLevel(level.n + 1)}>
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
    </div>
  );
}
