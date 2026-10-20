// Menu Permainan Mini. Disalin daripada ninja-math-dojo (src/routes/minigame.tsx).
// Perubahan: tiada router (navigasi melalui props), gambar WebP, butang bunyi disambung ke tetapan game.
import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence, MotionConfig } from "framer-motion";
import { ArrowLeft, Volume2, VolumeX } from "lucide-react";
import "../home/dojo.css";

const ninjaHouseBg = "/home/darjah4/rumah-ninja.webp";

type MinigameProps = {
  sound: boolean;
  onToggleSound: () => void;
  onBack: () => void;
  // belum digabung: bila tiada, makluman "akan datang" dipaparkan
  onOpenGame?: (id: string) => void;
};

interface MiniGame {
  id: string;
  name: string;
  desc: string;
  emoji: string;
  color: string;
  bg: string;
  route: string;
  available: boolean;
}

const GAMES: MiniGame[] = [
  {
    id: "wordquest",
    name: "WordQuest",
    desc: "Cari perkataan matematik tersembunyi dalam grid huruf!",
    emoji: "🔤",
    color: "#f59e0b",
    bg: "linear-gradient(135deg,#92400e,#78350f)",
    route: "/wordquest",
    available: true,
  },
  {
    id: "stacktower",
    name: "Stack Tower",
    desc: "Susun blok setinggi mungkin!",
    emoji: "🏗️",
    color: "#a78bfa",
    bg: "linear-gradient(135deg,#1e1b4b,#312e81)",
    route: "/stacktower",
    available: true,
  },
  {
    id: "coindrop",
    name: "Coin Drop",
    desc: "Tangkap coin jawapan betul, elak bom!",
    emoji: "🪙",
    color: "#fbbf24",
    bg: "linear-gradient(135deg,#78350f,#451a03)",
    route: "/coindrop",
    available: true,
  },
];

export default function MinigamePage({ sound, onToggleSound, onBack, onOpenGame }: MinigameProps) {
  const [loadingId, setLoadingId] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);
  useEffect(() => () => timers.current.forEach(clearTimeout), []);

  function handlePlay(game: MiniGame) {
    if (!game.available || loadingId) return;
    if (!onOpenGame) {
      setNotice(`${game.name} akan dibuka tidak lama lagi.`);
      timers.current.push(setTimeout(() => setNotice(null), 2600));
      return;
    }
    setLoadingId(game.id);
    timers.current.push(
      setTimeout(() => {
        setLoadingId(null);
        onOpenGame(game.id);
      }, 2200),
    );
  }

  return (
    <MotionConfig reducedMotion="user">
    <div className="dojo-home">
    <div className="relative h-dvh w-screen overflow-hidden">
      {/* Background */}
      <img src={ninjaHouseBg} alt="" aria-hidden className="absolute inset-0 h-full w-full object-cover object-center" />
      <div className="absolute inset-0" style={{ background: "rgba(4,10,30,0.55)" }} />

      {/* Back button */}
      <motion.button
        whileHover={{ scale: 1.08 }}
        whileTap={{ scale: 0.94 }}
        onClick={onBack}
        aria-label="Balik ke halaman utama"
        className="absolute left-5 top-5 z-20 grid h-11 w-11 place-items-center rounded-full border-2 border-white/20 bg-black/40 text-white backdrop-blur-sm"
      >
        <ArrowLeft className="h-5 w-5" strokeWidth={2.5} />
      </motion.button>

      {/* Mute button */}
      <motion.button
        whileHover={{ scale: 1.08 }}
        whileTap={{ scale: 0.94 }}
        onClick={onToggleSound}
        role="switch"
        aria-checked={sound}
        aria-label="Bunyi"
        className="absolute right-5 top-5 z-20 grid h-11 w-11 place-items-center rounded-full border-2 border-white/20 bg-black/40 text-white backdrop-blur-sm"
      >
        {sound ? <Volume2 className="h-5 w-5" strokeWidth={2.5} /> : <VolumeX className="h-5 w-5" strokeWidth={2.5} />}
      </motion.button>

      {/* Title */}
      <div className="relative z-10 flex flex-col items-center pt-10">
        <motion.h1
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="font-display text-3xl font-black uppercase tracking-widest text-white drop-shadow-2xl"
          style={{ textShadow: "0 2px 20px rgba(0,0,0,0.8)" }}
        >
          Permainan Mini
        </motion.h1>
        <motion.div
          initial={{ scaleX: 0 }}
          animate={{ scaleX: 1 }}
          transition={{ delay: 0.3, duration: 0.4 }}
          className="mt-2 h-1 w-24 rounded-full"
          style={{ background: "linear-gradient(90deg,#f59e0b,#fbbf24)" }}
        />
      </div>

      {/* Game cards */}
      <div className="relative z-10 flex h-full items-center justify-center gap-8 px-10 pb-16">
        {GAMES.map((game, i) => (
          <motion.div
            key={game.id}
            initial={{ opacity: 0, y: 40, scale: 0.88 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ delay: 0.15 + i * 0.12, duration: 0.45, ease: [0.34, 1.3, 0.64, 1] }}
            className="flex flex-col items-center gap-4"
          >
            {/* Card */}
            <motion.button
              whileHover={game.available ? { scale: 1.06, y: -8 } : {}}
              whileTap={game.available ? { scale: 0.96 } : {}}
              onClick={() => handlePlay(game)}
              className="relative flex h-52 w-44 flex-col items-center justify-center overflow-hidden rounded-3xl border-4 shadow-2xl"
              style={{
                background: game.bg,
                borderColor: game.available ? game.color + "88" : "rgba(255,255,255,0.1)",
                boxShadow: game.available
                  ? `0 0 30px ${game.color}44, 0 8px 32px rgba(0,0,0,0.6)`
                  : "0 8px 32px rgba(0,0,0,0.6)",
                cursor: game.available ? "pointer" : "not-allowed",
                opacity: game.available ? 1 : 0.6,
              }}
            >
              {/* Shimmer */}
              {game.available && (
                <motion.div
                  className="pointer-events-none absolute inset-0 rounded-3xl"
                  style={{ background: `linear-gradient(135deg, ${game.color}22 0%, transparent 60%)` }}
                  animate={{ opacity: [0.5, 1, 0.5] }}
                  transition={{ duration: 2.5, repeat: Infinity }}
                />
              )}

              {/* Coming soon overlay */}
              {!game.available && (
                <div className="absolute inset-0 z-10 flex items-center justify-center rounded-3xl bg-black/50">
                  <span className="rounded-full bg-white/10 px-3 py-1 text-xs font-black uppercase tracking-widest text-white/60">
                    Akan Datang
                  </span>
                </div>
              )}

              {/* Emoji icon */}
              <motion.div
                animate={game.available ? { y: [0, -6, 0] } : {}}
                transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
                className="text-6xl drop-shadow-2xl"
                style={{ filter: `drop-shadow(0 0 16px ${game.color}88)` }}
              >
                {game.emoji}
              </motion.div>

              {/* Glow bottom */}
              <motion.div
                className="pointer-events-none absolute bottom-0 left-1/2 h-20 w-32 -translate-x-1/2 rounded-full blur-2xl"
                style={{ background: game.color + "55" }}
                animate={{ opacity: [0.4, 0.9, 0.4] }}
                transition={{ duration: 2.5, repeat: Infinity }}
              />
            </motion.button>

            {/* Name pill */}
            <motion.div
              whileHover={game.available ? { scale: 1.05 } : {}}
              className="rounded-2xl border-2 border-white/20 bg-white/90 px-5 py-2 shadow-lg backdrop-blur-sm"
            >
              <p className="font-display text-sm font-black uppercase tracking-wider text-gray-800">
                {game.name}
              </p>
            </motion.div>
          </motion.div>
        ))}
      </div>

      {/* Loading overlay */}
      <AnimatePresence>
        {loadingId && (
          <motion.div
            className="absolute inset-0 z-50 flex flex-col items-center justify-center"
            style={{ background: "rgba(4,10,30,0.92)" }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            {/* Spinning shuriken */}
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 0.8, repeat: Infinity, ease: "linear" }}
              className="text-7xl"
            >
              ✦
            </motion.div>

            <motion.p
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="mt-6 font-display text-xl font-black uppercase tracking-widest text-white"
            >
              {GAMES.find(g => g.id === loadingId)?.name}
            </motion.p>

            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6 }}
              className="mt-2 text-sm font-semibold text-white/50"
            >
              Memuatkan permainan...
            </motion.p>

            {/* Loading bar */}
            <div className="mt-6 h-1.5 w-48 overflow-hidden rounded-full bg-white/10">
              <motion.div
                className="h-full rounded-full"
                style={{ background: "linear-gradient(90deg,#f59e0b,#fbbf24)" }}
                initial={{ width: "0%" }}
                animate={{ width: "100%" }}
                transition={{ duration: 2, ease: "easeInOut" }}
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Makluman "akan datang" */}
      <div className="pointer-events-none absolute inset-x-0 bottom-6 z-[60] flex justify-center" role="status" aria-live="polite">
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
