// Pengurus pesanan + sesi permainan Sushi Master Ninja (tulen: tiada DOM / React / masa sebenar).
// Semua masa dimajukan melalui tick(dt) — bebas daripada kadar bingkai, boleh dijeda, dan deterministik
// (pesanan datang daripada konfigurasi tahap, bukan rawak) untuk ujian & mod nyahpepijat.
import { IngredientBuilder } from './builder.ts';
import type { TapResult } from './builder.ts';
import { RECIPES } from './recipes.ts';
import type { IngredientId } from './recipes.ts';
import { SquareTrack } from './conveyor.ts';
import { LOAD_POINT, SEATS, TRACK } from './layout.ts';
import type { SeatDef } from './layout.ts';
import type { SushiLevel } from './levels.ts';

/** Tempoh animasi (saat). */
export const TIMING = { arrive: 0.5, roll: 1.4, slide: 0.45, eat: 1.3, leave: 0.5, respawn: 0.6, firstDelay: 0.4 };
/** Kelajuan tali sawat (unit pentas / saat). */
export const BELT_SPEED = 105;

export type OrderStatus = 'waiting' | 'rolling' | 'sent' | 'eating' | 'done';

export interface Order {
  id: number;
  /** Indeks dalam level.orders (untuk pilihan watak pelanggan yang deterministik). */
  index: number;
  recipeId: string;
  seatId: string;
  status: OrderStatus;
}

export type SeatPhase = 'empty' | 'arriving' | 'seated' | 'eating' | 'leaving';

export interface SeatState {
  def: SeatDef;
  phase: SeatPhase;
  t: number;
  orderId: number | null;
  cooldown: number;
  /** s pada trek di mana pinggan untuk tempat duduk ini berhenti. */
  beltS: number;
}

export interface Plate {
  id: number;
  orderId: number;
  seatId: string;
  recipeId: string;
  phase: 'moving' | 'sliding';
  s: number;
  remaining: number;
  t: number;
}

export type SessionEvent =
  | { type: 'correct'; ing: IngredientId }
  | { type: 'wrong'; ing: IngredientId; expected: IngredientId | null }
  | { type: 'noOrder' }
  | { type: 'complete'; orderId: number }
  | { type: 'sent'; orderId: number }
  | { type: 'served'; orderId: number; seatId: string }
  | { type: 'levelDone' };

export class SushiSession {
  readonly level: SushiLevel;
  readonly track = new SquareTrack(TRACK);
  readonly loadS: number;
  readonly builder = new IngredientBuilder();
  seats: SeatState[];
  orders: Order[] = [];
  plates: Plate[] = [];
  selectedId: number | null = null;
  /** Pesanan yang sedang digulung di meja bawah. */
  rollingOrderId: number | null = null;
  rollT = 0;
  nextIndex = 0;
  served = 0;
  wrong = 0;
  correct = 0;
  hintsUsed = 0;
  elapsed = 0;
  /** Masa (saat) bermula dari pemaparan petunjuk; null = tiada. */
  hintT: number | null = null;
  finished = false;
  private finishT: number | null = null;
  /** Dinaikkan setiap kali keadaan diskret berubah (UI boleh render semula hanya bila perlu). */
  version = 0;
  events: SessionEvent[] = [];
  private ids = 1;

  constructor(level: SushiLevel) {
    this.level = level;
    this.loadS = this.track.nearestS(LOAD_POINT);
    this.seats = level.seats.map((id, i) => {
      const def = SEATS[id];
      if (!def) throw new Error(`Tempat duduk tidak wujud: ${id}`);
      return { def, phase: 'empty', t: 0, orderId: null, cooldown: TIMING.firstDelay + i * 0.6, beltS: this.track.nearestS(def.belt) };
    });
  }

  get total() {
    return this.level.orders.length;
  }
  get selected(): Order | null {
    return this.orders.find((o) => o.id === this.selectedId) ?? null;
  }
  get activeCount() {
    return this.orders.filter((o) => o.status !== 'done').length;
  }
  /** Pesanan yang dipaparkan sebagai kad (menunggu / digulung / dalam perjalanan). */
  get openOrders() {
    return this.orders.filter((o) => o.status === 'waiting' || o.status === 'rolling' || o.status === 'sent');
  }

  private emit(e: SessionEvent) {
    this.events.push(e);
    this.version++;
  }
  drain(): SessionEvent[] {
    const e = this.events;
    this.events = [];
    return e;
  }

  // ---------- tindakan pemain ----------
  select(orderId: number) {
    const o = this.orders.find((x) => x.id === orderId);
    if (!o || o.status !== 'waiting' || this.builder.locked) return;
    this.selectedId = o.id;
    this.builder.setRecipe(RECIPES[o.recipeId]);
    this.version++;
  }

  tapIngredient(id: IngredientId): TapResult {
    if (this.finished) return 'locked';
    this.ensureSelection();
    const res = this.builder.tap(id);
    if (res === 'correct' || res === 'complete') {
      this.correct++;
      this.hintT = null;
      this.emit({ type: 'correct', ing: id });
      if (res === 'complete' && this.selected) {
        this.selected.status = 'rolling';
        this.rollingOrderId = this.selected.id;
        this.rollT = 0;
        this.emit({ type: 'complete', orderId: this.selected.id });
      }
    } else if (res === 'wrong') {
      this.wrong++;
      this.emit({ type: 'wrong', ing: id, expected: this.builder.expected });
    } else if (res === 'noOrder') this.emit({ type: 'noOrder' });
    return res;
  }

  undo() {
    if (this.builder.undo()) this.version++;
  }
  restartSushi() {
    if (this.builder.restart()) this.version++;
  }
  useHint(): boolean {
    if (this.hintsUsed >= this.level.hints || !this.builder.expected) return false;
    this.hintsUsed++;
    this.hintT = 0;
    this.version++;
    return true;
  }

  /** Bahan yang perlu ditonjolkan (tahap berpandu, atau semasa petunjuk aktif). */
  get highlight(): IngredientId | null {
    if (this.builder.locked) return null;
    if (this.level.guided || this.hintT !== null) return this.builder.expected;
    return null;
  }

  // ---------- masa ----------
  tick(dtIn: number) {
    const dt = Math.max(0, Math.min(dtIn, 0.1));
    if (this.finished) return;
    this.elapsed += dt;
    if (this.hintT !== null && (this.hintT += dt) > 2.5) {
      this.hintT = null;
      this.version++;
    }

    // tempat duduk: datang / makan / pergi / isi semula
    for (const seat of this.seats) {
      seat.t += dt;
      if (seat.phase === 'empty') {
        seat.cooldown -= dt;
        if (seat.cooldown <= 0 && this.nextIndex < this.total && this.activeCount < this.level.maxActive) this.spawn(seat);
      } else if (seat.phase === 'arriving' && seat.t >= TIMING.arrive) this.setSeat(seat, 'seated');
      else if (seat.phase === 'eating' && seat.t >= TIMING.eat) this.setSeat(seat, 'leaving');
      else if (seat.phase === 'leaving' && seat.t >= TIMING.leave) {
        const o = this.orders.find((x) => x.id === seat.orderId);
        if (o) o.status = 'done';
        seat.orderId = null;
        seat.cooldown = TIMING.respawn;
        this.setSeat(seat, 'empty');
      }
    }

    // gulung di meja bawah → pindah ke tali sawat
    if (this.rollingOrderId !== null) {
      this.rollT += dt;
      if (this.rollT >= TIMING.roll) {
        const o = this.orders.find((x) => x.id === this.rollingOrderId)!;
        const seat = this.seats.find((s) => s.def.id === o.seatId)!;
        o.status = 'sent';
        this.plates.push({ id: this.ids++, orderId: o.id, seatId: o.seatId, recipeId: o.recipeId, phase: 'moving', s: this.loadS, remaining: this.track.forward(this.loadS, seat.beltS) || this.track.length, t: 0 });
        this.rollingOrderId = null;
        this.builder.clear();
        this.selectedId = null;
        this.emit({ type: 'sent', orderId: o.id });
      }
    }

    // pinggan bergerak di sepanjang 4 sisi tali sawat
    for (const p of this.plates) {
      if (p.phase === 'moving') {
        const step = Math.min(p.remaining, BELT_SPEED * dt);
        p.s = (p.s + step) % this.track.length;
        p.remaining -= step;
        if (p.remaining <= 0.001) {
          p.phase = 'sliding';
          p.t = 0;
          this.version++;
        }
      } else {
        p.t += dt;
      }
    }
    for (const p of this.plates.filter((q) => q.phase === 'sliding' && q.t >= TIMING.slide)) {
      const o = this.orders.find((x) => x.id === p.orderId)!;
      const seat = this.seats.find((s) => s.def.id === p.seatId)!;
      o.status = 'eating';
      this.served++;
      this.setSeat(seat, 'eating');
      this.emit({ type: 'served', orderId: o.id, seatId: seat.def.id });
    }
    this.plates = this.plates.filter((q) => !(q.phase === 'sliding' && q.t >= TIMING.slide));

    this.ensureSelection();

    // tamat bila semua pesanan dihidang (selepas reaksi gembira pelanggan terakhir)
    if (this.served >= this.total) {
      this.finishT = (this.finishT ?? 0) + dt;
      if (this.finishT >= TIMING.eat * 0.8 && !this.finished) {
        this.finished = true;
        this.emit({ type: 'levelDone' });
      }
    }
  }

  private spawn(seat: SeatState) {
    const index = this.nextIndex++;
    const o: Order = { id: this.ids++, index, recipeId: this.level.orders[index], seatId: seat.def.id, status: 'waiting' };
    if (!RECIPES[o.recipeId]) throw new Error(`Resipi tidak wujud: ${o.recipeId}`);
    this.orders.push(o);
    seat.orderId = o.id;
    this.setSeat(seat, 'arriving');
  }

  private setSeat(seat: SeatState, phase: SeatPhase) {
    seat.phase = phase;
    seat.t = 0;
    this.version++;
  }

  /** Pilih pesanan menunggu yang paling lama jika tiada pilihan sah. */
  private ensureSelection() {
    if (this.builder.locked) return;
    const cur = this.selected;
    if (cur && cur.status === 'waiting') return;
    const next = this.orders.find((o) => o.status === 'waiting') ?? null;
    if ((next?.id ?? null) !== this.selectedId) {
      this.selectedId = next?.id ?? null;
      this.builder.setRecipe(next ? RECIPES[next.recipeId] : null);
      this.version++;
    }
  }
}

/** Bintang: 3★ = salah ≤ three, 2★ = salah ≤ two, 1★ = selesai. Kesilapan tidak pernah menghalang penyelesaian. */
export function sushiStars(level: Pick<SushiLevel, 'starRules'>, wrong: number): 1 | 2 | 3 {
  if (wrong <= level.starRules.three) return 3;
  if (wrong <= level.starRules.two) return 2;
  return 1;
}
