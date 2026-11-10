import { useLayoutEffect, useRef, useState } from 'react';
import { Hand } from './GameArt.jsx';

// Kenali Nombor: surih nombor dengan memandu kereta di atas jalan raya berbentuk nombor.
// Jalan asfalt dengan garis tengah putus-putus dan anak panah. Murid letak jari pada kereta merah dan pandu ikut
// jalan; kereta hanya maju bila jari dekat dengan jalan dan tidak boleh melompat jauh ke depan (tidak boleh potong
// jalan, contohnya pada simpang nombor 8). Jejak kuning menunjukkan jalan yang sudah dilalui.
// Lampu isyarat merah di hujung setiap strok = tempat berhenti. Nombor dua strok (4, 5, 10): angkat jari di lampu
// merah, kemudian sambung di bulatan hijau bernombor. Di bawah ada kereta sebanyak nombor itu.
// Tiada jawapan salah: bila semua strok siap, lampu bertukar hijau dan soalan selesai.

const OUT = '#3b2a1a';
const VIEW_W = 1000;
const VIEW_H = 712;

const ONES = ['sifar', 'satu', 'dua', 'tiga', 'empat', 'lima', 'enam', 'tujuh', 'lapan', 'sembilan'];
// Sebutan nombor 0 hingga 100 dalam Bahasa Melayu.
export function wordFor(n) {
  if (n < 10) return ONES[n];
  if (n === 10) return 'sepuluh';
  if (n === 11) return 'sebelas';
  if (n < 20) return `${ONES[n - 10]} belas`;
  if (n === 100) return 'seratus';
  const t = Math.floor(n / 10);
  const o = n % 10;
  return o ? `${ONES[t]} puluh ${ONES[o]}` : `${ONES[t]} puluh`;
}
const tensOnes = (n) => [Math.floor(n / 10), n % 10];

// Garis tengah setiap digit dalam kotak 260 x 410 (y 20 hingga 392). Satu rentetan = satu strok, ikut susunan surih.
// x: julat mendatar yang kelihatan (untuk memusatkan digit).
const GLYPHS = {
  0: { x: [35, 225], strokes: ['M130 22 C65 22 35 100 35 205 C35 310 65 390 130 390 C195 390 225 310 225 205 C225 100 195 22 130 22'] },
  1: { x: [80, 150], strokes: ['M80 95 L150 25 L150 390'] },
  2: { x: [42, 232], strokes: ['M45 115 C45 50 92 22 138 22 C196 22 228 62 228 110 C228 160 196 196 158 236 L44 388 L232 388'] },
  3: {
    x: [38, 232],
    strokes: ['M48 82 C70 36 106 20 138 20 C192 20 222 54 222 100 C222 154 182 190 120 194 C186 197 232 238 232 295 C232 358 186 392 132 392 C88 392 56 372 38 338'],
  },
  4: { x: [35, 245], strokes: ['M165 22 L35 280 L245 280', 'M185 150 L185 392'] },
  5: {
    x: [38, 235],
    strokes: ['M80 25 L62 182 C92 160 118 152 145 152 C200 152 235 195 235 265 C235 345 185 392 128 392 C86 392 56 372 38 340', 'M80 25 L228 25'],
  },
  6: {
    x: [42, 232],
    strokes: ['M212 52 C190 30 166 20 140 20 C76 20 42 95 42 210 C42 330 80 392 140 392 C200 392 232 346 232 292 C232 236 196 196 140 196 C92 196 56 228 46 272'],
  },
  7: { x: [32, 232], strokes: ['M32 25 L232 25 L105 392'] },
  8: {
    x: [36, 228],
    strokes: [
      'M200 70 C185 38 160 22 132 22 C90 22 60 50 60 95 C60 145 105 168 132 188 C170 212 228 242 228 302 C228 360 186 392 132 392 C78 392 36 360 36 302 C36 242 94 212 132 188 C160 168 204 145 204 95 C204 86 203 78 200 70',
    ],
  },
  9: { x: [45, 218], strokes: ['M218 105 C218 55 180 22 132 22 C80 22 45 58 45 108 C45 160 82 195 132 195 C182 195 218 160 218 105 L218 392'] },
};

const GAP = 120; // jarak antara garis tengah dua digit (nombor 10); > lebar terowong supaya tidak bercantum
const TOP = 25; // kedudukan menegak kotak digit

// Susun digit nombor n di tengah pentas: [{ d, ox }] dengan ox anjakan mendatar setiap kotak digit.
function layout(n) {
  const digits = String(n).split('').map(Number);
  let x = 0;
  const parts = digits.map((d, i) => {
    const g = GLYPHS[d];
    if (i > 0) x += GAP - g.x[0];
    else x = -g.x[0];
    const part = { d, ox: x };
    x += g.x[1];
    return part;
  });
  const shift = (VIEW_W - x) / 2;
  return parts.map((p) => ({ ...p, ox: p.ox + shift }));
}

// Semua strok nombor n dalam koordinat pentas, ikut susunan surih.
function strokesFor(n) {
  return layout(n).flatMap(({ d, ox }) => GLYPHS[d].strokes.map((path) => ({ path, ox })));
}

export function prompt(q, solved) {
  if (!solved) return `Surih nombor ${q.n}`;
  if (q.n === 100) return 'Hebat! 100 = 10 puluh (seratus)';
  if (q.n > 10) {
    const [t, o] = tensOnes(q.n);
    return `Hebat! ${q.n} = ${t} puluh ${o} sa (${wordFor(q.n)})`;
  }
  return `Hebat! Ini nombor ${q.n} (${wordFor(q.n)})`;
}

// Papan: done = bilangan strok siap; frac = pecahan strok semasa yang sudah disurih.
export function init() {
  return { done: 0, frac: 0 };
}

export function restore(b, q) {
  return Number.isInteger(b?.done) && b.done >= 0 && b.done <= strokesFor(q.n).length && typeof b.frac === 'number' && b.frac >= 0 && b.frac <= 1;
}

// ---------- Lukisan ----------

const ROAD = 78; // lebar jalan
const TRAIL = 16; // lebar jejak kuning (bahagian yang sudah dilalui)
const STEP = 6; // jarak antara titik sampel laluan
const NEAR = 52; // jari mesti sedekat ini dengan laluan
const AHEAD = 16; // berapa sampel ke depan boleh dicapai sekali gerak (≈ 96 unit)
export const CAR_COLORS = ['#e8263a', '#2f7fe0', '#f6b819', '#2fa84f', '#f2762e'];

// Kereta pandangan sisi (untuk dikira di bawah jalan).
// run = enjin hidup (selepas nombor siap disurih): badan bergegar naik turun, tayar kekal di tanah, asap ekzos.
// Enjin dihidupkan satu-satu (lengah ikut --i) supaya murid boleh kira kereta mengikut giliran.
function SideCar({ x, y, s = 1, i, run }) {
  const c = CAR_COLORS[i % CAR_COLORS.length];
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`} style={{ '--i': i }}>
      <ellipse cx="0" cy="30" rx="50" ry="7" fill="#1d2a12" opacity=".25" filter="url(#tr-blur3)" />
      {/* asap ekzos */}
      {run &&
        [0, 1].map((k) => (
          <circle key={k} className="tr-puff" style={{ '--k': k }} cx="-54" cy="12" r="8" fill="#dfe4e8" stroke="#8f99a3" strokeWidth="2.5" />
        ))}
      <g className={run ? 'tr-rumble' : undefined}>
        {/* badan & bumbung */}
        <path d="M-48 18 L-48 -2 C-48 -10 -42 -14 -34 -14 L-22 -14 L-10 -34 C-8 -37 -5 -38 -2 -38 L22 -38 C26 -38 29 -36 31 -32 L40 -14 C48 -12 52 -6 52 2 L52 18 Z" fill={c} stroke={OUT} strokeWidth="4" strokeLinejoin="round" />
        {/* tingkap */}
        <path d="M-15 -14 L-5 -31 L8 -31 L8 -14 Z" fill="#cfefff" stroke={OUT} strokeWidth="3" strokeLinejoin="round" />
        <path d="M14 -14 L14 -31 L22 -31 C24 -31 25 -30 26 -28 L33 -14 Z" fill="#cfefff" stroke={OUT} strokeWidth="3" strokeLinejoin="round" />
        <path d="M-38 -6 H44" stroke="#fff" strokeWidth="3" strokeLinecap="round" opacity=".45" />
        <circle cx="47" cy="2" r="4" fill={run ? '#fff36b' : '#fff6b0'} stroke={OUT} strokeWidth="2" />
        {run && <circle className="tr-beam" cx="52" cy="2" r="10" fill="#fff36b" opacity=".55" filter="url(#tr-blur3)" />}
        {/* muka comel pada tingkap depan */}
        <circle cx="19" cy="-23" r="2.5" fill={OUT} />
        <circle cx="26" cy="-21" r="2.5" fill={OUT} />
      </g>
      {/* tayar (tidak bergegar) */}
      {[-28, 30].map((wx) => (
        <g key={wx} transform={`translate(${wx} 18)`}>
          <circle r="13" fill="#2b2b2b" stroke={OUT} strokeWidth="3" />
          <circle r="5.5" fill="#cfd4da" />
        </g>
      ))}
    </g>
  );
}

// Kereta sebanyak n: satu baris (hingga 5) atau dua baris lima.
function Cars({ n, run }) {
  if (n === 0) return <EmptyLot />;
  if (n > 10) return <TensOnes n={n} run={run} />;
  const rows = n <= 5 ? [n] : [5, n - 5];
  const s = rows.length === 1 ? 1 : 0.8;
  const gap = rows.length === 1 ? 124 : 104;
  const ys = rows.length === 1 ? [574] : [540, 640];
  let i = 0;
  return rows.map((count, r) =>
    Array.from({ length: count }, (_, k) => {
      const x = VIEW_W / 2 + (k - (count - 1) / 2) * gap;
      const idx = i++;
      return <SideCar key={`${r}-${k}`} x={x} y={ys[r]} s={s} i={idx} run={run} />;
    }),
  );
}

// Lori pengangkut kereta: 2 dek x 5 kereta kecil = 10 kereta = 1 puluh. Menghadap ke kanan seperti SideCar.
const LORRY_W = 300;
function Lorry({ x, y, i, run, s = 1 }) {
  const minis = Array.from({ length: 10 }, (_, k) => ({ deck: Math.floor(k / 5), col: k % 5, c: CAR_COLORS[k % CAR_COLORS.length] }));
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`} style={{ '--i': i }}>
      <ellipse cx="0" cy="58" rx="150" ry="9" fill="#1d2a12" opacity=".25" filter="url(#tr-blur3)" />
      <g className={run ? 'tr-rumble' : undefined}>
        {/* rangka pengangkut dua dek */}
        <rect x="-150" y="-6" width="226" height="10" rx="3" fill="#7d8691" stroke={OUT} strokeWidth="3" />
        <rect x="-150" y="38" width="226" height="12" rx="3" fill="#7d8691" stroke={OUT} strokeWidth="3" />
        {[-146, -40, 72].map((px) => (
          <rect key={px} x={px} y="-46" width="6" height="90" fill="#9aa3ad" stroke={OUT} strokeWidth="2" />
        ))}
        {minis.map(({ deck, col, c }, k) => (
          <g key={k} transform={`translate(${-124 + col * 42} ${deck === 0 ? -20 : 24})`}>
            <path d="M-17 10 V2 C-17 -2 -14 -4 -10 -4 L-6 -4 L-2 -12 L8 -12 L12 -4 C16 -4 18 -1 18 3 V10 Z" fill={c} stroke={OUT} strokeWidth="2" strokeLinejoin="round" />
            <circle cx="-9" cy="10" r="4" fill="#2b2b2b" />
            <circle cx="10" cy="10" r="4" fill="#2b2b2b" />
          </g>
        ))}
        {/* kepala lori */}
        <path d="M80 50 V-2 C80 -12 86 -18 96 -18 L118 -18 C126 -18 132 -14 136 -6 L148 18 C150 22 150 26 150 30 V50 Z" fill="#2f7fe0" stroke={OUT} strokeWidth="4" strokeLinejoin="round" />
        <path d="M100 -10 H118 C122 -10 125 -8 127 -4 L135 14 H100 Z" fill="#cfefff" stroke={OUT} strokeWidth="3" strokeLinejoin="round" />
        <circle cx="146" cy="34" r="4" fill={run ? '#fff36b' : '#fff6b0'} stroke={OUT} strokeWidth="2" />
        <text x="-37" y="-52" textAnchor="middle" fontSize="20" fontWeight="900" fill="#fff" stroke={OUT} strokeWidth="5" paintOrder="stroke">
          10
        </text>
      </g>
      {[-122, -60, 100, 132].map((wx) => (
        <g key={wx} transform={`translate(${wx} 50)`}>
          <circle r="12" fill="#2b2b2b" stroke={OUT} strokeWidth="3" />
          <circle r="5" fill="#cfd4da" />
        </g>
      ))}
    </g>
  );
}

// Nombor lebih 10: lori (puluh) di kiri, kereta sa di kanan, dan label "1 puluh 4 sa".
// Hingga 2 lori: saiz besar. 3 hingga 10 lori (21 hingga 100): saiz kecil, baris lima, supaya semua muat.
function TensOnes({ n, run }) {
  const [t, o] = tensOnes(n);
  const big = t <= 2;
  const ls = big ? 1 : 0.42; // skala lori
  const lPitch = big ? LORRY_W + 30 : LORRY_W * ls + 12;
  const cs = big ? 0.68 : 0.5; // skala kereta sa
  const cPitch = big ? 84 : 58;
  const lCols = big ? t : Math.min(t, 5);
  const lRows = Math.ceil(t / lCols);
  const oCols = Math.min(o, 5);
  const lorryW = lCols * lPitch - (lPitch - LORRY_W * ls);
  const onesW = oCols * cPitch;
  const gap = oCols ? (big ? 50 : 36) : 0;
  const left = (VIEW_W - (lorryW + gap + onesW)) / 2;
  const rowY = (rows, r) => (rows === 1 ? (big ? 548 : 570) : big ? [536, 622][r] : [528, 612][r]);

  const lorries = Array.from({ length: t }, (_, k) => {
    const r = Math.floor(k / lCols);
    const c = k % lCols;
    const cx = left + c * lPitch + (LORRY_W * ls) / 2;
    return <Lorry key={`l${k}`} x={cx} y={rowY(lRows, r)} s={ls} i={k} run={run} />;
  });
  const ox = left + lorryW + gap;
  const oRows = o <= 5 ? 1 : 2;
  const ones = Array.from({ length: o }, (_, k) => {
    const r = Math.floor(k / 5);
    const c = k % 5;
    return <SideCar key={`o${k}`} x={ox + cPitch / 2 + c * cPitch} y={rowY(oRows, r) + (big ? 30 * (oRows === 1) : 12)} s={cs} i={t + k} run={run} />;
  });
  const label = n === 100 ? '10 puluh = 1 ratus' : `${t} puluh ${o} sa`;
  return (
    <g>
      {lorries}
      {ones}
      <g transform="translate(500 684)" pointerEvents="none">
        <rect x="-120" y="-22" width="240" height="40" rx="20" fill="#fffcf3" stroke={OUT} strokeWidth="4" />
        <text y="7" textAnchor="middle" fontSize="23" fontWeight="900" fill={OUT}>
          {label}
        </text>
      </g>
    </g>
  );
}

// Nombor 0: tempat letak kereta yang kosong (tiada kereta = sifar).
function EmptyLot() {
  const bays = [0, 1, 2, 3];
  return (
    <g pointerEvents="none">
      <rect x="320" y="488" width="360" height="150" rx="18" fill="#4a4f57" stroke={OUT} strokeWidth="5" />
      {bays.map((b) => (
        <path key={b} d={`M${350 + b * 75} 500 V590`} stroke="#fff" strokeWidth="5" strokeLinecap="round" />
      ))}
      <path d="M650 500 V590" stroke="#fff" strokeWidth="5" strokeLinecap="round" />
      {/* papan P */}
      <g transform="translate(286 470)">
        <rect x="-4" y="20" width="8" height="70" fill="#8b939c" stroke={OUT} strokeWidth="2.5" />
        <rect x="-24" y="-24" width="48" height="48" rx="8" fill="#2f7fe0" stroke={OUT} strokeWidth="4" />
        <text y="14" textAnchor="middle" fontSize="36" fontWeight="900" fill="#fff">
          P
        </text>
      </g>
      <g transform="translate(500 668)">
        <rect x="-92" y="-26" width="184" height="46" rx="23" fill="#fffcf3" stroke={OUT} strokeWidth="4" />
        <text y="8" textAnchor="middle" fontSize="26" fontWeight="900" fill={OUT}>
          0 kereta
        </text>
      </g>
    </g>
  );
}

// Kereta pandangan atas yang dipandu murid di atas jalan (menghala ke +x; diputar ikut arah jalan).
export function TopCar({ x = 0, y = 0, a = 0, color = '#e8263a' }) {
  return (
    <g transform={`translate(${x} ${y}) rotate(${a})`} pointerEvents="none">
      <ellipse cx="2" cy="4" rx="32" ry="20" fill="#000" opacity=".28" filter="url(#tr-blur3)" />
      {[-16, 16].map((wx) =>
        [-17, 17].map((wy) => <rect key={`${wx}${wy}`} x={wx - 8} y={wy - 4} width="16" height="8" rx="3" fill="#1e1e1e" />),
      )}
      <rect x="-30" y="-16" width="60" height="32" rx="12" fill={color} stroke={OUT} strokeWidth="3.5" />
      <rect x="-12" y="-12" width="24" height="24" rx="6" fill="#fff" opacity=".25" />
      <path d="M12 -12 L20 -10 L20 10 L12 12 Z" fill="#cfefff" stroke={OUT} strokeWidth="2" strokeLinejoin="round" />
      <path d="M-12 -12 L-19 -10 L-19 10 L-12 12 Z" fill="#cfefff" stroke={OUT} strokeWidth="2" strokeLinejoin="round" />
      <circle cx="28" cy="-10" r="3.5" fill="#fff6b0" />
      <circle cx="28" cy="10" r="3.5" fill="#fff6b0" />
      <path d="M-24 -11 H20" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" opacity=".5" />
    </g>
  );
}

// Lampu isyarat di tempat berhenti (hujung setiap strok). go = hijau menyala.
function TrafficLight({ x, y, go }) {
  return (
    <g transform={`translate(${x} ${y})`} pointerEvents="none">
      <ellipse cx="2" cy="46" rx="16" ry="5" fill="#000" opacity=".2" filter="url(#tr-blur3)" />
      <rect x="-3.5" y="10" width="7" height="36" rx="3" fill="#59606b" stroke={OUT} strokeWidth="2.5" />
      <rect x="-16" y="-44" width="32" height="62" rx="9" fill="#2f343b" stroke={OUT} strokeWidth="3.5" />
      <circle cy="-28" r="9" fill={go ? '#5b2020' : '#ff3b3b'} />
      {!go && <circle cy="-28" r="15" fill="#ff3b3b" opacity=".35" filter="url(#tr-blur3)" />}
      <circle cy="-13" r="9" fill="#5a4a1c" />
      <circle cy="2" r="9" fill={go ? '#3fe06a' : '#1f4a2a'} />
      {go && <circle cy="2" r="15" fill="#3fe06a" opacity=".35" filter="url(#tr-blur3)" />}
    </g>
  );
}

// Pilih tempat lampu isyarat di sebelah hujung strok: arah yang paling jauh daripada semua jalan, dalam pentas.
// Cuba jarak dekat dahulu; jika tiada ruang lapang (contohnya 0, hujung = titik mula), cuba lebih jauh
// supaya lampu tidak bertindih dengan kereta di titik mula.
function lightSpot(geo, i) {
  const pts = geo[i].pts;
  const [ex, ey] = pts[pts.length - 1];
  const all = geo.flatMap((g) => g.pts);
  const starts = geo.map((g) => g.pts[0]); // tempat kereta bermula: lampu mesti jauh daripadanya
  let best = [ex, ey];
  let score = -1;
  for (const rad of [74, 115]) {
    for (let deg = 0; deg < 360; deg += 30) {
      const r = (deg * Math.PI) / 180;
      const c = [ex + Math.cos(r) * rad, ey + Math.sin(r) * rad];
      if (c[0] < 30 || c[0] > VIEW_W - 30 || c[1] < 52 || c[1] > 450) continue;
      if (starts.some((st) => dist(st, c) < 100)) continue;
      const d = Math.min(...all.map((p) => dist(p, c)));
      if (d > score) {
        score = d;
        best = c;
      }
    }
    if (score >= 56) break; // cukup lapang pada jarak ini
  }
  return best;
}

function TraceDefs() {
  return (
    <defs>
      <filter id="tr-blur3" x="-60%" y="-60%" width="220%" height="220%">
        <feGaussianBlur stdDeviation="3" />
      </filter>
    </defs>
  );
}

const roadT = (s) => `translate(${s.ox} ${TOP})`;

// Jalan raya berbentuk nombor: garis luar, bahu jalan, kemudian asfalt (berlapis supaya simpang tidak terputus).
function Road({ strokes, solved }) {
  const layer = (key, stroke, width) =>
    strokes.map((s, i) => (
      <path key={`${key}${i}`} d={s.path} transform={roadT(s)} fill="none" stroke={stroke} strokeWidth={width} strokeLinecap="round" strokeLinejoin="round" />
    ));
  return (
    <g className={solved ? 'tr-glow' : undefined}>
      {layer('o', OUT, ROAD + 14)}
      {layer('c', '#e9e5da', ROAD + 6)}
      {layer('a', '#3d4149', ROAD - 6)}
    </g>
  );
}

// Anak panah putih pada jalan, mengikut arah pemanduan.
function Arrow({ x, y, a }) {
  return <path transform={`translate(${x} ${y}) rotate(${a})`} d="M-7 -10 L6 0 L-7 10" fill="none" stroke="#fff" strokeWidth="4.5" strokeLinecap="round" strokeLinejoin="round" />;
}

const dist = (a, b) => Math.hypot(a[0] - b[0], a[1] - b[1]);
const angleAt = (pts, k) => {
  const a = pts[Math.max(0, Math.min(k, pts.length - 3))];
  const b = pts[Math.max(2, Math.min(k + 2, pts.length - 1))];
  return (Math.atan2(b[1] - a[1], b[0] - a[0]) * 180) / Math.PI;
};

export default function TraceGame({ q, board, setBoard, succeed, solved, hint }) {
  const strokes = strokesFor(q.n);
  const pathRefs = useRef([]);
  const svgRef = useRef(null);
  const [geo, setGeo] = useState(null); // [{ pts: [[x,y]...], len, light: [x,y] }] dalam koordinat pentas
  const [prog, setProg] = useState(() => (solved ? { done: strokes.length, frac: 0 } : { done: board.done, frac: board.frac }));
  const progRef = useRef(prog); // nilai terkini untuk pengendali penunjuk
  const live = useRef(null); // { pointer }

  // Sampel setiap strok daripada laluan SVG sebenar (getPointAtLength), kemudian anjak ke koordinat pentas.
  useLayoutEffect(() => {
    const g = strokes.map((s, i) => {
      const el = pathRefs.current[i];
      const len = el.getTotalLength();
      const count = Math.max(2, Math.ceil(len / STEP));
      const pts = Array.from({ length: count + 1 }, (_, k) => {
        const p = el.getPointAtLength((len * k) / count);
        return [p.x + s.ox, p.y + TOP];
      });
      return { pts, len };
    });
    g.forEach((s, i) => (s.light = lightSpot(g, i)));
    setGeo(g);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [q.n]);

  const toSvg = (e) => {
    const m = svgRef.current?.getScreenCTM();
    if (!m) return null;
    const p = new DOMPoint(e.clientX, e.clientY).matrixTransform(m.inverse());
    return [p.x, p.y];
  };

  // Majukan kereta jika jari dekat dengan jalan di hadapan kedudukan semasa (dalam tetingkap AHEAD sampel).
  const advance = (pt, cur) => {
    const { pts } = geo[cur.done];
    const at = Math.round(cur.frac * (pts.length - 1));
    let best = -1;
    for (let k = at; k <= Math.min(pts.length - 1, at + AHEAD); k++) {
      if (dist(pts[k], pt) <= NEAR) best = k;
    }
    if (best <= at) return cur;
    const frac = best / (pts.length - 1);
    if (best >= pts.length - 2) return { done: cur.done + 1, frac: 0 }; // sampai lampu isyarat: strok siap
    return { done: cur.done, frac };
  };

  const finish = (next) => {
    if (next.done >= strokes.length) succeed({ done: strokes.length, frac: 0 });
    else setBoard(next);
  };

  const step = (e) => {
    const pt = toSvg(e);
    const cur = progRef.current;
    if (!pt || !geo || cur.done >= strokes.length) return;
    const next = advance(pt, cur);
    if (next === cur) return;
    progRef.current = next;
    setProg(next);
    if (next.done !== cur.done) {
      // berhenti di lampu isyarat: angkat jari, kemudian mula strok seterusnya di bulatan hijaunya
      live.current = null;
      finish(next);
    }
  };

  const onPointerDown = (e) => {
    if (solved || !geo || (e.pointerType === 'mouse' && e.button !== 0)) return;
    e.preventDefault(); // jangan mula pilih (highlight) teks semasa menyurih
    try {
      e.currentTarget.setPointerCapture(e.pointerId);
    } catch {
      // abaikan
    }
    live.current = { pointer: e.pointerId };
    step(e);
  };
  const onPointerMove = (e) => {
    if (live.current?.pointer !== e.pointerId) return;
    step(e);
  };
  const onPointerUp = (e) => {
    if (live.current?.pointer !== e.pointerId) return;
    live.current = null;
    // simpan kemajuan bila jari diangkat (bukan setiap gerakan)
    const p = progRef.current;
    if (!solved && p.done < strokes.length) setBoard(p);
  };

  const allDone = solved || prog.done >= strokes.length;

  // kedudukan kereta: di hujung jejak strok semasa, atau di hujung strok terakhir bila siap
  let car = null;
  if (geo) {
    const si = allDone ? strokes.length - 1 : prog.done;
    const pts = geo[si].pts;
    const k = allDone ? pts.length - 1 : Math.round(prog.frac * (pts.length - 1));
    car = { x: pts[k][0], y: pts[k][1], a: angleAt(pts, k) };
  }

  return (
    <svg
      ref={svgRef}
      className="g-stage tr-stage"
      viewBox={`0 0 ${VIEW_W} ${VIEW_H}`}
      role="img"
      aria-label={q.n === 0 ? 'Pandu kereta ikut jalan nombor 0. Di bawah, tempat letak kereta kosong: tiada kereta.' : q.n > 10 ? `Pandu kereta ikut jalan nombor ${q.n}. Di bawah: ${tensOnes(q.n)[0]} lori sepuluh kereta dan ${tensOnes(q.n)[1]} kereta.` : `Pandu kereta ikut jalan nombor ${q.n}. Di bawah ada ${q.n} kereta.`}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      onPointerCancel={onPointerUp}
    >
      <TraceDefs />
      <Road strokes={strokes} solved={allDone} />

      {/* garis tengah putih putus-putus (juga sumber sampel laluan) */}
      {strokes.map((s, i) => (
        <path
          key={`d${i}`}
          ref={(el) => (pathRefs.current[i] = el)}
          d={s.path}
          transform={roadT(s)}
          fill="none"
          stroke="#fff"
          strokeWidth="5"
          strokeDasharray="16 14"
          strokeLinecap="round"
          opacity=".9"
        />
      ))}

      {/* jejak kuning: jalan yang sudah dilalui kereta */}
      {strokes.map((s, i) => {
        const frac = allDone || i < prog.done ? 1 : i === prog.done ? prog.frac : 0;
        if (frac <= 0) return null;
        return (
          <path
            key={`t${i}`}
            d={s.path}
            transform={roadT(s)}
            pathLength="1000"
            strokeDasharray={`${frac * 1000} 2000`}
            fill="none"
            stroke="#ffd23f"
            strokeWidth={TRAIL}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        );
      })}

      {/* anak panah arah & bulatan hijau bernombor untuk strok yang belum bermula */}
      {geo &&
        !allDone &&
        geo.map(({ pts }, i) => {
          if (i < prog.done) return null;
          const at = i === prog.done ? Math.round(prog.frac * (pts.length - 1)) : 0;
          const marks = [0.3, 0.62].map((f) => {
            const k = Math.min(pts.length - 3, Math.round(f * (pts.length - 1)));
            return { x: pts[k][0], y: pts[k][1], a: angleAt(pts, k), k };
          });
          return (
            <g key={`m${i}`} pointerEvents="none">
              {marks.filter((m) => m.k > at + 6).map((m) => <Arrow key={m.k} {...m} />)}
              {i > prog.done && (
                <g transform={`translate(${pts[0][0]} ${pts[0][1]})`}>
                  <circle r="19" fill="#2fa84f" stroke="#fff" strokeWidth="3" />
                  <text y="7" textAnchor="middle" fontSize="20" fontWeight="900" fill="#fff">
                    {i + 1}
                  </text>
                </g>
              )}
            </g>
          );
        })}

      {/* lampu isyarat di setiap tempat berhenti; semua hijau bila siap */}
      {geo && geo.map((g, i) => <TrafficLight key={`l${i}`} x={g.light[0]} y={g.light[1]} go={allDone} />)}

      {/* kereta yang dipandu; cincin berdenyut menunjukkan tempat letak jari */}
      {car && (
        <>
          {!allDone && (
            <g transform={`translate(${car.x} ${car.y})`} pointerEvents="none">
              <circle className="tr-ping" r="34" fill="none" stroke="#ffd23f" strokeWidth="5" />
            </g>
          )}
          <TopCar {...car} />
        </>
      )}

      {/* petunjuk: titik kuning bergerak menunjukkan laluan strok semasa */}
      {hint && !allDone && (
        <g transform={roadT(strokes[prog.done])} pointerEvents="none">
          <g>
            <circle r="13" fill="#ffd23f" stroke="#fff" strokeWidth="4" />
            <animateMotion dur="2.2s" repeatCount="indefinite" path={strokes[prog.done].path} />
          </g>
        </g>
      )}

      <Cars n={q.n} run={allDone} />
    </svg>
  );
}

export function Demo() {
  const n = 2;
  const strokes = strokesFor(n);
  const s = strokes[0];
  return (
    <svg className="demo-svg" viewBox={`0 0 ${VIEW_W} ${VIEW_H}`} aria-hidden="true">
      <TraceDefs />
      <Road strokes={strokes} />
      <path d={s.path} transform={roadT(s)} fill="none" stroke="#fff" strokeWidth="5" strokeDasharray="16 14" opacity=".9" />
      <path
        className="tr-demo-ink"
        d={s.path}
        transform={roadT(s)}
        pathLength="1000"
        fill="none"
        stroke="#ffd23f"
        strokeWidth={TRAIL}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <g transform={roadT(s)}>
        <g>
          <TopCar x={0} y={0} a={0} />
          <g transform="translate(4 8) scale(1.5)">
            <Hand />
          </g>
          <animateMotion dur="2.6s" repeatCount="indefinite" path={s.path} rotate="auto" keyPoints="0;1;1" keyTimes="0;0.75;1" calcMode="linear" />
        </g>
      </g>
      <Cars n={n} />
    </svg>
  );
}

export const demoText =
  'Letakkan jari pada kereta merah. Pandu kereta ikut jalan nombor sampai ke lampu isyarat. Angkat jari bila berhenti di lampu merah, kemudian sambung di bulatan hijau. Kira kereta di bawah.';
