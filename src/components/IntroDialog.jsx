import { useEffect, useRef, useState } from 'react';
import NinjaCharacter from './NinjaCharacter.jsx';
import PORTRAIT_DATA from '../data/portrait.json';

const PORTRAIT = '/map/ninja-potret.webp';
const TYPE_MS = 28; // kelajuan teks muncul (ms setiap huruf)

// Lambaian membengkokkan satu imej secara berterusan, jadi pergelangan tidak terpisah.
const PS = PORTRAIT_DATA.size;
const EYES = [
  { cx: 571, cy: 514, rx: 98, ry: 80 },
  { cx: 895, cy: 540, rx: 94, ry: 76 },
];

function AnimatedPortrait({ onError }) {
  const [reducedMotion, setReducedMotion] = useState(
    () => window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false,
  );

  useEffect(() => {
    const media = window.matchMedia?.('(prefers-reduced-motion: reduce)');
    if (!media) return;
    const change = () => setReducedMotion(media.matches);
    media.addEventListener('change', change);
    return () => media.removeEventListener('change', change);
  }, []);

  return (
    <svg className="intro-portrait-svg" viewBox={`0 0 ${PS} ${PS}`} aria-hidden="true">
      <defs>
        <filter id="pt-wave" filterUnits="userSpaceOnUse" x="0" y="0" width={PS} height={PS} colorInterpolationFilters="sRGB">
          <feImage href="/map/ninja-potret-lambai.png" x="0" y="0" width={PS} height={PS} result="wave-map" />
          <feDisplacementMap in="SourceGraphic" in2="wave-map" scale="0" xChannelSelector="R" yChannelSelector="G">
            {!reducedMotion && (
              <animate
                attributeName="scale"
                values={`0;${PORTRAIT_DATA.waveScale};${-PORTRAIT_DATA.waveScale * 0.46};${PORTRAIT_DATA.waveScale};${-PORTRAIT_DATA.waveScale * 0.46};0;0`}
                keyTimes="0;0.12;0.24;0.36;0.48;0.60;1"
                calcMode="spline"
                keySplines="0.42 0 0.58 1;0.42 0 0.58 1;0.42 0 0.58 1;0.42 0 0.58 1;0.42 0 0.58 1;0 0 1 1"
                dur="2.6s"
                repeatCount="indefinite"
              />
            )}
          </feDisplacementMap>
        </filter>
        {EYES.map((e, k) => (
          <clipPath key={k} id={`pt-eye-${k}`}>
            <ellipse cx={e.cx} cy={e.cy} rx={e.rx} ry={e.ry} />
          </clipPath>
        ))}
        <linearGradient id="pt-skin" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#fcd4a9" />
          <stop offset="1" stopColor="#f9c193" />
        </linearGradient>
      </defs>
      <g className="pt-body">
        <image href={PORTRAIT} width={PS} height={PS} filter="url(#pt-wave)" onError={onError} />
        {EYES.map((e, k) => (
          <g key={k} clipPath={`url(#pt-eye-${k})`}>
            <g className="pt-lid" style={{ transformOrigin: `${e.cx}px ${e.cy - e.ry}px` }}>
              <rect x={e.cx - e.rx} y={e.cy - e.ry} width={e.rx * 2} height={e.ry * 2} fill="url(#pt-skin)" />
              {/* garis bulu mata bila tertutup */}
              <path
                d={`M${e.cx - e.rx * 0.85} ${e.cy + e.ry * 0.15} Q${e.cx} ${e.cy + e.ry * 0.55} ${e.cx + e.rx * 0.85} ${e.cy + e.ry * 0.15}`}
                stroke="#2a1a12"
                strokeWidth="13"
                fill="none"
                strokeLinecap="round"
              />
            </g>
          </g>
        ))}
      </g>
    </svg>
  );
}

// Dialog cerita: latar digelapkan dan dikaburkan, ninja besar di tepi, teks muncul huruf demi huruf.
// Tekan sekali untuk tunjuk semua teks, tekan lagi untuk dialog seterusnya.
export default function IntroDialog({ lines, name = 'Ninja Kira', onDone }) {
  const [i, setI] = useState(0);
  const [shown, setShown] = useState(0);
  const [portraitOk, setPortraitOk] = useState(true);
  const [leaving, setLeaving] = useState(false);
  const nextRef = useRef(null);
  const text = lines[i];
  const typing = shown < text.length;
  const last = i === lines.length - 1;

  useEffect(() => {
    nextRef.current?.focus();
  }, []);

  useEffect(() => {
    if (window.matchMedia?.('(prefers-reduced-motion: reduce)').matches) {
      setShown(text.length);
      return;
    }
    setShown(0);
    const id = setInterval(() => {
      setShown((n) => {
        if (n >= text.length) {
          clearInterval(id);
          return n;
        }
        return n + 1;
      });
    }, TYPE_MS);
    return () => clearInterval(id);
  }, [text]);

  const finish = () => {
    if (leaving) return;
    setLeaving(true);
    setTimeout(onDone, 280);
  };

  const advance = () => {
    if (typing) setShown(text.length);
    else if (last) finish();
    else setI(i + 1);
  };

  return (
    <div className={`intro-overlay${leaving ? ' is-leaving' : ''}`} role="dialog" aria-modal="true" aria-label={`${name} bercakap`}>
      <button className="intro-skip glass-pill" onClick={finish}>
        Langkau
      </button>

      <div className="intro-stage" onClick={advance}>
        <div className="intro-portrait" aria-hidden="true">
          {portraitOk ? (
            <AnimatedPortrait onError={() => setPortraitOk(false)} />
          ) : (
            <NinjaCharacter size={260} mood="happy" />
          )}
        </div>

        <div className="intro-box">
          <span className="intro-name">{name}</span>
          {/* pembaca skrin terus mendapat ayat penuh; teks bertaip hanya visual */}
          <p className="intro-text" aria-live="polite">
            <span className="sr-only">{text}</span>
            <span aria-hidden="true">{text.slice(0, shown)}</span>
          </p>
          <div className="intro-foot">
            <span className="intro-dots" aria-hidden="true">
              {lines.map((_, k) => (
                <span key={k} className={k === i ? 'on' : ''} />
              ))}
            </span>
            <button
              ref={nextRef}
              className="cta-pill intro-next"
              onClick={(e) => {
                e.stopPropagation();
                advance();
              }}
            >
              {last && !typing ? 'Jom!' : 'Seterusnya'}
              <svg width="14" height="14" viewBox="0 0 24 24" aria-hidden="true">
                <path d="M7 4.5v15l12-7.5z" fill="currentColor" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
