import { motion, AnimatePresence } from "framer-motion";
import { BookMarked, GraduationCap, ChevronDown, Check } from "lucide-react";
import { useEffect, useRef, useState } from "react";

const subjects = ["Matematik", "Sains", "Sejarah", "Bahasa Melayu", "Bahasa Inggeris"];
const grades = ["Darjah 1", "Darjah 2", "Darjah 3", "Darjah 4", "Darjah 5", "Darjah 6"];

type Variant = "blue" | "orange";

function Pill({
  label,
  value,
  options,
  onChange,
  variant,
  icon: Icon,
}: {
  label: string;
  value: string;
  options: string[];
  onChange: (v: string) => void;
  variant: Variant;
  icon: React.ComponentType<{ className?: string }>;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const h = (e: MouseEvent) => {
      if (!ref.current?.contains(e.target as Node)) setOpen(false);
    };
    window.addEventListener("mousedown", h);
    return () => window.removeEventListener("mousedown", h);
  }, []);

  const grad = variant === "blue" ? "var(--gradient-blue)" : "var(--gradient-orange)";
  const glow = variant === "blue" ? "var(--shadow-glow-blue)" : "var(--shadow-glow-orange)";

  return (
    <div ref={ref} className="relative" onKeyDown={(event) => { if (event.key === 'Escape') setOpen(false); }}>
      <motion.button
        whileHover={{ y: -2 }}
        whileTap={{ scale: 0.97 }}
        onClick={() => setOpen((o) => !o)}
        aria-label={label}
        aria-expanded={open}
        className="flex items-center gap-1.5 rounded-full border-2 border-ninja-navy-deep px-2.5 py-1.5 text-xs font-bold text-stroke-sm text-white sm:gap-2 sm:px-4 sm:py-2.5 sm:text-sm"
        style={{ background: grad, boxShadow: `var(--shadow-game), ${glow}` }}
      >
        <span className="grid h-6 w-6 place-items-center rounded-full bg-white/25">
          <Icon className="h-3.5 w-3.5" />
        </span>
        <span className="uppercase tracking-wide">{value}</span>
        <ChevronDown className={`h-4 w-4 transition-transform ${open ? "rotate-180" : ""}`} />
      </motion.button>

      <AnimatePresence>
        {open && (
          <motion.ul
            style={{ background: 'var(--gradient-navy)' }}
            initial={{ opacity: 0, y: -6, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -6, scale: 0.96 }}
            transition={{ duration: 0.15 }}
            className="absolute left-1/2 top-[calc(100%+8px)] z-40 w-48 -translate-x-1/2 overflow-hidden rounded-2xl border-2 border-ninja-navy-deep bg-[var(--gradient-navy)] p-1.5 text-sm text-card-foreground shadow-[var(--shadow-game)]"
          >
            {options.map((opt) => {
              const selected = opt === value;
              return (
                <li key={opt}>
                  <button
                    onClick={() => {
                      onChange(opt);
                      setOpen(false);
                    }}
                    className={`flex w-full items-center justify-between rounded-xl px-3 py-2 text-left font-bold transition-colors ${
                      selected
                        ? "bg-white/20 text-white"
                        : "text-white/80 hover:bg-white/15 hover:text-white"
                    }`}
                  >
                    {opt}
                    {selected && <Check className="h-4 w-4 text-ninja-yellow" />}
                  </button>
                </li>
              );
            })}
          </motion.ul>
        )}
      </AnimatePresence>
    </div>
  );
}

export function TopSelector({
  subject,
  setSubject,
  grade,
  setGrade,
}: {
  subject: string;
  setSubject: (v: string) => void;
  grade: string;
  setGrade: (v: string) => void;
}) {
  return (
    <div className="pointer-events-auto flex items-center gap-3">
      <Pill
        label="Subjek"
        value={subject}
        options={subjects}
        onChange={setSubject}
        variant="blue"
        icon={BookMarked}
      />
      <Pill
        label="Darjah"
        value={grade}
        options={grades}
        onChange={setGrade}
        variant="orange"
        icon={GraduationCap}
      />
    </div>
  );
}
