import { shuffle } from '../lib/questions.js';
import { Bang, Hand, MiniNinja, StartFlag, Stone, Tick } from './GameArt.jsx';
import { inRect, useDragDrop } from './useDragDrop.js';

export const LANE_X = [240, 420, 600, 780];
const SLOT_Y = 205;
const BANK_Y = 455;
const RX = 72;
const RY = 52;
const BANK = { x: 0, y: 360, w: 1000, h: 200 };
const slotRect = (i) => ({ x: LANE_X[i] - 88, y: SLOT_Y - 74, w: 176, h: 148 });

// Sungai dan tebing, dikongsi dengan Jambatan Hilang
export function RiverScene({ children, crossed, ninjaMood = 'idle' }) {
  return (
    <g>
      <rect x="0" y="0" width="1000" height="360" fill="#bfe6a0" />
      <path d="M130 30 Q500 0 870 30 L870 345 Q500 375 130 345Z" className="g-river" />
      <path d="M170 110 q30 -12 60 0 M560 300 q30 -12 60 0 M700 80 q30 -12 60 0 M330 320 q30 -12 60 0" className="g-wave" />
      <rect x="0" y="360" width="1000" height="200" fill="#e9c98f" />
      <path d="M0 360 Q500 380 1000 360" stroke="#b98d4c" strokeWidth="4" fill="none" />
      <StartFlag x={58} y={240} />
      <g aria-hidden="true">
        <path d="M110 120 h50 m-14 -12 l14 12 l-14 12" stroke="#3b2a1a" strokeWidth="5" fill="none" strokeLinecap="round" strokeLinejoin="round" />
      </g>
      <g transform="translate(935 215)" aria-hidden="true">
        <rect x="-36" y="-60" width="72" height="66" rx="6" fill="#7a4a26" stroke="#3b2a1a" strokeWidth="3" />
        <path d="M-50 -56 L0 -90 L50 -56z" fill="#c0392b" stroke="#3b2a1a" strokeWidth="3" strokeLinejoin="round" />
        <rect x="-14" y="-34" width="28" height="40" fill="#ffe7a8" stroke="#3b2a1a" strokeWidth="2" />
      </g>
      {children}
      <g className={`g-crosser${crossed ? ' is-crossing' : ''}`}>
        <MiniNinja x={90} y={250} size={70} mood={ninjaMood} />
      </g>
    </g>
  );
}

export function init(q) {
  let home = shuffle(q.answer);
  for (let k = 0; k < 6 && home.join() === q.answer.join(); k++) home = shuffle(q.answer);
  return { home, slots: [null, null, null, null], selected: null, wrong: null };
}

export function restore(b, q) {
  return Array.isArray(b?.home) && [...b.home].sort().join() === [...q.answer].sort().join() && Array.isArray(b.slots) && b.slots.length === 4;
}

export const canCheck = (b) => b.slots.every((v) => v !== null);

export function check(b, q) {
  const wrong = b.slots.findIndex((v, i) => v !== q.answer[i]);
  return { ok: wrong < 0, board: { ...b, selected: null, wrong: wrong < 0 ? null : wrong } };
}

export default function OrderingGame({ q, board, setBoard, solved, hint, tap }) {
  const { home, slots, selected } = board;
  const slotOf = (v) => slots.indexOf(v);

  const move = (v, target) => {
    const next = [...slots];
    const from = slotOf(v);
    if (target === 'bank') {
      if (from >= 0) next[from] = null;
    } else {
      const occupant = next[target];
      if (from >= 0) next[from] = occupant; // tukar dua batu
      next[target] = v; // jika dari tebing, batu lama kembali ke tebing
    }
    setBoard({ ...board, slots: next, selected: null, wrong: null });
    tap('tap');
  };

  const dd = useDragDrop({
    disabled: solved,
    hitTest: (x, y) => {
      const i = LANE_X.findIndex((_, k) => inRect(x, y, slotRect(k)));
      if (i >= 0) return i;
      return inRect(x, y, BANK) ? 'bank' : null;
    },
    onDrop: (v, t) => move(v, t),
    onPick: (v) => {
      const at = slotOf(v);
      if (selected !== null && selected !== v && at >= 0) {
        move(selected, at);
        return;
      }
      setBoard({ ...board, selected: selected === v ? null : v });
      tap('tap');
    },
  });

  const pos = (v) => {
    const at = slotOf(v);
    return at >= 0 ? [LANE_X[at], SLOT_Y] : [LANE_X[home.indexOf(v)], BANK_Y];
  };

  // Petunjuk: nombor paling kecil (menaik) / besar (menurun) yang belum berada di tempatnya
  const firstOpen = slots.findIndex((v, i) => v !== q.answer[i]);
  const hintValue = hint && firstOpen >= 0 ? q.answer[firstOpen] : null;
  const armed = selected !== null || dd.drag;

  return (
    <svg ref={dd.svgRef} className="g-stage" viewBox="0 0 1000 560" role="group" aria-label="Sungai dan batu">
      <RiverScene crossed={solved} ninjaMood={solved ? 'cheer' : 'idle'}>
        <text className="g-dir" x="500" y="66" textAnchor="middle">
          {q.dir === 'asc' ? 'kecil → besar' : 'besar → kecil'}
        </text>
        <g
          className={`g-bank${selected !== null && slotOf(selected) >= 0 ? ' is-armed' : ''}`}
          {...dd.bindTarget('Tebing batu', () => selected !== null && move(selected, 'bank'), {
            inactive: selected === null || slotOf(selected) < 0,
          })}
        >
          <rect x={BANK.x} y={BANK.y} width={BANK.w} height={BANK.h} fill="transparent" />
          {home.map((v, i) =>
            slotOf(v) >= 0 ? <ellipse key={v} className="g-tray-spot" cx={LANE_X[i]} cy={BANK_Y} rx={RX - 6} ry={RY - 6} /> : null
          )}
        </g>
        {LANE_X.map((x, i) => {
          const wrong = board.wrong === i;
          return (
            <g
              key={i}
              className={`g-target g-slot${armed ? ' is-armed' : ''}${dd.drag?.over === i ? ' is-over' : ''}${wrong ? ' is-wrong' : ''}${hintValue !== null && firstOpen === i ? ' is-hint' : ''}`}
              {...dd.bindTarget(
                `Tempat ${i + 1}${slots[i] !== null ? `, batu ${slots[i]}` : ', kosong'}${wrong ? ', belum betul' : ''}`,
                () => selected !== null && move(selected, i),
                { inactive: selected === null }
              )}
            >
              <ellipse className="g-target-box" cx={x} cy={SLOT_Y} rx={RX + 10} ry={RY + 10} />
              <text className="g-tiny" x={x} y={SLOT_Y + 96} textAnchor="middle" fill="#1d4f6e">
                {i + 1}
              </text>
            </g>
          );
        })}

        {home.map((v) => {
          const [x, y] = pos(v);
          const at = slotOf(v);
          const isSel = selected === v;
          return (
            <g
              key={v}
              className={`g-item${isSel ? ' is-selected' : ''}${dd.drag?.id === v ? ' is-ghosted' : ''}${hintValue === v ? ' is-hint' : ''}`}
              transform={`translate(${x} ${y})`}
              {...dd.bindItem(v, `Batu ${v}${at >= 0 ? `, di tempat ${at + 1}` : ', di tebing'}${isSel ? ', dipilih' : ''}`, { selected: isSel })}
            >
              <rect className="g-hit" x={-RX - 8} y={-RY - 12} width={RX * 2 + 16} height={RY * 2 + 28} rx="20" />
              <Stone rx={RX} ry={RY} label={v} />
              {board.wrong === at && at >= 0 && <Bang x={RX - 8} y={-RY + 2} />}
            </g>
          );
        })}

        {solved && <Tick x={LANE_X[3] + RX} y={SLOT_Y - RY - 8} r={22} />}

        {dd.drag && (
          <g className="g-ghost" transform={`translate(${pos(dd.drag.id)[0] + dd.drag.dx} ${pos(dd.drag.id)[1] + dd.drag.dy})`}>
            <Stone rx={RX} ry={RY} label={dd.drag.id} />
          </g>
        )}
      </RiverScene>
      {hintValue !== null && (
        <g aria-hidden="true">
          <rect className="g-panel" x="290" y="84" width="420" height="44" rx="22" />
          <text className="g-tiny" x="500" y="114" textAnchor="middle">
            {q.hint}
          </text>
        </g>
      )}
    </svg>
  );
}

export function Demo() {
  return (
    <svg className="demo-svg" viewBox="0 0 600 300" aria-hidden="true">
      <rect x="0" y="0" width="600" height="160" fill="#7cc6ec" rx="16" />
      <text className="g-tiny" x="300" y="30" textAnchor="middle">
        kecil → besar
      </text>
      {[0, 1, 2, 3].map((i) => (
        <ellipse key={i} className="g-target-box demo-slot" cx={120 + i * 120} cy="95" rx="50" ry="36" />
      ))}
      {[[9, 120], [5, 240], [7, 480]].map(([v, x]) => (
        <g key={v} transform={`translate(${x} 235) scale(.7)`}>
          <Stone label={v} />
        </g>
      ))}
      <g transform="translate(360 235)">
        <g className="demo-move" style={{ '--dx': '-240px', '--dy': '-140px' }}>
          <g transform="scale(.7)">
            <Stone label={2} />
          </g>
          <g transform="translate(14 14)">
            <Hand />
          </g>
        </g>
      </g>
    </svg>
  );
}

export const demoText = 'Baca arahan. Seret batu ke tempat 1 hingga 4 dari kiri ke kanan. Boleh juga ketik batu, kemudian ketik tempat.';
