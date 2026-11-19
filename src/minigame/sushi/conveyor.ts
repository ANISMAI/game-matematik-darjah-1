// Trek tali sawat: segi empat TERTUTUP 4 sisi dengan bucu bulat, diparameter mengikut panjang lengkok s.
// Arah ikut jam (skrin): atas → kanan, kanan ↓, bawah ←, kiri ↑. Tulen (tiada DOM) — diuji secara unit.

export interface Rect {
  x: number;
  y: number;
  w: number;
  h: number;
  r: number;
}

export interface TrackPoint {
  x: number;
  y: number;
  /** arah gerakan (radian) */
  angle: number;
}

export class SquareTrack {
  readonly length: number;
  readonly rect: Rect;
  private readonly seg: number[];

  constructor(rect: Rect) {
    this.rect = rect;
    const { w, h, r } = rect;
    const arc = (Math.PI * r) / 2;
    // atas, bucu KA, kanan, bucu KB, bawah, bucu KiB, kiri, bucu KiA
    this.seg = [w - 2 * r, arc, h - 2 * r, arc, w - 2 * r, arc, h - 2 * r, arc];
    this.length = this.seg.reduce((a, b) => a + b, 0);
  }

  /** Titik pada trek di jarak s (dibalut ke [0, length)). s = 0 di hujung kiri sisi atas. */
  pointAt(sIn: number): TrackPoint {
    const { x, y, w, h, r } = this.rect;
    let s = ((sIn % this.length) + this.length) % this.length;
    const corners = [
      { cx: x + w - r, cy: y + r, a0: -Math.PI / 2 }, // kanan atas
      { cx: x + w - r, cy: y + h - r, a0: 0 }, // kanan bawah
      { cx: x + r, cy: y + h - r, a0: Math.PI / 2 }, // kiri bawah
      { cx: x + r, cy: y + r, a0: Math.PI }, // kiri atas
    ];
    const straights = [
      { x0: x + r, y0: y, dx: 1, dy: 0 },
      { x0: x + w, y0: y + r, dx: 0, dy: 1 },
      { x0: x + w - r, y0: y + h, dx: -1, dy: 0 },
      { x0: x, y0: y + h - r, dx: 0, dy: -1 },
    ];
    for (let i = 0; i < 8; i++) {
      const len = this.seg[i];
      if (s <= len || i === 7) {
        const k = i >> 1;
        if (i % 2 === 0) {
          const st = straights[k];
          return { x: st.x0 + st.dx * s, y: st.y0 + st.dy * s, angle: Math.atan2(st.dy, st.dx) };
        }
        const c = corners[k];
        const a = c.a0 + Math.min(s, len) / r;
        return { x: c.cx + Math.cos(a) * r, y: c.cy + Math.sin(a) * r, angle: a + Math.PI / 2 };
      }
      s -= len;
    }
    return { x, y, angle: 0 };
  }

  /** s bagi titik trek yang paling hampir dengan p. */
  nearestS(p: { x: number; y: number }, step = 1): number {
    let best = 0;
    let bd = Infinity;
    for (let s = 0; s < this.length; s += step) {
      const q = this.pointAt(s);
      const d = (q.x - p.x) ** 2 + (q.y - p.y) ** 2;
      if (d < bd) {
        bd = d;
        best = s;
      }
    }
    return best;
  }

  /** Jarak ke hadapan (arah ikut jam) dari s0 ke s1. */
  forward(s0: number, s1: number): number {
    return (((s1 - s0) % this.length) + this.length) % this.length;
  }
}
