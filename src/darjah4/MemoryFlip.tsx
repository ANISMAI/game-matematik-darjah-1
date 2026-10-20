import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
const shurikenImg = "/home/darjah4/shuriken.webp";
const scrollImg = "/home/darjah4/skrol-tutup.webp";
const bottleImg = "/home/darjah4/botol-skrol.webp";
const fishImg = "/home/darjah4/ikan.webp";
const shipImg = "/home/darjah4/kapal.webp";
const arrowImg = "/home/darjah4/anak-panah.webp";
const crackImg = "/home/darjah4/retak.webp";
const ninjaAvatarImg = "/home/darjah4/avatar-ninja.webp";
import clickSound from "../home/assets/sounds/click-sound.mp3";
import dingSound from "../home/assets/sounds/ding-sound.mp3";
import taikoDrumSound from "../home/assets/sounds/taiko-drum-sound.mp3";

let sfxOn = true;
const playClick = () => sfxOn && new Audio(clickSound).play().catch(() => {});
const playDing = () => sfxOn && new Audio(dingSound).play().catch(() => {});
const playDrum = () => sfxOn && new Audio(taikoDrumSound).play().catch(() => {});

const CARD_ITEMS = [
  { id: "shuriken", src: shurikenImg, label: "Shuriken" },
  { id: "scroll", src: scrollImg, label: "Scroll" },
  { id: "bottle", src: bottleImg, label: "Botol" },
  { id: "fish", src: fishImg, label: "Ikan" },
  { id: "ship", src: shipImg, label: "Kapal" },
  { id: "arrow", src: arrowImg, label: "Anak Panah" },
  { id: "crack", src: crackImg, label: "Retak" },
  { id: "ninja", src: ninjaAvatarImg, label: "Ninja" },
];

const TOTAL_PAIRS = 6;
const TIME_LIMIT = 60;

interface Card {
  uid: string;
  itemId: string;
  src: string;
  label: string;
  isFlipped: boolean;
  isMatched: boolean;
}

interface Props {
  onClear: () => void;
  onClose: () => void;
  sound?: boolean;
}

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function buildDeck(): Card[] {
  const chosen = shuffle(CARD_ITEMS).slice(0, TOTAL_PAIRS);
  const pairs = chosen.flatMap((item) => [
    { uid: `${item.id}-a`, itemId: item.id, src: item.src, label: item.label, isFlipped: false, isMatched: false },
    { uid: `${item.id}-b`, itemId: item.id, src: item.src, label: item.label, isFlipped: false, isMatched: false },
  ]);
  return shuffle(pairs);
}

export function MemoryFlip({ onClear, onClose, sound = true }: Props) {
  sfxOn = sound;
  const [deck, setDeck] = useState<Card[]>(buildDeck);
  const [flippedUids, setFlippedUids] = useState<string[]>([]);
  const [matchedCount, setMatchedCount] = useState(0);
  const [timeLeft, setTimeLeft] = useState(TIME_LIMIT);
  const [phase, setPhase] = useState<"intro" | "playing" | "win" | "lose">("intro");
  const [lockBoard, setLockBoard] = useState(false);
  const [wrongPair, setWrongPair] = useState<string[]>([]);
  const [combo, setCombo] = useState(0);
  const [showCombo, setShowCombo] = useState(false);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (phase !== "playing") return;

    timerRef.current = setInterval(() => {
      setTimeLeft((t) => {
        if (t <= 1) {
          clearInterval(timerRef.current!);
          setPhase("lose");
          playDrum();
          return 0;
        }
        return t - 1;
      });
    }, 1000);

    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [phase]);

  function startGame() {
    setDeck(buildDeck());
    setFlippedUids([]);
    setMatchedCount(0);
    setTimeLeft(TIME_LIMIT);
    setPhase("playing");
    setLockBoard(false);
    setCombo(0);
  }

  function flipCard(uid: string) {
    if (lockBoard || phase !== "playing") return;
    const card = deck.find((c) => c.uid === uid);
    if (!card || card.isFlipped || card.isMatched) return;

    playClick();

    const newFlipped = [...flippedUids, uid];
    setFlippedUids(newFlipped);
    setDeck((prev) => prev.map((c) => c.uid === uid ? { ...c, isFlipped: true } : c));

    if (newFlipped.length === 2) {
      setLockBoard(true);
      const [uid1, uid2] = newFlipped;
      const card1 = deck.find((c) => c.uid === uid1)!;
      const card2 = deck.find((c) => c.uid === uid2)!;

      if (card1.itemId === card2.itemId) {
        // match!
        playDing();
        const newCombo = combo + 1;
        setCombo(newCombo);
        if (newCombo >= 2) {
          setShowCombo(true);
          setTimeout(() => setShowCombo(false), 1200);
        }
        setDeck((prev) =>
          prev.map((c) =>
            c.uid === uid1 || c.uid === uid2 ? { ...c, isMatched: true } : c,
          ),
        );
        const newMatched = matchedCount + 1;
        setMatchedCount(newMatched);
        setFlippedUids([]);
        setLockBoard(false);

        if (newMatched === TOTAL_PAIRS) {
          clearInterval(timerRef.current!);
          setTimeout(() => setPhase("win"), 400);
        }
      } else {
        // no match
        setCombo(0);
        setWrongPair([uid1, uid2]);
        setTimeout(() => {
          setDeck((prev) =>
            prev.map((c) =>
              c.uid === uid1 || c.uid === uid2 ? { ...c, isFlipped: false } : c,
            ),
          );
          setFlippedUids([]);
          setWrongPair([]);
          setLockBoard(false);
        }, 900);
      }
    }
  }

  const timerPct = (timeLeft / TIME_LIMIT) * 100;
  const timerColor = timeLeft > 20 ? "#4CAF50" : timeLeft > 10 ? "#F9E04B" : "#ef4444";

  return (
    <div className="relative flex h-full w-full flex-col items-center justify-center px-2 py-4">

      {/* Intro screen */}
      <AnimatePresence>
        {phase === "intro" && (
          <motion.div
            className="absolute inset-0 z-20 flex flex-col items-center justify-center gap-5 rounded-2xl bg-[#061534]/90 px-6 text-center backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              animate={{ rotate: [0, -10, 10, -6, 0] }}
              transition={{ duration: 1.2, repeat: Infinity, repeatDelay: 2 }}
              className="text-6xl"
            >
              🃏
            </motion.div>
            <h2 className="font-display text-3xl font-black text-white">
              Ingatan Ninja!
            </h2>
            <p className="max-w-xs font-bold leading-relaxed text-white/75">
              Padankan semua pasangan kad dalam masa <span className="text-ninja-yellow font-black">{TIME_LIMIT} saat</span>.<br />
              Flip 2 kad — kalau sama, ia kekal terbuka!
            </p>
            <div className="flex gap-3">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={startGame}
                className="rounded-2xl border-[3px] border-[#7c2d12] px-8 py-3 font-display font-black text-white shadow-lg"
                style={{ background: "var(--gradient-orange)" }}
              >
                Mula!
              </motion.button>
              <button
                onClick={onClose}
                className="rounded-2xl border-2 border-white/20 bg-white/10 px-6 py-3 font-bold text-white/70 hover:bg-white/20"
              >
                Keluar
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Win screen */}
      <AnimatePresence>
        {phase === "win" && (
          <motion.div
            className="absolute inset-0 z-20 flex flex-col items-center justify-center gap-4 rounded-2xl bg-[#061534]/90 px-6 text-center backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            {["⭐", "🌟", "✨"].map((s, i) => (
              <motion.span
                key={i}
                className="absolute text-4xl"
                style={{ left: `${20 + i * 30}%`, top: "15%" }}
                initial={{ opacity: 0, y: 20, scale: 0 }}
                animate={{ opacity: [0, 1, 0], y: -60, scale: [0, 1.5, 0] }}
                transition={{ duration: 1.2, delay: i * 0.2 }}
              />
            ))}
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", bounce: 0.6, delay: 0.1 }}
              className="text-6xl"
            >
              🎉
            </motion.div>
            <h2 className="font-display text-3xl font-black text-ninja-yellow">
              Tahniah Ninja!
            </h2>
            <p className="font-bold text-white/80">
              Kamu berjaya padankan semua kad!<br />
              Masa tinggal: <span className="text-ninja-yellow font-black">{timeLeft}s</span>
            </p>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={onClear}
              className="rounded-2xl border-[3px] border-[#7c2d12] px-10 py-3 font-display font-black text-white shadow-lg"
              style={{ background: "var(--gradient-orange)" }}
            >
              Teruskan Perjalanan!
            </motion.button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Lose screen */}
      <AnimatePresence>
        {phase === "lose" && (
          <motion.div
            className="absolute inset-0 z-20 flex flex-col items-center justify-center gap-4 rounded-2xl bg-[#061534]/90 px-6 text-center backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              animate={{ rotate: [0, -15, 15, 0] }}
              transition={{ duration: 0.4, repeat: 2 }}
              className="text-6xl"
            >
              💀
            </motion.div>
            <h2 className="font-display text-3xl font-black text-red-400">Masa Habis!</h2>
            <p className="font-bold text-white/75">
              {matchedCount}/{TOTAL_PAIRS} pasangan dijumpai.
            </p>
            <div className="flex gap-3">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={startGame}
                className="rounded-2xl border-[3px] border-[#7c2d12] px-8 py-3 font-display font-black text-white shadow-lg"
                style={{ background: "var(--gradient-orange)" }}
              >
                Cuba Lagi
              </motion.button>
              <button
                onClick={onClose}
                className="rounded-2xl border-2 border-white/20 bg-white/10 px-6 py-3 font-bold text-white/70 hover:bg-white/20"
              >
                Keluar
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* HUD */}
      {phase === "playing" && (
        <div className="mb-3 flex w-full max-w-lg items-center gap-3 px-1">
          {/* Timer bar */}
          <div className="flex-1">
            <div className="mb-1 flex justify-between text-xs font-black text-white/70">
              <span>Masa</span>
              <span style={{ color: timerColor }}>{timeLeft}s</span>
            </div>
            <div className="h-3 w-full overflow-hidden rounded-full bg-white/10">
              <motion.div
                className="h-full rounded-full transition-all"
                style={{ width: `${timerPct}%`, background: timerColor }}
                animate={{ width: `${timerPct}%` }}
              />
            </div>
          </div>

          {/* Progress */}
          <div className="rounded-2xl border-2 border-ninja-yellow/40 bg-ninja-yellow/10 px-3 py-1.5 text-center">
            <p className="text-[10px] font-black uppercase text-ninja-yellow/70">Pasangan</p>
            <p className="font-display text-base font-black text-ninja-yellow">
              {matchedCount}/{TOTAL_PAIRS}
            </p>
          </div>
        </div>
      )}

      {/* Combo popup */}
      <AnimatePresence>
        {showCombo && (
          <motion.div
            className="absolute top-16 z-30 rounded-2xl border-2 border-ninja-yellow bg-ninja-yellow/20 px-5 py-2 font-display text-lg font-black text-ninja-yellow shadow-lg"
            initial={{ scale: 0, opacity: 0, y: 10 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0, opacity: 0, y: -10 }}
          >
            🔥 Kombo x{combo}!
          </motion.div>
        )}
      </AnimatePresence>

      {/* Card grid */}
      <div className="grid w-full max-w-lg grid-cols-4 gap-2 sm:gap-3">
        {deck.map((card) => {
          const isWrong = wrongPair.includes(card.uid);
          return (
            <motion.button
              key={card.uid}
              onClick={() => flipCard(card.uid)}
              disabled={card.isMatched || card.isFlipped || lockBoard || phase !== "playing"}
              className="relative aspect-square rounded-xl focus:outline-none"
              whileHover={
                !card.isFlipped && !card.isMatched && phase === "playing"
                  ? { scale: 1.05, y: -3 }
                  : {}
              }
              whileTap={
                !card.isFlipped && !card.isMatched && phase === "playing"
                  ? { scale: 0.96 }
                  : {}
              }
              animate={isWrong ? { x: [0, -6, 6, -4, 0] } : {}}
              transition={isWrong ? { duration: 0.35 } : {}}
            >
              {/* Card back */}
              <motion.div
                className="absolute inset-0 rounded-xl"
                style={{
                  background: "linear-gradient(135deg, #0B3D91, #061534)",
                  border: "2px solid rgba(255,255,255,0.12)",
                  backfaceVisibility: "hidden",
                }}
                animate={{ rotateY: card.isFlipped || card.isMatched ? 90 : 0 }}
                transition={{ duration: 0.2 }}
              >
                <div className="flex h-full items-center justify-center">
                  <img src={shurikenImg} alt="" className="h-8 w-8 opacity-30" />
                </div>
              </motion.div>

              {/* Card front */}
              <motion.div
                className="absolute inset-0 rounded-xl"
                style={{
                  background: card.isMatched
                    ? "linear-gradient(135deg, #14532d, #166534)"
                    : isWrong
                      ? "linear-gradient(135deg, #7f1d1d, #991b1b)"
                      : "linear-gradient(135deg, #7c3aed, #4c1d95)",
                  border: card.isMatched
                    ? "2px solid #4ade80"
                    : isWrong
                      ? "2px solid #ef4444"
                      : "2px solid rgba(167,139,250,0.4)",
                  backfaceVisibility: "hidden",
                }}
                animate={{ rotateY: card.isFlipped || card.isMatched ? 0 : -90 }}
                initial={{ rotateY: -90 }}
                transition={{ duration: 0.2, delay: 0.18 }}
              >
                <div className="flex h-full items-center justify-center p-2">
                  <img
                    src={card.src}
                    alt={card.label}
                    className="h-full w-full object-contain drop-shadow-lg"
                  />
                </div>
                {card.isMatched && (
                  <motion.div
                    className="absolute inset-0 flex items-center justify-center rounded-xl bg-green-500/20"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                  >
                    <span className="text-2xl">✅</span>
                  </motion.div>
                )}
              </motion.div>
            </motion.button>
          );
        })}
      </div>
    </div>
  );
}
