import { useEffect, useRef, useState } from "react";

const DROP_COUNT = 120;

interface Drop {
  x: number;
  y: number;
  length: number;
  speed: number;
  opacity: number;
}

function randomBetween(a: number, b: number) {
  return a + Math.random() * (b - a);
}

function createDrop(canvasWidth: number, canvasHeight: number): Drop {
  return {
    x: randomBetween(0, canvasWidth),
    y: randomBetween(-canvasHeight, 0),
    length: randomBetween(12, 28),
    speed: randomBetween(12, 22),
    opacity: randomBetween(0.2, 0.55),
  };
}

export function RainFall() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const dropsRef = useRef<Drop[]>([]);
  const rafRef = useRef<number>(0);
  const [lightning, setLightning] = useState(false);

  useEffect(() => {
    const flash = () => {
      setLightning(true);
      setTimeout(() => setLightning(false), 120);
      // double flash kadang-kadang
      if (Math.random() > 0.5) {
        setTimeout(() => setLightning(true), 200);
        setTimeout(() => setLightning(false), 320);
      }
      // next lightning random 4-12 saat
      setTimeout(flash, 4000 + Math.random() * 8000);
    };
    const id = setTimeout(flash, 2000 + Math.random() * 4000);
    return () => clearTimeout(id);
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener("resize", resize);

    dropsRef.current = Array.from({ length: DROP_COUNT }, () =>
      createDrop(canvas.width, canvas.height)
    );

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      dropsRef.current.forEach((drop) => {
        drop.y += drop.speed;
        drop.x += drop.speed * 0.15;

        ctx.save();
        ctx.globalAlpha = drop.opacity;
        ctx.strokeStyle = "#a8d8f0";
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(drop.x, drop.y);
        ctx.lineTo(drop.x + drop.length * 0.15, drop.y + drop.length);
        ctx.stroke();
        ctx.restore();

        if (drop.y > canvas.height + 30) {
          Object.assign(drop, createDrop(canvas.width, canvas.height));
          drop.y = -30;
        }
      });
      rafRef.current = requestAnimationFrame(animate);
    };
    animate();

    return () => {
      cancelAnimationFrame(rafRef.current);
      window.removeEventListener("resize", resize);
    };
  }, []);

  return (
    <>
      <div className="pointer-events-none absolute inset-0 z-[9] bg-[#0a1628]/40" />
      <canvas ref={canvasRef} className="pointer-events-none absolute inset-0 z-10" />
      {/* lightning flash */}
      {lightning && (
        <div className="pointer-events-none absolute inset-0 z-[11] bg-white/30" />
      )}
    </>
  );
}
