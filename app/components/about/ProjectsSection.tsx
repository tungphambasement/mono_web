const projects = [
  {
    name: "Project Alpha",
    tech: "TypeScript · Next.js · PostgreSQL",
    description:
      "Placeholder. A full-stack web application that does something interesting and useful.",
    href: "#",
  },
  {
    name: "Project Beta",
    tech: "Go · gRPC · Redis",
    description:
      "Placeholder. A high-performance microservice for real-time data processing.",
    href: "#",
  },
  {
    name: "Project Gamma",
    tech: "Python · PyTorch · FastAPI",
    description:
      "Placeholder. A machine-learning pipeline for natural language classification tasks.",
    href: "#",
  },
  {
    name: "Project Delta",
    tech: "Rust · WebAssembly",
    description:
      "Placeholder. A browser-native tool for visualizing complex data structures.",
    href: "#",
  },
];

export default function ProjectsSection() {
  return (
    <div className="space-y-10">
      <div className="grid gap-5 sm:grid-cols-2">
        {projects.map((proj, i) => (
          <a
            key={i}
            href={proj.href}
            className="group rounded-xl border border-zinc-200 dark:border-zinc-800 p-6 hover:border-blue-400 dark:hover:border-blue-600 transition-colors"
          >
            <div className="flex items-start justify-between mb-2">
              <h2 className="text-lg font-semibold group-hover:text-blue-500 transition-colors">
                {proj.name}
              </h2>
              <span className="text-zinc-300 dark:text-zinc-700 group-hover:text-blue-400 transition-colors text-sm">
                ↗
              </span>
            </div>
            <p className="text-sm font-mono text-zinc-400 dark:text-zinc-500 mb-3">
              {proj.tech}
            </p>
            <p className="text-base text-zinc-500 dark:text-zinc-400 leading-relaxed">
              {proj.description}
            </p>
          </a>
        ))}
      </div>
    </div>
  );
}
