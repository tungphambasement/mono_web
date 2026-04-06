"use client";

import { useEffect, useRef, useState } from "react";
import DraggableWindow from "./components/DraggableWindow";
import Terminal from "./components/Terminal";
import Wallpaper from "./components/Wallpaper";
import DockerLogs from "./components/DockerLogs";
import TransactionsLogs from "./components/TransactionsLogs";


type TerminalState = "visible" | "minimized" | "closed";

const DEFAULT_TERMINAL_STATE: TerminalState = "visible";
const DEFAULT_TERMINAL_SIZE = { width: 500, height: 240 };
const DEFAULT_TERMINAL_POS = (rect: DOMRect) => ({ x: rect.left + (rect.width * 0.1), y: rect.top + (rect.height * 1 / 4 - DEFAULT_TERMINAL_SIZE.height * 0.5) });
const DEFAULT_DOCKER_SIZE = { width: 440, height: 300 };
const DEFAULT_DOCKER_POS = (rect: DOMRect) => ({ x: rect.left + (rect.width * 0.05), y: rect.top + (rect.height * 0.5 - DEFAULT_DOCKER_SIZE.height * 0.5) });
const DEFAULT_TRANSACTIONS_SIZE = { width: 520, height: 280 };
const DEFAULT_TRANSACTIONS_POS = (rect: DOMRect) => ({ x: rect.left + (rect.width * 0.15), y: rect.top + (rect.height * 2 / 3 - DEFAULT_TRANSACTIONS_SIZE.height * 0.5) });

export default function Home() {
  const [desktopBooted, setDesktopBooted] = useState(false);
  const [terminalState, setTerminalState] = useState<TerminalState>(DEFAULT_TERMINAL_STATE);
  const [showLogs, setShowLogs] = useState(false);
  const screenRef = useRef<HTMLDivElement>(null);

  function handleTerminalTaskbarClick() {
    if (terminalState === "closed") {
      setTerminalState("visible");
    } else if (terminalState === "minimized") {
      setTerminalState("visible");
    } else {
      setTerminalState("minimized");
    }
  }

  // reveal decorative log panels shortly after boot
  useEffect(() => {
    if (!desktopBooted) return;
    const t = setTimeout(() => setShowLogs(true), 600);
    return () => clearTimeout(t);
  }, [desktopBooted]);

  return (
    <div className="relative flex-1 flex flex-col items-center" ref={screenRef}>

      {/* Decorative log panels */}
      {showLogs && (
        <>
          <DraggableWindow
            screenRef={screenRef}
            defaultWidth={DEFAULT_DOCKER_SIZE.width}
            defaultHeight={DEFAULT_DOCKER_SIZE.height}
            getInitialPos={DEFAULT_DOCKER_POS}
            style={{ animationDelay: "1s" }}
          >
            {(bag) => <DockerLogs {...bag} />}
          </DraggableWindow>

          <DraggableWindow
            screenRef={screenRef}
            defaultWidth={DEFAULT_TRANSACTIONS_SIZE.width}
            defaultHeight={DEFAULT_TRANSACTIONS_SIZE.height}
            getInitialPos={DEFAULT_TRANSACTIONS_POS}
            style={{ animationDelay: "4s", animationFillMode: "both" }}
          >
            {(bag) => <TransactionsLogs {...bag} />}
          </DraggableWindow>
        </>
      )}

      {/* Draggable terminal — hidden (not unmounted) when minimized */}
      {terminalState !== "closed" && (
        <div style={terminalState === "minimized" ? { display: "none" } : undefined}>
          <DraggableWindow
            screenRef={screenRef}
            defaultWidth={DEFAULT_TERMINAL_SIZE.width}
            defaultHeight={DEFAULT_TERMINAL_SIZE.height}
            getInitialPos={DEFAULT_TERMINAL_POS}
          >
            {({ onDragHandleMouseDown, isDragging, height }) => (
              <Terminal
                height={height}
                onDragHandleMouseDown={onDragHandleMouseDown}
                isDragging={isDragging}
                externalCommands={[
                  {
                    key: "boot",
                    description: "boot the desktop environment",
                    output: () => <span className="text-zinc-400">Booting desktop environment…</span>,
                    action: () => setDesktopBooted(true),
                  },
                ]}
                onClose={() => setTerminalState("closed")}
                onMinimize={() => setTerminalState("minimized")}
              />
            )}
          </DraggableWindow>
        </div>
      )}

      {/* Desktop environment */}
      {desktopBooted && (
        <div className="relative flex flex-1 w-full transition-opacity duration-1000 animate-fade-in">
          <Wallpaper />
        </div>)
      }
    </div >
  );
}
