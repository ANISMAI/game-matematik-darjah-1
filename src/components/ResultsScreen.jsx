import { useEffect, useRef } from 'react';
import { Badge } from './Art.jsx';
import NinjaCharacter from './NinjaCharacter.jsx';
import { T } from '../data/strings.js';

export default function ResultsScreen({ title = 'Bilang Objek', total = 5, isNewBadge, backLabel = T.backToRegion, onReplay, onBack }) {
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
        <h2>{T.resultsTitle}</h2>
        <p className="results-sub">{T.resultsSub(total)}</p>
        <div className="results-art">
          <NinjaCharacter size={140} mood="cheer" className="ninja-jump" title="Ninja gembira" />
          <Badge size={140} label={`Lencana ${title}`} />
        </div>
        <p className="results-badge">{isNewBadge ? T.resultsNewBadge(title) : T.resultsOldBadge(title)}</p>
        <div className="scroll-actions">
          <button ref={first} className="btn btn-primary btn-lg" onClick={onReplay}>
            <span aria-hidden="true">↺</span> {T.replay}
          </button>
          <button className="btn btn-light btn-lg" onClick={onBack}>
            {backLabel}
          </button>
        </div>
      </div>
    </main>
  );
}
