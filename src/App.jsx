import { useState } from 'react';
import { getRegion, getSubtopic, START_REGION } from './data/topics.js';
import { missionKey, missionStatus, useProgress } from './lib/storage.js';
import { playSound } from './lib/sound.js';
import WorldMap from './components/WorldMap.jsx';
import RegionMap from './components/RegionMap.jsx';
import MissionPreview from './components/MissionPreview.jsx';
import CountingGame from './components/CountingGame.jsx';
import ResultsScreen from './components/ResultsScreen.jsx';
import NinjaCharacter from './components/NinjaCharacter.jsx';

function Header({ sound, onToggleSound }) {
  const [open, setOpen] = useState(false);
  return (
    <header className="app-header">
      <div className="brand">
        <span className="avatar">
          <NinjaCharacter size={28} title="Avatar ninja" />
        </span>
        <h1>Pulau Ninja</h1>
      </div>
      <div className="settings">
        <button className="glass-btn header-btn" aria-label="Tetapan" title="Tetapan" aria-expanded={open} onClick={() => setOpen(!open)}>
          <svg width="20" height="20" viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="3" />
            <path d="M19.4 15a1.7 1.7 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.8-.3 1.7 1.7 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.1a1.7 1.7 0 0 0-1.1-1.5 1.7 1.7 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.8 1.7 1.7 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1a1.7 1.7 0 0 0 1.5-1.1 1.7 1.7 0 0 0-.3-1.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.8.3H9a1.7 1.7 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.1a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.8V9a1.7 1.7 0 0 0 1.5 1H21a2 2 0 1 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1z" />
          </svg>
        </button>
        {open && (
          <div className="settings-pop" role="group" aria-label="Tetapan">
            <span>Bunyi</span>
            <button className={`toggle${sound ? ' on' : ''}`} role="switch" aria-checked={sound} onClick={onToggleSound}>
              <span className="toggle-knob" aria-hidden="true" />
              {sound ? 'Hidup' : 'Mati'}
            </button>
          </div>
        )}
      </div>
    </header>
  );
}

export default function App() {
  const [progress, update] = useProgress();
  const [screen, setScreen] = useState({ name: 'world' });
  const [preview, setPreview] = useState(null);
  const [selectedSub, setSelectedSub] = useState(null);
  // subtopik asal ninja bila kembali dari misi (ninja berjalan ke tahap seterusnya)
  const [walkFrom, setWalkFrom] = useState(null);
  const [run, setRun] = useState(0);
  const [newBadge, setNewBadge] = useState(false);

  const openRegion = (regionId, subId = null) => {
    const region = getRegion(regionId);
    update(() => ({ lastRegion: regionId }));
    setSelectedSub(subId ?? (region.subtopics.find((s) => s.playable) ?? region.subtopics[0]).id);
    setPreview(subId);
    setWalkFrom(null);
    setScreen({ name: 'region', regionId });
  };

  const selectSub = (subId) => {
    setSelectedSub(subId);
    setPreview(subId);
  };

  const startMission = (regionId, subId) => {
    update((p) => ({
      started: { ...p.started, [missionKey(regionId, subId)]: true },
      lastMission: { regionId, subId },
    }));
    setPreview(null);
    setRun((r) => r + 1);
    setScreen({ name: 'game', regionId, subId });
  };

  const finishMission = ({ regionId, subId }) => {
    const key = missionKey(regionId, subId);
    setNewBadge(!progress.completed[key]);
    // Penyelesaian disimpan sebagai bendera: main semula tidak menggandakan ganjaran.
    update((p) => ({ completed: { ...p.completed, [key]: true } }));
    playSound('done', progress.sound);
    setScreen({ name: 'results', regionId, subId });
  };

  const continueAdventure = () => {
    const lm = progress.lastMission;
    if (lm && getSubtopic(lm.regionId, lm.subId)) openRegion(lm.regionId, lm.subId);
    else openRegion(START_REGION);
  };

  const region = screen.regionId ? getRegion(screen.regionId) : null;

  return (
    <div className="app">
      <Header sound={progress.sound} onToggleSound={() => update((p) => ({ sound: !p.sound }))} />

      <div className="stage" key={screen.name + (screen.regionId ?? '') + run}>
        {screen.name === 'world' && (
          <WorldMap progress={progress} onOpenRegion={(id) => openRegion(id)} onContinue={continueAdventure} />
        )}

        {screen.name === 'region' && (
          <>
            <RegionMap
              region={region}
              progress={progress}
              selectedSub={selectedSub}
              walkFrom={walkFrom}
              showIntro={!walkFrom && !preview && !progress.introSeen?.[region.id]}
              onIntroDone={() => update((p) => ({ introSeen: { ...p.introSeen, [region.id]: true } }))}
              onSelectSub={selectSub}
              onBack={() => setScreen({ name: 'world' })}
            />
            {preview && (
              <MissionPreview
                region={region}
                sub={getSubtopic(region.id, preview)}
                status={missionStatus(progress, region.id, preview)}
                onStart={() => startMission(region.id, preview)}
                onClose={() => setPreview(null)}
              />
            )}
          </>
        )}

        {screen.name === 'game' && (
          <CountingGame
            sound={progress.sound}
            onExit={() => {
              openRegion(screen.regionId);
              setSelectedSub(screen.subId);
            }}
            onFinish={() => finishMission(screen)}
          />
        )}

        {screen.name === 'results' && (
          <ResultsScreen
            isNewBadge={newBadge}
            onReplay={() => startMission(screen.regionId, screen.subId)}
            onBack={() => {
              // kembali ke peta tahap; ninja berjalan ke tahap seterusnya (jika ada)
              const subs = getRegion(screen.regionId).subtopics;
              const next = subs[subs.findIndex((s) => s.id === screen.subId) + 1]?.id ?? screen.subId;
              openRegion(screen.regionId);
              setSelectedSub(next);
              setWalkFrom(screen.subId);
            }}
          />
        )}
      </div>
    </div>
  );
}
