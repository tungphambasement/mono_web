"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";

//  Config 

const PHRASES = [
  "Anything you want",
  "Anything you can imagine",
  "Can be brought to life",
] as const;

type Card = { id: number; url: string | null; label: string };

const CARDS: Card[] = [
  { id: 1, url: null, label: "Placeholder" },
  { id: 2, url: null, label: "Placeholder" },
  { id: 3, url: null, label: "Placeholder" },
  { id: 4, url: null, label: "Placeholder" },
  { id: 5, url: null, label: "Placeholder" },
  { id: 6, url: null, label: "Placeholder" },
];

const AUTO_ADVANCE_MS = 4000;
const PHRASE_MS = 2500;

// Card height as a fraction of viewport height; width derived from window aspect ratio
const CARD_H_VH = 0.52;

//  Per-offset visual parameters (scale-independent ratios) 

const OFFSET_Z = [0, -160, -320]; // translateZ (depth)
const OFFSET_ROTATE_Y = [0, 20, 36];    // rotateY magnitude (degrees)
const OFFSET_SCALE = [1, 0.82, 0.64];
const OFFSET_OPACITY = [1, 0.70, 0.38];
const OFFSET_Z_INDEX = [20, 12, 4];
// Horizontal spread as multiples of cardW
const OFFSET_X_RATIO = [0, 0.64, 1.16];

type CardTransform = {
  x: number; z: number; rotateY: number;
  scale: number; opacity: number; zIndex: number;
};

function getCardTransform(offset: number, cardW: number): CardTransform | null {
  const abs = Math.abs(offset);
  if (abs > 2) return null;
  const sign = offset === 0 ? 0 : offset < 0 ? -1 : 1;
  return {
    x: sign * OFFSET_X_RATIO[abs] * cardW,
    z: OFFSET_Z[abs],
    rotateY: -sign * OFFSET_ROTATE_Y[abs],
    scale: OFFSET_SCALE[abs],
    opacity: OFFSET_OPACITY[abs],
    zIndex: OFFSET_Z_INDEX[abs],
  };
}

function useCardSize() {
  const [size, setSize] = useState({ w: 0, h: 0 });
  useEffect(() => {
    function update() {
      const h = Math.round(window.innerHeight * CARD_H_VH);
      const w = Math.round(h * (window.innerWidth / window.innerHeight));
      setSize({ w, h });
    }
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, []);
  return size;
}

//  Component 

export default function HeroSection() {
  const n = CARDS.length;
  const { w: cardW, h: cardH } = useCardSize();
  const [activeIndex, setActiveIndex] = useState(0);
  const [phraseIndex, setPhraseIndex] = useState(0);
  const [iframeErrors, setIframeErrors] = useState<Record<number, boolean>>({});
  const autoAdvanceRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const dragStartX = useRef<number | null>(null);
  const didDrag = useRef(false);

  //  Auto-advance 
  const startAutoAdvance = useCallback(() => {
    if (autoAdvanceRef.current) clearInterval(autoAdvanceRef.current);
    autoAdvanceRef.current = setInterval(
      () => setActiveIndex((i) => (i + 1) % n),
      AUTO_ADVANCE_MS,
    );
  }, [n]);

  useEffect(() => {
    startAutoAdvance();
    return () => { if (autoAdvanceRef.current) clearInterval(autoAdvanceRef.current); };
  }, [startAutoAdvance]);

  //  Phrase cycling 
  useEffect(() => {
    const t = setInterval(() => setPhraseIndex((i) => (i + 1) % PHRASES.length), PHRASE_MS);
    return () => clearInterval(t);
  }, []);

  function navigate(dir: 1 | -1) {
    setActiveIndex((i) => (i + dir + n) % n);
    startAutoAdvance();
  }

  function goToIndex(index: number) {
    setActiveIndex(index);
    startAutoAdvance();
  }

  //  Drag / swipe 
  function handlePointerDown(e: React.PointerEvent) {
    dragStartX.current = e.clientX;
    didDrag.current = false;
  }

  function handlePointerMove(e: React.PointerEvent) {
    if (dragStartX.current !== null && Math.abs(e.clientX - dragStartX.current) > 8) {
      didDrag.current = true;
    }
  }

  function handlePointerUp(e: React.PointerEvent) {
    if (dragStartX.current === null) return;
    const delta = e.clientX - dragStartX.current;
    if (delta < -60) navigate(1);
    else if (delta > 60) navigate(-1);
    dragStartX.current = null;
    setTimeout(() => { didDrag.current = false; }, 0);
  }

  return (
    <div className="flex flex-col items-center gap-8 py-8 select-none w-full max-w-7xl">

      {/*  Cycling headline  */}
      <div
        className="relative flex items-center justify-center w-full"
        style={{ height: 72, clipPath: "inset(0 0 0 0)" }}
      >
        <AnimatePresence mode="wait">
          <motion.p
            key={phraseIndex}
            initial={{ opacity: 0, y: 22 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -22 }}
            transition={{ duration: 0.75, ease: [0.25, 0.46, 0.45, 0.94] }}
            className="absolute text-3xl md:text-5xl font-bold text-white tracking-tight text-center whitespace-nowrap"
          >
            {PHRASES[phraseIndex]}
          </motion.p>
        </AnimatePresence>
      </div>

      {/*  Carousel  */}
      <div
        className="relative w-full overflow-hidden cursor-grab active:cursor-grabbing"
        style={{ height: cardH + 48, perspective: "1400px" }}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerLeave={() => { dragStartX.current = null; }}
      >
        {/* Left arrow */}
        <button
          onClick={(e) => { e.stopPropagation(); navigate(-1); }}
          className="absolute left-4 top-1/2 -translate-y-1/2 z-30 w-10 h-10 rounded-full hover:bg-white/25 border border-white/20 flex items-center justify-center text-white text-lg transition-colors backdrop-blur-sm"
          style={{ cursor: "pointer" }}
          aria-label="Previous"
        >
          ←
        </button>

        {/* Right arrow */}
        <button
          onClick={(e) => { e.stopPropagation(); navigate(1); }}
          className="absolute right-4 top-1/2 -translate-y-1/2 z-30 w-10 h-10 rounded-full hover:bg-white/25 border border-white/20 flex items-center justify-center text-white text-lg transition-colors backdrop-blur-sm"
          style={{ cursor: "pointer" }}
          aria-label="Next"
        >
          →
        </button>

        {/* Cards row — perspective-preserving container */}
        <div
          className="absolute inset-0 flex items-center justify-center"
          style={{ transformStyle: "preserve-3d" }}
        >
          {CARDS.map((card, i) => {
            // Compute signed offset from center (wraps around)
            let offset = (i - activeIndex + n) % n;
            if (offset > n / 2) offset -= n;

            const t = getCardTransform(offset, cardW);
            if (!t) return null;

            return (
              <motion.div
                key={card.id}
                animate={{
                  x: t.x,
                  z: t.z,
                  rotateY: t.rotateY,
                  scale: t.scale,
                  opacity: t.opacity,
                }}
                transition={{ type: "spring", stiffness: 290, damping: 32 }}
                style={{
                  position: "absolute",
                  width: cardW,
                  height: cardH,
                  zIndex: t.zIndex,
                  borderRadius: 14,
                  overflow: "hidden",
                  boxShadow: offset === 0
                    ? "0 28px 64px rgba(0,0,0,0.65)"
                    : "0 10px 32px rgba(0,0,0,0.40)",
                }}
                onClick={() => {
                  if (!didDrag.current && offset !== 0) goToIndex(i);
                }}
              >
                {/* iFrame or placeholder */}
                {card.url && !iframeErrors[card.id] ? (
                  <iframe
                    src={card.url}
                    title={card.label}
                    loading="lazy"
                    sandbox="allow-scripts allow-same-origin"
                    style={{
                      width: "100%",
                      height: "100%",
                      border: "none",
                      display: "block",
                      pointerEvents: offset === 0 ? "auto" : "none",
                    }}
                    onError={() =>
                      setIframeErrors((prev) => ({ ...prev, [card.id]: true }))
                    }
                  />
                ) : (
                  <PlaceholderCard label={card.label} />
                )}

                {/* Inset border overlay */}
                <div
                  style={{
                    position: "absolute",
                    inset: 0,
                    borderRadius: 14,
                    border: `1px solid ${offset === 0
                      ? "rgba(255,255,255,0.18)"
                      : "rgba(255,255,255,0.07)"
                      }`,
                    pointerEvents: "none",
                  }}
                />
              </motion.div>
            );
          })}
        </div>
      </div>

      {/*  Dot indicators  */}
      <div className="flex gap-2 items-center">
        {CARDS.map((card, i) => (
          <button
            key={card.id}
            onClick={() => goToIndex(i)}
            aria-label={`Go to ${card.label}`}
            className={`rounded-full transition-all duration-300 ${i === activeIndex
              ? "w-3 h-1 bg-white"
              : "w-1 h-1 bg-white/30 hover:bg-white/55"
              }`}
          />
        ))}
      </div>

    </div>
  );
}

//  Placeholder card 

function PlaceholderCard({ label }: { label: string }) {
  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        background: "linear-gradient(145deg, #0f172a 0%, #1e293b 55%, #0f172a 100%)",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: 14,
      }}
    >
      {/* Decorative icon placeholder */}
      <div
        style={{
          width: 52,
          height: 52,
          borderRadius: "50%",
          background: "rgba(255,255,255,0.05)",
          border: "1px solid rgba(255,255,255,0.12)",
        }}
      />
      <span
        style={{
          color: "rgba(255,255,255,0.45)",
          fontSize: 14,
          fontWeight: 500,
          letterSpacing: "0.08em",
          textTransform: "uppercase",
        }}
      >
        {label}
      </span>
    </div>
  );
}

