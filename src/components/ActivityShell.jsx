import { useCallback, useEffect, useRef, useState } from 'react';
import { MECHANICS } from '../games/index.js';
import { playSound } from '../lib/sound.js';
import { T } from '../data/strings.js';
import NinjaCharacter from './NinjaCharacter.jsx';
import TutorialOverlay from './TutorialOverlay.jsx';
import GameBackground from '../games/GameBackground.jsx';

// Keadaan pusingan: 'answering' → 'correct' → (Seterusnya) soalan berikut / keputusan.
function freshRun(activity, mod) {
  const plan = mod.plan?.(activity.questions) ?? null;
  const q = activity.questions[0];
  return { qIndex: 0, qId: q.id, phase: 'answering', board: mod.init(q, plan?.[0]), fails: 0, hint: false, demoSeen: false, plan };
}

// Sambung papan yang sama selepas muat semula; data rosak atau lapuk → percubaan baharu.
function restoreRun(activity, mod, saved) {
  try {
    const q = activity.questions[saved?.qIndex];
    if (q && saved.qId === q.id && ['answering', 'correct'].includes(saved.phase) && mod.restore(saved.board, q)) {
      return { plan: null, ...saved, fails: Number(saved.fails) || 0, hint: Boolean(saved.hint) };
    }
  } catch {
    // jatuh ke percubaan baharu
  }
  return freshRun(activity, mod);
}

// Ranting berdaun yang menjuntai di hujung palang kayu atas (hiasan sahaja).
const LEAF = 'M0 0 C10 -13 34 -15 46 0 C34 15 10 13 0 0 Z';
const LEAF_SPOTS = [
  // [x, y, sudut, skala, warna]
  [18, 22, -150, 1.05, '#4f9d2f'],
  [40, 12, -110, 0.95, '#6cb841'],
  [62, 20, -60, 1.1, '#4f9d2f'],
  [86, 14, -20, 0.9, '#7cc552'],
  [104, 26, 20, 1, '#5aa836'],
  [30, 34, 160, 0.9, '#7cc552'],
  [56, 38, 110, 1.05, '#5aa836'],
  [80, 36, 70, 0.95, '#4f9d2f'],
  [122, 30, 40, 0.85, '#6cb841'],
  [70, 50, 95, 0.8, '#6cb841'],
];

function Leaves({ side }) {
  return (
    <svg className={`act-leaves ${side}`} viewBox="0 0 160 80" aria-hidden="true">
      <path d="M-6 26 C30 18 70 30 100 22 C120 18 136 24 150 30" fill="none" stroke="#6b3d17" strokeWidth="6" strokeLinecap="round" />
      <path d="M48 24 C54 34 60 40 66 46 M96 22 C104 14 110 10 118 8" fill="none" stroke="#6b3d17" strokeWidth="4" strokeLinecap="round" />
      {LEAF_SPOTS.map(([x, y, a, s, c], i) => (
        <g key={i} transform={`translate(${x} ${y}) rotate(${a}) scale(${s})`}>
          <path d={LEAF} fill={c} stroke="#2f6b1f" strokeWidth="2.5" strokeLinejoin="round" />
          <path d="M3 0 H40" stroke="#2f6b1f" strokeWidth="1.8" strokeLinecap="round" opacity=".7" />
        </g>
      ))}
    </svg>
  );
}

export default function ActivityShell({ activity, savedRun, sound, onSave, onExit, onFinish }) {
  const mod = MECHANICS[activity.mechanic];
  const total = activity.questions.length;
  const [run, setRun] = useState(() => restoreRun(activity, mod, savedRun));
  const [feedback, setFeedback] = useState(null); // 'bad' | null
  const [demo, setDemo] = useState(() => !run.demoSeen);
  const [confirmExit, setConfirmExit] = useState(false);
  const advanced = useRef(-1); // halang Seterusnya berganda pada soalan yang sama
  const nextBtn = useRef(null);

  const q = activity.questions[run.qIndex];
  const solved = run.phase === 'correct';
  const Game = mod.Component;

  // simpan selepas setiap perubahan bermakna (papan, soalan, petunjuk, cubaan)
  useEffect(() => {
    onSave(run);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [run]);

  useEffect(() => {
    if (solved) nextBtn.current?.focus();
  }, [solved, run.qIndex]);

  const setBoard = (board) => {
    setRun((r) => (r.phase === 'correct' ? r : { ...r, board }));
    setFeedback(null);
  };
  const fail = (board) => {
    setRun((r) => (r.phase === 'correct' ? r : { ...r, board: board ?? r.board, fails: r.fails + 1 }));
    setFeedback('bad');
    playSound('wrong', sound);
  };
  const succeed = (board) => {
    setRun((r) => (r.phase === 'correct' ? r : { ...r, board: board ?? r.board, phase: 'correct' }));
    setFeedback(null);
    playSound('correct', sound);
  };
  const tap = (kind = 'tap') => playSound(kind, sound);

  const ready = mod.usesCheck && !solved && mod.canCheck(run.board, q);
  const check = () => {
    if (!ready) return; // jawapan tidak lengkap tidak boleh disemak
    const r = mod.check(run.board, q);
    if (r.ok) succeed(r.board);
    else fail(r.board);
  };

  const next = () => {
    if (!solved || advanced.current === run.qIndex) return;
    advanced.current = run.qIndex;
    if (run.qIndex + 1 >= total) {
      onFinish();
      return;
    }
    const i = run.qIndex + 1;
    const nq = activity.questions[i];
    setRun((r) => ({ ...r, qIndex: i, qId: nq.id, phase: 'answering', board: mod.init(nq, r.plan?.[i]), fails: 0, hint: false }));
    setFeedback(null);
  };

  const closeDemo = useCallback(() => {
    setDemo(false);
    setRun((r) => (r.demoSeen ? r : { ...r, demoSeen: true }));
  }, []);

  const nudge = run.fails >= 2 && !run.hint && !solved;

  // Arahan dipecah ikut ayat supaya dipaparkan sebagai senarai dalam skrol.
  const steps = (q.instruction ?? activity.instruction).split(/(?<=[.!?])\s+/).filter(Boolean);

  return (
    <main className="screen game-screen act-screen">
      <GameBackground />

      {/* Palang kayu atas: keluar, tajuk, kemajuan */}
      <header className="act-topbar">
        <Leaves side="left" />
        <Leaves side="right" />
        <button className="act-wood-btn" onClick={() => setConfirmExit(true)}>
          <span aria-hidden="true">←</span> {T.exit}
        </button>
        <span className="act-spark" aria-hidden="true">✦</span>
        {/* papan tajuk = soalan pusingan semasa (q.prompt, atau prompt() mekanik); sandaran: nama aktiviti */}
        <h2 className={`act-plaque${solved ? ' is-solved' : ''}`} aria-live="polite">
          {q.prompt ?? mod.prompt?.(q, solved) ?? activity.title}
        </h2>
        <div className="act-progress">
          <ol className="act-dots" aria-hidden="true">
            {activity.questions.map((_, i) => {
              const done = i < run.qIndex || (i === run.qIndex && solved);
              return (
                <li key={i} className={done ? 'done' : i === run.qIndex ? 'now' : ''}>
                  {done ? '✓' : i + 1}
                </li>
              );
            })}
          </ol>
        </div>
      </header>

      <div className="act-body">
        {/* Skrol arahan di kiri */}
        <aside className="act-scroll">
          <div className="act-scroll-rod" aria-hidden="true">
            <span className="act-scroll-banner">✦</span>
          </div>
          <div className="act-scroll-paper">
            <div className={`act-portrait${solved ? ' is-happy' : ''}`}>
              <img src="/map/ninja-potret.webp" alt="" />
            </div>
            <p className="act-scroll-title">{activity.title}</p>
            <p className="act-scroll-count" aria-live="polite">
              {T.question(run.qIndex + 1, total)}
            </p>
            <ul className="act-steps">
              {steps.map((s, i) => (
                <li key={i}>{s}</li>
              ))}
            </ul>
            {run.hint && !solved && (
              <p className="act-hint-note" role="note">
                <span aria-hidden="true">💡</span> {q.hint}
              </p>
            )}

            <div className="act-feedback" aria-live="assertive">
              {solved && (
                <div className="feedback-card good">
                  <NinjaCharacter size={44} mood="cheer" className="ninja-jump" />
                  <p>{T.correct}</p>
                </div>
              )}
              {feedback === 'bad' && !solved && (
                <div className="feedback-card soft">
                  <span aria-hidden="true">🤔</span>
                  <p>{T.wrong}</p>
                </div>
              )}
            </div>

            <div className="act-tools">
              {solved ? (
                <button ref={nextBtn} className="act-pill is-primary" onClick={next}>
                  {T.next} <span aria-hidden="true">→</span>
                </button>
              ) : (
                <>
                  {mod.usesCheck && (
                    <button className="act-pill is-primary" onClick={check} disabled={!ready} aria-describedby={ready ? undefined : 'check-why'}>
                      <span aria-hidden="true">✓</span> {T.check}
                    </button>
                  )}
                  <button className="act-pill" onClick={() => setDemo(true)}>
                    <span aria-hidden="true">▶</span> {T.howTo}
                  </button>
                  <button
                    className={`act-pill btn-hint${run.hint ? ' is-on' : ''}${nudge ? ' is-nudge' : ''}`}
                    aria-pressed={run.hint}
                    onClick={() => setRun((r) => ({ ...r, hint: !r.hint }))}
                  >
                    <span aria-hidden="true">💡</span> {T.hint}
                    {nudge && <span className="hint-dot" aria-hidden="true" />}
                  </button>
                </>
              )}
              {!ready && !solved && mod.usesCheck && (
                <span id="check-why" className="sr-only">
                  {T.incomplete}
                </span>
              )}
            </div>
          </div>
        </aside>

        <section className="act-stage" key={run.qIndex}>
          <Game q={q} board={run.board} setBoard={setBoard} fail={fail} succeed={succeed} solved={solved} hint={run.hint && !solved} tap={tap} />
        </section>
      </div>

      {demo && <TutorialOverlay activity={activity} mechanic={mod} onClose={closeDemo} />}

      {confirmExit && (
        <div className="overlay">
          <section className="dialog" role="dialog" aria-modal="true" aria-labelledby="exit-title">
            <NinjaCharacter size={80} />
            <h2 id="exit-title">{T.exitTitle}</h2>
            <p>{T.exitText}</p>
            <div className="scroll-actions">
              <button className="btn btn-primary btn-lg" autoFocus onClick={() => setConfirmExit(false)}>
                {T.continue}
              </button>
              <button className="btn btn-light btn-lg" onClick={onExit}>
                {T.exit}
              </button>
            </div>
          </section>
        </div>
      )}
    </main>
  );
}
