import { motion } from "framer-motion";
const characters = "/home/images/ninja-characters.webp";

const subjectMap: Record<string, { title: string; subtitle: string }> = {
  Matematik: { title: "MATH", subtitle: "Matematik Seronok" },
  Sains: { title: "SCIENCE", subtitle: "Sains Seronok" },
  Sejarah: { title: "HISTORY", subtitle: "Sejarah Seronok" },
  "Bahasa Melayu": { title: "BM", subtitle: "Bahasa Melayu Seronok" },
  "Bahasa Inggeris": { title: "ENGLISH", subtitle: "English Seronok" },
};

// Papan kayu logo di tengah-atas (tidak penuh selebar).
export function HeroBanner({ subject }: { subject: string }) {
  const mapped = subjectMap[subject] ?? { title: "MATH", subtitle: "Matematik Seronok" };

  return (
    <motion.div
      key={subject}
      initial={{ opacity: 0, y: -16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
      className="flex w-full justify-center"
    >
      <div
        className="dojo-hero-sign relative flex items-center gap-3 rounded-b-3xl border-4 border-t-0 border-[oklch(0.32_0.07_45)] px-8 py-3 text-center shadow-[var(--shadow-game)]"
        style={{
          background:
            "linear-gradient(180deg, oklch(0.62 0.12 55) 0%, oklch(0.48 0.12 45) 50%, oklch(0.42 0.1 40) 100%)",
        }}
      >
        {/* wood grain hint */}
        <div className="pointer-events-none absolute inset-0 rounded-b-[20px] opacity-20 [background-image:repeating-linear-gradient(180deg,transparent_0,transparent_6px,rgba(0,0,0,0.35)_6px,rgba(0,0,0,0.35)_7px)]" />
        <Shuriken className="relative h-8 w-8 shrink-0 text-white/90" spin />
        <div className="relative">
          <h1 className="font-display text-3xl font-black leading-none tracking-wide text-ninja-yellow text-stroke-navy sm:text-4xl md:text-5xl">
            YOU <span className="text-white">EDU</span>
            <span className="ml-2 inline-block rounded-xl bg-ninja-orange px-3 py-1 text-2xl text-white text-stroke-navy sm:text-3xl md:text-4xl">
              {mapped.title}
            </span>
          </h1>
          <p className="mt-1 font-bold text-white text-shadow-strong">Latihan Ninja • {mapped.subtitle}</p>
        </div>
        <Shuriken className="relative h-8 w-8 shrink-0 text-white/90" spin />
      </div>
    </motion.div>
  );
}

// Watak ninja sahaja — diletak di tengah skrin.
export function HeroCharacters() {
  return (
    <motion.img
      src={characters}
      alt="Watak ninja"
      width={896}
      height={896}
      className="dojo-hero-characters pointer-events-none h-60 w-auto drop-shadow-[0_22px_26px_rgba(0,0,0,0.5)] sm:h-80 md:h-96 lg:h-[30rem]"
      animate={{ y: [0, -10, 0] }}
      transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
    />
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

