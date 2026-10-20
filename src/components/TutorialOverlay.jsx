import { useEffect, useRef } from 'react';
import { T } from '../data/strings.js';

// Demo satu tindakan dengan data contoh berasingan. Tidak menyentuh jawapan semasa.
export default function TutorialOverlay({ activity, mechanic, onClose }) {
  const startBtn = useRef(null);
  const Demo = mechanic.Demo;

  useEffect(() => {
    startBtn.current?.focus();
    const onKey = (e) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  return (
    <div className="overlay">
      <section className="dialog demo-dialog" role="dialog" aria-modal="true" aria-labelledby="demo-title" aria-describedby="demo-text">
        <h2 id="demo-title">{T.demoTitle}</h2>
        <p className="demo-kicker">{activity.title}</p>
        <div className="demo-box">
          <span className="chip demo-chip">{T.demoExample}</span>
          <Demo />
        </div>
        <p id="demo-text" className="demo-text">
          {mechanic.demoText}
        </p>
        <div className="scroll-actions">
          <button className="btn btn-light btn-lg" onClick={onClose}>
            {T.skip}
          </button>
          <button ref={startBtn} className="btn btn-primary btn-lg" onClick={onClose}>
            <span aria-hidden="true">▶</span> {T.start}
          </button>
        </div>
      </section>
    </div>
  );
}
