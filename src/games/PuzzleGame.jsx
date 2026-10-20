import { shuffle } from '../lib/questions.js';
import { Apple, Hand, PuzzlePiece, Tick } from './GameArt.jsx';
import { inRect, useDragDrop } from './useDragDrop.js';

const SLOTS = ['start', 'op', 'result'];
const SLOT_X = { start: 280, op: 500, result: 720 };
const SLOT_Y = 250;
const SLOT_LABEL = { start: 'Nombor mula', op: 'Tolak', result: 'Jawapan' };
const PW = 220;
const PH = 120;
const TRAY_X = [140, 380, 620, 860];
const TRAY_Y = 455;
const TRAY = { x: 10, y: 375, w: 980, h: 175 };
const slotRect = (s) => ({ x: SLOT_X[s] - PW / 2 - 6, y: SLOT_Y - PH / 2 - 14, w: PW + 12, h: PH + 28 });

const MINUS = '−';

export function piecesFor(q) {
  return {
    start: { id: 'start', kind: 'start', label: `${q.start}`, name: `Kepingan nombor ${q.start}` },
    op: { id: 'op', kind: 'op', label: `${MINUS} ${q.take}`, name: `Kepingan tolak ${q.take}` },
    [`r${q.answer}`]: { id: `r${q.answer}`, kind: 'result', label: `= ${q.answer}`, name: `Kepingan sama dengan ${q.answer}` },
    [`r${q.distractor}`]: { id: `r${q.distractor}`, kind: 'result', label: `= ${q.distractor}`, name: `Kepingan sama dengan ${q.distractor}` },
  };
}

export function init(q) {
  return { tray: shuffle(Object.keys(piecesFor(q))), slots: { start: null, op: null, result: null }, selected: null };
}

export function restore(b, q) {
  const ids = Object.keys(piecesFor(q));
  return Array.isArray(b?.tray) && [...b.tray].sort().join() === [...ids].sort().join() && b.slots && SLOTS.every((s) => b.slots[s] === null || ids.includes(b.slots[s]));
}

export const canCheck = (b) => SLOTS.every((s) => b.slots[s]);

export function check(b, q) {
  return { ok: b.slots.result === `r${q.answer}` && b.slots.start === 'start' && b.slots.op === 'op', board: { ...b, selected: null } };
}

const slotOf = (b, id) => SLOTS.find((s) => b.slots[s] === id) ?? null;

export default function PuzzleGame({ q, board, setBoard, solved, hint, tap }) {
  const pieces = piecesFor(q);

  // Letak kepingan ke dalam petak jenisnya. Kepingan lama dalam petak itu kembali ke dulang.
  const place = (id, slot) => {
    if (pieces[id].kind !== slot) return false; // petak hanya menerima jenis kepingannya
    const slots = { ...board.slots };
    const from = slotOf(board, id);
    if (from) slots[from] = null;
    slots[slot] = id;
    setBoard({ ...board, slots, selected: null });
    tap('tap');
    return true;
  };

  const toTray = (id) => {
    const from = slotOf(board, id);
    if (!from) return;
    setBoard({ ...board, slots: { ...board.slots, [from]: null }, selected: null });
  };

  const dd = useDragDrop({
    disabled: solved,
    hitTest: (x, y, id) => {
      const s = SLOTS.find((k) => inRect(x, y, slotRect(k)));
      if (s) return s === pieces[id].kind ? s : null;
      return inRect(x, y, TRAY) ? 'tray' : null;
    },
    onDrop: (id, t) => (t === 'tray' ? toTray(id) : place(id, t)),
    onPick: (id) => {
      const sel = board.selected;
      // kepingan lain sudah dipilih dan ini kepingan dalam petak yang sama jenis: tukar
      const at = slotOf(board, id);
      if (sel && sel !== id && at && pieces[sel].kind === at) {
        place(sel, at);
        return;
      }
      setBoard({ ...board, selected: sel === id ? null : id });
      tap('tap');
    },
  });

  const pos = (id) => {
    const s = slotOf(board, id);
    return s ? [SLOT_X[s], SLOT_Y] : [TRAY_X[board.tray.indexOf(id)], TRAY_Y];
  };

  const sel = board.selected;
  const selKind = sel ? pieces[sel].kind : null;
  const dragKind = dd.drag ? pieces[dd.drag.id].kind : null;

  return (
    <svg ref={dd.svgRef} className={`g-stage${solved ? ' is-joined' : ''}`} viewBox="0 0 1000 560" role="group" aria-label="Teka-teki skrol tolak">
      {/* Petunjuk: objek mula, kemudian objek yang ditolak diambil keluar */}
      {hint && (
        <g aria-hidden="true">
          <rect className="g-panel" x="170" y="14" width="660" height="120" rx="20" />
          {Array.from({ length: q.start }, (_, i) => {
            const x = 500 + (i - (q.start - 1) / 2) * 62;
            const out = i >= q.start - q.take;
            return (
              <g key={i} className={out ? 'g-take-away' : ''} style={{ '--i': i - (q.start - q.take) }}>
                <Apple x={x} y={78} s={0.95} />
                {out && <path d={`M${x - 20} 58 l40 40 M${x + 20} 58 l-40 40`} className="g-cross" />}
              </g>
            );
          })}
          <text className="g-tiny" x="500" y="126" textAnchor="middle">
            {q.start} objek, ambil keluar {q.take}
          </text>
        </g>
      )}

      {/* petak: tiga kepingan bersambung */}
      {solved && (
        <g aria-hidden="true">
          <rect x={SLOT_X.start - PW / 2 - 26} y={SLOT_Y - PH / 2 - 12} width="22" height={PH + 24} rx="11" fill="#c68b4e" stroke="#3b2a1a" strokeWidth="3" />
          <rect x={SLOT_X.result + PW / 2 + 4} y={SLOT_Y - PH / 2 - 12} width="22" height={PH + 24} rx="11" fill="#c68b4e" stroke="#3b2a1a" strokeWidth="3" />
        </g>
      )}
      {SLOTS.map((s) => {
        const filled = board.slots[s];
        const armed = (selKind === s || dragKind === s) && !solved;
        return (
          <g
            key={s}
            className={`g-target${armed ? ' is-armed' : ''}${dd.drag?.over === s ? ' is-over' : ''}`}
            transform={`translate(${SLOT_X[s]} ${SLOT_Y})`}
            {...dd.bindTarget(`Petak ${SLOT_LABEL[s]}${filled ? `, berisi ${pieces[filled].label}` : ', kosong'}`, () => sel && place(sel, s), {
              inactive: !sel || selKind !== s,
            })}
          >
            <PuzzlePiece kind={s} w={PW} h={PH} dashed />
            {!filled && (
              <text className="g-tiny" y="8" textAnchor="middle" fill="#7a5a3a">
                {SLOT_LABEL[s]}
              </text>
            )}
          </g>
        );
      })}

      {/* dulang kepingan */}
      <g
        className={`g-tray${sel && slotOf(board, sel) ? ' is-armed' : ''}`}
        {...dd.bindTarget('Dulang kepingan', () => sel && toTray(sel), { inactive: !sel || !slotOf(board, sel) })}
      >
        <rect x={TRAY.x} y={TRAY.y} width={TRAY.w} height={TRAY.h} rx="24" />
        {board.tray.map((id, i) => (slotOf(board, id) ? <rect key={id} className="g-tray-spot" x={TRAY_X[i] - PW / 2 + 6} y={TRAY_Y - PH / 2 + 6} width={PW - 12} height={PH - 12} rx="14" /> : null))}
      </g>

      {board.tray.map((id) => {
        const p = pieces[id];
        const [x, y] = pos(id);
        const isSel = sel === id;
        return (
          <g
            key={id}
            className={`g-item${isSel ? ' is-selected' : ''}${dd.drag?.id === id ? ' is-ghosted' : ''}`}
            transform={`translate(${x} ${y})`}
            {...dd.bindItem(id, `${p.name}${slotOf(board, id) ? `, dalam petak ${SLOT_LABEL[slotOf(board, id)]}` : ''}${isSel ? ', dipilih' : ''}`, { selected: isSel })}
          >
            <PuzzlePiece kind={p.kind} label={p.label} w={PW} h={PH} fill={solved && slotOf(board, id) ? '#fff6dc' : '#fdf0d5'} />
          </g>
        );
      })}

      {solved && <Tick x={SLOT_X.result + PW / 2 - 4} y={SLOT_Y - PH / 2 - 4} r={22} />}

      {dd.drag && (
        <g className="g-ghost" transform={`translate(${pos(dd.drag.id)[0] + dd.drag.dx} ${pos(dd.drag.id)[1] + dd.drag.dy})`}>
          <PuzzlePiece kind={pieces[dd.drag.id].kind} label={pieces[dd.drag.id].label} w={PW} h={PH} />
        </g>
      )}
    </svg>
  );
}

export function Demo() {
  return (
    <svg className="demo-svg" viewBox="0 0 600 300" aria-hidden="true">
      <g transform="translate(150 90)">
        <PuzzlePiece kind="start" label="4" w={140} h={84} />
      </g>
      <g transform="translate(290 90)">
        <PuzzlePiece kind="op" label={`${MINUS} 1`} w={140} h={84} />
      </g>
      <g transform="translate(430 90)">
        <PuzzlePiece kind="result" w={140} h={84} dashed />
      </g>
      <g transform="translate(470 230)">
        <PuzzlePiece kind="result" label="= 2" w={140} h={84} />
      </g>
      <g transform="translate(250 230)">
        <g className="demo-move" style={{ '--dx': '180px', '--dy': '-140px' }}>
          <PuzzlePiece kind="result" label="= 3" w={140} h={84} />
          <g transform="translate(20 20)">
            <Hand />
          </g>
        </g>
      </g>
    </svg>
  );
}

export const demoText = 'Seret kepingan ke petak supaya menjadi ayat tolak. Semua jawapan muat; pilih yang betul, kemudian tekan Semak.';
