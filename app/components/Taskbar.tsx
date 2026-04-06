"use client";

import { LucideIcon } from "lucide-react";

export interface TaskbarItem {
  id: string;
  icon: LucideIcon;
  label: string;
  isActive?: boolean;
  isFocused?: boolean;
  onClick?: () => void;
}

interface TaskbarProps {
  items: TaskbarItem[];
}

export default function Taskbar({ items }: TaskbarProps) {
  return (
    <div className="fixed bottom-2.5 left-1/2 -translate-x-1/2 z-50 pointer-events-none">
      <div className="pointer-events-auto flex items-center gap-0.5 px-3 py-2">
        {items.map((item) => (
          <div
            key={item.id}>
            <button
              onClick={item.onClick}
              title={item.label}
              aria-label={item.label}
              className={[
                "relative flex items-center justify-center w-10 h-10 border border-white/20 rounded-xl transition-all duration-150 cursor-pointer select-none",
                item.isActive
                  ? "bg-zinc-800 hover:bg-white/25"
                  : "bg-zinc-800 hover:bg-zinc-900",
              ].join(" ")}
            >
              <item.icon size={18} className="text-white drop-shadow-sm" strokeWidth={1.6} />
            </button>
            <span className={[
              "absolute bottom-0.5 left-1/2 -translate-x-1/2 h-0.75 rounded-2xl",
              item.isActive
                ? "w-3 bg-zinc-200" : "w-1.5  bg-zinc-400"
            ].join(" ")} />
          </div>
        ))}
      </div>
    </div>
  );
}
