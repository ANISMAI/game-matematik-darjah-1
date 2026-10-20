import { useState } from 'react';
import { getRegion, getSubtopic, START_REGION } from './data/topics.js';
import { getActivity, questionTotal, validateBank } from './data/activities.js';
import { missionKey, missionStatus, patchActivity, useProgress } from './lib/storage.js';
import { T } from './data/strings.js';
import { playSound } from './lib/sound.js';
import WorldMap from './components/WorldMap.jsx';
import RegionMap from './components/RegionMap.jsx';
import MissionPreview from './components/MissionPreview.jsx';
import CountingGame from './components/CountingGame.jsx';
import ResultsScreen from './components/ResultsScreen.jsx';
import ActivityShell from './components/ActivityShell.jsx';
import ShortcutPanel from './components/ShortcutPanel.jsx';
import NinjaCharacter from './components/NinjaCharacter.jsx';
import HomePage from './home/HomePage.jsx';
import TopikPage from './darjah4/TopikPage.jsx';
import SubtopikPage from './darjah4/SubtopikPage.tsx';
import SoalanPage from './darjah4/SoalanPage.tsx';
import HalanganPage from './darjah4/HalanganPage.tsx';
import MinigamePage from './minigame/MinigamePage.tsx';

if (import.meta.env.DEV) {
  const errors = validateBank();
  if (errors.length) console.warn('Bank soalan tidak sah:', errors);
}

function Header({ sound, onToggleSound, onHome }) {
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
        <button className="glass-btn header-btn" onClick={onHome} aria-label="Halaman utama" title="Halaman utama">
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            aria-hidden="true"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="m3 10 9-7 9 7v10a1 1 0 0 1-1 1h-5v-7H9v7H4a1 1 0 0 1-1-1z" />
          </svg>
        </button>
        <button
          className="glass-btn header-btn"
          aria-label="Tetapan"
          title="Tetapan"
          aria-expanded={open}
          onClick={() => setOpen(!open)}
        >
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            aria-hidden="true"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <circle cx="12" cy="12" r="3" />
            <path d="M19.4 15a1.7 1.7 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.8-.3 1.7 1.7 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.1a1.7 1.7 0 0 0-1.1-1.5 1.7 1.7 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.8 1.7 1.7 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1a1.7 1.7 0 0 0 1.5-1.1 1.7 1.7 0 0 0-.3-1.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.8.3H9a1.7 1.7 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.1a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.8V9a1.7 1.7 0 0 0 1.5 1H21a2 2 0 1 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1z" />
          </svg>
        </button>
        {open && (
          <div className="settings-pop" role="group" aria-label="Tetapan">
            <span>Bunyi</span>
            <button
              className={`toggle${sound ? ' on' : ''}`}
              role="switch"
              aria-checked={sound}
              onClick={onToggleSound}
            >
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
  const [screen, setScreen] = useState({ name: 'home' });
  const [homeProfile, setHomeProfile] = useState({
    coins: 0,
    gems: 0,
    equipped: { avatar: 'av-1', bingkai: 'fr-default', muzik: 'mu-default', gelaran: 'gl-default' },
  });
  const [preview, setPreview] = useState(null);
  const [selectedSub, setSelectedSub] = useState(null);
  // subtopik asal ninja bila kembali dari misi (ninja berjalan ke tahap seterusnya)
  const [walkFrom, setWalkFrom] = useState(null);
  const [run, setRun] = useState(0);
  const [newBadge, setNewBadge] = useState(false);
  const [shortcutOpen, setShortcutOpen] = useState(false);

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

  // origin: 'region' (pulau) | 'shortcut' (Pratonton Gameplay). fresh = main semula (percubaan baharu).
  const startActivity = (activityId, origin, fresh = false) => {
    const a = getActivity(activityId);
    update((p) => ({
      ...patchActivity(p, activityId, fresh ? { started: true, run: null } : { started: true }),
      started: { ...p.started, [missionKey(a.regionId, a.subId)]: true },
      lastMission: { regionId: a.regionId, subId: a.subId, activityId },
    }));
    setPreview(null);
    setShortcutOpen(false);
    setRun((r) => r + 1);
    setScreen({ name: 'game', regionId: a.regionId, subId: a.subId, activityId, origin });
  };

  const saveRun = (activityId, activityRun) => update((p) => patchActivity(p, activityId, { started: true, run: activityRun }));

  const finishActivity = ({ regionId, subId, activityId, origin }) => {
    setNewBadge(!progress.activities[activityId]?.ever);
    // Penyelesaian disimpan sebagai bendera berasingan: main semula tidak memadam atau menggandakannya.
    update((p) => ({
      ...patchActivity(p, activityId, { started: true, ever: true, run: null }),
      ...(activityId === 'bilang' ? { completed: { ...p.completed, [missionKey(regionId, subId)]: true } } : {}),
    }));
    playSound('done', progress.sound);
    setScreen({ name: 'results', regionId, subId, activityId, origin });
  };

  // Keluar dari permainan: kemajuan sudah disimpan; kembali ke skrin asal
  const backToOrigin = ({ regionId, subId, origin }) => {
    if (origin === 'shortcut') {
      setScreen({ name: 'world' });
      setShortcutOpen(true);
    } else openRegion(regionId, subId);
  };

  const continueAdventure = () => {
    const lm = progress.lastMission;
    if (lm && getSubtopic(lm.regionId, lm.subId)) openRegion(lm.regionId, lm.subId);
    else openRegion(START_REGION);
  };

  const region = screen.regionId ? getRegion(screen.regionId) : null;
  const activity = screen.activityId ? getActivity(screen.activityId) : null;

  if (screen.name === 'minigame') {
    return (
      <MinigamePage
        sound={progress.sound}
        onToggleSound={() => update((p) => ({ sound: !p.sound }))}
        onBack={() => setScreen({ name: 'home' })}
      />
    );
  }

  if (screen.name === 'd4-topik') {
    return (
      <TopikPage sound={progress.sound} onBack={() => setScreen({ name: 'home' })} onOpenTopic={() => setScreen({ name: 'd4-subtopik' })} />
    );
  }

  if (screen.name === 'd4-subtopik') {
    return (
      <SubtopikPage
        sound={progress.sound}
        onBack={() => setScreen({ name: 'd4-topik' })}
        onPlayLevel={() => setScreen({ name: 'd4-soalan' })}
        onObstacle={() => setScreen({ name: 'd4-halangan' })}
      />
    );
  }

  if (screen.name === 'd4-halangan') {
    return <HalanganPage sound={progress.sound} onExit={() => setScreen({ name: 'd4-subtopik' })} />;
  }

  if (screen.name === 'd4-soalan') {
    return <SoalanPage sound={progress.sound} onExit={() => setScreen({ name: 'd4-subtopik' })} />;
  }

  if (screen.name === 'home') {
    return (
      <HomePage
        onPlay={() => setScreen({ name: 'world' })}
        onPlayDarjah4={() => setScreen({ name: 'd4-topik' })}
        onOpenMinigame={() => setScreen({ name: 'minigame' })}
        sound={progress.sound}
        onToggleSound={() => update((p) => ({ sound: !p.sound }))}
        profile={homeProfile}
        onProfileChange={setHomeProfile}
      />
    );
  }

  return (
    <div className="app">
      <Header
        sound={progress.sound}
        onToggleSound={() => update((p) => ({ sound: !p.sound }))}
        onHome={() => {
          setPreview(null);
          setShortcutOpen(false);
          setScreen({ name: 'home' });
        }}
      />

      <div className="stage" key={screen.name + (screen.regionId ?? '') + (screen.activityId ?? '') + run}>
        {screen.name === 'world' && (
          <>
            <WorldMap
              progress={progress}
              onOpenRegion={(id) => openRegion(id)}
              onContinue={continueAdventure}
              onOpenShortcut={() => setShortcutOpen(true)}
            />
            {shortcutOpen && (
              <ShortcutPanel progress={progress} onStart={(id) => startActivity(id, 'shortcut')} onClose={() => setShortcutOpen(false)} />
            )}
          </>
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
                progress={progress}
                onStart={(id) => startActivity(id, 'region')}
                onClose={() => setPreview(null)}
              />
            )}
          </>
        )}

        {screen.name === 'game' &&
          (activity.mechanic === 'counting' ? (
            <CountingGame sound={progress.sound} onExit={() => backToOrigin(screen)} onFinish={() => finishActivity(screen)} />
          ) : (
            <ActivityShell
              activity={activity}
              savedRun={progress.activities[activity.id]?.run}
              sound={progress.sound}
              onSave={(r) => saveRun(activity.id, r)}
              onExit={() => backToOrigin(screen)}
              onFinish={() => finishActivity(screen)}
            />
          ))}

        {screen.name === 'results' && (
          <ResultsScreen
            title={activity.title}
            total={questionTotal(activity)}
            isNewBadge={newBadge}
            backLabel={screen.origin === 'shortcut' ? T.backToShortcut : T.backToRegion}
            onReplay={() => startActivity(screen.activityId, screen.origin, true)}
            onBack={() => {
              if (screen.origin === 'shortcut') {
                backToOrigin(screen);
                return;
              }
              // kembali ke peta tahap; ninja berjalan ke tahap seterusnya bila subtopik ini sudah selesai,
              // jika belum, pemilih aktiviti subtopik yang sama dibuka semula
              const subs = getRegion(screen.regionId).subtopics;
              const subDone = missionStatus(progress, screen.regionId, screen.subId) === 'selesai';
              openRegion(screen.regionId, subDone ? null : screen.subId);
              if (subDone) {
                setSelectedSub(subs[subs.findIndex((s) => s.id === screen.subId) + 1]?.id ?? screen.subId);
                setWalkFrom(screen.subId);
              }
            }}
          />
        )}
      </div>
    </div>
  );
}
