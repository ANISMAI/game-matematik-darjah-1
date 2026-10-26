import { shuffle } from '../lib/questions.js';
import { ArtDefs, Bang, gridPositions, Hand, MiniNinja, NinjaPot, Shuriken, Tick } from './GameArt.jsx';
import { inRect, useDragDrop } from './useDragDrop.js';

const BW = 230;
const BH = 150;
const SHELF_X = [300, 700];
const SHELF_Y = 112;
const SHELF = { x: 60, y: 10, w: 880, h: 200 };
const MATS = {
  less: { x: 70, y: 305, w: 400, h: 245, label: 'Lebih sedikit' },
  more: { x: 530, y: 305, w: 400, h: 245, label: 'Lebih banyak' },
};
const MAT_IDS = ['less', 'more'];
const TAGS = ['A', 'B'];

export function init(q) {
  // bakul A/B ialah label kedudukan rak; kuantiti dikocok ke kedudukan rak
  const counts = shuffle(q.counts);
  return { counts, place: [null, null], selected: null, wrong: false };
}

export function restore(b, q) {
  return Array.isArray(b?.counts) && [...b.counts].sort().join() === [...q.counts].sort().join() && Array.isArray(b.place) && b.place.length === 2;
}

export const canCheck = (b) => b.place.every(Boolean);

export function check(b) {
  const [a, c] = b.counts;
  const want = a < c ? ['less', 'more'] : ['more', 'less'];
  const ok = b.place[0] === want[0] && b.place[1] === want[1];
  return { ok, board: { ...b, selected: null, wrong: !ok } };
}

function Stars({ n }) {
  return gridPositions(n, 0, 2, 42, 40).map(([x, y], i) => <Shuriken key={i} x={x} y={y} s={0.78} />);
}

function BasketArt({ n, tag }) {
  return (
    <g>
      <NinjaPot w={BW} h={BH} tag={tag} />
      <Stars n={n} />
    </g>
  );
}

// Ikon mat: satu shuriken vs banyak shuriken (label tidak bergantung pada warna)
function MatIcon({ kind }) {
  return kind === 'less' ? (
    <Shuriken x={0} y={0} s={0.5} />
  ) : (
    <g>
      <Shuriken x={-14} y={4} s={0.5} />
      <Shuriken x={14} y={4} s={0.5} />
      <Shuriken x={0} y={-12} s={0.5} />
    </g>
  );
}

export default function SortingGame({ board, setBoard, solved, hint, tap }) {
  const { counts, place, selected } = board;

  const move = (bi, target) => {
    const next = [...place];
    if (target === 'shelf') next[bi] = null;
    else {
      const other = next.indexOf(target);
      // mat sudah ada bakul lain: tukar tempat
      if (other >= 0 && other !== bi) next[other] = next[bi];
      next[bi] = target;
    }
    setBoard({ ...board, place: next, selected: null, wrong: false });
    tap('tap');
  };

  const dd = useDragDrop({
    disabled: solved,
    hitTest: (x, y) => MAT_IDS.find((m) => inRect(x, y, MATS[m])) ?? (inRect(x, y, SHELF) ? 'shelf' : null),
    onDrop: (id, t) => move(id, t),
    onPick: (id) => {
      // bakul lain sudah dipilih dan bakul ini di atas mat: letak di mat ini (tukar)
      if (selected !== null && selected !== id && place[id]) {
        move(selected, place[id]);
        return;
      }
      setBoard({ ...board, selected: selected === id ? null : id });
      tap('tap');
    },
  });

  const pos = (bi) => {
    const m = place[bi];
    return m ? [MATS[m].x + MATS[m].w / 2, MATS[m].y + 100] : [SHELF_X[bi], SHELF_Y];
  };
  const result = solved ? null : board.wrong;
  const armed = selected !== null || dd.drag;

  return (
    <svg ref={dd.svgRef} className="g-stage" viewBox="0 0 1000 560" role="group" aria-label="Bakul dan tikar">
      <ArtDefs />
      <g
        className={`g-shelf${selected !== null && place[selected] ? ' is-armed' : ''}`}
        {...dd.bindTarget('Rak bakul', () => selected !== null && move(selected, 'shelf'), { inactive: selected === null || !place[selected] })}
      >
        <rect x={SHELF.x} y={SHELF.y} width={SHELF.w} height={SHELF.h} rx="24" />
        <rect x={SHELF.x + 20} y={SHELF.y + SHELF.h - 22} width={SHELF.w - 40} height="14" rx="7" fill="#a8703a" />
      </g>

      {MAT_IDS.map((m) => {
        const r = MATS[m];
        const filled = place.indexOf(m);
        return (
          <g
            key={m}
            className={`g-target g-mat${armed ? ' is-armed' : ''}${dd.drag?.over === m ? ' is-over' : ''}`}
            {...dd.bindTarget(`Tikar ${r.label}${filled >= 0 ? `, ada bakul ${TAGS[filled]}` : ', kosong'}`, () => selected !== null && move(selected, m), {
              inactive: selected === null,
            })}
          >
            <rect className="g-target-box" x={r.x} y={r.y} width={r.w} height={r.h} rx="26" />
            <g transform={`translate(${r.x + r.w / 2} ${r.y + r.h - 24})`}>
              <rect x="-150" y="-24" width="300" height="44" rx="22" fill="#fffdf6" stroke="#3b2a1a" strokeWidth="3" />
              <g transform="translate(-118 -2)">
                <MatIcon kind={m} />
              </g>
              <text className="g-label" x="16" y="10" textAnchor="middle">
                {r.label}
              </text>
            </g>
          </g>
        );
      })}

      {hint && (
        <g aria-hidden="true" className="g-hint-band">
          <rect className="g-panel" x="190" y="214" width="620" height="86" rx="16" />
          {[0, 1].map((bi) => {
            const y = 236 + bi * 42;
            const other = counts[1 - bi];
            return (
              <g key={bi}>
                <text className="g-tag" x="214" y={y + 9} textAnchor="middle">
                  {TAGS[bi]}
                </text>
                {Array.from({ length: counts[bi] }, (_, i) => {
                  const x = 260 + i * 52;
                  const extra = i >= other;
                  return (
                    <g key={i}>
                      <Fruit x={x} y={y} r={12} />
                      {extra && <circle cx={x} cy={y} r="18" className="g-extra" />}
                    </g>
                  );
                })}
              </g>
            );
          })}
          {Array.from({ length: Math.min(...counts) }, (_, i) => (
            <line key={i} x1={260 + i * 52} x2={260 + i * 52} y1="250" y2="264" className="g-pair" />
          ))}
        </g>
      )}

      {[0, 1].map((bi) => {
        const [x, y] = pos(bi);
        const isSel = selected === bi;
        const where = place[bi] ? `di atas tikar ${MATS[place[bi]].label}` : 'di rak';
        return (
          <g
            key={bi}
            className={`g-item${isSel ? ' is-selected' : ''}${dd.drag?.id === bi ? ' is-ghosted' : ''}`}
            transform={`translate(${x} ${y})`}
            {...dd.bindItem(bi, `Bekas ${TAGS[bi]} dengan ${counts[bi]} shuriken, ${where}${isSel ? ', dipilih' : ''}`, { selected: isSel })}
          >
            <rect className="g-hit" x={-BW / 2 - 8} y={-BH / 2 - 40} width={BW + 16} height={BH + 56} rx="18" />
            <BasketArt n={counts[bi]} tag={TAGS[bi]} />
            {solved && <Tick x={BW / 2 - 6} y={-BH / 2 - 10} />}
            {result && <Bang x={BW / 2 - 6} y={-BH / 2 - 10} />}
          </g>
        );
      })}

      {dd.drag && (
        <g className="g-ghost" transform={`translate(${pos(dd.drag.id)[0] + dd.drag.dx} ${pos(dd.drag.id)[1] + dd.drag.dy})`}>
          <BasketArt n={counts[dd.drag.id]} tag={TAGS[dd.drag.id]} />
        </g>
      )}

      {/* ninja mini memberi reaksi */}
      <MiniNinja x={70} y={540} size={84} mood={solved ? 'cheer' : 'happy'} />
    </svg>
  );
}

export function Demo() {
  return (
    <svg className="demo-svg" viewBox="0 0 600 300" aria-hidden="true">
      <g className="g-mat">
        <rect className="g-target-box" x="30" y="170" width="250" height="120" rx="18" />
        <text className="g-tiny" x="155" y="278" textAnchor="middle">
          Lebih sedikit
        </text>
      </g>
      <g className="g-mat">
        <rect className="g-target-box" x="320" y="170" width="250" height="120" rx="18" />
        <text className="g-tiny" x="445" y="278" textAnchor="middle">
          Lebih banyak
        </text>
      </g>
      <g transform="translate(450 70) scale(.6)">
        <BasketArt n={4} />
      </g>
      <g transform="translate(150 70) scale(.6)">
        <g className="demo-move" style={{ '--dx': '8px', '--dy': '230px' }}>
          <BasketArt n={3} />
          <g transform="translate(30 40)">
            <Hand />
          </g>
        </g>
      </g>
    </svg>
  );
}

export const demoText = 'Bandingkan dua bekas. Seret bekas yang ada shuriken lebih sedikit ke tikar "Lebih sedikit", dan yang satu lagi ke "Lebih banyak".';
