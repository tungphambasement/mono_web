"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Briefcase, FolderGit2, Package } from "lucide-react";
import ExperiencesSection from "../components/about/ExperiencesSection";
import ProjectsSection from "../components/about/ProjectsSection";
import ActivitiesSection from "../components/about/ActivitiesSection";

const tabs = [
  { id: "experiences", label: "Experiences", Icon: Briefcase },
  { id: "projects", label: "Projects", Icon: FolderGit2 },
  { id: "activities", label: "Clubs & Activities", Icon: Package },
] as const;

type TabId = (typeof tabs)[number]["id"];

const VALID_TABS = new Set<string>(tabs.map((t) => t.id));

function resolveTab(raw: string | null): TabId {
  return raw && VALID_TABS.has(raw) ? (raw as TabId) : "experiences";
}

export default function AboutPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const active = resolveTab(searchParams.get("tab"));

  function setActive(id: TabId) {
    const params = new URLSearchParams(searchParams.toString());
    params.set("tab", id);
    router.replace(`/about?${params.toString()}`, { scroll: false });
  }

  return (
    <div className="w-full max-w-7xl mx-auto px-6 py-8 flex flex-col gap-8 overflow-y-auto">
      {/* Tab bar */}
      <nav className="flex border-b border-zinc-200 dark:border-zinc-800">
        {tabs.map(({ id, label, Icon }) => (
          <button
            key={id}
            onClick={() => setActive(id)}
            className={`flex items-center gap-1.5 px-4 py-2.5 text-base font-medium transition-colors duration-150 border-b-2 -mb-px ${active === id
              ? "border-blue-500 text-zinc-900 dark:text-zinc-100"
              : "border-transparent text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100"
              } hover:text-zinc-900 dark:hover:text-zinc-100 hover:cursor-pointer`}
          >
            <Icon size={14} className="shrink-0" />
            {label}
          </button>
        ))}
      </nav>

      {/* Section content */}
      <div className="px-4">
        {active === "experiences" && <ExperiencesSection />}
        {active === "projects" && <ProjectsSection />}
        {active === "activities" && <ActivitiesSection />}
      </div>
    </div>
  );
}
