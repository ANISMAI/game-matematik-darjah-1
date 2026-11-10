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
    owl: (
      <g stroke="#3b2a1a" strokeWidth="2.5">
        <ellipse cx="24" cy="58" rx="18" ry="12" transform="rotate(-18 24 58)" fill="#8a5a35" />
        <ellipse cx="76" cy="58" rx="18" ry="12" transform="rotate(18 76 58)" fill="#8a5a35" />
        <ellipse cx="50" cy="62" rx="20" ry="22" fill="#b98457" />
        <path d="M32 30 L30 16 L42 24 Z M68 30 L70 16 L58 24 Z" fill="#a87046" />
        <ellipse cx="50" cy="38" rx="24" ry="19" fill="#c2915f" />
        <circle cx="41" cy="37" r="8" fill="#fff8e8" />
        <circle cx="59" cy="37" r="8" fill="#fff8e8" />
        <circle cx="41" cy="37" r="3.5" fill="#1e120a" stroke="none" />
        <circle cx="59" cy="37" r="3.5" fill="#1e120a" stroke="none" />
        <path d="M45 46 L55 46 L50 54 Z" fill="#ffc23c" strokeWidth="1.5" />
        <ellipse cx="20" cy="58" rx="3" ry="5" fill="#ff9c33" strokeWidth="1" />
        <ellipse cx="80" cy="58" rx="3" ry="5" fill="#ff9c33" strokeWidth="1" />
      </g>
    ),
    watermelon: (
      <g stroke="#3b2a1a" strokeWidth="2.5">
        <path d="M46 22 A30 30 0 0 0 46 82 Z" fill="#3f9a34" />
        <path d="M46 28 A24 24 0 0 0 46 76 Z" fill="#f2394d" strokeWidth="0" />
        <path d="M54 22 A30 30 0 0 1 54 82 Z" fill="#3f9a34" />
        <path d="M54 28 A24 24 0 0 1 54 76 Z" fill="#f2394d" strokeWidth="0" />
        <g fill="#1e120a" stroke="none">
          <ellipse cx="34" cy="44" rx="3" ry="2" /><ellipse cx="38" cy="60" rx="3" ry="2" /><ellipse cx="30" cy="54" rx="3" ry="2" />
          <ellipse cx="66" cy="52" rx="3" ry="2" />
        </g>
      </g>
    ),
    butterfly: (
      <g stroke="#3b2a1a" strokeWidth="2.5">
        <ellipse cx="34" cy="42" rx="18" ry="15" fill="#9fcdf1" />
        <ellipse cx="66" cy="42" rx="18" ry="15" fill="#9fcdf1" />
        <ellipse cx="38" cy="64" rx="12" ry="10" fill="#9fcdf1" />
        <ellipse cx="62" cy="64" rx="12" ry="10" fill="#9fcdf1" />
        <circle cx="30" cy="40" r="5" fill="#ffb9d6" strokeWidth="1.5" />
        <circle cx="40" cy="46" r="5" fill="#ffb9d6" strokeWidth="1.5" />
        <circle cx="66" cy="42" r="5" fill="#ffb9d6" strokeWidth="1.5" />
        <ellipse cx="50" cy="56" rx="7" ry="20" fill="#ffd84d" />
        <circle cx="50" cy="32" r="9" fill="#ffd84d" />
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
