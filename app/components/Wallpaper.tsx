import React, { useEffect, useState } from 'react';

type Dot = {
  id: string;
  x: number;
  y: number;
  delay: number;
  travelX: number;
  travelY: number;
};

interface CustomStyle extends React.CSSProperties {
  '--travel-x': string;
  '--travel-y': string;
}

export default function Wallpaper() {
  const [dots, setDots] = useState<Dot[]>([]);

  useEffect(() => {
    const spacing = 40;
    const cols = Math.floor(window.innerWidth / spacing);
    const rows = Math.floor(window.innerHeight / spacing);

    const centerX = cols / 2;
    const centerY = rows / 2;

    const maxDist = Math.hypot(centerX, centerY);

    const newDots = [];

    for (let i = 0; i < rows; i++) {
      for (let j = 0; j < cols; j++) {
        const dist = Math.hypot(j - centerX, i - centerY);
        const delay = (maxDist - dist) * 0.15;

        const deltaX = (centerX - j) / dist || 0;
        const deltaY = (centerY - i) / dist || 0;

        newDots.push({
          id: `${i}-${j}`,
          x: j * spacing,
          y: i * spacing,
          delay: delay,
          travelX: deltaX * spacing,
          travelY: deltaY * spacing,
        });
      }
    }
    setDots(newDots);
  }, []);

  return (
    <div className="absolute inset-0 w-full h-full -z-10 overflow-hidden bg-zinc-950">

      <div
        className="absolute inset-0 opacity-50 pointer-events-none"
        style={{
          WebkitMaskImage: 'radial-gradient(circle at center, black 30%, transparent 80%)',
          maskImage: 'radial-gradient(circle at center, black 30%, transparent 80%)',
        }}
      >
        {dots.map((dot) => (
          <div
            key={dot.id}
            className="absolute w-0.5 h-0.5 bg-white rounded-full"
            style={{
              left: dot.x,
              top: dot.y,
              '--travel-x': `${dot.travelX}px`,
              '--travel-y': `${dot.travelY}px`,
              animation: `collapse-inward 4s ease-in-out infinite alternate`,
              animationDelay: `${dot.delay}s`,
            } as CustomStyle} /* 2. Cast the style object here */
          />
        ))}
      </div>

      <style>{`
        @keyframes collapse-inward {
          0%, 20% {
            transform: translate(0, 0) scale(1);
            opacity: 0.7;
          }
          80%, 100% {
            transform: translate(var(--travel-x), var(--travel-y)) scale(0);
            opacity: 0;
          }
        }
      `}</style>
    </div>
  );
}