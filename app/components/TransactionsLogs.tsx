"use client";

import { useEffect, useRef, useState } from "react";

const TABLES = ["orders", "users", "products", "payments", "sessions", "inventory", "audit_log"];

type LogLine = { text: string; color: string };

function randHex(len: number) {
  return Array.from({ length: len }, () =>
    Math.floor(Math.random() * 16).toString(16)
  ).join("");
}

function rand(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function randPrice() {
  return (rand(199, 49900) / 100).toFixed(2);
}

function tag(id: string) {
  return `[txn:${id}]`.padEnd(13);
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

function sys(type: string) {
  return `[${type}]`.padEnd(13);
}

const C = {
  begin: "text-zinc-200",
  commit: "text-zinc-200",
  rollback: "text-red-400",
  error: "text-red-400",
  insert: "text-zinc-200",
  update: "text-zinc-200",
  delete: "text-yellow-300",
  select: "text-zinc-200",
  lock: "text-yellow-300",
  warn: "text-yellow-300",
  vacuum: "text-zinc-200",
  savepoint: "text-zinc-200",
  index: "text-zinc-200",
  ddl: "text-zinc-200",
  info: "text-zinc-200",
};

// ─── Sequences ────────────────────────────────────────────────────────────────
type WFn = { w: number; fn: () => LogLine[] };
const SEQUENCES: WFn[] = [
  // Normal 2-op commit (w:30 — bread and butter)
  {
    w: 30, fn: () => {
      const id = randHex(4);
      const t1 = TABLES[rand(0, TABLES.length - 1)];
      const t2 = TABLES[rand(0, TABLES.length - 1)];
      const ms = (rand(2, 120) / 10).toFixed(1);
      return [
        { text: `${tag(id)} BEGIN`, color: C.begin },
        { text: `${tag(id)} INSERT INTO ${t1} (id, total, status) VALUES (${rand(1000, 9999)}, ${randPrice()}, 'pending')`, color: C.insert },
        { text: `${tag(id)} UPDATE ${t2} SET updated_at=NOW(), count=count+1 WHERE id=${rand(100, 999)}`, color: C.update },
        { text: `${tag(id)} COMMIT — 2 rows affected (${ms}ms)`, color: C.commit },
      ];
    }
  },
  // Constraint violation -> rollback (w:1)
  {
    w: 1, fn: () => {
      const id = randHex(4);
      const tbl = TABLES[rand(0, TABLES.length - 1)];
      const col = ["email", "order_id", "user_id", "ref_code"][rand(0, 3)];
      return [
        { text: `${tag(id)} BEGIN`, color: C.begin },
        { text: `${tag(id)} INSERT INTO ${tbl} (${col}) VALUES ('dup_${randHex(4)}')`, color: C.insert },
        { text: `${tag(id)} ERROR: duplicate key violates unique constraint "${tbl}_${col}_key"`, color: C.error },
        { text: `${tag(id)} ROLLBACK — transaction aborted`, color: C.rollback },
      ];
    }
  },
  // Deadlock between two txns (w:1 — very rare)
  {
    w: 1, fn: () => {
      const id1 = randHex(4);
      const id2 = randHex(4);
      const tbl = TABLES[rand(0, TABLES.length - 1)];
      const ms = (rand(8, 25) / 10).toFixed(1);
      return [
        { text: `${tag(id1)} BEGIN`, color: C.begin },
        { text: `${tag(id2)} BEGIN`, color: C.begin },
        { text: `${tag(id1)} LOCK TABLE ${tbl} IN SHARE ROW EXCLUSIVE MODE`, color: C.lock },
        { text: `${tag(id2)} LOCK TABLE ${tbl} IN SHARE ROW EXCLUSIVE MODE`, color: C.lock },
        { text: `${sys("warn")} DEADLOCK detected — txn:${id1} vs txn:${id2}`, color: C.warn },
        { text: `${tag(id1)} ROLLBACK — chosen as deadlock victim`, color: C.rollback },
        { text: `${tag(id2)} COMMIT — lock acquired (${ms}ms)`, color: C.commit },
      ];
    }
  },
  // Savepoint + partial rollback (w:5)
  {
    w: 5, fn: () => {
      const id = randHex(4);
      const tbl = TABLES[rand(0, TABLES.length - 1)];
      const sp = `sp_${rand(1, 9)}`;
      const ms = (rand(3, 80) / 10).toFixed(1);
      return [
        { text: `${tag(id)} BEGIN`, color: C.begin },
        { text: `${tag(id)} INSERT INTO ${tbl} VALUES (${rand(1000, 9999)}, ${randPrice()})`, color: C.insert },
        { text: `${tag(id)} SAVEPOINT ${sp}`, color: C.savepoint },
        { text: `${tag(id)} UPDATE ${tbl} SET status='processing' WHERE id=${rand(100, 999)}`, color: C.update },
        { text: `${tag(id)} ERROR: value too long for type character varying(32)`, color: C.error },
        { text: `${tag(id)} ROLLBACK TO SAVEPOINT ${sp}`, color: C.savepoint },
        { text: `${tag(id)} COMMIT — 1 row affected (${ms}ms)`, color: C.commit },
      ];
    }
  },
  // Autovacuum (w:6 — periodic background maintenance)
  {
    w: 6, fn: () => {
      const tbl = TABLES[rand(0, TABLES.length - 1)];
      const pages = rand(10, 200);
      const rows = rand(500, 5000);
      const ms = rand(50, 800);
      return [
        { text: `${sys("autovacuum")}BEGIN on ${tbl}`, color: C.vacuum },
        { text: `${sys("autovacuum")}pages scanned: ${pages + rand(50, 300)}, removed: ${pages}`, color: C.vacuum },
        { text: `${sys("autovacuum")}row versions removed: ${rows}`, color: C.vacuum },
        { text: `${sys("autovacuum")}END on ${tbl}  (elapsed ${ms}ms)`, color: C.vacuum },
      ];
    }
  },
  // Delete with cascade (w:6)
  {
    w: 6, fn: () => {
      const id = randHex(4);
      const tbl = ["users", "orders", "sessions"][rand(0, 2)];
      const rowId = rand(100, 999);
      const cascade = rand(2, 12);
      const ms = (rand(5, 50) / 10).toFixed(1);
      return [
        { text: `${tag(id)} BEGIN`, color: C.begin },
        { text: `${tag(id)} DELETE FROM ${tbl} WHERE id=${rowId}`, color: C.delete },
        { text: `${tag(id)} CASCADE -> ${cascade} rows deleted from related tables`, color: C.warn },
        { text: `${tag(id)} COMMIT — ${cascade + 1} rows affected (${ms}ms)`, color: C.commit },
      ];
    }
  },
  // Slow sequential scan with warning (w:5)
  {
    w: 5, fn: () => {
      const id = randHex(4);
      const tbl = TABLES[rand(0, TABLES.length - 1)];
      const slowMs = rand(210, 900);
      const rows = rand(10, 50000);
      return [
        { text: `${tag(id)} BEGIN`, color: C.begin },
        { text: `${tag(id)} SELECT * FROM ${tbl} WHERE created_at > NOW()-INTERVAL '30 days'`, color: C.select },
        { text: `${tag(id)} SEQ SCAN  rows=${rows}  cost=${rand(100, 9000)}  time=${slowMs}ms`, color: C.index },
        { text: `${sys("warn")} slow query threshold exceeded — ${slowMs}ms > 200ms`, color: C.warn },
        { text: `${tag(id)} COMMIT — ${rows} rows returned (${slowMs}ms)`, color: C.commit },
      ];
    }
  },
  // Concurrent index build (w:3 — infrequent schema work)
  {
    w: 3, fn: () => {
      const tbl = TABLES[rand(0, TABLES.length - 1)];
      const col = ["created_at", "user_id", "status", "email"][rand(0, 3)];
      const ms = rand(100, 3000);
      return [
        { text: `${sys("ddl")} CREATE INDEX CONCURRENTLY idx_${tbl}_${col} ON ${tbl}(${col})`, color: C.ddl },
        { text: `${sys("ddl")} scanning table ${tbl} …`, color: C.ddl },
        { text: `${sys("ddl")} index build completed in ${ms}ms`, color: C.ddl },
      ];
    }
  },
  // Foreign key violation (w:1)
  {
    w: 1, fn: () => {
      const id = randHex(4);
      const tbl = ["payments", "inventory", "products"][rand(0, 2)];
      return [
        { text: `${tag(id)} BEGIN`, color: C.begin },
        { text: `${tag(id)} INSERT INTO ${tbl} (user_id, total) VALUES (${rand(9000, 9999)}, ${randPrice()})`, color: C.insert },
        { text: `${tag(id)} ERROR: insert or update violates foreign key constraint "${tbl}_user_id_fkey"`, color: C.error },
        { text: `${tag(id)} DETAIL: Key (user_id)=(${rand(9000, 9999)}) is not present in table "users"`, color: C.error },
        { text: `${tag(id)} ROLLBACK — constraint violation`, color: C.rollback },
      ];
    }
  },
  // Batch upsert (w:15 — common bulk sync operation)
  {
    w: 15, fn: () => {
      const id = randHex(4);
      const tbl = TABLES[rand(0, TABLES.length - 1)];
      const n = rand(50, 500);
      const ms = (rand(5, 80) / 10).toFixed(1);
      return [
        { text: `${tag(id)} BEGIN`, color: C.begin },
        { text: `${tag(id)} INSERT INTO ${tbl} SELECT * FROM staging_${tbl} LIMIT ${n}`, color: C.insert },
        { text: `${tag(id)} ON CONFLICT DO UPDATE SET updated_at=EXCLUDED.updated_at`, color: C.update },
        { text: `${tag(id)} COMMIT — ${n} rows upserted (${ms}ms)`, color: C.commit },
      ];
    }
  },
];

const MAX_LINES = 60;
const INTERVAL_MS = 300;

interface TransactionsLogsProps {
  onDragHandleMouseDown: (e: React.MouseEvent) => void;
  isDragging: boolean;
  height: number;
}

export default function TransactionsLogs({ onDragHandleMouseDown, isDragging, height }: TransactionsLogsProps) {
  const [lines, setLines] = useState<LogLine[]>([]);
  const scrollRef = useRef<HTMLDivElement>(null);
  const queueRef = useRef<LogLine[]>([]);

  useEffect(() => {
    const id = setInterval(() => {
      if (queueRef.current.length === 0) {
        const seq = weightedPick(SEQUENCES);
        queueRef.current.push(...seq());
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
      className="rounded-xl overflow-hidden border border-white/10 bg-zinc-950 backdrop-blur-md shadow-[0_8px_32px_rgba(0,0,0,0.5)] flex flex-col"
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
        <span className="ml-2 text-[11px] text-zinc-400 font-mono tracking-wide">psql — transactions</span>
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
