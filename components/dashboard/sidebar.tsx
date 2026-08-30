"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard,
  GitBranch,
  Wallet,
  Users,
  BookUser,
  PanelLeftClose,
  PanelLeftOpen,
  ChevronDown,
  Settings,
  LogOut,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useRole } from "@/lib/role-context";

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
  const [popoverOpen, setPopoverOpen] = useState(false);
  const [signOutModalOpen, setSignOutModalOpen] = useState(false);
  const popoverRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const { user, logout } = useRole();

  const initials = user?.initials ?? "OA";
  const displayName = user?.name ?? "User";
  const roleLabel = user?.role === "management" ? "Management" : user?.role === "sales" ? "Sales" : "";

  useEffect(() => {
    if (!popoverOpen) return;
    function handler(e: MouseEvent) {
      if (popoverRef.current && !popoverRef.current.contains(e.target as Node)) {
        setPopoverOpen(false);
      }
    }
    window.addEventListener("mousedown", handler);
    return () => window.removeEventListener("mousedown", handler);
  }, [popoverOpen]);

  return (
    <>
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
            <span className="font-display font-bold text-white text-[17px] tracking-tight flex-1 truncate">
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
            {collapsed ? <PanelLeftOpen className="size-4" /> : <PanelLeftClose className="size-4" />}
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
          className={cn("shrink-0 p-2 relative", collapsed && "flex justify-center")}
          style={{ borderTop: "1px solid var(--sidebar-border)" }}
          ref={popoverRef}
        >
          {/* Popover */}
          {popoverOpen && (
            <div
              className="absolute bottom-[calc(100%+8px)] left-2 right-2 rounded-xl overflow-hidden shadow-xl z-50"
              style={{
                background: "var(--card-bg)",
                border: "1px solid var(--divider)",
                minWidth: "10rem",
              }}
            >
              {/* Role badge */}
              <div className="px-3 py-2.5" style={{ borderBottom: "1px solid var(--divider)" }}>
                <p className="text-[11.5px]" style={{ color: "var(--text-muted)" }}>{user?.email}</p>
                <span
                  className="inline-block mt-1 text-[10.5px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full"
                  style={{
                    background: user?.role === "management" ? "var(--brand-soft)" : "var(--badge-success-bg)",
                    color: user?.role === "management" ? "var(--brand)" : "var(--badge-success-text)",
                  }}
                >
                  {roleLabel}
                </span>
              </div>
              <Link
                href="/dashboard/settings"
                onClick={() => setPopoverOpen(false)}
                className="flex items-center gap-2.5 px-3 py-2.5 text-[13px] transition-colors"
                style={{ color: "var(--text-primary)" }}
                onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.background = "var(--input-bg)"; }}
                onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.background = "transparent"; }}
              >
                <Settings className="size-3.5 shrink-0" style={{ color: "var(--text-muted)" }} />
                Settings
              </Link>
              <div style={{ height: "1px", background: "var(--divider)" }} />
              <button
                type="button"
                onClick={() => { setPopoverOpen(false); setSignOutModalOpen(true); }}
                className="flex w-full items-center gap-2.5 px-3 py-2.5 text-[13px] transition-colors"
                style={{ color: "var(--badge-danger-text)" }}
                onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.background = "var(--badge-danger-bg)"; }}
                onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.background = "transparent"; }}
              >
                <LogOut className="size-3.5 shrink-0" />
                Sign out
              </button>
            </div>
          )}

          <button
            type="button"
            onClick={() => setPopoverOpen((o) => !o)}
            className={cn("snav-item w-full", collapsed && "is-collapsed", popoverOpen && "active")}
          >
            <div
              className="h-7 w-7 shrink-0 rounded-lg flex items-center justify-center text-[11px] font-bold text-white"
              style={{ background: "var(--oa-blue)" }}
            >
              {initials}
            </div>
            {!collapsed && (
              <>
                <div className="flex-1 min-w-0 text-left">
                  <p className="text-[12.5px] font-medium truncate" style={{ color: "var(--sidebar-text-active)" }}>
                    {displayName}
                  </p>
                  <p className="text-[11px] truncate" style={{ color: "var(--sidebar-text)" }}>
                    {roleLabel}
                  </p>
                </div>
                <ChevronDown
                  className="size-3.5 shrink-0 transition-transform"
                  style={{
                    color: "var(--sidebar-section)",
                    transform: popoverOpen ? "rotate(180deg)" : "rotate(0deg)",
                  }}
                />
              </>
            )}
          </button>
        </div>
      </aside>

      {/* Sign out confirmation modal */}
      {signOutModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ background: "rgba(7,20,38,0.55)", backdropFilter: "blur(4px)" }}
          onClick={(e) => { if (e.target === e.currentTarget) setSignOutModalOpen(false); }}
        >
          <div
            className="w-full max-w-sm rounded-2xl shadow-2xl p-6"
            style={{ background: "var(--card-bg)", border: "1px solid var(--divider)" }}
          >
            <div
              className="flex h-11 w-11 items-center justify-center rounded-xl mb-4"
              style={{ background: "var(--badge-danger-bg)" }}
            >
              <LogOut className="size-5" style={{ color: "var(--badge-danger-text)" }} />
            </div>
            <h2 className="font-semibold text-[16px] mb-1" style={{ color: "var(--text-primary)" }}>
              Sign out?
            </h2>
            <p className="text-[13.5px] mb-6" style={{ color: "var(--text-secondary)" }}>
              You'll be returned to the login screen. Any unsaved changes will be lost.
            </p>
            <div className="flex gap-2 justify-end">
              <button
                type="button"
                onClick={() => setSignOutModalOpen(false)}
                className="btn-secondary px-4 py-2 rounded-xl text-[13px] font-medium"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  setSignOutModalOpen(false);
                  logout();
                  router.push("/login");
                }}
                className="px-4 py-2 rounded-xl text-[13px] font-semibold text-white transition-opacity hover:opacity-90"
                style={{ background: "var(--badge-danger-text)" }}
              >
                Sign out
              </button>
            </div>
          </div>
        </div>
      )}
    </>
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
