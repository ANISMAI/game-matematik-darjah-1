import { useEffect, useRef } from 'react';
import { CountObject } from './Art.jsx';
import NinjaCharacter from './NinjaCharacter.jsx';
import { STATUS, StatusIcon } from './TopicMarker.jsx';
import { activitiesFor, questionTotal } from '../data/activities.js';
import { activityStatus } from '../lib/storage.js';
import { T } from '../data/strings.js';
import MechanicIcon from './MechanicIcon.jsx';

function StatusChip({ status }) {
  return (
    <span className={`chip ${STATUS[status].className}`}>
      <StatusIcon status={status} size={20} /> {STATUS[status].label}
    </span>
  );
}

// Pemilih aktiviti ringkas bila subtopik ada lebih daripada satu aktiviti.
function ActivityChooser({ list, progress, onStart, firstBtn }) {
  return (
    <ul className="chooser" aria-label={T.chooserTitle}>
      {list.map((a, i) => {
        const st = activityStatus(progress, a.id);
        const resumable = Boolean(progress.activities[a.id]?.run);
        return (
          <li key={a.id} className="chooser-row">
            <MechanicIcon mechanic={a.mechanic} size={56} />
            <div className="chooser-text">
              <strong>{a.title}</strong>
              <span>
                {a.mechanicLabel} · {T.questions(questionTotal(a))}
              </span>
              <span className={`chooser-status ${STATUS[st].className}`}>
                <StatusIcon status={st} size={16} /> {STATUS[st].label}
              </span>
            </div>
            <button
              ref={i === 0 ? firstBtn : undefined}
              className="btn btn-primary"
              onClick={() => onStart(a.id)}
              aria-label={`${resumable ? T.resume : T.start} ${a.title}`}
            >
              <span aria-hidden="true">▶</span> {resumable ? T.resume : T.start}
            </button>
          </li>
        );
      })}
    </ul>
  );
}

export default function MissionPreview({ region, sub, status, progress, onStart, onClose }) {
  const firstBtn = useRef(null);
  const list = activitiesFor(region.id, sub.id);
  const single = list.length === 1 ? list[0] : null;

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

          {list.length > 1 ? (
            <>
              <p className="scroll-instruction">{T.chooserTitle}</p>
              <ActivityChooser list={list} progress={progress} onStart={onStart} firstBtn={firstBtn} />
              <div className="scroll-meta">
                <StatusChip status={status} />
              </div>
              <div className="scroll-actions">
                <button className="btn btn-light btn-lg" onClick={onClose}>
                  {T.back}
                </button>
              </div>
            </>
          ) : (
            <>
              <div className="preview-art">
                {single?.mechanic === 'counting' ? (
                  <div className="preview-objects">
                    <CountObject type="tanglung" />
                    <CountObject type="tanglung" />
                    <CountObject type="tanglung" />
                    <span className="preview-q">?</span>
                  </div>
                ) : single ? (
                  <MechanicIcon mechanic={single.mechanic} size={120} />
                ) : (
                  <div className="preview-soon">
                    <NinjaCharacter size={90} mood="happy" />
                    <span className="soon-sign">Aktiviti akan datang</span>
                  </div>
                )}
              </div>

              {single && <p className="preview-activity">{single.title}</p>}
              <p className="scroll-instruction">{single?.instruction ?? sub.instruction}</p>

              <div className="scroll-meta">
                {single && (
                  <span className="chip">
                    <span aria-hidden="true">📜</span> {T.questions(questionTotal(single))}
                  </span>
                )}
                <StatusChip status={single ? activityStatus(progress, single.id) : status} />
              </div>

              {!single && <p className="scroll-note">Aktiviti ini akan ditambah dalam fasa seterusnya.</p>}

              <div className="scroll-actions">
                {single ? (
                  <>
                    <button ref={firstBtn} className="btn btn-primary btn-lg" onClick={() => onStart(single.id)}>
                      <span aria-hidden="true">▶</span> {progress.activities[single.id]?.run ? T.resume : T.start}
                    </button>
                    <button className="btn btn-light btn-lg" onClick={onClose}>
                      {T.back}
                    </button>
                  </>
                ) : (
                  <button ref={firstBtn} className="btn btn-primary btn-lg" onClick={onClose}>
                    <span aria-hidden="true">←</span> {T.back}
                  </button>
                )}
              </div>
            </>
          )}
        </div>
        <div className="scroll-rod" aria-hidden="true" />
      </section>
    </div>
  );
}
