import { useEffect, useRef } from "react";

interface Bird {
  x: number;
  y: number;
  speed: number;
  wingAngle: number;
  wingDir: number;
  size: number;
  opacity: number;
}

function randomBetween(a: number, b: number) {
  return a + Math.random() * (b - a);
}

function createBird(canvasWidth: number, canvasHeight: number): Bird {
  return {
    x: -50,
    y: randomBetween(canvasHeight * 0.05, canvasHeight * 0.45),
    speed: randomBetween(1.2, 2.5),
    wingAngle: 0,
    wingDir: 1,
    size: randomBetween(6, 12),
    opacity: randomBetween(0.6, 0.9),
  };
}

function drawBird(ctx: CanvasRenderingContext2D, bird: Bird) {
  ctx.save();
  ctx.translate(bird.x, bird.y);
  ctx.globalAlpha = bird.opacity;
  ctx.strokeStyle = "#1a1a2e";
  ctx.lineWidth = bird.size * 0.18;
  ctx.lineCap = "round";

  const w = bird.size;
  const flap = Math.sin(bird.wingAngle) * w * 0.6;

  // left wing
  ctx.beginPath();
  ctx.moveTo(0, 0);
  ctx.quadraticCurveTo(-w * 0.6, -flap, -w, flap * 0.3);
  ctx.stroke();

  // right wing
  ctx.beginPath();
  ctx.moveTo(0, 0);
  ctx.quadraticCurveTo(w * 0.6, -flap, w, flap * 0.3);
  ctx.stroke();

  ctx.restore();
}

const BIRD_COUNT = 6;

export function BirdsFlow() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const birdsRef = useRef<Bird[]>([]);
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

    // stagger start positions so they don't all enter at once
    birdsRef.current = Array.from({ length: BIRD_COUNT }, (_, i) => {
      const bird = createBird(canvas.width, canvas.height);
      bird.x = randomBetween(-200, canvas.width * 0.8) * (i / BIRD_COUNT);
      return bird;
    });

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      birdsRef.current.forEach((bird) => {
        bird.x += bird.speed;
        bird.y += Math.sin(bird.x / 120) * 0.3;
        bird.wingAngle += 0.18 * bird.wingDir;
        if (Math.abs(bird.wingAngle) > Math.PI * 0.6) bird.wingDir *= -1;

        drawBird(ctx, bird);

        if (bird.x > canvas.width + 60) {
          Object.assign(bird, createBird(canvas.width, canvas.height));
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
