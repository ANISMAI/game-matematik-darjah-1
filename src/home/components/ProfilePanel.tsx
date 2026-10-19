import { motion, AnimatePresence } from "framer-motion";
import { Flame, Gem, X } from "lucide-react";
import { useState } from "react";
import type { Equipped } from "./KedaiModal";
import { GELARAN } from "./KedaiModal";

const BP_LS_KEY = "battlepass_progress";
const TIER_DEFS = [
  { tier: 1, stagesNeeded: 2,  rewards: ["💰 50 Coin"] },
  { tier: 2, stagesNeeded: 4,  rewards: ["💰 75 Coin", "🏷️ Pejuang Hutan"] },
  { tier: 3, stagesNeeded: 6,  rewards: ["💰 100 Coin", "🖼️ Frame Baru"] },
  { tier: 4, stagesNeeded: 8,  rewards: ["💰 150 Coin"] },
  { tier: 5, stagesNeeded: 10, rewards: ["💰 200 Coin", "🥷 Avatar Ninja Merah"] },
];
function loadBP() {
  try { const r = localStorage.getItem(BP_LS_KEY); if (r) return JSON.parse(r); } catch {}
  return { stagesCleared: 0, tier: 0 };
}

// Background
const bgCharacter = "/home/character/bg-character.webp";

// Character images
const char1 = "/home/character/character1.webp";
const char2 = "/home/character/character2.webp";
const char3 = "/home/character/character3.webp";
const char4 = "/home/character/character4.webp";
const char5 = "/home/character/character5.webp";
const char6 = "/home/character/character6.webp";
const char7 = "/home/character/character7.webp";
const char8 = "/home/character/character8.webp";
const charR1 = "/home/character/character-R1.webp";
const charR2 = "/home/character/character-R2.webp";
const charR3 = "/home/character/character-R3.webp";
const charR4 = "/home/character/character-R4.webp";
const charP1 = "/home/character/character-P1.webp";
const charP2 = "/home/character/character-P2.webp";
const charP3 = "/home/character/character-P3.webp";

// Frame images
const frameB1 = "/home/frame/frame-B1.webp";
const frameB2 = "/home/frame/frame-B2.webp";
const frameB3 = "/home/frame/frame-B3.webp";
const frameR1 = "/home/frame/frame-R1.webp";
const frameR2 = "/home/frame/frame-R2.webp";
const frameP1 = "/home/frame/frame-P1.webp";

const AVATAR_IMG: Record<string, string> = {
  "av-1": char1, "av-2": char2, "av-3": char3, "av-4": char4,
  "av-5": char5, "av-6": char6, "av-7": char7, "av-8": char8,
  "av-r1": charR1, "av-r2": charR2, "av-r3": charR3, "av-r4": charR4,
  "av-l1": charP1, "av-l2": charP2, "av-l3": charP3,
};

const FRAME_IMG: Record<string, string> = {
  "fr-default": frameB1,
  "fr-sakura":  frameB2,
  "fr-fire":    frameB3,
  "fr-ocean":   frameR1,
  "fr-gold":    frameR2,
  "fr-dragon":  frameP1,
};


export function ProfilePanel({
  username = "mad",
  points = 0,
  streak = 2,
  equipped,
}: {
  username?: string;
  points?: number;
  streak?: number;
  equipped?: Equipped;
}) {
  const [profileOpen, setProfileOpen] = useState(false);
  const bp = loadBP();
  const currentTier = bp.tier as number;
  const stagesCleared = bp.stagesCleared as number;
  const nextTier = TIER_DEFS[currentTier] ?? null;
  const avatarId  = equipped?.avatar  ?? "av-1";
  const bingkaiId = equipped?.bingkai ?? "fr-default";
  const gelaranId = equipped?.gelaran ?? "gl-default";
  const gelaranData = GELARAN.find(g => g.id === gelaranId) ?? GELARAN[0];
  const charImg  = AVATAR_IMG[avatarId];
  const frameImg = FRAME_IMG[bingkaiId];

  return (
    <>
    <div className="pointer-events-auto flex w-64 flex-col gap-3">
      {/* Profile card — clickable */}
      <motion.button
        onClick={() => setProfileOpen(true)}
        animate={{ y: [0, -6, 0] }}
        transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
        whileHover={{ scale: 1.02 }}
        className="group relative rounded-3xl border-[3px] p-4 text-left shadow-[var(--shadow-game)]"
        style={{
          background: "var(--card-solid)",
          borderColor: "var(--card-gold-border)",
        }}
      >
        <div
          className="pointer-events-none absolute inset-x-0 top-0 h-16 rounded-t-[20px]"
          style={{ background: "linear-gradient(180deg, rgba(255,255,255,0.06) 0%, transparent 100%)" }}
        />
        <div className="relative z-10 flex items-center gap-3">

          {/* Avatar + Frame composite */}
          <div className="relative shrink-0">
            {/* pulse glow */}
            <div className="absolute inset-0 -m-1 animate-pulse rounded-full bg-ninja-orange/50 blur-md" />

            {/* outer wrapper — frame sits here, sized to 72px */}
            <div className="relative h-[72px] w-[72px]">

              {/* inner circle — inset by 8px so char sits inside frame border area */}
              <div
                className="absolute inset-[8px] overflow-hidden rounded-full"
                style={{
                  ...(frameImg ? {} : {
                    border: "3px solid var(--card-gold-border)",
                    boxShadow: "var(--shadow-glow-orange)",
                  }),
                }}
              >
                {/* bg image */}
                <img
                  src={bgCharacter}
                  alt=""
                  aria-hidden
                  className="absolute inset-0 h-full w-full object-cover"
                />
                {/* character */}
                {charImg && (
                  <motion.img
                    key={avatarId}
                    src={charImg}
                    alt={username}
                    className="absolute inset-0 h-full w-full object-contain"
                    initial={{ opacity: 0, scale: 0.85 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.35, ease: "easeOut" }}
                  />
                )}
              </div>

              {/* Frame overlay — fills the full 72px wrapper */}
              {frameImg && (
                <motion.img
                  key={bingkaiId}
                  src={frameImg}
                  alt=""
                  aria-hidden
                  className="pointer-events-none absolute inset-0 z-10 h-full w-full object-contain"
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.35, ease: "easeOut" }}
                />
              )}
            </div>
          </div>

          <div className="flex-1">
            <p className="font-display text-lg font-black leading-tight text-white text-shadow-strong">
              {username}
            </p>
            <motion.div
              key={gelaranId}
              className="relative mt-1 inline-flex items-center justify-center"
              initial={{ opacity: 0, scale: 0.85 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3 }}
            >
              <img src={gelaranData.img} alt={gelaranData.name} className="h-10 w-auto object-contain" style={{ minWidth: "120px" }} />
              <span className="absolute font-black text-white text-[9px] uppercase tracking-wide whitespace-nowrap"
                style={{ textShadow: "0 1px 4px rgba(0,0,0,0.9)" }}>
                {gelaranData.name}
              </span>
            </motion.div>
          </div>
        </div>
      </motion.button>

      {/* Stats card */}
      <motion.div
        whileHover={{ scale: 1.01 }}
        className="relative rounded-3xl border-[3px] p-4 shadow-[var(--shadow-game)]"
        style={{
          background: "var(--card-solid-alt)",
          borderColor: "var(--card-gold-border)",
        }}
      >
        <div
          className="pointer-events-none absolute inset-x-0 top-0 h-12 rounded-t-[20px]"
          style={{ background: "linear-gradient(180deg, rgba(255,255,255,0.05) 0%, transparent 100%)" }}
        />
        <p className="relative z-10 font-display text-xs font-black uppercase tracking-[0.2em] text-ninja-yellow text-shadow-readable">
          Stats
        </p>
        <div className="relative z-10 mt-2 h-px w-full bg-white/15" />
        <div className="relative z-10 mt-3 space-y-3">
          <StatRow
            icon={<Gem className="h-4 w-4" />}
            iconBg="bg-ninja-green/25 text-ninja-green"
            label="Points"
            value={points.toLocaleString()}
          />
          <StatRow
            icon={<Flame className="h-4 w-4" />}
            iconBg="bg-ninja-fire/25 text-ninja-fire"
            label="Streak"
            value={`${streak} days`}
            progress={Math.min(streak / 7, 1)}
          />
        </div>
      </motion.div>
    </div>

    {/* Profile Modal Popup */}
    <AnimatePresence>
      {profileOpen && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center px-4"
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        >
          <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={() => setProfileOpen(false)} />
          <motion.div
            className="relative w-full max-w-sm rounded-3xl border-[3px] p-6 shadow-2xl"
            style={{ background: "var(--card-solid)", borderColor: "var(--card-gold-border)" }}
            initial={{ scale: 0.85, y: 30 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.85, y: 30 }}
            transition={{ type: "spring", stiffness: 300, damping: 25 }}
          >
            {/* Close */}
            <button onClick={() => setProfileOpen(false)}
              className="absolute right-4 top-4 grid h-8 w-8 place-items-center rounded-full bg-white/10 text-white/60 hover:bg-white/20 hover:text-white transition-colors">
              <X className="h-4 w-4" />
            </button>

            {/* Avatar + name */}
            <div className="flex flex-col items-center gap-3 mb-5">
              <div className="relative h-24 w-24">
                <div className="absolute inset-0 -m-1 animate-pulse rounded-full bg-ninja-orange/40 blur-md" />
                <div className="absolute inset-[10px] overflow-hidden rounded-full border-2 border-yellow-400/60">
                  <img src={bgCharacter} alt="" className="absolute inset-0 h-full w-full object-cover" />
                  {charImg && <img src={charImg} alt={username} className="absolute inset-0 h-full w-full object-contain" />}
                </div>
                {frameImg && <img src={frameImg} alt="" className="pointer-events-none absolute inset-0 h-full w-full object-contain z-10" />}
              </div>
              <div className="text-center">
                <p className="font-display text-2xl font-black text-white">{username}</p>
                <div className="relative mt-1 inline-flex items-center justify-center">
                  <img src={gelaranData.img} alt={gelaranData.name} className="h-9 w-auto object-contain" style={{ minWidth: "110px" }} />
                  <span className="absolute font-black text-white text-[9px] uppercase tracking-wide whitespace-nowrap" style={{ textShadow: "0 1px 4px rgba(0,0,0,0.9)" }}>
                    {gelaranData.name}
                  </span>
                </div>
              </div>
            </div>

            <div className="h-px w-full bg-white/15 mb-4" />

            {/* Stats */}
            <div className="grid grid-cols-2 gap-3 mb-4">
              {[
                { icon: "💎", label: "Points", value: points.toLocaleString() },
                { icon: "🔥", label: "Streak", value: `${streak} hari` },
                { icon: "🥷", label: "BP Tier", value: `${currentTier}/5` },
                { icon: "🗺️", label: "Stage", value: `${stagesCleared}/10` },
              ].map(s => (
                <div key={s.label} className="flex flex-col items-center gap-1 rounded-2xl border border-white/10 bg-white/5 py-3 px-2">
                  <span className="text-xl">{s.icon}</span>
                  <span className="font-display text-lg font-black text-white">{s.value}</span>
                  <span className="text-[10px] font-bold uppercase tracking-wide text-white/40">{s.label}</span>
                </div>
              ))}
            </div>

            {/* Battle Pass progress */}
            <div className="rounded-2xl border border-yellow-400/20 bg-yellow-400/5 p-3">
              <p className="text-[10px] font-black uppercase tracking-widest text-yellow-400/70 mb-2">Battle Pass · Season 1</p>
              <div className="flex justify-between mb-2">
                {TIER_DEFS.map(t => (
                  <div key={t.tier} className={`h-7 w-7 rounded-full flex items-center justify-center text-[10px] font-black border-2 ${
                    currentTier >= t.tier ? "bg-yellow-400 border-yellow-300 text-black" : "bg-white/10 border-white/20 text-white/30"
                  }`}>
                    {currentTier >= t.tier ? "✓" : t.tier}
                  </div>
                ))}
              </div>
              <div className="h-2 w-full overflow-hidden rounded-full bg-white/10">
                <motion.div className="h-full rounded-full" style={{ background: "linear-gradient(90deg,#fbbf24,#f59e0b)" }}
                  animate={{ width: `${(stagesCleared / 10) * 100}%` }} transition={{ duration: 0.9 }} />
              </div>
              <p className="mt-1.5 text-center text-[10px] text-white/40">{stagesCleared}/10 Stage · Tier {currentTier}/5</p>
              {nextTier && (
                <div className="mt-2 text-center">
                  <p className="text-[9px] text-white/30 uppercase tracking-widest">Reward seterusnya</p>
                  <p className="text-[11px] font-bold text-yellow-200/70">{nextTier.rewards.join(" · ")}</p>
                </div>
              )}
              {currentTier >= 5 && (
                <p className="mt-2 text-center text-xs font-black text-yellow-400">🏆 Battle Pass Selesai!</p>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
    </>
  );
}

function StatRow({
  icon,
  iconBg,
  label,
  value,
  progress,
}: {
  icon: React.ReactNode;
  iconBg: string;
  label: string;
  value: string;
  progress?: number;
}) {
  return (
    <div>
      <div className="flex items-center justify-between text-sm">
        <span className="flex items-center gap-2 font-bold text-white text-shadow-readable">
          <span className={`grid h-7 w-7 place-items-center rounded-full ${iconBg}`}>
            {icon}
          </span>
          {label}
        </span>
        <span className="font-display text-base font-black text-white text-shadow-strong">
          {value}
        </span>
      </div>
      {progress !== undefined && (
        <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-white/15">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${progress * 100}%` }}
            transition={{ duration: 0.9, ease: "easeOut" }}
            className="h-full rounded-full"
            style={{ background: "var(--gradient-orange)" }}
          />
        </div>
      )}
    </div>
  );
}
