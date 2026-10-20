import { useEffect, useRef } from 'react';
import { getActivity, SHORTCUT_ORDER } from '../data/activities.js';
import { getRegion, getSubtopic } from '../data/topics.js';
import { activityStatus } from '../lib/storage.js';
import { T } from '../data/strings.js';
import { STATUS, StatusIcon } from './TopicMarker.jsx';
import MechanicIcon from './MechanicIcon.jsx';

// Pintasan penyemak: senarai enam mekanik. Membuka misi yang sama seperti navigasi pulau.
export default function ShortcutPanel({ progress, onStart, onClose }) {
  const closeBtn = useRef(null);

  useEffect(() => {
    closeBtn.current?.focus();
    const onKey = (e) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  return (
    <div className="overlay" onClick={onClose}>
      <section className="dialog shortcut-panel" role="dialog" aria-modal="true" aria-labelledby="shortcut-title" onClick={(e) => e.stopPropagation()}>
        <div className="shortcut-head">
          <h2 id="shortcut-title">{T.shortcut}</h2>
          <button ref={closeBtn} className="btn btn-light btn-round" onClick={onClose} aria-label={T.close}>
            <span aria-hidden="true">✕</span>
          </button>
        </div>
        <p className="shortcut-intro">{T.shortcutIntro}</p>
        <ul className="chooser shortcut-list">
          {SHORTCUT_ORDER.map((id) => {
            const a = getActivity(id);
            const st = activityStatus(progress, id);
            const resume = Boolean(progress.activities[id]?.run);
            return (
              <li key={id} className="chooser-row">
                <MechanicIcon mechanic={a.mechanic} size={52} />
                <div className="chooser-text">
                  <strong>{a.title}</strong>
                  <span>
                    {a.mechanicLabel} · {getRegion(a.regionId).topic.replace(' hingga 100', '')} › {getSubtopic(a.regionId, a.subId).title}
                  </span>
                  <span className={`chooser-status ${STATUS[st].className}`}>
                    <StatusIcon status={st} size={16} /> {STATUS[st].label}
                  </span>
                </div>
                <button className="btn btn-primary" onClick={() => onStart(id)} aria-label={`${resume ? T.resume : T.start} ${a.title}`}>
                  <span aria-hidden="true">▶</span> {resume ? T.resume : T.start}
                </button>
              </li>
            );
          })}
        </ul>
      </section>
    </div>
  );
}
