"use client";

import { CheckIcon, MinusIcon, XIcon } from "@phosphor-icons/react";
import { Badge, type BadgeTone } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

export type RequestStatus = "pending" | "approved" | "declined" | "withdrawn" | "paid";

const STATUS: Record<RequestStatus, { label: string; tone: BadgeTone }> = {
  pending: { label: "Pending", tone: "warning" },
  approved: { label: "Approved", tone: "success" },
  paid: { label: "Paid", tone: "info" },
  declined: { label: "Declined", tone: "danger" },
  withdrawn: { label: "Withdrawn", tone: "neutral" },
};

export function RequestStatusBadge({ status, labelOverride }: { status: RequestStatus; labelOverride?: string }) {
  const s = STATUS[status];
  return (
    <Badge tone={s.tone} dot>
      {labelOverride ?? s.label}
    </Badge>
  );
}

export type StepView = {
  kind: "line_manager" | "ceo";
  status: "pending" | "approved" | "declined" | "skipped";
  approver: string;
  decidedBy: string | null;
  decidedAt: number | null;
  note: string | null;
};

/** Vertical timeline of approval steps. */
export function StepsTimeline({
  steps,
  autoApproved,
  requestStatus,
}: {
  steps: StepView[];
  autoApproved?: boolean;
  /** When the request was withdrawn, unfinished steps were never reached. */
  requestStatus?: RequestStatus;
}) {
  if (steps.length === 0) {
    return <p className="text-[12.5px] text-fg-3">{autoApproved ? "Approved automatically (CEO)." : "No approval needed."}</p>;
  }
  return (
    <ol className="space-y-3">
      {steps.map((s, i) => {
        const done = s.status === "approved";
        const declined = s.status === "declined";
        const skipped = s.status === "skipped";
        return (
          <li key={i} className="flex gap-3">
            <span
              className={cn(
                "mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full",
                done && "badge-success",
                declined && "badge-danger",
                (skipped || s.status === "pending") && "bg-muted text-fg-3 shadow-[inset_0_0_0_1px_var(--divider)]",
              )}
            >
              {done ? <CheckIcon size={13} weight="bold" /> : declined ? <XIcon size={13} weight="bold" /> : skipped ? <MinusIcon size={13} /> : <span className="h-1.5 w-1.5 rounded-full bg-current" />}
            </span>
            <div className="min-w-0 text-[12.5px]">
              <p className="font-semibold text-fg">
                {s.kind === "line_manager" ? "Line manager" : "CEO"} · {s.approver}
              </p>
              <p className="text-fg-3">
                {s.status === "pending"
                  ? requestStatus === "withdrawn"
                    ? "Not reached (withdrawn)"
                    : "Waiting"
                  : skipped
                    ? "Not needed"
                    : `${done ? "Approved" : "Declined"}${s.decidedBy ? ` by ${s.decidedBy} on their behalf` : ""}${s.decidedAt ? ` · ${new Date(s.decidedAt).toLocaleDateString("en-GB", { day: "numeric", month: "short" })}` : ""}`}
              </p>
              {s.note && <p className="mt-1 rounded-xl bg-muted px-2.5 py-1.5 text-fg-2">&ldquo;{s.note}&rdquo;</p>}
            </div>
          </li>
        );
      })}
    </ol>
  );
}
