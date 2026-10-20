import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
const shurikenImg = "/home/darjah4/shuriken.webp";
const ninjaHouseBg = "/home/darjah4/rumah-ninja.webp";
import sliceFruitSound from "../home/assets/sounds/slice-fruit-sound.mp3";
import bombSound from "../home/assets/sounds/bomb-sound.mp3";

interface Props {
  onClear: () => void;
  onClose: () => void;
  sound?: boolean;
}

interface FlyingObject {
  id: number;
  type: "fruit" | "bomb";
  emoji: string;
  x: number; // % dari lebar
  startY: number; // pixel dari bawah
  peakY: number; // pixel dari bawah (puncak lontaran)
  duration: number; // ms untuk sampai puncak
  spawnTime: number;
  sliced: boolean;
  exploded: boolean;
  hit: boolean;
  hitX?: number;
  hitY?: number;
}

interface ShurikenFly {
  id: number;
  fromX: number;
  fromY: number;
  toX: number;
  toY: number;
}

interface Particle {
  id: number;
  x: number;
  y: number;
  angle: number;
  color: string;
  emoji?: string;
}

interface Splat {
  id: number;
  x: number;
  y: number;
  color: string;
  size: number;
  rotation: number;
  shape: number; // 0-3 untuk pilih shape berbeza
}

interface ScorePopup {
  id: number;
  x: number;
  y: number;
  text: string;
  color: string;
}

const FRUITS = ["🍎", "🍊", "🍋", "🍇", "🍓", "🍍", "🥭", "🍉"];
const FRUIT_COLORS: Record<string, string> = {
  "🍎": "#e53e3e",
  "🍊": "#ed8936",
  "🍋": "#ecc94b",
  "🍇": "#805ad5",
  "🍓": "#fc8181",
  "🍍": "#d69e2e",
  "🥭": "#f6ad55",
  "🍉": "#48bb78",
};
const SLICE_TARGET = 8;
const MAX_LIVES = 3;
const GAME_TIME = 60;

export function DodgeCatch({ onClear, onClose, sound = true }: Props) {
  const [objects, setObjects] = useState<FlyingObject[]>([]);
  const [shurikenFlies, setShurikenFlies] = useState<ShurikenFly[]>([]);
  const [particles, setParticles] = useState<Particle[]>([]);
  const [scorePopups, setScorePopups] = useState<ScorePopup[]>([]);
  const [splats, setSplats] = useState<Splat[]>([]);
  const [sliced, setSliced] = useState(0);
  const [lives, setLives] = useState(MAX_LIVES);
  const [combo, setCombo] = useState(0);
  const [shake, setShake] = useState(false);
  const [phase, setPhase] = useState<"countdown" | "playing" | "win" | "lose">("countdown");
  const [countdown, setCountdown] = useState(3);
  const [timeLeft, setTimeLeft] = useState(GAME_TIME);
  const idRef = useRef(0);
  const areaRef = useRef<HTMLDivElement>(null);
  const spawnRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const slicedRef = useRef(0);

  useEffect(() => {
    slicedRef.current = sliced;
  }, [sliced]);

  // countdown
  useEffect(() => {
    if (countdown <= 0) {
      setPhase("playing");
      return;
    }
    const id = setTimeout(() => setCountdown((c) => c - 1), 1000);
    return () => clearTimeout(id);
  }, [countdown]);

  // spawn objects
  useEffect(() => {
    if (phase !== "playing") return;
    const spawn = () => {
      const area = areaRef.current;
      if (!area) return;
      const isBomb = Math.random() < 0.25;
      const emoji = isBomb ? "💣" : FRUITS[Math.floor(Math.random() * FRUITS.length)];
      const x = 10 + Math.random() * 80; // 10-90%
      const peakY = area.clientHeight * (0.2 + Math.random() * 0.4); // peak 20-60% dari atas
      const duration = 1800 + Math.random() * 800;

      setObjects((prev) => [
        ...prev,
        {
          id: idRef.current++,
          type: isBomb ? "bomb" : "fruit",
          emoji,
          x,
          startY: area.clientHeight + 40,
          peakY,
          duration,
          spawnTime: Date.now(),
          sliced: false,
          hit: false,
          exploded: false,
        },
      ]);
    };

    const interval = Math.max(700, 1400 - sliced * 40);
    spawnRef.current = setInterval(spawn, interval);
    return () => {
      if (spawnRef.current) clearInterval(spawnRef.current);
    };
  }, [phase, sliced]);

  // remove objects yang dah lepas puncak dan turun balik
  useEffect(() => {
    if (phase !== "playing") return;
    const id = setInterval(() => {
      setObjects((prev) =>
        prev.filter((o) => {
          if (o.sliced || o.exploded) return false;
          const elapsed = Date.now() - o.spawnTime;
          return elapsed < o.duration * 2;
        }),
      );
    }, 100);
    return () => clearInterval(id);
  }, [phase]);

  // check win/lose
  useEffect(() => {
    if (sliced >= SLICE_TARGET) setPhase("win");
  }, [sliced]);
  useEffect(() => {
    if (lives <= 0) setPhase("lose");
  }, [lives]);

  // timer countdown
  useEffect(() => {
    if (phase !== "playing") return;
    if (timeLeft <= 0) {
      setPhase("lose");
      return;
    }
    const id = setTimeout(() => setTimeLeft((t) => t - 1), 1000);
    return () => clearTimeout(id);
  }, [phase, timeLeft]);

  function spawnSplat(x: number, y: number, color: string) {
    // spawn beberapa splat kecil sekeliling titik impact
    const count = 4 + Math.floor(Math.random() * 3);
    const newSplats: Splat[] = Array.from({ length: count }, (_) => ({
      id: idRef.current++,
      x: x + (Math.random() - 0.5) * 80,
      y: y + (Math.random() - 0.5) * 80,
      color,
      size: 40 + Math.random() * 60,
      rotation: Math.random() * 360,
      shape: Math.floor(Math.random() * 4),
    }));
    setSplats((prev) => [...prev, ...newSplats]);
    // fade out selepas 2.5 saat
    setTimeout(() => {
      setSplats((prev) => prev.filter((s) => !newSplats.find((ns) => ns.id === s.id)));
    }, 2500);
  }

  function spawnParticles(x: number, y: number, color: string, emojis?: string[]) {
    const count = emojis ? emojis.length : 8;
    const newParticles: Particle[] = Array.from({ length: count }, (_, i) => ({
      id: idRef.current++,
      x,
      y,
      angle: (i / count) * 360,
      color,
      emoji: emojis?.[i % emojis.length],
    }));
    setParticles((prev) => [...prev, ...newParticles]);
    setTimeout(() => {
      setParticles((prev) => prev.filter((p) => !newParticles.find((np) => np.id === p.id)));
    }, 700);
  }

  function spawnScorePopup(x: number, y: number, text: string, color: string) {
    const popup = { id: idRef.current++, x, y, text, color };
    setScorePopups((prev) => [...prev, popup]);
    setTimeout(() => setScorePopups((prev) => prev.filter((p) => p.id !== popup.id)), 900);
  }

  function handleObjectClick(obj: FlyingObject) {
    if (phase !== "playing" || obj.sliced || obj.exploded) return;
    const area = areaRef.current;
    if (!area) return;

    const w = area.clientWidth;
    const h = area.clientHeight;
    const elapsed = Date.now() - obj.spawnTime;
    const progress = Math.min(elapsed / obj.duration, 1);
    const objX = (obj.x / 100) * w;
    const objY = h - (h - obj.peakY) * Math.sin(progress * Math.PI);

    // play sound ikut jenis
    if (sound) new Audio(obj.type === "fruit" ? sliceFruitSound : bombSound).play().catch(() => {});

    // freeze + simpan posisi semasa + mark hit
    setObjects((prev) =>
      prev.map((o) => (o.id === obj.id ? { ...o, hit: true, hitX: objX, hitY: objY } : o)),
    );

    // shuriken terbang dari bawah tengah ke buah
    const fromX = w / 2;
    const fromY = h + 20;
    const flyId = idRef.current++;
    setShurikenFlies((prev) => [...prev, { id: flyId, fromX, fromY, toX: objX, toY: objY }]);

    const SHURIKEN_DURATION = 380;

    // bila shuriken sampai ke buah — baru effect dan markah
    setTimeout(() => {
      setShurikenFlies((prev) => prev.filter((s) => s.id !== flyId));

      if (obj.type === "fruit") {
        // jus terkeluar — particles warna ikut buah
        const juice = FRUIT_COLORS[obj.emoji] ?? "#fbbf24";
        spawnParticles(objX, objY, juice, ["💦", "💦", "✨", "✨"]);
        spawnSplat(objX, objY, juice);
        // tambah lagi particles jus
        const extraParticles: Particle[] = Array.from({ length: 12 }, (_, i) => ({
          id: idRef.current++,
          x: objX,
          y: objY,
          angle: (i / 12) * 360,
          color: juice,
        }));
        setParticles((prev) => [...prev, ...extraParticles]);
        setTimeout(
          () =>
            setParticles((prev) =>
              prev.filter((p) => !extraParticles.find((ep) => ep.id === p.id)),
            ),
          700,
        );

        // mark sliced dan buang
        setObjects((prev) => prev.map((o) => (o.id === obj.id ? { ...o, sliced: true } : o)));
        setTimeout(() => setObjects((prev) => prev.filter((o) => o.id !== obj.id)), 350);

        const newSliced = slicedRef.current + 1;
        const newCombo = combo + 1;
        setSliced(newSliced);
        setCombo(newCombo);
        const txt = newCombo >= 3 ? `COMBO x${newCombo}! 🔥` : `+1`;
        spawnScorePopup(objX, objY - 30, txt, newCombo >= 3 ? "#facc15" : "#4ade80");
      } else {
        // bom explosion
        spawnParticles(objX, objY, "#ef4444");
        setObjects((prev) => prev.map((o) => (o.id === obj.id ? { ...o, exploded: true } : o)));
        setTimeout(() => setObjects((prev) => prev.filter((o) => o.id !== obj.id)), 350);

        setLives((l) => l - 1);
        setCombo(0);
        setShake(true);
        spawnScorePopup(objX, objY - 30, "💥 BOM!", "#ef4444");
        setTimeout(() => setShake(false), 500);
      }
    }, SHURIKEN_DURATION);
  }

  function retry() {
    setObjects([]);
    setShurikenFlies([]);
    setParticles([]);
    setScorePopups([]);
    setSliced(0);
    setLives(MAX_LIVES);
    setCombo(0);
    setCountdown(3);
    setTimeLeft(GAME_TIME);
    setPhase("countdown");
  }

  return (
    <motion.div
      className="flex w-full max-w-5xl flex-col overflow-hidden rounded-3xl border-4 border-[#7c2d12] bg-[#0a1628] shadow-[0_0_40px_rgba(0,0,0,0.8)]"
      initial={{ scale: 0.85, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ duration: 0.35, ease: [0.34, 1.56, 0.64, 1] }}
    >
      {/* header */}
      <div className="flex items-center justify-between border-b border-white/10 bg-[#0d1f3c] px-5 py-3">
        <div>
          <p className="font-display text-xs font-black uppercase tracking-widest text-[#facc15]">
            Mini Game
          </p>
          <h2 className="font-display text-lg font-black text-white">Fruit Slash! 🍎⚔️</h2>
        </div>

        {/* timer */}
        <motion.div
          className={`flex h-12 w-16 flex-col items-center justify-center rounded-2xl border-2 font-display font-black ${
            timeLeft <= 10
              ? "border-red-400 bg-red-900/50 text-red-300"
              : "border-white/20 bg-white/10 text-white"
          }`}
          animate={timeLeft <= 10 && phase === "playing" ? { scale: [1, 1.08, 1] } : {}}
          transition={{ duration: 0.5, repeat: timeLeft <= 10 ? Infinity : 0 }}
        >
          <span className="text-xs opacity-60">MASA</span>
          <span className="text-xl leading-none">{timeLeft}</span>
        </motion.div>

        {/* lives */}
        <div className="flex items-center gap-1">
          {Array.from({ length: MAX_LIVES }, (_, i) => (
            <motion.span
              key={i}
              animate={i >= lives ? { scale: [1, 1.4, 0] } : {}}
              className="text-2xl"
            >
              {i < lives ? "❤️" : "🖤"}
            </motion.span>
          ))}
        </div>

        {/* score + combo */}
        <div className="flex items-center gap-3">
          <motion.span
            key={sliced}
            initial={{ scale: 1.4 }}
            animate={{ scale: 1 }}
            className="font-display text-lg font-black text-green-400"
          >
            🍎 {sliced}/{SLICE_TARGET}
          </motion.span>
          <AnimatePresence>
            {combo >= 2 && (
              <motion.span
                key={combo}
                initial={{ scale: 1.5, opacity: 0, y: -10 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                exit={{ scale: 0, opacity: 0 }}
                className="rounded-lg bg-yellow-400 px-2 py-0.5 font-display text-sm font-black text-[#5b2509]"
              >
                🔥 x{combo}
              </motion.span>
            )}
          </AnimatePresence>
        </div>

        <button
          onClick={onClose}
          className="grid h-8 w-8 place-items-center rounded-full bg-white/10 text-white hover:bg-white/20"
        >
          ✕
        </button>
      </div>

      {/* arahan */}
      <div className="flex justify-center gap-8 bg-[#0d1f3c]/60 px-5 py-2 text-xs font-black">
        <span className="text-green-400">🍎 Klik buah = potong!</span>
        <span className="text-red-400">💣 Jangan klik bom!</span>
      </div>

      {/* game area */}
      <motion.div
        ref={areaRef}
        className="relative w-full overflow-hidden"
        style={{ height: "60vh", cursor: "crosshair" }}
        animate={shake ? { x: [-10, 10, -8, 8, -5, 5, 0] } : {}}
        transition={{ duration: 0.4 }}
      >
        {/* background */}
        <img
          src={ninjaHouseBg}
          alt=""
          className="absolute inset-0 h-full w-full object-cover opacity-25"
        />
        <div className="absolute inset-0 bg-[#061020]/65" />

        {/* countdown */}
        <AnimatePresence>
          {phase === "countdown" && (
            <motion.div
              className="absolute inset-0 z-20 flex items-center justify-center bg-black/70"
              exit={{ opacity: 0 }}
            >
              <motion.span
                key={countdown}
                className="font-display text-9xl font-black text-white drop-shadow-[0_0_30px_rgba(250,204,21,0.9)]"
                initial={{ scale: 2.5, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.2, opacity: 0 }}
                transition={{ duration: 0.4 }}
              >
                {countdown === 0 ? "GO!" : countdown}
              </motion.span>
            </motion.div>
          )}
        </AnimatePresence>

        {/* win */}
        <AnimatePresence>
          {phase === "win" && (
            <motion.div
              className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-green-900/85"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              <motion.div
                initial={{ scale: 0, rotate: -15 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ type: "spring", bounce: 0.6 }}
                className="text-center"
              >
                <p className="text-7xl">🎉</p>
                <p className="mt-2 font-display text-3xl font-black text-white">Berjaya!</p>
                <p className="text-green-300">Laluan dibuka!</p>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={onClear}
                  className="mt-5 rounded-2xl border-2 border-white/30 bg-white/20 px-8 py-3 font-display text-lg font-black text-white shadow-lg hover:bg-white/30"
                >
                  Selesai
                </motion.button>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* lose */}
        <AnimatePresence>
          {phase === "lose" && (
            <motion.div
              className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-red-900/85"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", bounce: 0.5 }}
                className="text-center"
              >
                <p className="text-7xl">💀</p>
                <p className="mt-2 font-display text-3xl font-black text-white">Gagal!</p>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={retry}
                  className="mt-4 rounded-2xl border-2 border-white/30 bg-white/20 px-8 py-3 font-display text-lg font-black text-white"
                >
                  Cuba Lagi
                </motion.button>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* splat tepek jus */}
        {splats.map((s) => {
          const paths = [
            "M50,10 C70,0 90,20 85,45 C95,55 80,80 60,75 C70,90 45,95 35,80 C20,90 5,70 15,50 C0,35 10,10 30,15 C35,0 50,10 50,10Z",
            "M55,5 C75,5 95,25 90,50 C100,65 80,85 60,80 C65,95 40,100 30,82 C15,90 0,68 10,48 C-5,30 10,8 30,12 C35,-2 55,5 55,5Z",
            "M50,8 C68,2 88,18 88,42 C98,58 82,82 58,78 C66,92 42,96 32,80 C16,88 2,66 12,46 C-2,28 12,6 32,12 C36,-2 50,8 50,8Z",
            "M52,6 C72,4 92,22 88,48 C96,62 78,84 56,78 C64,94 38,98 28,80 C12,88 0,64 12,44 C-4,26 10,4 32,10 C36,-4 52,6 52,6Z",
          ];
          return (
            <motion.svg
              key={s.id}
              className="pointer-events-none absolute z-[5]"
              style={{
                left: s.x - s.size / 2,
                top: s.y - s.size / 2,
                width: s.size,
                height: s.size,
                rotate: `${s.rotation}deg`,
              }}
              initial={{ opacity: 0.85, scale: 0.3 }}
              animate={{ opacity: 0, scale: 1 }}
              transition={{ duration: 2.5, ease: "easeOut" }}
            >
              <path d={paths[s.shape]} fill={s.color} opacity="0.75" />
            </motion.svg>
          );
        })}

        {/* flying objects */}
        {objects.map((obj) => {
          const area = areaRef.current;
          const areaH = area?.clientHeight ?? 400;
          const areaW = area?.clientWidth ?? 800;

          // kalau dah di-hit, guna posisi yang disimpan — tak bergerak
          const xPos = obj.hit && obj.hitX !== undefined ? obj.hitX : (obj.x / 100) * areaW;
          const yPos =
            obj.hit && obj.hitY !== undefined
              ? obj.hitY
              : (() => {
                  const elapsed = Date.now() - obj.spawnTime;
                  const t = elapsed / obj.duration;
                  return t <= 1
                    ? areaH - (areaH - obj.peakY) * Math.sin(t * Math.PI)
                    : obj.peakY + (elapsed - obj.duration) * 0.5;
                })();

          return (
            <motion.div
              key={obj.id}
              className="absolute z-10 select-none"
              style={{ left: xPos - 30, top: yPos - 30 }}
              initial={{ scale: 0 }}
              animate={
                obj.sliced
                  ? { scale: [1, 1.6, 0], rotate: [0, 60], opacity: [1, 1, 0] }
                  : obj.exploded
                    ? { scale: [1, 2.2, 0], opacity: [1, 0.5, 0] }
                    : obj.hit
                      ? { x: [-6, 6, -5, 5, -3, 3, 0], scale: [1, 1.1, 1] }
                      : { scale: 1, x: 0 }
              }
              transition={{ duration: obj.hit && !obj.sliced ? 0.35 : 0.3 }}
              onClick={() => handleObjectClick(obj)}
              whileHover={!obj.hit ? { scale: 1.15 } : {}}
            >
              <div className="cursor-pointer text-6xl drop-shadow-[0_4px_8px_rgba(0,0,0,0.6)] select-none">
                {obj.emoji}
              </div>
            </motion.div>
          );
        })}

        {/* shuriken flies */}
        {shurikenFlies.map((s) => (
          <motion.img
            key={s.id}
            src={shurikenImg}
            alt=""
            className="pointer-events-none absolute z-20 h-12 w-12 object-contain"
            style={{ left: 0, top: 0, filter: "drop-shadow(0 0 8px #facc15)" }}
            initial={{ x: s.fromX, y: s.fromY, rotate: 0, scale: 1.4, opacity: 1 }}
            animate={{ x: s.toX, y: s.toY, rotate: 900, scale: 0.8, opacity: 1 }}
            transition={{ duration: 0.35, ease: "easeIn" }}
          />
        ))}

        {/* particles */}
        {particles.map((p) => (
          <motion.div
            key={p.id}
            className="pointer-events-none absolute z-30"
            style={{ left: p.x, top: p.y }}
            initial={{ x: 0, y: 0, opacity: 1, scale: 1 }}
            animate={{
              x: Math.cos((p.angle * Math.PI) / 180) * 50,
              y: Math.sin((p.angle * Math.PI) / 180) * 50,
              opacity: 0,
              scale: 0,
            }}
            transition={{ duration: 0.6, ease: "easeOut" }}
          >
            {p.emoji ? (
              <span className="text-xl">{p.emoji}</span>
            ) : (
              <div className="h-2.5 w-2.5 rounded-full" style={{ background: p.color }} />
            )}
          </motion.div>
        ))}

        {/* score popups */}
        {scorePopups.map((p) => (
          <motion.div
            key={p.id}
            className="pointer-events-none absolute z-30 font-display text-xl font-black"
            style={{
              left: p.x - 30,
              top: p.y,
              color: p.color,
              textShadow: "0 2px 6px rgba(0,0,0,0.9)",
            }}
            initial={{ opacity: 1, y: 0, scale: 1 }}
            animate={{ opacity: 0, y: -60, scale: 1.4 }}
            transition={{ duration: 0.9, ease: "easeOut" }}
          >
            {p.text}
          </motion.div>
        ))}
      </motion.div>

      {/* progress bar */}
      <div className="bg-[#0d1f3c] px-5 py-3">
        <div className="h-4 w-full overflow-hidden rounded-full bg-white/10">
          <motion.div
            className="h-full rounded-full bg-gradient-to-r from-green-500 to-emerald-300"
            animate={{ width: `${(sliced / SLICE_TARGET) * 100}%` }}
            transition={{ duration: 0.2 }}
          />
        </div>
        <p className="mt-1 text-center text-xs font-black text-white/50">
          {phase === "playing" ? `Potong ${SLICE_TARGET - sliced} lagi buah!` : ""}
        </p>
      </div>
    </motion.div>
  );
}
