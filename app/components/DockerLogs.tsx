"use client";

import { useEffect, useRef, useState } from "react";

type LogLine = { text: string; color: string };

function randHex(len: number) {
  return Array.from({ length: len }, () =>
    Math.floor(Math.random() * 16).toString(16)
  ).join("");
}

function rand(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function pfx(type: string) {
  return `[${type}]`.padEnd(13);
}

const COLORS: Record<string, string> = {
  docker: "text-zinc-200",
  network: "text-zinc-200",
  compose: "text-zinc-200",
  health: "text-zinc-200",
  volume: "text-zinc-200",
  build: "text-zinc-200",
  security: "text-zinc-200",
  error: "text-red-400",
  warn: "text-yellow-300",
  registry: "text-zinc-200",
  runtime: "text-zinc-200",
};

function mkLine(type: string, msg: string): LogLine {
  return { text: `${pfx(type)}${msg}`, color: COLORS[type] ?? "text-zinc-200" };
}

function weightedPick<T>(items: Array<{ w: number; fn: T }>): T {
  const total = items.reduce((s, i) => s + i.w, 0);
  let r = Math.random() * total;
  for (const item of items) {
    r -= item.w;
    if (r <= 0) return item.fn;
  }
  return items[items.length - 1].fn;
}

// ─── Single-shot events ───────────────────────────────────────────────────────
type WFn = { w: number; fn: () => LogLine[] };
const SINGLES: WFn[] = [
  { w: 6, fn: () => [mkLine("docker", `Layer sha256:${randHex(12)} already exists`)] },
  { w: 2, fn: () => [mkLine("docker", `Pulling image alpine:3.19 … done`)] },
  { w: 2, fn: () => [mkLine("docker", `Pulling image node:22-alpine … done`)] },
  { w: 1, fn: () => [mkLine("docker", `Pulling image postgres:16 … done`)] },
  { w: 3, fn: () => [mkLine("network", `Bridge net${rand(0, 3)} attached to container ${randHex(4)}`)] },
  { w: 4, fn: () => [mkLine("network", `Container ${randHex(4)} → port ${rand(3000, 9000)}:${rand(3000, 9000)}`)] },
  { w: 5, fn: () => [mkLine("network", `DNS resolved api-svc → 172.18.0.${rand(2, 15)}`)] },
  { w: 2, fn: () => [mkLine("network", `NAT rule added: 0.0.0.0:${rand(3000, 9000)} → 172.18.0.${rand(2, 8)}`)] },
  { w: 3, fn: () => [mkLine("volume", `Mounted /data/${randHex(3)} → /var/lib/db`)] },
  { w: 1, fn: () => [mkLine("volume", `Pruned ${rand(1, 8)} unused volumes, reclaimed ${rand(10, 500)}MB`)] },
  { w: 2, fn: () => [mkLine("security", `Scanning image node:22-alpine … ${rand(0, 3)} vulnerabilities`)] },
  { w: 2, fn: () => [mkLine("security", `TLS cert for api-svc valid ${rand(30, 180)} more days`)] },
  { w: 2, fn: () => [mkLine("registry", `Push sha256:${randHex(10)} → registry.internal/api:latest`)] },
  { w: 8, fn: () => [mkLine("runtime", `Container ${randHex(4)} CPU ${rand(1, 40)}%  MEM ${rand(50, 450)}MB`)] },
  { w: 3, fn: () => [mkLine("warn", `Container ${randHex(4)} memory at ${rand(70, 89)}% of limit (512MB)`)] },
  { w: 1, fn: () => [mkLine("warn", `Image node:18-alpine is ${rand(30, 180)} days old — consider updating`)] },
  {
    w: 10, fn: () => {
      const svc = ["redis", "api-svc", "postgres", "nginx", "worker"][rand(0, 4)];
      return [mkLine("health", `${svc.padEnd(20)} healthy (3/3)`)];
    }
  },
];

// ─── Multi-line sequences ─────────────────────────────────────────────────────
const SEQUENCES: WFn[] = [
  // Container startup (w:20 — most common background event)
  {
    w: 20, fn: () => {
      const id = randHex(4);
      const svc = ["api-svc", "worker", "scheduler", "proxy"][rand(0, 3)];
      const ms = rand(300, 1200);
      return [
        mkLine("docker", `Pulling image node:22-alpine … done`),
        mkLine("docker", `Container ${id} created`),
        mkLine("network", `Container ${id} attached to bridge net0`),
        mkLine("compose", `service ${svc.padEnd(14)} starting …`),
        mkLine("compose", `service ${svc.padEnd(14)} started in ${ms}ms`),
        mkLine("health", `${svc.padEnd(20)} healthy (1/3)`),
        mkLine("health", `${svc.padEnd(20)} healthy (2/3)`),
        mkLine("health", `${svc.padEnd(20)} healthy (3/3)`),
      ];
    }
  },
  // OOM crash + restart (w:5 — rare, dramatic)
  {
    w: 5, fn: () => {
      const id = randHex(4);
      const svc = ["api-svc", "worker"][rand(0, 1)];
      const ms = rand(200, 800);
      return [
        mkLine("error", `Container ${id} exited with code 137 (OOM killed)`),
        mkLine("warn", `compose restarting ${svc} … (attempt 1/3)`),
        mkLine("compose", `service ${svc.padEnd(14)} started in ${ms}ms`),
        mkLine("health", `${svc.padEnd(20)} healthy (3/3)`),
      ];
    }
  },
  // Dockerfile build (w:8 — occasional CI activity)
  {
    w: 8, fn: () => {
      const sha = randHex(8);
      return [
        mkLine("build", `Step 1/6 : FROM node:22-alpine`),
        mkLine("build", `Step 2/6 : WORKDIR /app`),
        mkLine("build", `Step 3/6 : COPY package*.json ./`),
        mkLine("build", `Step 4/6 : RUN npm ci  → cached`),
        mkLine("build", `Step 5/6 : COPY . .`),
        mkLine("build", `Step 6/6 : CMD ["node","server.js"]`),
        mkLine("build", `Successfully built sha256:${sha}…`),
        mkLine("docker", `Image tagged api-svc:latest`),
      ];
    }
  },
  // Health check failure + recovery (w:8 — occasional transient blip)
  {
    w: 8, fn: () => {
      const id = randHex(4);
      return [
        mkLine("error", `Container ${id} health check failed (timeout 30s)`),
        mkLine("warn", `Retrying health check … (1/3)`),
        mkLine("error", `Container ${id} health check failed (connection refused)`),
        mkLine("warn", `Retrying health check … (2/3)`),
        mkLine("health", `Container ${id} health check passed`),
      ];
    }
  },
  // Volume snapshot (w:5 — periodic background job)
  {
    w: 5, fn: () => {
      const vol = `vol_${randHex(4)}`;
      const src = rand(100, 900);
      const dst = Math.round(src * rand(35, 55) / 100);
      return [
        mkLine("volume", `Creating snapshot of ${vol}`),
        mkLine("volume", `Compressing ${src}MB → ${dst}MB …`),
        mkLine("volume", `Snapshot ${vol}_bak stored (${rand(1, 5)}.${rand(0, 9)}s)`),
      ];
    }
  },
  // Security CVE scan (w:4 — infrequent security audit)
  {
    w: 4, fn: () => {
      const n = rand(1, 5);
      const cves = Array.from({ length: n }, () => `CVE-${rand(2022, 2025)}-${rand(1000, 9999)}`).join(", ");
      return [
        mkLine("security", `Scanning postgres:16 packages (${rand(80, 220)} total) …`),
        { text: `${pfx("security")}${n} CVE(s) found: ${cves}`, color: "text-red-400" },
        mkLine("warn", `${n} issue(s) require attention — run docker scan --fix`),
      ];
    }
  },
  // Network partition error (w:7 — occasional transient network hiccup)
  {
    w: 7, fn: () => {
      const id = randHex(4);
      return [
        mkLine("error", `Container ${id} lost connection to postgres (EOF)`),
        mkLine("warn", `api-svc entering retry loop (max 5 attempts)`),
        mkLine("network", `TCP connection re-established 172.18.0.${rand(2, 8)}:5432`),
        mkLine("health", `api-svc               healthy (3/3)`),
      ];
    }
  },
  // Rolling update (w:13 — common in active CD pipeline)
  {
    w: 13, fn: () => {
      const svc = ["api-svc", "worker"][rand(0, 1)];
      const old = `${rand(1, 5)}.${rand(0, 9)}.${rand(0, 9)}`;
      const nxt = `${rand(5, 9)}.${rand(0, 9)}.${rand(0, 9)}`;
      return [
        mkLine("compose", `Rolling update: ${svc} ${old} → ${nxt}`),
        mkLine("compose", `Stopping old container ${randHex(4)} …`),
        mkLine("docker", `Pulling image ${svc}:${nxt} … done`),
        mkLine("compose", `Starting new container ${randHex(4)} …`),
        mkLine("health", `${svc.padEnd(20)} healthy (3/3)`),
        mkLine("compose", `Rolling update complete`),
      ];
    }
  },
];

const MAX_LINES = 60;
const INTERVAL_MS = 500;

interface DockerLogsProps {
  onDragHandleMouseDown: (e: React.MouseEvent) => void;
  isDragging: boolean;
  height: number;
}

export default function DockerLogs({ onDragHandleMouseDown, isDragging, height }: DockerLogsProps) {
  const [lines, setLines] = useState<LogLine[]>([]);
  const scrollRef = useRef<HTMLDivElement>(null);
  const queueRef = useRef<LogLine[]>([]);

  useEffect(() => {
    const id = setInterval(() => {
      if (queueRef.current.length === 0) {
        const useSeq = Math.random() < 0.35;
        const pool = useSeq ? SEQUENCES : SINGLES;
        const event = weightedPick(pool);
        queueRef.current.push(...event());
      }
      const next = queueRef.current.shift()!;
      setLines((prev) => {
        const updated = [...prev, next];
        return updated.length > MAX_LINES ? updated.slice(-MAX_LINES) : updated;
      });
    }, INTERVAL_MS);
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [lines]);

  return (
    <div
      className="rounded-xl overflow-hidden border border-white/10 bg-zinc-950/90 backdrop-blur-md shadow-[0_8px_32px_rgba(0,0,0,0.5)] flex flex-col"
      style={{ height }}
    >
      {/* Title bar / drag handle */}
      <div
        className={`flex items-center gap-2 px-3 py-2 border-b border-white/8 bg-white/4 shrink-0 select-none ${isDragging ? "cursor-grabbing" : "cursor-grab"}`}
        onMouseDown={onDragHandleMouseDown}
      >
        <span className="w-2.5 h-2.5 rounded-full bg-red-500/70" />
        <span className="w-2.5 h-2.5 rounded-full bg-yellow-400/70" />
        <span className="w-2.5 h-2.5 rounded-full bg-green-500/70" />
        <span className="ml-2 text-[11px] text-zinc-400 font-mono tracking-wide">docker — network logs</span>
      </div>
      {/* Log body */}
      <div
        ref={scrollRef}
        className="flex-1 overflow-y-auto p-3 font-mono text-[11px] leading-relaxed styled-scrollbar"
      >
        {lines.map((entry, i) => (
          <div key={i} className={`whitespace-pre-wrap ${entry.color}`}>
            {entry.text}
          </div>
        ))}
      </div>
    </div>
  );
}
