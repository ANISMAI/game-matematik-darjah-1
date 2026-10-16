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
          <NinjaCharacter size={40} title="Avatar ninja" />
        </span>
        <h1>Pulau Ninja</h1>
      </div>
      <div className="settings">
        <button className="btn btn-round" aria-label="Tetapan" aria-expanded={open} onClick={() => setOpen(!open)}>
          <span aria-hidden="true">⚙️</span>
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
  const [run, setRun] = useState(0);
  const [newBadge, setNewBadge] = useState(false);

  const openRegion = (regionId, subId = null) => {
    const region = getRegion(regionId);
    update(() => ({ lastRegion: regionId }));
    setSelectedSub(subId ?? (region.subtopics.find((s) => s.playable) ?? region.subtopics[0]).id);
    setPreview(subId);
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
              openRegion(screen.regionId);
              setSelectedSub(screen.subId);
            }}
          />
        )}
      </div>
    </div>
  );
}
