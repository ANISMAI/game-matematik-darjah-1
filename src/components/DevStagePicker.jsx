import { useState } from 'react';
import { activitiesFor } from '../data/activities.js';
import { missionStatus } from '../lib/storage.js';

// Panel pembangun (hanya dalam `npm run dev`): lompat terus ke mana-mana tahap / aktiviti
// tanpa perlu ninja berjalan atau menyelesaikan tahap sebelumnya.
export default function DevStagePicker({ region, progress, onOpenSub, onStart, onCompleteSub, onReset }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="dev-picker">
      <button className="dev-picker-toggle" onClick={() => setOpen(!open)} aria-expanded={open}>
        🛠 DEV
      </button>
      {open && (
        <div className="dev-picker-panel" role="dialog" aria-label="Pilih tahap (dev)">
          <div className="dev-picker-head">
            <strong>Pilih tahap</strong>
            <button onClick={onReset} title="Kosongkan semua kemajuan">
              Reset
            </button>
          </div>
          <ol>
            {region.subtopics.map((sub, i) => {
              const list = activitiesFor(region.id, sub.id);
              const st = missionStatus(progress, region.id, sub.id);
              return (
                <li key={sub.id}>
                  <div className="dev-picker-sub">
                    <button
                      className="dev-picker-title"
                      onClick={() => {
                        onOpenSub(sub.id);
                        setOpen(false);
                      }}
                    >
                      {i + 1}. {sub.title}
                    </button>
                    <span className={`dev-st dev-st-${st}`}>{st}</span>
                    {list.length > 0 && st !== 'selesai' && (
                      <button onClick={() => onCompleteSub(list)} title="Tandakan semua aktiviti selesai">
                        ✓
                      </button>
                    )}
                  </div>
                  {list.length > 0 ? (
                    <div className="dev-picker-acts">
                      {list.map((a) => (
                        <button key={a.id} onClick={() => onStart(a.id)} title={a.id}>
                          ▶ {a.title}
                        </button>
                      ))}
                    </div>
                  ) : (
                    <em className="dev-picker-none">tiada aktiviti</em>
                  )}
                </li>
              );
            })}
          </ol>
        </div>
      )}
    </div>
  );
}
