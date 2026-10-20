import { shuffle } from '../lib/questions.js';
import { gridPositions, Hand, Lantern, ScrollCard, Tick } from './GameArt.jsx';
import { inRect, useDragDrop } from './useDragDrop.js';
import { T } from '../data/strings.js';

const ROWS = [95, 280, 465];
const SCROLL = { cx: 160, w: 170, h: 112 };
const GROUP = { x: 470, w: 470, h: 160 };
const groupRect = (row) => ({ x: GROUP.x, y: ROWS[row] - GROUP.h / 2, w: GROUP.w, h: GROUP.h });

function LanternGroup({ n, cx, cy, hint }) {
  const pos = gridPositions(n, cx, cy, 86, 74);
  return pos.map(([x, y], i) => (
    <g key={i}>
      <Lantern x={x} y={y} s={n > 5 ? 0.92 : 1.05} />
      {hint && (
        <g className="g-hint-num" style={{ '--i': i }} transform={`translate(${x + 24} ${y - 26})`}>
          <circle r="17" fill="#ffb703" stroke="#fff" strokeWidth="3" />
          <text className="g-small" y="7" textAnchor="middle">
            {i + 1}
          </text>
        </g>
      )}
    </g>
  ));
}

export function init(q) {
  const left = shuffle(q.values);
  let right = shuffle(q.values);
  // elakkan susunan yang terus sebaris dengan skrol
  for (let k = 0; k < 6 && right.every((v, i) => v === left[i]); k++) right = shuffle(q.values);
  return { left, right, solved: [], selected: null };
}

const sameSet = (a, b) => Array.isArray(a) && a.length === b.length && [...a].sort().join() === [...b].sort().join();

export function restore(b, q) {
  return sameSet(b?.left, q.values) && sameSet(b?.right, q.values) && Array.isArray(b.solved) && b.solved.every((v) => q.values.includes(v));
}

export default function MatchingGame({ q, board, setBoard, fail, succeed, solved: done, hint, tap }) {
  const { left, right, solved, selected } = board;

  const tryMatch = (sv, gv) => {
    if (solved.includes(gv) || solved.includes(sv)) return; // sasaran yang sudah dipadankan tidak boleh diguna semula
    if (sv === gv) {
      const next = { ...board, solved: [...solved, gv], selected: null };
      if (next.solved.length === q.values.length) succeed(next);
      else {
        setBoard(next);
        tap('correct');
      }
    } else {
      // padanan salah: hanya pilihan semasa dikosongkan, pasangan yang betul kekal
      fail({ ...board, selected: null });
    }
  };

  const dd = useDragDrop({
    disabled: done,
    hitTest: (x, y) => {
      const row = right.findIndex((v, i) => !solved.includes(v) && inRect(x, y, groupRect(i)));
      return row >= 0 ? right[row] : null;
    },
    onDrop: (id, gv) => tryMatch(id, gv),
    onPick: (id) => {
      setBoard({ ...board, selected: selected === id ? null : id });
      tap('tap');
    },
  });

  // Petunjuk: kumpulan pertama yang belum dipadankan dikira (tanpa melengkapkan pasangan)
  const hintValue = hint ? right.find((v) => !solved.includes(v)) : null;
  const active = selected !== null || dd.drag;

  const drawScroll = (v) => <ScrollCard w={SCROLL.w} h={SCROLL.h} label={v} />;

  return (
    <svg ref={dd.svgRef} className="g-stage" viewBox="0 0 1000 560" role="group" aria-label="Papan padanan">
      {/* tali bagi pasangan yang sudah betul */}
      {solved.map((v) => {
        const y1 = ROWS[left.indexOf(v)];
        const y2 = ROWS[right.indexOf(v)];
        return (
          <g key={v} aria-hidden="true">
            <path d={`M${SCROLL.cx + SCROLL.w / 2 + 8} ${y1} C 360 ${y1}, 360 ${y2}, ${GROUP.x} ${y2}`} className="g-rope" />
            <path d={`M${SCROLL.cx + SCROLL.w / 2 + 8} ${y1} C 360 ${y1}, 360 ${y2}, ${GROUP.x} ${y2}`} className="g-rope-dash" />
          </g>
        );
      })}

      {right.map((v, i) => {
        const r = groupRect(i);
        const isSolved = solved.includes(v);
        const isOver = dd.drag?.over === v;
        return (
          <g
            key={v}
            className={`g-target${isSolved ? ' is-solved' : ''}${active && !isSolved ? ' is-armed' : ''}${isOver ? ' is-over' : ''}${hintValue === v ? ' is-hint' : ''}`}
            {...dd.bindTarget(
              `Kumpulan tanglung ${i + 1}${isSolved ? `, ${T.solved} dengan ${v}` : ''}`,
              () => selected !== null && tryMatch(selected, v),
              { inactive: isSolved || selected === null }
            )}
          >
            <rect className="g-target-box" x={r.x} y={r.y} width={r.w} height={r.h} rx="22" />
            <LanternGroup n={v} cx={r.x + r.w / 2} cy={ROWS[i] + 4} hint={hintValue === v} />
            {isSolved && <Tick x={r.x + r.w - 6} y={r.y + 8} />}
          </g>
        );
      })}

      {left.map((v, i) => {
        const isSolved = solved.includes(v);
        const isSel = selected === v;
        const dragging = dd.drag?.id === v;
        return (
          <g
            key={v}
            className={`g-item${isSel ? ' is-selected' : ''}${isSolved ? ' is-solved' : ''}${dragging ? ' is-ghosted' : ''}`}
            transform={`translate(${SCROLL.cx} ${ROWS[i]})`}
            {...dd.bindItem(v, `Skrol nombor ${v}${isSolved ? `, ${T.solved}` : ''}${isSel ? `, ${T.selected}` : ''}`, {
              inactive: isSolved,
              selected: isSel,
            })}
          >
            <rect className="g-hit" x={-SCROLL.w / 2 - 10} y={-SCROLL.h / 2 - 10} width={SCROLL.w + 20} height={SCROLL.h + 20} rx="16" />
            {drawScroll(v)}
            {isSolved && <Tick x={SCROLL.w / 2 - 4} y={-SCROLL.h / 2 + 2} />}
          </g>
        );
      })}

      {dd.drag && (
        <g className="g-ghost" transform={`translate(${SCROLL.cx + dd.drag.dx} ${ROWS[left.indexOf(dd.drag.id)] + dd.drag.dy})`}>
          {drawScroll(dd.drag.id)}
        </g>
      )}
    </svg>
  );
}

// Demo satu tindakan dengan data contoh berasingan (skrol 2 → kumpulan 2 tanglung)
export function Demo() {
  return (
    <svg className="demo-svg" viewBox="0 0 600 300" aria-hidden="true">
      <g className="g-target is-armed">
        <rect className="g-target-box" x="300" y="30" width="260" height="100" rx="18" />
        <Lantern x={430} y={80} s={0.85} />
      </g>
      <g className="g-target is-armed">
        <rect className="g-target-box" x="300" y="170" width="260" height="100" rx="18" />
        <Lantern x={395} y={220} s={0.85} />
        <Lantern x={465} y={220} s={0.85} />
      </g>
      <g transform="translate(110 220)">
        <g className="demo-move" style={{ '--dx': '200px', '--dy': '0px' }}>
          <ScrollCard w={130} h={90} label={2} fontSize={52} />
          <g transform="translate(10 20)">
            <Hand />
          </g>
        </g>
      </g>
      <g transform="translate(110 80)">
        <ScrollCard w={130} h={90} label={1} fontSize={52} />
      </g>
    </svg>
  );
}

export const demoText = 'Seret skrol nombor ke kumpulan tanglung yang sama banyak. Boleh juga ketik skrol, kemudian ketik kumpulan.';
