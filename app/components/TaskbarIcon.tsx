import { motion } from "framer-motion";
import { ReactNode } from "react";

export interface TaskbarItem {
  id: string;
  icon: ReactNode;
  label: string;
  isActive?: boolean;
  isFocused?: boolean;
  onClick?: () => void;
}

interface TaskbarIconProps {
  item: TaskbarItem;
  // "horizontal" = label left, icon right (used in tray)
  orientation?: "horizontal" | "vertical";
}

export default function TaskbarIcon({ item, orientation = "vertical" }: TaskbarIconProps) {
  if (orientation === "horizontal") {
    return (
      <motion.button
        onClick={item.onClick}
        aria-label={item.label}
        whileTap={{ scale: 0.85 }}
        transition={{ type: "spring", stiffness: 400, damping: 12 }}
        className="flex items-center gap-2 px-2.5 py-1.5 rounded-xl bg-zinc-900/80 border border-zinc-700/50 backdrop-blur-md shadow-md cursor-pointer select-none"
      >
        <span className="text-xs text-zinc-400 font-medium leading-none">{item.label}</span>
        <div className="relative flex items-center justify-center">
          {item.icon}
          {/* focused ring */}
          {item.isFocused && (
            <span className="absolute inset-0 rounded-lg ring-1 ring-white/30 pointer-events-none" />
          )}
        </div>
        {/* active dot */}
        {item.isActive && (
          <span
            className={`w-1 h-1 rounded-full shadow-[0_0_6px_rgba(255,255,255,0.5)] ${item.isFocused ? "bg-white" : "bg-zinc-400"
              }`}
          />
        )}
      </motion.button>
    );
  }

  // vertical (legacy, kept for compatibility)
  return (
    <div className="relative group flex flex-col items-center gap-1">
      <motion.button
        onClick={item.onClick}
        title={item.label}
        aria-label={item.label}
        whileTap={{ scale: 0.8 }}
        transition={{ type: "spring", stiffness: 400, damping: 10 }}
        className="relative flex items-center justify-center rounded-xl transition-all duration-150 cursor-pointer select-none"
      >
        {item.icon}
      </motion.button>
      <div className="flex justify-center items-center pointer-events-none">
        <motion.span
          initial={{ opacity: 0, width: 2 }}
          animate={{ opacity: 1, width: item.isActive ? (item.isFocused ? 10 : 5) : 0 }}
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
          className={`h-0.75 rounded-lg shadow-[0_0_8px_rgba(255,255,255,0.4)] ${item.isActive ? "bg-white" : "bg-zinc-400"
            }`}
        />
      </div>
    </div>
  );
}