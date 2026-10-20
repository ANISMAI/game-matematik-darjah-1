import { shuffle } from '../lib/questions.js';
import { Apple, Door, gridPositions, Hand } from './GameArt.jsx';
import { activate } from './useDragDrop.js';

const DOOR_X = [210, 500, 790];
const DOOR = { y: 410, w: 170, h: 240 };
const GROUP_A = { x: 70, y: 22, w: 360, h: 150 };
const GROUP_B = { x: 570, y: 22, w: 360, h: 150 };

// Kedudukan jawapan betul dirancang untuk setiap percubaan supaya berbeza-beza (bukan semua di tempat sama).
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
  return Array.isArray(b?.options) && [...b.options].sort().join() === [...q.options].sort().join() && Array.isArray(b.tried);
}

function Group({ box, n, from, hint }) {
  const pos = gridPositions(n, box.x + box.w / 2, box.y + box.h / 2 + 6, 66, 62);
  return (
    <g>
      <rect className="g-panel" x={box.x} y={box.y} width={box.w} height={box.h} rx="22" />
      {pos.map(([x, y], i) => (
        <g key={i}>
          <Apple x={x} y={y} s={1.1} />
          {hint && (
            <g className="g-hint-num" style={{ '--i': from + i }} transform={`translate(${x + 20} ${y - 22})`}>
              <circle r="16" fill="#ffb703" stroke="#fff" strokeWidth="3" />
              <text className="g-small" y="7" textAnchor="middle">
                {from + i + 1}
              </text>
            </g>
          )}
        </g>
      ))}
    </g>
  );
}

export default function PickAnswerGame({ q, board, setBoard, fail, succeed, solved, hint }) {
  const choose = (v) => {
    if (solved || board.tried.includes(v)) return; // input dikunci selepas berjaya
    if (v === q.answer) succeed(board);
    else fail({ ...board, tried: [...board.tried, v] });
  };

  return (
    <svg className="g-stage" viewBox="0 0 1000 560" role="group" aria-label="Pintu jawapan">
      <Group box={GROUP_A} n={q.a} from={0} hint={hint} />
      <Group box={GROUP_B} n={q.b} from={q.a} hint={hint} />
      <text className="g-op" x="500" y="118" textAnchor="middle" aria-hidden="true">
        +
      </text>
      <text className="g-expr" x="500" y="248" textAnchor="middle">
        {q.a} + {q.b} = {solved ? q.answer : '?'}
      </text>

      {board.options.map((v, i) => {
        const tried = board.tried.includes(v);
        const right = solved && v === q.answer;
        const off = solved || tried;
        return (
          <g
            key={v}
            className={`g-door${off ? ' is-off' : ''}${tried ? ' is-tried' : ''}${right ? ' is-open' : ''}`}
            transform={`translate(${DOOR_X[i]} ${DOOR.y})`}
            role="button"
            tabIndex={off ? -1 : 0}
            aria-label={`Pintu ${v}${tried ? ', cuba lagi' : ''}${right ? ', betul' : ''}`}
            aria-disabled={off || undefined}
            onClick={() => choose(v)}
            onKeyDown={(e) => activate(e, () => choose(v))}
          >
            <rect className="g-hit" x={-DOOR.w / 2 - 20} y={-DOOR.h / 2 - 34} width={DOOR.w + 40} height={DOOR.h + 40} rx="16" />
            <Door w={DOOR.w} h={DOOR.h} label={v} open={right} tried={tried} />
          </g>
        );
      })}
    </svg>
  );
}

export function Demo() {
  return (
    <svg className="demo-svg" viewBox="0 0 600 300" aria-hidden="true">
      <text className="g-expr" x="300" y="56" textAnchor="middle" fontSize="44">
        1 + 1 = ?
      </text>
      {[1, 2, 3].map((v, i) => (
        <g key={v} transform={`translate(${140 + i * 160} 200) scale(.62)`} className={v === 2 ? 'demo-door' : ''}>
          <Door w={170} h={240} label={v} />
        </g>
      ))}
      <g className="demo-tap" transform="translate(320 230)">
        <Hand />
      </g>
    </svg>
  );
}

export const demoText = 'Kira semua objek, kemudian ketik pintu dengan jumlah yang betul.';
