"use client";

import { useEffect, useRef } from "react";

// A still starfield, redrawn only when the window size changes.
export function Starfield() {
  const canvas = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const c = canvas.current;
    if (!c) return;
    const draw = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const w = window.innerWidth;
      const h = window.innerHeight;
      c.width = Math.round(w * dpr);
      c.height = Math.round(h * dpr);
      const g = c.getContext("2d");
      if (!g) return;
      g.setTransform(dpr, 0, 0, dpr, 0, 0);
      let seed = 20350502;
      const rnd = () => (seed = (seed * 16807) % 2147483647) / 2147483647;
      const n = Math.round((w * h) / 2400);
      for (let i = 0; i < n; i++) {
        const r = rnd();
        const a = 0.2 + rnd() * 0.6;
        const tint = rnd();
        g.fillStyle = tint > 0.94 ? `rgba(255, 210, 140, ${a})` : tint > 0.86 ? `rgba(165, 195, 255, ${a})` : `rgba(232, 236, 250, ${a})`;
        g.beginPath();
        g.arc(rnd() * w, rnd() * h, r > 0.985 ? 1.5 : r > 0.9 ? 1 : 0.55, 0, Math.PI * 2);
        g.fill();
      }
    };
    let timer: number | undefined;
    const onResize = () => {
      window.clearTimeout(timer);
      timer = window.setTimeout(draw, 150);
    };
    draw();
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  return <canvas ref={canvas} aria-hidden className="pointer-events-none fixed inset-0 z-0 h-full w-full" />;
}
