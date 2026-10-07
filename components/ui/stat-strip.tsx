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

/**
 * One frosted card holding several headline numbers, each with a round icon.
 * Four stats: a 2×2 grid until xl, then one row. Three: stacked on phones, one row from sm.
 */
export function StatStrip({ stats, className }: { stats: Stat[]; className?: string }) {
  const four = stats.length === 4;
  return (
    <div className={cn("card grid", four ? "grid-cols-2 xl:grid-cols-4" : "grid-cols-1 divide-y divide-line sm:grid-cols-3 sm:divide-x sm:divide-y-0", className)}>
      {stats.map((s, i) => (
        <StatItem
          key={s.label}
          {...s}
          className={
            four
              ? cn(
                  "border-line",
                  i % 2 === 0 && "border-r", // left column of the 2×2
                  i < 2 && "border-b", // top row of the 2×2
                  "xl:border-b-0",
                  i < 3 ? "xl:border-r" : "xl:border-r-0",
                )
              : undefined
          }
        />
      ))}
    </div>
  );
}

function StatItem({ label, value, icon: IconCmp, hint, trend, className }: Stat & { className?: string }) {
  return (
    <div className={cn("flex min-w-0 items-center gap-3 p-4 sm:gap-4 sm:p-5 md:p-6", className)}>
      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-solid text-brand shadow-[0_0_0_1px_var(--divider),0_6px_16px_-8px_rgba(29,95,209,0.45)] sm:h-12 sm:w-12">
        <IconCmp size={20} weight="duotone" className="sm:hidden" />
        <IconCmp size={22} weight="duotone" className="hidden sm:block" />
      </div>
      <div className="min-w-0">
        <p className="truncate text-[11.5px] font-medium text-fg-3 sm:text-[12px]">{label}</p>
        <p className="tabular mt-0.5 truncate font-display text-[19px] font-semibold leading-tight text-fg sm:text-[22px]" title={value}>
          {value}
        </p>
        {hint && (
          <p
            className={cn(
              "mt-0.5 flex min-w-0 items-center gap-1 text-[11px] font-medium sm:text-[11.5px]",
              trend === "up" ? "text-success" : trend === "down" ? "text-danger" : "text-fg-3",
            )}
          >
            {trend === "up" && <TrendUpIcon size={13} weight="bold" className="shrink-0" />}
            {trend === "down" && <TrendDownIcon size={13} weight="bold" className="shrink-0" />}
            <span className="truncate">{hint}</span>
          </p>
        )}
      </div>
    </div>
  );
}
