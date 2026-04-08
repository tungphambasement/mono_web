"use client";

import { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import TaskbarIcon from "./TaskbarIcon";
import { ReactNode } from "react";
import { LayoutGrid } from "lucide-react";

export interface TaskbarItem {
  id: string;
  icon: ReactNode;
  label: string;
  isActive?: boolean;
  isFocused?: boolean;
  onClick?: () => void;
}

interface TaskbarProps {
  items: TaskbarItem[];
}

export default function Taskbar({ items }: TaskbarProps) {
  const [open, setOpen] = useState(false);
  const leaveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  function handleMouseEnter() {
    if (leaveTimer.current) clearTimeout(leaveTimer.current);
    setOpen(true);
  }

  function handleMouseLeave() {
    leaveTimer.current = setTimeout(() => setOpen(false), 280);
  }

  const hasActive = items.some((i) => i.isActive);

  return (
    <div
      className="fixed bottom-4 right-4 z-50 flex flex-col items-end gap-2"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {/* Expanded items — fan upward */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 8, scale: 0.92 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.92 }}
            transition={{ type: "spring", stiffness: 380, damping: 28 }}
            className="flex flex-col items-end gap-1.5 pb-1"
          >
            {items.map((item) => (
              <TaskbarIcon key={item.id} item={item} orientation="horizontal" />
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Collapsed toggle button */}
      <motion.button
        onClick={() => setOpen((v) => !v)}
        whileTap={{ scale: 0.82 }}
        transition={{ type: "spring", stiffness: 400, damping: 12 }}
        aria-label="Open app tray"
        className="relative flex items-center justify-center w-9 h-9 rounded-xl bg-zinc-900/80 border border-zinc-700/60 backdrop-blur-md shadow-lg cursor-pointer"
      >
        <LayoutGrid size={16} className="text-white/80" strokeWidth={1.6} />
      </motion.button>
    </div>
  );
}
