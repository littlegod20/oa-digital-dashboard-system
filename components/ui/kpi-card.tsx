import type { ReactNode } from "react";
import { Card } from "@/components/ui/card";

type KpiCardProps = {
  label: string;
  value: string;
  delta?: string;
  deltaUp?: boolean;
  accentBg?: string;
  accentColor?: string;
  icon?: ReactNode;
  tint?: boolean;
};

export function KpiCard({
  label,
  value,
  delta,
  deltaUp = true,
  accentBg,
  accentColor,
  icon,
  tint = false,
}: KpiCardProps) {
  return (
    <Card
      className="flex flex-col gap-3 p-5"
      style={tint ? { background: "var(--metric-tint)" } : undefined}
    >
      <div className="flex items-start justify-between gap-3">
        <p className="text-xs font-medium" style={{ color: "var(--text-muted)" }}>
          {label}
        </p>
        {icon && (
          <div
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl"
            style={{ background: accentBg, color: accentColor }}
          >
            {icon}
          </div>
        )}
      </div>

      <p
        className="truncate text-2xl font-semibold tracking-tight font-display"
        style={{ color: "var(--text-primary)" }}
        title={value}
      >
        {value}
      </p>

      {delta && (
        <div className="flex items-center gap-1.5">
          <span
            className="flex items-center gap-0.5 text-xs font-medium"
            style={{ color: deltaUp ? "var(--badge-success-text)" : "var(--badge-danger-text)" }}
          >
            {deltaUp ? (
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="18 15 12 9 6 15" />
              </svg>
            ) : (
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="6 9 12 15 18 9" />
              </svg>
            )}
            {delta}
          </span>
        </div>
      )}
    </Card>
  );
}
