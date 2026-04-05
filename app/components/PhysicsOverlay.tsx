"use client";

import { useEffect, useRef } from "react";

const COLORS = [
  "#f87171", "#fb923c", "#fbbf24", "#a3e635",
  "#34d399", "#38bdf8", "#818cf8", "#e879f9",
  "#f43f5e", "#06b6d4", "#84cc16", "#f97316",
];

export default function PhysicsOverlay() {
  const outerRef = useRef<HTMLDivElement>(null);
  const canvasContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let cancelled = false;

    async function init() {
      const Matter = await import("matter-js");
      if (cancelled || !outerRef.current || !canvasContainerRef.current) return;

      const { Engine, Render, Runner, Bodies, World, Body } = Matter;

      const W = outerRef.current.offsetWidth;
      const H = outerRef.current.offsetHeight;

      const engine = Engine.create({ gravity: { x: 0, y: 1.2 } });
      const runner = Runner.create();

      const render = Render.create({
        element: canvasContainerRef.current,
        engine,
        options: {
          width: W,
          height: H,
          wireframes: false,
          background: "transparent",
        },
      });

      const wallOpts = { isStatic: true, render: { fillStyle: "transparent", strokeStyle: "transparent", lineWidth: 0 } };
      const ground = Bodies.rectangle(W / 2, H + 25, W + 4, 50, wallOpts);
      const ceiling = Bodies.rectangle(W / 2, -25, W + 4, 50, wallOpts);
      const wallL = Bodies.rectangle(-25, H / 2, 50, H + 4, wallOpts);
      const wallR = Bodies.rectangle(W + 25, H / 2, 50, H + 4, wallOpts);
      World.add(engine.world, [ground, ceiling, wallL, wallR]);

      const balls = Array.from({ length: 14 }, (_, i) => {
        const r = 12 + Math.random() * 28;
        const x = r + Math.random() * (W - r * 2);
        const y = -r - Math.random() * H * 0.8;
        const ball = Bodies.circle(x, y, r, {
          restitution: 0.72,
          friction: 0.008,
          frictionAir: 0.006,
          render: { fillStyle: COLORS[i % COLORS.length], strokeStyle: "transparent", lineWidth: 0 },
        });
        Body.setVelocity(ball, { x: (Math.random() - 0.5) * 10, y: Math.random() * 3 });
        return ball;
      });

      const heavies = Array.from({ length: 3 }, (_, i) => {
        const r = 36 + Math.random() * 20;
        const x = r + Math.random() * (W - r * 2);
        const y = -r - Math.random() * H * 0.3;
        const ball = Bodies.circle(x, y, r, {
          restitution: 0.55,
          friction: 0.01,
          frictionAir: 0.003,
          density: 0.004,
          render: { fillStyle: COLORS[(i + 5) % COLORS.length] + "cc", strokeStyle: "transparent", lineWidth: 0 },
        });
        Body.setVelocity(ball, { x: (Math.random() - 0.5) * 7, y: Math.random() * 2 });
        return ball;
      });

      World.add(engine.world, [...balls, ...heavies]);
      Render.run(render);
      Runner.run(runner, engine);

      return () => {
        Runner.stop(runner);
        Render.stop(render);
        render.canvas.remove();
        World.clear(engine.world, false);
        Engine.clear(engine);
      };
    }

    let teardown: (() => void) | undefined;
    init().then((fn) => { teardown = fn; });

    return () => {
      cancelled = true;
      teardown?.();
    };
  }, []);

  return (
    <div
      ref={outerRef}
      className="w-full h-full z-10 animate-fade-in overflow-hidden rounded-xl"
      style={{ background: "white" }}
    >
      {/* Canvas mount point */}
      <div ref={canvasContainerRef} className="w-full h-full pointer-events-none" />
    </div>
  );
}
