"use client";

import { CSSProperties, useEffect, useRef, useState } from "react";

export interface DraggableWindowBag {
  onDragHandleMouseDown: (e: React.MouseEvent) => void;
  isDragging: boolean;
  width: number;
  height: number;
}

interface DraggableWindowProps {
  screenRef: React.RefObject<HTMLDivElement | null>;
  defaultWidth?: number;
  defaultHeight?: number;
  /** Return the desired initial {x, y} in viewport coords from the screen DOMRect. */
  getInitialPos?: (rect: DOMRect) => { x: number; y: number };
  style?: CSSProperties;
  children: (bag: DraggableWindowBag) => React.ReactNode;
}

export default function DraggableWindow({
  screenRef,
  defaultWidth = 560,
  defaultHeight = 280,
  getInitialPos,
  style,
  children,
}: DraggableWindowProps) {
  const [pos, setPos] = useState<{ x: number; y: number } | null>(null);
  const [size, setSize] = useState({ width: defaultWidth, height: defaultHeight });
  const [isDragging, setIsDragging] = useState(false);

  const sizeRef = useRef(size);
  sizeRef.current = size;
  const posRef = useRef(pos);
  posRef.current = pos;

  const isDraggingRef = useRef(false);
  const isResizing = useRef<"s" | "e" | "se" | null>(null);
  const dragOffset = useRef({ x: 0, y: 0 });
  const resizeOrigin = useRef({ mouseX: 0, mouseY: 0, w: 0, h: 0 });

  useEffect(() => {
    if (!screenRef.current) return;
    const rect = screenRef.current.getBoundingClientRect();
    const w = Math.min(defaultWidth, rect.width - 40);
    setSize((s) => ({ ...s, width: w }));
    setPos(
      getInitialPos
        ? getInitialPos(rect)
        : { x: rect.left + rect.width * 0.1, y: rect.top + rect.height * 0.1 }
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [screenRef]);

  useEffect(() => {
    function onMove(e: MouseEvent) {
      if ((!isDraggingRef.current && !isResizing.current) || !posRef.current) return;
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
          width: dir === "s" ? resizeOrigin.current.w : Math.max(260, resizeOrigin.current.w + dx),
          height: dir === "e" ? resizeOrigin.current.h : Math.max(120, resizeOrigin.current.h + dy),
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
    if (!posRef.current) return;
    e.preventDefault();
    isDraggingRef.current = true;
    setIsDragging(true);
    dragOffset.current = {
      x: e.clientX - posRef.current.x,
      y: e.clientY - posRef.current.y,
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
    pos && (
      <div
        className="fixed z-50 animate-fade-in"
        style={{
          left: pos.x,
          top: pos.y,
          width: size.width,
          willChange: "left, top, width",
          ...style,
        }}
      >
        {children({
          onDragHandleMouseDown: handleDragStart,
          isDragging,
          width: size.width,
          height: size.height,
        })}

        {/* Resize handles */}
        <div className="absolute inset-x-0 bottom-0 h-2 cursor-s-resize" onMouseDown={(e) => handleResizeStart(e, "s")} />
        <div className="absolute inset-y-0 right-0 w-2 cursor-e-resize" onMouseDown={(e) => handleResizeStart(e, "e")} />
        <div className="absolute bottom-0 right-0 w-4 h-4 cursor-se-resize z-10" onMouseDown={(e) => handleResizeStart(e, "se")} />
      </div>
    )
  );
}
