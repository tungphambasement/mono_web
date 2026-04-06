"use client";

import TaskbarIcon from "./TaskbarIcon";
import { ReactNode } from "react";

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
  return (
    <div className="fixed bottom-3 left-1/2 -translate-x-1/2 z-50 pointer-events-none">
      <div className="pointer-events-auto flex items-center gap-0.5 px-3 py-1">
        {items.map((item) => (
          <TaskbarIcon key={item.id} item={item} />
        ))}
      </div>
    </div>
  );
}
