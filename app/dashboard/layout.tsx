"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { SignOutIcon } from "@phosphor-icons/react";
import { Sidebar } from "@/components/dashboard/sidebar";
import { TopHeader } from "@/components/dashboard/top-header";
import { NotificationSidebar } from "@/components/dashboard/notification-sidebar";
import { CommandPalette } from "@/components/dashboard/command-palette";
import { ConfirmDialog } from "@/components/ui/modal";
import { BrandMark } from "@/components/ui/brand-mark";
import { useRole } from "@/lib/role-context";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [signOutOpen, setSignOutOpen] = useState(false);
  const { hydrated, user, logout } = useRole();
  const router = useRouter();

  useEffect(() => {
    if (hydrated && !user) router.replace("/login");
  }, [hydrated, user, router]);

  // ⌘K / Ctrl+K opens the command palette
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setSearchOpen((o) => !o);
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const closeMobileNav = useCallback(() => setMobileNavOpen(false), []);
  const closeNotif = useCallback(() => setNotifOpen(false), []);
  const closeSearch = useCallback(() => setSearchOpen(false), []);
  const askSignOut = useCallback(() => setSignOutOpen(true), []);

  if (!hydrated || !user) {
    return (
      <div className="flex h-dvh flex-col items-center justify-center gap-4">
        <BrandMark size={48} className="animate-pulse" />
        <p className="text-[13px] text-fg-3">Loading your workspace…</p>
      </div>
    );
  }

  return (
    <div className="flex h-dvh gap-3 p-2 md:p-3">
      <Sidebar
        collapsed={collapsed}
        onToggleCollapsed={() => setCollapsed((c) => !c)}
        mobileOpen={mobileNavOpen}
        onMobileClose={closeMobileNav}
        onSignOut={askSignOut}
      />
      <div className="flex min-h-0 min-w-0 flex-1 flex-col">
        <TopHeader
          onOpenNav={() => setMobileNavOpen(true)}
          onOpenSearch={() => setSearchOpen(true)}
          onBellClick={() => setNotifOpen((o) => !o)}
          onSignOut={askSignOut}
          notifOpen={notifOpen}
        />
        <main className="min-h-0 flex-1 overflow-y-auto px-1 pb-8 pt-2 md:px-2">
          <div className="mx-auto w-full max-w-360">{children}</div>
        </main>
      </div>

      <NotificationSidebar open={notifOpen} onClose={closeNotif} />
      <CommandPalette open={searchOpen} onClose={closeSearch} onSignOut={askSignOut} />
      <ConfirmDialog
        open={signOutOpen}
        title="Sign out?"
        message="You'll be returned to the sign-in screen. Any unsaved changes will be lost."
        confirmLabel="Sign out"
        icon={SignOutIcon}
        onClose={() => setSignOutOpen(false)}
        onConfirm={async () => {
          setSignOutOpen(false);
          await logout();
          router.push("/login");
        }}
      />
    </div>
  );
}
