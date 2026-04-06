import React, { useEffect, useState } from 'react';

type Dot = {
  id: string;
  x: number;
  y: number;
  layer: number;
  tx: number; // Target X translation
  ty: number; // Target Y translation
  stretchX: number; // How much to stretch horizontally to form a line
  stretchY: number; // How much to stretch vertically to form a line
};

interface CustomStyle extends React.CSSProperties {
  '--tx': string;
  '--ty': string;
  '--stretch-x': number;
  '--stretch-y': number;
}

export default function Wallpaper() {
  const [dots, setDots] = useState<Dot[]>([]);
  const [maxLayer, setMaxLayer] = useState(0);

  useEffect(() => {
    const spacing = 40;
    const cols = Math.floor(window.innerWidth / spacing);
    const rows = Math.floor(window.innerHeight / spacing);

    // Floor the center coordinates so it lands precisely on a central grid dot
    const cx = Math.floor(cols / 2);
    const cy = Math.floor(rows / 2);

    let localMaxLayer = 0;
    const newDots: Dot[] = [];

    for (let i = 0; i < rows; i++) {
      for (let j = 0; j < cols; j++) {
        const dj = cx - j; // Distance to center X
        const di = cy - i; // Distance to center Y

        // Manhattan distance creates diamond-shaped layers, ensuring 
        // each orthogonal step inward perfectly drops exactly 1 layer.
        const layer = Math.abs(dj) + Math.abs(di);
        localMaxLayer = Math.max(localMaxLayer, layer);

        let tx = 0;
        let ty = 0;

        // Determine orthogonal routing: move along whichever axis is furthest from center
        if (layer > 0) {
          if (Math.abs(dj) > Math.abs(di)) {
            tx = Math.sign(dj) * spacing;
          } else if (Math.abs(di) > Math.abs(dj)) {
            ty = Math.sign(di) * spacing;
          } else {
            // If equal distance, use parity to alternate horizontal/vertical routing
            if ((i + j) % 2 === 0) {
              tx = Math.sign(dj) * spacing;
            } else {
              ty = Math.sign(di) * spacing;
            }
          }
        }

        newDots.push({
          id: `${i}-${j}`,
          x: j * spacing,
          y: i * spacing,
          layer,
          tx,
          ty,
          // Since the dot is 2px wide, scaling it by (spacing / 2) creates a line exactly the length of the spacing
          stretchX: tx !== 0 ? Math.abs(tx) / 2 : 1,
          stretchY: ty !== 0 ? Math.abs(ty) / 2 : 1,
        });
      }
    }
    setMaxLayer(localMaxLayer);
    setDots(newDots);
  }, []);

  // Animation Timings
  const D = 0.6; // Duration of a single step in seconds
  // Total cycle time accounts for Collapse, a slight pause, and Expand
  const TotalTime = (maxLayer + 2) * 2 * D;

  // Dynamically generate Keyframes so each layer knows exactly when to wait and when to move
  const renderKeyframes = () => {
    if (maxLayer === 0) return null;
    let css = '';

    for (let K = 0; K <= maxLayer; K++) {
      // Helper to convert time (in seconds) to a CSS keyframe percentage
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
          /* Idle State */
          0%, ${P(collapseStart)}% {
            transform: translate(0, 0) scale(1, 1);
            opacity: 0.3;
            animation-timing-function: ease-in;
          }
          /* Phase 1: Stretch into a line toward the target */
          ${P(collapseMid)}% {
            transform: translate(calc(var(--tx) / 2), calc(var(--ty) / 2)) scale(var(--stretch-x), var(--stretch-y));
            opacity: 1;
            animation-timing-function: ease-out;
          }
          /* Phase 2: Collapse into the target dot (hidden) */
          ${P(collapseEnd)}%, ${P(expandStart)}% {
            transform: translate(var(--tx), var(--ty)) scale(1, 1);
            opacity: 0;
            animation-timing-function: ease-in;
          }
          /* Phase 3: Expand back out */
          ${P(expandMid)}% {
            transform: translate(calc(var(--tx) / 2), calc(var(--ty) / 2)) scale(var(--stretch-x), var(--stretch-y));
            opacity: 1;
            animation-timing-function: ease-out;
          }
          /* Phase 4: Return to Idle */
          ${P(expandEnd)}%, 100% {
            transform: translate(0, 0) scale(1, 1);
            opacity: 0.3;
          }
        }
      `;
    }
    return <style>{css}</style>;
  };

  return (
    <div className="absolute inset-0 w-full h-full -z-10 overflow-hidden bg-zinc-950">
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          WebkitMaskImage: 'radial-gradient(circle at center, black 40%, transparent 90%)',
          maskImage: 'radial-gradient(circle at center, black 40%, transparent 90%)',
        }}
      >
        {renderKeyframes()}

        {dots.map((dot) => (
          <div
            key={dot.id}
            className="absolute w-0.5 h-0.5 bg-zinc-400 rounded-full"
            style={{
              left: dot.x,
              top: dot.y,
              '--tx': `${dot.tx}px`,
              '--ty': `${dot.ty}px`,
              '--stretch-x': dot.stretchX,
              '--stretch-y': dot.stretchY,
              // Apply the dynamically generated keyframe specific to this dot's layer
              animation: `layer-anim-${dot.layer} ${TotalTime}s infinite`,
            } as CustomStyle}
          />
        ))}
      </div>
    </div>
  );
}