import { useCallback, useEffect, useRef, useState } from 'react';
import { MECHANICS } from '../games/index.js';
import { playSound } from '../lib/sound.js';
import { T } from '../data/strings.js';
import NinjaCharacter from './NinjaCharacter.jsx';
import TutorialOverlay from './TutorialOverlay.jsx';

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

  return (
    <main className="screen game-screen act-screen">
      <div className="game-bar">
        <button className="btn btn-light" onClick={() => setConfirmExit(true)}>
          <span aria-hidden="true">✕</span> {T.exit}
        </button>
        <div className="game-title">
          <h2>{activity.title}</h2>
          <p aria-live="polite">{T.question(run.qIndex + 1, total)}</p>
        </div>
        <ol className="progress-dots" aria-hidden="true">
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

      <div className="act-strip">
        <div className="instruction">
          <NinjaCharacter size={48} mood={solved ? 'happy' : 'idle'} />
          <p>{q.instruction ?? activity.instruction}</p>
        </div>
        <div className="act-tools">
          <button className="btn btn-light" onClick={() => setDemo(true)}>
            <span aria-hidden="true">?</span> {T.howTo}
          </button>
          <button
            className={`btn btn-light btn-hint${run.hint ? ' is-on' : ''}${nudge ? ' is-nudge' : ''}`}
            aria-pressed={run.hint}
            onClick={() => setRun((r) => ({ ...r, hint: !r.hint }))}
            disabled={solved}
          >
            <span aria-hidden="true">💡</span> {T.hint}
            {nudge && <span className="hint-dot" aria-hidden="true" />}
          </button>
        </div>
      </div>
      {run.hint && !solved && (
        <p className="act-hint-text" role="note">
          <span aria-hidden="true">💡</span> {q.hint}
        </p>
      )}

      <div className="act-stage" key={run.qIndex}>
        <Game q={q} board={run.board} setBoard={setBoard} fail={fail} succeed={succeed} solved={solved} hint={run.hint && !solved} tap={tap} />
      </div>

      <div className="act-controls">
        <div className="act-feedback" aria-live="assertive">
          {solved && (
            <div className="feedback-card good">
              <NinjaCharacter size={60} mood="cheer" className="ninja-jump" />
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
        {solved ? (
          <button ref={nextBtn} className="btn btn-primary btn-lg" onClick={next}>
            {T.next} <span aria-hidden="true">→</span>
          </button>
        ) : (
          mod.usesCheck && (
            <button className="btn btn-primary btn-lg" onClick={check} disabled={!ready} aria-describedby={ready ? undefined : 'check-why'}>
              <span aria-hidden="true">✓</span> {T.check}
            </button>
          )
        )}
        {!ready && !solved && mod.usesCheck && (
          <span id="check-why" className="sr-only">
            {T.incomplete}
          </span>
        )}
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
