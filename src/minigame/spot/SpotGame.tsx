// Latihan Mata Ninja — permainan cari perbezaan (Dojo Teka-Teki).
// Aliran: Pengenalan tahap → Main → Animasi selesai → Keputusan (Seterusnya / Main Semula / Kembali ke Dojo).
// Enjin generik: semua kandungan datang daripada levels.ts; tiada kod khusus tahap di sini.
import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';
import { ChevronRight, DoorOpen, Lightbulb, Pause, Play, RotateCcw, Search, Star } from 'lucide-react';
import { SPOT_GAME_ID, SPOT_LEVELS, spotLevel } from './levels.ts';
import { chooseLayout, computeStars, hintArea, hitTest, markerOf, toNormalized } from './engine.ts';
import { loadLevelImages } from './assets.ts';
import { completeLevel } from '../mall/rewards.ts';
import type { RewardResult } from '../mall/rewards.ts';
import { levelProgress } from '../mall/save.ts';
import { t } from '../mall/strings.ts';
import { playSound } from '../../lib/sound.js';
import './spot.css';

type Phase = 'intro' | 'play' | 'result';
type Side = 'a' | 'b';
interface Fx {
  id: number;
  side?: Side;
  x: number;
  y: number;
}
interface Result {
  stars: number;
  best: number;
  reward: RewardResult;
}

/** Kelonggaran sentuhan (px CSS) di sekeliling setiap kawasan. */
const TAP_SLOP_PX = 14;
const fmt = (s: string, v: Record<string, string | number>) => s.replace(/\{(\w+)\}/g, (_, k) => String(v[k] ?? ''));

export default function SpotGame({ startLevel, sound, onExit }: { startLevel: number; sound: boolean; onExit: () => void }) {
  const [levelN, setLevelN] = useState(startLevel);
  const level = spotLevel(levelN) ?? SPOT_LEVELS[0];
  const aspect = level.height / level.width;

  const [phase, setPhase] = useState<Phase>('intro');
  const [images, setImages] = useState<{ a: string; b: string } | null>(null);
  const [loadError, setLoadError] = useState(false);
  const [loadTick, setLoadTick] = useState(0);
  const [found, setFound] = useState<string[]>([]);
  const [wrong, setWrong] = useState(0);
  const [hintsUsed, setHintsUsed] = useState(0);
  const [hint, setHint] = useState<{ id: string; cx: number; cy: number; r: number } | null>(null);
  const [misses, setMisses] = useState<Fx[]>([]);
  const [bursts, setBursts] = useState<(Fx & { did: string })[]>([]);
  const [toast, setToast] = useState<{ id: number; text: string } | null>(null);
  const [paused, setPaused] = useState(false);
  const [completing, setCompleting] = useState(false);
  const [result, setResult] = useState<Result | null>(null);
  const [layout, setLayout] = useState({ stacked: false, w: 0, h: 0 });
  const boardRef = useRef<HTMLDivElement>(null);
  const fxId = useRef(0);
  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);
  const later = (fn: () => void, ms: number) => timers.current.push(setTimeout(fn, ms));
  useEffect(() => () => timers.current.forEach(clearTimeout), []);

  // ---- muat imej tahap (malas) ----
  useEffect(() => {
    let alive = true;
    setImages(null);
    setLoadError(false);
    loadLevelImages(level)
      .then((im) => alive && setImages(im))
      .catch(() => alive && setLoadError(true));
    return () => {
      alive = false;
    };
  }, [level, loadTick]);

  // ---- susun atur responsif (sebelah-menyebelah / bertindan); penanda dalam % jadi sentiasa sejajar ----
  useLayoutEffect(() => {
    const el = boardRef.current;
    if (!el) return undefined;
    // tolak sempadan bingkai (4px × 2) + bayang supaya kedua-dua gambar muat tanpa skrol
    const measure = () => setLayout(chooseLayout(el.clientWidth - 16, el.clientHeight - 20, aspect, 22));
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => ro.disconnect();
  }, [aspect]);

  const resetAttempt = useCallback(() => {
    timers.current.forEach(clearTimeout);
    timers.current = [];
    setFound([]);
    setWrong(0);
    setHintsUsed(0);
    setHint(null);
    setMisses([]);
    setBursts([]);
    setToast(null);
    setPaused(false);
    setCompleting(false);
    setResult(null);
  }, []);

  const total = level.differences.length;
  const ready = !!images && phase === 'play' && !paused && !completing;

  const showToast = (text: string) => {
    const id = ++fxId.current;
    setToast({ id, text });
    later(() => setToast((x) => (x?.id === id ? null : x)), 1600);
  };

  const finish = (wrongCount: number, hints: number) => {
    const stars = computeStars(level, wrongCount, hints);
    const before = levelProgress(SPOT_GAME_ID, level.n).stars;
    const reward = completeLevel(SPOT_GAME_ID, level.n, stars); // simpan serta-merta
    setCompleting(true);
    later(() => playSound('done', sound), 350);
    later(() => {
      setResult({ stars, best: Math.max(before, stars), reward });
      setPhase('result');
      setCompleting(false);
    }, 1500);
  };

  const onTap = (side: Side) => (e: React.PointerEvent<HTMLDivElement>) => {
    if (!e.isPrimary || !ready) return;
    // kotak kandungan (tanpa sempadan bingkai) — penanda juga diletak relatif kepadanya
    const el = e.currentTarget;
    const r = el.getBoundingClientRect();
    const rect = { left: r.left + el.clientLeft, top: r.top + el.clientTop, width: el.clientWidth, height: el.clientHeight };
    const p = toNormalized(e.clientX, e.clientY, rect, level.width, level.height);
    if (!p) return; // jidar / di luar imej
    const tol = TAP_SLOP_PX / rect.width;
    const res = hitTest(p, level.differences, new Set(found), aspect, tol);
    if (res.kind === 'already') return;
    if (res.kind === 'hit') {
      const next = [...found, res.id];
      setFound(next);
      if (hint?.id === res.id) setHint(null);
      const m = markerOf(level.differences.find((d) => d.id === res.id)!.shape, aspect);
      const id = ++fxId.current;
      setBursts((b) => [...b, { id, did: res.id, x: m.cx, y: m.cy }]);
      later(() => setBursts((b) => b.filter((q) => q.id !== id)), 900);
      playSound('correct', sound);
      showToast(t('spot.good'));
      if (next.length >= total) finish(wrong, hintsUsed);
      return;
    }
    setWrong((w) => w + 1);
    const id = ++fxId.current;
    setMisses((m) => [...m.slice(-3), { id, side, x: p.x, y: p.y }]);
    later(() => setMisses((m) => m.filter((q) => q.id !== id)), 900);
    playSound('wrong', sound);
    showToast(t('spot.tryAgain'));
  };

  const useHint = () => {
    if (!ready || hintsUsed >= level.hints) return;
    const left = level.differences.filter((d) => !found.includes(d.id));
    if (!left.length) return;
    const pick = left[Math.floor(Math.random() * left.length)];
    const area = hintArea(pick.shape, aspect, Math.random());
    setHint({ id: pick.id, ...area });
    setHintsUsed((h) => h + 1);
    playSound('tap', sound);
    later(() => setHint((h) => (h?.id === pick.id ? null : h)), 5200);
  };

  const start = () => {
    playSound('tap', sound);
    resetAttempt();
    setPhase('play');
  };
  const retry = () => {
    resetAttempt();
    setPhase('play');
  };
  const nextLevel = () => {
    const nx = spotLevel(level.n + 1);
    if (!nx) return;
    resetAttempt();
    setLevelN(nx.n);
    setPhase('intro');
  };

  // Papan kekunci: Escape = rehat / sambung (semasa main), keluar (pengenalan & keputusan)
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== 'Escape' || e.repeat) return;
      e.stopPropagation();
      if (phase === 'play' && !completing) setPaused((p) => !p);
      else if (phase !== 'play') onExit();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [phase, completing, onExit]);

  const pct = (v: number) => `${v * 100}%`;
  const renderPic = (side: Side) => (
    <div
      className={`spot-pic ${ready ? 'ready' : ''}`}
      style={{ width: layout.w, height: layout.h }}
      onPointerDown={onTap(side)}
      role="img"
      aria-label={t(side === 'a' ? 'spot.imageA' : 'spot.imageB')}
    >
      {images ? <img src={images[side]} alt="" draggable={false} /> : <span className="spot-loading-pic" aria-hidden="true" />}
      {found.map((id) => {
        const m = markerOf(level.differences.find((d) => d.id === id)!.shape, aspect);
        return <span key={id} className="spot-mark" style={{ left: pct(m.cx - m.r), top: pct(m.cy - m.r / aspect), width: pct(2 * m.r), height: pct((2 * m.r) / aspect) }} />;
      })}
      {hint && <span className="spot-hint" style={{ left: pct(hint.cx - hint.r), top: pct(hint.cy - hint.r / aspect), width: pct(2 * hint.r), height: pct((2 * hint.r) / aspect) }} />}
      {bursts.map((b) => (
        <span key={b.id} className="spot-burst" style={{ left: pct(b.x), top: pct(b.y) }} aria-hidden="true">
          {[0, 1, 2, 3, 4, 5].map((k) => (
            <i key={k} style={{ ['--a' as string]: `${k * 60}deg` }} />
          ))}
        </span>
      ))}
      {misses
        .filter((m) => m.side === side)
        .map((m) => (
          <span key={m.id} className="spot-miss" style={{ left: pct(m.x), top: pct(m.y) }} aria-hidden="true" />
        ))}
    </div>
  );

  const title = `${t('spot.level')} ${level.n} · ${t(level.titleKey)}`;
  const hintsLeft = level.hints - hintsUsed;

  return (
    <div className="spot-root" role="dialog" aria-modal="true" aria-label={t('spot.title')}>
      <header className="spot-top">
        <button type="button" className="spot-icon-btn" onClick={() => (phase === 'play' ? setPaused(true) : onExit())} aria-label={phase === 'play' ? t('spot.pause') : t('spot.backDojo')} disabled={completing}>
          {phase === 'play' ? <Pause aria-hidden="true" /> : <DoorOpen aria-hidden="true" />}
        </button>
        <div className="spot-title">
          <b>{t('spot.title')}</b>
          <span>{title}</span>
        </div>
        <div className="spot-counter" aria-live="polite" aria-label={`${t('spot.counter')}: ${found.length} / ${total}`}>
          <Search aria-hidden="true" />
          <b>
            {found.length}/{total}
          </b>
        </div>
        <button type="button" className="spot-hint-btn" onClick={useHint} disabled={!ready || hintsLeft <= 0 || found.length >= total}>
          <Lightbulb aria-hidden="true" />
          <span>{t('spot.hint')}</span>
          <i>{hintsLeft}</i>
        </button>
      </header>
      {level.placeholderArt && <span className="spot-proto">{t('spot.prototype')}</span>}

      <main className="spot-board" ref={boardRef}>
        <div className={`spot-pics ${layout.stacked ? 'stacked' : ''}`}>
          {renderPic('a')}
          {renderPic('b')}
        </div>
        {!images && !loadError && (
          <div className="spot-loading" role="status">
            <span className="spot-spinner" aria-hidden="true" />
            {t('spot.loading')}
          </div>
        )}
        {loadError && (
          <div className="spot-loading" role="alert">
            {t('spot.loadError')}
            <button type="button" className="mall-btn" onClick={() => setLoadTick((n) => n + 1)}>
              {t('spot.retryLoad')}
            </button>
          </div>
        )}
        {toast && (
          <div className={`spot-toast ${toast.text === t('spot.good') ? 'good' : ''}`} key={toast.id} aria-live="polite">
            {toast.text}
          </div>
        )}
        {completing && (
          <div className="spot-complete" aria-live="assertive">
            <b>{t('spot.great')}</b>
            <span>
              {[0, 1, 2].map((i) => (
                <Star key={i} style={{ animationDelay: `${0.15 + i * 0.15}s` }} />
              ))}
            </span>
          </div>
        )}
      </main>

      {phase === 'intro' && (
        <div className="spot-layer">
          <section className="spot-panel" aria-labelledby="spot-intro-h">
            <header className="spot-panel-head">
              <span aria-hidden="true">🥷</span>
              <h2 id="spot-intro-h">{title}</h2>
            </header>
            <div className="spot-panel-body">
              <p className="spot-intro-goal">
                <Search aria-hidden="true" /> {fmt(t('spot.find'), { n: total })}
              </p>
              {level.tutorial && (
                <ol className="spot-tut">
                  <li>
                    <span aria-hidden="true">👀</span> {t('spot.tut1')}
                  </li>
                  <li>
                    <span aria-hidden="true">👆</span> {t('spot.tut2')}
                  </li>
                  <li>
                    <span aria-hidden="true">💡</span> {t('spot.tut3')}
                  </li>
                </ol>
              )}
              <p className="spot-intro-note">{t('spot.noTimer')}</p>
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
          <section className="spot-panel small" aria-labelledby="spot-pause-h">
            <header className="spot-panel-head">
              <span aria-hidden="true">⏸</span>
              <h2 id="spot-pause-h">{t('spot.pause')}</h2>
            </header>
            <div className="spot-panel-body spot-stack">
              <button type="button" className="mall-btn go" onClick={() => setPaused(false)} autoFocus>
                <Play aria-hidden="true" /> {t('spot.resume')}
              </button>
              <button type="button" className="mall-btn light" onClick={retry}>
                <RotateCcw aria-hidden="true" /> {t('spot.retry')}
              </button>
              <button type="button" className="mall-btn light" onClick={onExit}>
                <DoorOpen aria-hidden="true" /> {t('spot.backDojo')}
              </button>
            </div>
          </section>
        </div>
      )}

      {phase === 'result' && result && (
        <div className="spot-layer">
          <section className="spot-panel" aria-labelledby="spot-result-h">
            <header className="spot-panel-head">
              <span aria-hidden="true">🏆</span>
              <h2 id="spot-result-h">{t('spot.done')}</h2>
            </header>
            <div className="spot-panel-body">
              <p className="spot-result-sub">{title}</p>
              <div className="spot-stars" aria-label={`${result.stars} / 3`}>
                {[0, 1, 2].map((i) => (
                  <Star key={i} className={i < result.stars ? 'on' : ''} style={{ animationDelay: `${0.1 + i * 0.18}s` }} />
                ))}
              </div>
              <p className="spot-result-line">{fmt(t('spot.foundOf'), { a: found.length, b: total })}</p>
              {result.best > result.stars && (
                <p className="spot-result-best">
                  {t('spot.best')}: {'★'.repeat(result.best)}
                  {'☆'.repeat(3 - result.best)}
                </p>
              )}
              <div className="spot-reward">
                <b>{t('spot.reward')}</b>
                {result.reward.granted ? (
                  <span>
                    <em>🪙 +{result.reward.coins} {t('spot.coins')}</em>
                    <em>⭐ +{result.reward.xp} {t('spot.xp')}</em>
                  </span>
                ) : (
                  <small>{t('spot.claimed')}</small>
                )}
              </div>
              {!spotLevel(level.n + 1) && <p className="spot-result-best">{t('spot.lastLevel')}</p>}
              <div className="spot-result-actions">
                {spotLevel(level.n + 1) && (
                  <button type="button" className="mall-btn go" onClick={nextLevel} autoFocus>
                    {t('spot.next')} <ChevronRight aria-hidden="true" />
                  </button>
                )}
                <button type="button" className="mall-btn light" onClick={retry} autoFocus={!spotLevel(level.n + 1)}>
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
