import { shuffle } from '../lib/questions.js';
import { Hand, Plank, Tick } from './GameArt.jsx';
import { LANE_X, RiverScene } from './OrderingGame.jsx';
import { inRect, useDragDrop } from './useDragDrop.js';

const PLANK_Y = 205;
const PW = 150;
const PH = 110;
const TILE_X = [320, 500, 680];
const TILE_Y = 460;
const TRAY = { x: 0, y: 360, w: 1000, h: 200 };

export function init(q) {
  return { tiles: shuffle(q.options), placed: null, selected: null };
}

export function restore(b, q) {
  return Array.isArray(b?.tiles) && [...b.tiles].sort().join() === [...q.options].sort().join() && (b.placed === null || q.options.includes(b.placed));
}

export const canCheck = (b) => b.placed !== null;

// Salah: jubin kembali ke tebing; papan tetap tidak berubah.
export function check(b, q) {
  const ok = b.placed === q.answer;
  return { ok, board: ok ? { ...b, selected: null } : { ...b, placed: null, selected: null } };
}

export default function FillBlankGame({ q, board, setBoard, solved, hint, tap }) {
  const gap = q.sequence.indexOf(null);
  const gapRect = { x: LANE_X[gap] - PW / 2 - 20, y: PLANK_Y - PH / 2 - 20, w: PW + 40, h: PH + 40 };
  const { tiles, placed, selected } = board;

  const put = (v, target) => {
    if (target === 'gap') setBoard({ ...board, placed: v, selected: null }); // jubin lama kembali ke tebing
    else if (placed === v) setBoard({ ...board, placed: null, selected: null });
    tap('tap');
  };

  const dd = useDragDrop({
    disabled: solved,
    hitTest: (x, y) => (inRect(x, y, gapRect) ? 'gap' : inRect(x, y, TRAY) ? 'tray' : null),
    onDrop: (v, t) => put(v, t),
    onPick: (v) => {
      if (selected !== null && selected !== v && placed === v) {
        put(selected, 'gap');
        return;
      }
      setBoard({ ...board, selected: selected === v ? null : v });
      tap('tap');
    },
  });

  const pos = (v) => (placed === v ? [LANE_X[gap], PLANK_Y] : [TILE_X[tiles.indexOf(v)], TILE_Y]);
  const armed = selected !== null || dd.drag;
  const near = (i) => hint && Math.abs(i - gap) === 1;

  return (
    <svg ref={dd.svgRef} className="g-stage" viewBox="0 0 1000 560" role="group" aria-label="Jambatan nombor">
      <RiverScene crossed={solved} ninjaMood={solved ? 'cheer' : 'idle'}>
        {/* tali jambatan */}
        <path d={`M150 ${PLANK_Y - 62} Q500 ${PLANK_Y - 40} 850 ${PLANK_Y - 62}`} className="g-bridge-rope" />
        <path d={`M150 ${PLANK_Y + 62} Q500 ${PLANK_Y + 84} 850 ${PLANK_Y + 62}`} className="g-bridge-rope" />

        {q.sequence.map((v, i) =>
          v === null ? (
            <g
              key={i}
              className={`g-target g-gap${armed ? ' is-armed' : ''}${dd.drag?.over === 'gap' ? ' is-over' : ''}${hint ? ' is-hint' : ''}`}
              {...dd.bindTarget(`Papan hilang${placed !== null ? `, berisi ${placed}` : ', kosong'}`, () => selected !== null && put(selected, 'gap'), {
                inactive: selected === null,
              })}
            >
              <rect className="g-target-box" x={LANE_X[i] - PW / 2} y={PLANK_Y - PH / 2} width={PW} height={PH} rx="12" />
              {placed === null && (
                <text className="g-num" x={LANE_X[i]} y={PLANK_Y + 20} textAnchor="middle" fontSize="58" fill="#1d4f6e">
                  ?
                </text>
              )}
            </g>
          ) : (
            // papan tetap: dikunci, tidak boleh dialih
            <g key={i} className={`g-fixed${near(i) ? ' is-hint' : ''}`} transform={`translate(${LANE_X[i]} ${PLANK_Y})`} role="img" aria-label={`Papan tetap ${v}`}>
              <Plank w={PW} h={PH} label={v} />
            </g>
          )
        )}

        {hint &&
          [0, 1, 2].map((i) => (
            <g key={i} aria-hidden="true" className="g-step" transform={`translate(${(LANE_X[i] + LANE_X[i + 1]) / 2} ${PLANK_Y - 86})`}>
              <rect x="-30" y="-20" width="60" height="36" rx="18" fill="#fff4dd" stroke="#3b2a1a" strokeWidth="2.5" />
              <text className="g-tiny" y="7" textAnchor="middle">
                +1
              </text>
            </g>
          ))}

        <g
          className={`g-bank${placed !== null && selected === placed ? ' is-armed' : ''}`}
          {...dd.bindTarget('Tebing jubin', () => selected !== null && put(selected, 'tray'), { inactive: selected === null || placed !== selected })}
        >
          <rect x={TRAY.x} y={TRAY.y} width={TRAY.w} height={TRAY.h} fill="transparent" />
          {tiles.map((v, i) => (placed === v ? <rect key={v} className="g-tray-spot" x={TILE_X[i] - PW / 2 + 6} y={TILE_Y - PH / 2 + 6} width={PW - 12} height={PH - 12} rx="12" /> : null))}
        </g>

        {tiles.map((v) => {
          const [x, y] = pos(v);
          const isSel = selected === v;
          return (
            <g
              key={v}
              className={`g-item${isSel ? ' is-selected' : ''}${dd.drag?.id === v ? ' is-ghosted' : ''}`}
              transform={`translate(${x} ${y})`}
              {...dd.bindItem(v, `Jubin ${v}${placed === v ? ', di jambatan' : ''}${isSel ? ', dipilih' : ''}`, { selected: isSel })}
            >
              <rect className="g-hit" x={-PW / 2 - 8} y={-PH / 2 - 8} width={PW + 16} height={PH + 16} rx="16" />
              <Plank w={PW} h={PH} label={v} />
            </g>
          );
        })}

        {solved && <Tick x={LANE_X[gap] + PW / 2 - 4} y={PLANK_Y - PH / 2} r={22} />}

        {dd.drag && (
          <g className="g-ghost" transform={`translate(${pos(dd.drag.id)[0] + dd.drag.dx} ${pos(dd.drag.id)[1] + dd.drag.dy})`}>
            <Plank w={PW} h={PH} label={dd.drag.id} />
          </g>
        )}
      </RiverScene>
    </svg>
  );
}

export function Demo() {
  return (
    <svg className="demo-svg" viewBox="0 0 600 300" aria-hidden="true">
      <rect x="0" y="0" width="600" height="160" fill="#7cc6ec" rx="16" />
      {[0, 1, null, 3].map((v, i) =>
        v === null ? (
          <rect key={i} className="g-target-box demo-slot" x={75 + i * 130 - 50} y="45" width="100" height="74" rx="10" />
        ) : (
          <g key={i} transform={`translate(${75 + i * 130} 82) scale(.66)`}>
            <Plank label={v} />
          </g>
        )
      )}
      {[[5, 200], [4, 460]].map(([v, x]) => (
        <g key={v} transform={`translate(${x} 235) scale(.66)`}>
          <Plank label={v} />
        </g>
      ))}
      <g transform="translate(330 235)">
        <g className="demo-move" style={{ '--dx': '0px', '--dy': '-153px' }}>
          <g transform="scale(.66)">
            <Plank label={2} />
          </g>
          <g transform="translate(14 14)">
            <Hand />
          </g>
        </g>
      </g>
    </svg>
  );
}

export const demoText = 'Lihat nombor pada jambatan. Seret jubin yang hilang ke tempat kosong, kemudian tekan Semak.';
