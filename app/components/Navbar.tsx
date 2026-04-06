"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { House, Briefcase, FolderGit2, User, Feather, Package, Cpu, Computer } from "lucide-react";
import type { LucideIcon } from "lucide-react";

const topLinks: { href: string; label: string; Icon: LucideIcon }[] = [
  { href: "/", label: "Desktop", Icon: Computer },
  { href: "/mono-demo", label: "Mono Demo", Icon: Cpu },
  { href: "/blogs", label: "Blogs", Icon: Feather },
];

const aboutMeSubLinks: { href: string; label: string; Icon: LucideIcon }[] = [
  { href: "/about?tab=experiences", label: "Experiences", Icon: Briefcase },
  { href: "/about?tab=projects", label: "Projects", Icon: FolderGit2 },
  { href: "/about?tab=activities", label: "Clubs & Activities", Icon: Package },
];

export default function Navbar() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const isAboutMeActive = pathname === "/about";

  return (
    <header className="sticky top-0 z-40 w-full bg-transparent animate-fade-in">
      <div className="mx-auto flex w-[90%] items-center justify-between px-6 py-4">
        {/* Brand */}
        <Link
          href="/"
          className="text-lg font-sans tracking-tight text-zinc-900 dark:text-zinc-100 animate-slide-up"
          style={{ animationDelay: "80ms" }}
        >
          Tung D. Pham
        </Link>

        {/* Nav links */}
        <nav className="flex items-center gap-1 text-base">
          {topLinks.map(({ href, label, Icon }, i) => {
            const active = pathname === href;
            return (
              <Link
                key={href}
                href={href}
                style={{ animationDelay: `${160 + i * 60}ms` }}
                className={`group flex items-center gap-1.5 px-3 py-1.5 rounded-md transition-colors duration-200 animate-slide-up ${active
                  ? "text-zinc-900 dark:text-zinc-100"
                  : "text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100"
                  }`}
              >
                <Icon size={14} className="shrink-0" />
                <span className="relative inline-block">
                  {label}
                  <span className="absolute -bottom-0.5 left-0 h-px w-full bg-current transition-transform duration-200 scale-x-0 origin-right group-hover:scale-x-100 group-hover:origin-left" />
                </span>
              </Link>
            );
          })}

          <div className="absolute left-0 top-full h-2 w-full pointer-events-none bg-linear-to-b from-foreground/5 to-background/5 dark:from-background" />


          {/* About Me dropdown */}
          <div
            className="group/about relative animate-slide-up"
            style={{ animationDelay: "340ms" }}
          >
            <button
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md transition-colors duration-200 ${isAboutMeActive
                ? "text-zinc-900 dark:text-zinc-100"
                : "text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100"
                }`}
            >
              <User size={14} className="shrink-0" />
              <span>About Me</span>
              <svg
                className="ml-0.5 h-3 w-3 transition-transform duration-200 group-hover/about:rotate-180"
                viewBox="0 0 12 12"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
              >
                <path d="M2 4l4 4 4-4" />
              </svg>
            </button>

            {/* Dropdown */}
            <div className="absolute z-50 top-full left-1/2 -translate-x-1/2 pt-2 opacity-0 pointer-events-none group-hover/about:opacity-100 group-hover/about:pointer-events-auto transition-all duration-200 translate-y-1 group-hover/about:translate-y-0">
              <div className="min-w-44 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white/90 dark:bg-zinc-950/90 py-1.5 overflow-hidden">
                {aboutMeSubLinks.map(({ href, label, Icon }) => {
                  const tabParam = new URL(href, "http://x").searchParams.get("tab");
                  const active = pathname === "/about" && searchParams.get("tab") === tabParam;
                  return (
                    <Link
                      key={href}
                      href={href}
                      className={`group flex items-center gap-2 px-3 py-2 text-sm transition-colors duration-150 ${active
                        ? "text-zinc-900 dark:text-zinc-100 font-medium bg-zinc-50 dark:bg-zinc-900"
                        : "text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 hover:bg-zinc-50 dark:hover:text-zinc-100 dark:hover:bg-zinc-900"
                        }`}
                    >
                      <Icon size={13} className="shrink-0" />
                      <span className="relative inline-block">
                        {label}
                        <span className="absolute -bottom-0.5 left-0 h-px w-full bg-current transition-transform duration-200 scale-x-0 origin-right group-hover:scale-x-100 group-hover:origin-left" />
                      </span>
                    </Link>
                  );
                })}

                <div className="my-1 border-t border-zinc-200 dark:border-zinc-800" />

                <a
                  href="https://github.com"
                  className="group flex items-center gap-2 px-3 py-2 text-sm text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 hover:bg-zinc-50 dark:hover:bg-zinc-900 transition-colors duration-150"
                >
                  <span className="relative inline-block">
                    GitHub
                    <span className="absolute -bottom-0.5 left-0 h-px w-full bg-current transition-transform duration-200 scale-x-0 origin-right group-hover:scale-x-100 group-hover:origin-left" />
                  </span>
                </a>
                <a
                  href="https://linkedin.com/tungpd"
                  className="group flex items-center gap-2 px-3 py-2 text-sm text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 hover:bg-zinc-50 dark:hover:bg-zinc-900 transition-colors duration-150"
                >
                  <span className="relative inline-block">
                    LinkedIn
                    <span className="absolute -bottom-0.5 left-0 h-px w-full bg-current transition-transform duration-200 scale-x-0 origin-right group-hover:scale-x-100 group-hover:origin-left" />
                  </span>
                </a>
              </div>
            </div>
          </div>
        </nav>
      </div>
    </header>
  );
}
