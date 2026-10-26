// Mekanik 'quiz' (pilih jawapan umum): soalan teks + gambar objek pilihan + tiga pilihan.
// Gaya ceria & terang untuk Darjah 1: kad nombor gemuk bergradien, latar lembut, bayang tebal.
// Soalan: { id, prompt, icon?, count?, options:[a,b,c], answer, hint }
import { shuffle } from '../lib/questions.js';
import { Apple, ArtDefs, gridPositions, Hand, Lantern } from './GameArt.jsx';
import { activate } from './useDragDrop.js';

const ICONS = { apple: Apple, lantern: Lantern };
const CHOICE_X = [255, 500, 745];
const CHOICE = { y: 420, w: 150, h: 128, r: 28 };

// Warna kad pilihan yang ceria (hijau, biru, ungu) — berbeza setiap butang.
const CARD = [
  { top: '#7ed957', bot: '#4caf2e', edge: '#3c8c22' },
  { top: '#4fc3f7', bot: '#2196f3', edge: '#1976d2' },
  { top: '#b388ff', bot: '#7c4dff', edge: '#5e35b1' },
];

export function plan(questions) {
  return shuffle([0, 1, 2, 0, 1, 2]).slice(0, questions.length);
}

export function init(q, pos) {
  const others = shuffle(q.options.filter((o) => o !== q.answer));
  const at = Number.isInteger(pos) ? pos : Math.floor(Math.random() * 3);
  others.splice(at, 0, q.answer);
  return { options: others, tried: [] };
}

export function restore(b, q) {
  return (
    Array.isArray(b?.options) &&
    [...b.options].sort().join() === [...q.options].sort().join() &&
    Array.isArray(b.tried)
  );
}

function Basket({ count }) {
  // Bakul mudah untuk menampung epal (gaya ceria, outline tebal).
  if (!count) {
    return (
      <g transform="translate(500 210)">
        <ellipse cx="0" cy="92" rx="150" ry="26" fill="#000" opacity="0.08" />
        <path d="M-150 0 h300 l-26 120 a20 20 0 0 1 -20 16 h-208 a20 20 0 0 1 -20 -16 Z" fill="#e0a85a" stroke="#8a5a1e" strokeWidth="6" />
        <path d="M-150 0 h300" stroke="#8a5a1e" strokeWidth="10" strokeLinecap="round" />
        <text x="0" y="86" textAnchor="middle" fontSize="30" fontWeight="800" fill="#8a5a1e">
          kosong
        </text>
      </g>
    );
  }
  const pos = gridPositions(count, 500, 150, 70, 60);
  const s = count > 5 ? 1.15 : 1.5;
  return (
    <g>
      <ellipse cx="500" cy="300" rx="155" ry="28" fill="#000" opacity="0.08" />
      {pos.map(([x, y], i) => (
        <Apple key={i} x={x} y={y} s={s} />
      ))}
      <path
        d="M345 230 h310 l-28 120 a22 22 0 0 1 -22 18 h-210 a22 22 0 0 1 -22 -18 Z"
        fill="#e0a85a"
        stroke="#8a5a1e"
        strokeWidth="6"
      />
      <path d="M345 230 h310" stroke="#8a5a1e" strokeWidth="11" strokeLinecap="round" />
    </g>
  );
}

function LanternField({ count }) {
  const pos = gridPositions(count || 1, 500, 200, 90, 80);
  const s = count > 5 ? 1.2 : 1.6;
  return pos.map(([x, y], i) => <Lantern key={i} x={x} y={y} s={s} />);
}

export default function QuizGame({ q, board, setBoard, fail, succeed, solved, hint }) {
  const choose = (v) => {
    if (solved || board.tried.includes(v)) return;
    if (v === q.answer) succeed(board);
    else fail({ ...board, tried: [...board.tried, v] });
  };

  const Field = q.icon === 'lantern' ? <LanternField count={q.count} /> : <Basket count={q.count} />;

  return (
    <svg className="g-stage" viewBox="0 0 1000 560" role="group" aria-label={q.prompt}>
      <ArtDefs />
      <defs>
        {CARD.map((c, i) => (
          <linearGradient key={i} id={`qc${i}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor={c.top} />
            <stop offset="1" stopColor={c.bot} />
          </linearGradient>
        ))}
        <linearGradient id="qc-right" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#ffd84d" />
          <stop offset="1" stopColor="#ffb300" />
        </linearGradient>
      </defs>

      {/* papan soalan */}
      <rect x="120" y="14" width="760" height="70" rx="26" fill="#fff" stroke="#ffd166" strokeWidth="5" />
      <text x="500" y="60" textAnchor="middle" fontSize="36" fontWeight="800" fill="#2b2118">
        {q.prompt}
      </text>

      {Field}

      {board.options.map((v, i) => {
        const tried = board.tried.includes(v);
        const right = solved && v === q.answer;
        const c = CARD[i];
        const x = CHOICE_X[i];
        const fillId = right ? 'qc-right' : `qc${i}`;
        const edge = right ? '#c98a00' : c.edge;
        const dim = tried && !right;
        return (
          <g
            key={v}
            transform={`translate(${x} ${CHOICE.y})`}
            role="button"
            tabIndex={tried || solved ? -1 : 0}
            aria-label={`Jawapan ${v}${tried ? ', cuba lagi' : ''}${right ? ', betul' : ''}`}
            aria-disabled={tried || solved || undefined}
            style={{ cursor: tried || solved ? 'default' : 'pointer', opacity: dim ? 0.4 : 1 }}
            onClick={() => choose(v)}
            onKeyDown={(e) => activate(e, () => choose(v))}
          >
            {/* bayang tebal bawah */}
            <rect x={-CHOICE.w / 2} y={-CHOICE.h / 2 + 10} width={CHOICE.w} height={CHOICE.h} rx={CHOICE.r} fill={edge} />
            {/* muka kad */}
            <rect
              x={-CHOICE.w / 2}
              y={-CHOICE.h / 2}
              width={CHOICE.w}
              height={CHOICE.h}
              rx={CHOICE.r}
              fill={`url(#${fillId})`}
              stroke="#fff"
              strokeWidth="5"
            />
            {/* kilauan atas */}
            <rect x={-CHOICE.w / 2 + 16} y={-CHOICE.h / 2 + 12} width={CHOICE.w - 32} height="26" rx="13" fill="#fff" opacity="0.28" />
            <text y="24" textAnchor="middle" fontSize="74" fontWeight="800" fill="#fff" style={{ paintOrder: 'stroke' }} stroke={edge} strokeWidth="2">
              {v}
            </text>
            {right && (
              <g transform={`translate(${CHOICE.w / 2 - 14} ${-CHOICE.h / 2 + 2})`}>
                <circle r="20" fill="#2a9d8f" stroke="#fff" strokeWidth="4" />
                <path d="M-9 0 l6 7 l12 -14" fill="none" stroke="#fff" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round" />
              </g>
            )}
            {hint && v === q.answer && !solved && (
              <g className="g-hint" transform={`translate(0 ${-CHOICE.h / 2 - 18})`}>
                <path d="M0 -12 l4 9 l10 1 l-7 7 l2 10 l-9 -5 l-9 5 l2 -10 l-7 -7 l10 -1 Z" fill="#ffd166" stroke="#c98a00" strokeWidth="2" />
              </g>
            )}
          </g>
        );
      })}
    </svg>
  );
}

export function Demo() {
  return (
    <svg className="demo-svg" viewBox="0 0 600 300" aria-hidden="true">
      <text x="300" y="44" textAnchor="middle" fontSize="30" fontWeight="800" fill="#2b2118">
        Mana jawapan betul?
      </text>
      {[2, 3, 1].map((v, i) => {
        const cols = ['#4caf2e', '#2196f3', '#7c4dff'];
        return (
          <g key={v} transform={`translate(${150 + i * 150} 180)`} className={v === 3 ? 'demo-door' : ''}>
            <rect x="-52" y="-46" width="104" height="92" rx="22" fill={cols[i]} stroke="#fff" strokeWidth="4" />
            <text y="16" textAnchor="middle" fontSize="52" fontWeight="800" fill="#fff">
              {v}
            </text>
          </g>
        );
      })}
      <g className="demo-tap" transform="translate(330 210)">
        <Hand />
      </g>
    </svg>
  );
}

export const demoText = 'Baca soalan, kemudian ketik kad dengan jawapan yang betul.';
