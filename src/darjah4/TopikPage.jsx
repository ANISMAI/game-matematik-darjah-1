// Darjah 4 · Pilih Topik. Diadaptasi daripada ninja-math-dojo (src/routes/topik.tsx):
// tiada router (navigasi melalui props) dan tiada sonner (makluman ringkas sendiri).
import { useEffect, useRef, useState } from 'react';
import { AnimatePresence, MotionConfig, motion } from 'framer-motion';
import { ChevronLeft, ChevronRight, Star } from 'lucide-react';
import clickSound from '../home/assets/sounds/click-sound.mp3';
import bambooWaterSound from '../home/assets/sounds/bamboo-water-sound.mp3';
import thunderSound from '../home/assets/sounds/thunder-sound.mp3';
import { SakuraFall } from '../home/components/SakuraFall';
import { MapleLeafFall } from '../home/components/MapleLeafFall';
import { RainFall } from '../home/components/RainFall';
import { BirdsFlow } from '../home/components/BirdsFlow';
import '../home/dojo.css';

const difficultyBg = {
  Mudah: '/home/darjah4/latar-topik-1.webp',
  Normal: '/home/darjah4/latar-topik-2.webp',
  Susah: '/home/darjah4/latar-topik-3.webp',
};

export const TOPICS = [
  { id: 1, label: 'Topik 1', title: 'Nombor & Operasi', bg: 'linear-gradient(135deg, #FF8C42, #E05A2B)' },
  { id: 2, label: 'Topik 2', title: 'Pecahan, Perpuluhan & Peratus', bg: 'linear-gradient(135deg, #42A5FF, #2B7BE0)' },
  { id: 3, label: 'Topik 3', title: 'Wang', bg: 'linear-gradient(135deg, #4CD980, #27AE60)' },
  { id: 4, label: 'Topik 4', title: 'Masa & Waktu', bg: 'linear-gradient(135deg, #C06FE0, #8E44AD)' },
  { id: 5, label: 'Topik 5', title: 'Panjang, Jisim & Isipadu Cecair', bg: 'linear-gradient(135deg, #F9E04B, #D4AC0D)' },
  { id: 6, label: 'Topik 6', title: 'Ruang', bg: 'linear-gradient(135deg, #FF6B6B, #E74C3C)' },
  { id: 7, label: 'Topik 7', title: 'Koordinat, Nisbah & Kadaran', bg: 'linear-gradient(135deg, #2ECC9A, #16A085)' },
  { id: 8, label: 'Topik 8', title: 'Pengurusan Data', bg: 'linear-gradient(135deg, #FFA94D, #E67E22)' },
];

// Topik yang sudah ada subtopik (yang lain memaparkan "akan datang")
const OPEN_TOPICS = [2];

const difficulties = ['Mudah', 'Normal', 'Susah'];

const positionStyles = {
  center: { x: 0, scale: 1, opacity: 1, zIndex: 30, rotateY: 0 },
  left1: { x: -360, scale: 0.78, opacity: 0.85, zIndex: 20, rotateY: 12 },
  right1: { x: 360, scale: 0.78, opacity: 0.85, zIndex: 20, rotateY: -12 },
  left2: { x: -620, scale: 0.55, opacity: 0.4, zIndex: 10, rotateY: 20 },
  right2: { x: 620, scale: 0.55, opacity: 0.4, zIndex: 10, rotateY: -20 },
};

export default function TopikPage({ sound, onBack, onOpenTopic }) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [difficulty, setDifficulty] = useState('Normal');
  const [diffOpen, setDiffOpen] = useState(false);
  const [notice, setNotice] = useState(null);
  const noticeTimer = useRef(null);

  const playClick = () => {
    if (sound) new Audio(clickSound).play().catch(() => {});
  };

  // bunyi latar ikut tahap kesukaran (hanya bila bunyi hidup)
  useEffect(() => {
    if (!sound) return undefined;
    const audio = new Audio(difficulty === 'Susah' ? thunderSound : bambooWaterSound);
    audio.loop = true;
    audio.volume = 0.5;
    audio.play().catch(() => {});
    return () => {
      audio.pause();
      audio.currentTime = 0;
    };
  }, [difficulty, sound]);

  useEffect(() => () => clearTimeout(noticeTimer.current), []);

  const showNotice = (text) => {
    setNotice(text);
    clearTimeout(noticeTimer.current);
    noticeTimer.current = setTimeout(() => setNotice(null), 2600);
  };

  const prev = () => setActiveIndex((i) => (i - 1 + TOPICS.length) % TOPICS.length);
  const next = () => setActiveIndex((i) => (i + 1) % TOPICS.length);

  const getPosition = (index) => {
    const diff = (index - activeIndex + TOPICS.length) % TOPICS.length;
    if (diff === 0) return 'center';
    if (diff === 1) return 'right1';
    if (diff === TOPICS.length - 1) return 'left1';
    if (diff === 2) return 'right2';
    if (diff === TOPICS.length - 2) return 'left2';
    return null;
  };

  const openTopic = (topic) => {
    if (OPEN_TOPICS.includes(topic.id) && onOpenTopic) onOpenTopic(topic.id, difficulty);
    else showNotice(`${topic.title} akan dibuka tidak lama lagi.`);
  };

  return (
    <MotionConfig reducedMotion="user">
      <div className="dojo-home">
        <div className="relative h-dvh w-screen overflow-hidden bg-ninja-navy-deep font-sans">
          <div className="absolute inset-0 overflow-hidden">
            <img src={difficultyBg[difficulty]} alt="" aria-hidden className="absolute inset-0 h-full w-full object-cover object-center" />
            <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-ninja-navy-deep/30 via-transparent to-ninja-navy-deep/40" />
          </div>
          {difficulty === 'Mudah' && <MapleLeafFall />}
          {difficulty === 'Normal' && <SakuraFall />}
          {difficulty === 'Susah' && <RainFall />}
          {difficulty !== 'Susah' && <BirdsFlow />}

          <div className="relative z-10 flex h-full">
            <main className="relative flex flex-1 flex-col" aria-label="Pilih topik Darjah 4">
              {/* Bar atas */}
              <div className="flex items-center justify-between p-4 sm:p-5">
                <motion.button
                  whileHover={{ scale: 1.06, x: -2 }}
                  whileTap={{ scale: 0.94 }}
                  onClick={() => {
                    playClick();
                    onBack();
                  }}
                  className="flex items-center gap-2 rounded-2xl border-[3px] border-ninja-navy-deep px-4 py-2.5 font-black text-white shadow-[var(--shadow-game)]"
                  style={{ background: 'var(--gradient-orange)' }}
                >
                  <ChevronLeft className="h-5 w-5" strokeWidth={3} />
                  <span className="text-sm">Balik</span>
                </motion.button>

                <div className="relative">
                  <motion.button
                    whileHover={{ scale: 1.04 }}
                    whileTap={{ scale: 0.96 }}
                    onClick={() => {
                      playClick();
                      setDiffOpen((o) => !o);
                    }}
                    aria-expanded={diffOpen}
                    aria-label={`Tahap kesukaran: ${difficulty}`}
                    className="flex items-center gap-2 rounded-2xl border-[3px] border-ninja-navy-deep px-4 py-2.5 font-black text-ninja-yellow shadow-[var(--shadow-game)]"
                    style={{ background: 'var(--gradient-orange)' }}
                  >
                    <Star className="h-4 w-4 fill-ninja-yellow text-ninja-yellow" />
                    <span className="text-sm">{difficulty}</span>
                    <ChevronRight className={`h-4 w-4 transition-transform ${diffOpen ? 'rotate-90' : ''}`} strokeWidth={3} />
                  </motion.button>

                  <AnimatePresence>
                    {diffOpen && (
                      <motion.ul
                        initial={{ opacity: 0, y: -6, scale: 0.96 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -6, scale: 0.96 }}
                        className="absolute right-0 top-[calc(100%+8px)] z-50 w-36 overflow-hidden rounded-2xl border-2 border-ninja-navy-deep p-1.5 shadow-[var(--shadow-game)]"
                        style={{ background: 'linear-gradient(180deg, #0B3D91 0%, #071B3A 60%, #061534 100%)' }}
                      >
                        {difficulties.map((d) => (
                          <li key={d}>
                            <button
                              onClick={() => {
                                playClick();
                                setDifficulty(d);
                                setDiffOpen(false);
                              }}
                              aria-pressed={d === difficulty}
                              className={`flex w-full items-center gap-2 rounded-xl px-3 py-2 text-sm font-bold transition-colors ${
                                d === difficulty ? 'text-white' : 'text-white/70 hover:text-white'
                              }`}
                              style={d === difficulty ? { background: 'var(--gradient-orange)' } : undefined}
                            >
                              {d === 'Mudah' ? '🟢' : d === 'Normal' ? '🟡' : '🔴'} {d}
                            </button>
                          </li>
                        ))}
                      </motion.ul>
                    )}
                  </AnimatePresence>
                </div>
              </div>

              {/* Papan tajuk */}
              <div className="flex justify-center">
                <div
                  className="relative rounded-3xl border-4 border-[oklch(0.32_0.07_45)] px-10 py-3 text-center shadow-[var(--shadow-game)]"
                  style={{ background: 'linear-gradient(180deg, oklch(0.85 0.12 80) 0%, oklch(0.72 0.14 70) 50%, oklch(0.62 0.12 60) 100%)' }}
                >
                  <div className="pointer-events-none absolute inset-0 rounded-2xl opacity-20 [background-image:repeating-linear-gradient(180deg,transparent_0,transparent_6px,rgba(0,0,0,0.35)_6px,rgba(0,0,0,0.35)_7px)]" />
                  <h2 className="relative font-display text-2xl font-black tracking-wide text-ninja-navy-deep sm:text-3xl">PILIH TOPIK</h2>
                </div>
              </div>

              {/* Karusel */}
              <div className="relative flex flex-1 items-center justify-center" style={{ perspective: '1200px' }}>
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => {
                    playClick();
                    prev();
                  }}
                  aria-label="Topik sebelum"
                  className="absolute left-4 z-40 grid h-14 w-14 place-items-center rounded-full border-[3px] border-ninja-navy-deep text-ninja-yellow shadow-[var(--shadow-game)] sm:left-8"
                  style={{ background: 'var(--gradient-orange)' }}
                >
                  <ChevronLeft className="h-7 w-7" strokeWidth={3} />
                </motion.button>

                <div className="relative flex h-96 w-full items-center justify-center">
                  {TOPICS.map((topic, index) => {
                    const pos = getPosition(index);
                    if (!pos) return null;
                    return (
                      <motion.div
                        key={topic.id}
                        animate={positionStyles[pos]}
                        transition={{ duration: 0.45, ease: 'easeInOut' }}
                        className="absolute cursor-pointer"
                        role="button"
                        tabIndex={pos === 'center' ? 0 : -1}
                        aria-label={`${topic.label}: ${topic.title}`}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' || e.key === ' ') {
                            e.preventDefault();
                            openTopic(topic);
                          }
                        }}
                        onClick={() => {
                          playClick();
                          if (pos === 'center') openTopic(topic);
                          else if (pos === 'left1' || pos === 'left2') prev();
                          else next();
                        }}
                      >
                        <motion.div
                          whileHover={pos === 'center' ? { scale: 1.04, y: -6 } : {}}
                          whileTap={pos === 'center' ? { scale: 0.97 } : {}}
                          className="relative flex flex-col items-center gap-3"
                        >
                          {pos === 'center' && (
                            <motion.div
                              className="absolute -inset-4 -z-10 rounded-full opacity-50 blur-2xl"
                              style={{ background: topic.bg }}
                              animate={{ opacity: [0.4, 0.7, 0.4] }}
                              transition={{ duration: 2, repeat: Infinity }}
                            />
                          )}
                          <img
                            src={`/home/darjah4/topik-${topic.id}.webp`}
                            alt=""
                            className="h-52 w-52 object-contain drop-shadow-2xl sm:h-64 sm:w-64"
                          />
                          <div className="text-center">
                            <p className="font-display text-xs font-black uppercase tracking-widest text-white/60">{topic.label}</p>
                            <p
                              className={`mt-0.5 font-display font-black leading-tight text-white drop-shadow ${
                                topic.title.length > 20 ? 'text-sm' : 'text-base'
                              }`}
                            >
                              {topic.title}
                            </p>
                          </div>
                        </motion.div>
                      </motion.div>
                    );
                  })}
                </div>

                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => {
                    playClick();
                    next();
                  }}
                  aria-label="Topik seterusnya"
                  className="absolute right-4 z-40 grid h-14 w-14 place-items-center rounded-full border-[3px] border-ninja-navy-deep text-ninja-yellow shadow-[var(--shadow-game)] sm:right-8"
                  style={{ background: 'var(--gradient-orange)' }}
                >
                  <ChevronRight className="h-7 w-7" strokeWidth={3} />
                </motion.button>
              </div>

              {/* Titik penunjuk */}
              <div className="mb-6 flex justify-center gap-2">
                {TOPICS.map((t, i) => (
                  <button
                    key={t.id}
                    onClick={() => {
                      playClick();
                      setActiveIndex(i);
                    }}
                    aria-label={`${t.label}: ${t.title}`}
                    aria-current={i === activeIndex || undefined}
                    className="h-2.5 rounded-full transition-all duration-300"
                    style={{
                      width: i === activeIndex ? 28 : 10,
                      background: i === activeIndex ? 'var(--gradient-orange)' : 'rgba(255,255,255,0.3)',
                    }}
                  />
                ))}
              </div>
            </main>
          </div>

          {/* Makluman "akan datang" */}
          <div className="pointer-events-none absolute inset-x-0 bottom-6 z-50 flex justify-center" role="status" aria-live="polite">
            <AnimatePresence>
              {notice && (
                <motion.div
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 12 }}
                  className="rounded-2xl border-2 border-ninja-yellow bg-ninja-navy-deep/90 px-5 py-3 text-white shadow-[var(--shadow-game)]"
                >
                  <p className="font-display text-base font-black text-ninja-yellow">Akan datang! 🥷</p>
                  <p className="text-sm">{notice}</p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </MotionConfig>
  );
}
