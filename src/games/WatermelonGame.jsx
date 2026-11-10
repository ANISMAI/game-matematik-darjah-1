import { Bang, Hand, Tick } from './GameArt.jsx';
import { useState } from 'react';
import { useDragDrop } from './useDragDrop.js';
import { answerFor, Bench, BenchDefs, OUT, PIECES, PIECE_Y, PieceLabel, VIEW_H } from './ButterflyGame.jsx';

// Banyak dan Sedikit: tembikai dibelah dua, hatinya hilang.
// Belahan kiri dan kanan ada biji hitam. Bahagian tengah tembikai (hati, paling manis) tiada dan meninggalkan
// lubang bulat. Murid lengkapkan tembikai dengan hati bersimbol (>, <, =) yang membandingkan biji kiri dengan
// biji kanan, sama seperti melengkapkan badan rama-rama. Bila betul, tembikai bercantum dan digigit sekali. Mesti seret (ketik sahaja tidak meletakkan jawapan).
// Logik jawapan sama dengan rama-rama (q.left, q.right), jadi soalan boleh ditukar antara tema.

export { answerFor, init, restore } from './ButterflyGame.jsx';

const SLOT = { x: 500, y: 250, r: 50 };

// Belahan kiri: separuh elips, sisi potongan (rata) di x = 440 menghadap celah.
const CX = 440;
const CY = 250;
const half = (rx, ry) => `M${CX} ${CY - ry} A${rx} ${ry} 0 0 0 ${CX} ${CY + ry} Z`;
const SKIN = half(250, 200);
const RIND = half(234, 186);
const FLESH = half(215, 172);

// Belahan dilukis dengan sisi potongan di x = 440, kemudian dianjak 52px ke tengah (CSS .wm-half), jadi celah
// antara belahan kecil sahaja. Lubang hati berpusat di tengah papan (500, 250) = (448, 250) setempat.
const HOLE = { x: 448, y: CY, r: 50 };

// Tempat biji dalam isi belahan kiri (belahan kanan ialah cerminan). Dikira dengan "titik paling jauh":
// semua di dalam isi, >= 56px antara satu sama lain, dan >= 88px dari pusat lubang supaya jauh dari hati.
// Susunan supaya bilangan kecil membentuk corak kemas: 2 = atas/bawah, 3 = segi tiga.
const SEEDS = [
  [314, 148], [314, 352], [300, 250], [410, 110], [410, 390],
  [370, 208], [370, 292], [270, 194], [270, 306], [410, 168],
];
const seedsFor = (n, mirror) => SEEDS.slice(0, n).map(([x, y]) => [mirror ? 1000 - x : x, y]);

const SENTENCE = { '>': 'lebih banyak daripada', '<': 'lebih sedikit daripada', '=': 'sama banyak dengan' };
export function prompt(q, solved) {
  return solved ? `Biji kiri ${SENTENCE[answerFor(q)]} biji kanan!` : 'Biji kiri ___ biji kanan?';
}

// ---------- Lukisan ----------

// Gentian isi tembikai: garis jejari halus dari tengah.
const FIBRES = Array.from({ length: 14 }, (_, i) => {
  const a = Math.PI / 2 + (i + 0.5) * (Math.PI / 14);
  return `M${CX - 30} ${CY} L${CX + Math.cos(a) * 205} ${CY - Math.sin(a) * 165}`;
});

function Half() {
  return (
    <g mask="url(#wm-hole)">
      {/* bayang di atas rumput */}
      <ellipse cx="300" cy="462" rx="200" ry="20" fill="#2f4a12" opacity=".3" filter="url(#bf-blur6)" />
      <g filter="url(#wm-shadow)">
        {/* kulit luar (ketebalan buah di belakang permukaan potongan) */}
        <path d={SKIN} transform="translate(-16 12)" fill="url(#wm-skin)" stroke={OUT} strokeWidth="5" strokeLinejoin="round" />
        <g clipPath="url(#wm-clip-skin)">
          <path d={SKIN} transform="translate(-16 12)" fill="url(#wm-stripes)" opacity=".75" />
        </g>
        {/* permukaan potongan */}
        <path d={SKIN} fill="url(#wm-rind)" stroke={OUT} strokeWidth="5" strokeLinejoin="round" />
        <path d={RIND} fill="url(#wm-pith)" />
        <path d={FLESH} fill="url(#wm-flesh)" />
      </g>
      <g clipPath="url(#wm-clip-flesh)">
        {FIBRES.map((d) => (
          <path key={d} d={d} stroke="#fff" strokeWidth="5" strokeLinecap="round" opacity=".1" filter="url(#bf-blur3)" />
        ))}
        {/* tepi isi yang lebih pucat, dekat kulit */}
        <path d={FLESH} fill="none" stroke="#ff9aa3" strokeWidth="14" opacity=".55" filter="url(#bf-blur3)" />
      </g>
      {/* tepi lubang hati: separuh dalam garisan dipotong topeng, tinggal jalur merah gelap pada isi */}
      <g clipPath="url(#wm-clip-flesh)">
        <circle cx={HOLE.x} cy={HOLE.y} r={HOLE.r} fill="none" stroke="#b81d33" strokeWidth="10" />
      </g>
      {/* garis tepi potongan dan kilauan jus */}
      <path d={`M${CX} ${CY - 196} V${CY + 196}`} stroke="#fff" strokeWidth="3" opacity=".55" />
      <ellipse cx="300" cy="150" rx="70" ry="22" transform="rotate(-28 300 150)" fill="#fff" opacity=".35" filter="url(#bf-blur6)" />
      <ellipse cx="404" cy="330" rx="12" ry="40" fill="#fff" opacity=".2" filter="url(#bf-blur6)" />
    </g>
  );
}

// Biji tembikai: titisan air mata, hujung tirus menghala ke tengah buah.
function Seed({ x, y, mirror }) {
  const cx = mirror ? 1000 - CX : CX;
  const ang = (Math.atan2(CY - y, cx - x) * 180) / Math.PI;
  return (
    <g transform={`translate(${x} ${y}) rotate(${ang}) scale(1.35)`}>
      <ellipse cx="-2" cy="5" rx="14" ry="8" fill="#5a0f1a" opacity=".35" filter="url(#bf-blur1)" />
      <path d="M14 0 C6 -9 -10 -10 -14 -2 C-16 4 -8 10 2 8 C8 6 12 3 14 0 Z" fill="url(#wm-seed)" stroke="#120a06" strokeWidth="1.5" />
      <ellipse cx="-6" cy="-3" rx="4" ry="2" fill="#fff" opacity=".55" />
    </g>
  );
}

// Lencana bilangan: tembikai kecil bulat dengan daun.
function Badge({ x, y, label }) {
  return (
    <g transform={`translate(${x} ${y})`} filter="url(#bf-drop)">
      <path d="M2 -34 C4 -44 10 -50 18 -52" fill="none" stroke="#5a3a12" strokeWidth="4" strokeLinecap="round" />
      <path d="M8 -44 C18 -60 40 -56 42 -46 C30 -38 16 -38 8 -44 Z" fill="#6cb841" stroke="#2f6b1f" strokeWidth="2.5" strokeLinejoin="round" />
      <circle r="36" fill="url(#wm-skin)" stroke={OUT} strokeWidth="4" />
      <circle r="34" fill="url(#wm-stripes)" opacity=".7" />
      <circle r="25" fill="url(#bf-label)" stroke={OUT} strokeWidth="3" />
      <ellipse cx="-12" cy="-20" rx="9" ry="5" transform="rotate(-30 -12 -20)" fill="#fff" opacity=".5" filter="url(#bf-blur1)" />
      <text y="12" textAnchor="middle" fontSize="34" fontWeight="900" fill={OUT}>
        {label}
      </text>
    </g>
  );
}

const HEART_FIBRES = Array.from({ length: 10 }, (_, i) => (i * 36 * Math.PI) / 180);

// Hati tembikai bersimbol: kepingan yang melengkapkan lubang di tengah tembikai.
// fit = sudah di tempatnya (garis luar lembut supaya nampak bersambung dengan isi).
function Heart({ symbol, faded = false, fit = false }) {
  return (
    <g opacity={faded ? 0.4 : 1}>
      {!fit && <ellipse cx="4" cy="54" rx="42" ry="9" fill="#3b2a1a" opacity=".25" filter="url(#bf-blur3)" />}
      <circle r="50" fill="url(#wm-heart)" stroke={fit ? '#d9364b' : OUT} strokeWidth={fit ? 2 : 5} filter={fit ? undefined : 'url(#wm-shadow)'} />
      {HEART_FIBRES.map((r) => (
        <path key={r} d={`M${Math.cos(r) * 10} ${Math.sin(r) * 10} L${Math.cos(r) * 44} ${Math.sin(r) * 44}`} stroke="#fff" strokeWidth="4" strokeLinecap="round" opacity=".14" />
      ))}
      <ellipse cx="-17" cy="-24" rx="15" ry="8" transform="rotate(-30 -17 -24)" fill="#fff" opacity=".5" filter="url(#bf-blur3)" />
      <text y="19" textAnchor="middle" fontSize="56" fontWeight="900" fill="#fff" stroke={OUT} strokeWidth="9" strokeLinejoin="round" paintOrder="stroke">
        {symbol}
      </text>
    </g>
  );
}

function MelonDefs() {
  return (
    <defs>
      <radialGradient id="wm-skin" cx=".4" cy=".35" r=".8">
        <stop offset="0" stopColor="#7fcf5a" />
        <stop offset=".6" stopColor="#3f9a34" />
        <stop offset="1" stopColor="#23651f" />
      </radialGradient>
      {/* jalur gelap berombak pada kulit */}
      <pattern id="wm-stripes" width="36" height="60" patternUnits="userSpaceOnUse" patternTransform="rotate(12)">
        <path d="M8 0 C2 15 16 30 8 45 C2 55 10 60 8 60 L22 60 C24 52 16 45 22 30 C28 15 18 8 22 0 Z" fill="#1d5419" />
      </pattern>
      <radialGradient id="wm-rind" cx="1" cy=".5" r="1">
        <stop offset=".7" stopColor="#4ea83c" />
        <stop offset="1" stopColor="#2a7425" />
      </radialGradient>
      <radialGradient id="wm-pith" cx="1" cy=".5" r="1">
        <stop offset=".75" stopColor="#f6fbe0" />
        <stop offset="1" stopColor="#cfe9a6" />
      </radialGradient>
      {/* isi: paling merah di tengah (tepi potongan), cerah ke arah kulit */}
      <radialGradient id="wm-flesh" cx="1" cy=".5" r="1">
        <stop offset="0" stopColor="#ff5a6a" />
        <stop offset=".7" stopColor="#f2394d" />
        <stop offset="1" stopColor="#e8475a" />
      </radialGradient>
      {/* hati: merah paling pekat dan berkilat (bahagian paling manis) */}
      <radialGradient id="wm-heart" cx=".42" cy=".38" r=".75">
        <stop offset="0" stopColor="#ff8592" />
        <stop offset=".55" stopColor="#ff4c5f" />
        <stop offset="1" stopColor="#f2394d" />
      </radialGradient>
      {/* lubang hati dalam setiap belahan (koordinat setempat belahan kiri; belahan kanan dicerminkan) */}
      <mask id="wm-hole" maskUnits="userSpaceOnUse" x="-200" y="-100" width="1400" height="900">
        <rect x="-200" y="-100" width="1400" height="900" fill="#fff" />
        <circle cx={HOLE.x} cy={HOLE.y} r={HOLE.r} fill="#000" />
      </mask>
      <radialGradient id="wm-seed" cx=".35" cy=".35" r=".8">
        <stop offset="0" stopColor="#5b4030" />
        <stop offset="1" stopColor="#140b06" />
      </radialGradient>
      <clipPath id="wm-clip-skin">
        <path d={SKIN} transform="translate(-16 12)" />
      </clipPath>
      <clipPath id="wm-clip-flesh">
        <path d={FLESH} />
      </clipPath>
      <filter id="wm-shadow" x="-40%" y="-30%" width="180%" height="190%">
        <feDropShadow dx="0" dy="8" stdDeviation="7" floodColor="#1d3550" floodOpacity=".25" />
      </filter>
    </defs>
  );
}

function Board({ left, right, showNum, countHint, joined }) {
  const seeds = (list, mirror) => (
    <>
      {list.map(([x, y], i) => (
        <Seed key={i} x={x} y={y} mirror={mirror} />
      ))}
      {countHint &&
        list.map(([x, y], i) => (
          <g key={`n${i}`} className="g-hint-num" style={{ '--i': i }} transform={`translate(${x + 14} ${y - 18})`}>
            <circle r="13" fill="#ffb703" stroke="#fff" strokeWidth="3" />
            <text className="g-small" y="6" textAnchor="middle" fontSize="16">
              {i + 1}
            </text>
          </g>
        ))}
    </>
  );
  const j = joined ? ' is-joined' : '';
  return (
    <g>
      {joined && <BiteDefs />}
      {/* belahan dianjak rapat ke tengah (CSS). Bila betul: bercantum sepenuhnya, kemudian digigit sekali */}
      <g mask={joined ? 'url(#wm-bite-mask)' : undefined}>
        <g className={`wm-half${j}`}>
          <Half />
          {seeds(seedsFor(left, false), false)}
          <Badge x={190} y={78} label={showNum ? left : '?'} />
        </g>
        <g className={`wm-half wm-half-r${j}`}>
          <g transform="translate(1000 0) scale(-1 1)">
            <Half />
          </g>
          {seeds(seedsFor(right, true), true)}
          <Badge x={810} y={78} label={showNum ? right : '?'} />
        </g>
        {/* tepi gigitan yang pucat; separuh dalam garisan dipotong topeng, jadi hanya tepi pada buah kelihatan */}
        {joined && (
          <g clipPath="url(#wm-clip-whole)">
            <g className="wm-bite">
              {BITE.map(([x, y, r]) => (
                <circle key={x} cx={x} cy={y} r={r} fill="none" stroke="#ffd6da" strokeWidth="14" />
              ))}
            </g>
          </g>
        )}
      </g>
      {joined && (
        <g aria-hidden="true">
          {JUICE.map(([dx, dy], i) => (
            <circle key={i} className="wm-juice" style={{ '--dx': `${dx}px`, '--dy': `${dy}px` }} cx="500" cy="70" r={i % 2 ? 5 : 7} fill="#ff5a6a" />
          ))}
          <g className="wm-nyam" transform="translate(640 40)">
            <text textAnchor="middle" fontSize="44" fontWeight="900" fill="#fff" stroke={OUT} strokeWidth="9" strokeLinejoin="round" paintOrder="stroke" transform="rotate(8)">
              Nyam!
            </text>
          </g>
        </g>
      )}
    </g>
  );
}

// Kesan gigitan: tiga bulatan bertindih (bentuk gigi) di bahagian atas sambungan tembikai.
// Jauh dari biji (biji teratas di y = 110), jadi bilangan biji tidak berubah.
const BITE = [
  [464, 60, 30],
  [500, 54, 34],
  [536, 60, 30],
];
const JUICE = [
  [-70, -40], [-40, -70], [0, -84], [40, -70], [72, -38], [-90, 10], [92, 12],
];

function BiteDefs() {
  return (
    <defs>
      <mask id="wm-bite-mask" maskUnits="userSpaceOnUse" x="0" y="0" width="1000" height={VIEW_H}>
        <rect width="1000" height={VIEW_H} fill="#fff" />
        <g className="wm-bite">
          {BITE.map(([x, y, r]) => (
            <circle key={x} cx={x} cy={y} r={r} fill="#000" />
          ))}
        </g>
      </mask>
      {/* bentuk tembikai selepas bercantum (belahan dianjak 60px ke tengah) */}
      <clipPath id="wm-clip-whole">
        <path d={SKIN} transform="translate(60 0)" />
        <path d={SKIN} transform="translate(940 0) scale(-1 1)" />
      </clipPath>
    </defs>
  );
}

const inSlot = (x, y) => Math.hypot(x - SLOT.x, y - SLOT.y) <= SLOT.r + 40;

export default function WatermelonGame({ q, board, setBoard, fail, succeed, solved, hint, tap }) {
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
    hitTest: (x, y) => (inSlot(x, y) ? 'gap' : null),
    onDrop: (id) => place(id),
    onPick: (id) => place(id),
    tapToPick: false,
    onTap: (id) => setWiggle((w) => ({ id, n: (w?.n ?? 0) + 1 })),
  });

  const armed = Boolean(dd.drag);
  const dragPiece = dd.drag && PIECES.find((c) => c.id === dd.drag.id);

  return (
    <svg ref={dd.svgRef} className="g-stage" viewBox={`0 0 1000 ${VIEW_H}`} role="group" aria-label={`Tembikai: belahan kiri ${q.left} biji, belahan kanan ${q.right} biji`}>
      <BenchDefs />
      <MelonDefs />
      <Bench />
      <Board left={q.left} right={q.right} showNum={solved || hint || q.showNumbers} countHint={hint} joined={solved} />

      {/* lubang hati di tengah tembikai */}
      <g className={`bf-slot${armed ? ' is-armed' : ''}${dd.drag?.over === 'gap' ? ' is-over' : ''}`} transform={`translate(${SLOT.x} ${SLOT.y})`}>
        {placed ? (
          <g className="bf-placed">
            <Heart symbol={placed} fit />
          </g>
        ) : (
          <>
            <circle r={SLOT.r} fill="#fff6e2" fillOpacity=".45" stroke={OUT} strokeWidth="4" strokeDasharray="9 7" />
            <text y="16" textAnchor="middle" fontSize="44" fontWeight="900" fill="#b48a2c">
              ?
            </text>
          </>
        )}
      </g>
      {solved && <Tick x={SLOT.x + 48} y={SLOT.y - 44} />}

      {PIECES.map((c) => {
        const isTried = tried.includes(c.id);
        const used = placed === c.id;
        return (
          <g
            key={c.id}
            className={`bf-piece${isTried ? ' is-tried' : ''}${dd.drag?.id === c.id ? ' is-ghosted' : ''}`}
            transform={`translate(${c.x} ${PIECE_Y})`}
            {...dd.bindItem(c.id, `Hati tembikai ${c.id}, ${c.label}${isTried ? ', cuba lagi' : ''}`, { inactive: isTried || used })}
          >
            {used ? (
              <circle r="46" fill="rgba(255,255,255,.5)" stroke="#d9c39a" strokeWidth="3" strokeDasharray="7 6" />
            ) : (
              <>
                <circle r="58" fill="transparent" />
                <g key={wiggle?.id === c.id ? wiggle.n : 0} className={wiggle?.id === c.id ? 'bf-wiggle' : undefined}>
                  <Heart symbol={c.id} faded={isTried} />
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
          <Heart symbol={dragPiece.id} />
        </g>
      )}
    </svg>
  );
}

export function Demo() {
  return (
    <svg className="demo-svg" viewBox={`0 0 1000 ${VIEW_H}`} aria-hidden="true">
      <BenchDefs />
      <MelonDefs />
      <Bench />
      <Board left={3} right={1} showNum={false} />
      <g transform={`translate(${SLOT.x} ${SLOT.y})`}>
        <circle r={SLOT.r} fill="#fff6e2" fillOpacity=".45" stroke={OUT} strokeWidth="4" strokeDasharray="9 7" />
      </g>
      {PIECES.filter((c) => c.id !== '>').map((c) => (
        <g key={c.id} transform={`translate(${c.x} ${PIECE_Y})`}>
          <Heart symbol={c.id} />
        </g>
      ))}
      <g transform={`translate(${PIECES[0].x} ${PIECE_Y})`}>
        <g className="wm-demo-move">
          <Heart symbol=">" />
          <g transform="translate(26 30) scale(1.4)">
            <Hand />
          </g>
        </g>
      </g>
    </svg>
  );
}

export const demoText =
  'Kira biji pada belahan kiri dan belahan kanan. Seret hati tembikai ke lubang di tengah: > jika kiri lebih banyak, < jika kiri lebih sedikit, = jika sama banyak.';
