"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export default function Header() {
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-30 border-b border-border bg-background/80 backdrop-blur-md">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6">
        <Link href="/" className="flex items-center gap-2">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-accent to-accent-2 text-sm font-bold text-white">
            W
          </span>
          <span className="text-lg font-semibold tracking-tight">WallVerse</span>
        </Link>

        <nav className="flex items-center gap-1 text-sm">
          <Link
            href="/"
            className={`rounded-md px-3 py-1.5 transition-colors ${
              pathname === "/"
                ? "bg-surface text-foreground"
                : "text-gray-400 hover:text-foreground"
            }`}
          >
            Explore
          </Link>
          <Link
            href="/upload"
            className={`rounded-md px-3 py-1.5 transition-colors ${
              pathname === "/upload"
                ? "bg-surface text-foreground"
                : "text-gray-400 hover:text-foreground"
            }`}
          >
            Upload
          </Link>
        </nav>
      </div>
    </header>
  );
}
