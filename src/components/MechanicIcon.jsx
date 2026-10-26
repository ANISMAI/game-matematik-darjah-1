import { Apple, ArtDefs, Basket, Door, Lantern, Plank, PuzzlePiece, ScrollCard, Stone } from '../games/GameArt.jsx';

// Ikon kecil setiap mekanik (untuk pemilih aktiviti dan senarai pratonton)
export default function MechanicIcon({ mechanic, size = 64 }) {
  const art = {
    counting: (
      <g>
        <Apple x={36} y={58} s={0.9} />
        <Apple x={64} y={58} s={0.9} />
        <text className="g-num" x="50" y="32" textAnchor="middle" fontSize="26">
          ?
        </text>
      </g>
    ),
    matching: (
      <g>
        <g transform="translate(30 50) scale(.32)">
          <ScrollCard w={120} h={90} label={2} fontSize={60} />
        </g>
        <path d="M50 50 h12" stroke="#3b2a1a" strokeWidth="3" strokeDasharray="3 3" />
        <Lantern x={72} y={42} s={0.42} />
        <Lantern x={84} y={60} s={0.42} />
      </g>
    ),
    pick: (
      <g transform="translate(50 56) scale(.3)">
        <Door w={170} h={240} label={3} />
      </g>
    ),
    puzzle: (
      <g>
        <g transform="translate(30 50) scale(.22)">
          <PuzzlePiece kind="start" label="5" />
        </g>
        <g transform="translate(70 50) scale(.22)">
          <PuzzlePiece kind="result" label="=3" />
        </g>
      </g>
    ),
    sorting: (
      <g transform="translate(50 56) scale(.3)">
        <Basket w={230} h={150} />
      </g>
    ),
    ordering: (
      <g>
        {[1, 2, 3].map((v, i) => (
          <g key={v} transform={`translate(${24 + i * 26} ${66 - i * 12}) scale(.24)`}>
            <Stone label={v} />
          </g>
        ))}
      </g>
    ),
    fill: (
      <g>
        <g transform="translate(26 50) scale(.26)">
          <Plank label={1} />
        </g>
        <rect x="42" y="38" width="20" height="26" rx="4" fill="none" stroke="#3b2a1a" strokeWidth="2.5" strokeDasharray="4 3" />
        <g transform="translate(76 50) scale(.26)">
          <Plank label={3} />
        </g>
      </g>
    ),
  }[mechanic];
  return (
    <svg className="mech-icon" width={size} height={size} viewBox="0 0 100 100" aria-hidden="true">
      <ArtDefs />
      <circle cx="50" cy="50" r="48" fill="#fff6dc" stroke="#3b2a1a" strokeWidth="3" />
      {art}
    </svg>
  );
}
