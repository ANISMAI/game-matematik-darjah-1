import { useEffect, useRef } from 'react';
import { CountObject } from './Art.jsx';
import NinjaCharacter from './NinjaCharacter.jsx';
import { STATUS, StatusIcon } from './TopicMarker.jsx';

export default function MissionPreview({ region, sub, status, onStart, onClose }) {
  const firstBtn = useRef(null);

  useEffect(() => {
    firstBtn.current?.focus();
    const onKey = (e) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  return (
    <div className="overlay" onClick={onClose}>
      <section
        className="scroll-panel"
        role="dialog"
        aria-modal="true"
        aria-labelledby="mission-title"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="scroll-rod" aria-hidden="true" />
        <div className="scroll-body">
          <p className="scroll-kicker">{region.topic}</p>
          <h2 id="mission-title">{sub.title}</h2>

          <div className="preview-art">
            {sub.playable ? (
              <div className="preview-objects">
                <CountObject type="tanglung" />
                <CountObject type="tanglung" />
                <CountObject type="tanglung" />
                <span className="preview-q">?</span>
              </div>
            ) : (
              <div className="preview-soon">
                <NinjaCharacter size={90} mood="happy" />
                <span className="soon-sign">Aktiviti akan datang</span>
              </div>
            )}
          </div>

          <p className="scroll-instruction">{sub.instruction}</p>

          <div className="scroll-meta">
            {sub.questionCount && (
              <span className="chip">
                <span aria-hidden="true">📜</span> {sub.questionCount} soalan
              </span>
            )}
            <span className={`chip ${STATUS[status].className}`}>
              <StatusIcon status={status} size={20} /> {STATUS[status].label}
            </span>
          </div>

          {!sub.playable && (
            <p className="scroll-note">Aktiviti ini akan ditambah dalam fasa seterusnya.</p>
          )}

          <div className="scroll-actions">
            {sub.playable ? (
              <>
                <button ref={firstBtn} className="btn btn-primary btn-lg" onClick={onStart}>
                  <span aria-hidden="true">▶</span> Mula
                </button>
                <button className="btn btn-light btn-lg" onClick={onClose}>
                  Kembali
                </button>
              </>
            ) : (
              <button ref={firstBtn} className="btn btn-primary btn-lg" onClick={onClose}>
                <span aria-hidden="true">←</span> Kembali
              </button>
            )}
          </div>
        </div>
        <div className="scroll-rod" aria-hidden="true" />
      </section>
    </div>
  );
}
