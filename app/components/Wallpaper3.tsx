import React, { useEffect, useState } from 'react';

type Dot = {
  id: string;
  x: number;
  y: number;
  layer: number;
  dist: number;
  angle: number;
  hasTrail: boolean;
};

interface CustomStyle extends React.CSSProperties {
  '--dist': string;
  '--scale-x': number;
  '--angle': string;
}

const spacing = 40;
const MAX_REACH = spacing * 2;

export default function Wallpaper3() {
  const [dots, setDots] = useState<Dot[]>([]);
  const [maxLayer, setMaxLayer] = useState(0);
  const rectRef = React.useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!rectRef.current) return;
    const rect = rectRef.current.getBoundingClientRect();
    const MAX_DIST = Math.sqrt(rect.width ** 2 + rect.height ** 2) * 0.4;

    const screenCenterX = Math.round(rect.width / 2);
    const screenCenterY = Math.round(rect.height / 2);

    const stepsX = Math.ceil(screenCenterX / spacing);
    const stepsY = Math.ceil(screenCenterY / spacing);

    const rawNodes: { gridX: number; gridY: number; x: number; y: number; layer: number }[] = [];
    let localMaxLayer = 0;

    for (let i = -stepsY; i <= stepsY; i++) {
      for (let j = -stepsX; j <= stepsX; j++) {
        const isCenter = i === 0 && j === 0;
        const x = screenCenterX + j * spacing;
        const y = screenCenterY + i * spacing;
        if (Math.sqrt((x - screenCenterX) ** 2 + (y - screenCenterY) ** 2) > MAX_DIST) continue;

        if (isCenter || Math.random() > 0.33) {
          const layer = Math.abs(j) + Math.abs(i);
          localMaxLayer = Math.max(localMaxLayer, layer);

          rawNodes.push({
            gridX: j,
            gridY: i,
            x,
            y,
            layer
          });
        }
      }
    }
    setMaxLayer(localMaxLayer);

    const networkDots: Dot[] = rawNodes.map((dot) => {
      let tx = 0;
      let ty = 0;
      let dist = 0;
      let angle = 0;

      if (dot.layer > 0) {
        const allValidCandidates = rawNodes.filter(
          (c) => (c.gridX === dot.gridX || c.gridY === dot.gridY) && c.layer < dot.layer
        );

        if (allValidCandidates.length > 0) {
          const reachableCandidates = allValidCandidates.filter((c) => {
            const d = Math.abs(c.x - dot.x) + Math.abs(c.y - dot.y);
            return d <= MAX_REACH;
          });

          if (reachableCandidates.length > 0) {
            const randomIndex = Math.floor(Math.random() * reachableCandidates.length);
            const target = reachableCandidates[randomIndex];

            tx = target.x - dot.x;
            ty = target.y - dot.y;

            dist = Math.hypot(tx, ty);
            angle = Math.atan2(ty, tx) * (180 / Math.PI);
          }
        }
      }

      return {
        id: `${dot.gridY}-${dot.gridX}`,
        x: dot.x,
        y: dot.y,
        layer: dot.layer,
        dist,
        angle,
        hasTrail: Math.random() > 0.8,
      };
    });

    setDots(networkDots);
  }, []);

  const D = 0.6;
  const TotalTime = (maxLayer + 2) * 2 * D;

  const renderKeyframes = () => {
    if (maxLayer === 0) return null;

    let css = `
      @property --scale-x { syntax: "<number>"; inherits: false; initial-value: 1; }
      @property --dist { syntax: "<length>"; inherits: false; initial-value: 0px; }
      @property --angle { syntax: "<angle>"; inherits: false; initial-value: 0deg; }
    `;

    for (let K = 0; K <= maxLayer; K++) {
      const P = (time: number) => ((time * D) / TotalTime) * 100;
      const L = maxLayer;

      const collapseStart = L - K;
      const collapseMid = collapseStart + 0.5;
      const collapseEnd = collapseStart + 1;

      const expandStart = L + 2 + K;
      const expandMid = expandStart + 0.5;
      const expandEnd = expandStart + 1;

      css += `
        @keyframes layer-anim-${K} {
          0%, ${P(collapseStart)}% {
            transform: rotate(var(--angle)) translateX(0px) scaleX(1);
            opacity: 0.5;
            animation-timing-function: ease-in-out;
          }
          ${P(collapseMid)}% {
            transform: rotate(var(--angle)) translateX(0px) scaleX(var(--scale-x));
            opacity: 1;
            animation-timing-function: ease-in-out;
          }
          ${P(collapseEnd)}%, ${P(expandStart)}% {
            transform: rotate(var(--angle)) translateX(var(--dist)) scaleX(1);
            opacity: 0;
            animation-timing-function: ease-in-out;
          }
          ${P(expandMid)}% {
            transform: rotate(var(--angle)) translateX(0px) scaleX(var(--scale-x));
            opacity: 1;
            animation-timing-function: ease-in-out;
          }
          ${P(expandEnd)}%, 100% {
            transform: rotate(var(--angle)) translateX(0px) scaleX(1);
            opacity: 0.5;
          }
        }
      `;
    }
    return <style>{css}</style>;
  };

  const mask = `radial-gradient(
    circle at center, 
    black 0%, 
    black 30%, 
    rgba(0,0,0,0.3) 55%, 
    transparent 80%
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
            className={`absolute bg-zinc-300 ${dot.dist === 0 && dot.layer !== 0 ? 'hidden' : ''}`}
            style={{
              left: dot.x,
              top: dot.y - 1,
              width: '2px',
              height: '2px',
              transformOrigin: '0px 1px',
              '--dist': `${dot.dist}px`,
              '--scale-x': dot.hasTrail ? dot.dist / 2 : 1,
              '--angle': `${dot.angle}deg`,
              animation: `layer-anim-${dot.layer} ${TotalTime}s infinite`,
            } as CustomStyle}
          />
        ))}
      </div>
    </div>
  );
}