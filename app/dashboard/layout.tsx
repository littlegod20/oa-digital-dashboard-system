"use client";

import { useState } from "react";
import { Sidebar } from "@/components/dashboard/sidebar";
import { TopHeader } from "@/components/dashboard/top-header";
import { NotificationSidebar } from "@/components/dashboard/notification-sidebar";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const [collapsed, setCollapsed] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);

  return (
    <div className="flex h-dvh" style={{ background: "var(--page-bg)" }}>
      <Sidebar collapsed={collapsed} onToggleCollapsed={() => setCollapsed((c) => !c)} />
      <div className="flex min-h-0 min-w-0 flex-1 flex-col">
        <TopHeader
          onBellClick={() => setNotifOpen((o) => !o)}
          notifOpen={notifOpen}
        />
        <main className="min-h-0 flex-1 overflow-y-auto p-4 md:p-6">
          {children}
        </main>
      </div>
      <NotificationSidebar open={notifOpen} onClose={() => setNotifOpen(false)} />
    </div>
  );
}
