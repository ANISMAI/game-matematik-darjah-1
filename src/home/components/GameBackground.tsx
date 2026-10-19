import { motion } from "framer-motion";
const bg = "/home/images/ninja-village-bg.webp";

export function GameBackground() {
  return (
    <div className="absolute inset-0 overflow-hidden">
      <img
        src={bg}
        alt=""
        aria-hidden
        className="absolute inset-0 h-full w-full object-cover object-center"
      />
      {/* drifting clouds */}
      {[
        { top: "8%", size: 120, delay: 0, dur: 60, op: 0.7 },
        { top: "18%", size: 80, delay: 15, dur: 80, op: 0.5 },
        { top: "4%", size: 160, delay: 30, dur: 90, op: 0.6 },
      ].map((c, i) => (
        <div
          key={i}
          className="pointer-events-none absolute left-0 w-full"
          style={{ top: c.top }}
        >
          <div
            className="rounded-full bg-white/80 blur-md"
            style={{
              width: c.size,
              height: c.size * 0.45,
              opacity: c.op,
              animation: `cloud-drift ${c.dur}s linear ${c.delay}s infinite`,
            }}
          />
        </div>
      ))}
      {/* soft top/bottom vignette */}
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-ninja-navy-deep/30 via-transparent to-ninja-navy-deep/40" />
    </div>
  );
}
