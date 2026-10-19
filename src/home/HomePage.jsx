import { useEffect, useRef, useState } from 'react';
import { MotionConfig } from 'framer-motion';
import { X } from 'lucide-react';
import { GameBackground } from './components/GameBackground';
import { HeroLogo } from './components/HeroLogo';
import { ProfilePanel } from './components/ProfilePanel';
import { TopSelector } from './components/TopSelector';
import { SakuraFall } from './components/SakuraFall';
import { BirdsFlow } from './components/BirdsFlow';
import { KedaiModal } from './components/KedaiModal';
import { HomeSidebar, HomeMobileNav } from './components/HomeNavigation';
import './dojo.css';
import './home-layout.css';

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

export default function HomePage({ onPlay, sound, onToggleSound, profile, onProfileChange }) {
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
    else
      setNotice({
        title: 'Pengembaraan akan datang',
        text: `Peta ${subject} ${grade} belum tersedia. Pilih Matematik · Darjah 1 untuk mula bermain.`,
      });
  };

  const select = (item) => {
    if (item.key === 'belajar') play();
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
          <div className="relative z-10 flex h-full">
            <HomeSidebar onSelect={select} />
            <main className="home-main relative flex min-w-0 flex-1 flex-col" aria-label="Halaman utama YouEdu Math">
              <div className="home-selector relative z-30">
                <TopSelector subject={subject} setSubject={setSubject} grade={grade} setGrade={setGrade} />
              </div>
              <div className="home-hero">
                <HeroLogo
                  subject={subject}
                  onPlay={play}
                  onMission={() =>
                    setNotice({
                      title: 'Misi Harian',
                      text: 'Teroka kampung, pilih batu pertama dan selesaikan cabaran mengenal nombor!',
                    })
                  }
                  onShop={() => setShopOpen(true)}
                />
              </div>
            </main>
            <aside
              className="home-profile relative z-20 hidden h-full shrink-0 items-start p-4 lg:flex"
              aria-label="Profil ninja"
            >
              <ProfilePanel username="mad" points={profile.coins} streak={2} equipped={profile.equipped} />
            </aside>
          </div>
          <HomeMobileNav onSelect={select} />
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
