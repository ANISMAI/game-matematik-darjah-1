import { useEffect, useRef, useState } from 'react';
import { COUNT_OBJECTS, generateQuestions } from '../lib/questions.js';
import { playSound } from '../lib/sound.js';
import { CountObject } from './Art.jsx';
import NinjaCharacter from './NinjaCharacter.jsx';

const TOTAL = 5;

export default function CountingGame({ sound, onExit, onFinish }) {
  const [questions] = useState(() => generateQuestions(TOTAL));
  const [idx, setIdx] = useState(0);
  const [marked, setMarked] = useState([]); // indeks objek mengikut tertib dikira
  const [tried, setTried] = useState([]); // jawapan salah yang sudah dicuba
  const [solved, setSolved] = useState(false);
  const [hintRun, setHintRun] = useState(0); // >0 = tunjuk petunjuk kiraan
  const [confirmExit, setConfirmExit] = useState(false);
  const nextBtn = useRef(null);

  const q = questions[idx];
  const label = COUNT_OBJECTS[q.type].label;

  useEffect(() => {
    if (solved) nextBtn.current?.focus();
  }, [solved]);

  const tapObject = (i) => {
    if (solved || marked.includes(i)) return;
    setMarked((m) => [...m, i]);
    playSound('tap', sound);
  };

  const choose = (value) => {
    if (solved || tried.includes(value)) return;
    if (value === q.answer) {
      setSolved(true);
      playSound('correct', sound);
    } else {
      setTried((t) => [...t, value]);
      setHintRun((h) => h + 1);
      setMarked([]);
      playSound('wrong', sound);
    }
  };

  const next = () => {
    if (idx + 1 >= questions.length) {
      onFinish();
      return;
    }
    setIdx(idx + 1);
    setMarked([]);
    setTried([]);
    setSolved(false);
    setHintRun(0);
  };

  const wrong = tried.length > 0 && !solved;

  return (
    <main className="screen game-screen">
      <div className="game-bar">
        <button className="btn btn-light" onClick={() => setConfirmExit(true)}>
          <span aria-hidden="true">✕</span> Keluar
        </button>
        <div className="game-title">
          <h2>Bilang Objek</h2>
          <p aria-live="polite">
            Soalan {idx + 1} daripada {questions.length}
          </p>
        </div>
        <ol className="progress-dots" aria-hidden="true">
          {questions.map((_, i) => (
            <li key={i} className={i < idx || (i === idx && solved) ? 'done' : i === idx ? 'now' : ''}>
              {i < idx || (i === idx && solved) ? '✓' : i + 1}
            </li>
          ))}
        </ol>
      </div>

      <div className="game-body">
        <div className="instruction">
          <NinjaCharacter size={64} mood={solved ? 'happy' : 'idle'} />
          <p>
            Kira {label}. Pilih jawapan yang betul.
          </p>
        </div>

        <div className="objects-card">
          <div className={`objects ${q.answer > 5 ? 'two-rows' : ''}`} key={`${idx}-${hintRun}`}>
            {Array.from({ length: q.answer }, (_, i) => {
              const order = marked.indexOf(i) + 1;
              return (
                <button
                  key={i}
                  className={`obj${order ? ' is-marked' : ''}${hintRun ? ' hint' : ''}`}
                  style={{ '--i': i }}
                  onClick={() => tapObject(i)}
                  aria-label={`${label} ${i + 1}${order ? ', sudah dikira' : ''}`}
                  aria-pressed={Boolean(order)}
                >
                  <CountObject type={q.type} />
                  {order > 0 && <span className="mark-badge">{order}</span>}
                  {hintRun > 0 && !order && (
                    <span className="hint-num" aria-hidden="true">
                      {i + 1}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
          <div className="count-tools">
            <span className="counted">
              Sudah dikira: <strong>{marked.length}</strong>
            </span>
            <button className="btn btn-light" onClick={() => setMarked([])} disabled={!marked.length}>
              <span aria-hidden="true">↺</span> Kira Semula
            </button>
          </div>
        </div>

        <div className="answers" role="group" aria-label="Pilihan jawapan">
          {q.options.map((v) => {
            const isTried = tried.includes(v);
            const isRight = solved && v === q.answer;
            return (
              <button
                key={v}
                className={`answer${isTried ? ' tried' : ''}${isRight ? ' right' : ''}`}
                onClick={() => choose(v)}
                disabled={solved || isTried}
                aria-label={`${v}${isTried ? ', cuba lagi' : ''}${isRight ? ', betul' : ''}`}
              >
                {v}
                {isRight && <span className="answer-tick" aria-hidden="true">✓</span>}
              </button>
            );
          })}
        </div>

        <div className="feedback" aria-live="assertive">
          {solved && (
            <div className="feedback-card good">
              <NinjaCharacter size={80} mood="cheer" className="ninja-jump" />
              <p>Bagus! Betul!</p>
              <button ref={nextBtn} className="btn btn-primary btn-lg" onClick={next}>
                Seterusnya <span aria-hidden="true">→</span>
              </button>
            </div>
          )}
          {wrong && (
            <div className="feedback-card soft">
              <span aria-hidden="true">🤔</span>
              <p>Cuba lagi. Jom kira bersama!</p>
            </div>
          )}
        </div>
      </div>

      {confirmExit && (
        <div className="overlay">
          <section className="dialog" role="dialog" aria-modal="true" aria-labelledby="exit-title">
            <NinjaCharacter size={80} />
            <h2 id="exit-title">Misi belum selesai.</h2>
            <p>Mahu teruskan bermain?</p>
            <div className="scroll-actions">
              <button className="btn btn-primary btn-lg" autoFocus onClick={() => setConfirmExit(false)}>
                Teruskan
              </button>
              <button className="btn btn-light btn-lg" onClick={onExit}>
                Keluar
              </button>
            </div>
          </section>
        </div>
      )}
    </main>
  );
}
