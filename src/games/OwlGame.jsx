import { useState } from 'react';
import { Bang, Hand, Tick } from './GameArt.jsx';
import { useDragDrop } from './useDragDrop.js';
import { answerFor, Bench, BenchDefs, OUT, PIECES, PIECE_Y, PieceLabel, VIEW_H } from './ButterflyGame.jsx';

// Banyak dan Sedikit: burung hantu tanpa paruh.
// Sayap kiri dan kanan ada bulu oren. Murid lengkapkan muka burung hantu dengan paruh bersimbol (>, <, =)
// yang membandingkan bulu kiri dengan bulu kanan, sama seperti melengkapkan badan rama-rama.
// Mesti seret (ketik sahaja hanya menggoyangkan paruh). Bila betul, burung hantu mengibas sayap dan berkelip sekali.
// Logik jawapan sama dengan rama-rama (q.left, q.right).

export { answerFor, init, restore } from './ButterflyGame.jsx';

const SLOT = { x: 500, y: 228, r: 48 };

// Tempat bulu oren pada sayap kiri (sayap kanan ialah cerminan). Dikira dengan "titik paling jauh" di dalam
// panel sayap (elips condong), >= 64px antara satu sama lain dan jauh dari badan.
const FEATHERS = [
  [162, 262], [346, 332], [250, 300], [118, 348], [362, 232],
  [206, 382], [276, 218], [280, 368], [312, 276], [178, 324],
];
const feathersFor = (n, mirror) => FEATHERS.slice(0, n).map(([x, y]) => [mirror ? 1000 - x : x, y]);

const SENTENCE = { '>': 'lebih banyak daripada', '<': 'lebih sedikit daripada', '=': 'sama banyak dengan' };
export function prompt(q, solved) {
  return solved ? `Bulu kiri ${SENTENCE[answerFor(q)]} bulu kanan!` : 'Bulu kiri ___ bulu kanan?';
}

// ---------- Lukisan ----------

const WING_T = 'translate(250 300) rotate(-18)';
// Bulu terbang (primer) di tepi bawah sayap: [x, y, sudut] dalam koordinat sayap.
const PRIMARIES = [
  [-150, 40, 40], [-118, 66, 30], [-80, 84, 20], [-40, 96, 12], [0, 100, 6], [40, 98, 0], [80, 90, -6],
];

function Wing() {
  return (
    <g filter="url(#ow-shadow)">
      <g transform={WING_T}>
        {PRIMARIES.map(([x, y, a]) => (
          <ellipse key={x} cx={x} cy={y} rx="26" ry="44" transform={`rotate(${a} ${x} ${y})`} fill="url(#ow-wing-dark)" stroke={OUT} strokeWidth="4" />
        ))}
        <ellipse rx="175" ry="105" fill="url(#ow-wing)" stroke={OUT} strokeWidth="5" />
        <ellipse rx="148" ry="82" fill="url(#ow-wing-in)" />
        {/* garis bulu halus */}
        {[-90, -30, 30, 90].map((x) => (
          <path key={x} d={`M${x} -70 Q${x + 14} 0 ${x} 70`} fill="none" stroke="#5a3418" strokeWidth="2.5" opacity=".18" />
        ))}
        <ellipse cx="-40" cy="-60" rx="90" ry="18" fill="#fff" opacity=".22" filter="url(#bf-blur6)" />
      </g>
    </g>
  );
}

// Bulu oren yang dikira: bentuk daun bulu dengan batang di tengah, condong ikut sayap.
function Feather({ x, y, mirror }) {
  return (
    <g transform={`translate(${x} ${y}) rotate(${mirror ? 18 : -18})`}>
      <ellipse cx="3" cy="22" rx="14" ry="6" fill="#3b1e08" opacity=".3" filter="url(#bf-blur1)" />
      <path d="M0 -26 C16 -12 15 12 0 26 C-15 12 -16 -12 0 -26 Z" fill="url(#ow-feather)" stroke="#7a3a08" strokeWidth="2.5" />
      <path d="M0 -20 V24" stroke="#b9580e" strokeWidth="2.2" strokeLinecap="round" />
      <path d="M0 -6 L8 -12 M0 4 L9 -2 M0 -6 L-8 -12 M0 4 L-9 -2" stroke="#b9580e" strokeWidth="1.6" strokeLinecap="round" opacity=".7" />
      <ellipse cx="-5" cy="-10" rx="3.5" ry="7" fill="#fff" opacity=".55" />
    </g>
  );
}

// Lencana bilangan: bulan dengan nombor.
function Badge({ x, y, label }) {
  return (
    <g transform={`translate(${x} ${y})`} filter="url(#bf-drop)">
      <path d="M-46 -26 l3 7 7 3 -7 3 -3 7 -3 -7 -7 -3 7 -3 Z" fill="#fff6c4" />
      <path d="M44 22 l2 5 5 2 -5 2 -2 5 -2 -5 -5 -2 5 -2 Z" fill="#fff6c4" />
      <circle r="36" fill="url(#ow-moon)" stroke={OUT} strokeWidth="4" />
      <circle cx="-14" cy="12" r="6" fill="#e6c25a" opacity=".6" />
      <circle cx="16" cy="-14" r="4" fill="#e6c25a" opacity=".6" />
      <circle r="25" fill="url(#bf-label)" stroke={OUT} strokeWidth="3" />
      <text y="12" textAnchor="middle" fontSize="34" fontWeight="900" fill={OUT}>
        {label}
      </text>
    </g>
  );
}

function Eye({ x, blink }) {
  return (
    <g transform={`translate(${x} 145)`}>
      <circle r="44" fill="#fff8e8" stroke={OUT} strokeWidth="5" />
      <circle r="31" fill="url(#ow-iris)" />
      <circle r="17" fill="#1e120a" />
      <circle cx="-8" cy="-9" r="7" fill="#fff" />
      <circle cx="7" cy="8" r="3" fill="#fff" opacity=".8" />
      {/* kelopak mata (berkelip sekali bila betul) */}
      {blink && <ellipse className="ow-lid" rx="46" ry="46" fill="url(#ow-head)" stroke={OUT} strokeWidth="5" />}
    </g>
  );
}

function Body({ blink }) {
  return (
    <g>
      {/* bayang di atas rumput */}
      <ellipse cx="500" cy="470" rx="150" ry="16" fill="#2f4a12" opacity=".3" filter="url(#bf-blur6)" />
      <g filter="url(#ow-shadow)">
        <ellipse cx="500" cy="330" rx="125" ry="125" fill="url(#ow-body)" stroke={OUT} strokeWidth="5" />
        <ellipse cx="500" cy="356" rx="84" ry="92" fill="url(#ow-belly)" />
      </g>
      {/* corak V pada dada (hiasan, tidak dikira) */}
      {[
        [470, 320], [530, 320], [500, 352], [470, 384], [530, 384], [500, 416],
      ].map(([x, y]) => (
        <path key={`${x}${y}`} d={`M${x - 10} ${y - 4} Q${x} ${y + 6} ${x + 10} ${y - 4}`} fill="none" stroke="#b08452" strokeWidth="3" strokeLinecap="round" opacity=".6" />
      ))}
      {/* kaki */}
      {[468, 532].map((x) => (
        <g key={x} transform={`translate(${x} 452)`}>
          {[-12, 0, 12].map((d) => (
            <ellipse key={d} cx={d} cy="0" rx="7" ry="11" fill="#f6a531" stroke={OUT} strokeWidth="3" />
          ))}
        </g>
      ))}

      {/* kepala dengan jambul telinga */}
      <g filter="url(#ow-shadow)">
        <path d="M392 92 L378 20 L446 62 Z" fill="url(#ow-head)" stroke={OUT} strokeWidth="5" strokeLinejoin="round" />
        <path d="M608 92 L622 20 L554 62 Z" fill="url(#ow-head)" stroke={OUT} strokeWidth="5" strokeLinejoin="round" />
        <ellipse cx="500" cy="155" rx="140" ry="112" fill="url(#ow-head)" stroke={OUT} strokeWidth="5" />
      </g>
      {/* cakera muka */}
      <circle cx="440" cy="148" r="62" fill="url(#ow-face)" />
      <circle cx="560" cy="148" r="62" fill="url(#ow-face)" />
      <ellipse cx="430" cy="62" rx="50" ry="12" transform="rotate(-10 430 62)" fill="#fff" opacity=".3" filter="url(#bf-blur6)" />
      <Eye x={440} blink={blink} />
      <Eye x={560} blink={blink} />
      <circle cx="404" cy="205" r="12" fill="#ff8fa0" opacity=".45" filter="url(#bf-blur3)" />
      <circle cx="596" cy="205" r="12" fill="#ff8fa0" opacity=".45" filter="url(#bf-blur3)" />
    </g>
  );
}

// Paruh bersimbol: kepingan yang melengkapkan muka burung hantu.
function Beak({ symbol, faded = false }) {
  return (
    <g opacity={faded ? 0.4 : 1}>
      <ellipse cx="4" cy="56" rx="36" ry="8" fill="#3b2a1a" opacity=".25" filter="url(#bf-blur3)" />
      <path d="M-46 -34 Q0 -52 46 -34 Q40 12 0 54 Q-40 12 -46 -34 Z" fill="url(#ow-beak)" stroke={OUT} strokeWidth="5" strokeLinejoin="round" filter="url(#ow-shadow)" />
      <path d="M-30 -30 Q0 -40 30 -30" fill="none" stroke="#fff3c0" strokeWidth="4" strokeLinecap="round" opacity=".7" />
      <text y="10" textAnchor="middle" fontSize="50" fontWeight="900" fill="#fff" stroke={OUT} strokeWidth="9" strokeLinejoin="round" paintOrder="stroke">
        {symbol}
      </text>
    </g>
  );
}

function OwlDefs() {
  return (
    <defs>
      <radialGradient id="ow-wing" cx=".35" cy=".3" r=".9">
        <stop offset="0" stopColor="#a87046" />
        <stop offset="1" stopColor="#6b3f1f" />
      </radialGradient>
      <radialGradient id="ow-wing-in" cx=".4" cy=".35" r=".8">
        <stop offset="0" stopColor="#c99566" />
        <stop offset="1" stopColor="#9a6438" />
      </radialGradient>
      <linearGradient id="ow-wing-dark" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stopColor="#7a4a26" />
        <stop offset="1" stopColor="#4f2e14" />
      </linearGradient>
      <radialGradient id="ow-body" cx=".4" cy=".3" r=".8">
        <stop offset="0" stopColor="#b98457" />
        <stop offset="1" stopColor="#7c4c27" />
      </radialGradient>
      <radialGradient id="ow-belly" cx=".45" cy=".35" r=".75">
        <stop offset="0" stopColor="#fff4dc" />
        <stop offset="1" stopColor="#ecd2a4" />
      </radialGradient>
      <radialGradient id="ow-head" cx=".38" cy=".3" r=".8">
        <stop offset="0" stopColor="#c2915f" />
        <stop offset="1" stopColor="#85532c" />
      </radialGradient>
      <radialGradient id="ow-face" cx=".5" cy=".5" r=".6">
        <stop offset=".6" stopColor="#f4e0bd" />
        <stop offset="1" stopColor="#dcbb88" />
      </radialGradient>
      <radialGradient id="ow-iris" cx=".4" cy=".35" r=".7">
        <stop offset="0" stopColor="#ffe680" />
        <stop offset="1" stopColor="#f0a812" />
      </radialGradient>
      <radialGradient id="ow-feather" cx=".4" cy=".3" r=".8">
        <stop offset="0" stopColor="#ffd08a" />
        <stop offset=".55" stopColor="#ff9c33" />
        <stop offset="1" stopColor="#e9741a" />
      </radialGradient>
      <linearGradient id="ow-beak" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stopColor="#ffd45c" />
        <stop offset="1" stopColor="#f29a1a" />
      </linearGradient>
      <radialGradient id="ow-moon" cx=".4" cy=".35" r=".75">
        <stop offset="0" stopColor="#fffbe0" />
        <stop offset="1" stopColor="#f6d66b" />
      </radialGradient>
      <filter id="ow-shadow" x="-40%" y="-30%" width="180%" height="190%">
        <feDropShadow dx="0" dy="8" stdDeviation="7" floodColor="#1d3550" floodOpacity=".25" />
      </filter>
    </defs>
  );
}

function Board({ left, right, showNum, countHint, happy }) {
  const feathers = (list, mirror) => (
    <>
      {list.map(([x, y], i) => (
        <Feather key={i} x={x} y={y} mirror={mirror} />
      ))}
      {countHint &&
        list.map(([x, y], i) => (
          <g key={`n${i}`} className="g-hint-num" style={{ '--i': i }} transform={`translate(${x + 16} ${y - 22})`}>
            <circle r="13" fill="#ffb703" stroke="#fff" strokeWidth="3" />
            <text className="g-small" y="6" textAnchor="middle" fontSize="16">
              {i + 1}
            </text>
          </g>
        ))}
    </>
  );
  const flap = happy ? ' is-flap' : '';
  return (
    <g>
      {/* bulu & lencana ikut sayap supaya bergerak bersama bila mengibas */}
      <g className={`ow-wing${flap}`}>
        <Wing />
        {feathers(feathersFor(left, false), false)}
        <Badge x={110} y={150} label={showNum ? left : '?'} />
      </g>
      <g className={`ow-wing ow-wing-r${flap}`}>
        <g transform="translate(1000 0) scale(-1 1)">
          <Wing />
        </g>
        {feathers(feathersFor(right, true), true)}
        <Badge x={890} y={150} label={showNum ? right : '?'} />
      </g>
      <Body blink={happy} />
      {happy && (
        <g className="ow-huhu" aria-hidden="true">
          <text x="660" y="40" textAnchor="middle" fontSize="42" fontWeight="900" fill="#fff" stroke={OUT} strokeWidth="9" strokeLinejoin="round" paintOrder="stroke" transform="rotate(8 660 40)">
            Hu hu!
          </text>
        </g>
      )}
    </g>
  );
}

const inSlot = (x, y) => Math.hypot(x - SLOT.x, y - SLOT.y) <= SLOT.r + 40;

export default function OwlGame({ q, board, fail, succeed, solved, hint, tap }) {
  const answer = answerFor(q);
  const { tried, placed } = board;

  const place = (id) => {
    if (solved || tried.includes(id)) return;
    tap('tap');
    if (id === answer) succeed({ ...board, placed: id });
    else fail({ ...board, tried: [...tried, id] });
  };

  // Mesti seret: ketik sahaja hanya menggoyangkan paruh sebagai isyarat "seret saya".
  const [wiggle, setWiggle] = useState(null); // { id, n }: n berubah supaya animasi bermula semula
  const dd = useDragDrop({
    disabled: solved,
    hitTest: (x, y) => (inSlot(x, y) ? 'beak' : null),
    onDrop: (id) => place(id),
    onPick: (id) => place(id),
    tapToPick: false,
    onTap: (id) => setWiggle((w) => ({ id, n: (w?.n ?? 0) + 1 })),
  });

  const armed = Boolean(dd.drag);
  const dragPiece = dd.drag && PIECES.find((c) => c.id === dd.drag.id);

  return (
    <svg ref={dd.svgRef} className="g-stage" viewBox={`0 0 1000 ${VIEW_H}`} role="group" aria-label={`Burung hantu: sayap kiri ${q.left} bulu oren, sayap kanan ${q.right} bulu oren`}>
      <BenchDefs />
      <OwlDefs />
      <Bench />
      <Board left={q.left} right={q.right} showNum={solved || hint || q.showNumbers} countHint={hint} happy={solved} />

      {/* tempat paruh pada muka */}
      <g className={`bf-slot${armed ? ' is-armed' : ''}${dd.drag?.over === 'beak' ? ' is-over' : ''}`} transform={`translate(${SLOT.x} ${SLOT.y})`}>
        {placed ? (
          <g className="bf-placed">
            <Beak symbol={placed} />
          </g>
        ) : (
          <>
            <circle r={SLOT.r} fill="#fff6e2" fillOpacity=".85" stroke={OUT} strokeWidth="4" strokeDasharray="9 7" />
            <text y="16" textAnchor="middle" fontSize="44" fontWeight="900" fill="#b48a2c">
              ?
            </text>
          </>
        )}
      </g>
      {solved && <Tick x={SLOT.x + 50} y={SLOT.y - 40} />}

      {PIECES.map((c) => {
        const isTried = tried.includes(c.id);
        const used = placed === c.id;
        return (
          <g
            key={c.id}
            className={`bf-piece${isTried ? ' is-tried' : ''}${dd.drag?.id === c.id ? ' is-ghosted' : ''}`}
            transform={`translate(${c.x} ${PIECE_Y})`}
            {...dd.bindItem(c.id, `Paruh ${c.id}, ${c.label}${isTried ? ', cuba lagi' : ''}`, { inactive: isTried || used })}
          >
            {used ? (
              <circle r="46" fill="rgba(255,255,255,.5)" stroke="#d9c39a" strokeWidth="3" strokeDasharray="7 6" />
            ) : (
              <>
                <circle r="58" fill="transparent" />
                <g key={wiggle?.id === c.id ? wiggle.n : 0} className={wiggle?.id === c.id ? 'bf-wiggle' : undefined}>
                  <Beak symbol={c.id} faded={isTried} />
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
          <Beak symbol={dragPiece.id} />
        </g>
      )}
    </svg>
  );
}

export function Demo() {
  return (
    <svg className="demo-svg" viewBox={`0 0 1000 ${VIEW_H}`} aria-hidden="true">
      <BenchDefs />
      <OwlDefs />
      <Bench />
      <Board left={3} right={1} showNum={false} />
      <g transform={`translate(${SLOT.x} ${SLOT.y})`}>
        <circle r={SLOT.r} fill="#fff6e2" fillOpacity=".85" stroke={OUT} strokeWidth="4" strokeDasharray="9 7" />
      </g>
      {PIECES.filter((c) => c.id !== '>').map((c) => (
        <g key={c.id} transform={`translate(${c.x} ${PIECE_Y})`}>
          <Beak symbol={c.id} />
        </g>
      ))}
      <g transform={`translate(${PIECES[0].x} ${PIECE_Y})`}>
        <g className="ow-demo-move">
          <Beak symbol=">" />
          <g transform="translate(26 30) scale(1.4)">
            <Hand />
          </g>
        </g>
      </g>
    </svg>
  );
}

export const demoText =
  'Kira bulu oren pada sayap kiri dan sayap kanan. Seret paruh ke muka burung hantu: > jika kiri lebih banyak, < jika kiri lebih sedikit, = jika sama banyak.';
