"use client";

import { useEffect, type ReactNode } from "react";
import { createPortal } from "react-dom";
import type { Icon } from "@phosphor-icons/react";
import { WarningIcon, XIcon } from "@phosphor-icons/react";

export { Field, Input, Select, Textarea } from "./field";

interface ModalProps {
  open: boolean;
  onClose: () => void;
  title: string;
  description?: string;
  icon?: Icon;
  children: ReactNode;
  width?: string;
}

function useModalBehaviour(open: boolean, onClose: () => void) {
  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", handler);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", handler);
      document.body.style.overflow = prev;
    };
  }, [open, onClose]);
}

function Backdrop({ onClose, children }: { onClose: () => void; children: ReactNode }) {
  return createPortal(
    <div
      className="animate-fade fixed inset-0 z-[60] flex items-end justify-center bg-[rgba(8,12,21,0.45)] p-0 backdrop-blur-sm sm:items-center sm:p-6"
      onMouseDown={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      {children}
    </div>,
    document.body,
  );
}

export function Modal({ open, onClose, title, description, icon: IconCmp, children, width = "30rem" }: ModalProps) {
  useModalBehaviour(open, onClose);
  if (!open) return null;

  return (
    <Backdrop onClose={onClose}>
      <div
        role="dialog"
        aria-modal="true"
        aria-label={title}
        className="animate-pop flex max-h-[92dvh] w-full flex-col rounded-t-[28px] bg-solid shadow-pop sm:rounded-[28px]"
        style={{ maxWidth: width }}
      >
        <div className="flex items-start gap-3.5 px-6 pb-2 pt-6">
          {IconCmp && (
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-brand-soft text-brand">
              <IconCmp size={22} weight="duotone" />
            </div>
          )}
          <div className="min-w-0 flex-1 pt-0.5">
            <h2 className="font-display text-[19px] font-semibold leading-tight text-fg">{title}</h2>
            {description && <p className="mt-1 text-[12.5px] text-fg-3">{description}</p>}
          </div>
          <button type="button" onClick={onClose} className="icon-btn icon-btn-sm -mr-2 -mt-1" aria-label="Close">
            <XIcon size={18} />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto px-6 pb-6 pt-4">{children}</div>
      </div>
    </Backdrop>
  );
}

export function ConfirmDialog({
  open,
  title,
  message,
  confirmLabel = "Remove",
  icon: IconCmp = WarningIcon,
  tone = "danger",
  onConfirm,
  onClose,
}: {
  open: boolean;
  title: string;
  message: string;
  confirmLabel?: string;
  icon?: Icon;
  tone?: "danger" | "primary";
  onConfirm: () => void;
  onClose: () => void;
}) {
  useModalBehaviour(open, onClose);
  if (!open) return null;
  return (
    <Backdrop onClose={onClose}>
      <div
        role="alertdialog"
        aria-modal="true"
        aria-label={title}
        className="animate-pop w-full max-w-sm rounded-t-[28px] bg-solid p-6 shadow-pop sm:rounded-[28px]"
      >
        <div
          className={
            tone === "danger"
              ? "mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-danger-soft text-danger"
              : "mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-brand-soft text-brand"
          }
        >
          <IconCmp size={24} weight="duotone" />
        </div>
        <h2 className="font-display text-[19px] font-semibold text-fg">{title}</h2>
        <p className="mb-6 mt-1.5 text-[13.5px] leading-relaxed text-fg-2">{message}</p>
        <div className="flex justify-end gap-2">
          <button type="button" onClick={onClose} className="btn btn-secondary">
            Cancel
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className={tone === "danger" ? "btn btn-danger" : "btn btn-primary"}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </Backdrop>
  );
}

export function ModalActions({ onClose, submitLabel = "Save" }: { onClose: () => void; submitLabel?: string }) {
  return (
    <div className="-mx-6 mt-6 flex justify-end gap-2 border-t border-line px-6 pt-5">
      <button type="button" onClick={onClose} className="btn btn-secondary">
        Cancel
      </button>
      <button type="submit" className="btn btn-primary">
        {submitLabel}
      </button>
    </div>
  );
}
