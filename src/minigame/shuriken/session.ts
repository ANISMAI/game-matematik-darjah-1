// Sesi Shuriken Master (tulen & deterministik; dimajukan dengan tick(dt) — boleh dijeda, bebas kadar bingkai).
// Satu shuriken sahaja di udara pada satu masa; balingan seterusnya dikunci sehingga animasi kena/tersasar tamat.
import type { ShurikenLevel, TargetDef } from './levels.ts';
import { HAND, THROW_SPEED, accuracy, aimDir, rayHit, targetPos } from './physics.ts';
import type { Pt, RayHit } from './physics.ts';

export const SHU_TIMING = { cooldown: 0.35, finish: 0.8, hint: 3.2, wobble: 0.5 };
/** Skor ikut gelang papan (jarak dari pusat ÷ jejari). */
export const SCORE = { outer: 100, inner: 120, bull: 150, bullRadius: 0.25, innerRadius: 0.6 };
export type Ring = 'bull' | 'inner' | 'outer';

export type ShuEvent =
  | { type: 'throw' }
  | { type: 'hit'; targetId: string; ring: Ring; points: number; point: Pt }
  | { type: 'wrong'; targetId: string; point: Pt }
  | { type: 'miss'; point: Pt }
  | { type: 'levelDone' };

export interface Flight {
  dir: Pt;
  result: RayHit;
  t: number;
  duration: number;
}

/** Shuriken yang melekat pada papan (ikut papan bergerak). */
export interface Stuck {
  targetId: string;
  dx: number;
  dy: number;
  rot: number;
}

export class ShurikenSession {
  readonly level: ShurikenLevel;
  time = 0;
  throws = 0;
  hits = 0;
  wrong = 0;
  score = 0;
  hintsUsed = 0;
  hintT: number | null = null;
  hintTarget: string | null = null;
  flight: Flight | null = null;
  cooldown = 0;
  down = new Set<string>();
  stuck: Stuck[] = [];
  /** Papan yang bergoyang (kena sasaran salah) → masa mula. */
  wobble = new Map<string, number>();
  finished = false;
  private finishT: number | null = null;
  events: ShuEvent[] = [];
  version = 0;

  constructor(level: ShurikenLevel) {
    this.level = level;
  }

  get misses() {
    return this.throws - this.hits;
  }
  get accuracy() {
    return accuracy(this.hits, this.throws);
  }
  get canThrow() {
    return !this.finished && !this.flight && this.cooldown <= 0 && this.hits < this.level.requiredHits;
  }
  isValid(t: TargetDef) {
    return !this.level.validCue || t.cue === this.level.validCue;
  }
  /** Papan yang masih boleh dikena (papan sah yang sudah jatuh tidak menghalang lagi). */
  alive = (id: string) => !this.down.has(id);

  private emit(e: ShuEvent) {
    this.events.push(e);
    this.version++;
  }
  drain() {
    const e = this.events;
    this.events = [];
    return e;
  }

  /** Pratonton: sama tepat dengan balingan jika dilepaskan sekarang. */
  preview(aim: Pt): { dir: Pt; hit: RayHit } | null {
    const dir = aimDir(aim);
    if (!dir) return null;
    return { dir, hit: rayHit(aim, this.level.targets, this.alive, this.time, this.level.aimAssist) };
  }

  /** Baling ke arah titik bidik. Pulangkan false jika tidak dibenarkan (sedang terbang / tidak sah). */
  throwAt(aim: Pt): boolean {
    if (!this.canThrow) return false;
    const p = this.preview(aim);
    if (!p) return false;
    this.flight = { dir: p.dir, result: p.hit, t: 0, duration: Math.max(0.12, p.hit.dist / THROW_SPEED) };
    this.throws++;
    this.hintT = null;
    this.hintTarget = null;
    this.emit({ type: 'throw' });
    return true;
  }

  useHint(): boolean {
    if (this.hintsUsed >= this.level.hints || this.finished) return false;
    const cand = this.level.targets.filter((t) => this.isValid(t) && this.alive(t.id));
    if (!cand.length) return false;
    // sasaran sah paling dekat dengan tangan (paling mudah)
    cand.sort((a, b) => targetPos(b, this.time).y - targetPos(a, this.time).y);
    this.hintTarget = cand[0].id;
    this.hintT = 0;
    this.hintsUsed++;
    this.version++;
    return true;
  }

  /** Kedudukan shuriken yang sedang terbang. */
  flightPos(): (Pt & { progress: number }) | null {
    if (!this.flight) return null;
    const f = this.flight;
    const k = Math.min(1, f.t / f.duration);
    const end = f.result.point;
    const sx = HAND.x;
    const sy = HAND.y;
    return { x: sx + (end.x - sx) * k, y: sy + (end.y - sy) * k, progress: k };
  }

  tick(dtIn: number) {
    const dt = Math.max(0, Math.min(dtIn, 0.1));
    if (this.finished) return;
    this.time += dt;
    if (this.cooldown > 0) this.cooldown -= dt;
    if (this.hintT !== null && (this.hintT += dt) > SHU_TIMING.hint) {
      this.hintT = null;
      this.hintTarget = null;
      this.version++;
    }
    for (const [id, t0] of this.wobble) if (this.time - t0 > SHU_TIMING.wobble) this.wobble.delete(id);

    if (this.flight) {
      this.flight.t += dt;
      if (this.flight.t >= this.flight.duration) this.resolve();
    }

    if (this.hits >= this.level.requiredHits && !this.flight) {
      this.finishT = (this.finishT ?? 0) + dt;
      if (this.finishT >= SHU_TIMING.finish) {
        this.finished = true;
        this.emit({ type: 'levelDone' });
      }
    }
  }

  private resolve() {
    const r = this.flight!.result;
    this.flight = null;
    this.cooldown = SHU_TIMING.cooldown;
    const t = r.target;
    if (t && this.isValid(t)) {
      const p = targetPos(t, this.time);
      this.down.add(t.id);
      this.hits++;
      const ring: Ring = r.centre <= SCORE.bullRadius ? 'bull' : r.centre <= SCORE.innerRadius ? 'inner' : 'outer';
      const points = SCORE[ring];
      this.score += points;
      this.stuck.push({ targetId: t.id, dx: r.point.x - p.x, dy: r.point.y - p.y, rot: this.time * 7 });
      this.emit({ type: 'hit', targetId: t.id, ring, points, point: r.point });
    } else if (t) {
      this.wrong++;
      this.wobble.set(t.id, this.time);
      this.emit({ type: 'wrong', targetId: t.id, point: r.point });
    } else this.emit({ type: 'miss', point: r.point });
  }
}
