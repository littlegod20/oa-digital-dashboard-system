"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { useRouter } from "next/navigation";
import type { Icon } from "@phosphor-icons/react";
import {
  ArrowElbowDownLeftIcon,
  MagnifyingGlassIcon,
  MoonIcon,
  SignOutIcon,
  SunIcon,
} from "@phosphor-icons/react";
import { cn } from "@/lib/utils";
import { useTheme } from "@/lib/theme";
import { ALL_NAV_ITEMS } from "./nav";

type Command = {
  id: string;
  label: string;
  hint: string;
  group: "Go to" | "Actions";
  icon: Icon;
  run: () => void;
};

export function CommandPalette({
  open,
  onClose,
  onSignOut,
}: {
  open: boolean;
  onClose: () => void;
  onSignOut: () => void;
}) {
  if (!open) return null;
  return <PaletteDialog onClose={onClose} onSignOut={onSignOut} />;
}

function PaletteDialog({ onClose, onSignOut }: { onClose: () => void; onSignOut: () => void }) {
  const router = useRouter();
  const { resolved, toggle } = useTheme();
  const [query, setQuery] = useState("");
  const [active, setActive] = useState(0);
  const listRef = useRef<HTMLUListElement>(null);

  const commands = useMemo<Command[]>(
    () => [
      ...ALL_NAV_ITEMS.map((item) => ({
        id: item.href,
        label: item.label,
        hint: item.description,
        group: "Go to" as const,
        icon: item.icon,
        run: () => router.push(item.href),
      })),
      {
        id: "theme",
        label: resolved === "dark" ? "Switch to light mode" : "Switch to dark mode",
        hint: "Appearance",
        group: "Actions",
        icon: resolved === "dark" ? SunIcon : MoonIcon,
        run: toggle,
      },
      {
        id: "signout",
        label: "Sign out",
        hint: "End your session",
        group: "Actions",
        icon: SignOutIcon,
        run: onSignOut,
      },
    ],
    [router, resolved, toggle, onSignOut],
  );

  const q = query.trim().toLowerCase();
  const results = q
    ? commands.filter((c) => c.label.toLowerCase().includes(q) || c.hint.toLowerCase().includes(q))
    : commands;
  const current = Math.min(active, Math.max(results.length - 1, 0));

  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = prev; };
  }, []);

  useEffect(() => {
    listRef.current?.querySelector(`[data-index="${current}"]`)?.scrollIntoView({ block: "nearest" });
  }, [current]);

  function runCommand(cmd: Command | undefined) {
    if (!cmd) return;
    onClose();
    cmd.run();
  }

  function onKeyDown(e: React.KeyboardEvent) {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActive((current + 1) % Math.max(results.length, 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActive((current - 1 + results.length) % Math.max(results.length, 1));
    } else if (e.key === "Enter") {
      e.preventDefault();
      runCommand(results[current]);
    } else if (e.key === "Escape") {
      onClose();
    }
  }

  let lastGroup = "";

  return createPortal(
    <div
      className="animate-fade fixed inset-0 z-[70] flex items-start justify-center bg-[rgba(8,12,21,0.45)] p-4 pt-[12vh] backdrop-blur-sm"
      onMouseDown={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Command palette"
        className="animate-pop w-full max-w-lg overflow-hidden rounded-[24px] bg-solid shadow-pop"
        onKeyDown={onKeyDown}
      >
        <div className="flex items-center gap-3 border-b border-line px-5">
          <MagnifyingGlassIcon size={20} className="shrink-0 text-fg-3" />
          <input
            autoFocus
            value={query}
            onChange={(e) => { setQuery(e.target.value); setActive(0); }}
            placeholder="Search pages and actions…"
            className="h-14 w-full bg-transparent text-[14px] text-fg outline-none placeholder:text-fg-3 focus-visible:outline-none"
            aria-label="Search"
            role="combobox"
            aria-expanded="true"
            aria-controls="command-results"
          />
          <kbd className="kbd">Esc</kbd>
        </div>

        <ul id="command-results" ref={listRef} role="listbox" className="max-h-[50vh] overflow-y-auto p-2">
          {results.length === 0 && (
            <li className="px-4 py-10 text-center text-[13px] text-fg-3">No results for “{query}”</li>
          )}
          {results.map((cmd, i) => {
            const showGroup = cmd.group !== lastGroup;
            lastGroup = cmd.group;
            const IconCmp = cmd.icon;
            const selected = i === current;
            return (
              <li key={cmd.id} role="presentation">
                {showGroup && <p className="eyebrow px-3 pb-1.5 pt-3">{cmd.group}</p>}
                <button
                  type="button"
                  role="option"
                  aria-selected={selected}
                  data-index={i}
                  onMouseMove={() => setActive(i)}
                  onClick={() => runCommand(cmd)}
                  className={cn(
                    "flex w-full items-center gap-3 rounded-2xl px-3 py-2.5 text-left transition-colors",
                    selected && "bg-muted",
                  )}
                >
                  <div
                    className={cn(
                      "flex h-9 w-9 shrink-0 items-center justify-center rounded-full",
                      selected ? "bg-brand-soft text-brand" : "bg-muted text-fg-2",
                    )}
                  >
                    <IconCmp size={18} weight="duotone" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-[13px] font-semibold text-fg">{cmd.label}</p>
                    <p className="truncate text-[11.5px] text-fg-3">{cmd.hint}</p>
                  </div>
                  {selected && <ArrowElbowDownLeftIcon size={16} className="text-fg-3" />}
                </button>
              </li>
            );
          })}
        </ul>
      </div>
    </div>,
    document.body,
  );
}
