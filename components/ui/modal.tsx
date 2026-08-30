"use client";

import { useEffect, type ReactNode } from "react";
import { X } from "lucide-react";

interface ModalProps {
  open: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
  width?: string;
}

export function Modal({ open, onClose, title, children, width = "28rem" }: ModalProps) {
  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [open, onClose]);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [open]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: "rgba(7,20,38,0.55)", backdropFilter: "blur(4px)" }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div
        className="w-full rounded-2xl shadow-2xl flex flex-col max-h-[90vh]"
        style={{ maxWidth: width, background: "var(--card-bg)", border: "1px solid var(--divider)" }}
      >
        <div
          className="flex items-center justify-between px-6 py-4 shrink-0"
          style={{ borderBottom: "1px solid var(--divider)" }}
        >
          <h2 className="font-semibold text-[15px]" style={{ color: "var(--text-primary)" }}>{title}</h2>
          <button
            type="button" onClick={onClose}
            className="flex h-7 w-7 items-center justify-center rounded-lg transition-colors"
            style={{ color: "var(--text-muted)" }}
            onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.background = "var(--input-bg)"; }}
            onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.background = "transparent"; }}
          >
            <X className="size-4" />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto px-6 py-5">{children}</div>
      </div>
    </div>
  );
}

const inputStyle = {
  background: "var(--input-bg)", color: "var(--text-primary)",
  border: "1px solid transparent", borderRadius: "0.625rem",
  padding: "0.5rem 0.75rem", fontSize: "13.5px", width: "100%",
  outline: "none", transition: "border-color 0.15s", fontFamily: "inherit",
} as const;

export function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-[12px] font-medium" style={{ color: "var(--text-muted)" }}>{label}</label>
      {children}
    </div>
  );
}

export function Input(props: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input {...props} style={inputStyle}
      onFocus={(e) => { e.currentTarget.style.borderColor = "var(--brand-ring)"; props.onFocus?.(e); }}
      onBlur={(e)  => { e.currentTarget.style.borderColor = "transparent"; props.onBlur?.(e); }}
    />
  );
}

export function Select(props: React.SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <select {...props} style={{ ...inputStyle, cursor: "pointer" }}
      onFocus={(e) => { e.currentTarget.style.borderColor = "var(--brand-ring)"; props.onFocus?.(e); }}
      onBlur={(e)  => { e.currentTarget.style.borderColor = "transparent"; props.onBlur?.(e); }}
    />
  );
}

export function Textarea(props: React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <textarea {...props} style={{ ...inputStyle, resize: "vertical", minHeight: "80px" }}
      onFocus={(e) => { e.currentTarget.style.borderColor = "var(--brand-ring)"; props.onFocus?.(e); }}
      onBlur={(e)  => { e.currentTarget.style.borderColor = "transparent"; props.onBlur?.(e); }}
    />
  );
}

export function ModalActions({ onClose, submitLabel = "Save" }: { onClose: () => void; submitLabel?: string }) {
  return (
    <div className="flex justify-end gap-2 mt-6">
      <button type="button" onClick={onClose}
        className="btn-secondary px-4 py-2 rounded-xl text-[13px] font-medium">Cancel</button>
      <button type="submit"
        className="btn-primary px-4 py-2 rounded-xl text-[13px] font-semibold">{submitLabel}</button>
    </div>
  );
}
