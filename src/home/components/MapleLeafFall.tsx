import { useEffect, useRef } from "react";

const LEAF_COUNT = 22;

interface Leaf {
  x: number;
  y: number;
  size: number;
  speedY: number;
  speedX: number;
  rotation: number;
  rotationSpeed: number;
  opacity: number;
  color: string;
  sway: number;
  swaySpeed: number;
}

const COLORS = ["#e63b11", "#e87d2a", "#f0a500", "#c0392b", "#d4500a", "#f4c430"];

function randomBetween(a: number, b: number) {
  return a + Math.random() * (b - a);
}

function createLeaf(canvasWidth: number): Leaf {
  return {
    x: randomBetween(0, canvasWidth),
    y: randomBetween(-120, -10),
    size: randomBetween(10, 20),
    speedY: randomBetween(1.5, 3.2),
    speedX: randomBetween(-1, 1),
    rotation: randomBetween(0, 360),
    rotationSpeed: randomBetween(-3, 3),
    opacity: randomBetween(0.6, 0.95),
    color: COLORS[Math.floor(Math.random() * COLORS.length)],
    sway: randomBetween(0, Math.PI * 2),
    swaySpeed: randomBetween(0.02, 0.05),
  };
}

function drawMapleLeaf(ctx: CanvasRenderingContext2D, leaf: Leaf) {
  ctx.save();
  ctx.translate(leaf.x, leaf.y);
  ctx.rotate((leaf.rotation * Math.PI) / 180);
  ctx.globalAlpha = leaf.opacity;
  ctx.fillStyle = leaf.color;

  const s = leaf.size / 14;
  ctx.beginPath();
  ctx.moveTo(0, -14 * s);
  ctx.bezierCurveTo(2 * s, -10 * s, 8 * s, -10 * s, 6 * s, -5 * s);
  ctx.bezierCurveTo(10 * s, -8 * s, 14 * s, -4 * s, 10 * s, -1 * s);
  ctx.bezierCurveTo(14 * s, 2 * s, 10 * s, 6 * s, 6 * s, 3 * s);
  ctx.bezierCurveTo(8 * s, 8 * s, 4 * s, 10 * s, 0, 14 * s);
  ctx.bezierCurveTo(-4 * s, 10 * s, -8 * s, 8 * s, -6 * s, 3 * s);
  ctx.bezierCurveTo(-10 * s, 6 * s, -14 * s, 2 * s, -10 * s, -1 * s);
  ctx.bezierCurveTo(-14 * s, -4 * s, -10 * s, -8 * s, -6 * s, -5 * s);
  ctx.bezierCurveTo(-8 * s, -10 * s, -2 * s, -10 * s, 0, -14 * s);
  ctx.fill();

  ctx.restore();
}

export function MapleLeafFall() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const leavesRef = useRef<Leaf[]>([]);
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

    leavesRef.current = Array.from({ length: LEAF_COUNT }, () => createLeaf(canvas.width));

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      leavesRef.current.forEach((leaf) => {
        leaf.sway += leaf.swaySpeed;
        leaf.y += leaf.speedY;
        leaf.x += leaf.speedX + Math.sin(leaf.sway) * 1.2;
        leaf.rotation += leaf.rotationSpeed;
        drawMapleLeaf(ctx, leaf);
        if (leaf.y > canvas.height + 30) {
          Object.assign(leaf, createLeaf(canvas.width));
          leaf.y = -30;
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

  return <canvas ref={canvasRef} className="pointer-events-none absolute inset-0 z-10" />;
}
