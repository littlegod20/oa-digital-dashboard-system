"use client";

import { usePathname } from "next/navigation";
import { Menu, Search, Sun, Moon, Bell } from "lucide-react";
import { useState } from "react";

function buildBreadcrumb(pathname: string): string[] {
  const parts = pathname
    .replace(/^\/dashboard\/?/, "")
    .split("/")
    .filter(Boolean);
  if (parts.length === 0) return ["Overview"];
  return [
    "Overview",
    ...parts.map((p) =>
      p.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase()),
    ),
  ];
}

export function TopHeader({ onOpenNav }: { onOpenNav?: () => void }) {
  const pathname = usePathname();
  const crumbs = buildBreadcrumb(pathname);
  const [theme, setTheme] = useState<"light" | "dark">("light");

  function toggleTheme() {
    const next = theme === "light" ? "dark" : "light";
    setTheme(next);
    document.documentElement.setAttribute("data-theme", next);
  }

  return (
    <header
      className="flex h-14 shrink-0 items-center justify-between gap-2 px-4 md:gap-4 md:px-6"
      style={{
        background: "var(--header-bg)",
        borderBottom: "1px solid var(--header-border)",
        transition: "background-color 0.2s ease",
      }}
    >
      {/* Left: mobile toggle + breadcrumb */}
      <div className="flex min-w-0 items-center gap-2">
        {onOpenNav && (
          <button
            type="button"
            onClick={onOpenNav}
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl md:hidden"
            style={{ background: "var(--input-bg)", color: "var(--text-secondary)" }}
            aria-label="Open navigation"
          >
            <Menu className="size-4" />
          </button>
        )}

        <nav className="hidden min-w-0 items-center gap-1.5 text-sm md:flex">
          {crumbs.map((crumb, i) => (
            <span key={i} className="flex min-w-0 items-center gap-1.5">
              {i > 0 && (
                <span style={{ color: "var(--text-muted)" }}>/</span>
              )}
              <span
                className="truncate"
                style={{
                  color: i === crumbs.length - 1 ? "var(--text-primary)" : "var(--text-secondary)",
                  fontWeight: i === crumbs.length - 1 ? 500 : 400,
                }}
              >
                {crumb}
              </span>
            </span>
          ))}
        </nav>
      </div>

      {/* Right: search + icon controls */}
      <div className="flex shrink-0 items-center gap-1.5">
        {/* Search */}
        <div className="relative hidden sm:block">
          <svg
            className="pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2"
            width="13" height="13" viewBox="0 0 24 24" fill="none"
            stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
            style={{ color: "var(--text-muted)" }}
          >
            <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
          <input
            type="search"
            placeholder="Search..."
            className="h-8 w-44 rounded-xl pl-8 pr-3 text-[12.5px] outline-none focus:w-56 transition-all"
            style={{
              background: "var(--input-bg)",
              color: "var(--text-primary)",
              border: "1px solid transparent",
            }}
            onFocus={(e) => (e.currentTarget.style.borderColor = "var(--brand-ring)")}
            onBlur={(e) => (e.currentTarget.style.borderColor = "transparent")}
          />
          <kbd
            className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 hidden text-[10px] rounded px-1 sm:inline-flex"
            style={{ background: "var(--divider)", color: "var(--text-muted)" }}
          >
            ⌘/
          </kbd>
        </div>

        {/* Bell */}
        <button
          type="button"
          className="flex h-8 w-8 items-center justify-center rounded-xl transition-colors"
          style={{ color: "var(--text-secondary)" }}
          onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.background = "var(--input-bg)"; }}
          onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.background = "transparent"; }}
          aria-label="Notifications"
        >
          <Bell className="size-4" />
        </button>

        {/* Theme toggle */}
        <button
          type="button"
          onClick={toggleTheme}
          className="flex h-8 w-8 items-center justify-center rounded-xl transition-colors"
          style={{ color: "var(--text-secondary)" }}
          onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.background = "var(--input-bg)"; }}
          onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.background = "transparent"; }}
          aria-label="Toggle theme"
        >
          {theme === "light" ? <Moon className="size-4" /> : <Sun className="size-4" />}
        </button>

        {/* User avatar */}
        <button
          type="button"
          className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl text-[11px] font-bold text-white transition-opacity hover:opacity-80"
          style={{ background: "var(--brand-strong)" }}
          aria-label="Account"
        >
          AF
        </button>
      </div>
    </header>
  );
}
