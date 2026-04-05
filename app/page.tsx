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
