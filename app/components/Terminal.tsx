"use client";

import { useRouter } from "next/navigation";
import { KeyboardEvent, ReactNode, useCallback, useEffect, useRef, useState } from "react";

//  Types & Interfaces 

export type OutputSegment = { text: string; className: string };

export type CommandArgsDef = {
  key: string; // the argument string to type, e.g. `--verbose` or `<filename>`
  description: string; // brief description of what the arg does
  required?: boolean;
};

export type CommandContext = {
  nav: (path: string) => void;
  parameters: Record<string, string>;
};

export type CommandDef = {
  key: string;
  description: string;
  args?: CommandArgsDef[];
  output?: (context: CommandContext) => ReactNode;
  action?: (context: CommandContext) => void;
};


type ScriptEntry = {
  command: string;
  outputSegments: OutputSegment[];
  promptSpeed?: number;
  outputSpeed?: number;
  pauseAfterType?: number;
  pauseAfterCmd?: number;
  pauseAfterExecution?: number;
};

//  Constants & Config 

const SCRIPT: ScriptEntry[] = [
  {
    command: "locate --engineer",
    outputSegments: [{ text: "Tung D. Pham found at /rochester/swe", className: "text-zinc-300" }],
  },
  {
    command: "boot --desktop",
    outputSegments: [{ text: "Booting desktop environment…", className: "text-zinc-400" }],
  },
  {
    command: "finalize --environment",
    outputSegments: [{ text: "Welcome user 8995…", className: "text-zinc-500" }],
  },
];

const PROMPT_SPEED = 60;
const OUTPUT_SPEED = 30;
const PAUSE_AFTER_TYPE = 150;
const PAUSE_AFTER_CMD = 400;
const PAUSE_AFTER_EXECUTION = 100;

//  Command Definitions 
const DEFAULT_COMMANDS: CommandDef[] = [
  {
    key: "help",
    description: "show available commands",
    output: () => null, // Help output is uniquely handled inside the component to access externalCommands
  },
  {
    key: "boot",
    description: "boot the desktop environment",
  },
  {
    key: "about",
    description: "who I am",
    output: () => (
      <div className="space-y-0.5">
        {[
          ["Name", "Tung D. Pham"],
          ["School", "University of Rochester — B.S. Computer Science"],
          ["Grad", "May 2028"],
          ["Focus", "Systems · Backend · HPC"],
        ].map(([k, v]) => (
          <div key={k}>
            <span className="text-zinc-500 inline-block w-16">{k}</span>
            <span className="text-zinc-200">{v}</span>
          </div>
        ))}
      </div>
    ),
  },
  {
    key: "languages",
    description: "tech stack & tools",
    output: () => (
      <div className="space-y-0.5">
        <div key="Languages">
          <span className="text-zinc-500">Languages </span>
          <span className="text-zinc-200">C++ · TypeScript · Java · Python · Rust</span>
        </div>
      </div>
    ),
  },
  {
    key: "experience",
    description: "work history",
    output: () => (
      <div className="space-y-2">
        <div className="text-zinc-600 text-xs"># placeholder — update in TerminalHero.tsx</div>
        <div>
          <div className="text-zinc-200 font-medium">Role · Company Name</div>
          <div className="text-zinc-500 text-xs">Month YYYY – Month YYYY</div>
          <div className="text-zinc-400 mt-0.5">Brief description of what you worked on.</div>
        </div>
      </div>
    ),
  },
  {
    key: "projects",
    description: "things I've built",
    output: () => (
      <div className="space-y-1.5">
        <div className="text-zinc-600 text-xs"># placeholder — update in TerminalHero.tsx</div>
        {[
          ["project-alpha", "Short description of what it does"],
          ["project-beta", "Short description of what it does"],
        ].map(([name, desc]) => (
          <div key={name}>
            <span className="text-zinc-200">{name}</span>
            <span className="text-zinc-500">  —  {desc}</span>
          </div>
        ))}
        <div className="text-zinc-600 text-xs">Type `cd projects` to navigate to the projects page.</div>
      </div>
    ),
  },
  {
    key: "contact",
    description: "get in touch",
    output: () => (
      <div className="space-y-0.5">
        <div key="Email">
          <span className="text-zinc-500 inline-block w-24">Email</span>
          <a href="mailto:tungphamdoan2509@gmail.com" className="text-blue-400 hover:underline">
            tungphamdoan2509@gmail.com
          </a>
        </div>
      </div>
    ),
  },
  {
    key: "locate",
    description: "find the engineer",
    output: () => <div className="text-zinc-300">Tung D. Pham found at /rochester/swe</div>,
  },
  {
    key: "ls",
    description: "list filesystem",
    output: () => (
      <div>
        {[
          ["drwxr-xr-x", "experiences/"],
          ["drwxr-xr-x", "projects/"],
          ["-rw-r--r--", "README.md"],
          ["-rw-r--r--", "resume.pdf"],
          ["-rw-r--r--", "skills.json"],
          ["-rw-r--r--", "status.txt"],
        ].map(([perms, name]) => (
          <div key={name}>
            <span className="text-zinc-600">{perms}{"  "}</span>
            <span className={name.endsWith("/") ? "text-blue-400" : "text-zinc-200"}>{name}</span>
          </div>
        ))}
      </div>
    ),
  },
  {
    key: "cat",
    description: "read a file (try: cat README.md)",
    args: [{ key: "<filename>", description: "File to read", required: true }],
    output: ({ parameters }) => {
      const file = parameters["<filename>"] || parameters["0"] || "";
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
            {JSON.stringify({ languages: ["C++", "TypeScript", "Java", "Python", "Rust"], backend: ["Node.js", "gRPC", "REST"], infra: ["Docker", "Linux"] }, null, 2)}
          </pre>
        ),
        "resume.pdf": (
          <div className="text-zinc-400">
            Opening resume… <a href="#" className="text-blue-400 hover:underline">download</a>
          </div>
        ),
      };
      return files[file] ?? <div className="text-red-400">cat: {file}: No such file or directory</div>;
    },
  },
  {
    key: "cd",
    description: "navigate (try: cd projects)",
    args: [{ key: "<directory>", description: "Directory to enter", required: true }],
    action: ({ parameters, nav }) => {
      const dir = parameters["<directory>"] || parameters["0"] || "";
      if (dir === "experiences" || dir === "/experiences") setTimeout(() => nav("/experiences"), 500);
      if (dir === "projects" || dir === "/projects") setTimeout(() => nav("/projects"), 500);
    },
    output: ({ parameters }) => {
      const dir = parameters["<directory>"] || parameters["0"] || "";
      if (!dir || dir === "~" || dir === "." || dir === ".." || dir === "/home/tung") return null;
      if (dir === "experiences" || dir === "/experiences") return <div className="text-zinc-400">Navigating to /experiences…</div>;
      if (dir === "projects" || dir === "/projects") return <div className="text-zinc-400">Navigating to /projects…</div>;
      return <div className="text-red-400">cd: {dir}: No such file or directory</div>;
    },
  },
  {
    key: "git",
    description: "git commands (try: git log)",
    args: [{ key: "<subcommand>", description: "Git action (log, status)", required: true }],
    output: ({ parameters }) => {
      const sub = parameters["<subcommand>"] || parameters["0"];
      if (sub === "log") {
        return (
          <div className="space-y-1 text-xs">
            {[
              ["a3f2d1b", "feat: add interactive CLI to landing page"],
              ["9c1e4a0", "fix: blinking cursor timing"],
              ["7b8f3c2", "feat: portfolio v2 — new design system"],
              ["3d1a9f4", "init: initial commit"],
            ].map(([hash, msg]) => (
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
    },
  },
  { key: "whoami", description: "identify yourself", output: () => <div className="text-zinc-200">visitor</div> },
  {
    key: "echo", description: "print text", output: ({ parameters }) => {
      // Reconstruct all positional parameters for echo
      const text = Object.entries(parameters)
        .filter(([k]) => !isNaN(Number(k)))
        .map(([, v]) => v)
        .join(" ");
      return <div className="text-zinc-200">{text}</div>;
    }
  },
  { key: "pwd", description: "print working directory", output: () => <div className="text-zinc-200">/home/tung</div> },
  { key: "clear", description: "clear the terminal" }, // Executed separately in `executeCommand`
  { key: "uname", description: "print system info", output: () => <div className="text-zinc-200">tung-portfolio</div> },
  { key: "hostname", description: "print system hostname", output: () => <div className="text-zinc-200">tung-portfolio</div> },
  { key: "sudo", description: "execute a command as superuser", output: () => <div className="text-red-400">[sudo] password for tung: Permission denied.</div> },
  { key: "rm", description: "remove files or directories", output: () => <div className="text-zinc-500">rm: this is a portfolio, nothing to delete here.</div> },
  { key: "exit", description: "cause normal process termination", output: () => <div className="text-zinc-500">Nice try. The terminal persists.</div> },
  { key: "logout", description: "log out of the system", output: () => <div className="text-zinc-500">Nice try. The terminal persists.</div> },
  { key: "vim", description: "vi IMproved, a programmer's text editor", output: () => <div className="text-zinc-500">Opening vim… just kidding. This is a portfolio terminal.</div> },
  { key: "vi", description: "programmer's text editor", output: () => <div className="text-zinc-500">Opening vi… just kidding. This is a portfolio terminal.</div> },
  { key: "nano", description: "nano's another editor", output: () => <div className="text-zinc-500">Opening nano… just kidding. This is a portfolio terminal.</div> },
  { key: "curl", description: "transfer a URL", output: () => <div className="text-zinc-500">curl: network access not available in this environment.</div> },
  { key: "wget", description: "the non-interactive network downloader", output: () => <div className="text-zinc-500">wget: network access not available in this environment.</div> },
];

const ALL_COMMAND_KEYS = DEFAULT_COMMANDS.map(c => c.key);

//  Component 

type HistoryEntry = { prompt: string; output: ReactNode };

interface TerminalProps {
  height: number;
  onDragHandleMouseDown: (e: React.MouseEvent) => void;
  isDragging: boolean;
  externalCommands?: CommandDef[];
  onClose?: () => void;
  onMinimize?: () => void;
  skipIntro?: boolean;
  onIntroComplete?: () => void;
}

export default function Terminal({ height, onDragHandleMouseDown, isDragging, externalCommands = [], onClose, onMinimize, skipIntro = false, onIntroComplete }: TerminalProps) {
  const router = useRouter();
  const nav = useCallback((p: string) => router.push(p), [router]);

  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [currentInput, setCurrentInput] = useState("");
  const [cmdHistory, setCmdHistory] = useState<string[]>([]);
  const [cmdHistoryIdx, setCmdHistoryIdx] = useState(-1);

  const [scriptIdx, setScriptIdx] = useState(() => skipIntro ? SCRIPT.length : 0);
  const [scriptPhase, setScriptPhase] = useState<"typing" | "waiting" | "outputTyping" | "executing" | "done">(() => skipIntro ? "done" : "typing");
  const scriptTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const pendingPromptRef = useRef("");
  const pendingSegmentsRef = useRef<OutputSegment[]>([]);
  const pendingNodeRef = useRef<ReactNode>(null);
  const pendingCmdRef = useRef<{ cmdRaw: string; args: string[] } | null>(null);
  const [typedOutputLen, setTypedOutputLen] = useState(0);

  const inputRef = useRef<HTMLInputElement>(null);
  const bodyRef = useRef<HTMLDivElement>(null);
  const [isFocused, setIsFocused] = useState(false);

  const isInteractive = scriptPhase === "done";

  // Renders the dynamic help menu based on definitions
  const renderHelpOutput = useCallback(() => {
    return (
      <div className="space-y-0.5">
        <div className="text-zinc-500 mb-1">Available commands:</div>
        {DEFAULT_COMMANDS.map((cmd) => (
          <div key={cmd.key}>
            <span className="text-zinc-200 inline-block w-24">{cmd.key}</span>
            <span className="text-zinc-500">{cmd.description}</span>
          </div>
        ))}
        {externalCommands.length > 0 && (
          <>
            <div className="text-zinc-600 mt-1 mb-0.5 text-xs">― external ―</div>
            {externalCommands.map((cmd) => (
              <div key={cmd.key}>
                <span className="text-zinc-200 inline-block w-24">{cmd.key}</span>
                <span className="text-zinc-500">{cmd.description}</span>
              </div>
            ))}
          </>
        )}
        <div className="text-zinc-600 mt-1 text-xs">↑↓ history · Tab autocomplete · Ctrl+L clear</div>
      </div>
    );
  }, [externalCommands]);

  const getCommandOutput = useCallback((cmdRaw: string, rawArgs: string[]): ReactNode => {
    const cmdKey = cmdRaw.replace(/\(\)$/, "").toLowerCase();

    if (cmdKey === "") return null;
    if (cmdKey === "help") return renderHelpOutput();

    const extDef = externalCommands.find(c => c.key === cmdKey);
    const def = extDef ?? DEFAULT_COMMANDS.find(c => c.key === cmdKey);

    if (def) {
      // Parse arguments into a mapped parameters object
      const parameters: Record<string, string> = {};
      rawArgs.forEach((arg, i) => {
        parameters[i.toString()] = arg; // Always save positional fallback
        if (def.args && def.args[i]) {
          parameters[def.args[i].key] = arg; // Map to human-readable key
        }
      });

      if (def.output) return def.output({ nav, parameters });
      return null;
    }

    return (
      <div className="text-red-400">
        zsh: command not found: {cmdKey}
        <span className="text-zinc-600 ml-2 text-xs">(type `help` for available commands)</span>
      </div>
    );
  }, [nav, externalCommands, renderHelpOutput]);

  const runCommandAction = useCallback((cmdRaw: string, rawArgs: string[]): void => {
    const cmdKey = cmdRaw.replace(/\(\)$/, "").toLowerCase();
    const extDef = externalCommands.find(c => c.key === cmdKey);
    const def = extDef ?? DEFAULT_COMMANDS.find(c => c.key === cmdKey);
    if (!def?.action) return;
    const parameters: Record<string, string> = {};
    rawArgs.forEach((arg, i) => {
      parameters[i.toString()] = arg;
      if (def.args && def.args[i]) parameters[def.args[i].key] = arg;
    });
    def.action({ nav, parameters });
  }, [nav, externalCommands]);

  /* Intro script effect */
  useEffect(() => {
    if (scriptPhase === "done" || skipIntro) return;

    if (scriptIdx >= SCRIPT.length) {
      setScriptPhase("done");
      return;
    }

    const entry = SCRIPT[scriptIdx];
    const cmdStr = entry.command;
    const promptSpeed = entry.promptSpeed ?? PROMPT_SPEED;
    const outputSpeed = entry.outputSpeed ?? OUTPUT_SPEED;
    const pauseAfterType = entry.pauseAfterType ?? PAUSE_AFTER_TYPE;
    const pauseAfterCmd = entry.pauseAfterCmd ?? PAUSE_AFTER_CMD;
    const pauseAfterExecution = entry.pauseAfterExecution ?? PAUSE_AFTER_EXECUTION;

    if (scriptPhase === "typing") {
      if (currentInput.length < cmdStr.length) {
        scriptTimerRef.current = setTimeout(
          () => setCurrentInput(cmdStr.slice(0, currentInput.length + 1)),
          promptSpeed,
        );
      } else {
        scriptTimerRef.current = setTimeout(() => setScriptPhase("waiting"), pauseAfterType);
      }
    } else if (scriptPhase === "waiting") {
      scriptTimerRef.current = setTimeout(() => {
        const trimmed = currentInput.trim();
        const [cmdRaw = "", ...args] = trimmed.split(/\s+/);

        pendingPromptRef.current = trimmed;
        pendingSegmentsRef.current = entry.outputSegments ?? [];
        pendingNodeRef.current = getCommandOutput(cmdRaw, args);
        pendingCmdRef.current = { cmdRaw, args };

        setCurrentInput("");
        setTypedOutputLen(0);
        setScriptPhase("outputTyping");
      }, PAUSE_AFTER_CMD);
    } else if (scriptPhase === "outputTyping") {
      const totalLen = pendingSegmentsRef.current.reduce((s, seg) => s + seg.text.length, 0);
      if (typedOutputLen < totalLen) {
        scriptTimerRef.current = setTimeout(
          () => setTypedOutputLen((n) => n + 1),
          outputSpeed,
        );
      } else {
        scriptTimerRef.current = setTimeout(() => {
          if (pendingCmdRef.current) {
            runCommandAction(pendingCmdRef.current.cmdRaw, pendingCmdRef.current.args);
            pendingCmdRef.current = null;
          }
          setHistory((prev) => [
            ...prev,
            { prompt: pendingPromptRef.current, output: pendingNodeRef.current },
          ]);
          setCmdHistory((prev) => [pendingPromptRef.current, ...prev]);
          setTypedOutputLen(0);
          setScriptPhase("executing");
        }, pauseAfterCmd);
      }
    } else if (scriptPhase === "executing") {
      scriptTimerRef.current = setTimeout(() => {
        setScriptIdx((i: number) => i + 1);
        setScriptPhase("typing");
      }, pauseAfterExecution);
    }

    return () => { if (scriptTimerRef.current) clearTimeout(scriptTimerRef.current); };
  }, [scriptPhase, scriptIdx, currentInput, typedOutputLen, getCommandOutput, runCommandAction]);

  useEffect(() => {
    if (isInteractive) {
      inputRef.current?.focus();
      if (!skipIntro) onIntroComplete?.();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isInteractive]);

  useEffect(() => {
    if (bodyRef.current) bodyRef.current.scrollTop = bodyRef.current.scrollHeight;
  }, [history, height]);

  function executeCommand(raw: string) {
    const trimmed = raw.trim();
    const [cmdRaw = "", ...args] = trimmed.split(/\s+/);
    const cmdKey = cmdRaw.replace(/\(\)$/, "").toLowerCase();

    if (cmdKey === "clear") {
      setHistory([]);
      setCurrentInput("");
      setCmdHistoryIdx(-1);
      return;
    }

    if (trimmed !== "") setCmdHistory((prev) => [trimmed, ...prev]);

    runCommandAction(cmdRaw, args);
    const output = getCommandOutput(cmdRaw, args);

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
        const allCmds = [...ALL_COMMAND_KEYS, ...externalCommands.map(c => c.key)];
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
        className={`flex items-center gap-2 px-4 py-2 bg-zinc-900 border-b border-zinc-800 select-none group ${isDragging ? "cursor-grabbing" : "cursor-default"}`}
        onMouseDown={onDragHandleMouseDown}
      >
        <button
          onClick={onClose}
          className="w-3 h-3 rounded-full bg-[#ff5f56] hover:bg-[#bf4942] transition-colors flex items-center justify-center group/btn hover:cursor-pointer"
          aria-label="Close"
        >
          <svg className="w-1.5 h-1.5 opacity-0 group-hover:opacity-100 transition-opacity" viewBox="0 0 6 6">
            <path d="M1.5 1.5L4.5 4.5M1.5 4.5L4.5 1.5" stroke="#4c0000" strokeWidth="1.2" strokeLinecap="round" />
          </svg>
        </button>

        <button
          onClick={onMinimize}
          className="w-3 h-3 rounded-full bg-[#ffbd2e] hover:bg-[#bf8e22] transition-colors flex items-center justify-center hover:cursor-pointer"
          aria-label="Minimize"
        >
          <svg className="w-1.5 h-1.5 opacity-0 group-hover:opacity-100 transition-opacity" viewBox="0 0 6 6">
            <path d="M1 3H5" stroke="#995700" strokeWidth="1.2" strokeLinecap="round" />
          </svg>
        </button>

        <button
          className="w-3 h-3 rounded-full bg-[#27c93f] hover:bg-[#1d962f] transition-colors flex items-center justify-center hover:cursor-pointer"
          aria-label="Maximize"
        >
          <svg className="w-1.5 h-1.5 opacity-0 group-hover:opacity-100 transition-opacity" viewBox="0 0 6 6">
            <path d="M3 1V5M1 3H5" stroke="#006500" strokeWidth="1.2" strokeLinecap="round" />
          </svg>
        </button>

        <span className="ml-2 text-[11px] text-zinc-500 font-medium font-sans tracking-wide">
          tung@portfolio:~
        </span>
      </div>

      <div
        ref={bodyRef}
        className="bg-zinc-950 px-5 py-5 font-mono text-sm overflow-y-scroll cursor-text styled-scrollbar"
        style={{ height }}
        onClick={() => isInteractive && inputRef.current?.focus()}
      >
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
              <span className="text-zinc-300 animate-blink text-xs">█</span>
            </div>
          </div>
        )}

        {isInteractive && (
          <div className="text-zinc-700 text-xs mb-2 mt-1 select-none">
            — interactive · type <span className="text-zinc-500">help</span> to explore —
          </div>
        )}

        {scriptPhase !== "outputTyping" && (
          <div className="flex items-start mt-1">
            <span className="text-zinc-500 select-none mr-1.5 shrink-0">{">"}</span>
            <div className="relative flex-1 min-w-0">
              {isInteractive && (
                <input
                  ref={inputRef}
                  type="text"
                  value={currentInput}
                  onChange={(e) => { setCurrentInput(e.target.value); setCmdHistoryIdx(-1); }}
                  onKeyDown={handleKeyDown}
                  onFocus={() => setIsFocused(true)}
                  onBlur={() => setIsFocused(false)}
                  className="absolute inset-0 opacity-0 w-full h-full"
                  autoComplete="off"
                  autoCorrect="off"
                  autoCapitalize="off"
                  spellCheck={false}
                  aria-label="terminal input"
                />
              )}
              <span className="text-zinc-300 pointer-events-none break-all">{currentInput}</span>
              <span className={`text-zinc-300 pointer-events-none text-xs ${isFocused ? "animate-blink" : "opacity-0"}`}>█</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}