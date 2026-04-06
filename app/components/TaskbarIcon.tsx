import { motion, AnimatePresence } from "framer-motion";
import { ReactNode } from "react";

export interface TaskbarItem {
  id: string;
  icon: ReactNode;
  label: string;
  isActive?: boolean;
  isFocused?: boolean;
  onClick?: () => void;
}

export default function TaskbarIcon({ item }: { item: TaskbarItem }) {
  return (
    <div key={item.id} className="relative group flex flex-col items-center gap-1">
      <motion.button
        onClick={item.onClick}
        title={item.label}
        aria-label={item.label}
        whileTap={{ scale: 0.8 }}
        transition={{
          type: "spring",
          stiffness: 400,
          damping: 10
        }}
        className="relative flex items-center justify-center rounded-xl transition-all duration-150 cursor-pointer select-none"
      >
        {item.icon}
      </motion.button>

      {/* Active & Focused indicator */}
      <div className="flex justify-center items-center pointer-events-none">
        <AnimatePresence mode="wait">
          <motion.span
            layoutId="active-pill"
            initial={{ opacity: 0, width: 2 }}
            animate={{ opacity: 1, width: item.isActive ? (item.isFocused ? 10 : 5) : 0 }}
            exit={{ opacity: 0, width: 2 }}
            transition={{
              type: "spring",
              stiffness: 300,
              damping: 30
            }}
            className={`h-0.75 rounded-lg shadow-[0_0_8px_rgba(255,255,255,0.4)] ${item.isActive ? "bg-white" : "bg-zinc-400"
              }`}
          />
        </AnimatePresence>
      </div>
    </div>
  );
}