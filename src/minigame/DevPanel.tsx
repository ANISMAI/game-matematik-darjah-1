// Panel DEV terapung dalam akademi (dimuat hanya semasa `npm run dev`).
import { useState } from 'react';
import { DEV_GAMES, devResetProgress, devUnlockAll, setDevHash } from './dev.ts';
import type { DevGame } from './dev.ts';

export default function DevPanel({ onJump }: { onJump: (game: DevGame, level: number) => void }) {
  const [open, setOpen] = useState(false);
  const [msg, setMsg] = useState('');
  const flash = (m: string) => {
    setMsg(m);
    setTimeout(() => setMsg(''), 1800);
  };
  return (
    <div className="dev-panel">
      <button type="button" className="dev-toggle" onClick={() => setOpen((o) => !o)} aria-expanded={open}>
        🧪 DEV
      </button>
      {open && (
        <div className="dev-box">
          {DEV_GAMES.map((g) => (
            <div key={g.key} className="dev-row">
              <b>{g.name}</b>
              <span>
                {Array.from({ length: g.levels }, (_, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => {
                      setOpen(false);
                      onJump(g, i + 1);
                    }}
                  >
                    {i + 1}
                  </button>
                ))}
              </span>
              <small>#mall/{g.key}/1</small>
            </div>
          ))}
          <div className="dev-actions">
            <button type="button" onClick={() => (devUnlockAll(), flash('Semua tahap dibuka'))}>
              🔓 Buka semua tahap
            </button>
            <button type="button" onClick={() => (devResetProgress(), flash('Kemajuan dipadam'))}>
              🗑️ Padam kemajuan
            </button>
            <button
              type="button"
              onClick={() => {
                setDevHash('#mall');
                window.location.reload();
              }}
            >
              ⛩️ Mula dari luar
            </button>
          </div>
          {msg && <p className="dev-msg">{msg}</p>}
        </div>
      )}
    </div>
  );
}
