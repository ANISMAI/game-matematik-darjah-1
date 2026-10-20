// Darjah 4 · Subtopik (Topik 2). Disalin daripada ninja-math-dojo (src/routes/subtopik.tsx).
// Perubahan: tiada router (navigasi melalui props), gambar WebP dalam public/home/darjah4,
// bunyi klik ikut tetapan bunyi, dan tiada sonner/PageTransition.
// Kunci localStorage (currentLevel, completedLevel, obstacleIndex, minigameCleared) dikekalkan
// supaya page Soalan dan Halangan boleh disambung kemudian tanpa ubah logik.
import { motion, AnimatePresence, MotionConfig } from "framer-motion";
import clickSound from "../home/assets/sounds/click-sound.mp3";
import { Check, ChevronLeft, Lock, Play, RotateCcw, Star, X } from "lucide-react";
import type { CSSProperties } from "react";
import { useState, useEffect, useRef } from "react";
import "../home/dojo.css";

const IMG = "/home/darjah4";
const oceanBg = `${IMG}/laut.webp`;
const shipImg = `${IMG}/kapal.webp`;
const fishImg = `${IMG}/ikan.webp`;
const bottleScrollImg = `${IMG}/botol-skrol.webp`;
const abandonedIslandImg = `${IMG}/pulau-halangan.webp`;
const scrollCloseImg = `${IMG}/skrol-tutup.webp`;
const scrollOpenImg = `${IMG}/skrol-buka.webp`;
const obstacleImg1 = `${IMG}/halangan-1.webp`;

let soundOn = true;
const playClick = () => {
  if (soundOn) new Audio(clickSound).play().catch(() => {});
};

const islandImages = Array.from({ length: 10 }, (_, i) => `${IMG}/pulau-${i + 1}.webp`);

type SubtopikProps = {
  sound: boolean;
  onBack: () => void;
  // belum digabung: bila tiada, makluman "akan datang" dipaparkan
  onPlayLevel?: (index: number) => void;
  onObstacle?: (index: number) => void;
};

type SubtopicStatus = "active" | "locked" | "done";
type MapPosition = { x: number; y: number };
type ShipPosition = number | MapPosition;

const subtopics: {
  id: number;
  title: string;
  status: SubtopicStatus;
  objective: string;
  difficulty: string;
}[] = [
  {
    id: 1,
    title: "Kenal & Tulis Nombor",
    status: "active",
    objective: "Kenal simbol nombor dan tulis nilai dengan yakin.",
    difficulty: "Mudah",
  },
  {
    id: 2,
    title: "Teroka Nombor",
    status: "locked",
    objective: "Fahami nilai nombor melalui susunan dan perwakilan.",
    difficulty: "Mudah",
  },
  {
    id: 3,
    title: "Banding & Susun Nombor",
    status: "locked",
    objective: "Banding nombor dan susun daripada kecil ke besar.",
    difficulty: "Normal",
  },
  {
    id: 4,
    title: "Nombor Genap & Ganjil",
    status: "locked",
    objective: "Bezakan nombor genap dan ganjil dalam situasi mudah.",
    difficulty: "Normal",
  },
  {
    id: 5,
    title: "Pola Nombor",
    status: "locked",
    objective: "Cari corak nombor dan lengkapkan pola yang hilang.",
    difficulty: "Normal",
  },
  {
    id: 6,
    title: "Anggaran",
    status: "locked",
    objective: "Buat anggaran nilai sebelum mengira jawapan sebenar.",
    difficulty: "Sederhana",
  },
  {
    id: 7,
    title: "Bundar Nombor",
    status: "locked",
    objective: "Bundarkan nombor kepada nilai tempat yang sesuai.",
    difficulty: "Sederhana",
  },
  {
    id: 8,
    title: "Tambah",
    status: "locked",
    objective: "Selesaikan ayat matematik tambah secara berperingkat.",
    difficulty: "Normal",
  },
  {
    id: 9,
    title: "Tolak",
    status: "locked",
    objective: "Selesaikan ayat matematik tolak dengan strategi mudah.",
    difficulty: "Normal",
  },
  {
    id: 10,
    title: "Tambah & Tolak",
    status: "locked",
    objective: "Gabungkan operasi tambah dan tolak dalam cabaran akhir.",
    difficulty: "Susah",
  },
];

// Zigzag: alternating left/right, bottom to top
// x: 20% = left side, 65% = right side
// y: spaced 160px apart from bottom
const ISLAND_SPACING = 280;
const MAP_PADDING_BOTTOM = 220;

const stationPositions = subtopics.map((_, i) => ({
  x: i % 2 === 0 ? 20 : 75,
  y: MAP_PADDING_BOTTOM + i * ISLAND_SPACING,
}));

const TOTAL_MAP_HEIGHT = MAP_PADDING_BOTTOM + subtopics.length * ISLAND_SPACING + 80;

// index bermaksud halangan ada antara pulau [index] → [index+1]
const OBSTACLE_PATHS = [0, 3, 6];
const CLEARED_OBSTACLES_KEY = "clearedObstacles";

function getObstaclePosition(index: number): MapPosition {
  const nextIndex = index + 1;
  if (index < 0 || nextIndex >= stationPositions.length) return stationPositions[0];

  return {
    x: (stationPositions[index].x + stationPositions[nextIndex].x) / 2,
    y: (stationPositions[index].y + stationPositions[nextIndex].y) / 2,
  };
}

function getInitialShipPosition(): ShipPosition {
  if (typeof window === "undefined") return 0;

  // obstacleIndex hanya valid kalau kita tengah handle minigame flow
  const minigameCleared = localStorage.getItem("minigameCleared");
  const obstacleIndex = localStorage.getItem("obstacleIndex");
  if (minigameCleared === "true" && obstacleIndex !== null) {
    const parsed = parseInt(obstacleIndex);
    if (!isNaN(parsed)) return getObstaclePosition(parsed);
  }

  // completedLevel hanya valid kalau baru balik dari soalan
  const completedLevel = localStorage.getItem("completedLevel");
  if (completedLevel !== null) {
    const parsed = parseInt(completedLevel);
    if (!isNaN(parsed) && parsed >= 0 && parsed < stationPositions.length) {
      return parsed;
    }
  }

  // default: mula dari island 1
  return 0;
}

const fishJumps = [
  { left: "12%", top: "34%", delay: 0.2, scale: 0.85 },
  { left: "28%", top: "68%", delay: 2.4, scale: 0.7 },
  { left: "47%", top: "47%", delay: 4.1, scale: 0.9 },
  { left: "69%", top: "31%", delay: 1.4, scale: 0.75 },
  { left: "82%", top: "72%", delay: 3.3, scale: 0.8 },
];

const bottleFacts = [
  { left: "3%", top: "15%", delay: 0, fact: "Nombor terbesar 5 digit ialah 99 999!" },
  { left: "91%", top: "30%", delay: 1.2, fact: "Nombor terkecil 5 digit ialah 10 000!" },
  { left: "4%", top: "62%", delay: 2.5, fact: "100 000 ialah nombor pertama yang ada 6 digit!" },
  { left: "90%", top: "72%", delay: 0.8, fact: "Susunan menaik bermula dari nombor paling kecil." },
];

export default function SubtopikPage({ sound, onBack, onPlayLevel, onObstacle }: SubtopikProps) {
  soundOn = sound;
  const [notice, setNotice] = useState<string | null>(null);
  const noticeTimer = useRef<ReturnType<typeof setTimeout>>();
  useEffect(() => () => clearTimeout(noticeTimer.current), []);
  const comingSoon = (text: string) => {
    setNotice(text);
    clearTimeout(noticeTimer.current);
    noticeTimer.current = setTimeout(() => setNotice(null), 2600);
  };
  const scrollRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<HTMLDivElement>(null);
  const [mapWidth, setMapWidth] = useState(window.innerWidth);

  useEffect(() => {
    const update = () => setMapWidth(mapRef.current?.clientWidth ?? window.innerWidth);
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, []);
  const [statuses, setStatuses] = useState<SubtopicStatus[]>(() => {
    // kalau ada completedLevel atau minigameCleared, restore progress untuk sesi ni
    const completedLevel = localStorage.getItem("completedLevel");
    const minigameCleared = localStorage.getItem("minigameCleared");
    const obstacleIndex = localStorage.getItem("obstacleIndex");

    if (completedLevel !== null) {
      const idx = parseInt(completedLevel);
      if (!isNaN(idx) && idx >= 0 && idx < subtopics.length) {
        return subtopics.map((s, i) => {
          if (i < idx) return "done";
          if (i === idx) return "done";
          if (i === idx + 1 && !OBSTACLE_PATHS.includes(idx)) return "active";
          return s.status;
        });
      }
    }

    if (minigameCleared === "true" && obstacleIndex !== null) {
      const idx = parseInt(obstacleIndex);
      if (!isNaN(idx)) {
        return subtopics.map((s, i) => {
          if (i <= idx) return "done";
          if (i === idx + 1) return "active";
          return s.status;
        });
      }
    }

    // fresh start — semua reset ikut default
    return subtopics.map((s) => s.status);
  });
  const [shipPos, setShipPos] = useState<ShipPosition>(getInitialShipPosition);

  // handle minigame cleared — bila balik dari minigame page
  useEffect(() => {
    const cleared = localStorage.getItem("minigameCleared");
    const obstacleIndex = localStorage.getItem("obstacleIndex");
    const index = obstacleIndex === null ? Number.NaN : parseInt(obstacleIndex);

    if (cleared !== "true") {
      if (obstacleIndex === null) localStorage.removeItem(CLEARED_OBSTACLES_KEY);
      if (!isNaN(index)) setActiveObstacle(index);
      return;
    }

    if (isNaN(index)) return;

    localStorage.removeItem("minigameCleared");
    localStorage.removeItem("obstacleIndex");
    const nextIndex = index + 1;
    const obstaclePos = getObstaclePosition(index);
    setClearedObstacles((prev) => {
      return Array.from(new Set([...prev, index]));
    });
    setActiveObstacle(null);
    setIsMoving(true);
    setStatuses((prev) => {
      const next = [...prev];
      for (let i = 0; i <= index; i++) next[i] = "done";
      if (nextIndex < subtopics.length) next[nextIndex] = "active";
      return next;
    });
    setShipPos(obstaclePos);
    setTimeout(() => setShipPos(nextIndex), 300);
    setTimeout(() => {
      if (scrollRef.current) {
        const pos = stationPositions[nextIndex];
        const containerH = scrollRef.current.clientHeight;
        const scrollTarget = TOTAL_MAP_HEIGHT - pos.y - containerH / 2;
        scrollRef.current.scrollTo({ top: Math.max(0, scrollTarget), behavior: "smooth" });
      }
    }, 800);
    setTimeout(() => {
      setCelebrating(true);
      setTimeout(() => {
        setCelebrating(false);
        setIsMoving(false);
      }, 1000);
    }, 2500);
  }, []);

  // auto complete level bila balik dari soalan
  useEffect(() => {
    const completedLevel = localStorage.getItem("completedLevel");
    if (completedLevel === null) return;
    const index = parseInt(completedLevel);
    localStorage.removeItem("completedLevel");
    if (isNaN(index) || index < 0 || index >= subtopics.length) return;

    // pastikan status dia active supaya completeStation boleh jalan
    const hasObstacleNext = OBSTACLE_PATHS.includes(index);
    const nextIndex = index + 1;

    const newStatuses = subtopics.map((s) => s.status as SubtopicStatus);
    // copy existing done statuses
    for (let i = 0; i < index; i++) newStatuses[i] = "done";
    newStatuses[index] = "done";
    if (!hasObstacleNext && nextIndex < subtopics.length) {
      newStatuses[nextIndex] = "active";
    }
    setStatuses(newStatuses);

    setIsMoving(true);
    setShipPos(index);

    // kalau ada halangan, ship berhenti awal (20% jalan, sebelum obstacle)
    const targetPos = hasObstacleNext
      ? {
          x:
            stationPositions[index].x +
            (stationPositions[nextIndex].x - stationPositions[index].x) * 0.2,
          y:
            stationPositions[index].y +
            (stationPositions[nextIndex].y - stationPositions[index].y) * 0.2,
        }
      : nextIndex;

    setTimeout(() => {
      setShipPos(targetPos);
      // kalau ada halangan: boat berhenti → tanda seru blink → 2 saat → dialog
      if (hasObstacleNext) {
        // tunggu boat sampai posisi berhenti dulu
        setTimeout(() => {
          setShowAlert(true);
          setTimeout(() => {
            setShowAlert(false);
            setDialogScrollPhase("closed");
            setObstacleDialog(index);
            setTimeout(() => setDialogScrollPhase("open"), 600);
          }, 2000);
        }, 1500);
      }
    }, 300);

    setTimeout(() => {
      if (scrollRef.current) {
        const pos = typeof targetPos === "number" ? stationPositions[targetPos] : targetPos;
        const containerH = scrollRef.current.clientHeight;
        const scrollTarget = TOTAL_MAP_HEIGHT - pos.y - containerH / 2;
        scrollRef.current.scrollTo({ top: Math.max(0, scrollTarget), behavior: "smooth" });
      }
    }, 800);

    if (hasObstacleNext) {
      // ada halangan — boat berhenti je, takde celebrate
      setTimeout(() => setIsMoving(false), 1500);
    } else {
      // takde halangan — celebrate sampai pulau
      setTimeout(() => {
        setCelebrating(true);
        setTimeout(() => {
          setCelebrating(false);
          setIsMoving(false);
        }, 1000);
      }, 2500);
    }
  }, []);
  const [isMoving, setIsMoving] = useState(false);
  const [celebrating, setCelebrating] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [lockedPulseIndex, setLockedPulseIndex] = useState<number | null>(null);
  const [newlyUnlockedIndex, setNewlyUnlockedIndex] = useState<number | null>(null);
  const [bottleOpen, setBottleOpen] = useState<number | null>(null);
  const [scrollPhase, setScrollPhase] = useState<"closed" | "open">("closed");
  const [clearedObstacles, setClearedObstacles] = useState<number[]>(() => {
    const minigameCleared = localStorage.getItem("minigameCleared");
    const obstacleIndex = localStorage.getItem("obstacleIndex");
    if (minigameCleared === "true" && obstacleIndex !== null) {
      const idx = parseInt(obstacleIndex);
      if (!isNaN(idx)) return [idx];
    }
    return [];
  });
  const [activeObstacle, setActiveObstacle] = useState<number | null>(null);
  const [obstacleDialog, setObstacleDialog] = useState<number | null>(null);
  const [dialogScrollPhase, setDialogScrollPhase] = useState<"closed" | "open">("closed");
  const [showAlert, setShowAlert] = useState(false);

  const doneCount = statuses.filter((s) => s === "done").length;
  const progress = Math.round((doneCount / subtopics.length) * 100);

  // Scroll to active island on load
  useEffect(() => {
    const lastDone = statuses.lastIndexOf("done");
    const currentIdx = lastDone >= 0 ? lastDone : 0;

    setTimeout(() => {
      if (scrollRef.current) {
        const pos = stationPositions[currentIdx];
        const containerH = scrollRef.current.clientHeight;
        const scrollTarget = TOTAL_MAP_HEIGHT - pos.y - containerH / 2;
        scrollRef.current.scrollTop = Math.max(0, scrollTarget);
      }
    }, 300);
  }, []);

  function openStation(index: number) {
    if (isMoving) return;
    setSelectedIndex(index);

    if (statuses[index] === "locked") {
      setLockedPulseIndex(index);
      setTimeout(() => setLockedPulseIndex(null), 900);
    }
  }

  function completeStation(index: number) {
    if (statuses[index] !== "active" || isMoving) return;
    setSelectedIndex(null);
    setIsMoving(true);

    const newStatuses = [...statuses];
    newStatuses[index] = "done";

    if (index + 1 < subtopics.length) {
      newStatuses[index + 1] = "active";
      setStatuses(newStatuses);
      setNewlyUnlockedIndex(index + 1);
      setTimeout(() => setNewlyUnlockedIndex(null), 1800);

      // Move ship immediately
      setShipPos(index + 1);

      // Scroll to next island after ship starts moving
      setTimeout(() => {
        if (scrollRef.current) {
          const pos = stationPositions[index + 1];
          const containerH = scrollRef.current.clientHeight;
          const scrollTarget = TOTAL_MAP_HEIGHT - pos.y - containerH / 2;
          scrollRef.current.scrollTo({ top: Math.max(0, scrollTarget), behavior: "smooth" });
        }
      }, 800);

      // Celebrate after ship arrives (match transition duration 2.5s)
      setTimeout(() => {
        setCelebrating(true);
        setTimeout(() => {
          setCelebrating(false);
          setIsMoving(false);
        }, 1000);
      }, 2500);
    } else {
      setStatuses(newStatuses);
      setCelebrating(true);
      setTimeout(() => {
        setCelebrating(false);
        setIsMoving(false);
      }, 1200);
    }
  }

  function startStation() {
    if (selectedIndex === null) return;
    const level = selectedIndex;
    setSelectedIndex(null);
    if (!onPlayLevel) return comingSoon("Soalan untuk pulau ini akan dibuka tidak lama lagi.");
    localStorage.setItem("currentLevel", String(level));
    onPlayLevel(level);
  }

  function replayStation() {
    startStation();
  }

  // tekan "Mula Cabaran!" — tutup dialog, boat bergerak ke obstacle island
  function startObstacleChallenge(index: number) {
    setObstacleDialog(null);
    setDialogScrollPhase("closed");

    const obstaclePos = getObstaclePosition(index);

    setIsMoving(true);
    setTimeout(() => setShipPos(obstaclePos), 200);
    setTimeout(() => {
      if (scrollRef.current) {
        const containerH = scrollRef.current.clientHeight;
        const scrollTarget = TOTAL_MAP_HEIGHT - obstaclePos.y - containerH / 2;
        scrollRef.current.scrollTo({ top: Math.max(0, scrollTarget), behavior: "smooth" });
      }
    }, 600);
    // boat dah sampai obstacle — boleh klik island
    setTimeout(() => {
      setIsMoving(false);
      setActiveObstacle(index);
    }, 1800);
  }

  // klik obstacle island — pergi ke mini game page
  function openObstacleMinigame(index: number) {
    if (!onObstacle) return comingSoon("Cabaran halangan akan dibuka tidak lama lagi.");
    localStorage.setItem("obstacleIndex", String(index));
    onObstacle(index);
  }

  const selectedSubtopic = selectedIndex === null ? null : subtopics[selectedIndex];
  const selectedStatus = selectedIndex === null ? null : statuses[selectedIndex];
  const selectedRequirement =
    selectedIndex !== null && selectedIndex > 0
      ? `Selesaikan "${subtopics[selectedIndex - 1].title}" dulu untuk buka pulau ini.`
      : "Selesaikan pulau sebelumnya dulu untuk buka pulau ini.";
  const isMobileMap = mapWidth < 640;
  const mapScale = mapWidth < 390 ? 0.62 : mapWidth < 480 ? 0.68 : mapWidth < 640 ? 0.78 : 1;
  const islandRadius = 120 * mapScale;
  const activeRingRadius = 95 * mapScale;
  const unlockRingRadius = 90 * mapScale;
  const labelWidth = Math.max(104, 140 * mapScale);
  const labelHeight = Math.max(34, 42 * mapScale);
  const badgeSize = Math.max(24, 32 * mapScale);
  const lockBadgeSize = Math.max(22, 28 * mapScale);
  const labelFontSize = Math.max(9, 12 * mapScale);
  const shipSize = 176 * mapScale;
  const stationLayout = stationPositions.map((pos, i) => ({
    ...pos,
    x: isMobileMap ? (i % 2 === 0 ? 37 : 67) : pos.x,
  }));
  const shipStation = typeof shipPos === "number" ? stationLayout[shipPos] : shipPos;

  return (
    <MotionConfig reducedMotion="user">
    <div className="dojo-home">
      <div className="relative h-dvh w-screen overflow-hidden bg-[#061534] font-sans">
        {/* Shared animation keyframes */}
        <div className="absolute inset-0 overflow-hidden bg-[#061534]">
          <style>{`
            @keyframes shimmer-pulse {
              0%, 100% { opacity: 0.04; }
              50%       { opacity: 0.10; }
            }
            @keyframes ocean-map-drift {
              0%   { background-position: 50% 0%; }
              25%  { background-position: 48% 0.8%; }
              50%  { background-position: 46% 0%; }
              75%  { background-position: 49% -0.8%; }
              100% { background-position: 50% 0%; }
            }
            @keyframes fish-jump {
              0%, 100% { transform: translate3d(0, 18px, 0) rotate(-16deg) scale(var(--fish-scale)); opacity: 0; }
              7% { opacity: 0; }
              10% { opacity: 0.95; }
              31% { transform: translate3d(34px, -34px, 0) rotate(18deg) scale(var(--fish-scale)); opacity: 1; }
              53% { opacity: 0.95; }
              60% { transform: translate3d(72px, 16px, 0) rotate(42deg) scale(var(--fish-scale)); opacity: 0; }
            }
            @keyframes splash-start {
              0%, 3%, 23%, 100% { transform: translate3d(0, 0, 0) scale(0.25) rotate(-4deg); opacity: 0; }
              7% { opacity: 0.95; }
              18% { transform: translate3d(0, -8px, 0) scale(1) rotate(2deg); opacity: 0; }
            }
            @keyframes splash-end {
              0%, 52%, 78%, 100% { transform: translate3d(0, 0, 0) scale(0.25) rotate(5deg); opacity: 0; }
              58% { opacity: 0.95; }
              70% { transform: translate3d(0, -8px, 0) scale(1) rotate(-2deg); opacity: 0; }
            }
          `}</style>
        </div>

        {/* Top bar — fixed */}
        <div className="relative z-30 flex items-start justify-between gap-2 p-2.5 sm:items-center sm:p-4">
          <motion.button
            whileHover={{ scale: 1.06, x: -2 }}
            whileTap={{ scale: 0.94 }}
            onClick={() => {
              playClick();
              localStorage.removeItem("completedLevel");
              localStorage.removeItem("currentLevel");
              localStorage.removeItem("obstacleIndex");
              localStorage.removeItem("minigameCleared");
              localStorage.removeItem(CLEARED_OBSTACLES_KEY);
              onBack();
            }}
            className="flex items-center gap-1.5 rounded-2xl border-[3px] border-[#061534] px-3 py-2 font-black text-white shadow-lg sm:gap-2 sm:px-4"
            style={{ background: "var(--gradient-orange)" }}
          >
            <ChevronLeft className="h-4 w-4 sm:h-5 sm:w-5" strokeWidth={3} />
            <span className="text-xs sm:text-sm">Balik</span>
          </motion.button>

          <div
            className="max-w-[158px] rounded-2xl border-[3px] border-[oklch(0.32_0.07_45)] px-3 py-1.5 text-center shadow-lg sm:max-w-none sm:px-5"
            style={{
              background:
                "linear-gradient(180deg, oklch(0.85 0.12 80) 0%, oklch(0.62 0.12 60) 100%)",
            }}
          >
            <p className="font-display text-[10px] font-black uppercase tracking-widest text-[#061534]">
              Topik 2
            </p>
            <p className="font-display text-xs font-black leading-tight text-[#061534] sm:text-sm">
              Pecahan, Perpuluhan & Peratus
            </p>
          </div>

          <div
            className="rounded-2xl border-[3px] border-[#061534] px-3 py-1.5 text-right shadow-lg sm:px-4"
            style={{ background: "linear-gradient(180deg, #0B3D91 0%, #061534 100%)" }}
          >
            <p className="text-[10px] font-bold text-white/70">Kemajuan</p>
            <p className="font-display text-base font-black text-[#F9E04B] sm:text-lg">
              {progress}%
            </p>
          </div>
        </div>

        {/* Progress bar */}
        <div className="relative z-30 mx-4 h-3 overflow-hidden rounded-full border-2 border-[#061534] bg-[#061534]/60">
          <motion.div
            className="h-full rounded-full"
            style={{ background: "var(--gradient-orange)" }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.8, ease: "easeOut" }}
          />
        </div>

        {/* Scrollable map */}
        <div
          ref={scrollRef}
          className="absolute inset-0 overflow-y-auto overflow-x-hidden"
          style={{ top: isMobileMap ? 104 : 90, zIndex: 10, scrollbarWidth: "none" }}
        >
          {/* Map canvas — tall, island 0 at bottom */}
          <div
            ref={mapRef}
            className="relative w-full origin-top transition-transform duration-300"
            style={{ height: TOTAL_MAP_HEIGHT }}
          >
            <div
              className="pointer-events-none absolute inset-0"
              style={{
                zIndex: 0,
                backgroundImage: `url(${oceanBg})`,
                backgroundRepeat: "repeat-y",
                backgroundSize: "100% auto",
                backgroundPosition: "top center",
                animation: "ocean-map-drift 9s ease-in-out infinite",
              }}
            />
            <div
              className="pointer-events-none absolute inset-0"
              style={{
                zIndex: 0,
                background:
                  "radial-gradient(ellipse 80% 50% at 50% 40%, rgba(100,180,255,0.12) 0%, transparent 70%)",
                animation: "shimmer-pulse 6s ease-in-out infinite",
              }}
            />
            <div
              className="pointer-events-none absolute inset-0 bg-[#061534]/15"
              style={{ zIndex: 0 }}
            />
            <div
              className="pointer-events-none absolute inset-0 overflow-hidden"
              style={{ zIndex: 0 }}
            >
              {fishJumps.map((fish, index) => (
                <div
                  key={index}
                  className="absolute h-16 w-24"
                  style={
                    {
                      left: fish.left,
                      top: fish.top,
                      "--fish-scale": fish.scale,
                    } as CSSProperties
                  }
                >
                  {[
                    { group: "start", left: 1, top: 1, flip: 1 },
                    { group: "end", left: 38, top: 22, flip: -1 },
                  ].map((splash, splashIndex) => (
                    <svg
                      key={splashIndex}
                      viewBox="0 0 82 48"
                      className="absolute h-10 w-16 drop-shadow-[0_0_10px_rgba(45,212,191,0.35)]"
                      style={
                        {
                          left: splash.left,
                          top: splash.top,
                          transformOrigin: "40px 38px",
                          animation: `${splash.group === "start" ? "splash-start" : "splash-end"} 4.2s ease-out -${fish.delay}s infinite`,
                          scale: `${splash.flip} 1`,
                        } as CSSProperties
                      }
                      aria-hidden
                    >
                      <path
                        d="M8 35c7 8 55 9 66 0-3 8-18 12-33 12S14 43 8 35Z"
                        fill="#22d3ee"
                        opacity="0.55"
                      />
                      <path
                        d="M12 33c8-3 9-15 16-11 5 3 2 12 8 12 6 1 5-20 12-17 7 3 2 20 10 17 6-2 8-12 14-6 4 4 2 9-1 12-12 6-45 6-59-7Z"
                        fill="#67e8f9"
                      />
                      <path
                        d="M17 35c11 5 39 6 52 0"
                        stroke="#ecfeff"
                        strokeWidth="3"
                        strokeLinecap="round"
                        fill="none"
                        opacity="0.9"
                      />
                      <path
                        d="M25 26c-3-9 2-16 6-19M43 31c2-12 10-17 16-18M58 29c7-8 12-8 17-6"
                        stroke="#a5f3fc"
                        strokeWidth="4"
                        strokeLinecap="round"
                        fill="none"
                      />
                      <circle cx="24" cy="10" r="3.5" fill="#cffafe" />
                      <circle cx="56" cy="11" r="2.8" fill="#cffafe" />
                      <circle cx="75" cy="21" r="2.2" fill="#cffafe" />
                    </svg>
                  ))}
                  <img
                    src={fishImg}
                    alt=""
                    aria-hidden
                    className="absolute left-0 top-0 h-12 w-16 object-contain drop-shadow-[0_3px_6px_rgba(0,0,0,0.35)]"
                    style={{
                      animation: `fish-jump 4.2s ease-in-out -${fish.delay}s infinite`,
                    }}
                  />
                </div>
              ))}
            </div>

            {/* botol terapung */}
            {bottleFacts.map((bottle, i) => (
              <motion.button
                key={i}
                className="absolute z-10 cursor-pointer"
                style={{ left: bottle.left, top: bottle.top }}
                animate={{ y: [0, -8, 0] }}
                transition={{
                  duration: 2.5,
                  repeat: Infinity,
                  ease: "easeInOut",
                  delay: -bottle.delay,
                }}
                whileHover={{ scale: 1.25 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => {
                  playClick();
                  setScrollPhase("closed");
                  setBottleOpen(i);
                  setTimeout(() => setScrollPhase("open"), 600);
                }}
              >
                <motion.img
                  src={bottleScrollImg}
                  alt="botol mesej"
                  className="h-16 w-12 object-contain"
                  animate={{
                    filter: [
                      "drop-shadow(0 0 4px rgba(250,204,21,0.4))",
                      "drop-shadow(0 0 12px rgba(250,204,21,0.9))",
                      "drop-shadow(0 0 4px rgba(250,204,21,0.4))",
                    ],
                  }}
                  transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                  whileHover={{ rotate: [0, -15, 15, -10, 10, 0], transition: { duration: 0.5 } }}
                />
                {/* splash air depan botol — pointer-events-none supaya botol still clickable */}
                <svg
                  viewBox="0 0 82 48"
                  className="pointer-events-none absolute bottom-[-10px] left-1/2 z-20 h-10 w-16 -translate-x-1/2 drop-shadow-[0_0_6px_rgba(45,212,191,0.4)]"
                  aria-hidden
                >
                  <path
                    d="M8 35c7 8 55 9 66 0-3 8-18 12-33 12S14 43 8 35Z"
                    fill="#22d3ee"
                    opacity="0.55"
                  />
                  <path
                    d="M12 33c8-3 9-15 16-11 5 3 2 12 8 12 6 1 5-20 12-17 7 3 2 20 10 17 6-2 8-12 14-6 4 4 2 9-1 12-12 6-45 6-59-7Z"
                    fill="#67e8f9"
                  />
                  <path
                    d="M17 35c11 5 39 6 52 0"
                    stroke="#ecfeff"
                    strokeWidth="3"
                    strokeLinecap="round"
                    fill="none"
                    opacity="0.9"
                  />
                  <path
                    d="M25 26c-3-9 2-16 6-19M43 31c2-12 10-17 16-18M58 29c7-8 12-8 17-6"
                    stroke="#a5f3fc"
                    strokeWidth="4"
                    strokeLinecap="round"
                    fill="none"
                  />
                  <circle cx="24" cy="10" r="3.5" fill="#cffafe" />
                  <circle cx="56" cy="11" r="2.8" fill="#cffafe" />
                  <circle cx="75" cy="21" r="2.2" fill="#cffafe" />
                </svg>
              </motion.button>
            ))}

            {/* SVG path — draw from island center to island center, islands render on top */}
            <svg
              className="absolute inset-0"
              width={mapWidth}
              height={TOTAL_MAP_HEIGHT}
              style={{ zIndex: 1 }}
            >
              <defs>
                <filter id="glow-gold">
                  <feGaussianBlur stdDeviation="4" result="coloredBlur" />
                  <feMerge>
                    <feMergeNode in="coloredBlur" />
                    <feMergeNode in="SourceGraphic" />
                  </feMerge>
                </filter>
              </defs>

              {stationLayout.slice(0, -1).map((pos, i) => {
                const next = stationLayout[i + 1];
                const isDone = statuses[i] === "done";

                // Pixel center of each island
                const x1 = (pos.x / 100) * mapWidth;
                const y1 = TOTAL_MAP_HEIGHT - pos.y;
                const x2 = (next.x / 100) * mapWidth;
                const y2 = TOTAL_MAP_HEIGHT - next.y;

                // Trim line — pull endpoints inward by islandR pixels so line starts/ends inside island image
                const islandR = 130 * mapScale;
                const dx = x2 - x1;
                const dy = y2 - y1;
                const dist = Math.sqrt(dx * dx + dy * dy);
                const ux = dx / dist;
                const uy = dy / dist;
                const sx1 = x1 + ux * islandR;
                const sy1 = y1 + uy * islandR;
                const sx2 = x2 - ux * islandR;
                const sy2 = y2 - uy * islandR;

                const cx = (sx1 + sx2) / 2;
                const cy = (sy1 + sy2) / 2 + (i % 2 === 0 ? 30 : -30);

                const hasObstacle = OBSTACLE_PATHS.includes(i);
                const obstacleCleared = clearedObstacles.includes(i);
                const midX = (sx1 + sx2) / 2;
                const midY = (sy1 + sy2) / 2;
                const routeSegments = hasObstacle
                  ? [
                      {
                        d: `M ${x1} ${y1} L ${midX} ${midY}`,
                        complete: isDone,
                      },
                      {
                        d: `M ${midX} ${midY} L ${x2} ${y2}`,
                        complete: obstacleCleared,
                      },
                    ]
                  : [
                      {
                        d: `M ${x1} ${y1} Q ${cx} ${cy} ${x2} ${y2}`,
                        complete: isDone,
                      },
                    ];

                return (
                  <g key={i} pointerEvents="none">
                    <title>
                      {isDone ? "Laluan selesai" : `Seterusnya: ${subtopics[i + 1].title}`}
                    </title>
                    {routeSegments.map((segment, segmentIndex) => (
                      <g key={segmentIndex}>
                        <path
                          d={segment.d}
                          stroke="rgba(0,0,0,0.4)"
                          strokeWidth="14"
                          fill="none"
                          strokeLinecap="round"
                        />
                        <path
                          d={segment.d}
                          stroke={segment.complete ? "#F9E04B" : "#FF4444"}
                          strokeWidth={segment.complete ? "8" : "7"}
                          strokeDasharray={segment.complete ? "none" : "20 14"}
                          fill="none"
                          strokeLinecap="round"
                          filter={segment.complete ? "url(#glow-gold)" : "none"}
                        />
                      </g>
                    ))}

                    {/* obstacle island */}
                    {hasObstacle && (
                      <g
                        transform={`translate(${midX}, ${midY})`}
                        pointerEvents="all"
                        style={{ cursor: obstacleCleared ? "default" : "pointer" }}
                        onClick={() => {
                          if (!obstacleCleared && activeObstacle === i) {
                            openObstacleMinigame(i);
                          }
                        }}
                      >
                        {/* glow pulse bila active */}
                        {activeObstacle === i && !obstacleCleared && (
                          <circle r="80" fill="rgba(250,204,21,0.15)">
                            <animate
                              attributeName="r"
                              values="70;85;70"
                              dur="1.2s"
                              repeatCount="indefinite"
                            />
                            <animate
                              attributeName="opacity"
                              values="0.3;0.6;0.3"
                              dur="1.2s"
                              repeatCount="indefinite"
                            />
                          </circle>
                        )}

                        {/* gambar pulau */}
                        <image
                          href={abandonedIslandImg}
                          x="-70"
                          y="-110"
                          width="140"
                          height="140"
                          style={{
                            filter: obstacleCleared
                              ? "none"
                              : activeObstacle === i
                                ? "brightness(0.9)"
                                : "grayscale(60%) brightness(0.7)",
                          }}
                        />

                        {/* lock / cleared indicator */}
                        {!obstacleCleared ? (
                          <g>
                            <circle
                              cy="38"
                              r="16"
                              fill="#1a0505"
                              stroke="#dc2626"
                              strokeWidth="2.5"
                            />
                            <text x="0" y="44" textAnchor="middle" fontSize="16">
                              🔒
                            </text>
                          </g>
                        ) : (
                          <g>
                            <circle
                              cy="38"
                              r="16"
                              fill="#14532d"
                              stroke="#4ade80"
                              strokeWidth="2.5"
                            />
                            <text x="0" y="44" textAnchor="middle" fontSize="16">
                              ✅
                            </text>
                          </g>
                        )}

                        {/* label */}
                        <text
                          x="0"
                          y="64"
                          textAnchor="middle"
                          fontSize="12"
                          fontWeight="bold"
                          fill={obstacleCleared ? "#86efac" : "#fca5a5"}
                          stroke="black"
                          strokeWidth="3"
                          paintOrder="stroke"
                        >
                          {obstacleCleared ? "Cleared!" : "Halangan!"}
                        </text>
                      </g>
                    )}
                  </g>
                );
              })}

              {/* Islands rendered inside SVG */}
              {stationLayout.map((pos, i) => {
                const cx = (pos.x / 100) * mapWidth;
                const cy = TOTAL_MAP_HEIGHT - pos.y;
                const r = islandRadius;
                const status = statuses[i];
                const isLocked = status === "locked";
                const isDone = status === "done";
                const isActive = status === "active";
                const sub = subtopics[i];
                const isPulsing = lockedPulseIndex === i;
                const isNew = newlyUnlockedIndex === i;

                return (
                  <motion.g
                    key={`island-${i}`}
                    style={{ transformOrigin: `${cx}px ${cy}px` }}
                    whileHover={{ scale: 1.08, y: -6 }}
                    whileTap={{ scale: isLocked ? 0.96 : 0.98 }}
                    animate={
                      isPulsing
                        ? { scale: [1, 1.12, 0.96, 1.08, 1], x: [0, -8, 8, -5, 0] }
                        : isNew
                          ? {
                              scale: [1, 1.18, 1],
                              filter: ["brightness(1)", "brightness(1.45)", "brightness(1)"],
                            }
                          : { scale: 1, x: 0 }
                    }
                    transition={{ duration: isPulsing ? 0.55 : 0.8, ease: "easeOut" }}
                  >
                    <title>
                      {isLocked
                        ? `Dikunci. ${i > 0 ? `Selesaikan ${subtopics[i - 1].title} dulu.` : "Selesaikan pulau sebelumnya dulu."}`
                        : isDone
                          ? `${sub.title}. Ulang kaji tersedia.`
                          : `${sub.title}. Tekan untuk mula.`}
                    </title>
                    {isActive && (
                      <circle
                        cx={cx}
                        cy={cy + 10}
                        r={activeRingRadius}
                        fill="none"
                        stroke="#F9E04B"
                        strokeWidth="5"
                        strokeDasharray="16 10"
                        opacity="0.7"
                      />
                    )}
                    {isNew && (
                      <motion.circle
                        cx={cx}
                        cy={cy}
                        r={unlockRingRadius}
                        fill="none"
                        stroke="#F9E04B"
                        strokeWidth="6"
                        initial={{ scale: 0.7, opacity: 0.95 }}
                        animate={{ scale: 1.8, opacity: 0 }}
                        transition={{ duration: 1.4, ease: "easeOut" }}
                      />
                    )}
                    {/* Island image */}
                    <image
                      href={islandImages[i]}
                      x={cx - r}
                      y={cy - r}
                      width={r * 2}
                      height={r * 2}
                      style={{ filter: isLocked ? "grayscale(70%) brightness(0.55)" : "none" }}
                    />

                    {/* Badge — centered below island */}
                    <foreignObject
                      x={cx - badgeSize / 2}
                      y={cy + r - 15 * mapScale}
                      width={badgeSize}
                      height={badgeSize}
                    >
                      <div style={{ display: "flex", justifyContent: "center" }}>
                        {isLocked ? (
                          <div
                            style={{
                              width: lockBadgeSize,
                              height: lockBadgeSize,
                              borderRadius: "50%",
                              background: "#1f2937",
                              border: "2px solid #4b5563",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              boxShadow: isPulsing ? "0 0 18px rgba(249, 224, 75, 0.85)" : "none",
                            }}
                          >
                            <Lock size={13 * mapScale} color="#9ca3af" strokeWidth={3} />
                          </div>
                        ) : isDone ? (
                          <div
                            style={{
                              width: lockBadgeSize,
                              height: lockBadgeSize,
                              borderRadius: "50%",
                              background: "#facc15",
                              border: "2px solid #ca8a04",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                            }}
                          >
                            <Check size={15 * mapScale} color="#713f12" strokeWidth={3} />
                          </div>
                        ) : (
                          <div
                            style={{
                              width: badgeSize,
                              height: badgeSize,
                              borderRadius: "50%",
                              background: "#f97316",
                              border: "2px solid #c2410c",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                            }}
                          >
                            <span
                              style={{ color: "white", fontWeight: 900, fontSize: 13 * mapScale }}
                            >
                              {sub.id}
                            </span>
                          </div>
                        )}
                      </div>
                    </foreignObject>

                    {/* Label — below badge */}
                    <foreignObject
                      x={cx - labelWidth / 2}
                      y={cy + r + 28 * mapScale}
                      width={labelWidth}
                      height={labelHeight}
                    >
                      <div
                        style={{
                          background: "linear-gradient(180deg,#FF8C42,#E05A2B)",
                          border: "2px solid #8B3500",
                          borderRadius: 10,
                          padding: "2px 6px",
                          textAlign: "center",
                        }}
                      >
                        <span
                          style={{
                            color: "white",
                            fontSize: labelFontSize,
                            fontWeight: 900,
                            lineHeight: 1.3,
                            display: "block",
                          }}
                        >
                          {sub.title}
                        </span>
                      </div>
                    </foreignObject>

                    {/* Clickable rect — on top of everything, captures click */}
                    <rect
                      x={cx - r}
                      y={cy - r}
                      width={r * 2}
                      height={r * 2}
                      fill="transparent"
                      style={{ cursor: isLocked ? "not-allowed" : "pointer" }}
                      onClick={() => {
                        playClick();
                        openStation(i);
                      }}
                    />
                  </motion.g>
                );
              })}
            </svg>

            {/* Ship — rendered in HTML, animates to island position */}
            {shipStation && (
              <motion.div
                className="absolute pointer-events-none"
                style={{ zIndex: 15 }}
                animate={{
                  left: (shipStation.x / 100) * mapWidth - shipSize / 2,
                  top: TOTAL_MAP_HEIGHT - shipStation.y - shipSize / 2,
                }}
                transition={{ duration: 2.5, ease: "easeInOut" }}
                initial={false}
              >
                <motion.div
                  animate={
                    celebrating
                      ? { y: [0, -20, 0, -12, 0], rotate: [0, -10, 10, -5, 0] }
                      : isMoving
                        ? { y: [0, -8, 0], rotate: [0, -3, 3, 0] }
                        : { y: 0, rotate: 0 }
                  }
                  transition={
                    celebrating
                      ? { duration: 1.0, ease: "easeOut" }
                      : isMoving
                        ? { duration: 1.5, repeat: Infinity, ease: "easeInOut" }
                        : { duration: 0.3 }
                  }
                >
                  <img
                    src={shipImg}
                    alt="ship"
                    className="object-contain drop-shadow-2xl"
                    style={{ width: shipSize, height: shipSize }}
                  />
                </motion.div>

                {/* tanda seru bila jumpa halangan */}
                <AnimatePresence>
                  {showAlert && (
                    <motion.div
                      className="absolute -top-12 left-1/2 -translate-x-1/2"
                      initial={{ scale: 0, y: 10 }}
                      animate={{ scale: 1, y: 0 }}
                      exit={{ scale: 0, opacity: 0 }}
                      transition={{ type: "spring", bounce: 0.6 }}
                    >
                      <motion.div
                        className="grid h-12 w-12 place-items-center rounded-full border-[3px] border-white bg-red-600 text-2xl font-black text-white shadow-[0_4px_12px_rgba(220,38,38,0.7)]"
                        animate={{ scale: [1, 1.2, 1], opacity: [1, 0.5, 1] }}
                        transition={{ duration: 0.5, repeat: Infinity }}
                      >
                        ❗
                      </motion.div>
                    </motion.div>
                  )}
                </AnimatePresence>

                <AnimatePresence>
                  {celebrating && (
                    <>
                      {["⭐", "✨", "🌟", "💫"].map((star, idx) => (
                        <motion.span
                          key={idx}
                          className="absolute text-2xl"
                          style={{ left: `${-30 + idx * 20}px`, top: "-10px" }}
                          initial={{ opacity: 0, y: 0, scale: 0 }}
                          animate={{ opacity: [0, 1, 0], y: -60, scale: [0, 1.4, 0] }}
                          exit={{ opacity: 0 }}
                          transition={{ duration: 1.0, delay: idx * 0.12 }}
                        >
                          {star}
                        </motion.span>
                      ))}
                    </>
                  )}
                </AnimatePresence>
              </motion.div>
            )}
          </div>
        </div>

        <AnimatePresence>
          {selectedSubtopic && selectedIndex !== null && (
            <motion.div
              className="absolute inset-0 z-50 grid place-items-center bg-[#061534]/65 px-4 backdrop-blur-sm"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedIndex(null)}
            >
              <motion.div
                role="dialog"
                aria-modal="true"
                aria-labelledby="subtopic-preview-title"
                className="relative w-full max-w-md rounded-2xl border-[3px] border-[#061534] p-4 text-white shadow-2xl"
                style={{
                  background: "linear-gradient(180deg, #0B3D91 0%, #071B3A 62%, #061534 100%)",
                }}
                initial={{ y: 20, scale: 0.94, opacity: 0 }}
                animate={{ y: 0, scale: 1, opacity: 1 }}
                exit={{ y: 20, scale: 0.94, opacity: 0 }}
                transition={{ duration: 0.22, ease: "easeOut" }}
                onClick={(event) => event.stopPropagation()}
              >
                <button
                  aria-label="Tutup"
                  onClick={() => {
                    playClick();
                    setSelectedIndex(null);
                  }}
                  className="absolute right-3 top-3 grid h-9 w-9 place-items-center rounded-full border-2 border-[#061534] bg-white/10 text-white transition-colors hover:bg-white/20"
                >
                  <X className="h-5 w-5" strokeWidth={3} />
                </button>

                <div className="pr-10">
                  <p className="font-display text-[11px] font-black uppercase tracking-widest text-ninja-yellow">
                    Subtopik {selectedSubtopic.id}
                  </p>
                  <h2
                    id="subtopic-preview-title"
                    className="mt-1 font-display text-2xl font-black leading-tight text-white"
                  >
                    {selectedSubtopic.title}
                  </h2>
                </div>

                <div className="mt-4 grid grid-cols-3 gap-2 text-center">
                  <div className="rounded-xl border border-white/10 bg-white/10 px-2 py-2">
                    <p className="text-[10px] font-bold uppercase text-white/55">Tahap</p>
                    <p className="text-sm font-black text-white">{selectedSubtopic.difficulty}</p>
                  </div>
                  <div className="rounded-xl border border-white/10 bg-white/10 px-2 py-2">
                    <p className="text-[10px] font-bold uppercase text-white/55">Status</p>
                    <p className="text-sm font-black text-white">
                      {selectedStatus === "done"
                        ? "Selesai"
                        : selectedStatus === "locked"
                          ? "Dikunci"
                          : "Sedia"}
                    </p>
                  </div>
                  <div className="rounded-xl border border-white/10 bg-white/10 px-2 py-2">
                    <p className="text-[10px] font-bold uppercase text-white/55">Bintang</p>
                    <div className="flex justify-center gap-0.5 pt-0.5">
                      {[0, 1, 2].map((star) => (
                        <Star
                          key={star}
                          className={`h-4 w-4 ${selectedStatus === "done" ? "fill-ninja-yellow text-ninja-yellow" : "text-white/35"}`}
                          strokeWidth={3}
                        />
                      ))}
                    </div>
                  </div>
                </div>

                <p className="mt-4 rounded-xl border border-white/10 bg-white/10 px-3 py-3 text-sm font-bold leading-relaxed text-white/85">
                  {selectedSubtopic.objective}
                </p>

                {selectedStatus === "locked" && (
                  <motion.div
                    className="mt-4 flex items-center gap-3 rounded-xl border border-ninja-yellow/40 bg-ninja-yellow/15 px-3 py-3 text-sm font-black text-ninja-yellow"
                    initial={{ x: -8 }}
                    animate={{ x: [0, -6, 6, -4, 0] }}
                    transition={{ duration: 0.45 }}
                  >
                    <Lock className="h-5 w-5 shrink-0" strokeWidth={3} />
                    <span>{selectedRequirement}</span>
                  </motion.div>
                )}

                <div className="mt-5 flex gap-3">
                  {selectedStatus === "active" && (
                    <motion.button
                      whileHover={{ scale: 1.03 }}
                      whileTap={{ scale: 0.96 }}
                      onClick={() => {
                        playClick();
                        startStation();
                      }}
                      className="flex flex-1 items-center justify-center gap-2 rounded-2xl border-[3px] border-[#061534] px-4 py-3 font-black text-white shadow-lg"
                      style={{ background: "var(--gradient-orange)" }}
                    >
                      <Play className="h-5 w-5 fill-white" strokeWidth={3} />
                      Mula
                    </motion.button>
                  )}

                  {selectedStatus === "done" && (
                    <motion.button
                      whileHover={{ scale: 1.03 }}
                      whileTap={{ scale: 0.96 }}
                      onClick={() => {
                        playClick();
                        replayStation();
                      }}
                      className="flex flex-1 items-center justify-center gap-2 rounded-2xl border-[3px] border-[#061534] px-4 py-3 font-black text-white shadow-lg"
                      style={{ background: "var(--gradient-orange)" }}
                    >
                      <RotateCcw className="h-5 w-5" strokeWidth={3} />
                      Ulang Kaji
                    </motion.button>
                  )}

                  {selectedStatus === "locked" && (
                    <button
                      onClick={() => {
                        playClick();
                        setSelectedIndex(null);
                      }}
                      className="flex flex-1 items-center justify-center rounded-2xl border-[3px] border-[#061534] bg-white/10 px-4 py-3 font-black text-white transition-colors hover:bg-white/20"
                    >
                      Faham
                    </button>
                  )}
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* popup scroll fakta */}
        <AnimatePresence>
          {bottleOpen !== null && (
            <motion.div
              className="absolute inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setBottleOpen(null)}
            >
              <motion.div
                initial={{ scale: 0.5, opacity: 0, y: 40 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                exit={{ scale: 0.5, opacity: 0, y: 40 }}
                transition={{ duration: 0.35, ease: [0.34, 1.56, 0.64, 1] }}
                className="relative flex flex-col items-center"
                onClick={(e) => e.stopPropagation()}
              >
                {/* scroll close → open animation */}
                <div className="relative h-[580px] w-[540px]">
                  <AnimatePresence mode="wait">
                    {scrollPhase === "closed" ? (
                      <motion.img
                        key="closed"
                        src={scrollCloseImg}
                        alt=""
                        className="absolute inset-0 h-full w-full object-contain"
                        initial={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.8, y: -10 }}
                        transition={{ duration: 0.3 }}
                      />
                    ) : (
                      <motion.div
                        key="open"
                        className="relative h-full w-full"
                        initial={{ opacity: 0, scale: 0.8, y: 10 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        transition={{ duration: 0.35, ease: [0.34, 1.56, 0.64, 1] }}
                      >
                        <img
                          src={scrollOpenImg}
                          alt=""
                          className="absolute inset-0 h-full w-full object-contain"
                        />
                        {/* teks fakta atas scroll */}
                        <div className="absolute inset-0 flex items-center justify-center px-10 py-16">
                          <p className="text-center font-display text-base font-black leading-snug text-[#5b2509]">
                            {bottleFacts[bottleOpen].fact}
                          </p>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                {/* close button */}
                <motion.button
                  whileHover={{ scale: 1.08 }}
                  whileTap={{ scale: 0.94 }}
                  onClick={() => {
                    playClick();
                    setBottleOpen(null);
                  }}
                  className="mt-2 rounded-2xl border-[3px] border-[#7c2d12] px-6 py-2 font-display font-black text-white shadow-md"
                  style={{ background: "var(--gradient-orange)" }}
                >
                  Tutup
                </motion.button>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* obstacle dialog */}
        <AnimatePresence>
          {obstacleDialog !== null && (
            <motion.div
              className="absolute inset-0 z-50 flex items-center justify-center bg-black/65 backdrop-blur-sm"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <div className="flex w-full max-w-[min(96vw,720px)] items-center justify-center px-2">
                {/* scroll */}
                <motion.div
                  className="relative"
                  initial={{ scale: 0.5, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0.5, opacity: 0 }}
                  transition={{ duration: 0.4, ease: [0.34, 1.56, 0.64, 1], delay: 0.1 }}
                >
                  <AnimatePresence mode="wait">
                    {dialogScrollPhase === "closed" ? (
                      <motion.img
                        key="closed"
                        src={scrollCloseImg}
                        alt=""
                        className="h-72 w-auto object-contain sm:h-[520px]"
                        exit={{ opacity: 0, scale: 0.85 }}
                        transition={{ duration: 0.25 }}
                      />
                    ) : (
                      <motion.div
                        key="open"
                        className="relative"
                        initial={{ opacity: 0, scale: 0.85 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.3, ease: [0.34, 1.56, 0.64, 1] }}
                      >
                        <img
                          src={scrollOpenImg}
                          alt=""
                          className="h-72 w-auto object-contain sm:h-[520px]"
                        />
                        {/* kandungan dalam scroll */}
                        <div className="absolute inset-0 flex flex-col items-center justify-center px-16 py-16 sm:px-28 sm:py-24">
                          {/* gambar obstacle */}
                          <motion.img
                            src={obstacleImg1}
                            alt="halangan"
                            className="mb-3 h-24 w-auto rounded-xl object-contain sm:mb-4 sm:h-40"
                            initial={{ scale: 0, rotate: -8 }}
                            animate={{ scale: 1, rotate: 0 }}
                            transition={{ delay: 0.3, type: "spring", bounce: 0.5 }}
                          />
                          <p className="mb-2 text-center font-display text-sm font-black leading-snug text-[#7c2d12] sm:mb-3 sm:text-xl">
                            ⚠️ Halangan di hadapan!
                          </p>
                          <p className="mb-3 text-center font-display text-[10px] font-black leading-snug text-[#5b2509] sm:mb-5 sm:text-sm">
                            Kamu mesti melalui pulau halangan ini untuk meneruskan perjalanan ke
                            level seterusnya!
                          </p>
                          <motion.button
                            whileHover={{ scale: 1.06 }}
                            whileTap={{ scale: 0.94 }}
                            onClick={() => {
                              playClick();
                              startObstacleChallenge(obstacleDialog);
                            }}
                            className="rounded-2xl border-[3px] border-[#7c2d12] px-5 py-2 font-display text-xs font-black text-white shadow-md sm:px-8 sm:py-3 sm:text-base"
                            style={{ background: "var(--gradient-orange)" }}
                          >
                            Mula Cabaran!
                          </motion.button>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
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
