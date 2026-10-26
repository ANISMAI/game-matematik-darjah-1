import { useEffect, useRef, useState } from 'react';
import { MotionConfig } from 'framer-motion';
import { X } from 'lucide-react';
import { GameBackground } from './components/GameBackground';
import { HeroBanner, HeroCharacters } from './components/HeroLogo';
import { ProfilePanel } from './components/ProfilePanel';
import { TopSelector } from './components/TopSelector';
import { SakuraFall } from './components/SakuraFall';
import { BirdsFlow } from './components/BirdsFlow';
import { KedaiModal } from './components/KedaiModal';
import { HomeBottomBar } from './components/HomeNavigation';
import './dojo.css';
import './home-layout.css';

function SpinShuriken({ className }) {
  return (
    <svg className={className} viewBox="0 0 100 100" aria-hidden="true">
      <path d="M50 8 L58 42 L92 50 L58 58 L50 92 L42 58 L8 50 L42 42 Z" fill="#cfd6df" stroke="#2f3640" strokeWidth="5" strokeLinejoin="round" />
      <circle cx="50" cy="50" r="7" fill="#2f3640" />
    </svg>
  );
}

// Butang bertema ninja: bingkai kayu dojo + rivet + shuriken sudut.
// Bentuk PANJANG mendatar (ikon kiri, teks kanan).
function GameTile({ emoji, label, color, badge, ribbon, onClick }) {
  return (
    <button
      onClick={onClick}
      className="group relative flex w-56 items-stretch transition-transform hover:-translate-y-1 active:translate-y-0"
      aria-label={label}
    >
      {/* bingkai kayu dojo */}
      <span className="relative flex w-full items-center rounded-2xl p-[7px]" style={{ background: 'linear-gradient(160deg,#5a3a1c,#3a2410)', boxShadow: 'var(--shadow-game)' }}>
        {/* rivet sudut */}
        {['left-2 top-2', 'right-2 top-2', 'left-2 bottom-2', 'right-2 bottom-2'].map((p) => (
          <span key={p} className={`absolute ${p} h-2 w-2 rounded-full bg-amber-200/70`} aria-hidden="true" />
        ))}
        {/* muka butang berwarna */}
        <span
          className="flex w-full items-center gap-3 rounded-xl border-2 border-black/20 px-4 py-3"
          style={{ background: color, boxShadow: 'inset 0 -6px 0 rgba(0,0,0,0.22), inset 0 4px 0 rgba(255,255,255,0.25)' }}
        >
          <span className="grid h-11 w-11 shrink-0 place-items-center rounded-lg bg-white/20 text-3xl drop-shadow-[0_2px_2px_rgba(0,0,0,0.4)]" aria-hidden="true">{emoji}</span>
          <span className="font-display text-lg font-black uppercase tracking-wide text-white text-stroke-navy">{label}</span>
        </span>
      </span>

      {/* shuriken berpusing di sudut kanan atas */}
      <SpinShuriken className="pointer-events-none absolute -right-2 -top-2 z-20 h-8 w-8 animate-[spin_7s_linear_infinite]" />
      {badge && <span className="absolute -left-2 -top-2 z-30 grid h-6 w-6 place-items-center rounded-full border-2 border-white bg-red-500 text-[11px] font-black text-white shadow">{badge}</span>}
      {ribbon && <span className="absolute -right-3 -bottom-2 z-30 rotate-6 rounded-md border-2 border-white bg-ninja-green px-1.5 py-0.5 text-[9px] font-black uppercase text-white shadow">{ribbon}</span>}
    </button>
  );
}

function HomeNotice({ title, children, onClose }) {
  const ref = useRef(null);
  useEffect(() => {
    ref.current.showModal();
  }, []);
  return (
    <dialog
      ref={ref}
      className="home-notice rounded-3xl border-2 border-ninja-yellow p-6 text-white shadow-[var(--shadow-game)]"
      onCancel={onClose}
      onClick={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
      aria-labelledby="home-notice-title"
    >
      <div className="mb-4 flex items-center justify-between gap-4">
        <h2 id="home-notice-title" className="font-display text-2xl font-bold text-ninja-yellow">
          {title}
        </h2>
        <button
          onClick={onClose}
          aria-label="Tutup"
          className="grid h-10 w-10 place-items-center rounded-xl bg-white/10 hover:bg-white/20"
        >
          <X className="h-5 w-5" />
        </button>
      </div>
      {children}
    </dialog>
  );
}

export default function HomePage({ onPlay, onPlayDarjah4, onOpenMinigame, sound, onToggleSound, profile, onProfileChange }) {
  const [subject, setSubject] = useState('Matematik');
  const [grade, setGrade] = useState('Darjah 1');
  const [shopOpen, setShopOpen] = useState(false);
  const [notice, setNotice] = useState(null);
  const [reducedMotion, setReducedMotion] = useState(
    () => window.matchMedia('(prefers-reduced-motion: reduce)').matches,
  );

  useEffect(() => {
    const media = window.matchMedia('(prefers-reduced-motion: reduce)');
    const change = () => setReducedMotion(media.matches);
    media.addEventListener('change', change);
    return () => media.removeEventListener('change', change);
  }, []);

  useEffect(() => {
    if (!shopOpen) return;
    const close = (event) => {
      if (event.key === 'Escape') setShopOpen(false);
    };
    window.addEventListener('keydown', close);
    return () => window.removeEventListener('keydown', close);
  }, [shopOpen]);

  const play = () => {
    if (subject === 'Matematik' && grade === 'Darjah 1') onPlay();
    else if (subject === 'Matematik' && grade === 'Darjah 4' && onPlayDarjah4) onPlayDarjah4();
    else
      setNotice({
        title: 'Pengembaraan akan datang',
        text: `Peta ${subject} ${grade} belum tersedia. Pilih Matematik · Darjah 1 untuk mula bermain.`,
      });
  };

  const select = (item) => {
    if (item.key === 'belajar') play();
    else if (item.key === 'mini' && onOpenMinigame) onOpenMinigame();
    else if (item.key === 'inventori') setShopOpen(true);
    else if (item.key === 'tetapan') setNotice({ title: 'Tetapan', settings: true });
    else
      setNotice({
        title: item.label,
        text: 'Aktiviti ini akan datang. Jom teroka Pulau Ninja untuk belajar matematik!',
      });
  };

  const patchProfile = (patch) => onProfileChange((previous) => ({ ...previous, ...patch }));

  return (
    <MotionConfig reducedMotion="user">
      <div className="dojo-home">
        <div className="home-screen relative h-full w-full overflow-hidden bg-ninja-navy-deep font-sans">
          <GameBackground />
          {!reducedMotion && (
            <>
              <SakuraFall />
              <BirdsFlow />
            </>
          )}
          {/* Banner papan logo memanjang di atas sekali */}
          <div className="home-banner absolute inset-x-0 top-0 z-30">
            <HeroBanner subject={subject} />
          </div>
          <div className="relative z-10 flex h-full">
            <aside
              className="home-profile relative z-20 flex h-full shrink-0 flex-col items-start gap-3 p-4"
              aria-label="Profil ninja"
            >
              {/* Pemilih subjek & darjah di atas sekali */}
              <div className="home-selector relative z-30 mb-4 flex flex-wrap gap-2 pl-2">
                <TopSelector subject={subject} setSubject={setSubject} grade={grade} setGrade={setGrade} />
              </div>
              <ProfilePanel username="mad" points={profile.coins} streak={2} equipped={profile.equipped} />
              {/* Butang Misi & Kedai bertema ninja, disusun menegak */}
              <div className="flex flex-col items-start gap-4 pl-2">
                <GameTile
                  emoji="📝"
                  label="Misi"
                  color="var(--mission-solid)"
                  badge="3"
                  onClick={() =>
                    setNotice({
                      title: 'Misi Harian',
                      text: 'Teroka kampung, pilih batu pertama dan selesaikan cabaran mengenal nombor!',
                    })
                  }
                />
                <GameTile emoji="🏪" label="Kedai" color="var(--gradient-orange)" ribbon="BUKA" onClick={() => setShopOpen(true)} />
              </div>
            </aside>
            <main className="home-main relative flex min-w-0 flex-1 flex-col" aria-label="Halaman utama YouEdu Math">
              <div className="home-hero">
                <HeroCharacters />
              </div>
            </main>
          </div>
          {/* Butang PLAY besar di bawah-kanan (gaya Brawl Stars) */}
          <button
            onClick={play}
            className="home-play-fab group fixed bottom-28 right-6 z-40 flex items-center gap-3 rounded-2xl border-4 border-ninja-navy-deep px-10 py-5 text-white shadow-[var(--shadow-game),var(--shadow-glow-orange)] transition-transform hover:scale-105 active:scale-95"
            style={{ background: 'var(--gradient-orange)' }}
            aria-label="Mula main"
          >
            <span className="grid h-10 w-10 place-items-center rounded-xl bg-white/20 text-2xl" aria-hidden="true">
              ▶
            </span>
            <span className="font-display text-2xl font-black tracking-wide text-shadow-strong">MAIN</span>
          </button>
          <HomeBottomBar onSelect={select} active="mini" />
          {notice && (
            <HomeNotice title={notice.title} onClose={() => setNotice(null)}>
              {notice.settings ? (
                <div className="flex items-center justify-between gap-8">
                  <span>Bunyi permainan</span>
                  <button
                    role="switch"
                    aria-checked={sound}
                    onClick={onToggleSound}
                    className="rounded-xl bg-ninja-orange px-4 py-2 font-bold text-white"
                  >
                    {sound ? 'Hidup' : 'Mati'}
                  </button>
                </div>
              ) : (
                <p className="leading-relaxed text-white/90">{notice.text}</p>
              )}
            </HomeNotice>
          )}
          <KedaiModal
            open={shopOpen}
            onClose={() => setShopOpen(false)}
            sound={sound}
            coins={profile.coins}
            gems={profile.gems}
            onCoinsChange={(coins) => patchProfile({ coins })}
            onGemsChange={(gems) => patchProfile({ gems })}
            equipped={profile.equipped}
            onEquippedChange={(equipped) => patchProfile({ equipped })}
          />
        </div>
      </div>
    </MotionConfig>
  );
}
