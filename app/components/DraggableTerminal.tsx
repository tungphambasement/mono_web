"use client";

import { useEffect, useLayoutEffect, useRef, useState } from "react";
import Terminal from "./Terminal";

export default function DraggableTerminal() {
  const [pos, setPos] = useState({ x: 0, y: 0 });
  const [size, setSize] = useState({ width: 640, height: 320 });
  const [isDragging, setIsDragging] = useState(false);

  const sizeRef = useRef(size);
  sizeRef.current = size;
  const posRef = useRef(pos);
  posRef.current = pos;

  const isDraggingRef = useRef(false);
  const isResizing = useRef<"s" | "e" | "se" | null>(null);
  const dragOffset = useRef({ x: 0, y: 0 });
  const resizeOrigin = useRef({ mouseX: 0, mouseY: 0, w: 0, h: 0 });

  useLayoutEffect(() => {
    const w = Math.min(640, window.innerWidth - 40);
    setSize((s) => ({ ...s, width: w }));
    setPos({
      x: Math.max(20, (window.innerWidth - w) / 2),
      y: Math.max(60, (window.innerHeight - 380) / 2),
    });
  }, []);

  useEffect(() => {
    function onMove(e: MouseEvent) {
      if (!isDraggingRef.current && !isResizing.current) return;
      e.preventDefault();
      if (isDraggingRef.current) {
        const x = e.clientX - dragOffset.current.x;
        const y = e.clientY - dragOffset.current.y;
        setPos({
          x: Math.max(-sizeRef.current.width + 80, Math.min(window.innerWidth - 80, x)),
          y: Math.max(0, Math.min(window.innerHeight - 44, y)),
        });
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
  }, []);

  function handleDragStart(e: React.MouseEvent) {
    e.preventDefault();
    isDraggingRef.current = true;
    setIsDragging(true);
    dragOffset.current = { x: e.clientX - posRef.current.x, y: e.clientY - posRef.current.y };
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
      className="fixed z-50 animate-fade-in"
      style={{ left: pos.x, top: pos.y, width: size.width }}
    >
      <Terminal
        height={size.height}
        onDragHandleMouseDown={handleDragStart}
        isDragging={isDragging}
      />
      {/* Resize handles */}
      <div
        className="absolute inset-x-0 bottom-0 h-2 cursor-s-resize"
        onMouseDown={(e) => handleResizeStart(e, "s")}
      />
      <div
        className="absolute inset-y-0 right-0 w-2 cursor-e-resize"
        onMouseDown={(e) => handleResizeStart(e, "e")}
      />
      <div
        className="absolute bottom-0 right-0 w-4 h-4 cursor-se-resize z-10"
        onMouseDown={(e) => handleResizeStart(e, "se")}
      />
    </div>
  );
}
