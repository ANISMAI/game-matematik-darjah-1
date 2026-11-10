import { useRef, useState } from 'react';
import { Bang, Hand, Tick } from './GameArt.jsx';
import { useDragDrop } from './useDragDrop.js';
import { Bench, BenchDefs, OUT, PIECE_Y, VIEW_H } from './ButterflyGame.jsx';
import { CAR_COLORS, TopCar } from './TraceGame.jsx';

// Kenali Sifar: tempat letak kereta.
// Ada q.start kereta di petak. Murid tekan kereta untuk memandunya keluar, sehingga q.out kereta keluar.
// Kemudian murid seret kad nombor ke papan "Tinggal" untuk menjawab berapa kereta masih ada.
// Kebanyakan soalan berakhir dengan tempat letak kosong = 0; ada soalan perangkap (masih ada kereta) supaya
// murid mengira, bukan meneka 0. Kad jawapan mesti diseret (ketik hanya menggoyangkan kad).

const BAYS = 5;
const BAY_X = (i) => 260 + i * 120; // pusat petak
const BAY_Y = 132;
const ORDER = [2, 0, 4, 1, 3]; // petak yang diisi dahulu supaya kereta tersebar
const SLOT = { x: 905, y: 196, r: 46 };
const CARD_XS = [290, 430, 570, 710];

export const answerFor = (q) => q.start - q.out;
const baysFor = (q) => ORDER.slice(0, q.start).sort((a, b) => a - b);
const choicesFor = (q) => q.choices ?? [0, 1, 2, 3];

export function prompt(q, solved) {
  const ans = answerFor(q);
  if (solved) return ans === 0 ? 'Tiada kereta tinggal. Itu sifar (0)!' : `${ans} kereta tinggal.`;
  return q.out > 0 ? `Keluarkan ${q.out} kereta. Berapa tinggal?` : 'Berapa kereta di tempat letak ini?';
}

// gone = petak yang keretanya sudah keluar; tried = kad salah; placed = kad betul.
export function init() {
  return { gone: [], tried: [], placed: null };
}

export function restore(b, q) {
  return Array.isArray(b?.gone) && Array.isArray(b.tried) && b.gone.length <= q.out;
}

// ---------- Lukisan ----------

// Kawasan tempat letak: asfalt, petak bergaris, lorong keluar ke kiri dan papan P.
function Lot() {
  return (
    <g pointerEvents="none">
      {/* jalan keluar di kiri */}
      <rect x="-20" y="262" width="220" height="104" fill="#4a4f57" stroke={OUT} strokeWidth="5" />
      <path d="M0 314 H170" stroke="#fff" strokeWidth="5" strokeDasharray="18 14" />
      <rect x="170" y="40" width="680" height="340" rx="26" fill="#4a4f57" stroke={OUT} strokeWidth="6" />
      {/* tutup garis luar di pintu keluar supaya lorong bersambung */}
      <rect x="160" y="265" width="20" height="98" fill="#4a4f57" />
      <rect x="182" y="52" width="656" height="316" rx="18" fill="none" stroke="#5a606a" strokeWidth="3" />
      {/* garis petak */}
      {Array.from({ length: BAYS + 1 }, (_, i) => (
        <path key={i} d={`M${200 + i * 120} 56 V218`} stroke="#fff" strokeWidth="6" strokeLinecap="round" />
      ))}
      <path d="M200 218 H800" stroke="#f6d34a" strokeWidth="4" strokeDasharray="14 12" opacity=".8" />
      {/* anak panah berbatang menghala ke pintu keluar (bukan "<" supaya tidak keliru dengan simbol matematik) */}
      {[650, 470, 310].map((x) => (
        <path key={x} d={`M${x + 34} 314 H${x - 4} M${x + 10} 300 L${x - 6} 314 L${x + 10} 328`} fill="none" stroke="#fff" strokeWidth="6" strokeLinecap="round" strokeLinejoin="round" opacity=".85" />
      ))}
      <g transform="translate(120 70)">
        <rect x="-4" y="20" width="8" height="74" fill="#8b939c" stroke={OUT} strokeWidth="2.5" />
        <rect x="-26" y="-26" width="52" height="52" rx="9" fill="#2f7fe0" stroke={OUT} strokeWidth="4" />
        <text y="15" textAnchor="middle" fontSize="40" fontWeight="900" fill="#fff">
          P
        </text>
      </g>
      <text x="96" y="252" textAnchor="middle" fontSize="20" fontWeight="900" fill="#fff" stroke={OUT} strokeWidth="5" paintOrder="stroke">
        KELUAR
      </text>
    </g>
  );
}

// Papan "Tinggal" tempat kad jawapan diletakkan.
function Sign({ children }) {
  return (
    <g>
      <rect x={SLOT.x - 5} y={SLOT.y + 50} width="10" height="150" fill="#8b5a2b" stroke={OUT} strokeWidth="3" />
      <rect x={SLOT.x - 62} y={SLOT.y - 112} width="124" height="170" rx="16" fill="#fff6e2" stroke={OUT} strokeWidth="5" />
      <text x={SLOT.x} y={SLOT.y - 76} textAnchor="middle" fontSize="22" fontWeight="900" fill={OUT}>
        Tinggal
      </text>
      {children}
    </g>
  );
}

// Kad nombor (cakera kayu).
function Card({ n, faded = false }) {
  return (
    <g opacity={faded ? 0.4 : 1}>
      <ellipse cx="3" cy="44" rx="38" ry="8" fill="#3b2a1a" opacity=".25" />
      <circle r="44" fill="#fffaf0" stroke={OUT} strokeWidth="5" />
      <circle r="36" fill="none" stroke="#e9c98f" strokeWidth="3" />
      <text y="17" textAnchor="middle" fontSize="50" fontWeight="900" fill={OUT}>
        {n}
      </text>
    </g>
  );
}

const inSlot = (x, y) => Math.hypot(x - SLOT.x, y - SLOT.y) <= SLOT.r + 46;

export default function ParkingGame({ q, board, setBoard, fail, succeed, solved, hint, tap }) {
  const answer = answerFor(q);
  const { tried, placed } = board;
  // senarai kereta keluar disimpan dalam ref supaya tekanan pantas berturut-turut tidak menimpa satu sama lain
  const goneRef = useRef(board.gone);
  const [gone, setGone] = useState(board.gone);
  const ready = gone.length >= q.out; // semua kereta yang diminta sudah keluar
  const [leaving, setLeaving] = useState([]); // kereta yang sedang dipandu keluar (animasi sesi ini)
  const [wiggle, setWiggle] = useState(null); // { id, n }
  const nudge = (id) => setWiggle((w) => ({ id, n: (w?.n ?? 0) + 1 }));

  const drive = (bay) => {
    const g = goneRef.current;
    if (solved || g.includes(bay)) return;
    if (g.length >= q.out) {
      nudge(`car${bay}`); // sudah cukup kereta keluar
      return;
    }
    tap('tap');
    const next = [...g, bay];
    goneRef.current = next;
    setGone(next);
    setLeaving((l) => [...l, bay]);
    setBoard({ ...board, gone: next });
  };

  const choose = (n) => {
    if (solved || !ready || tried.includes(n)) return;
    tap('tap');
    if (n === answer) succeed({ ...board, placed: n });
    else fail({ ...board, tried: [...tried, n] });
  };

  const dd = useDragDrop({
    disabled: solved || !ready,
    hitTest: (x, y) => (inSlot(x, y) ? 'sign' : null),
    onDrop: (id) => choose(id),
    onPick: (id) => choose(id),
    tapToPick: false,
    onTap: (id) => nudge(id),
  });

  const parked = baysFor(q);
  const dragCard = dd.drag && dd.drag.id;

  return (
    <svg ref={dd.svgRef} className="g-stage" viewBox={`0 0 1000 ${VIEW_H}`} role="group" aria-label={`Tempat letak kereta dengan ${q.start} kereta`}>
      <BenchDefs />
      <defs>
        <filter id="tr-blur3" x="-60%" y="-60%" width="220%" height="220%">
          <feGaussianBlur stdDeviation="3" />
        </filter>
      </defs>
      <Bench />
      <Lot />

      {/* kereta di petak; tekan untuk pandu keluar */}
      {parked.map((bay) => {
        const isGone = gone.includes(bay);
        const isLeaving = leaving.includes(bay);
        if (isGone && !isLeaving) return null;
        const w = wiggle?.id === `car${bay}`;
        return (
          <g
            key={bay}
            transform={`translate(${BAY_X(bay)} ${BAY_Y})`}
            role="button"
            tabIndex={isGone || solved ? -1 : 0}
            aria-label={`Kereta di petak ${bay + 1}${ready ? '' : ', tekan untuk keluarkan'}`}
            className="pk-spot"
            onMouseDown={(e) => e.preventDefault() /* tekan dengan tetikus/jari tidak meninggalkan kotak fokus */}
            onClick={() => drive(bay)}
            onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && (e.preventDefault(), drive(bay))}
          >
            <rect x="-56" y="-76" width="112" height="152" fill="transparent" />
            <g key={w ? wiggle.n : 0} className={w ? 'bf-wiggle' : undefined}>
              <g className={`pk-car${isLeaving ? ' is-leaving' : ''}`} style={{ '--dx': `${-BAY_X(bay) - 120}px` }}>
                <TopCar color={CAR_COLORS[bay % CAR_COLORS.length]} />
              </g>
            </g>
          </g>
        );
      })}

      {/* sifar: bila semua petak kosong, serlahkan kawasan petak; selepas betul, tunjuk "0 kereta" */}
      {ready && parked.every((b) => gone.includes(b)) && (
        <g className="pk-empty" pointerEvents="none">
          <rect x="204" y="58" width="592" height="158" rx="14" fill="#ffd23f" fillOpacity=".12" stroke="#ffd23f" strokeWidth="7" />
          {solved && (
            <text className="pk-zero" x="500" y="156" textAnchor="middle" fontSize="64" fontWeight="900" fill="#fff" stroke={OUT} strokeWidth="10" strokeLinejoin="round" paintOrder="stroke">
              0 kereta
            </text>
          )}
        </g>
      )}

      {/* petunjuk: kira kereta yang masih di petak */}
      {hint &&
        ready &&
        parked
          .filter((b) => !gone.includes(b))
          .map((b, i) => (
            <g key={`h${b}`} className="g-hint-num" style={{ '--i': i }} transform={`translate(${BAY_X(b) + 34} ${BAY_Y - 58})`}>
              <circle r="15" fill="#ffb703" stroke="#fff" strokeWidth="3" />
              <text className="g-small" y="6" textAnchor="middle" fontSize="18">
                {i + 1}
              </text>
            </g>
          ))}

      <Sign>
        <g className={`bf-slot${dd.drag ? ' is-armed' : ''}${dd.drag?.over === 'sign' ? ' is-over' : ''}`} transform={`translate(${SLOT.x} ${SLOT.y})`}>
          {placed !== null ? (
            <g className="bf-placed">
              <Card n={placed} />
            </g>
          ) : (
            <>
              <circle r={SLOT.r} fill="#fff" stroke={OUT} strokeWidth="4" strokeDasharray="9 7" opacity={ready ? 1 : 0.5} />
              <text y="16" textAnchor="middle" fontSize="44" fontWeight="900" fill="#b48a2c" opacity={ready ? 1 : 0.5}>
                ?
              </text>
            </>
          )}
        </g>
      </Sign>
      {solved && <Tick x={SLOT.x + 44} y={SLOT.y - 42} />}

      {/* kad nombor di bangku; aktif selepas kereta dikeluarkan */}
      {choicesFor(q).map((n, i) => {
        const isTried = tried.includes(n);
        const used = placed === n;
        const w = wiggle?.id === n;
        return (
          <g
            key={n}
            className={`bf-piece${isTried ? ' is-tried' : ''}${dragCard === n ? ' is-ghosted' : ''}`}
            transform={`translate(${CARD_XS[i]} ${PIECE_Y})`}
            {...dd.bindItem(n, `Kad nombor ${n}${isTried ? ', cuba lagi' : ''}`, { inactive: isTried || used || !ready })}
          >
            {used ? (
              <circle r="44" fill="rgba(255,255,255,.5)" stroke="#d9c39a" strokeWidth="3" strokeDasharray="7 6" />
            ) : (
              <>
                <circle r="56" fill="transparent" />
                <g key={w ? wiggle.n : 0} className={w ? 'bf-wiggle' : undefined}>
                  <Card n={n} faded={isTried || !ready} />
                </g>
                {isTried && <Bang x={38} y={-38} />}
              </>
            )}
          </g>
        );
      })}

      {dragCard !== null && dragCard !== undefined && (
        <g className="g-ghost bf-drag" transform={`translate(${CARD_XS[choicesFor(q).indexOf(dragCard)] + dd.drag.dx} ${PIECE_Y + dd.drag.dy})`}>
          <Card n={dragCard} />
        </g>
      )}
    </svg>
  );
}

export function Demo() {
  return (
    <svg className="demo-svg" viewBox={`0 0 1000 ${VIEW_H}`} aria-hidden="true">
      <BenchDefs />
      <defs>
        <filter id="tr-blur3" x="-60%" y="-60%" width="220%" height="220%">
          <feGaussianBlur stdDeviation="3" />
        </filter>
      </defs>
      <Bench />
      <Lot />
      <g transform={`translate(${BAY_X(2)} ${BAY_Y})`}>
        <g className="pk-car pk-demo-leave" style={{ '--dx': `${-BAY_X(2) - 120}px` }}>
          <TopCar color={CAR_COLORS[2]} />
        </g>
      </g>
      <Sign>
        <circle cx={SLOT.x} cy={SLOT.y} r={SLOT.r} fill="#fff" stroke={OUT} strokeWidth="4" strokeDasharray="9 7" />
      </Sign>
      {[1, 2, 3].map((n, i) => (
        <g key={n} transform={`translate(${CARD_XS[i + 1]} ${PIECE_Y})`}>
          <Card n={n} />
        </g>
      ))}
      <g transform={`translate(${CARD_XS[0]} ${PIECE_Y})`}>
        <g className="pk-demo-card">
          <Card n={0} />
          <g transform="translate(26 30) scale(1.4)">
            <Hand />
          </g>
        </g>
      </g>
    </svg>
  );
}

export const demoText =
  'Tekan kereta untuk memandunya keluar. Bila tiada kereta tinggal, itu sifar (0). Seret kad nombor ke papan "Tinggal".';
