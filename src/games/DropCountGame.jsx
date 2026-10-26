// Mekanik 'dropcount' (Isi Balang): seret kumpulan biskut ke balang bernombor yang betul.
// Konsep: kuantiti objek ↔ nombor. Gaya seret-dan-lepas.
// Soalan: { id, groups: [n1, n2, n3] } — bilangan biskut setiap kumpulan (semua berbeza, 1–10).
import { shuffle } from '../lib/questions.js';
import { ArtDefs, Bang, Cookie, gridPositions, Hand, Jar, Tick } from './GameArt.jsx';
import { inRect, useDragDrop } from './useDragDrop.js';

const SLOT_X = [230, 500, 770]; // kedudukan kumpulan biskut di atas
const SLOT_Y = 130;
const JAR_X = [230, 500, 770]; // kedudukan balang di bawah
const JAR_Y = 410;
const JAR = { w: 150, h: 180 };
const HIT = { w: 180, h: 210 }; // kawasan lepas di sekitar setiap balang

const jarRect = (i) => ({ x: JAR_X[i] - HIT.w / 2, y: JAR_Y - HIT.h / 2, w: HIT.w, h: HIT.h });

export function init(q) {
  // nilai balang = kocokan groups supaya kedudukan balang berbeza daripada kumpulan
  let jars = shuffle(q.groups);
  for (let k = 0; k < 6 && jars.every((v, i) => v === q.groups[i]); k++) jars = shuffle(q.groups);
  return { jars, place: q.groups.map(() => null), selected: null, wrong: false };
}

export function restore(b, q) {
  return (
    Array.isArray(b?.jars) &&
    [...b.jars].sort().join() === [...q.groups].sort().join() &&
    Array.isArray(b.place) &&
    b.place.length === q.groups.length
  );
}

export const canCheck = (b) => b.place.every((p) => p !== null);

export function check(b, q) {
  // betul bila setiap kumpulan diletak pada balang yang nilainya = bilangan biskut kumpulan itu
  const ok = b.place.every((jarIdx, gi) => jarIdx !== null && b.jars[jarIdx] === q.groups[gi]);
  return { ok, board: { ...b, selected: null, wrong: !ok } };
}

function CookieGroup({ n }) {
  return gridPositions(n, 0, 0, 40, 36, 3).map(([x, y], i) => <Cookie key={i} x={x} y={y} r={16} />);
}

export default function DropCountGame({ q, board, setBoard, solved, hint, tap }) {
  const { jars, place, selected } = board;
  const groups = q.groups;

  const move = (gi, jarIdx) => {
    const next = [...place];
    if (jarIdx === 'back') next[gi] = null;
    else {
      const other = next.indexOf(jarIdx); // balang sudah diisi kumpulan lain → tukar
      if (other >= 0 && other !== gi) next[other] = next[gi];
      next[gi] = jarIdx;
    }
    setBoard({ ...board, place: next, selected: null, wrong: false });
    tap('tap');
  };

  const dd = useDragDrop({
    disabled: solved,
    hitTest: (x, y) => {
      const j = JAR_X.findIndex((_, i) => inRect(x, y, jarRect(i)));
      if (j >= 0) return j;
      return y < 260 ? 'back' : null; // lepas di kawasan atas → pulang ke tempat asal
    },
    onDrop: (gi, t) => move(gi, t),
    onPick: (gi) => {
      setBoard({ ...board, selected: selected === gi ? null : gi });
      tap('tap');
    },
  });

  // kedudukan semasa setiap kumpulan: di slot atas, atau di dalam balang
  const pos = (gi) => {
    const j = place[gi];
    return j !== null ? [JAR_X[j], JAR_Y - 20] : [SLOT_X[gi], SLOT_Y];
  };
  const result = solved ? null : board.wrong;

  return (
    <svg ref={dd.svgRef} className="g-stage" viewBox="0 0 1000 560" role="group" aria-label="Biskut dan balang">
      <ArtDefs />

      {/* balang bernombor (sasaran) */}
      {JAR_X.map((jx, i) => {
        const filled = place.indexOf(i);
        return (
          <g
            key={i}
            {...dd.bindTarget(
              `Balang ${jars[i]}${filled >= 0 ? ', sudah diisi' : ', kosong'}`,
              () => selected !== null && move(selected, i),
              { inactive: selected === null },
            )}
          >
            {/* kawasan lepas (halus) */}
            <rect
              x={jx - HIT.w / 2}
              y={JAR_Y - HIT.h / 2}
              width={HIT.w}
              height={HIT.h}
              rx="22"
              fill={dd.drag?.over === i ? 'rgba(255,255,255,0.45)' : 'transparent'}
              stroke={selected !== null || dd.drag ? '#5aa6cf' : 'transparent'}
              strokeWidth="3"
              strokeDasharray="8 7"
            />
            <g transform={`translate(${jx} ${JAR_Y})`}>
              <Jar w={JAR.w} h={JAR.h} label={jars[i]} />
            </g>
          </g>
        );
      })}

      {hint && (
        <text x="500" y="300" textAnchor="middle" fontSize="26" fontWeight="700" fill="#5c4a3a">
          Kira biskut, kemudian seret ke balang dengan nombor yang sama.
        </text>
      )}

      {/* kumpulan biskut (objek boleh seret) */}
      {groups.map((n, gi) => {
        const [x, y] = pos(gi);
        const isSel = selected === gi;
        const inJar = place[gi] !== null;
        return (
          <g
            key={gi}
            transform={`translate(${x} ${y})`}
            style={{ opacity: dd.drag?.id === gi ? 0.3 : 1, cursor: solved ? 'default' : 'grab' }}
            {...dd.bindItem(gi, `Kumpulan ${n} biskut${inJar ? ', di dalam balang' : ''}${isSel ? ', dipilih' : ''}`, { selected: isSel })}
          >
            <rect x={-70} y={-60} width={140} height={120} rx="18" fill={isSel ? 'rgba(255,209,102,0.5)' : 'transparent'} className="g-hit" />
            <CookieGroup n={n} />
            {solved && inJar && <Tick x={54} y={-48} />}
            {result && <Bang x={54} y={-48} />}
          </g>
        );
      })}

      {/* bayang objek semasa diseret */}
      {dd.drag && (
        <g transform={`translate(${pos(dd.drag.id)[0] + dd.drag.dx} ${pos(dd.drag.id)[1] + dd.drag.dy})`} opacity="0.95">
          <CookieGroup n={groups[dd.drag.id]} />
        </g>
      )}
    </svg>
  );
}

export function Demo() {
  return (
    <svg className="demo-svg" viewBox="0 0 600 300" aria-hidden="true">
      <g transform="translate(140 70)">
        <Cookie x={-24} y={0} r={15} />
        <Cookie x={10} y={0} r={15} />
        <Cookie x={-7} y={26} r={15} />
      </g>
      <g className="demo-move" style={{ '--dx': '0px', '--dy': '150px' }} transform="translate(140 70)">
        <Cookie x={-24} y={0} r={15} />
        <Cookie x={10} y={0} r={15} />
        <Cookie x={-7} y={26} r={15} />
      </g>
      <g transform="translate(430 150)">
        <Jar w={110} h={140} label={3} />
      </g>
      <g className="demo-tap" transform="translate(220 150)">
        <Hand />
      </g>
    </svg>
  );
}

export const demoText = 'Kira biskut dalam setiap kumpulan, kemudian seret ke balang yang ada nombor sama.';
