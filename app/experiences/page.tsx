const experiences = [
  {
    period: "Coming Soon",
    description: "An experience to be awaited.",
  },
  {
    period: "May 2025 - Aug 2025",
    title: "Software Engineer Intern",
    company: "Rikkeisoft",
    location: "Hanoi, VN",
    description:
      "Developed a full-stack QA automation platform using ReactJS and FastAPI that registers/generates, tracks, and validates test suites, accelerating production deployment by 60% and QA quality by 30%.",
  },
  {
    period: "Dec 2024 - May 2025",
    title: "Backend Developer Intern",
    company: "Krunda",
    location: "Rochester, NY",
    description:
      "Spearheaded the development of a microservices-based backend for a B2B SaaS platform using Node.js and PostgreSQL, reducing API response times by 40% and improving system scalability to support a 3x increase in user base.",
  },
  {
    period: "May 2023 - Oct 2023",
    title: "Research Assistant",
    company: "HUST",
    location: "Hanoi, VN",
    description:
      "Conducted research on an indoor positioning system using PyTorch and signal processing frameworks, improving accuracy by 30% and inference time by 50% over leading research models.",
  }
];

export default function Experiences() {
  return (
    <section className="space-y-12">
      <h1 className="text-3xl font-bold tracking-tight">Experiences</h1>

      <ol className="relative">
        {experiences.map((exp, i) => {
          const isComingSoon = exp.period === "Coming Soon";
          return (
            <li key={i} className="flex gap-10">
              {/* Spine */}
              <div className="flex flex-col items-center">
                {isComingSoon ? (
                  <span className="relative mt-1.5 flex h-4 w-4 shrink-0">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75" />
                    <span className="relative inline-flex rounded-full h-4 w-4 bg-blue-500 ring-4 ring-white dark:ring-zinc-950" />
                  </span>
                ) : (
                  <div className="mt-1.5 w-4 h-4 rounded-full bg-blue-500 ring-4 ring-white dark:ring-zinc-950 shrink-0 z-10" />
                )}
                {i < experiences.length - 1 && (
                  <div className="w-px flex-1 bg-zinc-200 dark:bg-zinc-800 my-1" />
                )}
              </div>

              {/* Card */}
              <div className="pb-16 flex-1">
                {isComingSoon ? (
                  <div className="items-center gap-2 text-blue-500 text-m font-medium mb-1 mt-1">
                    Coming Soon
                  </div>
                ) : (
                  <p className="text-sm font-mono text-zinc-400 dark:text-zinc-500 mb-1 mt-1">
                    {exp.period}
                  </p>
                )}
                <h2 className="text-lg font-semibold">{exp.title}</h2>
                {!isComingSoon && (
                  <p className="text-base text-blue-500 mb-3">
                    {exp.company} &middot; {exp.location}
                  </p>
                )}
                <p className="text-base text-zinc-500 dark:text-zinc-400 leading-relaxed">
                  {exp.description}
                </p>
                {isComingSoon && (
                  <div className="mb-2" />
                )}
              </div>
            </li>
          );
        })}
      </ol>
    </section>
  );
}
