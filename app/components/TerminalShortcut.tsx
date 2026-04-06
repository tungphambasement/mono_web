import { TerminalIcon } from "lucide-react";

export default function TerminalShortcut() {
  return (
    <div className="flex items-center justify-center px-1.5 py-1.5 box-border border border-zinc-700 rounded-lg bg-zinc-800">
      <TerminalIcon size={18} className="text-white drop-shadow-sm" strokeWidth={1.6} />
    </div>
  );
}