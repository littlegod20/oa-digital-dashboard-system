import type { HTMLAttributes } from "react";
import { cn } from "@/lib/utils";

export function Card({ className, style, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn("rounded-2xl p-6", className)}
      style={{
        background: "var(--card-bg)",
        border: "1px solid var(--card-border)",
        boxShadow: "var(--card-shadow)",
        transition: "background-color 0.2s ease, border-color 0.2s ease",
        ...style,
      }}
      {...props}
    />
  );
}

export function CardTitle({ className, style, ...props }: HTMLAttributes<HTMLHeadingElement>) {
  return (
    <h2
      className={cn("text-sm font-semibold", className)}
      style={{ color: "var(--text-primary)", ...style }}
      {...props}
    />
  );
}
