"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const navLinks = [
  { href: "/", label: "Home" },
  { href: "/experiences", label: "Experiences" },
  { href: "/projects", label: "Projects" },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-64 shrink-0 border-r border-zinc-200 dark:border-zinc-800 sticky top-0 h-screen p-8 hidden md:flex flex-col">
      <div className="text-xl font-bold mb-2">Tung D. Pham</div>
      <p className="text-xs text-zinc-400 dark:text-zinc-500 mb-8">
        Software Engineer
      </p>
      <nav className="space-y-3.5 text-sm">
        {navLinks.map(({ href, label }) => (
          <Link
            key={href}
            href={href}
            className={`block transition-colors${pathname === href
              ? "text-zinc-900 dark:text-zinc-100"
              : "text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100"
              }`}
          >
            {label}
          </Link>
        ))}
      </nav>
      <div className="mt-auto flex gap-4 text-zinc-400 dark:text-zinc-500 text-sm">
        <a
          href="https://github.com"
          className="hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors"
        >
          GitHub
        </a>
        <a
          href="https://linkedin.com/tungpd"
          className="hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors"
        >
          LinkedIn
        </a>
      </div>
    </aside>
  );
}
