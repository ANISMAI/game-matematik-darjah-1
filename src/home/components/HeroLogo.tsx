import { motion } from "framer-motion";
import { Play } from "lucide-react";
const characters = "/home/images/ninja-characters.webp";

const subjectMap: Record<string, { title: string; subtitle: string }> = {
  Matematik: { title: "MATH", subtitle: "Matematik Seronok" },
  Sains: { title: "SCIENCE", subtitle: "Sains Seronok" },
  Sejarah: { title: "HISTORY", subtitle: "Sejarah Seronok" },
  "Bahasa Melayu": { title: "BM", subtitle: "Bahasa Melayu Seronok" },
  "Bahasa Inggeris": { title: "ENGLISH", subtitle: "English Seronok" },
};

export function HeroLogo({
  subject,
  onPlay,
  onMission,
  onShop,
}: {
  subject: string;
  onPlay: () => void;
  onMission: () => void;
  onShop: () => void;
}) {
  const mapped = subjectMap[subject] ?? { title: "MATH", subtitle: "Matematik Seronok" };

  return (
    <div className="relative flex flex-col items-center">
      {/* Characters */}
      <motion.img
        src={characters}
        alt="Watak ninja"
        width={896}
        height={896}
        className="dojo-hero-characters pointer-events-none relative z-10 h-48 w-auto drop-shadow-[0_18px_20px_rgba(0,0,0,0.45)] sm:h-64 md:h-72 lg:h-80"
        animate={{ y: [0, -10, 0] }}
        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
      />

      {/* Wooden signboard with title */}
      <motion.div
        key={subject}
        initial={{ opacity: 0, y: 20, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="relative z-20 -mt-6"
      >
        <div
          className="dojo-hero-sign relative rounded-3xl border-4 border-[oklch(0.32_0.07_45)] px-8 py-4 text-center shadow-[var(--shadow-game)] sm:px-12 sm:py-5"
          style={{
            background:
              "linear-gradient(180deg, oklch(0.62 0.12 55) 0%, oklch(0.48 0.12 45) 50%, oklch(0.42 0.1 40) 100%)",
          }}
        >
          {/* wood grain hint */}
          <div className="pointer-events-none absolute inset-0 rounded-2xl opacity-20 [background-image:repeating-linear-gradient(180deg,transparent_0,transparent_6px,rgba(0,0,0,0.35)_6px,rgba(0,0,0,0.35)_7px)]" />
          <h1 className="relative font-display text-4xl font-black leading-none tracking-wide text-ninja-yellow text-stroke-navy sm:text-5xl md:text-6xl">
            YOU <span className="text-white">EDU</span>
            <span className="ml-2 inline-block rounded-xl bg-ninja-orange px-3 py-1 text-3xl text-white text-stroke-navy sm:text-4xl md:text-5xl">
              {mapped.title}
            </span>
          </h1>
          <p className="relative mt-2 font-bold text-white text-shadow-strong">
            Latihan Ninja • {mapped.subtitle}
          </p>
        </div>
        {/* shuriken decor */}
        <Shuriken className="absolute -left-10 top-1/2 h-12 w-12 -translate-y-1/2 text-white/90" spin />
      </motion.div>

      {/* Action buttons row */}
      <div className="dojo-hero-actions relative z-20 mt-8 flex items-center gap-4">
        {/* Misi Harian */}
        <motion.button
          onClick={onMission}
          whileHover={{ scale: 1.06, y: -2 }}
          whileTap={{ scale: 0.94 }}
          className="relative flex w-24 items-center justify-center gap-2 rounded-xl border-[3px] border-ninja-navy-deep px-4 py-3 text-white shadow-[var(--shadow-game)]"
          style={{ background: "var(--mission-solid)" }}
          aria-label="Misi Harian"
        >
          <span className="text-xl">📝</span>
          <span className="text-sm font-black">Misi</span>
          <span className="absolute -right-1 -top-1 grid h-4 w-4 place-items-center rounded-full bg-red-500 text-[9px] font-black text-white">3</span>
        </motion.button>

        {/* Play button - besar */}
        <motion.button
          onClick={onPlay}
          whileHover={{ scale: 1.06, y: -4 }}
          whileTap={{ scale: 0.94, y: 2 }}
          animate={{ y: [0, -6, 0] }}
          transition={{ y: { duration: 2.4, repeat: Infinity, ease: "easeInOut" } }}
          className="group relative z-20 grid h-24 w-24 place-items-center rounded-3xl border-4 border-ninja-navy-deep text-primary-foreground sm:h-28 sm:w-28"
          style={{
            background: "var(--gradient-orange)",
            boxShadow: "var(--shadow-game), var(--shadow-glow-orange)",
          }}
          aria-label="Mula main"
        >
          <span className="absolute inset-0 -z-10 rounded-3xl animate-pulse-glow" />
          <Play className="h-12 w-12 fill-current drop-shadow-md" strokeWidth={0} />
        </motion.button>

        {/* Kedai */}
        <motion.button
          onClick={onShop}
          whileHover={{ scale: 1.06, y: -2 }}
          whileTap={{ scale: 0.94 }}
          className="flex w-24 items-center justify-center gap-2 rounded-xl border-[3px] border-ninja-navy-deep px-4 py-3 text-ninja-yellow shadow-[var(--shadow-game)]"
          style={{ background: "var(--gradient-orange)" }}
          aria-label="Kedai"
        >
          <span className="text-xl">🏪</span>
          <span className="text-sm font-black">Kedai</span>
        </motion.button>
      </div>
    </div>
  );
}

function Shuriken({ className, spin }: { className?: string; spin?: boolean }) {
  return (
    <motion.svg
      viewBox="0 0 100 100"
      className={className}
      animate={spin ? { rotate: 360 } : undefined}
      transition={spin ? { duration: 8, repeat: Infinity, ease: "linear" } : undefined}
    >
      <path
        d="M50 8 L58 42 L92 50 L58 58 L50 92 L42 58 L8 50 L42 42 Z"
        fill="currentColor"
        stroke="oklch(0.18 0.04 265)"
        strokeWidth="4"
        strokeLinejoin="round"
      />
      <circle cx="50" cy="50" r="6" fill="oklch(0.18 0.04 265)" />
    </motion.svg>
  );
}

