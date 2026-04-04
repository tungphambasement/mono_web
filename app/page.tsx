export default function Home() {
  return (
    <section className="space-y-8">
      <h1 className="text-4xl font-bold tracking-tight">
        Hi, I&apos;m Tung 👋
      </h1>
      <p className="text-base text-zinc-500 dark:text-zinc-400 leading-relaxed">
        [Placeholder] CS student at the University of Rochester, graduating
        May 2026. I build fast, reliable systems and love working on problems at
        the intersection of distributed computing and developer tooling.
      </p>
      <p className="text-base text-zinc-500 dark:text-zinc-400 leading-relaxed">
        [Placeholder] Currently looking for full-time software engineering
        roles. Reach me at{" "}
        <a
          href="mailto:placeholder@example.com"
          className="text-blue-500 hover:underline"
        >
          placeholder@example.com
        </a>
        .
      </p>
      <div className="flex gap-3 flex-wrap pt-2">
        <span className="px-4 py-1.5 rounded-full bg-zinc-100 dark:bg-zinc-800 text-sm text-zinc-600 dark:text-zinc-300">
          Systems Engineering
        </span>
        <span className="px-4 py-1.5 rounded-full bg-zinc-100 dark:bg-zinc-800 text-sm text-zinc-600 dark:text-zinc-300">
          Backend
        </span>
        <span className="px-4 py-1.5 rounded-full bg-zinc-100 dark:bg-zinc-800 text-sm text-zinc-600 dark:text-zinc-300">
          TypeScript · Go · Python · Rust
        </span>
      </div>
    </section>
  );
}
