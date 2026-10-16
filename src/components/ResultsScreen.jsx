import { useEffect, useRef } from 'react';
import { Badge } from './Art.jsx';
import NinjaCharacter from './NinjaCharacter.jsx';

export default function ResultsScreen({ isNewBadge, onReplay, onBack }) {
  const first = useRef(null);
  useEffect(() => first.current?.focus(), []);

  return (
    <main className="screen results-screen">
      <div className="results-card">
        <div className="confetti" aria-hidden="true">
          {Array.from({ length: 14 }, (_, i) => (
            <span key={i} style={{ '--i': i }} />
          ))}
        </div>
        <h2>Misi Selesai!</h2>
        <p className="results-sub">5 soalan selesai</p>
        <div className="results-art">
          <NinjaCharacter size={140} mood="cheer" className="ninja-jump" title="Ninja gembira" />
          <Badge size={140} />
        </div>
        <p className="results-badge">
          {isNewBadge ? 'Tahniah! Anda dapat Lencana Bilang Objek.' : 'Lencana Bilang Objek sudah dalam simpanan anda.'}
        </p>
        <div className="scroll-actions">
          <button ref={first} className="btn btn-primary btn-lg" onClick={onReplay}>
            <span aria-hidden="true">↺</span> Main Semula
          </button>
          <button className="btn btn-light btn-lg" onClick={onBack}>
            Kembali ke Kawasan
          </button>
        </div>
      </div>
    </main>
  );
}
