"use client";

import { RefObject, useEffect, useLayoutEffect, useRef, useState } from "react";
import Terminal, { ExternalCommandDef } from "./Terminal";

interface DraggableTerminalProps {
  externalCommands?: Record<string, ExternalCommandDef>;
  screenRef: RefObject<HTMLDivElement | null>;
  onClose: () => void;
  onMinimize: () => void;
}

export default function DraggableTerminal({
  externalCommands,
  screenRef,
  onClose,
  onMinimize,
}: DraggableTerminalProps) {
  const DEFAULT_W = 520;
  const DEFAULT_H = 220;

  // Initialize immediately so the terminal is never null.
  // Will be refined to screen-relative coords once the screen mounts.
  const [pos, setPos] = useState<{ x: number; y: number }>({ x: 80, y: 60 });
  const [size, setSize] = useState({ width: DEFAULT_W, height: DEFAULT_H });
  const [isDragging, setIsDragging] = useState(false);
  const [ready, setReady] = useState(false);

  const sizeRef = useRef(size);
  sizeRef.current = size;
  const posRef = useRef(pos);
  posRef.current = pos;

  const isDraggingRef = useRef(false);
  const isResizing = useRef<"s" | "e" | "se" | null>(null);
  const dragOffset = useRef({ x: 0, y: 0 });
  const resizeOrigin = useRef({ mouseX: 0, mouseY: 0, w: 0, h: 0 });

  function getScreenBounds() {
    return {
      w: screenRef.current?.offsetWidth ?? window.innerWidth,
      h: screenRef.current?.offsetHeight ?? window.innerHeight,
    };
  }

  function clamped(x: number, y: number) {
    const { w, h } = getScreenBounds();
    return {
      x: Math.max(0, Math.min(w - 80, x)),
      y: Math.max(0, Math.min(h - 44, y)),
    };
  }

  useLayoutEffect(() => {
    const screen = screenRef.current;
    if (!screen) return;
    const sw = screen.offsetWidth;
    const sh = screen.offsetHeight;
    if (sw <= 0 || sh <= 0) return;
    const w = Math.min(DEFAULT_W, sw - 40);
    setSize((s) => ({ ...s, width: w }));
    setPos(clamped((sw - w) / 2, sh * 0.12));
    setReady(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Fallback: if useLayoutEffect couldn't read screenRef (React 19 async commit),
  // re-try after paint.
  useEffect(() => {
    if (ready) return;
    const screen = screenRef.current;
    if (!screen) return;
    const sw = screen.offsetWidth;
    const sh = screen.offsetHeight;
    if (sw <= 0 || sh <= 0) return;
    const w = Math.min(DEFAULT_W, sw - 40);
    setSize((s) => ({ ...s, width: w }));
    setPos(clamped((sw - w) / 2, sh * 0.12));
    setReady(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ready]);

  useEffect(() => {
    function onMove(e: MouseEvent) {
      if (!isDraggingRef.current && !isResizing.current) return;
      e.preventDefault();

      if (isDraggingRef.current) {
        const screenRect = screenRef.current?.getBoundingClientRect() ?? { left: 0, top: 0 };
        const x = e.clientX - screenRect.left - dragOffset.current.x;
        const y = e.clientY - screenRect.top - dragOffset.current.y;
        setPos(clamped(x, y));
        return;
      }

      if (isResizing.current) {
        const dx = e.clientX - resizeOrigin.current.mouseX;
        const dy = e.clientY - resizeOrigin.current.mouseY;
        const dir = isResizing.current;
        setSize({
          width: dir === "s" ? resizeOrigin.current.w : Math.max(320, resizeOrigin.current.w + dx),
          height: dir === "e" ? resizeOrigin.current.h : Math.max(160, resizeOrigin.current.h + dy),
        });
      }
    }

    function onUp() {
      isDraggingRef.current = false;
      isResizing.current = null;
      setIsDragging(false);
    }

    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseup", onUp);
    return () => {
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseup", onUp);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function handleDragStart(e: React.MouseEvent) {
    if (!screenRef.current) return;
    e.preventDefault();
    isDraggingRef.current = true;
    setIsDragging(true);
    const rect = screenRef.current.getBoundingClientRect();
    dragOffset.current = {
      x: e.clientX - rect.left - posRef.current.x,
      y: e.clientY - rect.top - posRef.current.y,
    };
  }

  function handleResizeStart(e: React.MouseEvent, dir: "s" | "e" | "se") {
    e.preventDefault();
    e.stopPropagation();
    isResizing.current = dir;
    resizeOrigin.current = {
      mouseX: e.clientX,
      mouseY: e.clientY,
      w: sizeRef.current.width,
      h: sizeRef.current.height,
    };
  }

  return (
    <div
      className="absolute z-30 animate-fade-in"
      style={{
        left: pos.x,
        top: pos.y,
        width: size.width,
        willChange: "left, top, width",
      }}
    >
      <Terminal
        height={size.height}
        onDragHandleMouseDown={handleDragStart}
        isDragging={isDragging}
        externalCommands={externalCommands}
        onClose={onClose}
        onMinimize={onMinimize}
      />

      {/* Resize handles */}
      <div className="absolute inset-x-0 bottom-0 h-2 cursor-s-resize" onMouseDown={(e) => handleResizeStart(e, "s")} />
      <div className="absolute inset-y-0 right-0 w-2 cursor-e-resize" onMouseDown={(e) => handleResizeStart(e, "e")} />
      <div className="absolute bottom-0 right-0 w-4 h-4 cursor-se-resize z-10" onMouseDown={(e) => handleResizeStart(e, "se")} />
    </div>
  );
}