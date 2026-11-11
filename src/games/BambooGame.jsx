import { useEffect, useRef, useState } from 'react';
import { Hand } from './GameArt.jsx';
import { useDragDrop } from './useDragDrop.js';
import { Bench, BenchDefs, OUT, PIECE_Y, PieceLabel, VIEW_H } from './ButterflyGame.jsx';

// Nilai Tempat: Ikat Buluh.
// 1 ikat buluh = 10 batang = 1 puluh; 1 batang = 1 sa.
// Murid bina nombor sasaran (q.n) dengan menyeret ikat buluh ke bakul PULUH dan batang buluh ke bakul SA.
// Papan nilai tempat di atas menunjukkan bilangan dalam setiap bakul sebagai digit (Puluh | Sa), jadi murid
// nampak kaitan antara digit dan tempatnya. 10 batang dalam bakul SA diikat sendiri menjadi 1 ikat dan
// berpindah ke bakul PULUH (10 sa = 1 puluh). Butang − mengeluarkan satu item; jawapan disemak dengan "Semak".

const BW = 250; // lebar bakul
const RIM_Y = 300; // bibir bakul
const BOT_Y = 440; // dasar bakul
const BASKETS = { puluh: 355, sa: 645 }; // pusat bakul (sejajar lajur papan nilai tempat)
const SRC = { ikat: 330, batang: 670 }; // longgokan di bangku
const MAX_TENS = 9;
const STICK_S = 0.86; // skala buluh di dalam bakul (batang dan ikat sama tinggi)

export const split = (n) => [Math.floor(n / 10), n % 10];

export function prompt(q, solved) {
  const [t, o] = split(q.n);
  return solved ? `Hebat! ${q.n} = ${t} puluh ${o} sa` : `Bina nombor ${q.n}`;
}

export function init() {
  return { puluh: 0, sa: 0 };
}

export function restore(b) {
  return Number.isInteger(b?.puluh) && Number.isInteger(b?.sa) && b.puluh >= 0 && b.puluh <= MAX_TENS && b.sa >= 0 && b.sa <= 9;
}

export function canCheck(b) {
  return b.puluh + b.sa > 0;
}

export function check(b, q) {
  const [t, o] = split(q.n);
  return { ok: b.puluh === t && b.sa === o };
}

// ---------- Lukisan ----------

// Sebatang buluh; (x, y) = pangkal batang.
function Stick({ x = 0, y = 0, a = 0, s = 1 }) {
  return (
    <g transform={`translate(${x} ${y}) rotate(${a}) scale(${s})`}>
      <rect x="-7" y="-124" width="14" height="124" rx="6" fill="url(#wb-stick)" stroke={OUT} strokeWidth="2.5" />
      {[-92, -56, -20].map((ny) => (
        <path key={ny} d={`M-7 ${ny} H7`} stroke="#2f6b1f" strokeWidth="3" />
      ))}
      <rect x="-4" y="-116" width="3" height="108" rx="1.5" fill="#fff" opacity=".35" />
      <ellipse cx="0" cy="-124" rx="7" ry="3" fill="#d9efb2" stroke={OUT} strokeWidth="2" />
    </g>
  );
}

// Seikat buluh: 10 batang diikat tali merah ninja; (x, y) = pangkal ikatan.
// gap = jarak antara batang dalam ikatan; ikatan rapat (gap kecil) digunakan dalam bakul supaya ikat boleh
// dilukis setinggi sebatang buluh tetapi masih muat 5 sebaris.
function Bundle({ x = 0, y = 0, s = 1, a = 0, gap = 9.5 }) {
  const half = 4.5 * gap + 7; // separuh lebar ikatan (hingga tepi batang luar)
  return (
    <g transform={`translate(${x} ${y}) rotate(${a}) scale(${s})`}>
      {Array.from({ length: 10 }, (_, k) => (
        <Stick key={k} x={(k - 4.5) * gap} y={k % 2 ? -4 : 0} />
      ))}
      {[-82, -34].map((ry) => (
        <g key={ry}>
          <rect x={-half - 3} y={ry} width={(half + 3) * 2} height="13" rx="6" fill="#d6283a" stroke={OUT} strokeWidth="2.5" />
          <path d={`M${-half + 3} ${ry + 4} H${half - 3}`} stroke="#ff8a96" strokeWidth="2.5" strokeLinecap="round" opacity=".7" />
        </g>
      ))}
      <circle cx="0" cy="-76" r="7" fill="#b81d33" stroke={OUT} strokeWidth="2.5" />
    </g>
  );
}

function BasketBack({ cx }) {
  return <ellipse cx={cx} cy={RIM_Y} rx={BW / 2} ry="24" fill="#5a3418" stroke={OUT} strokeWidth="4" />;
}

function BasketFront({ cx, label, shake }) {
  const l = cx - BW / 2;
  const r = cx + BW / 2;
  const body = `M${l} ${RIM_Y} L${l + 22} ${BOT_Y} Q${cx} ${BOT_Y + 18} ${r - 22} ${BOT_Y} L${r} ${RIM_Y} Q${cx} ${RIM_Y + 28} ${l} ${RIM_Y} Z`;
  return (
    <g className={shake ? 'wb-shake' : undefined}>
      <ellipse cx={cx} cy={BOT_Y + 14} rx={BW / 2 - 6} ry="12" fill="#2f4a12" opacity=".3" filter="url(#bf-blur6)" />
      <path d={body} fill="url(#wb-basket)" stroke={OUT} strokeWidth="4" strokeLinejoin="round" />
      <path d={body} fill="url(#wb-weave)" opacity=".55" />
      <path d={`M${l} ${RIM_Y} Q${cx} ${RIM_Y + 28} ${r} ${RIM_Y}`} fill="none" stroke="#b07a42" strokeWidth="12" strokeLinecap="round" />
      <path d={`M${l} ${RIM_Y} Q${cx} ${RIM_Y + 28} ${r} ${RIM_Y}`} fill="none" stroke={OUT} strokeWidth="3" strokeLinecap="round" />
      <g transform={`translate(${cx} ${RIM_Y + 82})`}>
        <rect x="-62" y="-22" width="124" height="40" rx="12" fill="#fff6e2" stroke={OUT} strokeWidth="3.5" />
        <text y="8" textAnchor="middle" fontSize="24" fontWeight="900" fill={OUT}>
          {label}
        </text>
      </g>
    </g>
  );
}

// Isi bakul PULUH: ikat buluh, baris depan hingga 5, baris belakang (lebih tinggi) untuk selebihnya.
// Ikat dilukis pada skala yang sama dengan batang dalam bakul SA (STICK_S) supaya tinggi buluh sama.
function TensInBasket({ n, popKey }) {
  const cx = BASKETS.puluh;
  const spots = Array.from({ length: n }, (_, k) => {
    const back = k >= 5;
    const i = back ? k - 5 : k;
    const cnt = back ? n - 5 : Math.min(n, 5);
    return { k, back, x: cx + (i - (cnt - 1) / 2) * 48 + (back ? 24 : 0), y: RIM_Y + (back ? -6 : 26) };
  });
  // baris belakang dilukis dahulu; ikat rapat (gap 5) ≈ 55 lebar pada jarak 48: bertindih sedikit, masih boleh dikira
  return [...spots.filter((p) => p.back), ...spots.filter((p) => !p.back)].map((p) => (
    <g key={p.k} className={p.k === n - 1 ? `wb-pop wb-pop-${popKey}` : undefined}>
      <Bundle x={p.x} y={p.y} s={STICK_S} gap={5} />
    </g>
  ));
}

// Isi bakul SA: batang buluh dalam kipas kecil. tying = 10 batang sedang diikat.
function OnesInBasket({ n, popKey, tying }) {
  const cx = BASKETS.sa;
  return (
    <g className={tying ? 'wb-tying' : undefined}>
      {Array.from({ length: n }, (_, k) => (
        <g key={k} className={k === n - 1 && !tying ? `wb-pop wb-pop-${popKey}` : undefined}>
          <Stick x={cx + (k - (n - 1) / 2) * 22} y={RIM_Y + 26} a={(k - (n - 1) / 2) * 2.4} s={STICK_S} />
        </g>
      ))}
      {tying && (
        <g className="wb-rope">
          <rect x={cx - 112} y={RIM_Y - 52} width="224" height="14" rx="7" fill="#d6283a" stroke={OUT} strokeWidth="2.5" />
          <circle cx={cx} cy={RIM_Y - 45} r="8" fill="#b81d33" stroke={OUT} strokeWidth="2.5" />
        </g>
      )}
    </g>
  );
}

// Papan nilai tempat: Puluh | Sa, digit = bilangan dalam setiap bakul. Butang − mengeluarkan satu item.
function PlaceChart({ puluh, sa, solved, target, hint, onMinus, minusOff }) {
  const cells = [
    { key: 'puluh', label: 'Puluh', x: BASKETS.puluh, v: puluh, t: target[0] },
    { key: 'sa', label: 'Sa', x: BASKETS.sa, v: sa, t: target[1] },
  ];
  return (
    <g>
      <rect x="208" y="12" width="584" height="128" rx="18" fill="url(#wb-board)" stroke={OUT} strokeWidth="5" filter="url(#bf-drop)" />
      <rect x="222" y="54" width="556" height="76" rx="12" fill="#fffaf0" stroke={OUT} strokeWidth="3" />
      <path d="M500 18 V134" stroke={OUT} strokeWidth="4" />
      {cells.map((c) => (
        <g key={c.key}>
          <text x={c.x} y="44" textAnchor="middle" fontSize="26" fontWeight="900" fill="#fff6e2" stroke={OUT} strokeWidth="5" paintOrder="stroke">
            {c.label}
          </text>
          <text key={`${c.key}${c.v}`} className={`wb-digit${solved ? ' is-solved' : ''}`} x={c.x} y="116" textAnchor="middle" fontSize="62" fontWeight="900" fill={solved ? '#1f8a4c' : OUT}>
            {c.v}
          </text>
          {hint && !solved && (
            <g transform={`translate(${c.x + 92} 92)`}>
              <rect x="-34" y="-17" width="68" height="34" rx="17" fill="#ffb703" stroke="#fff" strokeWidth="3" />
              <text y="7" textAnchor="middle" fontSize="18" fontWeight="900" fill={OUT}>
                perlu {c.t}
              </text>
            </g>
          )}
          {!solved && (
            <g
              className="wb-minus"
              transform={`translate(${c.x - 104} 92)`}
              role="button"
              tabIndex={minusOff || c.v === 0 ? -1 : 0}
              aria-label={`Keluarkan satu ${c.key === 'puluh' ? 'ikat' : 'batang'}`}
              aria-disabled={minusOff || c.v === 0 || undefined}
              opacity={minusOff || c.v === 0 ? 0.35 : 1}
              onClick={() => !minusOff && c.v > 0 && onMinus(c.key)}
              onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && (e.preventDefault(), !minusOff && c.v > 0 && onMinus(c.key))}
            >
              <circle r="20" fill="#f6e6c8" stroke={OUT} strokeWidth="3.5" />
              <path d="M-9 0 H9" stroke={OUT} strokeWidth="5" strokeLinecap="round" />
            </g>
          )}
        </g>
      ))}
    </g>
  );
}

function BambooDefs() {
  return (
    <defs>
      <linearGradient id="wb-stick" x1="0" y1="0" x2="1" y2="0">
        <stop offset="0" stopColor="#4f9d2f" />
        <stop offset=".45" stopColor="#9bd36a" />
        <stop offset="1" stopColor="#3f8a25" />
      </linearGradient>
      <linearGradient id="wb-basket" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stopColor="#d79a55" />
        <stop offset="1" stopColor="#9c6230" />
      </linearGradient>
      <pattern id="wb-weave" width="24" height="16" patternUnits="userSpaceOnUse">
        <path d="M0 4 Q6 0 12 4 T24 4" fill="none" stroke="#6b4220" strokeWidth="2.5" />
        <path d="M0 12 Q6 16 12 12 T24 12" fill="none" stroke="#f2c590" strokeWidth="2" />
      </pattern>
      <linearGradient id="wb-board" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stopColor="#c98b4f" />
        <stop offset="1" stopColor="#8f582a" />
      </linearGradient>
    </defs>
  );
}

const inBasket = (x, y, cx) => x >= cx - BW / 2 - 20 && x <= cx + BW / 2 + 20 && y >= RIM_Y - 150 && y <= BOT_Y + 20;

export default function BambooGame({ q, board, setBoard, solved, hint, tap }) {
  const target = split(q.n);
  const [tying, setTying] = useState(false);
  const [shake, setShake] = useState(null); // { key, n }
  // pembilang animasi "pop" berasingan untuk setiap bakul: menambah batang tidak memainkan semula animasi ikat
  const [pop, setPop] = useState({ puluh: 0, sa: 0 });
  const bump = (key) => setPop((p) => ({ ...p, [key]: p[key] + 1 }));
  const [wiggle, setWiggle] = useState(null); // { id, n }
  const timer = useRef(null);
  useEffect(() => () => clearTimeout(timer.current), []);

  const nope = (key) => setShake((s) => ({ key, n: (s?.n ?? 0) + 1 }));

  const add = (id, target) => {
    if (solved || tying) return;
    if (id === 'ikat') {
      if (target !== 'puluh' || board.puluh >= MAX_TENS) return nope(target);
      tap('tap');
      bump('puluh');
      setBoard({ ...board, puluh: board.puluh + 1 });
      return;
    }
    // batang
    if (target !== 'sa') return nope(target);
    if (board.sa === 9) {
      if (board.puluh >= MAX_TENS) return nope('sa');
      // 10 batang: ikat menjadi 1 puluh
      tap('tap');
      setTying(true);
      timer.current = setTimeout(() => {
        setTying(false);
        bump('puluh');
        setBoard({ puluh: board.puluh + 1, sa: 0 });
      }, 1100);
      return;
    }
    tap('tap');
    bump('sa');
    setBoard({ ...board, sa: board.sa + 1 });
  };

  const minus = (key) => {
    if (solved || tying) return;
    tap('tap');
    setBoard({ ...board, [key]: Math.max(0, board[key] - 1) });
  };

  const dd = useDragDrop({
    disabled: solved || tying,
    hitTest: (x, y) => (inBasket(x, y, BASKETS.puluh) ? 'puluh' : inBasket(x, y, BASKETS.sa) ? 'sa' : null),
    onDrop: (id, t) => add(id, t),
    onPick: (id) => add(id, id === 'ikat' ? 'puluh' : 'sa'), // papan kekunci: terus ke bakul yang sepadan
    tapToPick: false,
    onTap: (id) => setWiggle((w) => ({ id, n: (w?.n ?? 0) + 1 })),
  });

  const view = tying ? { puluh: board.puluh, sa: 10 } : board;
  const over = dd.drag?.over;

  return (
    <svg ref={dd.svgRef} className="g-stage" viewBox={`0 0 1000 ${VIEW_H}`} role="group" aria-label={`Bina nombor ${q.n}. Bakul puluh ada ${view.puluh} ikat, bakul sa ada ${view.sa} batang.`}>
      <BenchDefs />
      <BambooDefs />
      <Bench />
      <PlaceChart puluh={view.puluh} sa={view.sa} solved={solved} target={target} hint={hint} onMinus={minus} minusOff={tying} />

      {/* bakul: belakang, isi, depan */}
      {Object.entries(BASKETS).map(([key, cx]) => (
        <g key={key} className={over === key ? 'wb-over' : undefined}>
          <BasketBack cx={cx} />
        </g>
      ))}
      <TensInBasket n={view.puluh} popKey={pop.puluh % 2} />
      <OnesInBasket n={view.sa} popKey={pop.sa % 2} tying={tying} />
      {Object.entries(BASKETS).map(([key, cx]) => (
        <g key={`${key}${shake?.key === key ? shake.n : ''}`}>
          <BasketFront cx={cx} label={key === 'puluh' ? 'PULUH' : 'SA'} shake={shake?.key === key} />
        </g>
      ))}
      {solved && (
        <g className="wb-glow" pointerEvents="none">
          {Object.values(BASKETS).map((cx) => (
            <ellipse key={cx} cx={cx} cy={RIM_Y - 30} rx={BW / 2 + 10} ry="110" fill="#fff3a0" opacity=".25" filter="url(#bf-blur8)" />
          ))}
        </g>
      )}

      {/* longgokan di bangku: seret satu ikat atau satu batang */}
      <g
        className={`bf-piece${dd.drag?.id === 'ikat' ? ' is-ghosted' : ''}`}
        transform={`translate(${SRC.ikat} ${PIECE_Y})`}
        {...dd.bindItem('ikat', 'Seikat buluh, sepuluh batang')}
      >
        <rect x="-80" y="-80" width="160" height="130" fill="transparent" />
        <g key={wiggle?.id === 'ikat' ? wiggle.n : 0} className={wiggle?.id === 'ikat' ? 'bf-wiggle' : undefined}>
          <Bundle x={-34} y={44} s={0.72} a={-10} />
          <Bundle x={34} y={44} s={0.72} a={10} />
          <Bundle x={0} y={48} s={0.78} />
        </g>
        <PieceLabel text="Ikat = 10" />
      </g>
      <g
        className={`bf-piece${dd.drag?.id === 'batang' ? ' is-ghosted' : ''}`}
        transform={`translate(${SRC.batang} ${PIECE_Y})`}
        {...dd.bindItem('batang', 'Sebatang buluh, satu')}
      >
        <rect x="-80" y="-80" width="160" height="130" fill="transparent" />
        <g key={wiggle?.id === 'batang' ? wiggle.n : 0} className={wiggle?.id === 'batang' ? 'bf-wiggle' : undefined}>
          {[-40, -20, 0, 20, 40].map((dx, k) => (
            <Stick key={dx} x={dx} y={48} a={(k - 2) * 7} s={0.8} />
          ))}
        </g>
        <PieceLabel text="Batang = 1" />
      </g>

      {dd.drag && (
        <g className="g-ghost bf-drag" transform={`translate(${SRC[dd.drag.id] + dd.drag.dx} ${PIECE_Y + dd.drag.dy})`}>
          {dd.drag.id === 'ikat' ? <Bundle y={40} s={0.7} /> : <Stick y={40} s={0.9} />}
        </g>
      )}
    </svg>
  );
}

export function Demo() {
  return (
    <svg className="demo-svg" viewBox={`0 0 1000 ${VIEW_H}`} aria-hidden="true">
      <BenchDefs />
      <BambooDefs />
      <Bench />
      <PlaceChart puluh={1} sa={3} target={[2, 3]} onMinus={() => {}} />
      {Object.values(BASKETS).map((cx) => (
        <BasketBack key={cx} cx={cx} />
      ))}
      <TensInBasket n={1} popKey={0} />
      <OnesInBasket n={3} popKey={0} />
      {Object.entries(BASKETS).map(([key, cx]) => (
        <BasketFront key={key} cx={cx} label={key === 'puluh' ? 'PULUH' : 'SA'} />
      ))}
      <g transform={`translate(${SRC.batang} ${PIECE_Y})`}>
        {[-40, -20, 0, 20, 40].map((dx, k) => (
          <Stick key={dx} x={dx} y={48} a={(k - 2) * 7} s={0.8} />
        ))}
      </g>
      <g transform={`translate(${SRC.ikat} ${PIECE_Y})`}>
        <Bundle x={-34} y={44} s={0.72} a={-10} />
        <Bundle x={34} y={44} s={0.72} a={10} />
        <g className="wb-demo-move">
          <Bundle y={40} s={0.7} />
          <g transform="translate(20 10) scale(1.4)">
            <Hand />
          </g>
        </g>
      </g>
    </svg>
  );
}

export const demoText =
  'Seret ikat buluh (10 batang) ke bakul PULUH dan batang buluh (1) ke bakul SA. Papan di atas menunjukkan digit puluh dan sa. 10 batang akan diikat menjadi 1 ikat. Tekan − untuk keluarkan, kemudian tekan Semak.';
