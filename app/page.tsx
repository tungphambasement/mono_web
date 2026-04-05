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
    <div className="w-full flex flex-col items-center">
      <div
        className="w-full rounded-m overflow-hidden"
      >
        {/* Screen */}
        <div
          ref={screenRef}
          className="relative overflow-hidden rounded-lg"
          style={{
            background: desktopBooted ? undefined : "#000",
            minHeight: 480,
            height: "calc(100vh - 220px)",
          }}
        >
          {/* Physics wallpaper */}
          {desktopBooted && <PhysicsOverlay />}

          {/* Desktop icons */}
          {desktopBooted && (
            <div className="absolute top-5 left-5 z-10 flex flex-col gap-4">
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

          {/* Taskbar — always visible once desktop booted */}
          {desktopBooted && (
            <div
              className="absolute bottom-0 inset-x-0 z-20 flex items-center gap-2 px-3"
              style={{
                height: 44,
                background: "rgba(153, 153, 153, 0.23)",
                backdropFilter: "blur(12px)",
                borderTop: "1px solid rgba(255,255,255,0.07)",
              }}
            >
              {terminalState === "minimized" && (
                <button
                  onClick={() => setTerminalState("visible")}
                  className="flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-mono
                    text-zinc-200 bg-white/10 hover:bg-white/20 transition-colors duration-150"
                >
                  <TerminalSquare size={13} />
                  Terminal
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
