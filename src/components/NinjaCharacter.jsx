// Ninja chibi mesra. mood: 'idle' | 'happy' | 'cheer'
export default function NinjaCharacter({ size = 120, mood = 'idle', color = '#2f3e75', band = '#ef476f', className = '', title }) {
  const happy = mood !== 'idle';
  const cheer = mood === 'cheer';
  return (
    <svg
      className={`ninja ninja-${mood} ${className}`}
      width={size}
      height={size * (140 / 120)}
      viewBox="0 0 120 140"
      role={title ? 'img' : undefined}
      aria-label={title}
      aria-hidden={title ? undefined : true}
    >
      <ellipse cx="60" cy="133" rx="30" ry="6" fill="rgba(0,0,0,.18)" />
      <g className="ninja-body">
        <ellipse cx="47" cy="126" rx="11" ry="7" fill="#1d2647" />
        <ellipse cx="73" cy="126" rx="11" ry="7" fill="#1d2647" />
        <rect x="36" y="80" width="48" height="46" rx="18" fill={color} />
        <rect x="36" y="99" width="48" height="8" fill={band} />
        <circle cx="70" cy="103" r="5" fill={band} />
        {cheer ? (
          <>
            <circle cx="27" cy="70" r="9" fill={color} />
            <circle cx="93" cy="70" r="9" fill={color} />
          </>
        ) : (
          <>
            <circle cx="32" cy="96" r="9" fill={color} />
            <circle cx="88" cy="96" r="9" fill={color} />
          </>
        )}
        <circle cx="60" cy="52" r="37" fill={color} />
        <rect x="29" y="39" width="62" height="28" rx="14" fill="#ffe0bd" />
        {happy ? (
          <>
            <path d="M42 55 q6 -7 12 0" stroke="#1d2647" strokeWidth="4" fill="none" strokeLinecap="round" />
            <path d="M66 55 q6 -7 12 0" stroke="#1d2647" strokeWidth="4" fill="none" strokeLinecap="round" />
          </>
        ) : (
          <>
            <circle cx="48" cy="54" r="5" fill="#1d2647" />
            <circle cx="72" cy="54" r="5" fill="#1d2647" />
            <circle cx="49.5" cy="52.5" r="1.6" fill="#fff" />
            <circle cx="73.5" cy="52.5" r="1.6" fill="#fff" />
          </>
        )}
        <circle cx="39" cy="61" r="4" fill="#ffb3b3" />
        <circle cx="81" cy="61" r="4" fill="#ffb3b3" />
        <rect x="23" y="25" width="74" height="10" rx="5" fill={band} />
        <rect x="52" y="24" width="16" height="12" rx="3" fill="#dfe6f0" stroke="#9aa6b8" strokeWidth="1.5" />
        <path className="ninja-tail" d="M95 28 q14 -2 20 -10 M95 32 q16 4 22 0" stroke={band} strokeWidth="6" fill="none" strokeLinecap="round" />
      </g>
    </svg>
  );
}

// Penanda ninja kecil untuk diletakkan di dalam SVG lain.
export function NinjaMarker({ x = 0, y = 0, scale = 0.55 }) {
  return (
    <g className="ninja-marker" style={{ transform: `translate(${x}px, ${y}px)` }} aria-hidden="true">
      <g transform={`scale(${scale}) translate(-60 -140)`}>
        <g className="ninja-bob">
          <circle cx="60" cy="52" r="37" fill="#2f3e75" />
          <rect x="36" y="80" width="48" height="46" rx="18" fill="#2f3e75" />
          <rect x="36" y="99" width="48" height="8" fill="#ef476f" />
          <rect x="29" y="39" width="62" height="28" rx="14" fill="#ffe0bd" />
          <circle cx="48" cy="54" r="5" fill="#1d2647" />
          <circle cx="72" cy="54" r="5" fill="#1d2647" />
          <rect x="23" y="25" width="74" height="10" rx="5" fill="#ef476f" />
          <path className="ninja-tail" d="M95 28 q14 -2 20 -10 M95 32 q16 4 22 0" stroke="#ef476f" strokeWidth="6" fill="none" strokeLinecap="round" />
        </g>
      </g>
    </g>
  );
}
