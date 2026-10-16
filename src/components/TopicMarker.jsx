export const STATUS = {
  belum: { label: 'Belum mula', className: 'st-belum' },
  sedang: { label: 'Sedang belajar', className: 'st-sedang' },
  selesai: { label: 'Selesai', className: 'st-selesai' },
};

export function StatusIcon({ status, size = 22 }) {
  const r = size / 2 - 2;
  return (
    <svg width={size} height={size} viewBox={`${-size / 2} ${-size / 2} ${size} ${size}`} aria-hidden="true" className="status-icon">
      {status === 'selesai' && (
        <>
          <circle r={r} fill="#2a9d8f" />
          <path d={`M${-r * 0.45} 0 l${r * 0.3} ${r * 0.35} l${r * 0.6} ${-r * 0.7}`} stroke="#fff" strokeWidth="2.6" fill="none" strokeLinecap="round" strokeLinejoin="round" />
        </>
      )}
      {status === 'sedang' && (
        <>
          <circle r={r} fill="#fff" stroke="#e76f51" strokeWidth="2.5" />
          <path d={`M0 ${-r} A${r} ${r} 0 0 1 0 ${r}Z`} fill="#e76f51" />
        </>
      )}
      {status === 'belum' && <circle r={r - 1} fill="#fff" stroke="#8c94a6" strokeWidth="2.5" />}
    </svg>
  );
}

function activate(e, fn) {
  if (e.key === 'Enter' || e.key === ' ') {
    e.preventDefault();
    fn();
  }
}

// Lokasi subtopik di dalam peta kawasan.
export default function TopicMarker({ x, y, number, sub, status, color, edge, selected, onSelect }) {
  const st = STATUS[status];
  const w = Math.max(sub.title.length * 13 + 40, 168);
  return (
    <g
      className={`topic-marker${selected ? ' is-selected' : ''}`}
      transform={`translate(${x} ${y})`}
      role="button"
      tabIndex={0}
      aria-label={`${sub.title}, ${st.label}${sub.playable ? '' : ', aktiviti akan datang'}`}
      onClick={onSelect}
      onKeyDown={(e) => activate(e, onSelect)}
    >
      <g className="marker-lift">
        <ellipse cx="0" cy="14" rx="86" ry="30" fill="#8a5a33" />
        <ellipse className="marker-pad" cx="0" cy="4" rx="86" ry="30" fill={color} stroke={edge} strokeWidth="5" />
        <circle cx="0" cy="-34" r="46" fill="#fffdf6" stroke="#3b2a1a" strokeWidth="4" />
        <circle cx="0" cy="-34" r="38" fill={sub.playable ? '#ffd166' : '#e9edf3'} />
        {number ? (
          <text x="0" y="-19" textAnchor="middle" className="marker-num">
            {number}
          </text>
        ) : (
          <g transform="translate(0 -34)">
            <rect x="-18" y="-20" width="36" height="40" fill="#fdf0d5" stroke="#3b2a1a" strokeWidth="3" />
            <rect x="-22" y="-25" width="44" height="9" rx="4.5" fill="#c68b4e" stroke="#3b2a1a" strokeWidth="2.5" />
            <rect x="-22" y="16" width="44" height="9" rx="4.5" fill="#c68b4e" stroke="#3b2a1a" strokeWidth="2.5" />
            <path d="M-10 -6 h20 M-10 3 h14" stroke="#3b2a1a" strokeWidth="3" strokeLinecap="round" />
          </g>
        )}
        {!sub.playable && (
          <g transform="translate(40 -76)">
            <rect x="-44" y="-14" width="88" height="26" rx="13" fill="#5c677d" stroke="#fff" strokeWidth="2" />
            <text x="0" y="5" textAnchor="middle" className="marker-soon">
              Pratonton
            </text>
          </g>
        )}
        <g transform="translate(0 44)">
          <rect x={-w / 2} y="0" width={w} height="66" rx="18" fill="#fffdf6" stroke="#3b2a1a" strokeWidth="3" />
          <text x="0" y="28" textAnchor="middle" className="marker-title">
            {sub.title}
          </text>
          <g className={st.className}>
            <foreignObject x={-w / 2 + 8} y="34" width={w - 16} height="28">
              <div className="marker-status">
                <StatusIcon status={status} size={20} />
                <span>{st.label}</span>
              </div>
            </foreignObject>
          </g>
        </g>
      </g>
    </g>
  );
}
