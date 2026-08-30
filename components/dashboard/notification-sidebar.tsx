"use client";

import { AlertCircle, CheckCircle2, Clock, TrendingUp, X } from "lucide-react";
import { CONTACTS, TRANSACTIONS } from "@/lib/mock-data";
import { formatCurrency, getInitials } from "@/lib/utils";

const NOTIFICATIONS = [
  {
    id: "n1",
    title: "BookIt Ghana proposal deadline approaching",
    detail: "Send revised proposal by Friday",
    time: "3 days remaining",
    icon: AlertCircle,
    fg: "var(--badge-warning-text)",
    bg: "var(--badge-warning-bg)",
    unread: true,
  },
  {
    id: "n2",
    title: "Dwaso Farms awaiting contract sign-off",
    detail: "Decision expected end of week",
    time: "Updated 2 days ago",
    icon: Clock,
    fg: "var(--badge-info-text)",
    bg: "var(--badge-info-bg)",
    unread: true,
  },
  {
    id: "n3",
    title: "Farmercy project delivered and signed off",
    detail: "GHS 18,000 fully collected",
    time: "Jul 30",
    icon: CheckCircle2,
    fg: "var(--badge-success-text)",
    bg: "var(--badge-success-bg)",
    unread: false,
  },
  {
    id: "n4",
    title: "CommerceEveryday discovery call scheduled",
    detail: "Thursday 2 pm — referred by existing client",
    time: "Tomorrow",
    icon: TrendingUp,
    fg: "var(--brand)",
    bg: "var(--brand-soft)",
    unread: false,
  },
];

export const NOTIF_UNREAD = NOTIFICATIONS.filter((n) => n.unread).length;

const RECENT_TX = TRANSACTIONS.slice(0, 5);

type NotificationSidebarProps = {
  open: boolean;
  onClose: () => void;
};

export function NotificationSidebar({ open, onClose }: NotificationSidebarProps) {
  return (
    <aside
      className="hidden shrink-0 flex-col md:flex h-full overflow-hidden"
      style={{
        width: open ? "18rem" : "0",
        borderLeft: open ? "1px solid var(--header-border)" : "none",
        background: "var(--page-bg)",
        transition: "width 0.2s ease, border-color 0.2s ease",
      }}
      aria-hidden={!open}
    >
      <div className="flex h-full w-72 min-h-0 flex-col">
        <NotificationPanel onClose={onClose} />
      </div>
    </aside>
  );
}

function NotificationPanel({ onClose }: { onClose: () => void }) {
  return (
    <div className="flex h-full min-h-0 flex-col">
      {/* Header */}
      <div
        className="flex h-14 shrink-0 items-center justify-between px-5"
        style={{ borderBottom: "1px solid var(--header-border)" }}
      >
        <h2 className="font-semibold text-[14px]" style={{ color: "var(--text-primary)" }}>
          Notifications
        </h2>
        <button
          type="button"
          onClick={onClose}
          className="flex h-7 w-7 items-center justify-center rounded-lg transition-colors"
          style={{ color: "var(--text-muted)" }}
          onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.background = "var(--input-bg)"; }}
          onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.background = "transparent"; }}
          aria-label="Close notifications"
        >
          <X className="size-4" />
        </button>
      </div>

      {/* Scrollable content */}
      <div className="flex-1 min-h-0 overflow-y-auto px-5 py-5 space-y-7">

        {/* Notifications */}
        <Section title="Alerts">
          <ul className="flex flex-col gap-4">
            {NOTIFICATIONS.map((item) => {
              const Icon = item.icon;
              return (
                <li key={item.id} className="flex items-start gap-3">
                  <div
                    className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg"
                    style={{ background: item.bg, color: item.fg }}
                  >
                    <Icon className="size-3.5" strokeWidth={1.75} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p
                      className="text-[13px] leading-snug"
                      style={{
                        color: "var(--text-primary)",
                        fontWeight: item.unread ? 600 : 400,
                      }}
                    >
                      {item.title}
                    </p>
                    {item.detail && (
                      <p className="mt-0.5 line-clamp-2 text-[11.5px] leading-snug" style={{ color: "var(--text-secondary)" }}>
                        {item.detail}
                      </p>
                    )}
                    <p className="mt-0.5 text-[11px]" style={{ color: "var(--text-muted)" }}>
                      {item.time}
                    </p>
                  </div>
                  {item.unread && (
                    <span
                      className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full"
                      style={{ background: "var(--brand)" }}
                      aria-label="Unread"
                    />
                  )}
                </li>
              );
            })}
          </ul>
        </Section>

        {/* Recent activity (transactions) */}
        <Section title="Activity">
          <ul className="flex flex-col gap-4">
            {RECENT_TX.map((tx) => {
              const isIn = tx.type === "income" || tx.type === "payment_received";
              const isTransfer = tx.type === "transfer";
              const fg = isIn
                ? "var(--badge-success-text)"
                : isTransfer
                ? "var(--brand)"
                : "var(--badge-danger-text)";
              const bg = isIn
                ? "var(--badge-success-bg)"
                : isTransfer
                ? "var(--badge-info-bg)"
                : "var(--badge-danger-bg)";
              const symbol = isIn ? "+" : isTransfer ? "" : "-";
              return (
                <li key={tx.id} className="flex items-start gap-3">
                  <div
                    className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-[13px] font-bold"
                    style={{ background: bg, color: fg }}
                  >
                    {isIn ? "↓" : isTransfer ? "⇄" : "↑"}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-[13px] leading-snug truncate" style={{ color: "var(--text-primary)" }}>
                      {tx.description}
                    </p>
                    <p className="mt-0.5 text-[11px]" style={{ color: "var(--text-muted)" }}>
                      {tx.date}
                    </p>
                  </div>
                  <p className="text-[12px] font-semibold whitespace-nowrap shrink-0" style={{ color: fg }}>
                    {symbol}{formatCurrency(tx.amount, tx.currency)}
                  </p>
                </li>
              );
            })}
          </ul>
        </Section>

        {/* Contacts */}
        <Section title="Contacts">
          <ul className="flex flex-col gap-3">
            {CONTACTS.map((contact) => (
              <li key={contact.id} className="flex items-center gap-3">
                <div
                  className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-[10px] font-bold text-white"
                  style={{ background: "var(--brand-strong)" }}
                >
                  {getInitials(contact.name)}
                </div>
                <div className="min-w-0">
                  <p className="truncate text-[13px] font-medium" style={{ color: "var(--text-primary)" }}>
                    {contact.name}
                  </p>
                  <p className="truncate text-[11px]" style={{ color: "var(--text-muted)" }}>
                    {contact.company}
                  </p>
                </div>
              </li>
            ))}
          </ul>
        </Section>

      </div>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section>
      <h3
        className="mb-3.5 text-[12px] font-semibold uppercase tracking-wider"
        style={{ color: "var(--text-muted)" }}
      >
        {title}
      </h3>
      {children}
    </section>
  );
}
