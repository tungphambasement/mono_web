"use client";

import { LucideIcon } from "lucide-react";

export interface TaskbarItem {
  id: string;
  icon: LucideIcon;
  label: string;
  /** Icon gets the active highlight + dot */
  isActive?: boolean;
  onClick?: () => void;
}

interface TaskbarProps {
  items: TaskbarItem[];
}

export default function Taskbar({ items }: TaskbarProps) {
  return (
    <div className="fixed bottom-3 left-1/2 -translate-x-1/2 z-50 pointer-events-none">
      <div className="pointer-events-auto flex items-center gap-0.5 px-3 py-2 rounded-2xl bg-zinc-100/10 backdrop-blur-2xl border border-white/12 shadow-[0_8px_32px_rgba(0,0,0,0.45)]">
        {items.map((item) => (
          <button
            key={item.id}
            onClick={item.onClick}
            title={item.label}
            aria-label={item.label}
            className={[
              "relative flex items-center justify-center w-11 h-11 rounded-xl transition-all duration-150 cursor-default select-none",
              item.isActive
                ? "bg-white/20 hover:bg-white/25"
                : "hover:bg-white/10",
            ].join(" ")}
          >
            <item.icon size={20} className="text-white drop-shadow-sm" strokeWidth={1.6} />
            {/* Active indicator dot */}
            {item.isActive && (
              <span className="absolute bottom-0.75 left-1/2 -translate-x-1/2 w-2 h-0.75 rounded-2xl bg-white/80" />
            )}
          </button>
        ))}
      </div>
    </div>
  );
}
