"use client";

import { ReactNode } from "react";

interface DesktopIconProps {
  icon: ReactNode;
  label: string;
  onClick: () => void;
  active?: boolean;
}

export default function DesktopIcon({ icon, label, onClick, active }: DesktopIconProps) {
  return (
    <button
      onClick={onClick}
      className={`flex flex-col items-center gap-1.5 w-16 group focus:outline-none`}
    >
      <div
        className={`w-12 h-12 rounded-xl flex items-center justify-center transition-all duration-150 
          ${active
            ? "bg-white/25 ring-2 ring-white/40"
            : "bg-white/10 group-hover:bg-white/20 group-hover:scale-105 group-hover:cursor-pointer"
          }`}
      >
        {icon}
      </div>
      <span
        className={`text-[10px] font-medium leading-tight text-center px-1 rounded select-none
          transition-colors duration-150
          ${active ? "text-white bg-blue-500/70" : "text-white/80 group-hover:text-white"}`}
        style={{ textShadow: "0 1px 3px rgba(0,0,0,0.8)" }}
      >
        {label}
      </span>
    </button>
  );
}
