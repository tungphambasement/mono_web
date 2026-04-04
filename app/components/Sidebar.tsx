"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { House, Briefcase, FolderGit2 } from "lucide-react";
import type { LucideIcon } from "lucide-react";

const navLinks: { href: string; label: string; Icon: LucideIcon }[] = [
  { href: "/", label: "Home", Icon: House },
  { href: "/experiences", label: "Experiences", Icon: Briefcase },
  { href: "/projects", label: "Projects", Icon: FolderGit2 },
];

export default function Sidebar() {
  const pathname = usePathname();

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

      <nav className="space-y-2 text-base flex flex-col">
        {navLinks.map(({ href, label, Icon }, i) => {
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
              <Icon size={15} className="shrink-0" />
              <span className="relative inline-block">
                {label}
                <span
                  className="absolute -bottom-0.75 left-0 h-px w-full bg-current transition-transform duration-300 scale-x-0 origin-right group-hover:scale-x-100 group-hover:origin-left"
                />
              </span>
            </Link>
          );
        })}
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
