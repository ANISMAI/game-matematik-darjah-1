// Darjah 4 · Halangan. Disalin daripada ninja-math-dojo (src/routes/halangan.tsx).
// Perubahan: tiada router (navigasi melalui props), gambar WebP, bunyi ikut tetapan game.
import { MotionConfig } from "framer-motion";
import { DodgeCatch } from "./DodgeCatch";
import { MemoryFlip } from "./MemoryFlip";
import "../home/dojo.css";

const ninjaHouseBg = "/home/darjah4/rumah-ninja.webp";

// OBSTACLE_PATHS index → mini game component
// index 0 = halangan 1 (DodgeCatch)
// index 3 = halangan 2 (MemoryFlip)
// index 6 = halangan 3 (TBD)
const OBSTACLE_GAMES: Record<number, "dodge" | "memory"> = {
  0: "dodge",
  3: "memory",
};

type HalanganProps = {
  sound: boolean;
  onExit: () => void;
};

export default function HalanganPage({ sound, onExit }: HalanganProps) {
  const obstacleIndex = parseInt(localStorage.getItem("obstacleIndex") ?? "0");
  const gameType = OBSTACLE_GAMES[obstacleIndex] ?? "dodge";

  function handleClear() {
    localStorage.setItem("minigameCleared", "true");
    onExit();
  }

  return (
    <MotionConfig reducedMotion="user">
      <div className="dojo-home">
        <div className="relative h-dvh w-screen overflow-hidden bg-[#061020]">
          <img
            src={ninjaHouseBg}
            alt=""
            aria-hidden
            className="absolute inset-0 h-full w-full object-cover object-center opacity-30"
          />
          <div className="absolute inset-0 bg-[#061020]/60" />
          <div className="relative z-10 flex h-full items-center justify-center">
            {gameType === "dodge" && <DodgeCatch onClear={handleClear} onClose={onExit} sound={sound} />}
            {gameType === "memory" && (
              <div className="relative h-full w-full max-w-2xl rounded-2xl">
                <MemoryFlip onClear={handleClear} onClose={onExit} sound={sound} />
              </div>
            )}
          </div>
        </div>
      </div>
    </MotionConfig>
  );
}
