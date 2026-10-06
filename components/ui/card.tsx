import type { HTMLAttributes, ReactNode } from "react";
import { cn } from "@/lib/utils";

/** Frosted card. `flush` drops the padding for edge-to-edge lists and tables. */
export function Card({ className, flush, ...props }: HTMLAttributes<HTMLDivElement> & { flush?: boolean }) {
  return <div className={cn("card", !flush && "p-5 md:p-6", className)} {...props} />;
}

/** Dark feature card — use at most one per page for emphasis. */
export function InkCard({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("ink p-5 md:p-6", className)} {...props} />;
}

export function CardTitle({ className, ...props }: HTMLAttributes<HTMLHeadingElement>) {
  return (
    <h2
      className={cn("font-display text-[17px] font-semibold leading-tight text-fg", className)}
      {...props}
    />
  );
}

export function CardHeader({
  title,
  description,
  action,
  className,
}: {
  title: ReactNode;
  description?: ReactNode;
  action?: ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("mb-5 flex flex-wrap items-start justify-between gap-3", className)}>
      <div className="min-w-0">
        <CardTitle>{title}</CardTitle>
        {description && <p className="mt-1 text-[12.5px] text-fg-3">{description}</p>}
      </div>
      {action && <div className="flex shrink-0 items-center gap-2">{action}</div>}
    </div>
  );
}
