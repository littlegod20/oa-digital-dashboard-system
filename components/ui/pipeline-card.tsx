"use client";

import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { BadgeTone } from "@/components/ui/badge";
import { formatCurrency } from "@/lib/utils";
import type { Deal } from "@/lib/types";
import { PHASE_META } from "@/lib/types";
import { ChevronRight, Pencil, Trash2 } from "lucide-react";

interface PipelineCardProps {
  deal: Deal;
  onEdit?: () => void;
  onDelete?: () => void;
}

const PHASE_TONE: Record<string, BadgeTone> = {
  lead:     "neutral",
  proposal: "info",
  await:    "warning",
  meet:     "info",
  action:   "warning",
  progress: "success",
  done:     "success",
  hold:     "neutral",
};

export function PipelineCard({ deal, onEdit, onDelete }: PipelineCardProps) {
  const outstanding = deal.value - deal.paid;
  const progress = deal.value > 0 ? (deal.paid / deal.value) * 100 : 0;
  const phaseMeta = PHASE_META[deal.phase];
  const tone = PHASE_TONE[deal.phase] ?? "neutral";

  return (
    <Card className="p-4 space-y-3">
      {/* Top row */}
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2 flex-wrap">
            <p className="font-semibold text-[14px] leading-tight" style={{ color: "var(--text-primary)" }}>
              {deal.client}
            </p>
            <Badge tone={tone} dot>{phaseMeta?.label ?? deal.phase}</Badge>
          </div>
          <p className="text-[12.5px] mt-0.5" style={{ color: "var(--text-secondary)" }}>
            {deal.title}
          </p>
        </div>
        <div className="text-right shrink-0">
          <p className="font-display font-bold text-[15px]" style={{ color: "var(--text-primary)" }}>
            {formatCurrency(deal.value, deal.currency)}
          </p>
          {outstanding > 0 && (
            <p className="text-[11px] mt-0.5" style={{ color: "var(--text-muted)" }}>
              {formatCurrency(outstanding, deal.currency)} remaining
            </p>
          )}
        </div>
      </div>

      {/* Progress bar */}
      <div>
        <div className="flex items-center justify-between mb-1.5">
          <span className="text-[11px]" style={{ color: "var(--text-muted)" }}>
            Collected {progress.toFixed(0)}%
          </span>
          <span className="text-[11px]" style={{ color: "var(--badge-success-text)" }}>
            {formatCurrency(deal.paid, deal.currency)}
          </span>
        </div>
        <div className="h-1.5 rounded-full overflow-hidden" style={{ background: "var(--progress-bg)" }}>
          <div
            className="h-full rounded-full transition-all"
            style={{
              width: `${progress}%`,
              background: progress >= 100
                ? "var(--badge-success-text)"
                : progress > 50
                ? "var(--oa-blue)"
                : "var(--oa-amber)",
            }}
          />
        </div>
      </div>

      {/* Next action */}
      {deal.nextAction && (
        <div
          className="flex items-center gap-2 rounded-xl px-3 py-2"
          style={{ background: "var(--input-bg)" }}
        >
          <ChevronRight className="size-3.5 shrink-0" style={{ color: "var(--brand)" }} />
          <p className="text-[12px] flex-1 truncate" style={{ color: "var(--text-secondary)" }}>
            {deal.nextAction}
          </p>
          {deal.nextActionDate && (
            <span className="text-[11px] shrink-0" style={{ color: "var(--text-muted)" }}>
              {new Date(deal.nextActionDate).toLocaleDateString("en-GB", { day: "numeric", month: "short" })}
            </span>
          )}
        </div>
      )}

      {(onEdit || onDelete) && (
        <div className="flex justify-end gap-2 pt-1">
          {onEdit && (
            <button
              type="button"
              onClick={onEdit}
              className="btn-ghost inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-[12px] font-medium"
            >
              <Pencil className="size-3.5" />
              Edit
            </button>
          )}
          {onDelete && (
            <button
              type="button"
              onClick={onDelete}
              className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-[12px] font-medium"
              style={{ color: "var(--badge-danger-text)" }}
            >
              <Trash2 className="size-3.5" />
              Remove
            </button>
          )}
        </div>
      )}
    </Card>
  );
}
