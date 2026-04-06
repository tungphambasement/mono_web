"use client";

import { useEffect, useRef, useState } from "react";
import DraggableWindow from "./components/DraggableWindow";
import Terminal from "./components/Terminal";
import Wallpaper from "./components/Wallpaper";
import DockerLogs from "./components/DockerLogs";
import TransactionsLogs from "./components/TransactionsLogs";
import Taskbar from "./components/Taskbar";
import TerminalShortcut from "./components/TerminalShortcut";
import { useTaskbarState } from "./hooks/useTaskbarState";


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
  const taskbar = useTaskbarState(["terminal"]);
  const [logsPhase, setLogsPhase] = useState<"hidden" | "visible" | "freeze" | "fading">("hidden");
  const [introPlayed, setIntroPlayed] = useState(
    false
  );
  const screenRef = useRef<HTMLDivElement>(null);
  const logsTimersRef = useRef<ReturnType<typeof setTimeout>[]>([]);

  function handleTerminalTaskbarClick() {
    if (terminalState === "closed") {
      setTerminalState("visible");
      taskbar.open("terminal");
    } else if (terminalState === "minimized") {
      setTerminalState("visible");
      taskbar.focus("terminal");
    } else {
      setTerminalState("minimized");
      taskbar.blur();
    }
  }

  function triggerLogsFade() {
    // cancel any pending auto-fade timers
    logsTimersRef.current.forEach(clearTimeout);
    logsTimersRef.current = [];
    const t1 = setTimeout(() => setLogsPhase("freeze"), 0);
    const t2 = setTimeout(() => setLogsPhase("fading"), 50);
    const t3 = setTimeout(() => setLogsPhase("hidden"), 450);
    logsTimersRef.current = [t1, t2, t3];
  }

  // reveal decorative log panels shortly after boot, then auto-fade them out
  useEffect(() => {
    if (!desktopBooted) return;
    const timers: ReturnType<typeof setTimeout>[] = [];
    timers.push(setTimeout(() => setLogsPhase("visible"), 600));
    logsTimersRef.current = timers;
    return () => timers.forEach(clearTimeout);
  }, [desktopBooted]);

  return (
    <div className="relative flex-1 flex flex-col items-center" ref={screenRef}>

      {/* Decorative log panels */}
      {logsPhase !== "hidden" && (
        <>
          <DraggableWindow
            screenRef={screenRef}
            defaultWidth={DEFAULT_DOCKER_SIZE.width}
            defaultHeight={DEFAULT_DOCKER_SIZE.height}
            getInitialPos={DEFAULT_DOCKER_POS}
            style={logsPhase === "visible"
              ? { animationDelay: "0s" }
              : logsPhase === "freeze"
                ? { animation: "none", opacity: 1 }
                : { animation: "none", opacity: 0, transition: "opacity 400ms ease", pointerEvents: "none" }
            }
          >
            {(bag) => <DockerLogs {...bag} />}
          </DraggableWindow>

          <DraggableWindow
            screenRef={screenRef}
            defaultWidth={DEFAULT_TRANSACTIONS_SIZE.width}
            defaultHeight={DEFAULT_TRANSACTIONS_SIZE.height}
            getInitialPos={DEFAULT_TRANSACTIONS_POS}
            style={logsPhase === "visible"
              ? { animationDelay: "3s", animationFillMode: "both" }
              : logsPhase === "freeze"
                ? { animation: "none", opacity: 1 }
                : { animation: "none", opacity: 0, transition: "opacity 400ms ease", pointerEvents: "none" }
            }
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
            style={
              logsPhase === "fading"
                ? { opacity: 0, transition: "opacity 400ms ease", pointerEvents: "none" }
                : logsPhase === "freeze"
                  ? { opacity: 1 }
                  : undefined
            }
          >
            {({ onDragHandleMouseDown, isDragging, height }) => (
              <Terminal
                height={height}
                onDragHandleMouseDown={onDragHandleMouseDown}
                isDragging={isDragging}
                skipIntro={introPlayed}
                onIntroComplete={() => {
                  sessionStorage.setItem("introPlayed", "1");
                  setIntroPlayed(true);
                }}
                externalCommands={[
                  {
                    key: "boot",
                    description: "boot the desktop environment",
                    output: () => <span className="text-zinc-400">Booting desktop environment…</span>,
                    action: () => setDesktopBooted(true),
                  },
                  {
                    key: "finalize",
                    description: "close all windows",
                    action: () => {
                      sessionStorage.setItem("introPlayed", "1");
                      setIntroPlayed(true);
                      triggerLogsFade();
                      setTimeout(() => {
                        setTerminalState("closed");
                        taskbar.close("terminal");
                      }, 450);
                    },
                    output: () => <span className="text-zinc-400">Welcome user 8995...</span>,
                  },
                ]}
                onClose={() => { setTerminalState("closed"); taskbar.close("terminal"); }}
                onMinimize={() => { setTerminalState("minimized"); taskbar.blur(); }}
              />
            )}
          </DraggableWindow>
        </div>
      )}

      {/* Desktop environment */}
      {desktopBooted && (
        <div className="relative flex flex-1 w-full transition-opacity duration-1000 animate-fade-in">
          <Wallpaper />
          <Taskbar items={
            [{
              id: "terminal",
              icon: <TerminalShortcut />,
              label: "Terminal",
              isActive: taskbar.getStatus("terminal") !== "none",
              isFocused: taskbar.getStatus("terminal") === "focused",
              onClick: handleTerminalTaskbarClick,
            },
            ]
          } />
        </div>)
      }
    </div >
  );
}
