"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  GitBranch,
  Wallet,
  Users,
  BookUser,
  PanelLeftClose,
  PanelLeftOpen,
  ChevronDown,
} from "lucide-react";
import { cn } from "@/lib/utils";

const NAV_SECTIONS = [
  {
    label: "Main",
    items: [
      { href: "/dashboard",          label: "Overview",  icon: LayoutDashboard },
      { href: "/dashboard/pipeline", label: "Pipeline",  icon: GitBranch },
    ],
  },
  {
    label: "Management",
    items: [
      { href: "/dashboard/finance",  label: "Finance",   icon: Wallet },
      { href: "/dashboard/team",     label: "Team",      icon: Users },
      { href: "/dashboard/contacts", label: "Contacts",  icon: BookUser },
    ],
  },
];

type SidebarProps = {
  collapsed: boolean;
  onToggleCollapsed: () => void;
};

export function Sidebar({ collapsed, onToggleCollapsed }: SidebarProps) {
  return (
    <aside
      className="hidden shrink-0 flex-col md:flex h-full"
      style={{
        width: collapsed ? "5rem" : "15rem",
        background: "var(--sidebar-bg)",
        borderRight: "1px solid var(--sidebar-border)",
        transition: "width 0.2s ease",
      }}
    >
      {/* Logo row */}
      <div
        className={cn(
          "flex h-14 shrink-0 items-center",
          collapsed ? "justify-center px-2" : "px-4 gap-2",
        )}
        style={{ borderBottom: "1px solid var(--sidebar-border)" }}
      >
        {!collapsed && (
          <span
            className="font-display font-bold text-white text-[17px] tracking-tight flex-1 truncate"
          >
            OA Digital
          </span>
        )}
        {collapsed && (
          <span className="font-display font-bold text-white text-[15px]">OA</span>
        )}
        <button
          type="button"
          onClick={onToggleCollapsed}
          className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg transition-colors"
          style={{ color: "var(--sidebar-section)" }}
          aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          onMouseEnter={(e) => {
            (e.currentTarget as HTMLElement).style.background = "var(--sidebar-hover)";
            (e.currentTarget as HTMLElement).style.color = "var(--sidebar-text-active)";
          }}
          onMouseLeave={(e) => {
            (e.currentTarget as HTMLElement).style.background = "transparent";
            (e.currentTarget as HTMLElement).style.color = "var(--sidebar-section)";
          }}
        >
          {collapsed
            ? <PanelLeftOpen className="size-4" />
            : <PanelLeftClose className="size-4" />}
        </button>
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto py-3 px-2 space-y-5">
        {NAV_SECTIONS.map((section) => (
          <div key={section.label}>
            {!collapsed && (
              <p
                className="px-2 mb-1 text-[10.5px] font-semibold uppercase tracking-widest"
                style={{ color: "var(--sidebar-section)" }}
              >
                {section.label}
              </p>
            )}
            <div className="space-y-0.5">
              {section.items.map((item) => (
                <NavItem
                  key={item.href}
                  href={item.href}
                  label={item.label}
                  icon={item.icon}
                  collapsed={collapsed}
                />
              ))}
            </div>
          </div>
        ))}
      </nav>

      {/* User footer */}
      <div
        className={cn(
          "shrink-0 p-2",
          collapsed ? "flex justify-center" : "",
        )}
        style={{ borderTop: "1px solid var(--sidebar-border)" }}
      >
        <button
          type="button"
          className={cn("snav-item w-full", collapsed && "is-collapsed")}
        >
          <div
            className="h-7 w-7 shrink-0 rounded-lg flex items-center justify-center text-[11px] font-bold text-white"
            style={{ background: "var(--oa-blue)" }}
          >
            AF
          </div>
          {!collapsed && (
            <>
              <div className="flex-1 min-w-0 text-left">
                <p className="text-[12.5px] font-medium truncate" style={{ color: "var(--sidebar-text-active)" }}>
                  Asante Frimpong
                </p>
                <p className="text-[11px] truncate" style={{ color: "var(--sidebar-text)" }}>
                  Admin
                </p>
              </div>
              <ChevronDown className="size-3.5 shrink-0" style={{ color: "var(--sidebar-section)" }} />
            </>
          )}
        </button>
      </div>
    </aside>
  );
}

function NavItem({
  href,
  label,
  icon: Icon,
  collapsed,
}: {
  href: string;
  label: string;
  icon: React.ElementType;
  collapsed: boolean;
}) {
  const pathname = usePathname();
  const isActive = pathname === href;

  return (
    <Link
      href={href}
      className={cn("snav-item", isActive && "active", collapsed && "is-collapsed")}
      title={collapsed ? label : undefined}
    >
      <Icon className="size-4 shrink-0" />
      {!collapsed && <span>{label}</span>}
    </Link>
  );
}
