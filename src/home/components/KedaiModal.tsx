import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, ShoppingBag, User, Frame, Zap, Music, Check, Lock, CreditCard, Gem } from "lucide-react";
import clickSound from "../assets/sounds/click-sound.mp3";
import dingSound from "../assets/sounds/ding-sound.mp3";
import taikoDrumSound from "../assets/sounds/taiko-drum-sound.mp3";

// Title/Gelaran assets
const titleT1 = "/home/titleprofile/T1.webp";
const titleT2 = "/home/titleprofile/T2.webp";
const titleT3 = "/home/titleprofile/T3.webp";
const titleT4 = "/home/titleprofile/T4.webp";
const titleT5 = "/home/titleprofile/T5.webp";

// Frame assets
const frameB1 = "/home/frame/frame-B1.webp";
const frameB2 = "/home/frame/frame-B2.webp";
const frameB3 = "/home/frame/frame-B3.webp";
const frameR1 = "/home/frame/frame-R1.webp";
const frameR2 = "/home/frame/frame-R2.webp";
const frameP1 = "/home/frame/frame-P1.webp";

// Character assets — Biasa
const bgCharacter = "/home/character/bg-character.webp";
const char1 = "/home/character/character1.webp";
const char2 = "/home/character/character2.webp";
const char3 = "/home/character/character3.webp";
const char4 = "/home/character/character4.webp";
const char5 = "/home/character/character5.webp";
const char6 = "/home/character/character6.webp";
const char7 = "/home/character/character7.webp";
const char8 = "/home/character/character8.webp";
// Character assets — Rare
const charR1 = "/home/character/character-R1.webp";
const charR2 = "/home/character/character-R2.webp";
const charR3 = "/home/character/character-R3.webp";
const charR4 = "/home/character/character-R4.webp";
// Character assets — Premium (Legenda)
const charP1 = "/home/character/character-P1.webp";
const charP2 = "/home/character/character-P2.webp";
const charP3 = "/home/character/character-P3.webp";

type Tab = "avatar" | "bingkai" | "gelaran" | "audio" | "topup";
type AudioTab = "muzik" | "sound";
type Tier = "biasa" | "rare" | "legenda";
type Currency = "coin" | "gem";

interface AvatarItem {
  id: string;
  name: string;
  title: string;
  price: number;
  currency: Currency;
  tier: Tier;
  img: string | null;   // null = placeholder (asset belum ada)
  color: string;
  gradient: string;
  owned?: boolean;
}

interface ShopItem {
  id: string;
  name: string;
  price: number;
  currency?: Currency;
  emoji: string;
  desc: string;
  owned?: boolean;
}

interface BingkaiItem {
  id: string;
  name: string;
  desc: string;
  price: number;
  currency: Currency;
  tier: Tier;
  img: string | null;
  color: string;
  owned?: boolean;
}

// ── Tier config ───────────────────────────────────────────────────────────────
const TIER_CONFIG: Record<Tier, { label: string; color: string; bg: string; glow: string; badge: string }> = {
  biasa:  { label: "Biasa",   color: "#94a3b8", bg: "rgba(148,163,184,0.12)", glow: "#94a3b844", badge: "bg-slate-500/60" },
  rare:   { label: "Rare",    color: "#a78bfa", bg: "rgba(167,139,250,0.15)", glow: "#a78bfa55", badge: "bg-violet-600/70" },
  legenda:{ label: "Legenda", color: "#fbbf24", bg: "rgba(251,191,36,0.15)",  glow: "#fbbf2455", badge: "bg-amber-500/70"  },
};

// ── Avatar data ───────────────────────────────────────────────────────────────
const AVATARS: AvatarItem[] = [
  // ── BIASA (Coin) ──
  {
    id: "av-1", name: "Ninja Api",       title: "Penguasa Api",        tier: "biasa",
    price: 0,   currency: "coin", img: char1,
    color: "#ef4444", gradient: "linear-gradient(160deg,#7f1d1d 0%,#1c0505 100%)", owned: true,
  },
  {
    id: "av-2", name: "Ninja Hutan",     title: "Pelindung Alam",      tier: "biasa",
    price: 250, currency: "coin", img: char2,
    color: "#22c55e", gradient: "linear-gradient(160deg,#14532d 0%,#052010 100%)",
  },
  {
    id: "av-3", name: "Ninja Ais",       title: "Tuan Salji",          tier: "biasa",
    price: 300, currency: "coin", img: char3,
    color: "#38bdf8", gradient: "linear-gradient(160deg,#075985 0%,#020f1a 100%)",
  },
  {
    id: "av-4", name: "Ninja Kilat",     title: "Pantas Bagai Petir",  tier: "biasa",
    price: 350, currency: "coin", img: char4,
    color: "#facc15", gradient: "linear-gradient(160deg,#713f12 0%,#1c0e02 100%)",
  },
  {
    id: "av-5", name: "Samurai",         title: "Pahlawan Sejati",     tier: "biasa",
    price: 400, currency: "coin", img: char5,
    color: "#f97316", gradient: "linear-gradient(160deg,#7c2d12 0%,#1c0705 100%)",
  },
  {
    id: "av-6", name: "Chef Ninja",      title: "Tukang Masak Dojo",   tier: "biasa",
    price: 300, currency: "coin", img: char6,
    color: "#fb923c", gradient: "linear-gradient(160deg,#431407 0%,#120703 100%)",
  },
  {
    id: "av-7", name: "Ninja Penyembuh", title: "Penjaga Nyawa",       tier: "biasa",
    price: 450, currency: "coin", img: char7,
    color: "#2dd4bf", gradient: "linear-gradient(160deg,#134e4a 0%,#021412 100%)",
  },
  {
    id: "av-8", name: "Ninja Pemanah",   title: "Bidikan Tepat",       tier: "biasa",
    price: 500, currency: "coin", img: char8,
    color: "#86efac", gradient: "linear-gradient(160deg,#166534 0%,#021a0a 100%)",
  },

  // ── RARE (Gem) ──
  {
    id: "av-r1", name: "Moon Blade",     title: "Pedang Bulan",        tier: "rare",
    price: 30,  currency: "gem",  img: charR1,
    color: "#60a5fa", gradient: "linear-gradient(160deg,#1e3a5f 0%,#0a1628 100%)",
  },
  {
    id: "av-r2", name: "Deep Sea Ninja", title: "Penguasa Lautan",     tier: "rare",
    price: 35,  currency: "gem",  img: charR2,
    color: "#22d3ee", gradient: "linear-gradient(160deg,#164e63 0%,#041522 100%)",
  },
  {
    id: "av-r3", name: "Dragon Ninja",   title: "Penakluk Naga",       tier: "rare",
    price: 40,  currency: "gem",  img: charR3,
    color: "#4ade80", gradient: "linear-gradient(160deg,#14532d 0%,#0a2e1a 100%)",
  },
  {
    id: "av-r4", name: "Shadow Phantom", title: "Bayangan Maut",       tier: "rare",
    price: 45,  currency: "gem",  img: charR4,
    color: "#a78bfa", gradient: "linear-gradient(160deg,#3b0764 0%,#110520 100%)",
  },

  // ── LEGENDA / PREMIUM (Gem mahal) ──
  {
    id: "av-l1", name: "Grand Samurai",  title: "Pahlawan Agung",      tier: "legenda",
    price: 80,  currency: "gem",  img: charP1,
    color: "#fbbf24", gradient: "linear-gradient(160deg,#78350f 0%,#1c0a02 100%)",
  },
  {
    id: "av-l2", name: "Grandmaster",    title: "Tuan Dojo Tertinggi", tier: "legenda",
    price: 100, currency: "gem",  img: charP2,
    color: "#c4b5fd", gradient: "linear-gradient(160deg,#3b0764 0%,#0f0420 100%)",
  },
  {
    id: "av-l3", name: "Ninja Sakura",   title: "Bidadari Dojo",       tier: "legenda",
    price: 100, currency: "gem",  img: charP3,
    color: "#e879f9", gradient: "linear-gradient(160deg,#701a75 0%,#1a0525 100%)",
  },
];

// ── Bingkai (frame) data ──────────────────────────────────────────────────────
const BINGKAI: BingkaiItem[] = [
  // ── BIASA (Coin) ──
  {
    id: "fr-default", name: "Bingkai Ninja",  desc: "Bingkai shuriken percuma.",
    price: 0, currency: "coin", tier: "biasa", img: frameB1,
    color: "#ef4444", owned: true,
  },
  {
    id: "fr-sakura",  name: "Sakura Bloom",   desc: "Bingkai bunga sakura yang anggun.",
    price: 250, currency: "coin", tier: "biasa", img: frameB2,
    color: "#f472b6", owned: true,
  },
  {
    id: "fr-fire",    name: "Bingkai Api",    desc: "Bingkai berapi untuk ninja perkasa.",
    price: 350, currency: "coin", tier: "biasa", img: frameB3,
    color: "#f97316",
  },
  // ── RARE (Gem) ──
  {
    id: "fr-ocean",   name: "Ocean Tide",     desc: "Bingkai ombak lautan yang tenang.",
    price: 25, currency: "gem", tier: "rare", img: frameR1,
    color: "#38bdf8",
  },
  {
    id: "fr-gold",    name: "Golden Warrior", desc: "Bingkai emas untuk ninja terkuat.",
    price: 35, currency: "gem", tier: "rare", img: frameR2,
    color: "#fbbf24",
  },
  // ── LEGENDA (Gem mahal) ──
  {
    id: "fr-dragon",  name: "Dragon Emperor", desc: "Bingkai naga hijau yang melegenda.",
    price: 80, currency: "gem", tier: "legenda", img: frameP1,
    color: "#4ade80",
  },
];

const POWERUPS: ShopItem[] = [
  { id: "pu-hint",   name: "Petunjuk Ninja",  price: 50,  emoji: "💡", desc: "Bagi petunjuk untuk soalan susah. 3x guna." },
  { id: "pu-5050",   name: "50/50 Shuriken",  price: 80,  emoji: "🎯", desc: "Buang 2 jawapan salah. 3x guna." },
  { id: "pu-time",   name: "Tambah Masa",     price: 60,  emoji: "⏰", desc: "Tambah +30 saat masa menjawab. 3x guna." },
  { id: "pu-shield", name: "Perisai Ninja",   price: 100, emoji: "🛡️", desc: "Lindungi dari jawapan salah sekali. 1x guna." },
  { id: "pu-double", name: "Coin Berganda",   price: 120, emoji: "🪙", desc: "Gandakan coin yang dapat 1 sesi. 1x guna." },
];

const MUZIK: ShopItem[] = [
  { id: "mu-default", name: "Lagu Dojo",     price: 0,   emoji: "🎵", desc: "Muzik asal dojo ninja.", owned: true },
  { id: "mu-battle",  name: "Battle Drum",   price: 150, emoji: "🎶", desc: "Irama perang yang bersemangat." },
  { id: "mu-sakura",  name: "Sakura Melody", price: 200, emoji: "🎵", desc: "Melodi tenang bunga sakura." },
  { id: "mu-thunder", name: "Thunder Storm", price: 250, emoji: "🎶", desc: "Muzik ribut petir yang epik." },
];

const SOUND: ShopItem[] = [
  { id: "sfx-default", name: "Pack Asal",     price: 0,   emoji: "🔊", desc: "Set bunyi asal dojo ninja.", owned: true },
  { id: "sfx-blade",   name: "Pack Pedang",   price: 100, emoji: "🔊", desc: "Bunyi tebasan pedang yang tajam." },
  { id: "sfx-thunder", name: "Pack Petir",    price: 150, emoji: "🔊", desc: "Bunyi guruh dan kilat yang menggerun." },
  { id: "sfx-nature",  name: "Pack Alam",     price: 200, emoji: "🔊", desc: "Bunyi bambu dan alam semulajadi." },
];

interface GelaranItem {
  id: string;
  name: string;
  desc: string;
  price: number;
  currency: Currency;
  tier: Tier;
  color: string;
  img: string;
  owned?: boolean;
}

export const GELARAN: GelaranItem[] = [
  // ── BIASA (Coin) ──
  { id: "gl-default", name: "Ninja Trainee",    desc: "Gelaran permulaan setiap ninja.",      price: 0,   currency: "coin", tier: "biasa",   color: "#f97316", img: titleT5, owned: true },
  { id: "gl-b2",      name: "Pejuang Dojo",     desc: "Berani mencuba setiap cabaran.",       price: 200, currency: "coin", tier: "biasa",   color: "#22c55e", img: titleT3 },
  // ── RARE (Gem) ──
  { id: "gl-r1",      name: "Wira Matematik",   desc: "Pahlawan ilmu nombor yang handal.",    price: 20,  currency: "gem",  tier: "rare",    color: "#38bdf8", img: titleT1 },
  { id: "gl-r2",      name: "Bayangan Agung",   desc: "Bergerak pantas, menjawab tepat.",     price: 35,  currency: "gem",  tier: "rare",    color: "#a78bfa", img: titleT4 },
  // ── LEGENDA (Gem mahal) ──
  { id: "gl-l1",      name: "Grandmaster Dojo", desc: "Hanya yang terbaik layak menyandang.", price: 80,  currency: "gem",  tier: "legenda", color: "#fbbf24", img: titleT2 },
];

interface TopupPackage {
  id: string;
  label: string;
  amount: number;
  bonus: number;
  price: number; // MYR
  currency: "gem" | "coin";
  popular?: boolean;
  bestValue?: boolean;
}

export const GELARAN_MAP: Record<string, string> = Object.fromEntries(
  GELARAN.map(g => [g.id, g.name])
);

const GEM_PACKAGES: TopupPackage[] = [
  { id: "gem-1",  label: "Serpihan Berlian", amount: 100,  bonus: 0,   price: 20.99, currency: "gem" },
  { id: "gem-2",  label: "Kristal Ninja",    amount: 280,  bonus: 30,  price: 50.49, currency: "gem", popular: true },
  { id: "gem-3",  label: "Permata Dojo",     amount: 650,  bonus: 100, price: 99.90, currency: "gem" },
  { id: "gem-4",  label: "Khazanah Legenda", amount: 1500, bonus: 400, price: 199.39, currency: "gem", bestValue: true },
];

const COIN_PACKAGES: TopupPackage[] = [
  { id: "coin-1", label: "Poket Ninja",      amount: 2000,  bonus: 0,    price: 20.39,  currency: "coin" },
  { id: "coin-2", label: "Peti Dojo",        amount: 6000,  bonus: 500,  price: 50.79,  currency: "coin", popular: true },
  { id: "coin-3", label: "Peti Besar",       amount: 15000, bonus: 2000, price: 99.19,  currency: "coin" },
  { id: "coin-4", label: "Lombong Emas",     amount: 35000, bonus: 8000, price: 199.89, currency: "coin", bestValue: true },
];

const TIER_ORDER: Tier[] = ["biasa", "rare", "legenda"];

export type Equipped = { avatar: string; bingkai: string; muzik: string; gelaran: string };

interface Props {
  sound?: boolean;
  open: boolean;
  onClose: () => void;
  coins: number;
  gems: number;
  onCoinsChange: (n: number) => void;
  onGemsChange: (n: number) => void;
  equipped: Equipped;
  onEquippedChange: (e: Equipped) => void;
}

export function KedaiModal({ open, onClose, coins, gems, onCoinsChange, onGemsChange, equipped, onEquippedChange, sound = true }: Props) {
  const play = (src: string) => { if (sound) new Audio(src).play().catch(() => {}); };
  const playClick = () => play(clickSound);
  const playBuy = () => play(dingSound);
  const playDeny = () => play(taikoDrumSound);
  const [activeTab, setActiveTab]                 = useState<Tab>("avatar");
  const [activeTier, setActiveTier]               = useState<Tier>("biasa");
  const [bingkaiTier, setBingkaiTier]             = useState<Tier>("biasa");
  const [activeGelaranTier, setActiveGelaranTier] = useState<Tier>("biasa");
  const [previewGelaran, setPreviewGelaran]       = useState<GelaranItem>(GELARAN[0]);
  const [ownedIds, setOwnedIds]       = useState<Set<string>>(
    () => new Set(["av-1", "av-2", "fr-default", "fr-sakura", "mu-default", "sfx-default", "gl-default"]),
  );
  const [previewAvatar, setPreview]   = useState<AvatarItem>(AVATARS[0]);
  const [previewBingkai, setPreviewBingkai] = useState<BingkaiItem>(BINGKAI[0]);
  const [denyId, setDenyId]         = useState<string | null>(null);
  const [buyId, setBuyId]           = useState<string | null>(null);
  const [toast, setToast]           = useState<{ msg: string; ok: boolean } | null>(null);
  const [audioTab, setAudioTab]         = useState<AudioTab>("muzik");
  const [topupTab, setTopupTab]         = useState<"gem" | "coin">("gem");
  const [topupConfirm, setTopupConfirm] = useState<TopupPackage | null>(null);
  const [payStep, setPayStep]           = useState<"method" | "form" | "processing" | "success">("method");
  const [payMethod, setPayMethod]       = useState<"fpx" | "card" | null>(null);
  const [fpxBank, setFpxBank]           = useState<string>("");
  const [cardNum, setCardNum]           = useState("");
  const [cardName, setCardName]         = useState("");
  const [cardExp, setCardExp]           = useState("");
  const [cardCvv, setCardCvv]           = useState("");

  const tabs: { id: Tab; label: string; icon: React.ReactNode }[] = [
    { id: "avatar",  label: "Avatar",   icon: <User       className="h-4 w-4" /> },
    { id: "bingkai", label: "Bingkai",  icon: <Frame      className="h-4 w-4" /> },
    { id: "gelaran", label: "Tajuk",    icon: <Zap        className="h-4 w-4" /> },
    { id: "audio",   label: "Audio",    icon: <Music      className="h-4 w-4" /> },
    { id: "topup",   label: "Top Up",   icon: <CreditCard className="h-4 w-4" /> },
  ];

  const tierAvatars = AVATARS.filter((a) => a.tier === activeTier);

  function showToast(msg: string, ok: boolean) {
    setToast({ msg, ok });
    setTimeout(() => setToast(null), 2200);
  }

  function handleAvatar(av: AvatarItem) {
    playClick();
    setPreview(av);
  }

  function confirmAvatar() {
    const av = previewAvatar;
    const isOwned = ownedIds.has(av.id) || !!av.owned;

    if (isOwned) {
      playClick();
      onEquippedChange({ ...equipped, avatar: av.id });
      showToast(`${av.name} dipakai! 🥷`, true);
      return;
    }

    // placeholder — gambar belum ada
    if (!av.img) {
      showToast("Coming soon! Gambar sedang disiapkan. 🎨", false);
      return;
    }

    const balance = av.currency === "gem" ? gems : coins;
    if (balance < av.price) {
      playDeny();
      setDenyId(av.id);
      setTimeout(() => setDenyId(null), 600);
      showToast(av.currency === "gem" ? "Gem tidak cukup! 💎" : "Coin tidak cukup! 🪙", false);
      return;
    }

    playBuy();
    setBuyId(av.id);
    setTimeout(() => setBuyId(null), 700);
    setOwnedIds((prev) => new Set([...prev, av.id]));
    onEquippedChange({ ...equipped, avatar: av.id });
    if (av.currency === "gem") onGemsChange(gems - av.price);
    else onCoinsChange(coins - av.price);
    showToast(`${av.name} berjaya dibeli! 🎉`, true);
  }

  function confirmBingkai() {
    const fr = previewBingkai;
    const isOwned = ownedIds.has(fr.id) || !!fr.owned;
    if (isOwned) {
      playClick();
      onEquippedChange({ ...equipped, bingkai: fr.id });
      showToast(`${fr.name} dipakai! 🖼️`, true);
      return;
    }
    const balance = fr.currency === "gem" ? gems : coins;
    if (balance < fr.price) {
      playDeny();
      setDenyId(fr.id);
      setTimeout(() => setDenyId(null), 600);
      showToast(fr.currency === "gem" ? "Gem tidak cukup! 💎" : "Coin tidak cukup! 🪙", false);
      return;
    }
    playBuy();
    setBuyId(fr.id);
    setTimeout(() => setBuyId(null), 700);
    setOwnedIds((prev) => new Set([...prev, fr.id]));
    onEquippedChange({ ...equipped, bingkai: fr.id });
    if (fr.currency === "gem") onGemsChange(gems - fr.price);
    else onCoinsChange(coins - fr.price);
    showToast(`${fr.name} berjaya dibeli! 🎉`, true);
  }

  function handleItem(item: ShopItem, cat?: keyof typeof equipped) {
    playClick();
    const owned = ownedIds.has(item.id) || item.owned;
    if (owned) {
      if (cat) { onEquippedChange({ ...equipped, [cat]: item.id }); showToast(`${item.name} dipakai!`, true); }
      return;
    }
    const currency = item.currency ?? "coin";
    const balance  = currency === "gem" ? gems : coins;
    if (balance < item.price) {
      playDeny(); setDenyId(item.id); setTimeout(() => setDenyId(null), 600);
      showToast(currency === "gem" ? "Gem tidak cukup! 💎" : "Coin tidak cukup! 🪙", false); return;
    }
    playBuy(); setBuyId(item.id); setTimeout(() => setBuyId(null), 700);
    setOwnedIds((prev) => new Set([...prev, item.id]));
    if (cat) onEquippedChange({ ...equipped, [cat]: item.id });
    if (currency === "gem") onGemsChange(gems - item.price);
    else onCoinsChange(coins - item.price);
    showToast(`${item.name} berjaya dibeli! 🎉`, true);
  }

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="absolute inset-0 z-50 flex items-center justify-center p-3 sm:p-6"
          style={{ background: "rgba(4,10,35,0.88)" }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
        >
          <motion.div
            className="relative flex h-full max-h-[720px] w-full max-w-4xl flex-col overflow-hidden rounded-3xl shadow-[0_32px_100px_rgba(0,0,0,0.8)]"
            style={{
              background: "linear-gradient(180deg,#0d2257 0%,#071530 45%,#040c20 100%)",
              border: "2px solid rgba(249,224,75,0.18)",
            }}
            initial={{ scale: 0.9, opacity: 0, y: 30 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 30 }}
            transition={{ duration: 0.3, ease: [0.34, 1.3, 0.64, 1] }}
            onClick={(e) => e.stopPropagation()}
          >

            {/* ── Header ──────────────────────────────────────────────────── */}
            <div className="relative flex shrink-0 items-center justify-between border-b border-white/8 px-5 py-3.5">
              <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-ninja-yellow/40 to-transparent" />

              <div className="flex items-center gap-2.5">
                <div className="grid h-9 w-9 place-items-center rounded-xl border border-ninja-yellow/25 bg-ninja-yellow/10">
                  <ShoppingBag className="h-4 w-4 text-ninja-yellow" strokeWidth={2.5} />
                </div>
                <h2 className="font-display text-2xl font-black tracking-widest text-white">KEDAI</h2>
              </div>

              {/* Currency display */}
              <div className="flex items-center gap-2">
                <motion.div
                  animate={{ scale: [1, 1.18, 1] }}
                  transition={{ duration: 0.32 }}
                  className="flex items-center gap-1.5 rounded-2xl border border-violet-400/30 bg-violet-500/10 px-3 py-1.5"
                >
                  <span className="text-base">💎</span>
                  <motion.span key={gems} animate={{ scale: [1, 1.25, 1] }} transition={{ duration: 0.3 }} className="font-display text-lg font-black text-violet-300">{gems}</motion.span>
                </motion.div>
                <motion.div
                  animate={{ scale: [1, 1.18, 1] }}
                  transition={{ duration: 0.32 }}
                  className="flex items-center gap-1.5 rounded-2xl border border-ninja-yellow/30 bg-ninja-yellow/10 px-3 py-1.5"
                >
                  <span className="text-base">🪙</span>
                  <motion.span key={coins} animate={{ scale: [1, 1.25, 1] }} transition={{ duration: 0.3 }} className="font-display text-lg font-black text-ninja-yellow">{coins}</motion.span>
                </motion.div>
                <button
                  onClick={() => { playClick(); onClose(); }}
                  className="grid h-9 w-9 place-items-center rounded-full border border-white/15 bg-white/8 text-white/70 transition-colors hover:bg-white/15 hover:text-white"
                >
                  <X className="h-4 w-4" strokeWidth={2.5} />
                </button>
              </div>
            </div>

            {/* ── Tabs ────────────────────────────────────────────────────── */}
            <div className="flex shrink-0 border-b border-white/8 px-4">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => { playClick(); setActiveTab(tab.id); }}
                  className={`relative flex flex-1 items-center justify-center gap-1.5 py-3 text-xs font-black uppercase tracking-wider transition-colors sm:text-sm ${
                    activeTab === tab.id ? "text-ninja-yellow" : "text-white/40 hover:text-white/65"
                  }`}
                >
                  {tab.icon}
                  <span className="hidden sm:inline">{tab.label}</span>
                  {activeTab === tab.id && (
                    <motion.div layoutId="kedai-tab-line" className="absolute bottom-0 left-3 right-3 h-0.5 rounded-full bg-ninja-yellow" />
                  )}
                </button>
              ))}
            </div>

            {/* ── Content ─────────────────────────────────────────────────── */}
            <div className="flex min-h-0 flex-1 overflow-hidden">
              <AnimatePresence mode="wait">

                {/* ── AVATAR TAB ── */}
                {activeTab === "avatar" && (
                  <motion.div
                    key="avatar"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.18 }}
                    className="flex w-full"
                  >
                    {/* Left preview panel */}
                    <div className="relative hidden w-56 shrink-0 flex-col items-center overflow-hidden md:flex lg:w-64">
                      <img src={bgCharacter} alt="" aria-hidden className="absolute inset-0 h-full w-full object-cover object-center" />
                      <div className="absolute inset-0 bg-gradient-to-b from-[#040c20]/60 via-transparent to-[#040c20]/80" />

                      {/* Tier badge */}
                      <div className="relative z-10 mt-4">
                        <span
                          className={`rounded-full px-3 py-1 text-[11px] font-black uppercase tracking-widest ${TIER_CONFIG[previewAvatar.tier].badge} text-white`}
                          style={{ boxShadow: `0 0 12px ${TIER_CONFIG[previewAvatar.tier].glow}` }}
                        >
                          {previewAvatar.tier === "legenda" ? "⭐ " : previewAvatar.tier === "rare" ? "💎 " : ""}
                          {TIER_CONFIG[previewAvatar.tier].label}
                        </span>
                      </div>

                      {/* Character image / placeholder */}
                      <div className="relative z-10 flex flex-1 w-full items-center justify-center px-1">
                        <AnimatePresence mode="wait">
                          {previewAvatar.img ? (
                            <motion.img
                              key={previewAvatar.id}
                              src={previewAvatar.img}
                              alt={previewAvatar.name}
                              className="w-full object-contain drop-shadow-2xl"
                              style={{ filter: `drop-shadow(0 0 24px ${previewAvatar.color}88)` }}
                              initial={{ opacity: 0, y: 20, scale: 0.88 }}
                              animate={{ opacity: 1, y: 0, scale: 1 }}
                              exit={{ opacity: 0, y: -12, scale: 0.92 }}
                              transition={{ duration: 0.3, ease: "easeOut" }}
                            />
                          ) : (
                            <motion.div
                              key={previewAvatar.id + "-placeholder"}
                              className="flex flex-col items-center gap-3"
                              initial={{ opacity: 0, scale: 0.88 }}
                              animate={{ opacity: 1, scale: 1 }}
                              exit={{ opacity: 0, scale: 0.92 }}
                              transition={{ duration: 0.25 }}
                            >
                              <motion.div
                                animate={{ rotate: [0, 8, -8, 0], scale: [1, 1.08, 1] }}
                                transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                                className="text-7xl drop-shadow-2xl"
                                style={{ filter: `drop-shadow(0 0 20px ${previewAvatar.color}99)` }}
                              >
                                {previewAvatar.tier === "legenda" ? "⭐" : "💎"}
                              </motion.div>
                              <p className="text-center text-xs font-bold text-white/50 px-4">
                                Gambar akan datang...
                              </p>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>

                      {/* Name plate + action button */}
                      <div className="relative z-10 w-full px-4 pb-5 text-center">
                        <AnimatePresence mode="wait">
                          <motion.div
                            key={previewAvatar.id + "-info"}
                            initial={{ opacity: 0, y: 6 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: 0.2 }}
                            className="flex flex-col items-center gap-3"
                          >
                            <div>
                              <p className="font-display text-[11px] font-black uppercase tracking-widest" style={{ color: previewAvatar.color }}>
                                {previewAvatar.title}
                              </p>
                              <p className="mt-0.5 font-display text-xl font-black text-white drop-shadow-lg">
                                {previewAvatar.name === "???" ? "???" : previewAvatar.name}
                              </p>
                            </div>

                            {/* Action button */}
                            {(() => {
                              const isOwned    = ownedIds.has(previewAvatar.id) || !!previewAvatar.owned;
                              const isEquipped = equipped.avatar === previewAvatar.id;
                              const isGem      = previewAvatar.currency === "gem";
                              const balance    = isGem ? gems : coins;
                              const canAfford  = balance >= previewAvatar.price;
                              const isLocked   = !previewAvatar.img;

                              if (isEquipped) return (
                                <motion.div
                                  animate={{ opacity: [0.8, 1, 0.8] }}
                                  transition={{ duration: 2, repeat: Infinity }}
                                  className="flex w-full items-center justify-center gap-2 rounded-2xl border-2 py-2.5 text-sm font-black"
                                  style={{ borderColor: previewAvatar.color, color: previewAvatar.color, background: previewAvatar.color + "25", boxShadow: `0 0 14px ${previewAvatar.color}44` }}
                                >
                                  <Check className="h-4 w-4" strokeWidth={3} /> Karakter Aktif
                                </motion.div>
                              );

                              if (isOwned) return (
                                <motion.button
                                  whileHover={{ scale: 1.05, y: -2 }}
                                  whileTap={{ scale: 0.96 }}
                                  onClick={confirmAvatar}
                                  className="relative w-full overflow-hidden rounded-2xl border-[3px] border-[#7c2d12] py-2.5 text-sm font-black text-white shadow-[0_6px_0_#7c2d12]"
                                  style={{ background: "var(--gradient-orange)" }}
                                >
                                  <span className="flex items-center justify-center gap-2">🥷 Guna Karakter Ini</span>
                                </motion.button>
                              );

                              if (isLocked) return (
                                <div className="flex w-full items-center justify-center gap-2 rounded-2xl border border-white/15 bg-white/5 py-2.5 text-sm font-bold text-white/40">
                                  🎨 Coming Soon
                                </div>
                              );

                              return (
                                <motion.button
                                  whileHover={canAfford ? { scale: 1.05, y: -2 } : { scale: 1.02 }}
                                  whileTap={canAfford ? { scale: 0.96 } : {}}
                                  onClick={confirmAvatar}
                                  className="relative w-full overflow-hidden rounded-2xl py-2.5 text-sm font-black text-white"
                                  style={canAfford ? {
                                    background: isGem
                                      ? "linear-gradient(135deg,#7c3aed,#4c1d95)"
                                      : "linear-gradient(135deg,#f59e0b,#d97706)",
                                    border: `3px solid ${isGem ? "#5b21b6" : "#92400e"}`,
                                    boxShadow: `0 6px 0 ${isGem ? "#3b0764" : "#92400e"}, 0 0 20px ${isGem ? "#7c3aed55" : "#f59e0b44"}`,
                                  } : {
                                    background: "linear-gradient(135deg,#1e293b,#0f172a)",
                                    border: "2px solid rgba(255,255,255,0.10)",
                                    boxShadow: "0 4px 0 rgba(0,0,0,0.4)",
                                  }}
                                >
                                  {canAfford ? (
                                    <span className="flex items-center justify-center gap-2">
                                      <span>{isGem ? "💎" : "🪙"}</span>
                                      <span>Beli — <span style={{ color: isGem ? "#c4b5fd" : "#fde68a" }}>{previewAvatar.price}</span> {isGem ? "Gem" : "Coin"}</span>
                                    </span>
                                  ) : (
                                    <span className="flex items-center justify-center gap-2 opacity-55">
                                      <Lock className="h-4 w-4" strokeWidth={2.5} />
                                      <span>{isGem ? "💎" : "🪙"} {previewAvatar.price} diperlukan</span>
                                    </span>
                                  )}
                                </motion.button>
                              );
                            })()}
                          </motion.div>
                        </AnimatePresence>
                      </div>

                      {/* glow */}
                      <motion.div
                        className="pointer-events-none absolute bottom-0 left-1/2 h-40 w-48 -translate-x-1/2 rounded-full blur-3xl"
                        style={{ background: previewAvatar.color + "44" }}
                        animate={{ opacity: [0.5, 1, 0.5] }}
                        transition={{ duration: 2.5, repeat: Infinity }}
                      />
                    </div>

                    {/* Right — tier selector + grid */}
                    <div className="flex flex-1 flex-col overflow-hidden">
                      {/* Tier pills */}
                      <div className="flex shrink-0 gap-2 border-b border-white/8 px-4 py-3">
                        {TIER_ORDER.map((tier) => {
                          const cfg    = TIER_CONFIG[tier];
                          const active = activeTier === tier;
                          return (
                            <motion.button
                              key={tier}
                              whileHover={{ scale: 1.05 }}
                              whileTap={{ scale: 0.95 }}
                              onClick={() => {
                                playClick();
                                setActiveTier(tier);
                                const first = AVATARS.find((a) => a.tier === tier);
                                if (first) setPreview(first);
                              }}
                              className="flex items-center gap-1.5 rounded-full px-4 py-1.5 text-xs font-black uppercase tracking-wide transition-all"
                              style={{
                                background: active ? cfg.bg : "rgba(255,255,255,0.05)",
                                border: `2px solid ${active ? cfg.color : "rgba(255,255,255,0.08)"}`,
                                color: active ? cfg.color : "rgba(255,255,255,0.4)",
                                boxShadow: active ? `0 0 12px ${cfg.glow}` : "none",
                              }}
                            >
                              {tier === "legenda" ? "⭐" : tier === "rare" ? "💎" : "🪙"}
                              {cfg.label}
                            </motion.button>
                          );
                        })}
                      </div>

                      {/* Card grid */}
                      <div className="flex-1 overflow-y-auto p-3 sm:p-4" style={{ scrollbarWidth: "none" }}>
                        <AnimatePresence mode="wait">
                          <motion.div
                            key={activeTier}
                            initial={{ opacity: 0, y: 8 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -8 }}
                            transition={{ duration: 0.18 }}
                            className="grid grid-cols-2 gap-2.5 sm:grid-cols-3 lg:grid-cols-4"
                          >
                            {tierAvatars.map((av) => {
                              const isOwned    = ownedIds.has(av.id) || !!av.owned;
                              const isEquipped = equipped.avatar === av.id;
                              const isPreview  = previewAvatar.id === av.id;
                              const isDeny     = denyId === av.id;
                              const isBuy      = buyId  === av.id;
                              const isGem      = av.currency === "gem";
                              const balance    = isGem ? gems : coins;
                              const canAfford  = balance >= av.price;
                              const isLocked   = !av.img;
                              const tierCfg    = TIER_CONFIG[av.tier];

                              return (
                                <motion.button
                                  key={av.id}
                                  onClick={() => handleAvatar(av)}
                                  whileHover={{ scale: 1.04, y: -4 }}
                                  whileTap={{ scale: 0.96 }}
                                  animate={isDeny ? { x: [0, -7, 7, -5, 0] } : {}}
                                  transition={{ duration: 0.35 }}
                                  className="relative flex flex-col items-center overflow-hidden rounded-2xl border-2 transition-all"
                                  style={{
                                    background: av.gradient,
                                    borderColor: isEquipped
                                      ? av.color
                                      : isPreview
                                        ? av.color + "66"
                                        : av.tier !== "biasa"
                                          ? tierCfg.color + "33"
                                          : "rgba(255,255,255,0.08)",
                                    boxShadow: isEquipped
                                      ? `0 0 18px ${av.color}55, 0 4px 16px rgba(0,0,0,0.5)`
                                      : av.tier !== "biasa"
                                        ? `0 0 10px ${tierCfg.glow}, 0 4px 12px rgba(0,0,0,0.4)`
                                        : "0 4px 12px rgba(0,0,0,0.4)",
                                  }}
                                >
                                  {/* tier shimmer for rare/legenda */}
                                  {av.tier !== "biasa" && (
                                    <motion.div
                                      className="pointer-events-none absolute inset-0 rounded-2xl"
                                      style={{ background: `linear-gradient(135deg, ${tierCfg.color}18 0%, transparent 60%)` }}
                                      animate={{ opacity: [0.5, 1, 0.5] }}
                                      transition={{ duration: 2.5, repeat: Infinity }}
                                    />
                                  )}

                                  {/* equipped badge */}
                                  {isEquipped && (
                                    <motion.div
                                      initial={{ scale: 0 }}
                                      animate={{ scale: 1 }}
                                      className="absolute right-1.5 top-1.5 z-10 grid h-5 w-5 place-items-center rounded-full"
                                      style={{ background: av.color }}
                                    >
                                      <Check className="h-3 w-3 text-white" strokeWidth={3} />
                                    </motion.div>
                                  )}

                                  {/* lock overlay */}
                                  {!isOwned && (!canAfford || isLocked) && (
                                    <div className="absolute inset-0 z-10 flex items-start justify-center rounded-2xl bg-black/40 pt-12">
                                      <Lock className="h-8 w-8 text-white/60" strokeWidth={2.5} />
                                    </div>
                                  )}

                                  {/* image or placeholder */}
                                  <div className="relative flex h-24 w-full items-end justify-center overflow-hidden sm:h-28">
                                    {av.img ? (
                                      <motion.img
                                        src={av.img}
                                        alt={av.name}
                                        className="h-24 w-auto object-contain object-bottom drop-shadow-lg sm:h-28"
                                        animate={isEquipped ? { y: [0, -4, 0] } : {}}
                                        transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
                                      />
                                    ) : (
                                      <motion.div
                                        className="flex h-full w-full items-center justify-center text-4xl"
                                        animate={{ scale: [1, 1.1, 1] }}
                                        transition={{ duration: 2.5, repeat: Infinity }}
                                        style={{ filter: `drop-shadow(0 0 14px ${av.color}88)` }}
                                      >
                                        {av.tier === "legenda" ? "⭐" : "💎"}
                                      </motion.div>
                                    )}
                                    <div className="pointer-events-none absolute bottom-0 left-1/2 h-8 w-20 -translate-x-1/2 blur-xl" style={{ background: av.color + "44" }} />
                                  </div>

                                  {/* name + price */}
                                  <div className="w-full border-t border-white/8 px-2 py-2 text-center">
                                    <p className="font-display text-[11px] font-black leading-tight text-white sm:text-xs">
                                      {av.name}
                                    </p>
                                    <div className="mt-1">
                                      {isOwned ? (
                                        <span className="text-[10px] font-black" style={{ color: av.color }}>
                                          {isEquipped ? "✓ Aktif" : "✓ Dimiliki"}
                                        </span>
                                      ) : isLocked ? (
                                        <span className="text-[10px] font-bold text-white/30">🎨 Soon</span>
                                      ) : (
                                        <span className={`flex items-center justify-center gap-0.5 text-[10px] font-black ${canAfford ? (isGem ? "text-violet-300" : "text-ninja-yellow") : "text-white/35"}`}>
                                          {isGem ? "💎" : "🪙"} {av.price}
                                        </span>
                                      )}
                                    </div>
                                  </div>
                                </motion.button>
                              );
                            })}
                          </motion.div>
                        </AnimatePresence>
                      </div>
                    </div>
                  </motion.div>
                )}

                {/* ── BINGKAI TAB ── */}
                {activeTab === "bingkai" && (
                  <motion.div
                    key="bingkai"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.18 }}
                    className="flex w-full"
                  >
                    {/* Left preview panel */}
                    <div className="relative hidden w-56 shrink-0 flex-col items-center overflow-hidden md:flex lg:w-64"
                      style={{ background: "linear-gradient(160deg,#0d1f3c 0%,#050e1f 100%)" }}
                    >
                      <div className="absolute inset-0 bg-gradient-to-b from-[#040c20]/40 via-transparent to-[#040c20]/90" />

                      {/* Tier badge */}
                      <div className="relative z-10 mt-4">
                        <span
                          className={`rounded-full px-3 py-1 text-[11px] font-black uppercase tracking-widest ${TIER_CONFIG[previewBingkai.tier].badge} text-white`}
                          style={{ boxShadow: `0 0 12px ${TIER_CONFIG[previewBingkai.tier].glow}` }}
                        >
                          {previewBingkai.tier === "legenda" ? "⭐ " : previewBingkai.tier === "rare" ? "💎 " : ""}
                          {TIER_CONFIG[previewBingkai.tier].label}
                        </span>
                      </div>

                      {/* Frame preview */}
                      <div className="relative z-10 flex flex-1 w-full items-center justify-center px-4">
                        <AnimatePresence mode="wait">
                          {previewBingkai.img ? (
                            <motion.div
                              key={previewBingkai.id}
                              className="relative w-full aspect-square"
                              initial={{ opacity: 0, scale: 0.88, y: 16 }}
                              animate={{ opacity: 1, scale: 1, y: 0 }}
                              exit={{ opacity: 0, scale: 0.92, y: -12 }}
                              transition={{ duration: 0.3, ease: "easeOut" }}
                            >
                              <img
                                src={previewBingkai.img}
                                alt={previewBingkai.name}
                                className="w-full h-full object-contain drop-shadow-2xl"
                                style={{ filter: `drop-shadow(0 0 24px ${previewBingkai.color}88)` }}
                              />
                              {/* Avatar silhouette inside frame */}
                              <div className="absolute inset-[18%] rounded-lg overflow-hidden flex items-center justify-center"
                                style={{ background: "rgba(255,255,255,0.04)", border: "1px dashed rgba(255,255,255,0.12)" }}
                              >
                                <span className="text-4xl opacity-30">🥷</span>
                              </div>
                            </motion.div>
                          ) : (
                            <motion.div
                              key="fr-default-placeholder"
                              className="flex flex-col items-center gap-3"
                              initial={{ opacity: 0, scale: 0.88 }}
                              animate={{ opacity: 1, scale: 1 }}
                              exit={{ opacity: 0, scale: 0.92 }}
                              transition={{ duration: 0.25 }}
                            >
                              <div className="w-36 h-36 rounded-2xl border-4 border-dashed border-white/20 flex items-center justify-center">
                                <span className="text-5xl opacity-40">🥷</span>
                              </div>
                              <p className="text-center text-xs font-bold text-white/40 px-4">
                                Bingkai lalai
                              </p>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>

                      {/* Name plate + action button */}
                      <div className="relative z-10 w-full px-4 pb-5 text-center">
                        <AnimatePresence mode="wait">
                          <motion.div
                            key={previewBingkai.id + "-info"}
                            initial={{ opacity: 0, y: 6 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: 0.2 }}
                            className="flex flex-col items-center gap-3"
                          >
                            <div>
                              <p className="font-display text-[11px] font-black uppercase tracking-widest" style={{ color: previewBingkai.color }}>
                                {TIER_CONFIG[previewBingkai.tier].label}
                              </p>
                              <p className="mt-0.5 font-display text-xl font-black text-white drop-shadow-lg">
                                {previewBingkai.name}
                              </p>
                              <p className="mt-1 text-[11px] text-white/45 leading-snug">{previewBingkai.desc}</p>
                            </div>

                            {/* Action button */}
                            {(() => {
                              const isOwned    = ownedIds.has(previewBingkai.id) || !!previewBingkai.owned;
                              const isEquipped = equipped.bingkai === previewBingkai.id;
                              const isGem      = previewBingkai.currency === "gem";
                              const balance    = isGem ? gems : coins;
                              const canAfford  = balance >= previewBingkai.price;

                              if (isEquipped) return (
                                <motion.div
                                  animate={{ opacity: [0.8, 1, 0.8] }}
                                  transition={{ duration: 2, repeat: Infinity }}
                                  className="flex w-full items-center justify-center gap-2 rounded-2xl border-2 py-2.5 text-sm font-black"
                                  style={{ borderColor: previewBingkai.color, color: previewBingkai.color, background: previewBingkai.color + "25", boxShadow: `0 0 14px ${previewBingkai.color}44` }}
                                >
                                  <Check className="h-4 w-4" strokeWidth={3} /> Bingkai Aktif
                                </motion.div>
                              );

                              if (isOwned) return (
                                <motion.button
                                  whileHover={{ scale: 1.05, y: -2 }}
                                  whileTap={{ scale: 0.96 }}
                                  onClick={confirmBingkai}
                                  className="relative w-full overflow-hidden rounded-2xl border-[3px] border-[#7c2d12] py-2.5 text-sm font-black text-white shadow-[0_6px_0_#7c2d12]"
                                  style={{ background: "var(--gradient-orange)" }}
                                >
                                  <span className="flex items-center justify-center gap-2">🖼️ Guna Bingkai Ini</span>
                                </motion.button>
                              );

                              return (
                                <motion.button
                                  whileHover={canAfford ? { scale: 1.05, y: -2 } : { scale: 1.02 }}
                                  whileTap={canAfford ? { scale: 0.96 } : {}}
                                  onClick={confirmBingkai}
                                  className="relative w-full overflow-hidden rounded-2xl py-2.5 text-sm font-black text-white"
                                  style={canAfford ? {
                                    background: isGem
                                      ? "linear-gradient(135deg,#7c3aed,#4c1d95)"
                                      : "linear-gradient(135deg,#f59e0b,#d97706)",
                                    border: `3px solid ${isGem ? "#5b21b6" : "#92400e"}`,
                                    boxShadow: `0 6px 0 ${isGem ? "#3b0764" : "#92400e"}, 0 0 20px ${isGem ? "#7c3aed55" : "#f59e0b44"}`,
                                  } : {
                                    background: "linear-gradient(135deg,#1e293b,#0f172a)",
                                    border: "2px solid rgba(255,255,255,0.10)",
                                    boxShadow: "0 4px 0 rgba(0,0,0,0.4)",
                                  }}
                                >
                                  {canAfford ? (
                                    <span className="flex items-center justify-center gap-2">
                                      <span>{isGem ? "💎" : "🪙"}</span>
                                      <span>Beli — <span style={{ color: isGem ? "#c4b5fd" : "#fde68a" }}>{previewBingkai.price}</span> {isGem ? "Gem" : "Coin"}</span>
                                    </span>
                                  ) : (
                                    <span className="flex items-center justify-center gap-2 opacity-55">
                                      <Lock className="h-4 w-4" strokeWidth={2.5} />
                                      <span>{isGem ? "💎" : "🪙"} {previewBingkai.price} diperlukan</span>
                                    </span>
                                  )}
                                </motion.button>
                              );
                            })()}
                          </motion.div>
                        </AnimatePresence>
                      </div>

                      {/* glow */}
                      <motion.div
                        className="pointer-events-none absolute bottom-0 left-1/2 h-40 w-48 -translate-x-1/2 rounded-full blur-3xl"
                        style={{ background: previewBingkai.color + "44" }}
                        animate={{ opacity: [0.5, 1, 0.5] }}
                        transition={{ duration: 2.5, repeat: Infinity }}
                      />
                    </div>

                    {/* Right — tier selector + grid */}
                    <div className="flex flex-1 flex-col overflow-hidden">
                      {/* Tier pills */}
                      <div className="flex shrink-0 gap-2 border-b border-white/8 px-4 py-3">
                        {TIER_ORDER.map((tier) => {
                          const cfg    = TIER_CONFIG[tier];
                          const active = bingkaiTier === tier;
                          return (
                            <motion.button
                              key={tier}
                              whileHover={{ scale: 1.05 }}
                              whileTap={{ scale: 0.95 }}
                              onClick={() => {
                                playClick();
                                setBingkaiTier(tier);
                                const first = BINGKAI.find((f) => f.tier === tier);
                                if (first) setPreviewBingkai(first);
                              }}
                              className="flex items-center gap-1.5 rounded-full px-4 py-1.5 text-xs font-black uppercase tracking-wide transition-all"
                              style={{
                                background: active ? cfg.bg : "rgba(255,255,255,0.05)",
                                border: `2px solid ${active ? cfg.color : "rgba(255,255,255,0.08)"}`,
                                color: active ? cfg.color : "rgba(255,255,255,0.4)",
                                boxShadow: active ? `0 0 12px ${cfg.glow}` : "none",
                              }}
                            >
                              {tier === "legenda" ? "⭐" : tier === "rare" ? "💎" : "🪙"}
                              {cfg.label}
                            </motion.button>
                          );
                        })}
                      </div>

                      {/* Card grid */}
                      <div className="flex-1 overflow-y-auto p-3 sm:p-4" style={{ scrollbarWidth: "none" }}>
                        <AnimatePresence mode="wait">
                          <motion.div
                            key={bingkaiTier}
                            initial={{ opacity: 0, y: 8 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -8 }}
                            transition={{ duration: 0.18 }}
                            className="grid grid-cols-2 gap-2.5 sm:grid-cols-3"
                          >
                            {BINGKAI.filter((f) => f.tier === bingkaiTier).map((fr) => {
                              const isOwned    = ownedIds.has(fr.id) || !!fr.owned;
                              const isEquipped = equipped.bingkai === fr.id;
                              const isPreview  = previewBingkai.id === fr.id;
                              const isDeny     = denyId === fr.id;
                              const isBuy      = buyId  === fr.id;
                              const isGem      = fr.currency === "gem";
                              const balance    = isGem ? gems : coins;
                              const canAfford  = balance >= fr.price;
                              const tierCfg    = TIER_CONFIG[fr.tier];

                              return (
                                <motion.button
                                  key={fr.id}
                                  onClick={() => { playClick(); setPreviewBingkai(fr); }}
                                  whileHover={{ scale: 1.04, y: -4 }}
                                  whileTap={{ scale: 0.96 }}
                                  animate={isDeny ? { x: [0, -7, 7, -5, 0] } : {}}
                                  transition={{ duration: 0.35 }}
                                  className="relative flex flex-col items-center overflow-hidden rounded-2xl border-2 transition-all"
                                  style={{
                                    background: "linear-gradient(160deg,#0d1f3c 0%,#050e1f 100%)",
                                    borderColor: isEquipped
                                      ? fr.color
                                      : isPreview
                                        ? fr.color + "66"
                                        : fr.tier !== "biasa"
                                          ? tierCfg.color + "33"
                                          : "rgba(255,255,255,0.08)",
                                    boxShadow: isEquipped
                                      ? `0 0 18px ${fr.color}55, 0 4px 16px rgba(0,0,0,0.5)`
                                      : fr.tier !== "biasa"
                                        ? `0 0 10px ${tierCfg.glow}, 0 4px 12px rgba(0,0,0,0.4)`
                                        : "0 4px 12px rgba(0,0,0,0.4)",
                                  }}
                                >
                                  {/* tier shimmer */}
                                  {fr.tier !== "biasa" && (
                                    <motion.div
                                      className="pointer-events-none absolute inset-0 rounded-2xl"
                                      style={{ background: `linear-gradient(135deg, ${tierCfg.color}18 0%, transparent 60%)` }}
                                      animate={{ opacity: [0.5, 1, 0.5] }}
                                      transition={{ duration: 2.5, repeat: Infinity }}
                                    />
                                  )}

                                  {/* equipped badge */}
                                  {isEquipped && (
                                    <motion.div
                                      initial={{ scale: 0 }}
                                      animate={{ scale: 1 }}
                                      className="absolute right-1.5 top-1.5 z-10 grid h-5 w-5 place-items-center rounded-full"
                                      style={{ background: fr.color }}
                                    >
                                      <Check className="h-3 w-3 text-white" strokeWidth={3} />
                                    </motion.div>
                                  )}

                                  {/* lock overlay */}
                                  {!isOwned && !canAfford && (
                                    <div className="absolute inset-0 z-10 flex items-start justify-center rounded-2xl bg-black/40 pt-10">
                                      <Lock className="h-7 w-7 text-white/60" strokeWidth={2.5} />
                                    </div>
                                  )}

                                  {/* frame thumbnail */}
                                  <div className="relative flex h-28 w-full items-center justify-center overflow-hidden p-2">
                                    {fr.img ? (
                                      <motion.img
                                        src={fr.img}
                                        alt={fr.name}
                                        className="h-24 w-24 object-contain drop-shadow-lg"
                                        style={{ filter: `drop-shadow(0 0 10px ${fr.color}66)` }}
                                        animate={isEquipped ? { scale: [1, 1.05, 1] } : {}}
                                        transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
                                      />
                                    ) : (
                                      <div className="flex h-20 w-20 items-center justify-center rounded-xl border-2 border-dashed border-white/20">
                                        <span className="text-3xl opacity-40">🥷</span>
                                      </div>
                                    )}
                                    <div className="pointer-events-none absolute bottom-0 left-1/2 h-8 w-20 -translate-x-1/2 blur-xl" style={{ background: fr.color + "44" }} />
                                  </div>

                                  {/* name + price */}
                                  <div className="w-full border-t border-white/8 px-2 py-2 text-center">
                                    <p className="font-display text-[11px] font-black leading-tight text-white sm:text-xs">
                                      {fr.name}
                                    </p>
                                    <div className="mt-1">
                                      {isOwned ? (
                                        <span className="text-[10px] font-black" style={{ color: fr.color }}>
                                          {isEquipped ? "✓ Aktif" : "✓ Dimiliki"}
                                        </span>
                                      ) : (
                                        <span className={`flex items-center justify-center gap-0.5 text-[10px] font-black ${canAfford ? (isGem ? "text-violet-300" : "text-ninja-yellow") : "text-white/35"}`}>
                                          {isGem ? "💎" : "🪙"} {fr.price}
                                        </span>
                                      )}
                                    </div>
                                  </div>
                                </motion.button>
                              );
                            })}
                          </motion.div>
                        </AnimatePresence>
                      </div>
                    </div>
                  </motion.div>
                )}

                {/* ── GELARAN TAB ── */}
                {activeTab === "gelaran" && (
                  <motion.div
                    key="gelaran"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.18 }}
                    className="flex w-full"
                  >
                    {/* Left preview panel */}
                    <div className="relative hidden w-56 shrink-0 flex-col items-center overflow-hidden md:flex lg:w-64"
                      style={{ background: "linear-gradient(160deg,#0d1f3c 0%,#050e1f 100%)" }}>
                      <div className="absolute inset-0 bg-gradient-to-b from-[#040c20]/40 via-transparent to-[#040c20]/90" />

                      {/* Tier badge */}
                      <div className="relative z-10 mt-4">
                        <span className={`rounded-full px-3 py-1 text-[11px] font-black uppercase tracking-widest ${TIER_CONFIG[previewGelaran.tier].badge} text-white`}
                          style={{ boxShadow: `0 0 12px ${TIER_CONFIG[previewGelaran.tier].glow}` }}>
                          {previewGelaran.tier === "legenda" ? "⭐ " : previewGelaran.tier === "rare" ? "💎 " : ""}
                          {TIER_CONFIG[previewGelaran.tier].label}
                        </span>
                      </div>

                      {/* Badge large preview */}
                      <div className="relative z-10 flex flex-1 w-full items-center justify-center px-6">
                        <AnimatePresence mode="wait">
                          <motion.div
                            key={previewGelaran.id}
                            className="relative inline-flex w-full items-center justify-center"
                            initial={{ opacity: 0, scale: 0.85, y: 16 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.9, y: -12 }}
                            transition={{ duration: 0.3, ease: "easeOut" }}
                            style={{ filter: `drop-shadow(0 0 20px ${previewGelaran.color}88)` }}
                          >
                            <img src={previewGelaran.img} alt={previewGelaran.name} className="w-full object-contain" />
                          </motion.div>
                        </AnimatePresence>
                      </div>

                      {/* Name + desc + action button */}
                      <div className="relative z-10 w-full px-4 pb-5 text-center">
                        <AnimatePresence mode="wait">
                          <motion.div
                            key={previewGelaran.id + "-info"}
                            initial={{ opacity: 0, y: 6 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: 0.2 }}
                            className="flex flex-col items-center gap-3"
                          >
                            <div>
                              <p className="text-[11px] text-white/45 leading-snug">{previewGelaran.desc}</p>
                            </div>

                            {/* Action button */}
                            {(() => {
                              const isOwned   = ownedIds.has(previewGelaran.id) || !!previewGelaran.owned;
                              const isEquipped = equipped.gelaran === previewGelaran.id;
                              const isGem     = previewGelaran.currency === "gem";
                              const balance   = isGem ? gems : coins;
                              const canAfford = balance >= previewGelaran.price;

                              if (isEquipped) return (
                                <motion.div
                                  animate={{ opacity: [0.8, 1, 0.8] }}
                                  transition={{ duration: 2, repeat: Infinity }}
                                  className="flex w-full items-center justify-center gap-2 rounded-2xl border-2 py-2.5 text-sm font-black"
                                  style={{ borderColor: previewGelaran.color, color: previewGelaran.color, background: previewGelaran.color + "25", boxShadow: `0 0 14px ${previewGelaran.color}44` }}
                                >
                                  <Check className="h-4 w-4" strokeWidth={3} /> Tajuk Aktif
                                </motion.div>
                              );

                              if (isOwned) return (
                                <motion.button
                                  whileHover={{ scale: 1.05, y: -2 }}
                                  whileTap={{ scale: 0.96 }}
                                  onClick={() => { playClick(); onEquippedChange({ ...equipped, gelaran: previewGelaran.id }); showToast(`Tajuk "${previewGelaran.name}" dipakai! 🥷`, true); }}
                                  className="relative w-full overflow-hidden rounded-2xl border-[3px] border-[#7c2d12] py-2.5 text-sm font-black text-white shadow-[0_6px_0_#7c2d12]"
                                  style={{ background: "var(--gradient-orange)" }}
                                >
                                  <span className="flex items-center justify-center gap-2">🥷 Guna Tajuk Ini</span>
                                </motion.button>
                              );

                              return (
                                <motion.button
                                  whileHover={canAfford ? { scale: 1.05, y: -2 } : { scale: 1.02 }}
                                  whileTap={canAfford ? { scale: 0.96 } : {}}
                                  onClick={() => {
                                    if (!canAfford) {
                                      playDeny(); setDenyId(previewGelaran.id); setTimeout(() => setDenyId(null), 600);
                                      showToast(isGem ? "Gem tidak cukup! 💎" : "Coin tidak cukup! 🪙", false); return;
                                    }
                                    playBuy(); setBuyId(previewGelaran.id); setTimeout(() => setBuyId(null), 700);
                                    setOwnedIds(prev => new Set([...prev, previewGelaran.id]));
                                    onEquippedChange({ ...equipped, gelaran: previewGelaran.id });
                                    if (isGem) onGemsChange(gems - previewGelaran.price); else onCoinsChange(coins - previewGelaran.price);
                                    showToast(`"${previewGelaran.name}" berjaya dibeli! 🎉`, true);
                                  }}
                                  className="relative w-full overflow-hidden rounded-2xl py-2.5 text-sm font-black text-white"
                                  style={canAfford ? {
                                    background: isGem ? "linear-gradient(135deg,#7c3aed,#4c1d95)" : "linear-gradient(135deg,#f59e0b,#d97706)",
                                    border: `3px solid ${isGem ? "#5b21b6" : "#92400e"}`,
                                    boxShadow: `0 6px 0 ${isGem ? "#3b0764" : "#92400e"}, 0 0 20px ${isGem ? "#7c3aed55" : "#f59e0b44"}`,
                                  } : {
                                    background: "linear-gradient(135deg,#1e293b,#0f172a)",
                                    border: "2px solid rgba(255,255,255,0.10)",
                                    boxShadow: "0 4px 0 rgba(0,0,0,0.4)",
                                  }}
                                >
                                  {canAfford ? (
                                    <span className="flex items-center justify-center gap-2">
                                      <span>{isGem ? "💎" : "🪙"}</span>
                                      <span>Beli — <span style={{ color: isGem ? "#c4b5fd" : "#fde68a" }}>{previewGelaran.price}</span> {isGem ? "Gem" : "Coin"}</span>
                                    </span>
                                  ) : (
                                    <span className="flex items-center justify-center gap-2 opacity-55">
                                      <Lock className="h-4 w-4" strokeWidth={2.5} />
                                      <span>{isGem ? "💎" : "🪙"} {previewGelaran.price} diperlukan</span>
                                    </span>
                                  )}
                                </motion.button>
                              );
                            })()}
                          </motion.div>
                        </AnimatePresence>
                      </div>

                      {/* glow */}
                      <motion.div
                        className="pointer-events-none absolute bottom-0 left-1/2 h-40 w-48 -translate-x-1/2 rounded-full blur-3xl"
                        style={{ background: previewGelaran.color + "44" }}
                        animate={{ opacity: [0.5, 1, 0.5] }}
                        transition={{ duration: 2.5, repeat: Infinity }}
                      />
                    </div>

                    {/* Right — tier + grid */}
                    <div className="flex flex-1 flex-col overflow-hidden">
                      {/* Tier pills */}
                      <div className="flex shrink-0 gap-2 border-b border-white/8 px-4 py-3">
                        {TIER_ORDER.map((tier) => {
                          const cfg = TIER_CONFIG[tier];
                          const active = activeGelaranTier === tier;
                          return (
                            <motion.button key={tier} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                              onClick={() => {
                                playClick();
                                setActiveGelaranTier(tier);
                                const first = GELARAN.find(g => g.tier === tier);
                                if (first) setPreviewGelaran(first);
                              }}
                              className="flex items-center gap-1.5 rounded-full px-4 py-1.5 text-xs font-black uppercase tracking-wide transition-all"
                              style={{
                                background: active ? cfg.bg : "rgba(255,255,255,0.05)",
                                border: `2px solid ${active ? cfg.color : "rgba(255,255,255,0.08)"}`,
                                color: active ? cfg.color : "rgba(255,255,255,0.4)",
                                boxShadow: active ? `0 0 12px ${cfg.glow}` : "none",
                              }}>
                              {tier === "legenda" ? "⭐" : tier === "rare" ? "💎" : "🪙"} {cfg.label}
                            </motion.button>
                          );
                        })}
                      </div>

                      {/* Card grid */}
                      <div className="flex-1 overflow-y-auto p-3 sm:p-4" style={{ scrollbarWidth: "none" }}>
                        <AnimatePresence mode="wait">
                          <motion.div key={activeGelaranTier}
                            initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}
                            transition={{ duration: 0.18 }}
                            className="grid grid-cols-1 gap-2.5 sm:grid-cols-2"
                          >
                            {GELARAN.filter(g => g.tier === activeGelaranTier).map((gl) => {
                              const isOwned    = ownedIds.has(gl.id) || !!gl.owned;
                              const isEquipped = equipped.gelaran === gl.id;
                              const isPreview  = previewGelaran.id === gl.id;
                              const isDeny     = denyId === gl.id;
                              const isGem      = gl.currency === "gem";
                              const balance    = isGem ? gems : coins;
                              const canAfford  = balance >= gl.price;
                              const tierCfg    = TIER_CONFIG[gl.tier];

                              return (
                                <motion.button
                                  key={gl.id}
                                  onClick={() => { playClick(); setPreviewGelaran(gl); }}
                                  whileHover={{ scale: 1.03, y: -3 }}
                                  whileTap={{ scale: 0.97 }}
                                  animate={isDeny ? { x: [0, -7, 7, -5, 0] } : {}}
                                  transition={{ duration: 0.35 }}
                                  className="relative flex items-center gap-3 overflow-hidden rounded-2xl border-2 px-3 py-2.5 text-left transition-all"
                                  style={{
                                    background: "linear-gradient(160deg,#0d1f3c 0%,#050e1f 100%)",
                                    borderColor: isEquipped ? gl.color : isPreview ? gl.color + "66" : gl.tier !== "biasa" ? tierCfg.color + "33" : "rgba(255,255,255,0.08)",
                                    boxShadow: isEquipped ? `0 0 18px ${gl.color}55, 0 4px 16px rgba(0,0,0,0.5)` : gl.tier !== "biasa" ? `0 0 10px ${tierCfg.glow}, 0 4px 12px rgba(0,0,0,0.4)` : "0 4px 12px rgba(0,0,0,0.4)",
                                  }}
                                >
                                  {/* tier shimmer */}
                                  {gl.tier !== "biasa" && (
                                    <motion.div className="pointer-events-none absolute inset-0 rounded-2xl"
                                      style={{ background: `linear-gradient(135deg, ${tierCfg.color}18 0%, transparent 60%)` }}
                                      animate={{ opacity: [0.5, 1, 0.5] }} transition={{ duration: 2.5, repeat: Infinity }} />
                                  )}

                                  {/* equipped badge */}
                                  {isEquipped && (
                                    <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }}
                                      className="absolute right-1.5 top-1.5 z-10 grid h-5 w-5 place-items-center rounded-full"
                                      style={{ background: gl.color }}>
                                      <Check className="h-3 w-3 text-white" strokeWidth={3} />
                                    </motion.div>
                                  )}

                                  {/* lock overlay */}
                                  {!isOwned && !canAfford && (
                                    <div className="absolute inset-0 z-10 flex items-center justify-center rounded-2xl bg-black/40">
                                      <Lock className="h-5 w-5 text-white/60" strokeWidth={2.5} />
                                    </div>
                                  )}

                                  {/* Badge image with name overlay */}
                                  <motion.div
                                    className="relative shrink-0 inline-flex w-28 items-center justify-center"
                                    animate={isEquipped ? { filter: [`drop-shadow(0 0 4px ${gl.color}55)`, `drop-shadow(0 0 12px ${gl.color}99)`, `drop-shadow(0 0 4px ${gl.color}55)`] } : {}}
                                    transition={{ duration: 2.5, repeat: Infinity }}
                                    style={{ opacity: !isOwned && !canAfford ? 0.45 : 1 }}
                                  >
                                    <img src={gl.img} alt={gl.name} className="w-full object-contain" />
                                  </motion.div>

                                  {/* Info */}
                                  <div className="flex-1 min-w-0">
                                    <div>
                                      {isOwned ? (
                                        <span className="text-[10px] font-black" style={{ color: gl.color }}>
                                          {isEquipped ? "✓ Aktif" : "✓ Dimiliki"}
                                        </span>
                                      ) : (
                                        <span className={`text-[10px] font-black ${canAfford ? (isGem ? "text-violet-300" : "text-ninja-yellow") : "text-white/35"}`}>
                                          {isGem ? "💎" : "🪙"} {gl.price}
                                        </span>
                                      )}
                                    </div>
                                  </div>
                                </motion.button>
                              );
                            })}
                          </motion.div>
                        </AnimatePresence>
                      </div>
                    </div>
                  </motion.div>
                )}

                {/* ── AUDIO TAB ── */}
                {activeTab === "audio" && (
                  <motion.div
                    key="audio"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.18 }}
                    className="flex flex-1 flex-col overflow-hidden"
                  >
                    {/* Sub-tabs: Muzik | Sound */}
                    <div className="flex shrink-0 gap-2 border-b border-white/8 px-4 py-3">
                      {(["muzik", "sound"] as const).map((t) => {
                        const active = audioTab === t;
                        return (
                          <motion.button
                            key={t}
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => { playClick(); setAudioTab(t); }}
                            className="flex items-center gap-1.5 rounded-full px-4 py-1.5 text-xs font-black uppercase tracking-wide transition-all"
                            style={{
                              background: active ? "rgba(249,224,75,0.15)" : "rgba(255,255,255,0.05)",
                              border: `2px solid ${active ? "#f9e04b" : "rgba(255,255,255,0.08)"}`,
                              color: active ? "#f9e04b" : "rgba(255,255,255,0.4)",
                              boxShadow: active ? "0 0 12px #f9e04b33" : "none",
                            }}
                          >
                            {t === "muzik" ? "🎵" : "🔊"} {t === "muzik" ? "Muzik" : "Sound"}
                          </motion.button>
                        );
                      })}
                    </div>

                    <div className="flex-1 overflow-y-auto p-4" style={{ scrollbarWidth: "none" }}>
                      <AnimatePresence mode="wait">
                        <motion.div
                          key={audioTab}
                          initial={{ opacity: 0, y: 8 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -8 }}
                          transition={{ duration: 0.18 }}
                        >
                          <GenericGrid
                            items={audioTab === "muzik" ? MUZIK : SOUND}
                            ownedIds={ownedIds}
                            equippedId={audioTab === "muzik" ? equipped.muzik : undefined}
                            coins={coins}
                            gems={gems}
                            denyId={denyId}
                            buyId={buyId}
                            onAction={(item) => handleItem(item, audioTab === "muzik" ? "muzik" : undefined)}
                          />
                        </motion.div>
                      </AnimatePresence>
                    </div>
                  </motion.div>
                )}

                {/* ── TOPUP TAB ── */}
                {activeTab === "topup" && (
                  <motion.div
                    key="topup"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.18 }}
                    className="flex flex-1 flex-col overflow-hidden"
                  >
                    {/* Sub-tab: Gem / Coin */}
                    <div className="flex shrink-0 gap-3 border-b border-white/8 px-5 py-3">
                      {(["gem", "coin"] as const).map((t) => {
                        const active = topupTab === t;
                        return (
                          <motion.button
                            key={t}
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => { playClick(); setTopupTab(t); }}
                            className="flex items-center gap-2 rounded-full px-5 py-1.5 text-xs font-black uppercase tracking-wide transition-all"
                            style={active ? {
                              background: t === "gem" ? "rgba(167,139,250,0.18)" : "rgba(251,191,36,0.18)",
                              border: `2px solid ${t === "gem" ? "#a78bfa" : "#fbbf24"}`,
                              color: t === "gem" ? "#a78bfa" : "#fbbf24",
                              boxShadow: `0 0 12px ${t === "gem" ? "#a78bfa44" : "#fbbf2444"}`,
                            } : {
                              background: "rgba(255,255,255,0.05)",
                              border: "2px solid rgba(255,255,255,0.08)",
                              color: "rgba(255,255,255,0.4)",
                            }}
                          >
                            {t === "gem" ? "💎" : "🪙"}
                            {t === "gem" ? "Diamond" : "Coin"}
                          </motion.button>
                        );
                      })}
                      <div className="ml-auto flex items-center gap-1.5 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[11px] font-semibold text-white/40">
                        <CreditCard className="h-3 w-3" /> Bayaran selamat
                      </div>
                    </div>

                    <div className="flex-1 overflow-y-auto p-4 sm:p-5" style={{ scrollbarWidth: "none" }}>
                      <AnimatePresence mode="wait">
                        <motion.div
                          key={topupTab}
                          initial={{ opacity: 0, y: 8 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -8 }}
                          transition={{ duration: 0.18 }}
                        >
                          {/* Header info */}
                          <div className="mb-4 rounded-2xl border border-white/8 bg-white/4 px-4 py-3 text-center">
                            <p className="text-xs font-semibold text-white/50">
                              {topupTab === "gem"
                                ? "💎 Diamond digunakan untuk beli avatar Rare & Legenda, bingkai premium dan lebih."
                                : "🪙 Coin digunakan untuk beli avatar Biasa, bingkai, power-up dan muzik dalam kedai."}
                            </p>
                          </div>

                          {/* Package grid */}
                          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                            {(topupTab === "gem" ? GEM_PACKAGES : COIN_PACKAGES).map((pkg) => {
                              const isGem = pkg.currency === "gem";
                              const accentColor = isGem ? "#a78bfa" : "#fbbf24";
                              const accentBg    = isGem ? "rgba(167,139,250,0.12)" : "rgba(251,191,36,0.12)";
                              const accentBorder= isGem ? "rgba(167,139,250,0.35)" : "rgba(251,191,36,0.35)";

                              return (
                                <motion.button
                                  key={pkg.id}
                                  whileHover={{ scale: 1.04, y: -4 }}
                                  whileTap={{ scale: 0.96 }}
                                  onClick={() => { playClick(); setTopupConfirm(pkg); }}
                                  className="relative flex flex-col items-center overflow-hidden rounded-2xl border-2 transition-all"
                                  style={{
                                    background: "linear-gradient(160deg,#0d1f3c 0%,#050e1f 100%)",
                                    borderColor: accentBorder,
                                    boxShadow: pkg.popular || pkg.bestValue
                                      ? `0 0 18px ${accentColor}44, 0 4px 16px rgba(0,0,0,0.5)`
                                      : "0 4px 12px rgba(0,0,0,0.4)",
                                  }}
                                >
                                  {/* Badge */}
                                  {pkg.popular && (
                                    <div className="absolute left-0 right-0 top-0 flex justify-center">
                                      <span className="rounded-b-xl px-3 py-0.5 text-[10px] font-black uppercase tracking-wider text-white"
                                        style={{ background: accentColor }}>
                                        Popular
                                      </span>
                                    </div>
                                  )}
                                  {pkg.bestValue && (
                                    <div className="absolute left-0 right-0 top-0 flex justify-center">
                                      <span className="rounded-b-xl px-3 py-0.5 text-[10px] font-black uppercase tracking-wider text-white"
                                        style={{ background: "linear-gradient(90deg,#f59e0b,#ef4444)" }}>
                                        Best Value
                                      </span>
                                    </div>
                                  )}

                                  <div className={`flex w-full flex-col items-center px-3 pb-3 ${pkg.popular || pkg.bestValue ? "pt-7" : "pt-4"}`}>
                                    {/* Icon */}
                                    <motion.div
                                      animate={{ scale: [1, 1.08, 1] }}
                                      transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
                                      className="mb-2 text-4xl drop-shadow-lg"
                                      style={{ filter: `drop-shadow(0 0 12px ${accentColor}88)` }}
                                    >
                                      {isGem ? "💎" : "🪙"}
                                    </motion.div>

                                    {/* Amount */}
                                    <p className="font-display text-xl font-black" style={{ color: accentColor }}>
                                      {pkg.amount.toLocaleString()}
                                    </p>
                                    {pkg.bonus > 0 && (
                                      <p className="text-[11px] font-black text-green-400">
                                        +{pkg.bonus.toLocaleString()} BONUS
                                      </p>
                                    )}

                                    {/* Label */}
                                    <p className="mt-1 text-center text-[11px] font-bold leading-tight text-white/60">
                                      {pkg.label}
                                    </p>

                                    {/* Divider */}
                                    <div className="my-2.5 w-full border-t border-white/8" />

                                    {/* Price */}
                                    <div
                                      className="flex w-full items-center justify-center gap-1.5 rounded-xl py-1.5 text-sm font-black text-white"
                                      style={{ background: accentBg, border: `1px solid ${accentBorder}` }}
                                    >
                                      <span className="text-[11px] font-semibold text-white/50">RM</span>
                                      <span style={{ color: accentColor }}>{pkg.price.toFixed(2)}</span>
                                    </div>
                                  </div>
                                </motion.button>
                              );
                            })}
                          </div>

                          {/* Disclaimer */}
                          <p className="mt-4 text-center text-[11px] text-white/25">
                            Semua pembelian adalah muktamad. Hubungi support jika ada masalah.
                          </p>
                        </motion.div>
                      </AnimatePresence>
                    </div>
                  </motion.div>
                )}

              </AnimatePresence>
            </div>

            {/* ── Bottom hint ─────────────────────────────────────────────── */}
            <div className="shrink-0 border-t border-white/8 px-5 py-2 text-center text-[11px] font-semibold text-white/25">
              {activeTab === "avatar"  && "🪙 Biasa = Coin  •  💎 Rare & Legenda = Gem"}
              {activeTab === "bingkai" && "Bingkai dipaparkan pada profil kamu."}
              {activeTab === "gelaran" && "Bingkai tajuk dipaparkan di bawah nama kamu pada profil."}
              {activeTab === "audio"   && (audioTab === "muzik" ? "🎵 Muzik dimainkan sebagai latar semasa sesi permainan." : "🔊 Sound effect dimainkan semasa aksi dalam permainan.")}
              {activeTab === "topup"   && "💳 Pembayaran selamat  •  Diamond & Coin dikreditkan serta-merta"}
            </div>
          </motion.div>

          {/* ── Payment Gateway Modal ── */}
          <AnimatePresence>
            {topupConfirm && (
              <motion.div
                className="absolute inset-0 z-[60] flex items-center justify-center p-4"
                style={{ background: "rgba(2,6,23,0.92)" }}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                <motion.div
                  className="relative w-full max-w-md overflow-hidden rounded-3xl shadow-[0_32px_80px_rgba(0,0,0,0.9)]"
                  style={{ background: "#f8fafc", maxHeight: "90vh", overflowY: "auto" }}
                  initial={{ scale: 0.88, opacity: 0, y: 24 }}
                  animate={{ scale: 1, opacity: 1, y: 0 }}
                  exit={{ scale: 0.88, opacity: 0, y: 16 }}
                  transition={{ duration: 0.28, ease: [0.34, 1.3, 0.64, 1] }}
                  onClick={(e) => e.stopPropagation()}
                >
                  {/* ── Gateway header bar ── */}
                  <div className="flex items-center justify-between px-5 py-3.5"
                    style={{ background: "linear-gradient(135deg,#1a3a8f 0%,#0f2060 100%)" }}>
                    <div className="flex items-center gap-2.5">
                      <div className="grid h-8 w-8 place-items-center rounded-lg bg-white/15">
                        <CreditCard className="h-4 w-4 text-white" strokeWidth={2.5} />
                      </div>
                      <div>
                        <p className="text-[10px] font-semibold uppercase tracking-widest text-white/50">Ninja Math Dojo</p>
                        <p className="text-sm font-black text-white">Portal Pembayaran</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="flex items-center gap-1.5 rounded-full bg-green-500/20 px-2.5 py-1">
                        <div className="h-1.5 w-1.5 rounded-full bg-green-400 animate-pulse" />
                        <span className="text-[10px] font-bold text-green-300">SELAMAT</span>
                        <span className="text-[10px] text-green-400">🔒</span>
                      </div>
                      {payStep !== "processing" && (
                        <button
                          onClick={() => { playClick(); setTopupConfirm(null); setPayStep("method"); setPayMethod(null); setFpxBank(""); setCardNum(""); setCardName(""); setCardExp(""); setCardCvv(""); }}
                          className="grid h-7 w-7 place-items-center rounded-full bg-white/10 text-white/70 hover:bg-white/20 hover:text-white transition-colors"
                        >
                          <X className="h-3.5 w-3.5" strokeWidth={2.5} />
                        </button>
                      )}
                    </div>
                  </div>

                  {/* ── Order summary strip ── */}
                  <div className="flex items-center justify-between border-b border-gray-100 bg-gray-50 px-5 py-3">
                    <div className="flex items-center gap-2">
                      <span className="text-lg">{topupConfirm.currency === "gem" ? "💎" : "🪙"}</span>
                      <div>
                        <p className="text-xs font-semibold text-gray-500">Pakej</p>
                        <p className="text-sm font-black text-gray-800">{topupConfirm.label}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-xs font-semibold text-gray-400">Jumlah Bayaran</p>
                      <p className="font-black text-gray-900 text-lg">RM {topupConfirm.price.toFixed(2)}</p>
                    </div>
                  </div>

                  <AnimatePresence mode="wait">

                    {/* ════ STEP 1 — METHOD ════ */}
                    {payStep === "method" && (
                      <motion.div key="method" initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }} transition={{ duration: 0.2 }}
                        className="px-5 py-5 flex flex-col gap-4">
                        <p className="text-sm font-black text-gray-700">Pilih kaedah pembayaran</p>

                        {/* FPX */}
                        <motion.button
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          onClick={() => { playClick(); setPayMethod("fpx"); setPayStep("form"); }}
                          className="flex items-center gap-4 rounded-2xl border-2 border-gray-200 bg-white px-4 py-3.5 text-left shadow-sm transition-all hover:border-blue-400 hover:shadow-md"
                        >
                          <div className="grid h-11 w-11 shrink-0 place-items-center rounded-xl"
                            style={{ background: "linear-gradient(135deg,#ff6b35,#f7c59f)" }}>
                            <span className="text-xl font-black text-white text-xs leading-none">FPX</span>
                          </div>
                          <div className="flex-1">
                            <p className="font-black text-gray-800 text-sm">Online Banking (FPX)</p>
                            <p className="text-[11px] text-gray-400 mt-0.5">Maybank2u, CIMB Clicks, RHB, HLB & lebih</p>
                          </div>
                          <div className="flex gap-1">
                            {["M","C","R"].map((b) => (
                              <span key={b} className="grid h-5 w-5 place-items-center rounded text-[8px] font-black text-white"
                                style={{ background: b === "M" ? "#f7a800" : b === "C" ? "#e31837" : "#005baa" }}>{b}</span>
                            ))}
                          </div>
                        </motion.button>

                        {/* Card */}
                        <motion.button
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          onClick={() => { playClick(); setPayMethod("card"); setPayStep("form"); }}
                          className="flex items-center gap-4 rounded-2xl border-2 border-gray-200 bg-white px-4 py-3.5 text-left shadow-sm transition-all hover:border-blue-400 hover:shadow-md"
                        >
                          <div className="grid h-11 w-11 shrink-0 place-items-center rounded-xl"
                            style={{ background: "linear-gradient(135deg,#1a56db,#1e40af)" }}>
                            <CreditCard className="h-5 w-5 text-white" strokeWidth={2} />
                          </div>
                          <div className="flex-1">
                            <p className="font-black text-gray-800 text-sm">Kad Kredit / Debit</p>
                            <p className="text-[11px] text-gray-400 mt-0.5">Visa, Mastercard, American Express</p>
                          </div>
                          <div className="flex gap-1.5 items-center">
                            <div className="flex h-5 items-center rounded px-1.5 text-[9px] font-black text-white" style={{ background: "#1a1f71" }}>VISA</div>
                            <div className="flex h-5 w-8 items-center justify-center rounded" style={{ background: "#fff", border: "1px solid #eee" }}>
                              <div className="flex">
                                <div className="h-4 w-4 rounded-full opacity-90" style={{ background: "#eb001b" }} />
                                <div className="h-4 w-4 -ml-2 rounded-full opacity-80" style={{ background: "#f79e1b" }} />
                              </div>
                            </div>
                          </div>
                        </motion.button>

                        <button onClick={() => { playClick(); setTopupConfirm(null); setPayStep("method"); setPayMethod(null); }}
                          className="mt-1 text-center text-xs font-semibold text-gray-400 hover:text-gray-600 transition-colors">
                          Batal
                        </button>
                      </motion.div>
                    )}

                    {/* ════ STEP 2 — FORM ════ */}
                    {payStep === "form" && payMethod === "fpx" && (
                      <motion.div key="fpx-form" initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }} transition={{ duration: 0.2 }}
                        className="px-5 py-5 flex flex-col gap-4">
                        <div className="flex items-center gap-2">
                          <button onClick={() => { playClick(); setPayStep("method"); }} className="text-gray-400 hover:text-gray-600">
                            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" /></svg>
                          </button>
                          <p className="text-sm font-black text-gray-700">Pilih Bank</p>
                        </div>

                        <div className="grid grid-cols-2 gap-2">
                          {[
                            { id: "maybank",  name: "Maybank2u",    color: "#f7a800", short: "M2U" },
                            { id: "cimb",     name: "CIMB Clicks",  color: "#e31837", short: "CIMB" },
                            { id: "hlb",      name: "Hong Leong",   color: "#005baa", short: "HLB" },
                            { id: "rhb",      name: "RHB Now",      color: "#003087", short: "RHB" },
                            { id: "public",   name: "Public Bank",  color: "#00529b", short: "PBB" },
                            { id: "ambank",   name: "AmOnline",     color: "#e4002b", short: "AMB" },
                          ].map((bank) => (
                            <motion.button
                              key={bank.id}
                              whileHover={{ scale: 1.03 }}
                              whileTap={{ scale: 0.97 }}
                              onClick={() => { playClick(); setFpxBank(bank.id); }}
                              className="flex items-center gap-3 rounded-xl border-2 px-3 py-2.5 text-left transition-all"
                              style={{
                                borderColor: fpxBank === bank.id ? bank.color : "#e5e7eb",
                                background: fpxBank === bank.id ? bank.color + "12" : "#fff",
                                boxShadow: fpxBank === bank.id ? `0 0 0 3px ${bank.color}22` : "none",
                              }}
                            >
                              <div className="grid h-8 w-8 shrink-0 place-items-center rounded-lg text-[10px] font-black text-white"
                                style={{ background: bank.color }}>{bank.short}</div>
                              <span className="text-xs font-bold text-gray-700 leading-tight">{bank.name}</span>
                              {fpxBank === bank.id && <Check className="ml-auto h-3.5 w-3.5 shrink-0" style={{ color: bank.color }} strokeWidth={3} />}
                            </motion.button>
                          ))}
                        </div>

                        <motion.button
                          whileHover={fpxBank ? { scale: 1.03, y: -2 } : {}}
                          whileTap={fpxBank ? { scale: 0.97 } : {}}
                          onClick={() => {
                            if (!fpxBank) return;
                            playClick();
                            setPayStep("processing");
                            setTimeout(() => { playBuy(); setPayStep("success"); }, 2800);
                          }}
                          className="w-full rounded-2xl py-3 text-sm font-black text-white transition-all"
                          style={{
                            background: fpxBank ? "linear-gradient(135deg,#1a3a8f,#0f2060)" : "#d1d5db",
                            cursor: fpxBank ? "pointer" : "not-allowed",
                          }}
                        >
                          Teruskan ke Bank — RM {topupConfirm.price.toFixed(2)}
                        </motion.button>

                        <p className="text-center text-[10px] text-gray-400">
                          🔒 Urus niaga dilindungi enkripsi SSL 256-bit
                        </p>
                      </motion.div>
                    )}

                    {payStep === "form" && payMethod === "card" && (
                      <motion.div key="card-form" initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }} transition={{ duration: 0.2 }}
                        className="px-5 py-5 flex flex-col gap-3.5">
                        <div className="flex items-center gap-2">
                          <button onClick={() => { playClick(); setPayStep("method"); }} className="text-gray-400 hover:text-gray-600">
                            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" /></svg>
                          </button>
                          <p className="text-sm font-black text-gray-700">Butiran Kad</p>
                        </div>

                        {/* Card preview */}
                        <div className="relative h-36 w-full overflow-hidden rounded-2xl"
                          style={{ background: "linear-gradient(135deg,#1a3a8f 0%,#6d28d9 100%)" }}>
                          <div className="absolute inset-0 opacity-10"
                            style={{ backgroundImage: "repeating-linear-gradient(45deg,#fff 0,#fff 1px,transparent 0,transparent 50%)", backgroundSize: "8px 8px" }} />
                          <div className="absolute top-4 left-4 grid h-8 w-10 grid-rows-2 gap-0.5">
                            <div className="rounded bg-yellow-300/80 h-3" />
                            <div className="rounded bg-yellow-300/50 h-3 w-8" />
                          </div>
                          <div className="absolute bottom-4 left-4 right-4">
                            <p className="font-mono text-base font-bold tracking-[0.2em] text-white/90">
                              {cardNum ? cardNum.replace(/(.{4})/g, "$1 ").trim() : "•••• •••• •••• ••••"}
                            </p>
                            <div className="mt-2 flex justify-between">
                              <p className="text-[11px] font-semibold uppercase tracking-wider text-white/60">
                                {cardName || "NAMA PEMEGANG KAD"}
                              </p>
                              <p className="text-[11px] font-semibold text-white/60">{cardExp || "MM/YY"}</p>
                            </div>
                          </div>
                        </div>

                        {/* Inputs */}
                        <div className="flex flex-col gap-2.5">
                          <div>
                            <label className="mb-1 block text-[11px] font-bold text-gray-500 uppercase tracking-wider">Nombor Kad</label>
                            <input
                              type="text" inputMode="numeric" maxLength={19} placeholder="0000 0000 0000 0000"
                              value={cardNum}
                              onChange={(e) => {
                                const v = e.target.value.replace(/\D/g, "").slice(0, 16);
                                setCardNum(v.replace(/(.{4})/g, "$1 ").trim());
                              }}
                              className="w-full rounded-xl border-2 border-gray-200 bg-white px-4 py-2.5 font-mono text-sm font-bold text-gray-800 outline-none focus:border-blue-500 transition-colors"
                            />
                          </div>
                          <div>
                            <label className="mb-1 block text-[11px] font-bold text-gray-500 uppercase tracking-wider">Nama Pemegang Kad</label>
                            <input
                              type="text" placeholder="NAMA PENUH"
                              value={cardName}
                              onChange={(e) => setCardName(e.target.value.toUpperCase())}
                              className="w-full rounded-xl border-2 border-gray-200 bg-white px-4 py-2.5 text-sm font-bold text-gray-800 outline-none focus:border-blue-500 transition-colors"
                            />
                          </div>
                          <div className="flex gap-3">
                            <div className="flex-1">
                              <label className="mb-1 block text-[11px] font-bold text-gray-500 uppercase tracking-wider">Tarikh Luput</label>
                              <input
                                type="text" inputMode="numeric" maxLength={5} placeholder="MM/YY"
                                value={cardExp}
                                onChange={(e) => {
                                  let v = e.target.value.replace(/\D/g, "").slice(0, 4);
                                  if (v.length >= 3) v = v.slice(0, 2) + "/" + v.slice(2);
                                  setCardExp(v);
                                }}
                                className="w-full rounded-xl border-2 border-gray-200 bg-white px-4 py-2.5 font-mono text-sm font-bold text-gray-800 outline-none focus:border-blue-500 transition-colors"
                              />
                            </div>
                            <div className="flex-1">
                              <label className="mb-1 block text-[11px] font-bold text-gray-500 uppercase tracking-wider">CVV</label>
                              <input
                                type="password" inputMode="numeric" maxLength={3} placeholder="•••"
                                value={cardCvv}
                                onChange={(e) => setCardCvv(e.target.value.replace(/\D/g, "").slice(0, 3))}
                                className="w-full rounded-xl border-2 border-gray-200 bg-white px-4 py-2.5 font-mono text-sm font-bold text-gray-800 outline-none focus:border-blue-500 transition-colors"
                              />
                            </div>
                          </div>
                        </div>

                        {(() => {
                          const ready = cardNum.replace(/\s/g, "").length === 16 && cardName.length > 2 && cardExp.length === 5 && cardCvv.length === 3;
                          return (
                            <motion.button
                              whileHover={ready ? { scale: 1.03, y: -2 } : {}}
                              whileTap={ready ? { scale: 0.97 } : {}}
                              onClick={() => {
                                if (!ready) return;
                                playClick();
                                setPayStep("processing");
                                setTimeout(() => { playBuy(); setPayStep("success"); }, 2800);
                              }}
                              className="w-full rounded-2xl py-3 text-sm font-black text-white transition-all"
                              style={{
                                background: ready ? "linear-gradient(135deg,#1a3a8f,#0f2060)" : "#d1d5db",
                                cursor: ready ? "pointer" : "not-allowed",
                              }}
                            >
                              Bayar RM {topupConfirm.price.toFixed(2)}
                            </motion.button>
                          );
                        })()}

                        <div className="flex items-center justify-center gap-3">
                          <div className="h-px flex-1 bg-gray-100" />
                          <p className="text-[10px] text-gray-400">🔒 SSL 256-bit • PCI DSS</p>
                          <div className="h-px flex-1 bg-gray-100" />
                        </div>
                      </motion.div>
                    )}

                    {/* ════ STEP 3 — PROCESSING ════ */}
                    {payStep === "processing" && (
                      <motion.div key="processing" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                        className="flex flex-col items-center gap-5 px-6 py-10 text-center">
                        <motion.div
                          animate={{ rotate: 360 }}
                          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                          className="h-14 w-14 rounded-full border-4 border-blue-100 border-t-blue-600"
                        />
                        <div>
                          <p className="font-black text-gray-800">Memproses Bayaran...</p>
                          <p className="mt-1 text-xs text-gray-400">Sila jangan tutup tetingkap ini</p>
                        </div>
                        <div className="flex flex-col gap-2 w-full">
                          {["Mengesahkan maklumat kad", "Menghubungi bank", "Memproses transaksi"].map((step, i) => (
                            <motion.div key={step}
                              initial={{ opacity: 0, x: -10 }}
                              animate={{ opacity: 1, x: 0 }}
                              transition={{ delay: i * 0.7 }}
                              className="flex items-center gap-2 rounded-xl bg-gray-50 px-3 py-2 text-left">
                              <motion.div
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                transition={{ delay: i * 0.7 + 0.2 }}
                                className="h-4 w-4 shrink-0 rounded-full bg-blue-500 grid place-items-center">
                                <Check className="h-2.5 w-2.5 text-white" strokeWidth={3} />
                              </motion.div>
                              <span className="text-xs font-semibold text-gray-600">{step}</span>
                            </motion.div>
                          ))}
                        </div>
                      </motion.div>
                    )}

                    {/* ════ STEP 4 — SUCCESS ════ */}
                    {payStep === "success" && (
                      <motion.div key="success" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }}
                        className="flex flex-col items-center gap-4 px-6 py-8 text-center">
                        <motion.div
                          initial={{ scale: 0, rotate: -180 }}
                          animate={{ scale: 1, rotate: 0 }}
                          transition={{ type: "spring", stiffness: 260, damping: 18 }}
                          className="grid h-20 w-20 place-items-center rounded-full bg-green-100"
                        >
                          <Check className="h-10 w-10 text-green-500" strokeWidth={3} />
                        </motion.div>

                        <div>
                          <p className="font-black text-xl text-gray-800">Bayaran Berjaya!</p>
                          <p className="mt-1 text-xs text-gray-400">ID Transaksi: NMD-{Math.random().toString(36).slice(2,10).toUpperCase()}</p>
                        </div>

                        <div className="w-full rounded-2xl border border-gray-100 bg-gray-50 px-4 py-4">
                          <div className="flex items-center justify-between text-sm mb-2">
                            <span className="text-gray-500">Pakej</span>
                            <span className="font-black text-gray-800">{topupConfirm.label}</span>
                          </div>
                          <div className="flex items-center justify-between text-sm mb-2">
                            <span className="text-gray-500">Jumlah Dibayar</span>
                            <span className="font-black text-gray-800">RM {topupConfirm.price.toFixed(2)}</span>
                          </div>
                          <div className="border-t border-gray-200 pt-2 flex items-center justify-between">
                            <span className="font-bold text-gray-600">Dikreditkan</span>
                            <span className="font-display text-lg font-black" style={{ color: topupConfirm.currency === "gem" ? "#7c3aed" : "#d97706" }}>
                              {topupConfirm.currency === "gem" ? "💎" : "🪙"} {(topupConfirm.amount + topupConfirm.bonus).toLocaleString()}
                            </span>
                          </div>
                        </div>

                        <motion.button
                          whileHover={{ scale: 1.04, y: -2 }}
                          whileTap={{ scale: 0.97 }}
                          onClick={() => {
                            playClick();
                            if (topupConfirm.currency === "gem") onGemsChange(gems + topupConfirm.amount + topupConfirm.bonus);
                            else onCoinsChange(coins + topupConfirm.amount + topupConfirm.bonus);
                            showToast(`${topupConfirm.currency === "gem" ? "💎" : "🪙"} ${(topupConfirm.amount + topupConfirm.bonus).toLocaleString()} telah dikreditkan! 🎉`, true);
                            setTopupConfirm(null);
                            setPayStep("method");
                            setPayMethod(null);
                            setFpxBank("");
                            setCardNum(""); setCardName(""); setCardExp(""); setCardCvv("");
                          }}
                          className="w-full rounded-2xl py-3 text-sm font-black text-white"
                          style={{ background: "linear-gradient(135deg,#16a34a,#15803d)", boxShadow: "0 6px 0 #14532d" }}
                        >
                          Tutup & Kembali ke Kedai
                        </motion.button>
                      </motion.div>
                    )}

                  </AnimatePresence>

                  {/* Footer */}
                  {payStep !== "processing" && payStep !== "success" && (
                    <div className="flex items-center justify-center gap-4 border-t border-gray-100 bg-gray-50 px-5 py-3">
                      <span className="text-[10px] text-gray-300 font-semibold">Diterima:</span>
                      <div className="flex h-5 items-center rounded px-1.5 text-[9px] font-black text-white" style={{ background: "#1a1f71" }}>VISA</div>
                      <div className="flex h-5 w-9 items-center justify-center rounded" style={{ background: "#fff", border: "1px solid #eee" }}>
                        <div className="flex"><div className="h-4 w-4 rounded-full" style={{ background: "#eb001b" }} /><div className="h-4 w-4 -ml-2 rounded-full opacity-80" style={{ background: "#f79e1b" }} /></div>
                      </div>
                      <div className="grid h-5 place-items-center rounded px-2 text-[9px] font-black text-white" style={{ background: "#f7a800" }}>FPX</div>
                    </div>
                  )}
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* ── Toast ── */}
          <AnimatePresence>
            {toast && (
              <motion.div
                className={`absolute bottom-8 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-2xl border px-5 py-2.5 font-display text-sm font-black shadow-2xl backdrop-blur-sm ${
                  toast.ok ? "border-green-500/30 bg-green-950/90 text-green-300" : "border-red-500/30 bg-red-950/90 text-red-300"
                }`}
                initial={{ opacity: 0, y: 16, scale: 0.88 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 8, scale: 0.94 }}
                transition={{ duration: 0.22 }}
              >
                {toast.msg}
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// ── Generic grid ──────────────────────────────────────────────────────────────
function GenericGrid({ items, ownedIds, equippedId, coins, gems, denyId, buyId, onAction }: {
  items: ShopItem[];
  ownedIds: Set<string>;
  equippedId?: string;
  coins: number;
  gems: number;
  denyId: string | null;
  buyId: string | null;
  onAction: (item: ShopItem) => void;
}) {
  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
      {items.map((item) => {
        const isOwned    = ownedIds.has(item.id) || !!item.owned;
        const isEquipped = equippedId === item.id;
        const isDeny     = denyId === item.id;
        const isBuy      = buyId  === item.id;
        const isGem      = item.currency === "gem";
        const balance    = isGem ? gems : coins;
        const canAfford  = balance >= item.price;

        return (
          <motion.button
            key={item.id}
            onClick={() => onAction(item)}
            whileHover={{ scale: 1.04, y: -3 }}
            whileTap={{ scale: 0.96 }}
            animate={isDeny ? { x: [0, -7, 7, -5, 0] } : {}}
            transition={{ duration: 0.35 }}
            className={`relative flex flex-col items-center gap-2 rounded-2xl border-2 p-4 text-center transition-all ${
              isEquipped
                ? "border-ninja-yellow bg-ninja-yellow/10 shadow-[0_0_20px_rgba(249,224,75,0.2)]"
                : isOwned
                  ? "border-green-500/40 bg-green-950/30"
                  : !canAfford
                    ? "border-white/8 bg-white/3 opacity-55"
                    : "border-white/10 bg-white/5 hover:border-white/20 hover:bg-white/8"
            }`}
            style={{ boxShadow: isBuy ? "0 0 24px rgba(249,224,75,0.4)" : undefined }}
          >
            {isEquipped && (
              <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="absolute right-2 top-2 grid h-5 w-5 place-items-center rounded-full bg-ninja-yellow">
                <Check className="h-3 w-3 text-ninja-navy-deep" strokeWidth={3} />
              </motion.div>
            )}
            {!isOwned && !canAfford && (
              <div className="absolute left-2 top-2">
                <Lock className="h-3.5 w-3.5 text-white/30" strokeWidth={2.5} />
              </div>
            )}
            <span className="text-4xl drop-shadow-md">{item.emoji}</span>
            <p className="font-display text-sm font-black leading-tight text-white">{item.name}</p>
            <p className="text-[11px] leading-snug text-white/45">{item.desc}</p>
            <div className="mt-auto w-full">
              {isOwned && !isEquipped && equippedId !== undefined && (
                <div className="rounded-xl bg-green-500/15 py-1 text-xs font-black text-green-400">Pakai</div>
              )}
              {isOwned && equippedId === undefined && (
                <div className="rounded-xl bg-green-500/15 py-1 text-xs font-black text-green-400">Dimiliki ✓</div>
              )}
              {isEquipped && (
                <div className="rounded-xl bg-ninja-yellow/15 py-1 text-xs font-black text-ninja-yellow">Dipakai ✓</div>
              )}
              {!isOwned && (
                <div className={`flex items-center justify-center gap-1 rounded-xl py-1 text-xs font-black ${
                  canAfford ? (isGem ? "bg-violet-500/15 text-violet-300" : "bg-ninja-yellow/15 text-ninja-yellow") : "bg-white/8 text-white/30"
                }`}>
                  {isGem ? "💎" : "🪙"} {item.price}
                </div>
              )}
            </div>
          </motion.button>
        );
      })}
    </div>
  );
}
