// Sushi Master Ninja (Dapur Bento Ninja).
// Dua zon: ATAS = pentas (tali sawat segi empat, chef di tengah, pelanggan di luar sisi);
// BAWAH = meja bahan berasingan + tikar penyediaan. Logik dalam session.ts (tulen & deterministik).
import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';
import { ChevronRight, DoorOpen, Lightbulb, Pause, Play, RotateCcw, Star } from 'lucide-react';
import { NPCS } from '../mall/config.ts';
import { drawChibi } from '../mall/render.ts';
import { drawSprite, loadSheet } from '../mall/sprites.ts';
import type { Sheet } from '../mall/sprites.ts';
import { t } from '../mall/strings.ts';
import { playSound } from '../../lib/sound.js';
import { SUSHI_LEVELS, sushiLevel } from './levels.ts';
import type { SushiLevel } from './levels.ts';
import { INGREDIENTS, RECIPES, TRAY_ORDER } from './recipes.ts';
import type { IngredientId, Recipe } from './recipes.ts';
import { CHEF, LOAD_POINT, STAGE } from './layout.ts';

/** Tepi kosong pentas (unit pentas) yang dipotong pada skrin sempit — pelanggan & gelembung kekal kelihatan. */
const STAGE_CROP = 34;
import { BELT_SPEED, SushiSession, TIMING } from './session.ts';
import { saveSushiResult } from './results.ts';
import type { SushiResult } from './results.ts';
import { MAT, TRAY_CELL, drawTrayContents, drawCondiment, drawConveyor, drawFinished, drawHearts, drawIngredient, drawLoadMarker, drawMat, drawOrderBubble, drawPlate, drawSeatFurniture, drawStageBackground } from './art.ts';
import '../spot/spot.css';
import './sushi.css';

type Phase = 'intro' | 'play' | 'result';
const fmt = (s: string, v: Record<string, string | number>) => s.replace(/\{(\w+)\}/g, (_, k) => String(v[k] ?? ''));

// ---------- ikon (dilukis sekali, disimpan sebagai data URL) ----------
const iconCache = new Map<string, string>();
function iconUrl(key: string, draw: (c: CanvasRenderingContext2D) => void, size = 96, height = size) {
  let u = iconCache.get(key);
  if (!u) {
    const cv = document.createElement('canvas');
    cv.width = size;
    cv.height = height;
    draw(cv.getContext('2d')!);
    u = cv.toDataURL('image/png');
    iconCache.set(key, u);
  }
  return u;
}
const ingIcon = (id: IngredientId) => iconUrl(`ing:${id}`, (c) => drawIngredient(c, id, 48, 48, 82));
const trayIcon = (id: IngredientId) =>
  iconUrl(`tray:${id}`, (c) => (c.scale(2, 2), drawTrayContents(c, id)), TRAY_CELL.w * 2, TRAY_CELL.h * 2);
const condimentIcon = (k: 'soySalty' | 'wasabi' | 'soySweet') => iconUrl(`cond:${k}`, (c) => drawCondiment(c, k, 48, 48, 88));
const recipeIcon = (r: Recipe) => iconUrl(`rec:${r.id}`, (c) => drawFinished(c, r, 48, 52, 80));

// ---------- watak (guna semula sprite akademi) ----------
const CUSTOMER_IDS = ['n1', 'n3', 'guru', 'misi', 'n2', 'seni', 'ganjaran', 'tekateki'];
const customerDefs = CUSTOMER_IDS.map((id) => NPCS.find((n) => n.id === id)).filter((n): n is NonNullable<typeof n> => !!n?.sprite);
const chefDef = NPCS.find((n) => n.id === 'chef')!;

export default function SushiGame({ startLevel, sound, onExit }: { startLevel: number; sound: boolean; onExit: () => void }) {
  const [levelN, setLevelN] = useState(startLevel);
  const level: SushiLevel = sushiLevel(levelN) ?? SUSHI_LEVELS[0];
  const [phase, setPhase] = useState<Phase>('intro');
  const [paused, setPaused] = useState(false);
  const [result, setResult] = useState<SushiResult | null>(null);
  const [, setVersion] = useState(0);
  const [toast, setToast] = useState<{ id: number; text: string; good?: boolean } | null>(null);
  const [shake, setShake] = useState<{ id: number; ing: IngredientId } | null>(null);
  // vx/vw: tetingkap mendatar pentas — skrin sempit memotong tepi kosong supaya watak lebih besar
  const [stageSize, setStageSize] = useState({ w: 0, h: 0, vx: 0, vw: STAGE.w });

  const sessionRef = useRef<SushiSession>(null as unknown as SushiSession);
  if (!sessionRef.current) sessionRef.current = new SushiSession(level);
  const stageWrapRef = useRef<HTMLDivElement>(null);
  const stageRef = useRef<HTMLCanvasElement>(null);
  const viewRef = useRef({ vx: 0, vw: STAGE.w });
  viewRef.current = { vx: stageSize.vx, vw: stageSize.vw };
  const matRef = useRef<HTMLCanvasElement>(null);
  const live = useRef({ phase, paused, sound, beltOffset: 0, chefHop: 0, fxId: 0, savedFor: null as SushiSession | null });
  live.current.phase = phase;
  live.current.paused = paused;
  live.current.sound = sound;
  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);
  useEffect(() => () => timers.current.forEach(clearTimeout), []);

  const sheets = useRef<{ chef: Sheet; customers: Sheet[] } | null>(null);
  if (!sheets.current) sheets.current = { chef: loadSheet(chefDef.sprite!), customers: customerDefs.map((d) => loadSheet(d.sprite!)) };

  const showToast = useCallback((text: string, good = false) => {
    const id = ++live.current.fxId;
    setToast({ id, text, good });
    timers.current.push(setTimeout(() => setToast((x) => (x?.id === id ? null : x)), 1400));
  }, []);

  const newSession = useCallback((lv: SushiLevel) => {
    sessionRef.current = new SushiSession(lv);
    live.current.beltOffset = 0;
    setResult(null);
    setToast(null);
    setPaused(false);
    setVersion((v) => v + 1);
  }, []);

  // ---- saiz pentas: kekalkan nisbah, muat dalam ruang ----
  useLayoutEffect(() => {
    const el = stageWrapRef.current;
    if (!el) return undefined;
    const measure = () => {
      // ruang kandungan sebenar: tolak padding bekas + sempadan bingkai pentas (4px × 2) + bayang
      const cs = getComputedStyle(el);
      const aw = el.clientWidth - parseFloat(cs.paddingLeft) - parseFloat(cs.paddingRight) - 8;
      const ah = el.clientHeight - parseFloat(cs.paddingTop) - parseFloat(cs.paddingBottom) - 16;
      const narrow = aw / ah < STAGE.w / STAGE.h;
      const vx = narrow ? STAGE_CROP : 0;
      const vw = STAGE.w - vx * 2;
      const k = Math.max(0.1, Math.min(aw / vw, ah / STAGE.h));
      setStageSize({ w: Math.floor(vw * k), h: Math.floor(STAGE.h * k), vx, vw });
    };
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  // ---- gelung animasi (logik maju ikut dt, bebas kadar bingkai) ----
  useEffect(() => {
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    let raf = 0;
    let last = performance.now();
    let lastVersion = -1;
    if (import.meta.env.DEV) (window as unknown as { __sushi: unknown }).__sushi = { get session() { return sessionRef.current; } };
    const frame = (now: number) => {
      raf = requestAnimationFrame(frame);
      const dt = Math.min(0.1, (now - last) / 1000);
      last = now;
      const time = now / 1000;
      const L = live.current;
      const s = sessionRef.current;
      const playing = L.phase === 'play' && !L.paused;
      if (playing) {
        s.tick(dt);
        L.beltOffset += BELT_SPEED * dt;
        L.chefHop = Math.max(0, L.chefHop - dt);
      }
      for (const e of s.drain()) {
        if (e.type === 'correct') playSound('tap', L.sound);
        else if (e.type === 'wrong') {
          playSound('wrong', L.sound);
          showToast(t('sushi.tryAgain'));
          setShake({ id: ++L.fxId, ing: e.ing });
        } else if (e.type === 'noOrder') showToast(t('sushi.waitCustomer'));
        else if (e.type === 'complete') {
          playSound('correct', L.sound);
          showToast(t('sushi.ready'), true);
        } else if (e.type === 'sent') L.chefHop = 0.5;
        else if (e.type === 'served') playSound('correct', L.sound);
        else if (e.type === 'levelDone' && L.savedFor !== s) {
          L.savedFor = s; // simpan sekali sahaja setiap sesi
          playSound('done', L.sound);
          setResult(saveSushiResult(s.level, s.served, s.wrong));
          setPhase('result');
        }
      }
      if (s.version !== lastVersion) {
        lastVersion = s.version;
        setVersion(s.version);
      }
      drawStage(time, reduced);
      drawPrep(time);
    };

    const drawStage = (time: number, reduced: boolean) => {
      const cv = stageRef.current;
      if (!cv || !cv.width) return;
      const c = cv.getContext('2d')!;
      const s = sessionRef.current;
      const view = viewRef.current;
      const k = cv.width / view.vw;
      c.setTransform(k, 0, 0, k, -view.vx * k, 0);
      c.clearRect(0, 0, STAGE.w, STAGE.h);
      drawStageBackground(c);
      for (const seat of s.seats) drawSeatFurniture(c, seat.def);
      drawConveyor(c, s.track, reduced ? 0 : live.current.beltOffset);
      // chef di tengah segi empat (melompat gembira bila menghantar)
      const hop = Math.sin((live.current.chefHop / 0.5) * Math.PI) * 8;
      const sh = sheets.current!;
      if (!drawSprite(c, sh.chef, CHEF.x, CHEF.y - (reduced ? 0 : hop), 'down', null) && sh.chef.failed) drawChibi(c, CHEF.x, CHEF.y, 'down', null, chefDef.look, time);
      drawLoadMarker(c, LOAD_POINT.x, LOAD_POINT.y, s.rollingOrderId !== null, reduced ? 0 : time);
      // pelanggan
      for (const seat of s.seats) {
        const o = s.orders.find((x) => x.id === seat.orderId);
        if (!o || seat.phase === 'empty') continue;
        const ci = (o.index * 3 + s.level.n) % sh.customers.length;
        const alpha = seat.phase === 'arriving' ? Math.min(1, seat.t / TIMING.arrive) : seat.phase === 'leaving' ? Math.max(0, 1 - seat.t / TIMING.leave) : 1;
        const bounce = seat.phase === 'eating' && !reduced ? Math.abs(Math.sin(seat.t * 9)) * 5 : 0;
        c.globalAlpha = alpha;
        const def = customerDefs[ci];
        if (!drawSprite(c, sh.customers[ci], seat.def.x, seat.def.y - bounce, seat.def.facing, null) && sh.customers[ci].failed) drawChibi(c, seat.def.x, seat.def.y, seat.def.facing, null, def.look, time);
        c.globalAlpha = 1;
        if (o.status === 'waiting' || o.status === 'rolling' || o.status === 'sent') {
          const pop = seat.phase === 'arriving' ? Math.min(1, seat.t / TIMING.arrive) : 1;
          drawOrderBubble(c, seat.def.x, seat.def.y - 104, o.recipeId, seat.def.badge, s.selectedId === o.id || s.rollingOrderId === o.id, pop);
        }
        if (seat.phase === 'eating') {
          const f = Math.min(1, seat.t / TIMING.eat);
          c.globalAlpha = 1 - f * 0.9;
          drawPlate(c, seat.def.dish.x, seat.def.dish.y, 46, RECIPES[o.recipeId]);
          c.globalAlpha = 1;
          drawHearts(c, seat.def.x, seat.def.y - 86, reduced ? 0.4 : seat.t);
        }
      }
      // pinggan atas tali sawat / meluncur ke pelanggan
      for (const p of s.plates) {
        const seat = s.seats.find((x) => x.def.id === p.seatId)!;
        let x: number;
        let y: number;
        if (p.phase === 'moving') ({ x, y } = s.track.pointAt(p.s));
        else {
          const from = s.track.pointAt(p.s);
          const f = Math.min(1, p.t / TIMING.slide);
          x = from.x + (seat.def.dish.x - from.x) * f;
          y = from.y + (seat.def.dish.y - from.y) * f;
        }
        drawPlate(c, x, y, 46, RECIPES[p.recipeId]);
        // lencana nombor tempat duduk tujuan (bukan warna sahaja)
        c.fillStyle = '#3d4c7a';
        c.beginPath();
        c.arc(x + 20, y - 14, 8, 0, Math.PI * 2);
        c.fill();
        c.fillStyle = '#fff';
        c.font = '900 10px system-ui, sans-serif';
        c.textAlign = 'center';
        c.textBaseline = 'middle';
        c.fillText(String(seat.def.badge), x + 20, y - 13);
      }
    };

    const drawPrep = (time: number) => {
      const cv = matRef.current;
      if (!cv) return;
      const c = cv.getContext('2d')!;
      const s = sessionRef.current;
      const k = cv.width / MAT.w;
      c.setTransform(k, 0, 0, k, 0, 0);
      const roll = s.rollingOrderId !== null ? Math.min(1, s.rollT / TIMING.roll) : null;
      drawMat(c, s.builder.recipe, s.builder.steps, roll, time);
    };

    raf = requestAnimationFrame(frame);
    return () => cancelAnimationFrame(raf); // tiada item tertinggal: sesi dibuang bersama komponen
  }, [showToast]);

  // ---- kawalan ----
  const start = () => {
    playSound('tap', sound);
    newSession(level);
    setPhase('play');
  };
  const retry = () => {
    newSession(level);
    setPhase('play');
  };
  const nextLevel = () => {
    const nx = sushiLevel(level.n + 1);
    if (!nx) return;
    setLevelN(nx.n);
    newSession(nx);
    setPhase('intro');
  };
  const canPlay = phase === 'play' && !paused;
  const tap = (id: IngredientId) => {
    if (!canPlay) return;
    sessionRef.current.tapIngredient(id);
  };

  // Papan kekunci: Escape = rehat; 1–6 = bahan
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.repeat) return;
      if (e.key === 'Escape') {
        e.stopPropagation();
        if (phase === 'play') setPaused((p) => !p);
        else onExit();
        return;
      }
      if (phase !== 'play' || paused) return;
      const n = Number(e.key);
      const id = TRAY_ORDER[n - 1];
      if (id && level.ingredients.includes(id)) sessionRef.current.tapIngredient(id); // 1–8 = petak dulang
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [phase, paused, level, onExit]);

  const s = sessionRef.current;
  const selected = s.selected ?? s.orders.find((o) => o.id === s.rollingOrderId) ?? null;
  const highlight = canPlay ? s.highlight : null;
  const title = `${t('spot.level')} ${level.n} · ${t(level.titleKey)}`;
  const uniqueRecipes = [...new Set(level.orders)].map((id) => RECIPES[id]);
  const hintsLeft = level.hints - s.hintsUsed;
  const dpr = typeof window !== 'undefined' ? Math.min(window.devicePixelRatio || 1, 2.5) : 1;

  return (
    <div className="spot-root sushi-root" role="dialog" aria-modal="true" aria-label={t('sushi.title')}>
      <header className="spot-top">
        <button type="button" className="spot-icon-btn" onClick={() => (phase === 'play' ? setPaused(true) : onExit())} aria-label={phase === 'play' ? t('spot.pause') : t('spot.backDojo')}>
          {phase === 'play' ? <Pause aria-hidden="true" /> : <DoorOpen aria-hidden="true" />}
        </button>
        <div className="spot-title">
          <b>{t('sushi.title')}</b>
          <span>{title}</span>
        </div>
        <div className="spot-counter" aria-live="polite" aria-label={`${t('sushi.served')}: ${s.served} / ${s.total}`}>
          <span aria-hidden="true">🍣</span>
          <b>
            {s.served}/{s.total}
          </b>
        </div>
        {level.hints > 0 && (
          <button type="button" className="spot-hint-btn" onClick={() => canPlay && s.useHint() && playSound('tap', sound)} disabled={!canPlay || hintsLeft <= 0 || !s.builder.expected}>
            <Lightbulb aria-hidden="true" />
            <span>{t('spot.hint')}</span>
            <i>{hintsLeft}</i>
          </button>
        )}
      </header>

      {/* kad pesanan aktif */}
      <section className="sushi-orders" aria-label={t('sushi.orders')}>
        {s.openOrders.length === 0 && <p className="sushi-orders-empty">{t(s.served >= s.total ? 'sushi.allServed' : 'sushi.waitCustomer')}</p>}
        {s.openOrders.map((o) => {
          const r = RECIPES[o.recipeId];
          const seat = s.seats.find((x) => x.def.id === o.seatId)!;
          const isSel = selected?.id === o.id;
          const doneSteps = isSel ? s.builder.steps.length : o.status === 'waiting' ? 0 : r.steps.length;
          return (
            <button
              key={o.id}
              type="button"
              className={`sushi-card ${isSel ? 'sel' : ''} ${o.status}`}
              onClick={() => canPlay && s.select(o.id)}
              aria-pressed={isSel}
              aria-label={`${t('sushi.customer')} ${seat.def.badge}: ${t(r.nameKey)}`}
            >
              <i className="sushi-badge">{seat.def.badge}</i>
              <img src={recipeIcon(r)} alt="" />
              <span className="sushi-card-main">
                <b>{t(r.nameKey)}</b>
                <span className="sushi-steps">
                  {r.steps.map((st, i) => (
                    <span key={i} className={`sushi-step ${i < doneSteps ? 'done' : ''} ${isSel && i === doneSteps && o.status === 'waiting' ? 'next' : ''}`}>
                      <img src={ingIcon(st)} alt={t(INGREDIENTS[st].nameKey)} />
                      {i < doneSteps && <em aria-hidden="true">✓</em>}
                    </span>
                  ))}
                </span>
                <small>{o.status === 'waiting' ? t('sushi.pick') : o.status === 'rolling' ? t('sushi.ready') : t('sushi.sending')}</small>
              </span>
            </button>
          );
        })}
      </section>

      {/* ZON ATAS: tali sawat segi empat */}
      <div className="sushi-stage-wrap" ref={stageWrapRef}>
        <div className="sushi-stage" style={{ width: stageSize.w, height: stageSize.h }}>
          <canvas ref={stageRef} width={Math.max(1, Math.round(stageSize.w * dpr))} height={Math.max(1, Math.round(stageSize.h * dpr))} role="img" aria-label={t('sushi.stageLabel')} />
        </div>
        {toast && (
          <div className={`spot-toast ${toast.good ? 'good' : ''}`} key={toast.id} aria-live="polite">
            {toast.text}
          </div>
        )}
      </div>

      {/* ZON BAWAH: meja bahan & tikar penyediaan (berasingan) */}
      <section className="sushi-table" aria-label={t('sushi.prepTable')}>
        {/* dulang bahan 8 petak (4 × 2, susunan tetap); bahan yang tiada dalam tahap ini = petak kosong */}
        <div className="sushi-ings" role="group" aria-label={t('sushi.pick')}>
          {TRAY_ORDER.map((id, i) => {
            if (!id || !level.ingredients.includes(id)) return <span key={`slot-${i}`} className="sushi-ing empty" aria-hidden="true" />;
            const ing = INGREDIENTS[id];
            const hi = highlight === id;
            return (
              <button
                key={id}
                type="button"
                className={`sushi-ing ${hi ? 'hi' : ''} ${shake?.ing === id ? 'shake' : ''}`}
                data-ing={id}
                data-key={i + 1}
                onClick={() => tap(id)}
                onAnimationEnd={() => setShake((x) => (x?.ing === id ? null : x))}
                disabled={!canPlay}
                aria-label={`${t(ing.nameKey)}${hi ? ` — ${t('sushi.next')}` : ''}`}
                style={{ ['--ing' as string]: ing.color }}
              >
                {hi && <span className="sushi-arrow" aria-hidden="true">▼</span>}
                <img src={trayIcon(id)} alt="" />
                <b>{t(ing.nameKey)}</b>
              </button>
            );
          })}
        </div>
        <div className="sushi-tools">
        {/* perasa (hiasan buat masa ini — belum digunakan dalam resipi) */}
        <div className="sushi-condiments" aria-hidden="true">
          {(['soySalty', 'wasabi', 'soySweet'] as const).map((k) => (
            <span key={k} className="sushi-condiment">
              <img src={condimentIcon(k)} alt="" />
              <small>{t(`sushi.cond.${k}`)}</small>
            </span>
          ))}
        </div>
        <div className="sushi-mat">
          <canvas ref={matRef} width={MAT.w * 2} height={MAT.h * 2} role="img" aria-label={`${t('sushi.mat')}: ${s.builder.steps.map((st) => t(INGREDIENTS[st].nameKey)).join(', ') || '—'}`} />
        </div>
        <button type="button" className="sushi-side-btn" onClick={() => s.restartSushi()} disabled={!canPlay || !s.builder.steps.length || s.builder.locked}>
          <RotateCcw aria-hidden="true" />
          <span>{t('sushi.restart')}</span>
        </button>
        </div>
      </section>

      {phase === 'intro' && (
        <div className="spot-layer">
          <section className="spot-panel" aria-labelledby="sushi-intro-h">
            <header className="spot-panel-head">
              <span aria-hidden="true">🍣</span>
              <h2 id="sushi-intro-h">{title}</h2>
            </header>
            <div className="spot-panel-body">
              <p className="spot-intro-goal">{fmt(t('sushi.goal'), { n: level.orders.length })}</p>
              <ul className="sushi-recipes">
                {uniqueRecipes.map((r) => (
                  <li key={r.id}>
                    <img src={recipeIcon(r)} alt="" />
                    <b>{t(r.nameKey)}</b>
                    <span className="sushi-steps">
                      {r.steps.map((st, i) => (
                        <span key={i} className="sushi-step">
                          <img src={ingIcon(st)} alt={t(INGREDIENTS[st].nameKey)} />
                        </span>
                      ))}
                    </span>
                  </li>
                ))}
              </ul>
              {level.tutorial && (
                <ol className="spot-tut">
                  <li>
                    <span aria-hidden="true">👀</span> {t('sushi.tut1')}
                  </li>
                  <li>
                    <span aria-hidden="true">👆</span> {t('sushi.tut2')}
                  </li>
                  <li>
                    <span aria-hidden="true">🍣</span> {t('sushi.tut3')}
                  </li>
                </ol>
              )}
              <p className="spot-intro-note">{t('sushi.noTimer')}</p>
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
          <section className="spot-panel small" aria-labelledby="sushi-pause-h">
            <header className="spot-panel-head">
              <span aria-hidden="true">⏸</span>
              <h2 id="sushi-pause-h">{t('spot.pause')}</h2>
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
          <section className="spot-panel" aria-labelledby="sushi-result-h">
            <header className="spot-panel-head">
              <span aria-hidden="true">🏆</span>
              <h2 id="sushi-result-h">{t('spot.done')}</h2>
            </header>
            <div className="spot-panel-body">
              <p className="spot-result-sub">{title}</p>
              <div className="spot-stars" aria-label={`${result.stars} / 3`}>
                {[0, 1, 2].map((i) => (
                  <Star key={i} className={i < result.stars ? 'on' : ''} style={{ animationDelay: `${0.1 + i * 0.18}s` }} />
                ))}
              </div>
              <p className="spot-result-line">{fmt(t('sushi.servedOf'), { a: result.served, b: result.total })}</p>
              <p className="spot-result-best">{fmt(t('sushi.wrongCount'), { n: result.wrong })}</p>
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
              {!sushiLevel(level.n + 1) && <p className="spot-result-best">{t('spot.lastLevel')}</p>}
              <div className="spot-result-actions">
                {sushiLevel(level.n + 1) && (
                  <button type="button" className="mall-btn go" onClick={nextLevel} autoFocus>
                    {t('spot.next')} <ChevronRight aria-hidden="true" />
                  </button>
                )}
                <button type="button" className="mall-btn light" onClick={retry} autoFocus={!sushiLevel(level.n + 1)}>
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
