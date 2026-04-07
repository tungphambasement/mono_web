import React, { useEffect, useState } from 'react';

type Dot = {
  id: string;
  x: number;
  y: number;
  gen: number;
  dist: number;
  angle: number;
  delay: number;
  hasTrail: boolean;
};

interface CustomStyle extends React.CSSProperties {
  '--dist': string;
  '--scale-x': number;
  '--angle': string;
}

const spacing = 40;
const MAX_REACH = spacing * 2;
const NUM_SOURCE_DOTS = 12;
const DOT_SIZE = 3;
const D = 0.6;


const DIRECTIONS = [[0, -1], [1, 0], [0, 1], [-1, 0]]; // up, right, down, left
// const DIRECTIONS = [[-1, -1], [1, -1], [1, 1], [-1, 1]]; // diagonals
// const DIRECTIONS = [[-1, 0], [1, 0], [0, -1], [0, 1], [-1, -1], [1, -1], [1, 1], [-1, 1]]; // all 8 directions

const GOLDEN_ANGLE = Math.PI * (3 - Math.sqrt(5)); // ~2.399 radians / ~137.5°

export default function Wallpaper4() {
  const [dots, setDots] = useState<Dot[]>([]);
  const [lastGen, setLastGen] = useState(0);
  const rectRef = React.useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!rectRef.current) return;
    const rect = rectRef.current.getBoundingClientRect();
    const MAX_DIST = Math.sqrt(rect.width ** 2 + rect.height ** 2) * 0.35;

    const screenCenterX = Math.round(rect.width / 2);
    const screenCenterY = Math.round(rect.height / 2);

    const stepsX = Math.floor(screenCenterX / spacing);
    const stepsY = Math.floor(screenCenterY / spacing);

    const rawNodes: { x: number; y: number; gen: number }[] = [];

    // generate a grid of candidate points
    for (let i = -stepsY; i <= stepsY; i++) {
      for (let j = -stepsX; j <= stepsX; j++) {
        const x = screenCenterX + j * spacing;
        const y = screenCenterY + i * spacing;
        if (Math.sqrt((x - screenCenterX) ** 2 + (y - screenCenterY) ** 2) > MAX_DIST) continue;
        rawNodes.push({ x, y, gen: -1 });
      }
    }

    // sample ideal source positions using the golden spiral, then snap each
    // one to the nearest available grid node.
    const maxR = Math.min(rect.width, rect.height) * 0.55;
    const usedIds = new Set<string>();
    const sourceDots: typeof rawNodes = [];

    for (let i = 0; i < NUM_SOURCE_DOTS; i++) {
      const r = maxR * Math.sqrt((i + 1) / NUM_SOURCE_DOTS);
      const theta = i * GOLDEN_ANGLE;
      const idealX = screenCenterX + r * Math.cos(theta);
      const idealY = screenCenterY + r * Math.sin(theta);

      // snap to nearest unused grid node
      let best: typeof rawNodes[0] | null = null;
      let bestDist = Infinity;
      for (const node of rawNodes) {
        if (usedIds.has(`${node.x},${node.y}`)) continue;
        const d = Math.hypot(node.x - idealX, node.y - idealY);
        if (d < bestDist) { bestDist = d; best = node; }
      }
      if (best) {
        usedIds.add(`${best.x},${best.y}`);
        sourceDots.push(best);
      }
    }

    const queue: Dot[] = [];

    sourceDots.forEach((rawDot) => {
      rawDot.gen = 0;
      queue.push({
        id: `y:${rawDot.y}-x:${rawDot.x}`,
        x: rawDot.x,
        y: rawDot.y,
        gen: 0,
        dist: 0,
        angle: 0,
        delay: 0,
        hasTrail: true,
      });
    });

    const networkDots: Dot[] = [];
    let localLastGen = 0;

    // child collapse towards parents, then move outwards in the assigned angle
    while (queue.length > 0) {
      const currentDot = queue.shift()!;
      localLastGen = Math.max(localLastGen, currentDot.gen);

      networkDots.push(currentDot);

      for (let i = 0; i < DIRECTIONS.length; i++) {
        const [dx, dy] = DIRECTIONS[i];

        // bias propagation away from center
        const dotProduct = dx * (currentDot.x - screenCenterX) + dy * (currentDot.y - screenCenterY);
        const outwardBias = dotProduct > 0 ? 0.85 : 0.6;
        if (Math.random() > outwardBias) continue;

        const validCandidates = rawNodes.filter(
          (c) => {
            const d = Math.abs(c.x - currentDot.x) + Math.abs(c.y - currentDot.y);
            if (d > MAX_REACH) return false;
            if (c.gen !== -1) return false;
            const vx = c.x - currentDot.x;
            const vy = c.y - currentDot.y;
            const isCollinear = (vx * dy - vy * dx) === 0;
            const isSameDirection = (vx * dx + vy * dy) > 0;
            return isCollinear && isSameDirection;
          }
        );
        if (validCandidates.length === 0) continue;

        const targetIdx = Math.round(Math.random() * (validCandidates.length - 1));
        const child = validCandidates[targetIdx];
        child.gen = currentDot.gen + 1;

        const tx = currentDot.x - child.x;
        const ty = currentDot.y - child.y;
        const angle = Math.atan2(ty, tx) * (180 / Math.PI);
        const dist = Math.hypot(tx, ty);

        // trail probability increases with generation, decreases with distance
        const hasTrailProb = Math.min(0.15, Math.max(0, 0.06 + child.gen * 0.02 - dist * 0.001));

        queue.push({
          id: `y:${child.y}-x:${child.x}`,
          x: child.x,
          y: child.y,
          gen: child.gen,
          dist,
          angle,
          delay: (Math.random() - 0.5) * D, // between -0.3 and 0.3 seconds
          hasTrail: Math.random() < hasTrailProb,
        } as Dot);
      }
    }

    setDots(networkDots);
    setLastGen(localLastGen);

    console.log(`Generated ${networkDots.length} dots across ${localLastGen} generations.`);
  }, []);

  const TotalTime = (lastGen + 2) * 2 * D;

  const renderKeyframes = () => {
    if (lastGen === 0) return null;

    let css = `
      @property --scale-x { syntax: "<number>"; inherits: false; initial-value: 1; }
      @property --dist { syntax: "<length>"; inherits: false; initial-value: 0px; }
      @property --angle { syntax: "<angle>"; inherits: false; initial-value: 0deg; }
    `;

    for (let K = 0; K <= lastGen; K++) {
      const P = (time: number) => ((time * D) / TotalTime) * 100;
      const L = lastGen;

      const collapseStart = L - K;
      const collapseMid = collapseStart + 0.5;
      const collapseEnd = collapseStart + 1;

      const expandStart = L + 2 + K;
      const expandMid = expandStart + 0.5;
      const expandEnd = expandStart + 1;


      css += `
        @keyframes layer-anim-${K} {
          0%, ${P(collapseStart)}% {
            transform: rotate(var(--angle)) translateX(-50%) scaleX(1);
            opacity: 0.5;
            animation-timing-function: ease-in;
            border-radius: ${DOT_SIZE / 2}px;
          }
          ${P(collapseMid)}% {
            transform: rotate(var(--angle)) translateX(-50%) scaleX(var(--scale-x));
            opacity: 1;
            animation-timing-function: ease-out;
            border-radius: ${DOT_SIZE / 2}px;
          }
          ${P(collapseEnd)}%, ${P(expandStart)}% {
            transform: rotate(var(--angle)) translateX(calc(-50% + var(--dist))) scaleX(1);
            opacity: 0;
            animation-timing-function: ease-in;
            border-radius: ${DOT_SIZE / 2}px;
          }
          ${P(expandMid)}% {
            transform: rotate(var(--angle)) translateX(-50%) scaleX(var(--scale-x));
            opacity: 1;
            animation-timing-function: ease-out;
            border-radius: ${DOT_SIZE / 2}px;
          }
          ${P(expandEnd)}%, 100% {
            transform: rotate(var(--angle)) translateX(-50%) scaleX(1);
            opacity: 0.5;
            animation-timing-function: ease-in;
            border-radius: ${DOT_SIZE / 2}px;
          }
        }
      `;
    }
    return <style>{css}</style>;
  };

  const mask = `radial-gradient(
    circle at center, 
    black 0%, 
    black 40%, 
    rgba(0,0,0,0.3) 60%, 
    transparent 85%
  )`;

  return (
    <div className="absolute inset-0 w-full h-full -z-10 overflow-hidden bg-zinc-950" ref={rectRef}>
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          WebkitMaskImage: mask,
          maskImage: mask,
        }}
      >
        {renderKeyframes()}

        {dots.map((dot) => (
          <div
            key={dot.id}
            className={`absolute bg-white ${dot.dist === 0 && dot.gen !== 0 ? 'hidden' : ''}`}
            style={{
              left: dot.x - DOT_SIZE / 2,
              top: dot.y - DOT_SIZE / 2,
              width: `${DOT_SIZE}px`,
              height: `${DOT_SIZE}px`,
              transformOrigin: 'left center',
              '--dist': `${dot.dist}px`,
              '--scale-x': dot.hasTrail ? dot.dist / DOT_SIZE : 1,
              '--angle': `${dot.angle}deg`,
              animation: `layer-anim-${dot.gen} ${TotalTime}s infinite`,
              animationDelay: `${dot.delay}s`,
            } as CustomStyle}
          />
        ))}
      </div>
    </div>
  );
}