import { Bang, Hand, Tick } from './GameArt.jsx';
import { useState } from 'react';
import { useDragDrop } from './useDragDrop.js';

// Banyak dan Sedikit: papan rama-rama.
// Sayap kiri dan kanan ada pom-pom. Badan rama-rama belum lengkap: murid letakkan sambungan badan
// bersimbol (>, <, =) di dada untuk membandingkan sayap kiri dengan sayap kanan. Mesti seret (ketik sahaja tidak meletakkan jawapan).

export const OUT = '#3b2a1a';
const SLOT = { x: 500, y: 222, r: 50 };
export const PIECES = [
  { id: '>', label: 'Lebih banyak', x: 320 },
  { id: '=', label: 'Sama banyak', x: 500 },
  { id: '<', label: 'Lebih sedikit', x: 680 },
];
export const PIECE_Y = 524;
export const VIEW_H = 712;
export const BENCH = { x: 160, y: 584, w: 680 };

// Tempat pom-pom dalam sayap kiri (sayap kanan ialah cerminan). Dikira daripada bentuk dalam
// sayap supaya setiap pom-pom (jejari POM_R) sentiasa di dalam sayap, sekurang-kurangnya 8px dari tepi.
// Susunan ikut "titik paling jauh" merentas sayap atas dan bawah, jadi bilangan kecil pun tersebar
// seimbang. Semua slot jauh dari badan supaya tidak dilindungi sambungan badan.
const POM_R = 18;
const SLOTS = [
  [302, 162], [374, 374], [390, 214], [210, 130], [382, 130],
  [238, 206], [390, 302], [274, 94], [322, 226], [314, 354],
];
const pomsFor = (n, mirror) => SLOTS.slice(0, n).map(([x, y]) => [mirror ? 1000 - x : x, y]);

export const answerFor = (q) => (q.left > q.right ? '>' : q.left < q.right ? '<' : '=');

// Soalan pada papan tajuk. Selepas betul, tempat kosong diisi dengan jawapan.
const SENTENCE = { '>': 'lebih banyak daripada', '<': 'lebih sedikit daripada', '=': 'sama banyak dengan' };
export function prompt(q, solved) {
  return solved ? `Sayap kiri ${SENTENCE[answerFor(q)]} sayap kanan!` : 'Sayap kiri ___ sayap kanan?';
}

export function init() {
  return { tried: [], placed: null };
}

export function restore(b) {
  return Array.isArray(b?.tried);
}

// ---------- Lukisan ----------

const UPPER = 'M470 178 C430 72 300 22 208 60 C128 96 140 222 232 256 C322 290 432 262 470 228 Z';
const LOWER = 'M470 238 C420 252 300 272 270 340 C246 402 330 440 396 410 C452 384 470 320 474 272 Z';
const shrink = (cx, cy, k) => `translate(${cx} ${cy}) scale(${k}) translate(${-cx} ${-cy})`;

// Bahagian dalam sayap (lebih cerah) dan transform yang sama untuk klip tekstur.
const WING_PARTS = [
  { d: UPPER, inner: shrink(318, 160, 0.84), clip: 'bf-clip-up' },
  { d: LOWER, inner: shrink(375, 340, 0.8), clip: 'bf-clip-low' },
];
// Urat sayap dari pangkal (dekat badan) ke tepi.
const VEINS = [
  'M465 205 Q390 150 262 98',
  'M466 210 Q360 185 210 172',
  'M466 216 Q372 236 252 248',
  'M462 200 Q430 120 340 68',
  'M468 264 Q400 300 296 348',
  'M468 272 Q424 340 366 408',
  'M466 268 Q382 330 300 398',
];

function Wing() {
  return (
    <g filter="url(#bf-life)">
      {WING_PARTS.map(({ d, inner, clip }) => (
        <g key={clip}>
          <path d={d} fill="url(#bf-wing-edge)" stroke={OUT} strokeWidth="5" strokeLinejoin="round" />
          <path d={d} fill="url(#bf-wing-in)" transform={inner} />
          <g clipPath={`url(#${clip})`}>
            <path d={d} fill="url(#bf-scales)" transform={inner} opacity=".32" />
            {VEINS.map((v) => (
              <path key={v} d={v} fill="none" stroke="#a9d3f3" strokeWidth="3.2" strokeLinecap="round" />
            ))}
            {VEINS.map((v) => (
              <path key={`h${v}`} d={v} fill="none" stroke="#fff" strokeWidth="1.2" strokeLinecap="round" opacity=".7" transform="translate(-1.5 -1.5)" />
            ))}
          </g>
          <path d={d} fill="none" stroke="#7fbce9" strokeWidth="3" transform={inner} opacity=".85" />
        </g>
      ))}
      {/* kilauan cahaya dari atas */}
      <ellipse cx="292" cy="96" rx="104" ry="24" transform="rotate(-14 292 96)" fill="#fff" opacity=".42" filter="url(#bf-blur6)" />
      <ellipse cx="336" cy="304" rx="52" ry="12" transform="rotate(28 336 304)" fill="#fff" opacity=".35" filter="url(#bf-blur6)" />
    </g>
  );
}

function Pom({ x, y }) {
  return (
    <g transform={`translate(${x} ${y})`}>
      <ellipse cx="3" cy={POM_R * 0.72} rx={POM_R * 0.95} ry={POM_R * 0.38} fill="#6b2a48" opacity=".28" filter="url(#bf-blur3)" />
      <circle r={POM_R} fill="url(#bf-pom)" filter="url(#bf-fuzz)" />
      <circle r={POM_R - 4} fill="url(#bf-pom-tex)" opacity=".45" />
      <ellipse cx="-6" cy="-7" rx="6" ry="4.5" fill="#fff" opacity=".8" filter="url(#bf-blur1)" />
    </g>
  );
}

const PETAL_ANGLES = [0, 72, 144, 216, 288];

function Flower({ x, y, tone, label }) {
  return (
    <g transform={`translate(${x} ${y})`} filter="url(#bf-drop)">
      {PETAL_ANGLES.map((a) => {
        const r = (a * Math.PI) / 180;
        const px = Math.sin(r) * 30;
        const py = -Math.cos(r) * 30;
        return (
          <g key={a}>
            <circle cx={px} cy={py} r="25" fill={`url(#bf-petal-${tone})`} stroke={OUT} strokeWidth="4" />
            {/* garis lipatan kelopak */}
            <path d={`M${px * 0.55} ${py * 0.55} L${px * 1.35} ${py * 1.35}`} stroke={OUT} strokeWidth="2" strokeLinecap="round" opacity=".22" />
          </g>
        );
      })}
      <circle r="27" fill="url(#bf-head)" stroke={OUT} strokeWidth="4" />
      {[0, 60, 120, 180, 240, 300].map((a) => (
        <circle key={a} cx={Math.sin((a * Math.PI) / 180) * 21} cy={-Math.cos((a * Math.PI) / 180) * 21} r="2.2" fill="#c98a12" opacity=".55" />
      ))}
      <ellipse cx="-9" cy="-12" rx="9" ry="5" fill="#fff" opacity=".55" filter="url(#bf-blur1)" />
      <text y="13" textAnchor="middle" fontSize="38" fontWeight="900" fill={OUT}>
        {label}
      </text>
    </g>
  );
}

function Body() {
  return (
    <g>
      {/* bayang badan pada sayap */}
      <ellipse cx="508" cy="270" rx="54" ry="170" fill="#1d3550" opacity=".16" filter="url(#bf-blur8)" />
      <path d="M484 70 C474 46 462 34 448 30" fill="none" stroke={OUT} strokeWidth="5" strokeLinecap="round" />
      <path d="M516 70 C526 46 538 34 552 30" fill="none" stroke={OUT} strokeWidth="5" strokeLinecap="round" />
      <circle cx="446" cy="30" r="11" fill="url(#bf-tip)" stroke={OUT} strokeWidth="4" />
      <circle cx="554" cy="30" r="11" fill="url(#bf-tip)" stroke={OUT} strokeWidth="4" />
      <g filter="url(#bf-shadow)">
        {/* perut (bawah); bahagian dada di tengah ialah sambungan yang murid letakkan */}
        <ellipse cx="500" cy="346" rx="40" ry="78" fill="url(#bf-abdomen)" stroke={OUT} strokeWidth="5" />
        <path d="M464 330 Q500 344 536 330 M466 366 Q500 380 534 366 M474 398 Q500 408 526 398" fill="none" stroke="#c98510" strokeWidth="6" strokeLinecap="round" />
        <path d="M466 334 Q500 347 534 334 M468 370 Q500 383 532 370" fill="none" stroke="#fff3b0" strokeWidth="2" strokeLinecap="round" opacity=".6" />
        <ellipse cx="486" cy="330" rx="7" ry="34" fill="#fff" opacity=".45" filter="url(#bf-blur3)" />
        <circle cx="500" cy="118" r="52" fill="url(#bf-head)" stroke={OUT} strokeWidth="5" />
      </g>
      <ellipse cx="480" cy="92" rx="17" ry="10" transform="rotate(-20 480 92)" fill="#fff" opacity=".6" filter="url(#bf-blur3)" />
      <ellipse cx="482" cy="112" rx="6" ry="8" fill={OUT} />
      <ellipse cx="518" cy="112" rx="6" ry="8" fill={OUT} />
      <circle cx="480" cy="108" r="2.2" fill="#fff" />
      <circle cx="516" cy="108" r="2.2" fill="#fff" />
      <circle cx="468" cy="133" r="10" fill="#ff8fa0" opacity=".55" filter="url(#bf-blur3)" />
      <circle cx="532" cy="133" r="10" fill="#ff8fa0" opacity=".55" filter="url(#bf-blur3)" />
      <path d="M486 136 Q500 150 514 136" fill="none" stroke={OUT} strokeWidth="4" strokeLinecap="round" />
    </g>
  );
}

// Sambungan badan (dada) rama-rama dengan simbol perbandingan.
function BodyPiece({ symbol, faded = false }) {
  return (
    <g opacity={faded ? 0.4 : 1}>
      <ellipse cx="4" cy="54" rx="44" ry="9" fill="#3b2a1a" opacity=".25" filter="url(#bf-blur3)" />
      {/* penyambung atas dan bawah */}
      <rect x="-17" y="-60" width="34" height="18" rx="7" fill="url(#bf-abdomen)" stroke={OUT} strokeWidth="4" />
      <rect x="-17" y="42" width="34" height="18" rx="7" fill="url(#bf-abdomen)" stroke={OUT} strokeWidth="4" />
      <circle r="48" fill="url(#bf-head)" stroke={OUT} strokeWidth="5" filter="url(#bf-shadow)" />
      <circle r="38" fill="none" stroke="#e0a520" strokeWidth="4" opacity=".8" />
      <circle r="35" fill="none" stroke="#fff6c4" strokeWidth="1.5" opacity=".6" />
      <ellipse cx="-16" cy="-24" rx="15" ry="8" transform="rotate(-30 -16 -24)" fill="#fff" opacity=".6" filter="url(#bf-blur3)" />
      <text y="20" textAnchor="middle" fontSize="54" fontWeight="900" fill="#fff6c4" opacity=".7">
        {symbol}
      </text>
      <text y="18" textAnchor="middle" fontSize="54" fontWeight="900" fill={OUT}>
        {symbol}
      </text>
    </g>
  );
}

function Shuriken4({ x, y, s = 1 }) {
  return (
    <path
      transform={`translate(${x} ${y}) scale(${s})`}
      d="M0 -16 L4 -4 L16 0 L4 4 L0 16 L-4 4 L-16 0 L-4 -4 Z"
      fill="#fff"
      stroke="#8f1424"
      strokeWidth="1.5"
    />
  );
}

// Bangku kayu tempat sambungan badan diletakkan, dengan panji merah di hujung.
export function Bench() {
  const top = BENCH.y;
  return (
    <g aria-hidden="true">
      <ellipse cx="500" cy={top + 124} rx="370" ry="16" fill="#2f4a12" opacity=".28" filter="url(#bf-blur6)" />
      <g filter="url(#bf-woodgrain)">
        <rect x={BENCH.x + 40} y={top + 70} width="26" height="56" rx="6" fill="url(#bf-wood-dark)" stroke="#4a2a10" strokeWidth="4" />
        <rect x={BENCH.x + BENCH.w - 66} y={top + 70} width="26" height="56" rx="6" fill="url(#bf-wood-dark)" stroke="#4a2a10" strokeWidth="4" />
        <rect x={BENCH.x + 20} y={top + 24} width={BENCH.w - 40} height="52" rx="10" fill="url(#bf-wood-dark)" stroke="#4a2a10" strokeWidth="4" />
        <rect x={BENCH.x} y={top} width={BENCH.w} height="30" rx="10" fill="url(#bf-wood)" stroke="#4a2a10" strokeWidth="4" />
      </g>
      {/* bayang papan atas pada papan depan */}
      <rect x={BENCH.x + 24} y={top + 28} width={BENCH.w - 48} height="8" fill="#3b1e08" opacity=".3" filter="url(#bf-blur1)" />
      <path d={`M${BENCH.x + 20} ${top + 8} H${BENCH.x + BENCH.w - 20}`} stroke="#f2c590" strokeWidth="3" strokeLinecap="round" opacity=".75" />
      {[BENCH.x + 8, BENCH.x + BENCH.w - 58].map((bx) => (
        <g key={bx} filter="url(#bf-drop)">
          <path d={`M${bx} ${top - 6} h50 v104 l-25 -16 l-25 16 Z`} fill="url(#bf-banner)" stroke="#4a2a10" strokeWidth="4" strokeLinejoin="round" />
          <path d={`M${bx + 6} ${top - 2} h38`} stroke="#ff8a96" strokeWidth="3" strokeLinecap="round" opacity=".7" />
          <Shuriken4 x={bx + 25} y={top + 40} s={1.1} />
        </g>
      ))}
    </g>
  );
}

export function PieceLabel({ text, faded }) {
  const w = text.length * 11 + 34;
  return (
    <g transform={`translate(0 ${BENCH.y + 50 - PIECE_Y})`} opacity={faded ? 0.5 : 1}>
      <rect x={-w / 2} y="-15" width={w} height="34" rx="17" fill="#3b1e08" opacity=".35" />
      <rect x={-w / 2} y="-17" width={w} height="34" rx="17" fill="url(#bf-label)" stroke="#6b3f1d" strokeWidth="3" />
      <text y="7" textAnchor="middle" fontSize="19" fontWeight="900" fill={OUT}>
        {text}
      </text>
    </g>
  );
}

// Gradien & penapis yang dikongsi (bangku kayu, panji, label, kabur). Juga digunakan oleh papan lain.
export function BenchDefs() {
  return (
    <defs>
      <linearGradient id="bf-wood" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stopColor="#dda066" />
        <stop offset=".5" stopColor="#b8763c" />
        <stop offset="1" stopColor="#94582a" />
      </linearGradient>
      <linearGradient id="bf-wood-dark" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stopColor="#a9672f" />
        <stop offset="1" stopColor="#6f3f18" />
      </linearGradient>
      <linearGradient id="bf-banner" x1="0" y1="0" x2="1" y2="0">
        <stop offset="0" stopColor="#a51627" />
        <stop offset=".4" stopColor="#e4404f" />
        <stop offset="1" stopColor="#b01a2c" />
      </linearGradient>
      <linearGradient id="bf-label" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stopColor="#fffcf3" />
        <stop offset="1" stopColor="#f0dcb4" />
      </linearGradient>
      {[1, 3, 6, 8].map((sd) => (
        <filter key={sd} id={`bf-blur${sd}`} x="-60%" y="-60%" width="220%" height="220%">
          <feGaussianBlur stdDeviation={sd} />
        </filter>
      ))}
      {/* bayang jatuh lembut */}
      <filter id="bf-drop" x="-30%" y="-30%" width="160%" height="170%">
        <feDropShadow dx="0" dy="5" stdDeviation="4" floodColor="#2a1a0a" floodOpacity=".3" />
      </filter>
      {/* ira kayu */}
      <filter id="bf-woodgrain" x="0" y="0" width="100%" height="100%">
        <feTurbulence type="fractalNoise" baseFrequency=".012 .32" numOctaves="3" seed="7" result="n" />
        <feColorMatrix in="n" type="matrix" values="0 0 0 0 0.24  0 0 0 0 0.11  0 0 0 0 0.03  1.3 0 0 0 -0.55" result="g" />
        <feComposite in="g" in2="SourceGraphic" operator="atop" />
      </filter>
    </defs>
  );
}

// Gradien, corak dan penapis untuk rupa "hidup": isipadu, bayang, kilauan dan tekstur.
function PomDefs() {
  return (
    <defs>
      <radialGradient id="bf-wing-edge" cx=".88" cy=".62" r=".95">
        <stop offset="0" stopColor="#d9eefd" />
        <stop offset=".55" stopColor="#9fcdf1" />
        <stop offset="1" stopColor="#5d9ed8" />
      </radialGradient>
      <radialGradient id="bf-wing-in" cx=".8" cy=".58" r=".85">
        <stop offset="0" stopColor="#ffffff" />
        <stop offset=".55" stopColor="#eaf6ff" />
        <stop offset="1" stopColor="#c2e1f9" />
      </radialGradient>
      <pattern id="bf-scales" width="14" height="10" patternUnits="userSpaceOnUse">
        <path d="M0 6 Q3.5 0 7 6 T14 6" fill="none" stroke="#9fcbee" strokeWidth="1.2" />
        <path d="M-7 11 Q-3.5 5 0 11 T7 11 T14 11" fill="none" stroke="#9fcbee" strokeWidth="1.2" />
      </pattern>
      <radialGradient id="bf-pom" cx=".38" cy=".34" r=".72">
        <stop offset="0" stopColor="#fff2f8" />
        <stop offset=".45" stopColor="#ffc4dd" />
        <stop offset=".85" stopColor="#f48cb7" />
        <stop offset="1" stopColor="#dc6b9b" />
      </radialGradient>
      <pattern id="bf-pom-tex" width="5" height="5" patternUnits="userSpaceOnUse">
        <circle cx="1.5" cy="1.5" r=".9" fill="#fff" />
        <circle cx="4" cy="3.8" r=".7" fill="#e77aa8" />
      </pattern>
      <radialGradient id="bf-petal-pink" cx=".5" cy=".5" r=".6">
        <stop offset="0" stopColor="#ffd0d8" />
        <stop offset=".55" stopColor="#ff7f93" />
        <stop offset="1" stopColor="#e2475f" />
      </radialGradient>
      <radialGradient id="bf-petal-purple" cx=".5" cy=".5" r=".6">
        <stop offset="0" stopColor="#ece2ff" />
        <stop offset=".55" stopColor="#b493f7" />
        <stop offset="1" stopColor="#8a62e0" />
      </radialGradient>
      <radialGradient id="bf-head" cx=".38" cy=".32" r=".75">
        <stop offset="0" stopColor="#fff6b8" />
        <stop offset=".45" stopColor="#ffdc55" />
        <stop offset="1" stopColor="#e3a116" />
      </radialGradient>
      <linearGradient id="bf-abdomen" x1="0" y1="0" x2="1" y2="0">
        <stop offset="0" stopColor="#e09e14" />
        <stop offset=".3" stopColor="#ffd84d" />
        <stop offset=".5" stopColor="#ffe78f" />
        <stop offset=".78" stopColor="#ffd23f" />
        <stop offset="1" stopColor="#cf8d12" />
      </linearGradient>
      <radialGradient id="bf-tip" cx=".35" cy=".3" r=".75">
        <stop offset="0" stopColor="#d8f5c4" />
        <stop offset=".5" stopColor="#7cc16a" />
        <stop offset="1" stopColor="#4b8e3d" />
      </radialGradient>

      <clipPath id="bf-clip-up">
        <path d={UPPER} transform={WING_PARTS[0].inner} />
      </clipPath>
      <clipPath id="bf-clip-low">
        <path d={LOWER} transform={WING_PARTS[1].inner} />
      </clipPath>

      {/* bayang + bintik halus (tekstur kertas/kain) */}
      <filter id="bf-life" x="-25%" y="-20%" width="150%" height="160%">
        <feTurbulence type="fractalNoise" baseFrequency=".85" numOctaves="2" seed="4" result="noise" />
        <feColorMatrix in="noise" type="matrix" values="0 0 0 0 0.15  0 0 0 0 0.1  0 0 0 0 0.05  0.35 0 0 0 -0.14" result="speck" />
        <feComposite in="speck" in2="SourceAlpha" operator="in" result="grain" />
        <feDropShadow in="SourceGraphic" dx="0" dy="10" stdDeviation="8" floodColor="#1d3550" floodOpacity=".25" result="shadowed" />
        <feMerge>
          <feMergeNode in="shadowed" />
          <feMergeNode in="grain" />
        </feMerge>
      </filter>
      {/* bayang lembut sahaja (tanpa bintik) untuk badan & kepingan; kawasan besar supaya bayang tidak terpotong */}
      <filter id="bf-shadow" x="-40%" y="-30%" width="180%" height="190%">
        <feDropShadow dx="0" dy="8" stdDeviation="7" floodColor="#1d3550" floodOpacity=".22" />
      </filter>
      {/* bulu gebu pada pom-pom */}
      <filter id="bf-fuzz" x="-25%" y="-25%" width="150%" height="150%">
        <feTurbulence type="fractalNoise" baseFrequency=".9" numOctaves="2" seed="2" result="n" />
        <feDisplacementMap in="SourceGraphic" in2="n" scale="5" xChannelSelector="R" yChannelSelector="G" />
      </filter>
    </defs>
  );
}

// Rama-rama penuh: sayap, pom-pom, bunga bernombor dan badan.
function Board({ left, right, showNum, countHint, flap }) {
  // pom-pom dan nombor petunjuk berada dalam kumpulan sayap supaya ikut bergerak bila sayap mengibas
  const poms = (list) => (
    <>
      {list.map(([x, y], i) => (
        <Pom key={i} x={x} y={y} />
      ))}
      {countHint &&
        list.map(([x, y], i) => (
          <g key={`n${i}`} className="g-hint-num" style={{ '--i': i }} transform={`translate(${x + 14} ${y - 16})`}>
            <circle r="13" fill="#ffb703" stroke="#fff" strokeWidth="3" />
            <text className="g-small" y="6" textAnchor="middle" fontSize="16">
              {i + 1}
            </text>
          </g>
        ))}
    </>
  );
  return (
    <g>
      {/* bunga melekat di hujung sayap dan ikut bergerak bersama sayap */}
      <g className={`bf-wing${flap ? ' is-flap' : ''}`}>
        <Wing />
        {poms(pomsFor(left, false))}
        <Flower x={160} y={64} tone="pink" label={showNum ? left : '?'} />
      </g>
      <g className={`bf-wing bf-wing-r${flap ? ' is-flap' : ''}`}>
        <g transform="translate(1000 0) scale(-1 1)">
          <Wing />
        </g>
        {poms(pomsFor(right, true))}
        <Flower x={840} y={64} tone="purple" label={showNum ? right : '?'} />
      </g>
      <Body />
    </g>
  );
}

const inSlot = (x, y) => Math.hypot(x - SLOT.x, y - SLOT.y) <= SLOT.r + 40;

export default function ButterflyGame({ q, board, setBoard, fail, succeed, solved, hint, tap }) {
  const answer = answerFor(q);
  const { tried, placed } = board;

  const place = (id) => {
    if (solved || tried.includes(id)) return;
    tap('tap');
    if (id === answer) succeed({ ...board, placed: id });
    else fail({ ...board, tried: [...tried, id] });
  };

  // Mesti seret: ketik sahaja hanya menggoyangkan kepingan sebagai isyarat "seret saya".
  const [wiggle, setWiggle] = useState(null); // { id, n } — n berubah supaya animasi bermula semula
  const dd = useDragDrop({
    disabled: solved,
    hitTest: (x, y) => (inSlot(x, y) ? 'body' : null),
    onDrop: (id) => place(id),
    onPick: (id) => place(id),
    tapToPick: false,
    onTap: (id) => setWiggle((w) => ({ id, n: (w?.n ?? 0) + 1 })),
  });

  const armed = Boolean(dd.drag);
  const dragPiece = dd.drag && PIECES.find((c) => c.id === dd.drag.id);

  return (
    <svg ref={dd.svgRef} className="g-stage" viewBox={`0 0 1000 ${VIEW_H}`} role="group" aria-label={`Rama-rama: sayap kiri ${q.left} pom-pom, sayap kanan ${q.right} pom-pom`}>
      <BenchDefs />
      <PomDefs />
      <Bench />
      <Board left={q.left} right={q.right} showNum={solved || hint || q.showNumbers} countHint={hint} flap={solved} />

      {/* tempat sambungan badan (dada) rama-rama */}
      <g className={`bf-slot${armed ? ' is-armed' : ''}${dd.drag?.over === 'body' ? ' is-over' : ''}`} transform={`translate(${SLOT.x} ${SLOT.y})`}>
        {placed ? (
          <g className="bf-placed">
            <BodyPiece symbol={placed} />
          </g>
        ) : (
          <>
            <circle r={SLOT.r} fill="#fff6e2" fillOpacity=".92" stroke={OUT} strokeWidth="4" strokeDasharray="9 7" />
            <text y="16" textAnchor="middle" fontSize="44" fontWeight="900" fill="#b48a2c">
              ?
            </text>
          </>
        )}
      </g>
      {solved && <Tick x={SLOT.x + 48} y={SLOT.y - 44} />}

      {/* sambungan badan bersimbol */}
      {PIECES.map((c) => {
        const isTried = tried.includes(c.id);
        const used = placed === c.id;
        return (
          <g
            key={c.id}
            className={`bf-piece${isTried ? ' is-tried' : ''}${dd.drag?.id === c.id ? ' is-ghosted' : ''}`}
            transform={`translate(${c.x} ${PIECE_Y})`}
            {...dd.bindItem(c.id, `Sambungan badan ${c.id}, ${c.label}${isTried ? ', cuba lagi' : ''}`, { inactive: isTried || used })}
          >
            {used ? (
              // tempat kosong di bangku selepas sambungan dipindah ke badan
              <circle r="46" fill="rgba(255,255,255,.5)" stroke="#d9c39a" strokeWidth="3" strokeDasharray="7 6" />
            ) : (
              <>
                <circle r="58" fill="transparent" />
                <g key={wiggle?.id === c.id ? wiggle.n : 0} className={wiggle?.id === c.id ? 'bf-wiggle' : undefined}>
                  <BodyPiece symbol={c.id} faded={isTried} />
                </g>
                {isTried && <Bang x={40} y={-40} />}
              </>
            )}
            <PieceLabel text={c.label} faded={isTried || used} />
          </g>
        );
      })}

      {dragPiece && (
        <g className="g-ghost bf-drag" transform={`translate(${dragPiece.x + dd.drag.dx} ${PIECE_Y + dd.drag.dy})`}>
          <BodyPiece symbol={dragPiece.id} />
        </g>
      )}
    </svg>
  );
}

export function Demo() {
  return (
    <svg className="demo-svg" viewBox={`0 0 1000 ${VIEW_H}`} aria-hidden="true">
      <BenchDefs />
      <PomDefs />
      <Bench />
      <Board left={3} right={1} showNum={false} />
      <g transform={`translate(${SLOT.x} ${SLOT.y})`}>
        <circle r={SLOT.r} fill="#fff6e2" fillOpacity=".92" stroke={OUT} strokeWidth="4" strokeDasharray="9 7" />
      </g>
      {PIECES.filter((c) => c.id !== '>').map((c) => (
        <g key={c.id} transform={`translate(${c.x} ${PIECE_Y})`}>
          <BodyPiece symbol={c.id} />
        </g>
      ))}
      <g transform={`translate(${PIECES[0].x} ${PIECE_Y})`}>
        <g className="bf-demo-move">
          <BodyPiece symbol=">" />
          <g transform="translate(26 30) scale(1.4)">
            <Hand />
          </g>
        </g>
      </g>
    </svg>
  );
}

export const demoText =
  'Bandingkan pom-pom pada sayap kiri dengan sayap kanan. Seret sambungan badan ke dada rama-rama: > jika kiri lebih banyak, < jika kiri lebih sedikit, = jika sama banyak.';
