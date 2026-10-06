"use client";

import type { Icon } from "@phosphor-icons/react";
import { TrendDownIcon, TrendUpIcon } from "@phosphor-icons/react";
import { cn } from "@/lib/utils";

export type Stat = {
  label: string;
  value: string;
  icon: Icon;
  hint?: string;
  trend?: "up" | "down";
};

/** One frosted card holding several headline numbers, each with a round icon. */
export function StatStrip({ stats, className }: { stats: Stat[]; className?: string }) {
  return (
    <div className={cn("card grid grid-cols-1 divide-y divide-line sm:grid-cols-3 sm:divide-x sm:divide-y-0", className)}>
      {stats.map((s) => (
        <StatItem key={s.label} {...s} />
      ))}
    </div>
  );
}

function StatItem({ label, value, icon: IconCmp, hint, trend }: Stat) {
  return (
    <div className="flex items-center gap-4 p-5 md:p-6">
      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-solid text-brand shadow-[0_0_0_1px_var(--divider),0_6px_16px_-8px_rgba(29,95,209,0.45)]">
        <IconCmp size={22} weight="duotone" />
      </div>
      <div className="min-w-0">
        <p className="text-[12px] font-medium text-fg-3">{label}</p>
        <p className="tabular mt-0.5 truncate font-display text-[22px] font-semibold leading-tight text-fg" title={value}>
          {value}
        </p>
        {hint && (
          <p
            className={cn(
              "mt-0.5 flex items-center gap-1 text-[11.5px] font-medium",
              trend === "up" ? "text-success" : trend === "down" ? "text-danger" : "text-fg-3",
            )}
          >
            {trend === "up" && <TrendUpIcon size={13} weight="bold" />}
            {trend === "down" && <TrendDownIcon size={13} weight="bold" />}
            {hint}
          </p>
        )}
      </div>
    </div>
  );
}
