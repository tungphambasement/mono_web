"use client";

import dynamic from "next/dynamic";
import { useRef, useState } from "react";
import {
  FolderOpen,
  Globe,
  Settings,
  TerminalSquare,
} from "lucide-react";
import DraggableTerminal from "./components/DraggableTerminal";
import DesktopIcon from "./components/DesktopIcon";

const PhysicsOverlay = dynamic(() => import("./components/PhysicsOverlay"), { ssr: false });

type TerminalState = "visible" | "minimized" | "closed";

export default function Home() {
  const [desktopBooted, setDesktopBooted] = useState(false);
  const [terminalState, setTerminalState] = useState<TerminalState>("visible");
  const screenRef = useRef<HTMLDivElement>(null);

  return (
    <div className="relative flex-1 flex flex-col items-center" ref={screenRef}>
      {/* Physics wallpaper */}
      {desktopBooted && <PhysicsOverlay />}
      {/* Desktop icons */}
      {desktopBooted && (
        <div className="absolute top-5 left-5 z-10 flex flex-col gap-4 my-8">
          <DesktopIcon
            icon={<TerminalSquare size={22} className="text-green-400" />}
            label="Terminal"
            active={terminalState === "visible"}
            onClick={() => setTerminalState("visible")}
          />
          <DesktopIcon
            icon={<FolderOpen size={22} className="text-blue-300" />}
            label="Files"
            onClick={() => { }}
          />
          <DesktopIcon
            icon={<Globe size={22} className="text-sky-400" />}
            label="Browser"
            onClick={() => { }}
          />
          <DesktopIcon
            icon={<Settings size={22} className="text-zinc-300" />}
            label="Settings"
            onClick={() => { }}
          />
        </div>
      )}

      {/* Draggable terminal — hidden (not unmounted) when minimized */}
      {terminalState !== "closed" && (
        <div style={terminalState === "minimized" ? { display: "none" } : undefined}>
          <DraggableTerminal
            screenRef={screenRef}
            onClose={() => setTerminalState("closed")}
            onMinimize={() => setTerminalState("minimized")}
            externalCommands={[
              {
                key: "boot",
                description: "boot the desktop environment",
                output: () => <span className="text-zinc-400">Booting desktop environment…</span>,
                action: () => setDesktopBooted(true),
              },
            ]}
          />
        </div>
      )}

    </div>
  );
}
