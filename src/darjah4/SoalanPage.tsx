// Darjah 4 · Soalan. Disalin daripada ninja-math-dojo (src/routes/soalan.tsx).
// Perubahan: tiada router (navigasi melalui props), gambar WebP dalam public/home/darjah4,
// semua bunyi ikut butang bunyi (bermula dengan tetapan bunyi game), tiada sonner.
import { AnimatePresence, MotionConfig, motion } from "framer-motion";
import {
  Check,
  ChevronLeft,
  Maximize2,
  RotateCcw,
  ScrollText,
  Volume2,
  VolumeX,
  X,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import shurikenSound from "../home/assets/sounds/shuriken-sound.mp3";
import swordSound from "../home/assets/sounds/sword-sound.mp3";
import taikoDrumSound from "../home/assets/sounds/taiko-drum-sound.mp3";
import dingSound from "../home/assets/sounds/ding-sound.mp3";
import clickSound from "../home/assets/sounds/click-sound.mp3";
import "../home/dojo.css";

const IMG = "/home/darjah4";
const ninjaHouseBg = `${IMG}/rumah-ninja.webp`;
const scrollHandImg = `${IMG}/skrol-tangan.webp`;
const imageQuestion = `${IMG}/gambar-soalan.webp`;
const imageAnswer = `${IMG}/gambar-jawapan.webp`;
const shurikenImg = `${IMG}/shuriken.webp`;
const crackImg = `${IMG}/retak.webp`;

let sfxOn = true;
const playSfx = (src: string) => {
  if (sfxOn) new Audio(src).play().catch(() => {});
};
const playClick = () => playSfx(clickSound);

type SoalanProps = {
  sound: boolean;
  // keluar ke peta subtopik; completed = pemain tekan "Kembali Ke Map" selepas keputusan
  onExit: (completed: boolean) => void;
};

export type Question = {
  prompt: string;
  leftNumber: string;
  rightNumber: string;
  options: string[];
  correctIndex: number;
  hint: string;
  explanation: string;
  difficulty: "mudah" | "medium" | "susah";
};

export const questions: Question[] = [
  {
    prompt: "Bandingkan 85 010 ____ 15 792. Pilih jawapan yang betul.",
    leftNumber: "85 010",
    rightNumber: "15 792",
    options: ["Kurang daripada", "Lebih daripada", "Menaik", "Menurun"],
    correctIndex: 1,
    hint: "Lihat digit puluh ribu dahulu.",
    explanation: "85 010 lebih besar kerana digit puluh ribu 8 lebih besar daripada 1.",
    difficulty: "mudah",
  },
  {
    prompt: "Bandingkan 24 305 ____ 42 305. Pilih jawapan yang betul.",
    leftNumber: "24 305",
    rightNumber: "42 305",
    options: ["Lebih daripada", "Sama dengan", "Kurang daripada", "Menurun"],
    correctIndex: 2,
    hint: "Bandingkan digit paling kiri.",
    explanation: "24 305 kurang daripada 42 305 kerana 2 puluh ribu lebih kecil daripada 4 puluh ribu.",
    difficulty: "mudah",
  },
  {
    prompt: "Susunan 10 450, 12 450, 14 450 ialah susunan apa?",
    leftNumber: "10 450",
    rightNumber: "14 450",
    options: ["Menurun", "Menaik", "Rawak", "Sama nilai"],
    correctIndex: 1,
    hint: "Nombor semakin besar atau semakin kecil?",
    explanation: "Susunan itu menaik kerana nilai nombor bertambah dari kiri ke kanan.",
    difficulty: "medium",
  },
  {
    prompt: "Bandingkan 60 008 ____ 60 080.",
    leftNumber: "60 008",
    rightNumber: "60 080",
    options: ["Lebih daripada", "Kurang daripada", "Sama dengan", "Menaik"],
    correctIndex: 1,
    hint: "Jika digit awal sama, bandingkan digit seterusnya.",
    explanation: "60 008 kurang daripada 60 080 kerana 8 lebih kecil daripada 80 pada bahagian akhir.",
    difficulty: "susah",
  },
  {
    prompt: "Pilih nombor paling besar.",
    leftNumber: "39 901",
    rightNumber: "39 910",
    options: ["39 901", "39 190", "39 910", "39 109"],
    correctIndex: 2,
    hint: "Bandingkan dari kiri ke kanan.",
    explanation: "39 910 paling besar kerana nilai puluhnya lebih tinggi berbanding pilihan lain.",
    difficulty: "susah",
  },
];

const optionLetters = ["A", "B", "C", "D"];

export default function SoalanPage({ sound, onExit }: SoalanProps) {
  // dikemas kini setiap render supaya fungsi bunyi di luar komponen ikut butang bunyi
  const [current, setCurrent] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [answers, setAnswers] = useState<(number | null)[]>(() =>
    Array(questions.length).fill(null),
  );
  const [showZoom, setShowZoom] = useState(false);
  const [soundOn, setSoundOn] = useState(sound);
  sfxOn = soundOn;
  const [showResult, setShowResult] = useState(false);
  const [showSolution, setShowSolution] = useState(false);
  const [shurikenTarget, setShurikenTarget] = useState<number | null>(null);
  const [slashTarget, setSlashTarget] = useState<number | null>(null);
  const [spiderPhase, setSpiderPhase] = useState<"hidden" | "down" | "up">("hidden");
  const [spiderLeftPos, setSpiderLeftPos] = useState(5);
  const [spiderRightPos, setSpiderRightPos] = useState(88);

  useEffect(() => {
    const trigger = () => {
      setSpiderLeftPos(3 + Math.floor(Math.random() * 12));
      setSpiderRightPos(85 + Math.floor(Math.random() * 10));
      setSpiderPhase("down");
      setTimeout(() => setSpiderPhase("up"), 3200);
      setTimeout(() => setSpiderPhase("hidden"), 4400);
    };
    const id = setInterval(trigger, 10000);
    return () => clearInterval(id);
  }, []);

  const question = questions[current];
  const submittedAnswer = answers[current];
  const isSubmitted = submittedAnswer !== null;
  const isCorrect = submittedAnswer === question.correctIndex;
  const score = answers.reduce<number>(
    (total, answer, index) => total + (answer !== null && answer === questions[index].correctIndex ? 1 : 0),
     0,
  );

  const status = useMemo(
    () =>
      questions.map((_, index) => {
        if (index === current) return "current";
        if (answers[index] === null) return "idle";
        return answers[index] === questions[index].correctIndex ? "correct" : "wrong";
      }),
    [answers, current],
  );

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      const key = event.key.toLowerCase();
      const optionIndex = ["a", "b", "c", "d"].indexOf(key);
      if (optionIndex >= 0 && !isSubmitted) setSelected(optionIndex);
      if (key === "enter") {
        if (!isSubmitted && selected !== null) submitAnswer();
        if (isSubmitted) goNext();
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [isSubmitted, selected, current]);

  function submitAnswer() {
    if (selected === null) return;
    const useShuriken = current % 2 === 0;
    if (useShuriken) {
      playSfx(shurikenSound);
      setShurikenTarget(selected);
      setTimeout(() => {
        const isCorrect = selected === question.correctIndex;
        playSfx(isCorrect ? dingSound : taikoDrumSound);
        setAnswers((prev) => { const next = [...prev]; next[current] = selected; return next; });
      }, 450);
    } else {
      playSfx(swordSound);
      setSlashTarget(selected);
      setTimeout(() => {
        const isCorrect = selected === question.correctIndex;
        playSfx(isCorrect ? dingSound : taikoDrumSound);
        setAnswers((prev) => { const next = [...prev]; next[current] = selected; return next; });
        setSlashTarget(null);
      }, 600);
    }
  }

  function goNext() {
    setSelected(null);
    setShowSolution(false);
    setShurikenTarget(null);

    if (current === questions.length - 1) {
      setShowResult(true);
      return;
    }

    setCurrent((value) => value + 1);
  }

  function retryWrong() {
    const firstWrong = answers.findIndex(
      (answer, index) => answer !== questions[index].correctIndex,
    );
    setShowResult(false);
    setCurrent(firstWrong >= 0 ? firstWrong : 0);
    setSelected(null);
    setShowSolution(false);
  }

  return (
    <MotionConfig reducedMotion="user">
    <div className="dojo-home">
    <div className="relative h-dvh w-screen overflow-hidden bg-[#2b1208] font-sans">
      <img
        src={ninjaHouseBg}
        alt=""
        aria-hidden
        className="absolute inset-0 h-full w-full object-cover object-center"
      />
      <div className="absolute inset-0 bg-[#4a1f0c]/45" />
      <style>{`
        @keyframes dojo-dust {
          0% { transform: translate3d(0, 14px, 0); opacity: 0; }
          25% { opacity: 0.45; }
          100% { transform: translate3d(18px, -46px, 0); opacity: 0; }
        }
        @keyframes ray-sway {
          0%, 100% { transform: rotate(-8deg) translateX(0); opacity: 0.18; }
          50% { transform: rotate(-5deg) translateX(22px); opacity: 0.3; }
        }
        @keyframes submit-ready {
          0%, 100% { box-shadow: 0 0 0 0 rgba(250, 204, 21, 0.45), 0 7px 0 #7c2d12; }
          50% { box-shadow: 0 0 0 10px rgba(250, 204, 21, 0), 0 7px 0 #7c2d12; }
        }
        @keyframes scroll-unroll {
          0% { transform: scaleY(0); opacity: 0; }
          100% { transform: scaleY(1); opacity: 1; }
        }
      `}</style>
      <div
        className="pointer-events-none absolute left-[14%] top-0 h-full w-28 origin-top bg-gradient-to-b from-yellow-200/35 to-transparent blur-md"
        style={{ animation: "ray-sway 7s ease-in-out infinite" }}
      />
      <div
        className="pointer-events-none absolute right-[18%] top-0 h-full w-24 origin-top bg-gradient-to-b from-yellow-200/25 to-transparent blur-md"
        style={{ animation: "ray-sway 8s ease-in-out 1.2s infinite" }}
      />
      {/* labah-labah kiri dan kanan */}
      <AnimatePresence>
        {spiderPhase !== "hidden" && (
          <>
            {[{ left: spiderLeftPos, delay: 0 }, { left: spiderRightPos, delay: 0.3 }].map(({ left, delay }) => (
              <motion.div
                key={left}
                className="pointer-events-none absolute z-[5] flex flex-col items-center"
                style={{ left: `${left}%` }}
                initial={{ top: "-120px" }}
                animate={spiderPhase === "down" ? { top: "35%" } : { top: "-120px" }}
                transition={
                  spiderPhase === "down"
                    ? { duration: 1.4, ease: "easeOut", type: "spring", bounce: 0.45, delay }
                    : { duration: 0.9, ease: "easeIn", delay }
                }
              >
                <div className="w-[2px] bg-white/70" style={{ height: "120vh", marginTop: "-120vh" }} />
                <div className="flex flex-col items-center">
                  <div className="relative h-10 w-10">
                    {[-40, -25, -10].map((deg, i) => (
                      <motion.div
                        key={`kl-${i}`}
                        className="absolute left-0 top-1/2 h-[2px] w-5 origin-right rounded-full bg-gray-800"
                        style={{ rotate: deg, transformOrigin: "right center" }}
                        animate={{ rotate: [deg, deg - 15, deg] }}
                        transition={{ duration: 0.4, repeat: Infinity, delay: i * 0.1 }}
                      />
                    ))}
                    {[40, 25, 10].map((deg, i) => (
                      <motion.div
                        key={`kr-${i}`}
                        className="absolute right-0 top-1/2 h-[2px] w-5 origin-left rounded-full bg-gray-800"
                        style={{ rotate: deg, transformOrigin: "left center" }}
                        animate={{ rotate: [deg, deg + 15, deg] }}
                        transition={{ duration: 0.4, repeat: Infinity, delay: i * 0.1 }}
                      />
                    ))}
                    <div className="absolute left-1/2 top-1/2 h-7 w-7 -translate-x-1/2 -translate-y-1/2 rounded-full bg-gray-900 shadow-[0_0_6px_rgba(0,0,0,0.6)]" />
                    <div className="absolute left-1/2 top-0 h-4 w-4 -translate-x-1/2 -translate-y-1 rounded-full bg-gray-800" />
                    <div className="absolute left-1/2 top-1 -translate-x-1/2 flex gap-1">
                      <div className="h-1.5 w-1.5 rounded-full bg-red-400" />
                      <div className="h-1.5 w-1.5 rounded-full bg-red-400" />
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </>
        )}
      </AnimatePresence>

      {[12, 24, 38, 52, 68, 82].map((left, index) => (
        <span
          key={left}
          className="pointer-events-none absolute h-1.5 w-1.5 rounded-full bg-yellow-100/70"
          style={{
            left: `${left}%`,
            top: `${38 + (index % 3) * 14}%`,
            animation: `dojo-dust ${5 + index * 0.7}s ease-in-out ${index * 0.8}s infinite`,
          }}
        />
      ))}

      <motion.button
        whileHover={{ scale: 1.06, x: -2 }}
        whileTap={{ scale: 0.94 }}
        onClick={() => { playClick(); onExit(false); }}
        className="absolute left-4 top-4 z-30 grid h-12 w-12 place-items-center rounded-full border-[3px] border-[#5b2509] text-white shadow-[var(--shadow-game)]"
        style={{ background: "var(--gradient-orange)" }}
      >
        <ChevronLeft className="h-7 w-7" strokeWidth={4} />
      </motion.button>

      <motion.button
        whileHover={{ scale: 1.06 }}
        whileTap={{ scale: 0.94 }}
        onClick={() => { playClick(); setSoundOn((value) => !value); }}
        className="absolute right-4 top-4 z-30 grid h-12 w-12 place-items-center rounded-full border-[3px] border-[#5b2509] bg-red-500 text-white shadow-[var(--shadow-game)]"
      >
        {soundOn ? (
          <Volume2 className="h-5 w-5" strokeWidth={3} />
        ) : (
          <VolumeX className="h-5 w-5" strokeWidth={3} />
        )}
      </motion.button>

      <main className="relative z-10 flex h-full flex-col items-center px-4 py-5">
        <div className="mt-14 flex w-full max-w-5xl flex-wrap justify-center gap-2 sm:mt-6">
          {status.map((item, index) => (
            <motion.button
              key={index}
              initial={false}
              animate={
                item === "current"
                  ? { scale: [1, 1.1, 1] }
                  : item === "correct" || item === "wrong"
                    ? { scale: [1, 1.18, 1] }
                    : { scale: 1 }
              }
              transition={{ duration: 0.35, ease: "easeOut" }}
              onClick={() => {
                if (answers[index] !== null || index <= current) {
                  playClick();
                  setCurrent(index);
                  setSelected(null);
                  setShowSolution(false);
                }
              }}
              className={`grid h-10 w-10 place-items-center rounded-full border-2 text-sm font-black shadow-lg transition-transform hover:scale-105 ${
                item === "current"
                  ? "border-white bg-[#ff9f0a] text-white"
                  : item === "correct"
                    ? "border-[#14532d] bg-[#4CAF50] text-white"
                    : item === "wrong"
                      ? "border-[#7f1d1d] bg-[#ef4444] text-white"
                      : "border-white/50 bg-white/75 text-[#5b2509]"
              }`}
            >
              {item === "correct" ? (
                <Check className="h-5 w-5" strokeWidth={4} />
              ) : item === "wrong" ? (
                <X className="h-5 w-5" strokeWidth={4} />
              ) : (
                index + 1
              )}
            </motion.button>
          ))}
        </div>

        <motion.div
          key={current}
          initial={{ opacity: 0, y: 20, scale: 0.97 }}
          animate={
            isSubmitted && !isCorrect
              ? { opacity: 1, y: 0, scale: 1, x: [0, -10, 10, -7, 0] }
              : { opacity: 1, y: 0, scale: 1, x: 0 }
          }
          transition={{ duration: 0.25, ease: "easeOut" }}
          className="relative mt-4 flex w-full max-w-4xl flex-1 flex-col overflow-hidden rounded-3xl border-4 border-[#7c2d12] bg-[#ffa70b] p-4 shadow-[0_10px_0_#7c2d12,0_24px_40px_rgba(0,0,0,0.35)] sm:p-5"
        >
          <AnimatePresence>
            {isSubmitted && !isCorrect && (
              <motion.div
                className="pointer-events-none absolute inset-0 z-20 bg-red-500/20"
                initial={{ opacity: 0 }}
                animate={{ opacity: [0, 1, 0] }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.45 }}
              />
            )}
          </AnimatePresence>
          <div className="mx-auto rounded-xl border-2 border-[#7c2d12] bg-[#dd681b] px-4 py-2 text-center font-display text-sm font-black text-white shadow-md">
            Soalan {current + 1} daripada {questions.length}
          </div>

          <div className="mt-4 rounded-2xl border-2 border-[#9a3412] bg-[#ea580c] px-4 py-4 text-center font-display text-base font-black text-white sm:text-lg">
            {question.prompt}
          </div>

          <div className="mt-4 flex justify-center">
            <div className="relative w-full max-w-md overflow-hidden rounded-2xl border-4 border-[#7c2d12] bg-[#f8d7a1] p-3">
              <QuestionVisual question={question} />
              <button
                onClick={() => setShowZoom(true)}
                className="absolute bottom-3 right-3 grid h-10 w-10 place-items-center rounded-full border-2 border-white/70 bg-black/45 text-white backdrop-blur-sm transition-transform hover:scale-105"
              >
                <Maximize2 className="h-5 w-5" strokeWidth={3} />
              </button>
            </div>
          </div>

          <div className="mt-5 grid gap-3 sm:grid-cols-2">
            {question.options.map((option, index) => {
              const selectedNow = selected === index;
              const correctNow = isSubmitted && index === question.correctIndex;
              const wrongNow =
                isSubmitted && submittedAnswer === index && index !== question.correctIndex;
              const paperClass = correctNow
                ? "border-[#16a34a] bg-[#dcfce7]"
                : wrongNow
                  ? "border-[#dc2626] bg-[#fee2e2]"
                  : selectedNow
                    ? "border-[#facc15] bg-[#fff7ed]"
                    : "border-[#9a3412] bg-[#fff7ed]";

              return (
                <motion.button
                  key={option}
                  whileHover={!isSubmitted ? { scale: 1.02, y: -2 } : {}}
                  whileTap={!isSubmitted ? { scale: 0.98 } : {}}
                  animate={
                    wrongNow
                      ? { x: [0, -8, 8, -6, 0] }
                      : selectedNow && !isSubmitted
                        ? { y: -3 }
                        : { y: 0 }
                  }
                  onClick={() => { if (!isSubmitted) { playClick(); setSelected(index); } }}
                  className={`relative flex min-h-[82px] items-center gap-4 overflow-visible rounded-[8px] border-0 bg-transparent px-[58px] py-3 text-left font-display font-black text-[#5b2509] transition-colors ${
                    correctNow
                      ? "drop-shadow-[0_0_18px_rgba(74,222,128,0.65)]"
                      : wrongNow
                        ? "drop-shadow-[0_0_16px_rgba(239,68,68,0.55)]"
                        : selectedNow
                          ? "drop-shadow-[0_0_18px_rgba(250,204,21,0.65)]"
                          : "drop-shadow-[0_7px_0_rgba(124,45,18,0.38)]"
                  }`}
                >
                  <motion.span
                    className={`pointer-events-none absolute bottom-2 left-[34px] right-[34px] top-2 rounded-sm border-2 shadow-[inset_0_9px_16px_rgba(255,255,255,0.72),inset_0_-8px_14px_rgba(124,45,18,0.1)] ${paperClass}`}
                    initial={{ scaleX: 0, opacity: 0 }}
                    animate={{ scaleX: 1, opacity: 1 }}
                    transition={{ duration: 0.42, delay: index * 0.08, ease: "easeOut" }}
                    style={{ transformOrigin: "center" }}
                  />
                  <motion.span
                    className="pointer-events-none absolute left-[46px] right-[46px] top-[14px] h-2 rounded-full bg-white/55"
                    initial={{ scaleX: 0, opacity: 0 }}
                    animate={{ scaleX: 1, opacity: 1 }}
                    transition={{ duration: 0.38, delay: index * 0.08 + 0.08, ease: "easeOut" }}
                    style={{ transformOrigin: "center" }}
                  />
                  <motion.span
                    className="pointer-events-none absolute bottom-[10px] left-[46px] right-[46px] h-2 rounded-full bg-[#7c2d12]/10"
                    initial={{ scaleX: 0, opacity: 0 }}
                    animate={{ scaleX: 1, opacity: 1 }}
                    transition={{ duration: 0.38, delay: index * 0.08 + 0.08, ease: "easeOut" }}
                    style={{ transformOrigin: "center" }}
                  />
                  <motion.img
                    src={scrollHandImg}
                    alt=""
                    aria-hidden
                    className="pointer-events-none absolute left-0 top-1/2 h-[92px] w-[58px] -translate-y-1/2 object-fill drop-shadow-[0_5px_0_rgba(124,45,18,0.38)]"
                    initial={{ left: "calc(50% - 29px)", opacity: 0 }}
                    animate={{ left: "0px", opacity: 1 }}
                    transition={{ duration: 0.44, delay: index * 0.08, ease: "easeOut" }}
                  />
                  <motion.img
                    src={scrollHandImg}
                    alt=""
                    aria-hidden
                    className="pointer-events-none absolute right-0 top-1/2 h-[92px] w-[58px] -translate-y-1/2 scale-x-[-1] object-fill drop-shadow-[0_5px_0_rgba(124,45,18,0.38)]"
                    initial={{ right: "calc(50% - 29px)", opacity: 0 }}
                    animate={{ right: "0px", opacity: 1 }}
                    transition={{ duration: 0.44, delay: index * 0.08, ease: "easeOut" }}
                  />
                  <AnimatePresence>
                    {correctNow && (
                      <motion.span className="pointer-events-none absolute inset-0">
                        {[0, 1, 2, 3, 4, 5].map((star) => (
                          <motion.span
                            key={star}
                            className="absolute text-lg text-yellow-200"
                            style={{
                              left: `${18 + star * 12}%`,
                              top: `${32 + (star % 2) * 16}%`,
                            }}
                            initial={{ opacity: 0, y: 8, scale: 0.2, rotate: 0 }}
                            animate={{
                              opacity: [0, 1, 0],
                              y: -34,
                              scale: [0.2, 1.3, 0.5],
                              rotate: 160,
                            }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: 0.85, delay: star * 0.05 }}
                          >
                            ★
                          </motion.span>
                        ))}
                      </motion.span>
                    )}
                  </AnimatePresence>

                  {/* shuriken terbang masuk + tertancap kekal */}
                  {shurikenTarget === index && (
                    <motion.span
                      className="pointer-events-none absolute inset-0 z-20 flex items-center justify-center"
                    >
                      {/* crack muncul bila dah submit jawapan */}
                      {isSubmitted && (
                        <motion.img
                          src={crackImg}
                          alt=""
                          className="absolute h-full w-auto object-contain mix-blend-multiply"
                          initial={{ opacity: 0, scale: 0.3 }}
                          animate={{ opacity: 0.55, scale: 1 }}
                          transition={{ duration: 0.22, ease: [0.34, 1.56, 0.64, 1] }}
                        />
                      )}
                      <motion.img
                        src={shurikenImg}
                        alt=""
                        className="relative z-10 h-10 w-10 drop-shadow-[0_0_8px_rgba(250,204,21,0.9)]"
                        initial={{ x: -280, rotate: 0, scale: 1.2 }}
                        animate={{ x: 0, rotate: 945, scale: 1 }}
                        transition={{ duration: 0.38, ease: [0.2, 0, 0.4, 1] }}
                      />
                      {/* impact sparks — hilang sendiri */}
                      {[0,1,2,3,4,5].map((i) => (
                        <motion.span
                          key={i}
                          className="absolute h-1 w-5 rounded-full bg-yellow-300 shadow-[0_0_6px_#facc15]"
                          style={{ rotate: `${(i / 6) * 360}deg`, transformOrigin: "left center" }}
                          initial={{ opacity: 0, scaleX: 0 }}
                          animate={{ opacity: [0, 1, 0], scaleX: [0, 1, 0] }}
                          transition={{ duration: 0.35, delay: 0.32 + i * 0.02 }}
                        />
                      ))}
                    </motion.span>
                  )}

                  {/* slash effect */}
                  <AnimatePresence>
                    {slashTarget === index && (
                      <motion.span
                        className="pointer-events-none absolute inset-0 z-20 overflow-hidden"
                        initial={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.15 }}
                      >
                        {/* slash line 1 */}
                        <motion.span
                          className="absolute left-0 top-1/2 h-[3px] w-full -translate-y-2 bg-white/90 shadow-[0_0_8px_white]"
                          initial={{ scaleX: 0, originX: 0 }}
                          animate={{ scaleX: 1 }}
                          transition={{ duration: 0.18, ease: "easeOut" }}
                          style={{ transformOrigin: "left", rotate: "-8deg" }}
                        />
                        {/* slash line 2 */}
                        <motion.span
                          className="absolute left-0 top-1/2 h-[3px] w-full translate-y-1 bg-white/70 shadow-[0_0_6px_white]"
                          initial={{ scaleX: 0, originX: 0 }}
                          animate={{ scaleX: 1 }}
                          transition={{ duration: 0.18, ease: "easeOut", delay: 0.04 }}
                          style={{ transformOrigin: "left", rotate: "-6deg" }}
                        />
                        {/* flash overlay */}
                        <motion.span
                          className="absolute inset-0 rounded-sm bg-white/50"
                          initial={{ opacity: 0.7 }}
                          animate={{ opacity: 0 }}
                          transition={{ duration: 0.3 }}
                        />
                      </motion.span>
                    )}
                  </AnimatePresence>

                  <motion.span
                    className={`relative z-10 grid h-10 w-10 shrink-0 place-items-center rounded-full border-2 bg-white font-display text-base font-black ${
                      correctNow
                        ? "border-[#14532d] text-[#14532d]"
                        : wrongNow
                          ? "border-[#7f1d1d] text-[#7f1d1d]"
                          : "border-[#9a3412] text-[#7c2d12]"
                    }`}
                    initial={{ opacity: 0, scale: 0.75 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.22, delay: index * 0.08 + 0.24, ease: "easeOut" }}
                  >
                    {optionLetters[index]}
                  </motion.span>
                  <motion.span
                    className="relative z-10 leading-tight"
                    initial={{ opacity: 0, y: 4 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.22, delay: index * 0.08 + 0.28, ease: "easeOut" }}
                  >
                    {option}
                  </motion.span>
                </motion.button>
              );
            })}
          </div>

          <div className="mt-auto flex flex-col gap-3 pt-5 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex gap-2">
              <AnimatePresence>
                {isSubmitted && (
                  <motion.button
                    initial={{ opacity: 0, scale: 0.7, x: -10 }}
                    animate={{ opacity: 1, scale: 1, x: 0 }}
                    exit={{ opacity: 0, scale: 0.7, x: -10 }}
                    transition={{ duration: 0.3, ease: "easeOut" }}
                    whileHover={{ scale: 1.06 }}
                    whileTap={{ scale: 0.94 }}
                    onClick={() => { playClick(); setShowSolution(true); }}
                    className="flex items-center justify-center gap-2 rounded-2xl border-[3px] border-[#5b21b6] bg-[#7c3aed] px-4 py-3 font-display font-black text-white shadow-md"
                  >
                    <ScrollText className="h-5 w-5" strokeWidth={3} />
                    Penyelesaian
                  </motion.button>
                )}
              </AnimatePresence>
            </div>

            <motion.div
              key={score}
              initial={{ scale: 0.92 }}
              animate={{ scale: [1, 1.14, 1] }}
              transition={{ duration: 0.28, ease: "easeOut" }}
              className="rounded-2xl border-[3px] border-[#14532d] bg-[#4CAF50] px-8 py-3 text-center font-display text-lg font-black text-white shadow-md"
            >
              {score}/{questions.length}
            </motion.div>

            {!isSubmitted ? (
              <motion.button
                whileHover={selected !== null ? { scale: 1.04 } : {}}
                whileTap={selected !== null ? { scale: 0.96 } : {}}
                disabled={selected === null}
                onClick={() => { playClick(); submitAnswer(); }}
                className="rounded-2xl border-[3px] border-[#7c2d12] px-8 py-3 font-display font-black text-white shadow-md disabled:cursor-not-allowed disabled:opacity-55"
                style={{
                  background: "var(--gradient-orange)",
                  animation:
                    selected !== null ? "submit-ready 1.2s ease-in-out infinite" : undefined,
                }}
              >
                Hantar
              </motion.button>
            ) : (
              <motion.button
                whileHover={{ scale: 1.04 }}
                whileTap={{ scale: 0.96 }}
                onClick={() => { playClick(); goNext(); }}
                className="rounded-2xl border-[3px] border-[#7c2d12] px-8 py-3 font-display font-black text-white shadow-md"
                style={{ background: "var(--gradient-orange)" }}
              >
                {current === questions.length - 1 ? "Lihat Skor" : "Seterusnya"}
              </motion.button>
            )}
          </div>
        </motion.div>
      </main>

      <AnimatePresence>
        {showZoom && (
          <motion.div
            className="absolute inset-0 z-50 grid place-items-center bg-black/70 p-4 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowZoom(false)}
          >
            <motion.div
              initial={{ scale: 0.92, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.92, opacity: 0 }}
              className="relative w-full max-w-3xl rounded-3xl border-4 border-white bg-[#f8d7a1] p-5"
              onClick={(event) => event.stopPropagation()}
            >
              <button
                onClick={() => setShowZoom(false)}
                className="absolute right-3 top-3 grid h-10 w-10 place-items-center rounded-full bg-black/55 text-white"
              >
                <X className="h-5 w-5" strokeWidth={3} />
              </button>
              <QuestionVisual question={question} large />
            </motion.div>
          </motion.div>
        )}

        {showSolution && (
          <motion.div
            className="absolute inset-0 z-50 grid place-items-center bg-black/75 p-4 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowSolution(false)}
          >
            <motion.div
              initial={{ y: 40, scale: 0.88, opacity: 0, rotateX: 12 }}
              animate={{ y: 0, scale: 1, opacity: 1, rotateX: 0 }}
              exit={{ y: 30, scale: 0.9, opacity: 0 }}
              transition={{ duration: 0.38, ease: [0.34, 1.56, 0.64, 1] }}
              className="relative w-full max-w-2xl"
              onClick={(event) => event.stopPropagation()}
            >
              {/* Scroll top rod */}
              <div className="relative z-10 mx-6 h-6 rounded-full bg-[#92400e] shadow-[0_4px_0_#78350f,inset_0_2px_4px_rgba(255,255,255,0.25)]" />

              {/* Scroll body */}
              <div className="relative -mt-1 rounded-xl border-4 border-[#92400e] bg-[#fef3c7] px-6 pb-6 pt-5 shadow-[0_8px_0_#78350f,0_16px_40px_rgba(0,0,0,0.45)]">
                <button
                  onClick={() => setShowSolution(false)}
                  className="absolute right-3 top-3 grid h-9 w-9 place-items-center rounded-full bg-[#92400e]/80 text-white transition-transform hover:scale-105"
                >
                  <X className="h-4 w-4" strokeWidth={3} />
                </button>

                <div className="mb-4 flex items-center gap-2">
                  <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#7c3aed] shadow-[0_3px_0_#5b21b6]">
                    <ScrollText className="h-5 w-5 text-white" strokeWidth={2.5} />
                  </div>
                  <h3 className="font-display text-lg font-black text-[#7c2d12]">
                    Cara Penyelesaian
                  </h3>
                </div>

                <SolutionVisual />
              </div>

              {/* Scroll bottom rod */}
              <div className="relative z-10 mx-6 h-6 rounded-full bg-[#92400e] shadow-[0_4px_0_#78350f,inset_0_2px_4px_rgba(255,255,255,0.25)]" />
            </motion.div>
          </motion.div>
        )}

        {showResult && (
          <motion.div
            className="absolute inset-0 z-50 grid place-items-center bg-black/70 p-4 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              initial={{ y: 20, scale: 0.94, opacity: 0 }}
              animate={{ y: 0, scale: 1, opacity: 1 }}
              exit={{ y: 20, scale: 0.94, opacity: 0 }}
              className="w-full max-w-md rounded-3xl border-4 border-[#7c2d12] bg-[#ffa70b] p-6 text-center shadow-[var(--shadow-game)]"
            >
              <p className="font-display text-sm font-black uppercase tracking-widest text-[#7c2d12]">
                Tamat
              </p>
              <h2 className="mt-1 font-display text-3xl font-black text-white">
                Skor {score}/{questions.length}
              </h2>
              <div className="mt-4 flex justify-center gap-2">
                {[0, 1, 2].map((star) => (
                  <span
                    key={star}
                    className={`text-4xl ${(score ?? 0) >= (star + 1) * 5 ? "opacity-100" : "opacity-25"}`}
                  >
                    ★
                  </span>
                ))}
              </div>
              <div className="mt-5 grid gap-3">
                <button
                  onClick={() => { playClick(); retryWrong(); }}
                  className="flex items-center justify-center gap-2 rounded-2xl border-[3px] border-[#7c2d12] bg-white/20 px-4 py-3 font-display font-black text-white"
                >
                  <RotateCcw className="h-5 w-5" strokeWidth={3} />
                  Cuba Soalan Salah
                </button>
                <button
                  onClick={() => {
                    playClick();
                    const currentLevel = localStorage.getItem("currentLevel");
                    if (currentLevel !== null) {
                      localStorage.setItem("completedLevel", currentLevel);
                      localStorage.removeItem("currentLevel");
                    }
                    onExit(true);
                  }}
                  className="rounded-2xl border-[3px] border-[#7c2d12] px-4 py-3 font-display font-black text-white"
                  style={{ background: "var(--gradient-orange)" }}
                >
                  Kembali Ke Map
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
    </div>
    </MotionConfig>
  );
}

function SolutionVisual() {
  const [zoom, setZoom] = useState(1);
  const [pos, setPos] = useState({ x: 0, y: 0 });
  const [dragging, setDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const min = 1;
  const max = 4;
  const step = 0.5;

  function onMouseDown(e: React.MouseEvent) {
    if (zoom <= 1) return;
    setDragging(true);
    setDragStart({ x: e.clientX - pos.x, y: e.clientY - pos.y });
  }

  function onMouseMove(e: React.MouseEvent) {
    if (!dragging) return;
    setPos({ x: e.clientX - dragStart.x, y: e.clientY - dragStart.y });
  }

  function onMouseUp() {
    setDragging(false);
  }

  function handleZoom(newZoom: number) {
    setZoom(newZoom);
    if (newZoom <= 1) setPos({ x: 0, y: 0 });
  }

  return (
    <div className="flex flex-col gap-3">
      <div
        className="relative overflow-hidden rounded-xl"
        style={{ height: "55vh", cursor: zoom > 1 ? (dragging ? "grabbing" : "grab") : "default" }}
        onMouseDown={onMouseDown}
        onMouseMove={onMouseMove}
        onMouseUp={onMouseUp}
        onMouseLeave={onMouseUp}
      >
        <motion.img
          src={imageAnswer}
          alt="cara penyelesaian"
          animate={{ scale: zoom, x: pos.x, y: pos.y }}
          transition={{ type: "tween", duration: 0.15 }}
          style={{ transformOrigin: "center", width: "100%", height: "100%", objectFit: "contain", userSelect: "none" }}
          draggable={false}
        />
      </div>

      {/* zoom controls */}
      <div className="flex items-center justify-center gap-3">
        <button
          onClick={() => { playClick(); handleZoom(Math.max(min, zoom - step)); }}
          disabled={zoom <= min}
          className="grid h-9 w-9 place-items-center rounded-full bg-[#1e1b4b] text-white shadow-md transition-transform hover:scale-105 disabled:opacity-40"
        >
          <span className="text-lg font-black leading-none">−</span>
        </button>
        <span className="min-w-[56px] rounded-lg bg-[#1e1b4b] px-3 py-1 text-center text-sm font-black text-[#facc15]">
          {Math.round(zoom * 100)}%
        </span>
        <button
          onClick={() => { playClick(); handleZoom(Math.min(max, zoom + step)); }}
          disabled={zoom >= max}
          className="grid h-9 w-9 place-items-center rounded-full bg-[#1e1b4b] text-white shadow-md transition-transform hover:scale-105 disabled:opacity-40"
        >
          <span className="text-lg font-black leading-none">+</span>
        </button>
      </div>
    </div>
  );
}

function QuestionVisual({ large = false }: { question: Question; large?: boolean }) {
  return (
    <div className={`relative overflow-hidden rounded-xl ${large ? "h-[420px]" : "h-52"}`}>
      <img
        src={imageQuestion}
        alt="soalan visual"
        className="h-full w-full object-contain"
      />
    </div>
  );
}
