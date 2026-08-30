import type { HTMLAttributes } from "react";
import { cn } from "@/lib/utils";

export type BadgeTone = "neutral" | "success" | "warning" | "danger" | "info";

type BadgeProps = HTMLAttributes<HTMLSpanElement> & {
  tone?: BadgeTone;
  dot?: boolean;
};

const toneClass: Record<BadgeTone, string> = {
  neutral: "badge-neutral",
  success: "badge-success",
  warning: "badge-warning",
  danger:  "badge-danger",
  info:    "badge-info",
};

const dotColor: Record<BadgeTone, string> = {
  neutral: "var(--badge-neutral-text)",
  success: "var(--badge-success-text)",
  warning: "var(--badge-warning-text)",
  danger:  "var(--badge-danger-text)",
  info:    "var(--badge-info-text)",
};

export function Badge({ className, tone = "neutral", dot, children, ...props }: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 whitespace-nowrap rounded-full px-2.5 py-0.5 text-xs font-medium",
        toneClass[tone],
        className,
      )}
      {...props}
    >
      {dot && (
        <span className="h-1.5 w-1.5 shrink-0 rounded-full" style={{ background: dotColor[tone] }} />
      )}
      {children}
    </span>
  );
}
