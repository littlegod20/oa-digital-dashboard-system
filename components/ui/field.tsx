import type { InputHTMLAttributes, ReactNode, SelectHTMLAttributes, TextareaHTMLAttributes } from "react";
import type { Icon } from "@phosphor-icons/react";
import { cn } from "@/lib/utils";

export function Field({ label, hint, children }: { label: ReactNode; hint?: ReactNode; children: ReactNode }) {
  return (
    <label className="flex flex-col gap-1.5">
      <span className="flex items-center justify-between text-[12px] font-semibold text-fg-2">
        {label}
        {hint}
      </span>
      {children}
    </label>
  );
}

export function Input({
  className,
  icon: IconCmp,
  trailing,
  ...props
}: InputHTMLAttributes<HTMLInputElement> & { icon?: Icon; trailing?: ReactNode }) {
  if (!IconCmp && !trailing) return <input className={cn("input", className)} {...props} />;
  return (
    <div className="relative">
      {IconCmp && (
        <IconCmp
          size={17}
          className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-fg-3"
        />
      )}
      <input className={cn("input", IconCmp && "has-icon", trailing && "pr-11", className)} {...props} />
      {trailing && <div className="absolute right-2 top-1/2 -translate-y-1/2">{trailing}</div>}
    </div>
  );
}

export function Select({ className, ...props }: SelectHTMLAttributes<HTMLSelectElement>) {
  return <select className={cn("input", className)} {...props} />;
}

export function Textarea({ className, ...props }: TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return <textarea className={cn("input", className)} {...props} />;
}

export function Alert({
  tone = "danger",
  icon: IconCmp,
  children,
}: {
  tone?: "danger" | "success" | "info";
  icon: Icon;
  children: ReactNode;
}) {
  return (
    <div
      role={tone === "danger" ? "alert" : "status"}
      className={cn(
        "flex items-start gap-2.5 rounded-2xl px-3.5 py-3 text-[13px] font-medium",
        `badge-${tone}`,
      )}
    >
      <IconCmp size={18} weight="fill" className="mt-px shrink-0" />
      <div className="min-w-0">{children}</div>
    </div>
  );
}
