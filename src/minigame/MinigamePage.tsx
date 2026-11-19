// Tab "Mini Game" — Akademi Ninja (Fasa 1: penerokaan · Fasa 2: NPC, dialog, pemilihan tahap).
// Scene dilukis pada <canvas> (render.ts); HUD, joystick dan modal ialah DOM biasa.
// Data: mall/config.ts (kedai & NPC) · mall/training.ts (tahap, misi, ganjaran) · Logik: mall/engine.ts · Teks: mall/strings.ts
import { Suspense, lazy, useCallback, useEffect, useRef, useState } from 'react';
import { ChevronLeft, ChevronRight, DoorOpen, Lock, Map as MapIcon, MessageCircle, Play, Star, X } from 'lucide-react';
import { MALL, NPCS, PLAYER_SPRITE, SHOPS, UTILITIES } from './mall/config.ts';
import { drawAction, drawSprite, idleFrame, loadSheet } from './mall/sprites.ts';
import type { Sheet } from './mall/sprites.ts';
import { EXT_PLAYER_HEIGHT } from './mall/preload.ts';
import type { Facing, NpcDef, Point } from './mall/config.ts';
import {
  FLAT_PROPS, allProps, buildColliders, buildInteractables, clampCamera, computeZoom, facingFrom, inputVector,
  moveWithCollision, nearestInteractable, shopEntrance,
} from './mall/engine.ts';
import type { Interactable } from './mall/engine.ts';
import { PLAYER_LOOK, buildStaticLayer, drawChibi, drawDoorPad, drawTalkBubble, drawProp, drawSigns, drawUtilityMarker } from './mall/render.ts';
import { t } from './mall/strings.ts';
import { SPOT_GAME_ID } from './spot/levels.ts';
import { SUSHI_GAME_ID } from './sushi/levels.ts';
import { SHURIKEN_GAME_ID } from './shuriken/levels.ts';
import { MASK_GAME_ID } from './mask/levels.ts';
import { readDevJump, setDevHash } from './dev.ts';
import type { DevGame } from './dev.ts';
import { DOJO_LEVELS, MISSIONS, REWARDS, isLevelUnlocked, levelStars, markTutorialDone, tutorialDone } from './mall/training.ts';
import { EXT, EXT_PROPS, buildExteriorBackground, drawExtProp, drawPetals, extLayout, makePetals, proj, updateExterior } from './mall/exterior.ts';
import type { ExtLayout, ExtState, Petal } from './mall/exterior.ts';
import { playSound } from '../lib/sound.js';
import './mall/mall.css';

export interface PlayerState {
  x: number;
  y: number;
  facing: Facing;
}

type MinigameProps = {
  sound: boolean;
  onBack: () => void;
  onToggleSound?: () => void;
  /** Avatar profil semasa (ditunjukkan di HUD). */
  avatarSrc?: string;
  /** Fasa 2: pulihkan kedudukan selepas kembali dari permainan mini. */
  initialPlayer?: PlayerState | null;
  /** Kelak: dipanggil bila tahap dojo ada gameId (training.ts). Simpan `player` dan hantar balik sebagai initialPlayer. */
  onOpenMiniGame?: (shopId: string, miniGameId: string, player: PlayerState) => void;
};

const npcById = (id: string) => NPCS.find((n) => n.id === id);

// Permainan mini dalam dojo dimuat secara malas (kod & seni hanya dimuat bila dibuka).
// Setiap permainan menerima prop yang sama: { startLevel, sound, onExit }.
const EMBEDDED_GAMES = {
  [SPOT_GAME_ID]: lazy(() => import('./spot/SpotGame.tsx')),
  [SUSHI_GAME_ID]: lazy(() => import('./sushi/SushiGame.tsx')),
  [SHURIKEN_GAME_ID]: lazy(() => import('./shuriken/ShurikenGame.tsx')),
  [MASK_GAME_ID]: lazy(() => import('./mask/MaskGame.tsx')),
} as const;

// Panel DEV hanya dimuat semasa pembangunan (dibuang sepenuhnya daripada binaan production).
const DevPanel = import.meta.env.DEV ? lazy(() => import('./DevPanel.tsx')) : null;

type Scene = 'exterior' | 'interior';
/** Tempoh setiap separuh peralihan (pudar ke hitam / pudar kembali), ms. */
const FADE_MS = 650;

type Modal =
  | { type: 'talk'; npcId: string; page: number; tutorial?: boolean }
  | { type: 'levels'; npcId: string; shopId: string }
  | { type: 'soon'; npcId: string; shopId: string; level: number }
  | { type: 'game'; gameId: string; npcId: string; level: number }
  | { type: 'missions'; npcId: string }
  | { type: 'rewards'; npcId: string }
  | { type: 'map' }
  | { type: 'exit' }
  | null;

const STORE_KEY = 'mall:lastPosition';
function loadSavedPlayer(): PlayerState | null {
  if (MALL.reentry !== 'restore') return null;
  try {
    const v = JSON.parse(sessionStorage.getItem(STORE_KEY) || 'null');
    return v && Number.isFinite(v.x) && Number.isFinite(v.y) ? v : null;
  } catch {
    return null;
  }
}
function savePlayer(p: PlayerState) {
  if (MALL.reentry !== 'restore') return;
  try {
    sessionStorage.setItem(STORE_KEY, JSON.stringify(p));
  } catch {
    /* storan disekat — abaikan */
  }
}

const KEYMAP: Record<string, 'up' | 'down' | 'left' | 'right'> = {
  ArrowUp: 'up', KeyW: 'up', ArrowDown: 'down', KeyS: 'down', ArrowLeft: 'left', KeyA: 'left', ArrowRight: 'right', KeyD: 'right',
};

export default function MinigamePage({ sound, onBack, avatarSrc, initialPlayer, onOpenMiniGame }: MinigameProps) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  // DEV: #mall/dalam, #mall/sushi/3 … terus ke dalam / terus ke permainan (langkau babak luar & tutorial)
  const [devJump] = useState(readDevJump);
  const [modal, setModal] = useState<Modal>(() =>
    devJump?.game ? { type: 'game', gameId: devJump.game.gameId, npcId: devJump.game.npcId, level: devJump.level } : null,
  );
  const [near, setNear] = useState<Interactable | null>(null);
  const [fading, setFading] = useState(false);

  // Mula di LUAR akademi, kecuali kembali dari permainan mini / mod 'restore' / jalan pintas DEV.
  const resume = initialPlayer || loadSavedPlayer() || (devJump ? (devJump.game?.at ?? MALL.spawnPoint) : null);
  const [scene, setScene] = useState<Scene>(resume ? 'interior' : 'exterior');
  const start = resume || MALL.spawnPoint;
  const g = useRef({
    player: { x: start.x, y: start.y, facing: start.facing as Facing, walk: null as number | null },
    cam: { x: 0, y: 0, ready: false },
    keys: { up: false, down: false, left: false, right: false },
    joy: { x: 0, y: 0 } as Point,
    paused: false,
    resumeAt: 0,
    nearKey: null as string | null,
    near: null as Interactable | null,
    vw: 0,
    vh: 0,
    zoom: 1,
    layer: null as HTMLCanvasElement | null,
    layerScale: 0,
    scene: (resume ? 'interior' : 'exterior') as Scene,
    ext: { gx: EXT.spawn.gx, z: EXT.spawn.z, facing: EXT.spawn.facing, walk: null } as ExtState,
    extL: null as ExtLayout | null,
    extBg: null as HTMLCanvasElement | null,
    petals: [] as Petal[],
    transitioning: false,
    timers: [] as ReturnType<typeof setTimeout>[],
    /** Babak automatik scene luar: 'intro' = berjalan masuk, 'outro' = berjalan pulang. */
    extAuto: { mode: (resume ? null : 'intro') as 'intro' | 'outro' | null, wait: EXT.autoStartDelay, fired: false },
    /** NPC yang sedang dilayan (dialog / panel terbuka) — dia berpaling ke pemain & berhenti beraksi. */
    talkNpc: null as string | null,
    modal: null as string | null,
  });

  // ---- peralihan pudar antara luar <-> dalam ----
  const transitionTo = useCallback((to: Scene) => {
    const s = g.current;
    if (s.transitioning || s.scene === to) return; // elak peralihan berganda
    s.transitioning = true;
    s.paused = true;
    s.keys = { up: false, down: false, left: false, right: false };
    s.joy = { x: 0, y: 0 };
    s.near = null;
    s.nearKey = null;
    setNear(null);
    setFading(true);
    s.timers.push(
      setTimeout(() => {
        // skrin hitam: tukar scene & letak pemain
        if (to === 'interior') {
          Object.assign(s.player, { x: MALL.spawnPoint.x, y: MALL.spawnPoint.y, facing: MALL.spawnPoint.facing, walk: null });
        } else {
          Object.assign(s.ext, { gx: EXT.exitSpot.gx, z: EXT.exitSpot.z, facing: EXT.exitSpot.facing, walk: null });
        }
        s.scene = to;
        s.cam.ready = false;
        s.extAuto = to === 'exterior' ? { mode: 'outro', wait: EXT.autoPause, fired: false } : { mode: null, wait: 0, fired: false };
        setScene(to);
        requestAnimationFrame(() => requestAnimationFrame(() => setFading(false)));
        s.timers.push(
          setTimeout(() => {
            s.transitioning = false;
            s.paused = false;
            s.resumeAt = performance.now() + 200;
            // Kali pertama masuk: Guru Ninja memperkenalkan akademi (sekali sahaja, boleh dilangkau).
            if (to === 'interior' && !tutorialDone()) setModal({ type: 'talk', npcId: 'guru', page: 0, tutorial: true });
          }, FADE_MS + 40),
        );
      }, FADE_MS + 30),
    );
  }, []);
  useEffect(() => () => g.current.timers.forEach(clearTimeout), []);

  const onBackRef = useRef(onBack);
  onBackRef.current = onBack;
  const leaveToHome = useCallback(() => {
    const s = g.current;
    if (s.transitioning) return;
    s.transitioning = true;
    s.paused = true;
    s.extAuto.fired = true;
    setNear(null);
    setFading(true);
    s.timers.push(setTimeout(() => onBackRef.current(), FADE_MS + 30));
  }, []);
  const transitionRef = useRef(transitionTo);
  transitionRef.current = transitionTo;
  const leaveRef = useRef(leaveToHome);
  leaveRef.current = leaveToHome;
  const skipCutscene = useCallback(() => {
    const a = g.current.extAuto;
    if (g.current.transitioning || !a.mode) return;
    a.fired = true;
    if (a.mode === 'outro') leaveToHome();
    else transitionTo('interior');
  }, [leaveToHome, transitionTo]);

  // ---- interaksi ----
  const interact = useCallback(
    (it: Interactable | null) => {
      if (!it || g.current.paused || performance.now() < g.current.resumeAt) return;
      playSound('tap', sound);
      if (it.kind === 'enter') return transitionTo('interior');
      if (it.kind === 'exit') return transitionTo('exterior');
      if (it.kind === 'npc' && npcById(it.refId)?.talk) {
        g.current.paused = true; // kunci serta-merta: elak dialog dibuka dua kali
        setModal({ type: 'talk', npcId: it.refId, page: 0 });
      }
    },
    [sound, transitionTo],
  );
  const interactRef = useRef(interact);
  interactRef.current = interact;

  const openMap = useCallback(() => {
    if (g.current.paused) return;
    playSound('tap', sound);
    setModal({ type: 'map' });
  }, [sound]);
  const openMapRef = useRef(openMap);
  openMapRef.current = openMap;

  const closeModal = useCallback(() => {
    setModal((m) => {
      if (m?.type === 'talk' && m.tutorial) markTutorialDone();
      return null;
    });
  }, []);

  // Pembukaan pertama terus di dalam (kembali dari permainan mini) juga memaparkan tutorial jika belum.
  useEffect(() => {
    if (g.current.scene === 'interior' && !devJump && !tutorialDone()) setModal({ type: 'talk', npcId: 'guru', page: 0, tutorial: true });
  }, []);

  // Modal terbuka → pergerakan dijeda, input dikosongkan. Kedudukan & arah pemain tidak diubah.
  useEffect(() => {
    const s = g.current;
    s.modal = modal?.type ?? null;
    s.talkNpc = modal && 'npcId' in modal ? modal.npcId : null;
    s.paused = modal !== null || s.transitioning;
    s.keys = { up: false, down: false, left: false, right: false };
    s.joy = { x: 0, y: 0 };
    if (!modal) {
      s.resumeAt = performance.now() + 250; // elak kekunci yang menutup modal terus membuka semula
      wrapRef.current?.focus({ preventScroll: true });
    }
  }, [modal]);

  // ---- gelung permainan ----
  useEffect(() => {
    const canvas = canvasRef.current!;
    const wrap = wrapRef.current!;
    const ctx = canvas.getContext('2d')!;
    const s = g.current;
    const colliders = buildColliders();
    const interactables = buildInteractables();
    const props = allProps().filter((p) => !FLAT_PROPS.has(p.type));
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const playerSheet = loadSheet(PLAYER_SPRITE);
    const playerSheetBig = loadSheet({ src: PLAYER_SPRITE.src, height: EXT_PLAYER_HEIGHT }); // resolusi tinggi untuk scene luar
    const ENTER_IT: Interactable = { key: 'enter', kind: 'enter', refId: 'academy', x: 0, y: 0, r: 0 };
    const npcs = NPCS.map((def, i) => ({ def, sheet: def.sprite ? loadSheet(def.sprite) : null, actionSheet: def.action ? loadSheet(def.action) : null, phase: i * 0.83, x: def.path[0].x, y: def.path[0].y, ti: 1 % def.path.length, wait: i * 0.7, facing: (def.facing || 'down') as Facing, walk: null as number | null, engaged: false }));
    const drawNpc = (n: (typeof npcs)[number], time: number) => {
      if (n.walk === null && n.actionSheet && !n.engaged && drawAction(ctx, n.actionSheet, n.x, n.y, n.facing, reduced ? 0 : time + n.phase)) return;
      if (n.sheet?.ready) {
        if (n.walk === null && n.def.talk && !reduced) {
          // animasi melahu: "bernafas" perlahan (regang menegak dari kaki)
          const k = 1 + Math.sin(time * 2.2 + n.phase * 3) * 0.018;
          ctx.save();
          ctx.translate(n.x, n.y);
          ctx.scale(1, k);
          drawSprite(ctx, n.sheet, 0, 0, n.facing, null);
          ctx.restore();
        } else drawSprite(ctx, n.sheet, n.x, n.y, n.facing, n.walk);
        return;
      }
      if (!n.sheet || n.sheet.failed) drawChibi(ctx, n.x, n.y, n.facing, n.walk, n.def.look, time);
    };
    let dpr = 1;
    if (import.meta.env.DEV) (window as unknown as { __mall: typeof s }).__mall = s; // untuk ujian e2e sahaja

    const resize = () => {
      s.vw = wrap.clientWidth;
      s.vh = wrap.clientHeight;
      dpr = Math.min(window.devicePixelRatio || 1, 2.5);
      canvas.width = Math.round(s.vw * dpr);
      canvas.height = Math.round(s.vh * dpr);
      s.zoom = computeZoom(s.vw, s.vh);
      const want = Math.min(1.75, Math.max(1, Math.round(dpr * s.zoom * 4) / 4));
      if (!s.layer || Math.abs(want - s.layerScale) > 0.2) {
        s.layer = buildStaticLayer(want);
        s.layerScale = want;
      }
      s.extL = extLayout(s.vw, s.vh);
      s.extBg = buildExteriorBackground(s.extL, dpr);
      s.petals = reduced ? [] : makePetals(s.extL);
    };
    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(wrap);

    let raf = 0;
    let last = performance.now();
    const frame = (now: number) => {
      raf = requestAnimationFrame(frame);
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;
      const time = now / 1000;
      const p = s.player;

      // ===== scene LUAR (perspektif belakang) =====
      if (s.scene === 'exterior' && s.extL && s.extBg) {
        const L = s.extL;
        const e = s.ext;
        let atGate = false;
        const auto = EXT.auto && s.extAuto.mode ? s.extAuto : null;
        if (s.paused) e.walk = null;
        else if (auto) {
          // babak automatik: berjalan sendiri, kemudian masuk / pulang
          if (auto.wait > 0) {
            // babak tunggu sehingga sprite ninja siap (elak watak muncul tiba-tiba di tengah jalan)
            if (playerSheetBig.ready || playerSheetBig.failed) auto.wait -= dt;
            e.walk = null;
          } else if (!auto.fired) {
            const intro = auto.mode === 'intro';
            const done = intro ? e.z >= EXT.autoEnterZ : e.z <= EXT.autoLeaveZ;
            if (!done) updateExterior(e, { x: 0, y: intro ? -1 : 1 }, dt, L);
            else {
              e.walk = null;
              auto.fired = true;
              s.timers.push(setTimeout(() => (intro ? transitionRef.current('interior') : leaveRef.current()), EXT.autoPause * 1000));
            }
          } else e.walk = null;
        } else atGate = updateExterior(e, inputVector(s.keys, s.joy), dt, L, facingFrom);
        const it = !s.paused && !auto && atGate ? ENTER_IT : null;
        if ((it?.key ?? null) !== s.nearKey) {
          s.nearKey = it?.key ?? null;
          s.near = it;
          setNear(it);
        }
        ctx.setTransform(1, 0, 0, 1, 0, 0);
        ctx.drawImage(s.extBg, 0, 0);
        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
        const items: { z: number; draw: () => void }[] = EXT_PROPS.map((pr) => ({ z: pr.z, draw: () => drawExtProp(ctx, L, pr, reduced ? 0 : time) }));
        items.push({
          z: e.z - 0.001,
          draw: () => {
            const pt = proj(L, e.gx, e.z);
            const h = L.playerH0 * pt.s;
            ctx.save();
            ctx.translate(pt.x, pt.y);
            if (playerSheetBig.ready) {
              const k = h / EXT_PLAYER_HEIGHT;
              ctx.scale(k, k);
              drawSprite(ctx, playerSheetBig, 0, 0, e.facing, e.walk);
            } else if (playerSheetBig.failed) {
              // watak lukisan kod HANYA jika gambar gagal dimuat (bukan semasa memuat)
              const k = h / 58;
              ctx.scale(k, k);
              drawChibi(ctx, 0, 0, e.facing, e.walk, PLAYER_LOOK, time);
            }
            ctx.restore();
          },
        });
        items.sort((a, b) => b.z - a.z); // jauh dahulu
        for (const d of items) d.draw();
        if (!reduced) drawPetals(ctx, L, s.petals, dt, time);
        return;
      }

      if (s.modal === 'game') return; // permainan mini menutup seluruh skrin — jimat bateri

      // pemain
      if (!s.paused) {
        const v = inputVector(s.keys, s.joy);
        if (v.x || v.y) {
          const next = moveWithCollision(p, v.x * MALL.playerSpeed * dt, v.y * MALL.playerSpeed * dt, colliders);
          const dist = Math.hypot(next.x - p.x, next.y - p.y);
          const moved = dist > 0.05;
          p.x = next.x;
          p.y = next.y;
          p.facing = facingFrom(v, p.facing);
          // π/2 radian = satu bingkai langkah (lihat WALK_SEQ dalam sprites.ts)
          p.walk = moved ? (p.walk ?? 0) + (dist / MALL.playerStride) * (Math.PI / 2) : null;
        } else p.walk = null;
        const it = nearestInteractable(p.x, p.y, interactables);
        if ((it?.key ?? null) !== s.nearKey) {
          s.nearKey = it?.key ?? null;
          s.near = it;
          setNear(it);
        }
      } else p.walk = null;

      // NPC
      for (const n of npcs) {
        if (n.def.path.length < 2) {
          // NPC berdiri: berpaling ke pemain bila didekati / dilayan, kemudian kembali ke arah asal
          const engaged = n.def.talk && (s.talkNpc === n.def.id || (!s.paused && s.near?.refId === n.def.id));
          n.engaged = !!engaged;
          n.facing = engaged ? facingFrom({ x: p.x - n.x, y: p.y - n.y }, n.facing) : ((n.def.facing || 'down') as Facing);
          continue;
        }
        if (n.wait > 0) {
          n.wait -= dt;
          n.walk = null;
          continue;
        }
        const tgt = n.def.path[n.ti];
        const dx = tgt.x - n.x;
        const dy = tgt.y - n.y;
        const d = Math.hypot(dx, dy);
        if (d < 2) {
          n.ti = (n.ti + 1) % n.def.path.length;
          n.wait = 1.2 + (n.ti % 3) * 0.8;
          continue;
        }
        const step = Math.min(d, (n.def.speed ?? MALL.npcSpeed) * dt);
        n.x += (dx / d) * step;
        n.y += (dy / d) * step;
        n.facing = facingFrom({ x: dx, y: dy }, n.facing);
        n.walk = (n.walk ?? 0) + (step / (n.def.stride ?? MALL.npcStride)) * (Math.PI / 2);
      }

      // kamera (ikut pemain dengan lancar, sentiasa dalam sempadan peta)
      const viewW = s.vw / s.zoom;
      const viewH = s.vh / s.zoom;
      const target = clampCamera(p.x - viewW / 2, p.y - 24 - viewH / 2, viewW, viewH);
      if (!s.cam.ready) {
        s.cam.x = target.x;
        s.cam.y = target.y;
        s.cam.ready = true;
      } else {
        const k = 1 - Math.exp(-dt * 7);
        s.cam.x += (target.x - s.cam.x) * k;
        s.cam.y += (target.y - s.cam.y) * k;
      }
      const cam = clampCamera(s.cam.x, s.cam.y, viewW, viewH);

      // lukis
      const k = dpr * s.zoom;
      ctx.setTransform(k, 0, 0, k, -Math.round(cam.x * k), -Math.round(cam.y * k));
      const L = s.layer!;
      const ls = s.layerScale;
      const sw = Math.min(viewW * ls, L.width - cam.x * ls);
      const sh = Math.min(viewH * ls, L.height - cam.y * ls);
      ctx.imageSmoothingEnabled = true;
      ctx.drawImage(L, cam.x * ls, cam.y * ls, sw, sh, cam.x, cam.y, sw / ls, sh / ls);
      for (const shop of SHOPS) {
        if (!shop.enabled) continue;
        const e = shopEntrance(shop);
        drawDoorPad(ctx, shop, time, !s.paused && Math.hypot(p.x - e.x, p.y - e.y) < shop.interactionRadius, reduced);
      }

      const m = 140;
      const inView = (x: number, y: number) => x > cam.x - m && x < cam.x + viewW + m && y > cam.y - m && y < cam.y + viewH + m * 1.5;
      const list: { y: number; draw: () => void }[] = [];
      for (const pr of props) if (inView(pr.x + pr.w / 2, pr.y + pr.h)) list.push({ y: pr.y + pr.h, draw: () => drawProp(ctx, pr, reduced ? 0 : time) });
      for (const n of npcs) if (inView(n.x, n.y)) list.push({ y: n.y, draw: () => drawNpc(n, time) });
      list.push({ y: p.y + 0.5, draw: () => drawSprite(ctx, playerSheet, p.x, p.y, p.facing, p.walk) || (playerSheet.failed && drawChibi(ctx, p.x, p.y, p.facing, p.walk, PLAYER_LOOK, time)) });
      list.sort((a, b) => a.y - b.y);
      for (const d of list) d.draw();

      drawSigns(ctx);
      const activeRef = s.paused ? null : s.near?.refId;
      for (const n of npcs) {
        if (!n.def.talk || !inView(n.x, n.y) || s.talkNpc === n.def.id) continue;
        drawTalkBubble(ctx, n.x, n.y - (n.def.sprite?.height ?? 70) - 4, activeRef === n.def.id, time, reduced);
      }
      if (activeRef === 'exit') drawUtilityMarker(ctx, MALL.exitZone.x, MALL.exitZone.y - 70, '⛩️', time, true, reduced);
    };
    raf = requestAnimationFrame(frame);

    const key = (down: boolean) => (e: KeyboardEvent) => {
      if (e.target instanceof HTMLElement && /^(INPUT|SELECT|TEXTAREA)$/.test(e.target.tagName)) return;
      const dir = KEYMAP[e.code];
      if (dir) {
        if (!s.paused) {
          s.keys[dir] = down;
          e.preventDefault();
        }
        return;
      }
      if (!down || s.paused || e.repeat) return;
      if (e.code === 'KeyE' || e.code === 'Enter' || e.code === 'Space') {
        if (e.target instanceof HTMLButtonElement) return; // biar butang yang difokus mengendalikan
        e.preventDefault();
        interactRef.current(s.near);
      } else if (e.code === 'KeyM') openMapRef.current();
    };
    const onDown = key(true);
    const onUp = key(false);
    const clear = () => (s.keys = { up: false, down: false, left: false, right: false });
    window.addEventListener('keydown', onDown);
    window.addEventListener('keyup', onUp);
    window.addEventListener('blur', clear);
    wrap.focus({ preventScroll: true });
    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      window.removeEventListener('keydown', onDown);
      window.removeEventListener('keyup', onUp);
      window.removeEventListener('blur', clear);
      savePlayer({ x: s.player.x, y: s.player.y, facing: s.player.facing });
    };
  }, []);

  // Escape menutup modal
  useEffect(() => {
    if (!modal) return undefined;
    const esc = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && modal.type !== 'game') closeModal(); // permainan mini urus Escape sendiri (rehat)
    };
    window.addEventListener('keydown', esc);
    return () => window.removeEventListener('keydown', esc);
  }, [modal, closeModal]);

  const nearLabel = near ? labelFor(near) : null;
  const mapPlayer = scene === 'exterior' ? { x: MALL.exitZone.x, y: MALL.building.y + MALL.building.h + 96 } : g.current.player;
  const playerNow = (): PlayerState => ({ x: g.current.player.x, y: g.current.player.y, facing: g.current.player.facing });

  return (
    <div className="mall-root" ref={wrapRef} tabIndex={-1}>
      <canvas ref={canvasRef} className="mall-canvas" role="img" aria-label={t(scene === 'exterior' ? 'ext.canvasLabel' : 'mall.canvasLabel')} />

      <header className="mall-hud-top">
        <div className="mall-id">
          <span className="mall-avatar">{avatarSrc ? <img src={avatarSrc} alt="" /> : <span aria-hidden="true">🥷</span>}</span>
          <span className="mall-title">{t('mall.title')}</span>
        </div>
        <div className="mall-hud-actions">
          <button type="button" className="mall-hud-btn" onClick={openMap} aria-label={t('hud.map')}>
            <MapIcon aria-hidden="true" />
            <span>{t('hud.map')}</span>
          </button>
          <button type="button" className="mall-hud-btn exit" onClick={() => !g.current.paused && !g.current.transitioning && setModal({ type: 'exit' })} aria-label={t('hud.exit')}>
            <DoorOpen aria-hidden="true" />
            <span>{t('hud.exit')}</span>
          </button>
        </div>
      </header>

      {DevPanel && scene === 'interior' && (
        <Suspense fallback={null}>
          <DevPanel
            onJump={(game: DevGame, level: number) => {
              Object.assign(g.current.player, { x: game.at.x, y: game.at.y, facing: game.at.facing, walk: null });
              g.current.cam.ready = false;
              setDevHash(`#mall/${game.key}/${level}`);
              setModal({ type: 'game', gameId: game.gameId, npcId: game.npcId, level });
            }}
          />
        </Suspense>
      )}
      {!(scene === 'exterior' && EXT.auto) && <Joystick disabled={modal !== null || fading} onChange={(v) => (g.current.joy = v)} />}
      {scene === 'exterior' && EXT.auto && !fading && !modal && (
        <button type="button" className="mall-skip" onClick={skipCutscene}>
          {t('ext.skip')} <span aria-hidden="true">⏭</span>
        </button>
      )}

      <div className="mall-live" aria-live="polite">{nearLabel && !modal && !fading ? `${t('prompt.near')}: ${nearLabel.name}` : ''}</div>
      {near && nearLabel && !modal && !fading && (
        <div className="mall-prompt" key={near.key}>
          <span className="mall-prompt-name">
            <span aria-hidden="true">{nearLabel.icon}</span> {nearLabel.name}
          </span>
          <button type="button" className={`mall-prompt-btn ${near.kind === 'exit' ? 'exit' : ''} ${near.kind === 'enter' ? 'enter' : ''}`} onClick={() => interact(near)}>
            {near.kind === 'exit' ? <DoorOpen aria-hidden="true" /> : near.kind === 'npc' ? <MessageCircle aria-hidden="true" /> : <Play aria-hidden="true" />}
            {nearLabel.action}
          </button>
        </div>
      )}
      {!(scene === 'exterior' && EXT.auto) && <p className="mall-keys-hint">{t('hud.controls')}</p>}
      <div className={`mall-fade ${fading ? 'on' : ''}`} style={{ transitionDuration: `${FADE_MS}ms` }} aria-hidden="true" />

      {modal?.type === 'talk' && npcById(modal.npcId)?.talk && (
        <TalkPanel
          npc={npcById(modal.npcId)!}
          page={modal.page}
          tutorial={!!modal.tutorial}
          onPage={(page) => setModal({ ...modal, page })}
          onClose={closeModal}
          onAction={() => {
            const npc = npcById(modal.npcId)!;
            const role = npc.talk!.role;
            if (modal.tutorial) markTutorialDone();
            if (role === 'dojo' && npc.talk!.shopId) setModal({ type: 'levels', npcId: npc.id, shopId: npc.talk!.shopId });
            else if (role === 'mission') setModal({ type: 'missions', npcId: npc.id });
            else if (role === 'reward') setModal({ type: 'rewards', npcId: npc.id });
            else closeModal();
          }}
        />
      )}

      {modal?.type === 'levels' && (
        <LevelSelect
          shopId={modal.shopId}
          npc={npcById(modal.npcId)!}
          onBack={() => setModal({ type: 'talk', npcId: modal.npcId, page: (npcById(modal.npcId)?.talk?.lines.length ?? 1) - 1 })}
          onClose={closeModal}
          onPick={(level) => {
            playSound('tap', sound);
            const gameId = DOJO_LEVELS[modal.shopId]?.[level - 1]?.gameId;
            // Permainan mini terbina dalam: dibuka di atas akademi, kedudukan pemain kekal.
            if (gameId && gameId in EMBEDDED_GAMES) return setModal({ type: 'game', gameId, npcId: modal.npcId, level });
            // Sambungan masa depan: tahap dengan gameId terus membuka permainan mini sebenar.
            if (gameId && onOpenMiniGame) onOpenMiniGame(modal.shopId, gameId, playerNow());
            else setModal({ type: 'soon', npcId: modal.npcId, shopId: modal.shopId, level });
          }}
        />
      )}

      {modal?.type === 'soon' && (() => {
        const shop = SHOPS.find((x) => x.id === modal.shopId)!;
        return (
          <Dialog title={t('soon.title')} icon="⏳" onClose={closeModal}>
            <div className="mall-preview-art" style={{ background: shop.theme.band }}>
              <span aria-hidden="true">{shop.icon}</span>
            </div>
            <p className="mall-soon-level">
              {t(shop.nameKey)} · {t('levels.level')} {modal.level}
            </p>
            <div className="mall-soon">
              <b>🥷 {t('preview.comingSoon')}</b>
              <span>{t('soon.text')}</span>
            </div>
            <div className="mall-dialog-actions">
              <button type="button" className="mall-btn light" onClick={() => setModal({ type: 'levels', npcId: modal.npcId, shopId: modal.shopId })}>
                <ChevronLeft aria-hidden="true" /> {t('soon.back')}
              </button>
              <button type="button" className="mall-btn" onClick={closeModal} autoFocus>
                {t('soon.close')}
              </button>
            </div>
          </Dialog>
        );
      })()}

      {modal?.type === 'game' && (() => {
        const Game = EMBEDDED_GAMES[modal.gameId as keyof typeof EMBEDDED_GAMES];
        return (
          <Suspense
            fallback={
              <div className="spot-root-fallback" role="status">
                {t('spot.loading')}
              </div>
            }
          >
            <Game
              key={modal.gameId}
              startLevel={modal.level}
              sound={sound}
              onExit={closeModal}
              onLevelSelect={() => {
                const shopId = npcById(modal.npcId)?.talk?.shopId;
                setModal(shopId ? { type: 'levels', npcId: modal.npcId, shopId } : null);
              }}
            />
          </Suspense>
        );
      })()}

      {modal?.type === 'missions' && (
        <Dialog title={t('missions.title')} icon="📜" onClose={closeModal}>
          <p className="mall-panel-intro">{t('missions.intro')}</p>
          <ul className="mall-missions">
            {MISSIONS.map((m) => (
              <li key={m.key}>
                <span className="mall-mission-icon" aria-hidden="true">{m.icon}</span>
                <span className="mall-mission-text">{t(m.key)}</span>
                <span className="mall-chip">{t('preview.comingSoon')}</span>
              </li>
            ))}
          </ul>
          <div className="mall-dialog-actions">
            <button type="button" className="mall-btn" onClick={closeModal} autoFocus>
              {t('talk.close')}
            </button>
          </div>
        </Dialog>
      )}

      {modal?.type === 'rewards' && (
        <Dialog title={t('rewards.title')} icon="🎁" onClose={closeModal} wide>
          <p className="mall-reward-banner">✨ {t('rewards.banner')}</p>
          <ul className="mall-rewards">
            {REWARDS.map((r) => (
              <li key={r.key}>
                <span className="mall-reward-art" aria-hidden="true">
                  {r.icon}
                  <i>
                    <Lock />
                  </i>
                </span>
                <b>{t(r.key)}</b>
                <span className="mall-chip">{t(`rewards.cat.${r.cat}`)}</span>
                <span className="mall-sr">{t('levels.locked')}</span>
              </li>
            ))}
          </ul>
          <div className="mall-dialog-actions">
            <button type="button" className="mall-btn" onClick={closeModal} autoFocus>
              {t('talk.close')}
            </button>
          </div>
        </Dialog>
      )}

      {modal?.type === 'map' && (
        <Dialog title={t('map.title')} icon="🗺️" onClose={closeModal} wide>
          <MallMap layer={g.current.layer} player={mapPlayer} />
          <p className="mall-map-hint">👆 {t('map.hint')}</p>
          <div className="mall-dialog-actions">
            <button type="button" className="mall-btn light" onClick={closeModal} autoFocus>
              {t('preview.close')}
            </button>
          </div>
        </Dialog>
      )}

      {modal?.type === 'exit' && (
        <Dialog title={t('exit.title')} icon="⛩️" onClose={closeModal}>
          <p className="mall-preview-desc">{t('exit.text')}</p>
          <div className="mall-dialog-actions">
            <button type="button" className="mall-btn light" onClick={closeModal} autoFocus>
              {t('exit.no')}
            </button>
            <button type="button" className="mall-btn exit" onClick={onBack}>
              <DoorOpen aria-hidden="true" /> {t('exit.yes')}
            </button>
          </div>
        </Dialog>
      )}
    </div>
  );
}

function labelFor(it: Interactable) {
  if (it.kind === 'npc') {
    const n = npcById(it.refId);
    return { name: n?.talk ? t(n.talk.nameKey) : '', icon: '💬', action: t('prompt.talk') };
  }
  if (it.kind === 'enter') return { name: t('ext.name'), icon: '⛩️', action: t('prompt.enterAcademy') };
  return { name: t('map.entrance'), icon: '⛩️', action: t('prompt.exit') };
}

// ---------- Dialog NPC (Fasa 2) ----------
/** Potret kepala & bahu NPC daripada bingkai berdiri sprite sheet (warna tukar ikut sekali). */
function NpcPortrait({ npc, size = 84 }: { npc: NpcDef; size?: number }) {
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    if (!npc.sprite) return undefined;
    const sheet: Sheet = loadSheet(npc.sprite);
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
      // potong 62% atas (kepala + bahu), muat lebar kanvas
      const cropH = f.cv.height * 0.62;
      const scale = Math.min(cv.width / f.cv.width, cv.height / cropH) * 1.08;
      const dw = f.cv.width * scale;
      c.imageSmoothingQuality = 'high';
      c.drawImage(f.cv, 0, 0, f.cv.width, cropH, (cv.width - dw) / 2, cv.height - cropH * scale + 4, dw, cropH * scale);
    };
    paint();
    return () => cancelAnimationFrame(raf);
  }, [npc]);
  return <canvas ref={ref} className="mall-portrait" width={size * 2} height={size * 2} style={{ width: size, height: size }} aria-hidden="true" />;
}

function TalkPanel({ npc, page, tutorial, onPage, onClose, onAction }: { npc: NpcDef; page: number; tutorial: boolean; onPage: (p: number) => void; onClose: () => void; onAction: () => void }) {
  const talk = npc.talk!;
  const last = talk.lines.length - 1;
  const p = Math.min(page, last);
  const isLast = p === last;
  const primaryLabel = !isLast ? t('talk.next') : talk.role === 'dojo' ? t('talk.startTraining') : talk.role === 'mission' ? t('talk.viewMissions') : talk.role === 'reward' ? t('talk.viewRewards') : t('talk.done');
  const primary = useCallback(() => (isLast ? onAction() : onPage(p + 1)), [isLast, onAction, onPage, p]);
  const primaryRef = useRef(primary);
  primaryRef.current = primary;
  const id = `mall-talk-${npc.id}`;

  // Papan kekunci: E = teruskan, ← = kembali (Enter/Space dikendalikan oleh butang yang difokus)
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.repeat) return;
      if (e.code === 'KeyE') {
        e.preventDefault();
        primaryRef.current();
      } else if (e.code === 'ArrowLeft' && p > 0) onPage(p - 1);
      else if (e.code === 'ArrowRight' && !isLast) onPage(p + 1);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [p, isLast, onPage]);

  return (
    <div className="mall-talk-layer">
      <section className="mall-talk" role="dialog" aria-modal="true" aria-labelledby={id}>
        <div className="mall-talk-portrait">
          <NpcPortrait npc={npc} />
        </div>
        <div className="mall-talk-main">
          <header className="mall-talk-head">
            <h2 id={id} className="mall-talk-name">{t(talk.nameKey)}</h2>
            {tutorial && !isLast && (
              <button type="button" className="mall-talk-skip" onClick={onClose}>
                {t('talk.skip')} <span aria-hidden="true">⏭</span>
              </button>
            )}
            <button type="button" className="mall-dialog-x" onClick={onClose} aria-label={t('talk.close')}>
              <X aria-hidden="true" />
            </button>
          </header>
          <p className="mall-talk-text" key={p} aria-live="polite">
            {t(talk.lines[p])}
          </p>
          <div className="mall-talk-foot">
            <span className="mall-talk-dots" aria-label={`${t('talk.page')} ${p + 1} / ${last + 1}`}>
              {talk.lines.map((_, i) => (
                <i key={i} className={i === p ? 'on' : ''} />
              ))}
            </span>
            {p > 0 && (
              <button type="button" className="mall-btn light" onClick={() => onPage(p - 1)}>
                <ChevronLeft aria-hidden="true" /> {t('talk.back')}
              </button>
            )}
            {isLast && talk.role !== 'guide' && (
              <button type="button" className="mall-btn light" onClick={onClose}>
                {t('talk.close')}
              </button>
            )}
            <button type="button" className={`mall-btn ${isLast && talk.role === 'dojo' ? 'go' : ''}`} onClick={primary} autoFocus key={`b${p}`}>
              {primaryLabel} {!isLast && <ChevronRight aria-hidden="true" />}
              {isLast && talk.role === 'dojo' && <Play aria-hidden="true" />}
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}

// ---------- Pemilihan tahap (satu panel untuk semua dojo) ----------
function LevelSelect({ shopId, npc, onBack, onClose, onPick }: { shopId: string; npc: NpcDef; onBack: () => void; onClose: () => void; onPick: (level: number) => void }) {
  const shop = SHOPS.find((s) => s.id === shopId)!;
  const levels = DOJO_LEVELS[shopId] ?? [];
  const [lockedMsg, setLockedMsg] = useState<number | null>(null);
  return (
    <Dialog title={t(shop.nameKey)} icon={shop.icon} onClose={onClose} wide>
      <div className="mall-levels-head">
        <NpcPortrait npc={npc} size={56} />
        <div>
          <b>{t('levels.title')}</b>
          <span>{t('levels.pick')}</span>
        </div>
      </div>
      <ul className="mall-levels">
        {levels.map((lv) => {
          const open = isLevelUnlocked(shopId, lv.n);
          const stars = levelStars(shopId, lv.n);
          return (
            <li key={lv.n}>
              <button
                type="button"
                className={`mall-level ${open ? 'open' : 'locked'} ${lockedMsg === lv.n ? 'shake' : ''}`}
                aria-disabled={!open}
                aria-label={`${t('levels.level')} ${lv.n}${open ? '' : ` — ${t('levels.locked')}`}`}
                onClick={() => (open ? onPick(lv.n) : setLockedMsg(lv.n))}
                onAnimationEnd={() => setLockedMsg((m) => (m === lv.n ? -1 : m))}
                autoFocus={lv.n === 1}
              >
                <span className="mall-level-num">{open ? lv.n : <Lock aria-hidden="true" />}</span>
                <span className="mall-level-label">
                  {t('levels.level')} {lv.n}
                </span>
                <span className="mall-level-stars" aria-hidden="true">
                  {[0, 1, 2].map((i) => (
                    <Star key={i} className={i < stars ? 'on' : ''} />
                  ))}
                </span>
              </button>
            </li>
          );
        })}
      </ul>
      <p className="mall-levels-msg" aria-live="polite">{lockedMsg !== null ? `🔒 ${t('levels.lockedHint')}` : ''}</p>
      <div className="mall-dialog-actions">
        <button type="button" className="mall-btn light" onClick={onBack}>
          <ChevronLeft aria-hidden="true" /> {t('levels.back')}
        </button>
      </div>
    </Dialog>
  );
}

// ---------- Joystick ----------
function Joystick({ disabled, onChange }: { disabled: boolean; onChange: (v: Point) => void }) {
  const baseRef = useRef<HTMLDivElement>(null);
  const knobRef = useRef<HTMLSpanElement>(null);
  const pointer = useRef<number | null>(null);
  const R = 46;

  const set = (x: number, y: number) => {
    if (knobRef.current) knobRef.current.style.transform = `translate(${x}px, ${y}px)`;
    onChange({ x: x / R, y: y / R });
  };
  const reset = () => {
    pointer.current = null;
    set(0, 0);
    baseRef.current?.classList.remove('active');
  };
  const track = (e: React.PointerEvent) => {
    const r = baseRef.current!.getBoundingClientRect();
    let dx = e.clientX - (r.left + r.width / 2);
    let dy = e.clientY - (r.top + r.height / 2);
    const len = Math.hypot(dx, dy);
    if (len > R) {
      dx = (dx / len) * R;
      dy = (dy / len) * R;
    }
    set(dx, dy);
  };
  useEffect(() => {
    if (disabled) reset();
  }, [disabled]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div
      ref={baseRef}
      className="mall-joystick"
      role="application"
      aria-label={t('joystick.label')}
      onPointerDown={(e) => {
        if (disabled || pointer.current !== null) return;
        e.preventDefault();
        pointer.current = e.pointerId;
        e.currentTarget.setPointerCapture(e.pointerId);
        baseRef.current?.classList.add('active');
        track(e);
      }}
      onPointerMove={(e) => {
        if (pointer.current === e.pointerId) track(e);
      }}
      onPointerUp={(e) => pointer.current === e.pointerId && reset()}
      onPointerCancel={(e) => pointer.current === e.pointerId && reset()}
      onLostPointerCapture={(e) => pointer.current === e.pointerId && reset()}
    >
      <span ref={knobRef} className="mall-joystick-knob" />
    </div>
  );
}

// ---------- Dialog ----------
function Dialog({ title, icon, onClose, wide, children }: { title: string; icon: string; onClose: () => void; wide?: boolean; children: React.ReactNode }) {
  const id = `mall-dlg-${title.replace(/\W+/g, '-')}`;
  return (
    <div className="mall-backdrop" onPointerDown={(e) => e.target === e.currentTarget && onClose()}>
      <section className={`mall-dialog ${wide ? 'wide' : ''}`} role="dialog" aria-modal="true" aria-labelledby={id}>
        <header className="mall-dialog-head">
          <span className="mall-dialog-icon" aria-hidden="true">{icon}</span>
          <h2 id={id}>{title}</h2>
          <button type="button" className="mall-dialog-x" onClick={onClose} aria-label={t('preview.close')}>
            <X aria-hidden="true" />
          </button>
        </header>
        <div className="mall-dialog-body">{children}</div>
      </section>
    </div>
  );
}

// ---------- Peta ----------
function MallMap({ layer, player }: { layer: HTMLCanvasElement | null; player: { x: number; y: number } }) {
  const ref = useRef<HTMLCanvasElement>(null);
  const W = MALL.world;
  useEffect(() => {
    const cv = ref.current;
    if (!cv || !layer) return;
    const c = cv.getContext('2d')!;
    c.setTransform(1, 0, 0, 1, 0, 0);
    c.clearRect(0, 0, cv.width, cv.height);
    c.drawImage(layer, 0, 0, layer.width, layer.height, 0, 0, cv.width, cv.height);
    const s = cv.width / W.w;
    c.setTransform(s, 0, 0, s, 0, 0);
    const props = allProps()
      .filter((p) => !FLAT_PROPS.has(p.type))
      .sort((a, b) => a.y + a.h - (b.y + b.h));
    for (const shop of SHOPS) drawDoorPad(c, shop, 0, false, true);
    for (const p of props) drawProp(c, p, 0);
    drawSigns(c);
  }, [layer, W.w]);
  const pct = (x: number, y: number) => ({ left: `${(x / W.w) * 100}%`, top: `${(y / W.h) * 100}%` });
  return (
    <div className="mall-map">
      <canvas ref={ref} width={720} height={Math.round((720 * W.h) / W.w)} aria-hidden="true" />
      {SHOPS.map((shop) => (
        <span key={shop.id} className="mall-map-label" style={pct(shop.bounds.x + shop.bounds.w / 2, shop.bounds.y + shop.bounds.h / 2 + 10)}>
          <span aria-hidden="true">{shop.icon}</span> {t(shop.nameKey)}
        </span>
      ))}
      {UTILITIES.map((u) => (
        <span key={u.id} className="mall-map-label icon" style={pct(u.position.x, u.position.y - 40)} title={t(u.nameKey)}>
          <span aria-hidden="true">{u.icon}</span>
          <span className="mall-sr">{t(u.nameKey)}</span>
        </span>
      ))}
      <span className="mall-map-label exit" style={pct(MALL.exitZone.x, MALL.building.y + MALL.building.h + 44)}>
        ⛩️ {t('map.entrance')}
      </span>
      <span className="mall-map-player" style={pct(player.x, player.y)}>
        <i />
        <b>{t('map.youAreHere')}</b>
      </span>
    </div>
  );
}
