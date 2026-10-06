import type { ReactNode } from "react";
import type { Icon } from "@phosphor-icons/react";
import { cn } from "@/lib/utils";

export function EmptyState({
  icon: IconCmp,
  title,
  description,
  action,
  className,
}: {
  icon: Icon;
  title: string;
  description?: string;
  action?: ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("flex flex-col items-center justify-center px-6 py-14 text-center", className)}>
      <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-brand-soft text-brand">
        <IconCmp size={26} weight="duotone" />
      </div>
      <p className="font-display text-[16px] font-semibold text-fg">{title}</p>
      {description && <p className="mt-1 max-w-xs text-[13px] text-fg-3">{description}</p>}
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}

export function Skeleton({ className }: { className?: string }) {
  return <div className={cn("skeleton", className)} />;
}

/** Generic page-level loading placeholder: a stat row plus a couple of cards. */
export function PageSkeleton({ rows = 2 }: { rows?: number }) {
  return (
    <div className="space-y-5" aria-busy="true" aria-label="Loading">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <Skeleton className="h-28 rounded-[22px]" />
        <Skeleton className="h-28 rounded-[22px]" />
        <Skeleton className="h-28 rounded-[22px]" />
      </div>
      {Array.from({ length: rows }).map((_, i) => (
        <Skeleton key={i} className="h-56 rounded-[22px]" />
      ))}
    </div>
  );
}

export function Progress({
  value,
  className,
  tone = "brand",
}: {
  value: number;
  className?: string;
  tone?: "brand" | "success" | "warm";
}) {
  const pct = Math.max(0, Math.min(100, value));
  const fill =
    tone === "success"
      ? "linear-gradient(90deg, #0E9F6E, #4cc4a2)"
      : tone === "warm"
        ? "linear-gradient(90deg, #F7A274, #E8677E)"
        : "linear-gradient(90deg, #1D5FD1, #22B8F0)";
  return (
    <div className={cn("h-2 w-full overflow-hidden rounded-full bg-track", className)}>
      <div className="h-full rounded-full transition-[width] duration-500" style={{ width: `${pct}%`, background: fill }} />
    </div>
  );
}
