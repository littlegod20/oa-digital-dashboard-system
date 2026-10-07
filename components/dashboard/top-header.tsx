"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  BellIcon,
  CaretDownIcon,
  CaretRightIcon,
  GearSixIcon,
  ListIcon,
  MagnifyingGlassIcon,
  MoonIcon,
  SignOutIcon,
  SunIcon,
} from "@phosphor-icons/react";
import { useRole } from "@/lib/role-context";
import { useIsMac, useTheme } from "@/lib/theme";
import { Avatar } from "@/components/ui/avatar";
import { useNotifications } from "@/components/dashboard/notification-sidebar";
import { ALL_NAV_ITEMS, isActivePath } from "./nav";

interface TopHeaderProps {
  onOpenNav: () => void;
  onOpenSearch: () => void;
  onBellClick: () => void;
  onSignOut: () => void;
  notifOpen: boolean;
}

export function TopHeader({ onOpenNav, onOpenSearch, onBellClick, onSignOut, notifOpen }: TopHeaderProps) {
  const pathname = usePathname();
  const current =
    ALL_NAV_ITEMS.filter((i) => isActivePath(pathname, i.href)).sort((a, b) => b.href.length - a.href.length)[0] ??
    ALL_NAV_ITEMS[0];
  const { resolved, toggle } = useTheme();
  const isMac = useIsMac();
  const { count: unread } = useNotifications();

  return (
    <header className="flex h-16 shrink-0 items-center justify-between gap-3 px-1 md:h-[4.5rem]">
      {/* Left: mobile menu + breadcrumb */}
      <div className="flex min-w-0 items-center gap-3">
        <button type="button" onClick={onOpenNav} className="icon-btn md:hidden" aria-label="Open navigation">
          <ListIcon size={19} />
        </button>
        <nav aria-label="Breadcrumb" className="flex min-w-0 items-center gap-1.5 text-[13px]">
          <span className="hidden text-fg-3 sm:inline">OA Digital</span>
          <CaretRightIcon size={12} className="hidden text-fg-3 sm:inline" />
          <span className="truncate font-semibold text-fg">{current.label}</span>
        </nav>
      </div>

      {/* Right: search + controls */}
      <div className="flex shrink-0 items-center gap-2">
        <button
          type="button"
          onClick={onOpenSearch}
          className="icon-btn !w-auto gap-2.5 !px-3.5 text-[12.5px] text-fg-3 sm:!pr-2 lg:min-w-[15rem] lg:!justify-start"
          aria-label="Search"
        >
          <MagnifyingGlassIcon size={17} className="text-fg-2" />
          <span className="hidden lg:inline">Search or jump to…</span>
          <span className="ml-auto hidden items-center gap-1 sm:flex">
            <kbd className="kbd">{isMac ? "⌘" : "Ctrl"}</kbd>
            <kbd className="kbd">K</kbd>
          </span>
        </button>

        <button
          type="button"
          onClick={onBellClick}
          className="icon-btn"
          aria-label={`Notifications${unread ? `, ${unread} unread` : ""}`}
          aria-pressed={notifOpen}
        >
          <BellIcon size={19} weight={notifOpen ? "fill" : "regular"} />
          {unread > 0 && (
            <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-peach ring-2 ring-[var(--card-solid)]" />
          )}
        </button>

        <button
          type="button"
          onClick={toggle}
          className="icon-btn hidden sm:inline-flex"
          aria-label={resolved === "dark" ? "Switch to light mode" : "Switch to dark mode"}
        >
          {resolved === "dark" ? <SunIcon size={19} /> : <MoonIcon size={19} />}
        </button>

        <UserMenu onSignOut={onSignOut} />
      </div>
    </header>
  );
}

function UserMenu({ onSignOut }: { onSignOut: () => void }) {
  const { user } = useRole();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const name = user?.name ?? "User";
  const subtitle = user?.jobTitle ?? "";

  useEffect(() => {
    if (!open) return;
    function onDown(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    window.addEventListener("mousedown", onDown);
    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("mousedown", onDown);
      window.removeEventListener("keydown", onKey);
    };
  }, [open]);

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="icon-btn !h-11 !w-auto gap-2.5 !pl-1.5 !pr-3"
        aria-haspopup="menu"
        aria-expanded={open}
      >
        <Avatar name={name} size={32} />
        <span className="hidden text-left leading-tight md:block">
          <span className="block max-w-[9rem] truncate text-[12.5px] font-semibold text-fg">{name}</span>
          <span className="block max-w-[9rem] truncate text-[11px] text-fg-3">{subtitle}</span>
        </span>
        <CaretDownIcon size={14} className={`text-fg-3 transition-transform ${open ? "rotate-180" : ""}`} />
      </button>

      {open && (
        <div
          role="menu"
          className="animate-pop absolute right-0 top-[calc(100%+8px)] z-50 w-64 overflow-hidden rounded-[20px] bg-solid p-1.5 shadow-pop"
        >
          <div className="flex items-center gap-3 rounded-2xl bg-muted p-3">
            <Avatar name={name} size={38} />
            <div className="min-w-0">
              <p className="truncate text-[13px] font-semibold text-fg">{name}</p>
              <p className="truncate text-[11.5px] text-fg-3">{user?.email}</p>
            </div>
          </div>
          <div className="px-3 pb-1 pt-2.5">
            <span className="badge badge-info">{user?.accessLabel}</span>
            {user?.department && <span className="badge badge-neutral ml-1.5">{user.department}</span>}
          </div>
          <Link
            href="/dashboard/settings"
            role="menuitem"
            onClick={() => setOpen(false)}
            className="mt-1 flex items-center gap-2.5 rounded-xl px-3 py-2.5 text-[13px] text-fg transition-colors hover:bg-muted"
          >
            <GearSixIcon size={17} className="text-fg-3" />
            Settings
          </Link>
          <button
            type="button"
            role="menuitem"
            onClick={() => {
              setOpen(false);
              onSignOut();
            }}
            className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2.5 text-[13px] text-danger transition-colors hover:bg-danger-soft"
          >
            <SignOutIcon size={17} />
            Sign out
          </button>
        </div>
      )}
    </div>
  );
}
