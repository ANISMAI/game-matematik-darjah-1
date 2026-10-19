import { useEffect, useRef } from "react";

const PETAL_COUNT = 25;

interface Petal {
  x: number;
  y: number;
  size: number;
  speedY: number;
  speedX: number;
  rotation: number;
  rotationSpeed: number;
  opacity: number;
  color: string;
}

const COLORS = ["#FFB7C5", "#FFC8D3", "#FF9FB5", "#FFD6E0", "#FFAEC0"];

function randomBetween(a: number, b: number) {
  return a + Math.random() * (b - a);
}

function createPetal(canvasWidth: number): Petal {
  return {
    x: randomBetween(0, canvasWidth),
    y: randomBetween(-100, -10),
    size: randomBetween(8, 16),
    speedY: randomBetween(1, 2.5),
    speedX: randomBetween(-0.8, 0.8),
    rotation: randomBetween(0, 360),
    rotationSpeed: randomBetween(-2, 2),
    opacity: randomBetween(0.5, 0.9),
    color: COLORS[Math.floor(Math.random() * COLORS.length)],
  };
}

function drawPetal(ctx: CanvasRenderingContext2D, petal: Petal) {
  ctx.save();
  ctx.translate(petal.x, petal.y);
  ctx.rotate((petal.rotation * Math.PI) / 180);
  ctx.globalAlpha = petal.opacity;
  ctx.fillStyle = petal.color;
  ctx.beginPath();
  ctx.ellipse(0, 0, petal.size / 2, petal.size, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}

export function SakuraFall() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const petalsRef = useRef<Petal[]>([]);
  const rafRef = useRef<number>(0);

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

    petalsRef.current = Array.from({ length: PETAL_COUNT }, () =>
      createPetal(canvas.width)
    );

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      petalsRef.current.forEach((petal) => {
        petal.y += petal.speedY;
        petal.x += petal.speedX + Math.sin(petal.y / 80) * 0.4;
        petal.rotation += petal.rotationSpeed;
        drawPetal(ctx, petal);
        if (petal.y > canvas.height + 20) {
          Object.assign(petal, createPetal(canvas.width));
          petal.y = -20;
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
    <canvas
      ref={canvasRef}
      className="pointer-events-none absolute inset-0 z-10"
    />
  );
}
