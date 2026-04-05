"use client";

import { useRouter } from "next/navigation";
import { KeyboardEvent, ReactNode, useCallback, useEffect, useRef, useState } from "react";

const SCRIPT_COMMANDS = [
  "locate --engineer",
  "boot --desktop",
];

// Styled segments for each script command's output typing animation.
// Each segment has the text and the className that matches the real rendered output.
type OutputSegment = { text: string; className: string };
const SCRIPT_OUTPUT_SEGMENTS: OutputSegment[][] = [
  // locate --engineer
  [{ text: "Tung D. Pham found at /rochester/swe", className: "text-zinc-300" }],
  // boot --desktop
  [{ text: "Booting desktop environment…", className: "text-zinc-400" }],
];

const PROMPT_SPEED = 60;   // ms per character
const OUTPUT_SPEED = 30;   // ms per character for output typing animation
const PAUSE_AFTER_TYPE = 150;  // ms after fully typed, before "Enter"
const PAUSE_AFTER_CMD = 300;  // ms after output appears, before next command

const COMMAND_HELP: Record<string, string> = {
  help: "show available commands",
  boot: "boot the desktop environment",
  about: "who I am",
  skills: "tech stack & tools",
  experience: "work history",
  projects: "things I've built",
  contact: "get in touch",
  locate: "find the engineer",
  ls: "list filesystem",
  cat: "read a file  (try: cat README.md)",
  cd: "navigate     (try: cd projects)",
  git: "git commands (try: git log)",
  whoami: "identify yourself",
  echo: "print text",
  pwd: "print working directory",
  clear: "clear the terminal",
};

export type ExternalCommandDef = {
  description?: string;
  output?: ReactNode;
  action: () => void;
};

const ALL_COMMANDS = Object.keys(COMMAND_HELP);

function renderCommandOutput(
  cmd: string,
  args: string[],
  nav: (path: string) => void,
  externalCommands: Record<string, ExternalCommandDef> = {},
): ReactNode {
  switch (cmd) {
    case "":
      return null;

    case "help": {
      const extEntries = Object.entries(externalCommands).filter(([, v]) => v.description);
      return (
        <div className="space-y-0.5">
          <div className="text-zinc-500 mb-1">Available commands:</div>
          {Object.entries(COMMAND_HELP).map(([c, desc]) => (
            <div key={c}>
              <span className="text-zinc-200 inline-block w-24">{c}</span>
              <span className="text-zinc-500">{desc}</span>
            </div>
          ))}
          {extEntries.length > 0 && (
            <>
              <div className="text-zinc-600 mt-1 mb-0.5 text-xs">― external ―</div>
              {extEntries.map(([c, { description }]) => (
                <div key={c}>
                  <span className="text-zinc-200 inline-block w-24">{c}()</span>
                  <span className="text-zinc-500">{description}</span>
                </div>
              ))}
            </>
          )}
          <div className="text-zinc-600 mt-1 text-xs">↑↓ history · Tab autocomplete · Ctrl+L clear</div>
        </div>
      );
    }

    case "locate":
      return <div className="text-zinc-300">Tung D. Pham found at /rochester/swe</div>;

    case "about":
      return (
        <div className="space-y-0.5">
          {(
            [
              ["Name", "Tung D. Pham"],
              ["School", "University of Rochester — B.S. Computer Science"],
              ["Grad", "May 2028"],
              ["Focus", "Systems · Backend · HPC"],
            ] as [string, string][]
          ).map(([k, v]) => (
            <div key={k}>
              <span className="text-zinc-500 inline-block w-16">{k}</span>
              <span className="text-zinc-200">{v}</span>
            </div>
          ))}
        </div>
      );

    case "languages":
      return (
        <div className="space-y-0.5">
          {(
            [
              ["Languages", "C++ · TypeScript · Java · Python · Rust"],
            ] as [string, string][]
          ).map(([k, v]) => (
            <div key={k}>
              <span className="text-zinc-500">{k} </span> {/* with a space */}
              <span className="text-zinc-200">{v}</span>
            </div>
          ))}
        </div>
      );

    case "experience":
      return (
        <div className="space-y-2">
          <div className="text-zinc-600 text-xs"># placeholder — update in TerminalHero.tsx</div>
          <div>
            <div className="text-zinc-200 font-medium">Role · Company Name</div>
            <div className="text-zinc-500 text-xs">Month YYYY – Month YYYY</div>
            <div className="text-zinc-400 mt-0.5">Brief description of what you worked on.</div>
          </div>
        </div>
      );

    case "projects":
      return (
        <div className="space-y-1.5">
          <div className="text-zinc-600 text-xs"># placeholder — update in TerminalHero.tsx</div>
          {(
            [
              ["project-alpha", "Short description of what it does"],
              ["project-beta", "Short description of what it does"],
            ] as [string, string][]
          ).map(([name, desc]) => (
            <div key={name}>
              <span className="text-zinc-200">{name}</span>
              <span className="text-zinc-500">  —  {desc}</span>
            </div>
          ))}
          <div className="text-zinc-600 text-xs">Type `cd projects` to navigate to the projects page.</div>
        </div>
      );

    case "contact":
      return (
        <div className="space-y-0.5">
          {(
            [
              ["Email", "mailto:tungphamdoan2509@gmail.com", "tungphamdoan2509@gmail.com"],
            ] as [string, string, string][]
          ).map(([label, href, display]) => (
            <div key={label}>
              <span className="text-zinc-500 inline-block w-24">{label}</span>
              <a href={href} className="text-blue-400 hover:underline">{display}</a>
            </div>
          ))}
        </div>
      );

    case "ls": {
      const entries: [string, string][] = [
        ["drwxr-xr-x", "experiences/"],
        ["drwxr-xr-x", "projects/"],
        ["-rw-r--r--", "README.md"],
        ["-rw-r--r--", "resume.pdf"],
        ["-rw-r--r--", "skills.json"],
        ["-rw-r--r--", "status.txt"],
      ];
      return (
        <div>
          {entries.map(([perms, name]) => (
            <div key={name}>
              <span className="text-zinc-600">{perms}{"  "}</span>
              <span className={name.endsWith("/") ? "text-blue-400" : "text-zinc-200"}>{name}</span>
            </div>
          ))}
        </div>
      );
    }

    case "cat": {
      const file = args[0] ?? "";
      if (file === "") return <div className="text-red-400">cat: missing operand</div>;
      const files: Record<string, ReactNode> = {
        "README.md": (
          <div className="space-y-1">
            <div className="text-green-400"># Tung D. Pham — Software Engineer</div>
            <div className="text-zinc-400">CS student at the University of Rochester, graduating May 2026.</div>
            <div className="text-zinc-400">Building fast, reliable systems at the intersection of</div>
            <div className="text-zinc-400">distributed computing and developer tooling.</div>
            <div className="text-zinc-600 mt-1">Type `help` to explore available commands.</div>
          </div>
        ),
        "status.txt": <div className="text-zinc-200">🟢 Open to full-time SWE roles · May 2026</div>,
        "skills.json": (
          <pre className="text-zinc-400 text-xs leading-relaxed whitespace-pre-wrap">
            {JSON.stringify(
              { languages: ["C++", "TypeScript", "Java", "Python", "Rust"], backend: ["Node.js", "gRPC", "REST"], infra: ["Docker", "Linux"] },
              null, 2,
            )}
          </pre>
        ),
        "resume.pdf": (
          <div className="text-zinc-400">
            Opening resume…{" "}
            <a href="#" className="text-blue-400 hover:underline">download</a>
          </div>
        ),
      };
      return files[file] ?? <div className="text-red-400">cat: {file}: No such file or directory</div>;
    }

    case "cd": {
      const dir = args[0] ?? "";
      if (!dir || dir === "~" || dir === "." || dir === ".." || dir === "/home/tung") return null;
      if (dir === "experiences" || dir === "/experiences") {
        setTimeout(() => nav("/experiences"), 500);
        return <div className="text-zinc-400">Navigating to /experiences…</div>;
      }
      if (dir === "projects" || dir === "/projects") {
        setTimeout(() => nav("/projects"), 500);
        return <div className="text-zinc-400">Navigating to /projects…</div>;
      }
      return <div className="text-red-400">cd: {dir}: No such file or directory</div>;
    }

    case "git": {
      const sub = args[0];
      if (sub === "log") {
        return (
          <div className="space-y-1 text-xs">
            {(
              [
                ["a3f2d1b", "feat: add interactive CLI to landing page"],
                ["9c1e4a0", "fix: blinking cursor timing"],
                ["7b8f3c2", "feat: portfolio v2 — new design system"],
                ["3d1a9f4", "init: initial commit"],
              ] as [string, string][]
            ).map(([hash, msg]) => (
              <div key={hash}>
                <span className="text-yellow-500">{hash}{"  "}</span>
                <span className="text-zinc-400">{msg}</span>
              </div>
            ))}
          </div>
        );
      }
      if (sub === "status") {
        return (
          <div className="space-y-0.5">
            <div className="text-zinc-400">On branch <span className="text-yellow-500">main</span></div>
            <div className="text-zinc-400">Your branch is up to date with &apos;origin/main&apos;.</div>
            <div className="text-green-400 mt-1">nothing to commit, working tree clean</div>
          </div>
        );
      }
      return <div className="text-zinc-500">Available: git log · git status</div>;
    }

    case "whoami":
      return <div className="text-zinc-200">visitor</div>;

    case "echo":
      return <div className="text-zinc-200">{args.join(" ")}</div>;

    case "pwd":
      return <div className="text-zinc-200">/home/tung</div>;

    case "uname":
    case "hostname":
      return <div className="text-zinc-200">tung-portfolio</div>;

    case "sudo":
      return <div className="text-red-400">[sudo] password for tung: Permission denied.</div>;

    case "rm":
      return <div className="text-zinc-500">rm: this is a portfolio, nothing to delete here.</div>;

    case "exit":
    case "logout":
      return <div className="text-zinc-500">Nice try. The terminal persists.</div>;

    case "vim":
    case "vi":
    case "nano":
      return <div className="text-zinc-500">Opening {cmd}… just kidding. This is a portfolio terminal.</div>;

    case "curl":
    case "wget":
      return <div className="text-zinc-500">{cmd}: network access not available in this environment.</div>;

    default:
      return (
        <div className="text-red-400">
          zsh: command not found: {cmd}
          <span className="text-zinc-600 ml-2 text-xs">(type `help` for available commands)</span>
        </div>
      );
  }
}

type HistoryEntry = { prompt: string; output: ReactNode };

interface TerminalProps {
  height: number;
  onDragHandleMouseDown: (e: React.MouseEvent) => void;
  isDragging: boolean;
  externalCommands?: Record<string, ExternalCommandDef>;
  onClose?: () => void;
  onMinimize?: () => void;
}

export default function Terminal({ height, onDragHandleMouseDown, isDragging, externalCommands = {}, onClose, onMinimize }: TerminalProps) {
  const router = useRouter();
  const nav = useCallback((p: string) => router.push(p), [router]);

  // unified shell state
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [currentInput, setCurrentInput] = useState("");
  const [cmdHistory, setCmdHistory] = useState<string[]>([]);
  const [cmdHistoryIdx, setCmdHistoryIdx] = useState(-1);

  // script (intro) state
  const [scriptIdx, setScriptIdx] = useState(0);
  const [scriptPhase, setScriptPhase] = useState<"typing" | "waiting" | "outputTyping" | "done">("typing");
  const scriptTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const pendingPromptRef = useRef("");
  const pendingSegmentsRef = useRef<OutputSegment[]>([]);
  const pendingNodeRef = useRef<ReactNode>(null);
  const [typedOutputLen, setTypedOutputLen] = useState(0);

  const inputRef = useRef<HTMLInputElement>(null);
  const bodyRef = useRef<HTMLDivElement>(null);

  const isInteractive = scriptPhase === "done";

  /* Intro script effect */
  useEffect(() => {
    if (scriptPhase === "done") return;

    if (scriptIdx >= SCRIPT_COMMANDS.length) {
      setScriptPhase("done");
      return;
    }

    const cmd = SCRIPT_COMMANDS[scriptIdx];

    if (scriptPhase === "typing") {
      if (currentInput.length < cmd.length) {
        // type next character
        scriptTimerRef.current = setTimeout(
          () => setCurrentInput(cmd.slice(0, currentInput.length + 1)),
          PROMPT_SPEED,
        );
      } else {
        // command fully typed — wait, then "press Enter"
        scriptTimerRef.current = setTimeout(
          () => setScriptPhase("waiting"),
          PAUSE_AFTER_TYPE,
        );
      }
    } else if (scriptPhase === "waiting") {
      scriptTimerRef.current = setTimeout(() => {
        const trimmed = currentInput.trim();
        const [cmdRaw = "", ...args] = trimmed.split(/\s+/);
        const cmd = cmdRaw.replace(/\(\)$/, "").toLowerCase();
        pendingPromptRef.current = trimmed;
        pendingSegmentsRef.current = SCRIPT_OUTPUT_SEGMENTS[scriptIdx] ?? [];
        // Fire external action if matched
        if (externalCommands[cmd]) {
          externalCommands[cmd].action();
          pendingNodeRef.current = externalCommands[cmd].output ?? null;
        } else {
          pendingNodeRef.current = renderCommandOutput(cmd, args, nav, externalCommands);
        }
        setCurrentInput("");
        setTypedOutputLen(0);
        setScriptPhase("outputTyping");
      }, PAUSE_AFTER_CMD);
    } else if (scriptPhase === "outputTyping") {
      const totalLen = pendingSegmentsRef.current.reduce((s, seg) => s + seg.text.length, 0);
      if (typedOutputLen < totalLen) {
        scriptTimerRef.current = setTimeout(
          () => setTypedOutputLen((n) => n + 1),
          OUTPUT_SPEED,
        );
      } else {
        scriptTimerRef.current = setTimeout(() => {
          setHistory((prev) => [
            ...prev,
            { prompt: pendingPromptRef.current, output: pendingNodeRef.current },
          ]);
          setCmdHistory((prev) => [pendingPromptRef.current, ...prev]);
          setTypedOutputLen(0);
          setScriptIdx((i) => i + 1);
          setScriptPhase("typing");
        }, PAUSE_AFTER_CMD);
      }
    }

    return () => { if (scriptTimerRef.current) clearTimeout(scriptTimerRef.current); };
  }, [scriptPhase, scriptIdx, currentInput, nav, typedOutputLen, externalCommands]);

  useEffect(() => {
    if (isInteractive) inputRef.current?.focus();
  }, [isInteractive]);

  useEffect(() => {
    if (bodyRef.current) bodyRef.current.scrollTop = bodyRef.current.scrollHeight;
  }, [history, height]);

  function executeCommand(raw: string) {
    const trimmed = raw.trim();
    // Strip trailing () so `physics.play()` and `physics.play` both work
    const [cmdRaw = "", ...args] = trimmed.split(/\s+/);
    const cmd = cmdRaw.replace(/\(\)$/, "").toLowerCase();

    if (cmd === "clear") {
      setHistory([]);
      setCurrentInput("");
      setCmdHistoryIdx(-1);
      return;
    }

    if (trimmed !== "") setCmdHistory((prev) => [trimmed, ...prev]);

    if (externalCommands[cmd]) {
      const { action, output = null } = externalCommands[cmd];
      action();
      setHistory((prev) => [...prev, { prompt: trimmed, output }]);
      setCurrentInput("");
      setCmdHistoryIdx(-1);
      return;
    }

    const output = renderCommandOutput(cmd, args, nav, externalCommands);
    setHistory((prev) => [...prev, { prompt: trimmed, output }]);
    setCurrentInput("");
    setCmdHistoryIdx(-1);
  }

  function handleKeyDown(e: KeyboardEvent<HTMLInputElement>) {
    switch (e.key) {
      case "Enter":
        e.preventDefault();
        executeCommand(currentInput);
        break;

      case "ArrowUp":
        e.preventDefault();
        if (cmdHistory.length > 0) {
          const idx = Math.min(cmdHistoryIdx + 1, cmdHistory.length - 1);
          setCmdHistoryIdx(idx);
          setCurrentInput(cmdHistory[idx]);
        }
        break;

      case "ArrowDown":
        e.preventDefault();
        if (cmdHistoryIdx <= 0) {
          setCmdHistoryIdx(-1);
          setCurrentInput("");
        } else {
          const idx = cmdHistoryIdx - 1;
          setCmdHistoryIdx(idx);
          setCurrentInput(cmdHistory[idx]);
        }
        break;

      case "Tab": {
        e.preventDefault();
        const partial = currentInput.trim().toLowerCase();
        if (!partial || partial.includes(" ")) break;
        const allCmds = [...ALL_COMMANDS, ...Object.keys(externalCommands)];
        const matches = allCmds.filter((c) => c.startsWith(partial));
        if (matches.length === 1) setCurrentInput(matches[0]);
        break;
      }

      case "l":
        if (e.ctrlKey) {
          e.preventDefault();
          setHistory([]);
        }
        break;
    }
  }

  return (
    <div className="rounded-lg border border-zinc-800 overflow-hidden shadow-lg relative">
      <div
        className={`flex items-center gap-1.5 px-4 py-3 bg-zinc-900 border-b border-zinc-800 select-none ${isDragging ? "cursor-grabbing" : "cursor-default"}`}
        onMouseDown={onDragHandleMouseDown}
      >
        <button
          onClick={onClose}
          className="w-3 h-3 rounded-full bg-red-500 hover:brightness-75 transition-[filter] focus:outline-none"
          aria-label="Close terminal"
        />
        <button
          onClick={onMinimize}
          className="w-3 h-3 rounded-full bg-yellow-500 hover:brightness-75 transition-[filter] focus:outline-none"
          aria-label="Minimize terminal"
        />
        <span className="w-3 h-3 rounded-full bg-green-500" />
        <span className="ml-2 text-xs text-zinc-500 font-mono select-none">tung@portfolio:~</span>
      </div>

      {/* Body */}
      <div
        ref={bodyRef}
        className="bg-zinc-950 px-5 py-5 font-mono text-sm overflow-y-scroll cursor-text styled-scrollbar"
        style={{ height }}
        onClick={() => isInteractive && inputRef.current?.focus()}
      >
        {/* All executed commands — script replay and interactive unified */}
        {history.map((entry, i) => (
          <div key={i} className="mb-3">
            <div className="flex items-start">
              <span className="text-zinc-500 select-none mr-1.5 shrink-0">{">"}</span>
              <span className="text-zinc-300">{entry.prompt}</span>
            </div>
            {entry.output != null && (
              <div className="pl-4 text-zinc-400 mt-1">{entry.output}</div>
            )}
          </div>
        ))}

        {/* Output being typed during script phase */}
        {scriptPhase === "outputTyping" && (
          <div className="mb-3">
            <div className="flex items-start">
              <span className="text-zinc-500 select-none mr-1.5 shrink-0">{">"}</span>
              <span className="text-zinc-300">{pendingPromptRef.current}</span>
            </div>
            <div className="pl-4 mt-1">
              {(() => {
                let remaining = typedOutputLen;
                return pendingSegmentsRef.current.map((seg, i) => {
                  if (remaining <= 0) return null;
                  const visible = seg.text.slice(0, remaining);
                  remaining -= seg.text.length;
                  return <span key={i} className={seg.className}>{visible}</span>;
                });
              })()}
              <span className="text-zinc-300 animate-blink">█</span>
            </div>
          </div>
        )}

        {/* Divider once script ends */}
        {isInteractive && (
          <div className="text-zinc-700 text-xs mb-2 mt-1 select-none">
            — interactive · type <span className="text-zinc-500">help</span> to explore —
          </div>
        )}

        {/* Live input line */}
        {scriptPhase !== "outputTyping" && <div className="flex items-start mt-1">
          <span className="text-zinc-500 select-none mr-1.5 shrink-0">{">"}</span>
          <div className="relative flex-1 min-w-0">
            {isInteractive && (
              <input
                ref={inputRef}
                type="text"
                value={currentInput}
                onChange={(e) => { setCurrentInput(e.target.value); setCmdHistoryIdx(-1); }}
                onKeyDown={handleKeyDown}
                className="absolute inset-0 opacity-0 w-full h-full"
                autoComplete="off"
                autoCorrect="off"
                autoCapitalize="off"
                spellCheck={false}
                aria-label="terminal input"
              />
            )}
            <span className="text-zinc-300 pointer-events-none break-all">{currentInput}</span>
            <span className="text-zinc-300 animate-blink pointer-events-none">█</span>
          </div>
        </div>}
      </div>
    </div>
  );
}
