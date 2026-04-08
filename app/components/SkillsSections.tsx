"use client";

import { motion } from "framer-motion";
import {
  Database,
  Container,
  Layers,
  Zap,
  Radio,
  ArrowLeftRight,
  Cpu,
  Grid3x3,
  GitBranch,
} from "lucide-react";

// ─── Shared helpers ──────────────────────────────────────────────────────────

const FADE_UP_HIDDEN = { opacity: 0, y: 36 };
const FADE_UP_VISIBLE = { opacity: 1, y: 0 };
function fadeUpTransition(i = 0) {
  return { duration: 0.55, ease: "easeOut" as const, delay: i * 0.08 };
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <span className="inline-block text-xs font-mono uppercase tracking-widest text-blue-400/70 mb-3">
      {children}
    </span>
  );
}

function SectionHeading({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="text-2xl md:text-3xl font-bold text-white tracking-tight">{children}</h2>
  );
}

function SectionSubtext({ children }: { children: React.ReactNode }) {
  return (
    <p className="mt-3 text-zinc-400 text-base leading-relaxed max-w-xl">{children}</p>
  );
}

// ─── 1. Databases & Docker ────────────────────────────────────────────────────

const DB_CARDS = [
  {
    icon: <Database className="w-5 h-5" />,
    name: "PostgreSQL",
    desc: "Relational schema design, indexing strategies, query optimisation with EXPLAIN ANALYSE.",
    accent: "#3b82f6",
    snippet: `SELECT u.id, count(o.id)\nFROM users u\nJOIN orders o USING (user_id)\nGROUP BY u.id\nHAVING count(o.id) > 5;`,
  },
  {
    icon: <Zap className="w-5 h-5" />,
    name: "Redis",
    desc: "In-memory caching, pub/sub messaging, TTL-based session stores and sorted-set leaderboards.",
    accent: "#ef4444",
    snippet: `ZADD leaderboard 4200 "player:42"\nZRANGE leaderboard 0 9 WITHSCORES\nSETEX session:tok 3600 payload`,
  },
  {
    icon: <Container className="w-5 h-5" />,
    name: "Docker",
    desc: "Multi-stage Dockerfiles, docker compose stacks, volume mounts, named networks and health checks.",
    accent: "#06b6d4",
    snippet: `services:\n  api:\n    build: .\n    depends_on: [db, cache]\n  db:\n    image: postgres:16\n  cache:\n    image: redis:7-alpine`,
  },
  {
    icon: <Layers className="w-5 h-5" />,
    name: "Migrations & ORM",
    desc: "Schema migrations with Flyway / Alembic, typed query builders, and connection-pool tuning.",
    accent: "#a78bfa",
    snippet: `-- V3__add_index.sql\nCREATE INDEX CONCURRENTLY\n  idx_orders_user_id\nON orders (user_id)\nWHERE deleted_at IS NULL;`,
  },
];

function CodeSnippet({ code }: { code: string }) {
  return (
    <pre
      className="mt-4 rounded-lg bg-zinc-900 border border-zinc-800 px-4 py-3 text-xs font-mono text-zinc-300 leading-relaxed overflow-x-auto"
      style={{ tabSize: 2 }}
    >
      {code}
    </pre>
  );
}

function DbDockerSection() {
  return (
    <section className="w-full max-w-7xl mx-auto px-6 py-20">
      <motion.div
        initial={FADE_UP_HIDDEN}
        whileInView={FADE_UP_VISIBLE}
        transition={fadeUpTransition()}
        viewport={{ once: true, amount: 0.2 }}
        className="mb-12"
      >
        <SectionLabel>Data layer</SectionLabel>
        <SectionHeading>Databases &amp; Containers</SectionHeading>
        <SectionSubtext>
          Storing, querying, and shipping data reliably — from normalised relational schemas to
          ephemeral in-memory caches packaged inside reproducible container stacks.
        </SectionSubtext>
      </motion.div>

      <div className="grid gap-5 sm:grid-cols-2">
        {DB_CARDS.map((card, i) => (
          <motion.div
            key={card.name}
            initial={FADE_UP_HIDDEN}
            whileInView={FADE_UP_VISIBLE}
            transition={fadeUpTransition(i)}
            viewport={{ once: true, amount: 0.15 }}
            className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-6 hover:border-zinc-600 transition-colors"
          >
            <div className="flex items-center gap-3 mb-2" style={{ color: card.accent }}>
              {card.icon}
              <span className="font-semibold text-white text-base">{card.name}</span>
            </div>
            <p className="text-sm text-zinc-400 leading-relaxed">{card.desc}</p>
            <CodeSnippet code={card.snippet} />
          </motion.div>
        ))}
      </div>
    </section>
  );
}

// ─── 2. Socket Programming ────────────────────────────────────────────────────

const SOCKET_CARDS = [
  {
    icon: <ArrowLeftRight className="w-5 h-5" />,
    name: "TCP Sockets",
    accent: "#22c55e",
    desc: "Low-level stream sockets in C and Python — connection lifecycle, non-blocking I/O with epoll/select, and custom framing protocols.",
    tags: ["POSIX", "epoll", "select", "SO_REUSEPORT"],
  },
  {
    icon: <Radio className="w-5 h-5" />,
    name: "WebSockets",
    accent: "#f59e0b",
    desc: "Full-duplex browser–server channels built on top of HTTP upgrade. Used for live dashboards, multiplayer game state, and collaborative editing.",
    tags: ["RFC 6455", "ping/pong", "binary frames", "rooms"],
  },
];

function ConnectionDiagram() {
  const nodes = ["Client A", "Server", "Client B"];
  return (
    <div className="flex items-center justify-center gap-0 my-8">
      {nodes.map((label, i) => (
        <div key={label} className="flex items-center gap-0">
          {/* Node */}
          <div className="flex flex-col items-center gap-1">
            <div className="w-16 h-16 rounded-xl border border-zinc-700 bg-zinc-900 flex items-center justify-center text-xs font-mono text-zinc-300 text-center px-1">
              {label}
            </div>
          </div>
          {/* Connector */}
          {i < nodes.length - 1 && (
            <div className="flex flex-col items-center mx-2 w-20">
              {/* right arrow */}
              <motion.div
                className="w-full h-px bg-linear-to-r from-blue-500 to-cyan-400 mb-1"
                initial={{ scaleX: 0 }}
                whileInView={{ scaleX: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: i * 0.2 }}
                style={{ transformOrigin: "left" }}
              />
              {/* left arrow */}
              <motion.div
                className="w-full h-px bg-linear-to-l from-blue-500 to-cyan-400 mt-1"
                initial={{ scaleX: 0 }}
                whileInView={{ scaleX: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: i * 0.2 + 0.15 }}
                style={{ transformOrigin: "right" }}
              />
              <span className="text-[10px] font-mono text-zinc-500 mt-1">full-duplex</span>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

function SocketSection() {
  return (
    <section
      className="w-full py-20"
      style={{
        background:
          "radial-gradient(ellipse 80% 60% at 50% 50%, rgba(34,197,94,0.04) 0%, transparent 70%)",
      }}
    >
      <div className="max-w-7xl mx-auto px-6">
        <motion.div
          initial={FADE_UP_HIDDEN}
          whileInView={FADE_UP_VISIBLE}
          transition={fadeUpTransition()}
          viewport={{ once: true, amount: 0.2 }}
          className="mb-12"
        >
          <SectionLabel>Networking</SectionLabel>
          <SectionHeading>Socket Programming</SectionHeading>
          <SectionSubtext>
            Building real-time, bidirectional communication channels from raw POSIX sockets
            all the way up to protocol-level WebSocket servers.
          </SectionSubtext>
        </motion.div>

        <ConnectionDiagram />

        <div className="grid gap-5 sm:grid-cols-2 mt-4">
          {SOCKET_CARDS.map((card, i) => (
            <motion.div
              key={card.name}
              initial={FADE_UP_HIDDEN}
              whileInView={FADE_UP_VISIBLE}
              transition={fadeUpTransition(i)}
              viewport={{ once: true, amount: 0.15 }}
              className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-6 hover:border-zinc-600 transition-colors"
            >
              <div className="flex items-center gap-3 mb-2" style={{ color: card.accent }}>
                {card.icon}
                <span className="font-semibold text-white text-base">{card.name}</span>
              </div>
              <p className="text-sm text-zinc-400 leading-relaxed mb-4">{card.desc}</p>
              <div className="flex flex-wrap gap-2">
                {card.tags.map((tag) => (
                  <span
                    key={tag}
                    className="text-xs font-mono px-2 py-0.5 rounded-md border border-zinc-700 text-zinc-400 bg-zinc-900"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─── 3. Multithreading · SIMD · SIMT ─────────────────────────────────────────

const PARALLEL_CARDS = [
  {
    icon: <GitBranch className="w-5 h-5" />,
    name: "Multithreading",
    accent: "#f59e0b",
    desc: "pthreads, std::thread, mutexes, condition variables, lock-free queues, and thread-pool executors. Understanding of memory models and cache-line false sharing.",
    visual: "threads",
  },
  {
    icon: <Cpu className="w-5 h-5" />,
    name: "SIMD",
    accent: "#a78bfa",
    desc: "SSE / AVX / NEON intrinsics for vectorised float and integer pipelines. Auto-vectorisation hints, alignment requirements, and lane-wise scatter/gather patterns.",
    visual: "simd",
  },
  {
    icon: <Grid3x3 className="w-5 h-5" />,
    name: "SIMT / GPU",
    accent: "#06b6d4",
    desc: "CUDA and OpenCL kernels — warp-level execution, shared memory tiling, coalesced global loads, and occupancy-driven launch configurations.",
    visual: "gpu",
  },
];

function ThreadsVisual() {
  const threads = 6;
  const colors = ["#f59e0b", "#fbbf24", "#fcd34d", "#fde68a", "#fef3c7", "#fffbeb"];
  return (
    <div className="mt-4 flex flex-col gap-1.5">
      {Array.from({ length: threads }).map((_, t) => (
        <div key={t} className="flex items-center gap-2">
          <span className="text-[10px] font-mono text-zinc-500 w-14 shrink-0">
            thread {t}
          </span>
          <motion.div
            className="h-3 rounded-sm"
            style={{ background: colors[t], width: "100%" }}
            initial={{ scaleX: 0 }}
            whileInView={{ scaleX: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: t * 0.07, ease: "easeOut" }}
            custom={t}
          />
        </div>
      ))}
    </div>
  );
}

function SimdVisual() {
  const lanes = 8;
  const values = [1.2, 3.7, 0.5, 2.1, 4.4, 1.8, 3.3, 2.9];
  return (
    <div className="mt-4">
      <div className="text-[10px] font-mono text-zinc-500 mb-1">ymm0 register — 8 × float32</div>
      <div className="flex gap-1">
        {Array.from({ length: lanes }).map((_, i) => (
          <motion.div
            key={i}
            className="flex-1 rounded-sm flex items-end justify-center pb-0.5"
            style={{
              background: `rgba(167,139,250,${0.3 + (i % 3) * 0.2})`,
              height: Math.round(12 + values[i] * 10),
            }}
            initial={{ scaleY: 0 }}
            whileInView={{ scaleY: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4, delay: i * 0.05, ease: "easeOut" }}
          >
            <span className="text-[8px] font-mono text-zinc-200">{values[i]}</span>
          </motion.div>
        ))}
      </div>
      <div className="text-[10px] font-mono text-zinc-500 mt-1">single instruction, 8 ops in parallel</div>
    </div>
  );
}

function GpuVisual() {
  const rows = 4;
  const cols = 16;
  return (
    <div className="mt-4">
      <div className="text-[10px] font-mono text-zinc-500 mb-1">CUDA grid — {rows} warps × {cols} threads</div>
      <div className="grid gap-0.5" style={{ gridTemplateColumns: `repeat(${cols}, 1fr)` }}>
        {Array.from({ length: rows * cols }).map((_, i) => (
          <motion.div
            key={i}
            className="rounded-xs"
            style={{
              height: 10,
              background: `rgba(6,182,212,${0.25 + ((i % 4) * 0.18)})`,
            }}
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.15, delay: (i % cols) * 0.015 + Math.floor(i / cols) * 0.06 }}
          />
        ))}
      </div>
      <div className="text-[10px] font-mono text-zinc-500 mt-1">all threads execute the same kernel in lock-step</div>
    </div>
  );
}

const VISUALS: Record<string, React.ReactNode> = {
  threads: <ThreadsVisual />,
  simd: <SimdVisual />,
  gpu: <GpuVisual />,
};

function ParallelSection() {
  return (
    <section
      className="w-full py-20"
      style={{
        background:
          "radial-gradient(ellipse 80% 60% at 50% 50%, rgba(99,102,241,0.05) 0%, transparent 70%)",
      }}
    >
      <div className="max-w-7xl mx-auto px-6">
        <motion.div
          initial={FADE_UP_HIDDEN}
          whileInView={FADE_UP_VISIBLE}
          transition={fadeUpTransition()}
          viewport={{ once: true, amount: 0.2 }}
          className="mb-12"
        >
          <SectionLabel>Parallel computing</SectionLabel>
          <SectionHeading>Multithreading · SIMD · SIMT</SectionHeading>
          <SectionSubtext>
            Squeezing every cycle out of modern hardware — from OS-level thread primitives and
            CPU vector units to thousands of GPU shader cores executing in lock-step.
          </SectionSubtext>
        </motion.div>

        <div className="grid gap-5 sm:grid-cols-3">
          {PARALLEL_CARDS.map((card, i) => (
            <motion.div
              key={card.name}
              initial={FADE_UP_HIDDEN}
              whileInView={FADE_UP_VISIBLE}
              transition={fadeUpTransition(i)}
              viewport={{ once: true, amount: 0.15 }}
              className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-6 hover:border-zinc-600 transition-colors"
            >
              <div className="flex items-center gap-3 mb-2" style={{ color: card.accent }}>
                {card.icon}
                <span className="font-semibold text-white text-base">{card.name}</span>
              </div>
              <p className="text-sm text-zinc-400 leading-relaxed">{card.desc}</p>
              {VISUALS[card.visual]}
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─── Root export ──────────────────────────────────────────────────────────────

export default function SkillsSections() {
  return (
    <div className="w-full border-t border-zinc-800/60">
      <DbDockerSection />
      <div className="border-t border-zinc-800/40" />
      <SocketSection />
      <div className="border-t border-zinc-800/40" />
      <ParallelSection />
    </div>
  );
}
