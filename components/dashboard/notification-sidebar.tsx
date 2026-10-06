"use client";

import { useEffect } from "react";
import type { Icon } from "@phosphor-icons/react";
import {
  ArrowDownLeftIcon,
  ArrowUpRightIcon,
  ArrowsLeftRightIcon,
  CalendarCheckIcon,
  CheckCircleIcon,
  HourglassMediumIcon,
  WarningCircleIcon,
  XIcon,
} from "@phosphor-icons/react";
import { CONTACTS, TRANSACTIONS } from "@/lib/mock-data";
import { cn, formatCurrency, formatRelativeDate } from "@/lib/utils";
import { Avatar } from "@/components/ui/avatar";

type Notification = {
  id: string;
  title: string;
  detail: string;
  time: string;
  icon: Icon;
  tone: "warning" | "info" | "success" | "violet";
  unread: boolean;
};

const NOTIFICATIONS: Notification[] = [
  {
    id: "n1",
    title: "BookIt Ghana proposal deadline approaching",
    detail: "Send revised proposal by Friday",
    time: "3 days remaining",
    icon: WarningCircleIcon,
    tone: "warning",
    unread: true,
  },
  {
    id: "n2",
    title: "Dwaso Farms awaiting contract sign-off",
    detail: "Decision expected end of week",
    time: "Updated 2 days ago",
    icon: HourglassMediumIcon,
    tone: "info",
    unread: true,
  },
  {
    id: "n3",
    title: "Farmercy project delivered and signed off",
    detail: "GHS 18,000 fully collected",
    time: "Jul 30",
    icon: CheckCircleIcon,
    tone: "success",
    unread: false,
  },
  {
    id: "n4",
    title: "CommerceEveryday discovery call scheduled",
    detail: "Thursday 2 pm — referred by existing client",
    time: "Tomorrow",
    icon: CalendarCheckIcon,
    tone: "violet",
    unread: false,
  },
];

export const NOTIF_UNREAD = NOTIFICATIONS.filter((n) => n.unread).length;

const RECENT_TX = TRANSACTIONS.slice(0, 5);

type NotificationSidebarProps = {
  open: boolean;
  onClose: () => void;
};

/** Floating activity panel that slides over the content from the right. */
export function NotificationSidebar({ open, onClose }: NotificationSidebarProps) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-40">
      <div className="animate-fade absolute inset-0 bg-[rgba(8,12,21,0.18)]" onClick={onClose} />
      <aside
        aria-label="Notifications"
        className="animate-slide absolute inset-y-2 right-2 flex w-[22rem] max-w-[calc(100vw-1rem)] flex-col overflow-hidden rounded-[26px] bg-solid shadow-pop md:inset-y-3 md:right-3"
      >
        <div className="flex h-[4.5rem] shrink-0 items-center justify-between px-6">
          <div>
            <h2 className="font-display text-[18px] font-semibold text-fg">Notifications</h2>
            <p className="text-[11.5px] text-fg-3">{NOTIF_UNREAD} unread</p>
          </div>
          <button type="button" onClick={onClose} className="icon-btn icon-btn-sm" aria-label="Close notifications">
            <XIcon size={18} />
          </button>
        </div>

        <div className="min-h-0 flex-1 space-y-7 overflow-y-auto px-6 pb-6">
          <Section title="Alerts">
            <ul className="space-y-1">
              {NOTIFICATIONS.map((item) => {
                const IconCmp = item.icon;
                return (
                  <li key={item.id} className="-mx-2 flex items-start gap-3 rounded-2xl p-2 transition-colors hover:bg-muted">
                    <div className={cn("flex h-9 w-9 shrink-0 items-center justify-center rounded-full", `badge-${item.tone}`)}>
                      <IconCmp size={18} weight="duotone" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className={cn("text-[13px] leading-snug text-fg", item.unread ? "font-semibold" : "font-medium")}>
                        {item.title}
                      </p>
                      <p className="mt-0.5 line-clamp-2 text-[12px] leading-snug text-fg-2">{item.detail}</p>
                      <p className="mt-1 text-[11px] text-fg-3">{item.time}</p>
                    </div>
                    {item.unread && <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-peach" aria-label="Unread" />}
                  </li>
                );
              })}
            </ul>
          </Section>

          <Section title="Recent activity">
            <ul className="space-y-3">
              {RECENT_TX.map((tx) => {
                const isIn = tx.type === "income" || tx.type === "payment_received";
                const isTransfer = tx.type === "transfer";
                const IconCmp = isIn ? ArrowDownLeftIcon : isTransfer ? ArrowsLeftRightIcon : ArrowUpRightIcon;
                return (
                  <li key={tx.id} className="flex items-center gap-3">
                    <div
                      className={cn(
                        "flex h-9 w-9 shrink-0 items-center justify-center rounded-full",
                        isIn ? "badge-success" : isTransfer ? "badge-info" : "badge-danger",
                      )}
                    >
                      <IconCmp size={16} weight="bold" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-[13px] font-medium text-fg">{tx.description}</p>
                      <p className="text-[11px] text-fg-3">{formatRelativeDate(tx.date)}</p>
                    </div>
                    <p
                      className={cn(
                        "tabular shrink-0 whitespace-nowrap text-[12px] font-semibold",
                        isIn ? "text-success" : isTransfer ? "text-info" : "text-fg",
                      )}
                    >
                      {isIn ? "+" : isTransfer ? "" : "−"}
                      {formatCurrency(tx.amount, tx.currency)}
                    </p>
                  </li>
                );
              })}
            </ul>
          </Section>

          <Section title="Key contacts">
            <ul className="space-y-3">
              {CONTACTS.map((contact) => (
                <li key={contact.id} className="flex items-center gap-3">
                  <Avatar name={contact.name} size={36} />
                  <div className="min-w-0">
                    <p className="truncate text-[13px] font-medium text-fg">{contact.name}</p>
                    <p className="truncate text-[11px] text-fg-3">{contact.company}</p>
                  </div>
                </li>
              ))}
            </ul>
          </Section>
        </div>
      </aside>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section>
      <h3 className="eyebrow mb-3">{title}</h3>
      {children}
    </section>
  );
}
