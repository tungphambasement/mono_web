"use client";

import { useRouter } from "next/navigation";
import { KeyboardEvent, ReactNode, useEffect, useRef, useState } from "react";

type IntroLine = {
  prompt: string;
  output: string;
  isLink?: boolean;
  linkHref?: string;
};

const INTRO_LINES: IntroLine[] = [
  { prompt: "locate --engineer", output: "Tung D. Pham found at /hanoi/software-engineer" },
  { prompt: "skills --list", output: "C++ · TypeScript · Java · Python · Rust" },
  {
    prompt: "contact --email",
    output: "tungphamdoan2509@gmail.com",
    isLink: true,
    linkHref: "mailto:tungphamdoan2509@gmail.com",
  },
];

const PROMPT_SPEED = 60;
const OUTPUT_SPEED = 38;
const PAUSE_AFTER_PROMPT = 280;
const PAUSE_AFTER_OUTPUT = 480;

const COMMAND_HELP: Record<string, string> = {
  help: "show available commands",
  about: "who I am",
  skills: "tech stack & tools",
  experience: "work history",
  projects: "things I've built",
  contact: "get in touch",
  ls: "list filesystem",
  cat: "read a file  (try: cat README.md)",
  cd: "navigate     (try: cd projects)",
  git: "git commands (try: git log)",
  whoami: "identify yourself",
  echo: "print text",
  neofetch: "system information",
  clear: "clear the terminal",
};

const ALL_COMMANDS = Object.keys(COMMAND_HELP);

type HistoryEntry = { prompt: string; output: ReactNode };

export default function TerminalHero() {
  const router = useRouter();

  // typewriter
  const [introCompleted, setIntroCompleted] = useState<IntroLine[]>([]);
  const [activePrompt, setActivePrompt] = useState("");
  const [activeOutput, setActiveOutput] = useState("");
  const [typePhase, setTypePhase] = useState<"typing-prompt" | "typing-output" | "done">("typing-prompt");
  const [introLineIdx, setIntroLineIdx] = useState(0);
  const introTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // interactive
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [currentInput, setCurrentInput] = useState("");
  const [cmdHistory, setCmdHistory] = useState<string[]>([]);
  const [cmdHistoryIdx, setCmdHistoryIdx] = useState(-1);
  const inputRef = useRef<HTMLInputElement>(null);
  const bodyRef = useRef<HTMLDivElement>(null);

  const isInteractive = typePhase === "done";

  useEffect(() => {
    if (introLineIdx >= INTRO_LINES.length) {
      setTypePhase("done");
      return;
    }
    const line = INTRO_LINES[introLineIdx];

    if (typePhase === "typing-prompt") {
      if (activePrompt.length < line.prompt.length) {
        introTimerRef.current = setTimeout(
          () => setActivePrompt(line.prompt.slice(0, activePrompt.length + 1)),
          PROMPT_SPEED,
        );
      } else {
        introTimerRef.current = setTimeout(() => setTypePhase("typing-output"), PAUSE_AFTER_PROMPT);
      }
    } else if (typePhase === "typing-output") {
      if (activeOutput.length < line.output.length) {
        introTimerRef.current = setTimeout(
          () => setActiveOutput(line.output.slice(0, activeOutput.length + 1)),
          OUTPUT_SPEED,
        );
      } else {
        introTimerRef.current = setTimeout(() => {
          setIntroCompleted((prev) => [...prev, line]);
          setActivePrompt("");
          setActiveOutput("");
          setIntroLineIdx((i) => i + 1);
          setTypePhase("typing-prompt");
        }, PAUSE_AFTER_OUTPUT);
      }
    }
    return () => { if (introTimerRef.current) clearTimeout(introTimerRef.current); };
  }, [typePhase, activePrompt, activeOutput, introLineIdx]);


  useEffect(() => {
    if (isInteractive) inputRef.current?.focus();
  }, [isInteractive]);

  useEffect(() => {
    if (bodyRef.current) bodyRef.current.scrollTop = bodyRef.current.scrollHeight;
  }, [history, activeOutput]);


  function renderCommandOutput(cmd: string, args: string[]): ReactNode {
    switch (cmd) {
      case "":
        return null;

      case "help":
        return (
          <div className="space-y-0.5">
            <div className="text-zinc-500 mb-1">Available commands:</div>
            {Object.entries(COMMAND_HELP).map(([c, desc]) => (
              <div key={c}>
                <span className="text-zinc-200 inline-block w-24">{c}</span>
                <span className="text-zinc-500">{desc}</span>
              </div>
            ))}
            <div className="text-zinc-600 mt-1 text-xs">↑↓ history · Tab autocomplete · Ctrl+L clear</div>
          </div>
        );

      case "about":
        return (
          <div className="space-y-0.5">
            {(
              [
                ["Name", "Tung D. Pham"],
                ["School", "University of Rochester — B.S. Computer Science"],
                ["Grad", "May 2026"],
                ["Focus", "Systems · Backend · Distributed computing"],
                ["Status", "🟢 Actively seeking full-time SWE roles"],
              ] as [string, string][]
            ).map(([k, v]) => (
              <div key={k}>
                <span className="text-zinc-500 inline-block w-16">{k}</span>
                <span className="text-zinc-200">{v}</span>
              </div>
            ))}
          </div>
        );

      case "skills":
        return (
          <div className="space-y-0.5">
            {(
              [
                ["Languages", "C++ · TypeScript · Java · Python · Rust"],
                ["Backend", "Node.js · Fastify · gRPC · REST"],
                ["Databases", "PostgreSQL · Redis · SQLite"],
                ["Infra", "Docker · Linux · Nginx"],
                ["Tools", "Git · Neovim · tmux"],
              ] as [string, string][]
            ).map(([k, v]) => (
              <div key={k}>
                <span className="text-zinc-500 inline-block w-20">{k}</span>
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
                ["Email", "mailto:placeholder@example.com", "placeholder@example.com"],
                ["GitHub", "https://github.com", "github.com"],
                ["LinkedIn", "https://linkedin.com/in/tungpd", "linkedin.com/in/tungpd"],
              ] as [string, string, string][]
            ).map(([label, href, display]) => (
              <div key={label}>
                <span className="text-zinc-500 inline-block w-16">{label}</span>
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
                { languages: ["TypeScript", "Go", "Python", "Rust", "C++"], backend: ["Node.js", "gRPC", "REST"], infra: ["Docker", "Linux"] },
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
          setTimeout(() => router.push("/experiences"), 500);
          return <div className="text-zinc-400">Navigating to /experiences…</div>;
        }
        if (dir === "projects" || dir === "/projects") {
          setTimeout(() => router.push("/projects"), 500);
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

      case "neofetch":
        return (
          <div className="flex gap-6 text-xs leading-relaxed">
            <pre className="text-blue-400 select-none leading-tight">{
              `  ████████████
  ████████████
  ████████████
  ████████████`
            }</pre>
            <div className="space-y-0.5">
              <div>
                <span className="text-zinc-200">tung</span>
                <span className="text-zinc-500">@</span>
                <span className="text-zinc-200">portfolio</span>
              </div>
              <div className="text-zinc-700">──────────────</div>
              {(
                [
                  ["OS", "Portfolio v2.0"],
                  ["Host", "tung.dev"],
                  ["Shell", "zsh 5.9"],
                  ["Stack", "Next.js · Tailwind"],
                  ["Status", "🟢 Open to work"],
                ] as [string, string][]
              ).map(([k, v]) => (
                <div key={k}>
                  <span className="text-zinc-500 inline-block w-14">{k}</span>
                  <span className={k === "Status" ? "text-green-400" : "text-zinc-300"}>{v}</span>
                </div>
              ))}
            </div>
          </div>
        );

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

  function executeCommand(raw: string) {
    const trimmed = raw.trim();
    const [cmd = "", ...args] = trimmed.split(/\s+/);

    if (cmd.toLowerCase() === "clear") {
      setHistory([]);
      setIntroCompleted([]);
      setCurrentInput("");
      setCmdHistoryIdx(-1);
      return;
    }

    if (trimmed !== "") setCmdHistory((prev) => [trimmed, ...prev]);
    const output = renderCommandOutput(cmd.toLowerCase(), args);
    setHistory((prev) => [...prev, { prompt: raw, output }]);
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
        const matches = ALL_COMMANDS.filter((c) => c.startsWith(partial));
        if (matches.length === 1) setCurrentInput(matches[0]);
        break;
      }

      case "l":
        if (e.ctrlKey) {
          e.preventDefault();
          setHistory([]);
          setIntroCompleted([]);
        }
        break;
    }
  }

  const isTypingActive = typePhase !== "done";
  const currentIntroLine = INTRO_LINES[introLineIdx];

  return (
    <section className="animate-fade-in">
      <div className="rounded-lg border border-zinc-800 overflow-hidden shadow-lg">
        {/* Chrome */}
        <div className="flex items-center gap-1.5 px-4 py-3 bg-zinc-900 border-b border-zinc-800">
          <span className="w-3 h-3 rounded-full bg-red-500" />
          <span className="w-3 h-3 rounded-full bg-yellow-500" />
          <span className="w-3 h-3 rounded-full bg-green-500" />
          <span className="ml-2 text-xs text-zinc-500 font-mono select-none">tung@portfolio:~</span>
        </div>

        {/* Body */}
        <div
          ref={bodyRef}
          className="bg-zinc-950 px-5 py-5 font-mono text-sm max-h-96 overflow-y-auto cursor-text"
          onClick={() => isInteractive && inputRef.current?.focus()}
        >
          {/* Intro: completed lines */}
          {introCompleted.map((line, i) => (
            <div key={`intro-${i}`} className="mb-1">
              <div>
                <span className="text-zinc-500 select-none">{">"} </span>
                <span className="text-zinc-300">{line.prompt}</span>
              </div>
              <div className="pl-4 text-zinc-500">
                {line.isLink && line.linkHref
                  ? <a href={line.linkHref} className="text-blue-400 hover:underline">{line.output}</a>
                  : line.output}
              </div>
            </div>
          ))}

          {/* Intro: active typewriter line */}
          {isTypingActive && currentIntroLine && (
            <div className="mb-1">
              <div>
                <span className="text-zinc-500 select-none">{">"} </span>
                <span className="text-zinc-300">{activePrompt}</span>
                {typePhase === "typing-prompt" && (
                  <span className="text-zinc-300 animate-blink">█</span>
                )}
              </div>
              {typePhase === "typing-output" && (
                <div className="pl-4 text-zinc-500">
                  {activeOutput}
                  <span className="text-zinc-500 animate-blink">█</span>
                </div>
              )}
            </div>
          )}

          {/* Interactive shell */}
          {isInteractive && (
            <>
              <div className="text-zinc-700 text-xs mb-2 mt-1 select-none">
                — interactive shell ready · type <span className="text-zinc-500">help</span> to explore —
              </div>

              {/* Command history */}
              {history.map((entry, i) => (
                <div key={`hist-${i}`} className="mb-1">
                  <div>
                    <span className="text-zinc-500 select-none">{">"} </span>
                    <span className="text-zinc-300">{entry.prompt}</span>
                  </div>
                  {entry.output != null && (
                    <div className="pl-4 text-zinc-400 mt-0.5">{entry.output}</div>
                  )}
                </div>
              ))}

              {/* Current input line */}
              <div className="flex items-start mt-1">
                <span className="text-zinc-500 select-none mr-1.5 shrink-0">{">"}</span>
                <div className="relative flex-1 min-w-0">
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
                  <span className="text-zinc-300 pointer-events-none break-all">{currentInput}</span>
                  <span className="text-zinc-300 animate-blink pointer-events-none">█</span>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </section>
  );
}
