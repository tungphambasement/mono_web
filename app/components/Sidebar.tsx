/**
 * @deprecated This component is no longer used and will be removed in the future. The new design focuses on a more content-centric layout without a persistent sidebar.
 */
"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { House, Briefcase, FolderGit2, User, Feather, Package, Package2, Cpu } from "lucide-react";
import type { LucideIcon } from "lucide-react";

const topLinks: { href: string; label: string; Icon: LucideIcon }[] = [
  { href: "/", label: "Home", Icon: House },
  { href: "/mono-demo", label: "Mono Demo", Icon: Cpu },
  { href: "/blogs", label: "Blogs", Icon: Feather },
];

const aboutMeSubLinks: { href: string; label: string; Icon: LucideIcon }[] = [
  { href: "/about?tab=experiences", label: "Experiences", Icon: Briefcase },
  { href: "/about?tab=projects", label: "Projects", Icon: FolderGit2 },
  { href: "/about?tab=activities", label: "Clubs & Activities", Icon: Package },
];

export default function Sidebar() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const isAboutMeActive = pathname === "/about";

  return (
    <aside className="w-64 shrink-0 border-r border-zinc-200 dark:border-zinc-800 sticky top-0 h-screen p-8 hidden md:flex flex-col animate-fade-in">
      <div
        className="text-xl font-bold mb-2 animate-slide-up"
        style={{ animationDelay: "80ms" }}
      >
        Tung D. Pham
      </div>
      <p
        className="text-sm text-zinc-400 dark:text-zinc-500 mb-8 animate-slide-up"
        style={{ animationDelay: "160ms" }}
      >
        Software Engineer
      </p>

      <div className="border-t border-zinc-200 dark:border-zinc-800 mb-6" />

      <nav className="space-y-2 text-base flex flex-col">
        {topLinks.map(({ href, label, Icon }, i) => {
          const active = pathname === href;
          return (
            <Link
              key={href}
              href={href}
              style={{ animationDelay: `${200 + i * 70}ms` }}
              className={`group flex items-center gap-2.5 py-2 transition-colors duration-200 animate-slide-in ${active
                ? "text-zinc-900 dark:text-zinc-100"
                : "text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100"
                }`}
            >
              <Icon size={16} className="shrink-0" />
              <span className="relative inline-block">
                {label}
                <span className="absolute -bottom-0.75 left-0 h-px w-full bg-current transition-transform duration-300 scale-x-0 origin-right group-hover:scale-x-100 group-hover:origin-left" />
              </span>
            </Link>
          );
        })}

        {/* About Me */}
        <div className="group/about animate-slide-in" style={{ animationDelay: "270ms" }}>
          <div
            className={`select-none cursor-default flex w-full items-center gap-2.5 py-2 transition-colors duration-200 ${isAboutMeActive
              ? "text-zinc-900 dark:text-zinc-100"
              : "text-zinc-500 dark:text-zinc-400 group-hover/about:text-zinc-900 dark:group-hover/about:text-zinc-100"
              }`}
          >
            <User size={16} className="shrink-0" />
            <span>About Me</span>
          </div>

          <div
            className={`overflow-hidden transition-all duration-300 ${isAboutMeActive
              ? "max-h-40"
              : "max-h-0 group-hover/about:max-h-40"
              }`}
          >
            <div className="relative ml-2.5 mt-1">
              {aboutMeSubLinks.map(({ href, label }, idx) => {
                const tabParam = new URL(href, "http://x").searchParams.get("tab");
                const active = pathname === "/about" && searchParams.get("tab") === tabParam;
                const isFirst = idx === 0;
                const isLast = idx === aboutMeSubLinks.length - 1;

                return (
                  <div
                    className={`relative transition-all duration-300 ${isAboutMeActive
                      ? "opacity-100"
                      : "opacity-0 group-hover/about:opacity-100"
                      }`}
                    style={{ transitionDelay: isAboutMeActive ? "0ms" : `${idx * 80}ms` }}
                    key={href}
                  >
                    {!isFirst && (
                      <div className="absolute -left-px -top-full  h-full border-l border-zinc-200 dark:border-zinc-800" />
                    )}

                    <Link
                      href={href}
                      className={`group relative flex items-center py-2.5 pl-6.5 text-sm transition-colors duration-200 ${active
                        ? "text-zinc-900 dark:text-zinc-100 font-medium"
                        : "text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100"
                        }`}
                    >
                      <span className="absolute -left-px top-0 h-1/2 w-4.5 border-zinc-200 dark:border-zinc-800 rounded-bl-lg border-b border-l" />
                      <span className="relative inline-block">
                        {label}
                        <span className="absolute -bottom-0.75 left-0 h-px w-full bg-current transition-transform duration-300 scale-x-0 origin-right group-hover:scale-x-100 group-hover:origin-left" />
                      </span>
                    </Link>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </nav>

      <div
        className="mt-auto flex gap-4 text-zinc-400 dark:text-zinc-500 text-sm animate-slide-up"
        style={{ animationDelay: "500ms" }}
      >
        <a
          href="https://github.com"
          className="relative overflow-hidden transition-colors duration-200 hover:text-zinc-900 dark:hover:text-zinc-100 after:absolute after:bottom-0 after:left-0 after:h-px after:w-0 after:bg-current after:transition-[width] after:duration-300 hover:after:w-full"
        >
          GitHub
        </a>
        <a
          href="https://linkedin.com/tungpd"
          className="relative overflow-hidden transition-colors duration-200 hover:text-zinc-900 dark:hover:text-zinc-100 after:absolute after:bottom-0 after:left-0 after:h-px after:w-0 after:bg-current after:transition-[width] after:duration-300 hover:after:w-full"
        >
          LinkedIn
        </a>
      </div>
    </aside>
  );
}
