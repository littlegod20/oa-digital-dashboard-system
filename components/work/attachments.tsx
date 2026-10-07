"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { ArrowSquareOutIcon, FileIcon, FilePdfIcon, XIcon } from "@phosphor-icons/react";

export type Attachment = { name: string; url: string | null; isImage: boolean; isPdf: boolean };

/** Receipts and other proof: image thumbnails open in a viewer; PDFs and other files open in a new tab. */
export function AttachmentList({ attachments, label = "Receipts" }: { attachments: Attachment[]; label?: string }) {
  const [viewing, setViewing] = useState<Attachment | null>(null);
  if (attachments.length === 0) return null;

  return (
    <div>
      <p className="eyebrow mb-2">
        {label} · {attachments.length}
      </p>
      <ul className="flex flex-wrap gap-2">
        {attachments.map((a, i) =>
          !a.url ? (
            <li key={i} className="rounded-xl bg-muted px-3 py-2 text-[12px] text-fg-3">
              {a.name} (unavailable)
            </li>
          ) : a.isImage ? (
            <li key={i}>
              <button
                type="button"
                onClick={() => setViewing(a)}
                className="group relative block h-20 w-20 overflow-hidden rounded-xl bg-muted shadow-[0_0_0_1px_var(--divider)] transition-shadow hover:shadow-[0_0_0_2px_var(--brand-ring)]"
                aria-label={`View ${a.name}`}
                title={a.name}
              >
                {/* eslint-disable-next-line @next/next/no-img-element -- signed storage URL, not a static asset */}
                <img src={a.url} alt={a.name} className="h-full w-full object-cover" />
              </button>
            </li>
          ) : (
            <li key={i}>
              <a
                href={a.url}
                target="_blank"
                rel="noreferrer"
                className="flex h-20 w-44 flex-col justify-between rounded-xl bg-muted p-2.5 text-[12px] shadow-[0_0_0_1px_var(--divider)] transition-shadow hover:shadow-[0_0_0_2px_var(--brand-ring)]"
                title={`Open ${a.name}`}
              >
                <span className="flex items-center gap-1.5 font-semibold text-fg">
                  {a.isPdf ? <FilePdfIcon size={18} weight="duotone" className="text-danger" /> : <FileIcon size={18} weight="duotone" className="text-brand" />}
                  {a.isPdf ? "PDF" : "File"}
                  <ArrowSquareOutIcon size={13} className="ml-auto text-fg-3" />
                </span>
                <span className="truncate text-fg-2">{a.name}</span>
              </a>
            </li>
          ),
        )}
      </ul>
      {viewing && <ImageViewer attachment={viewing} onClose={() => setViewing(null)} />}
    </div>
  );
}

function ImageViewer({ attachment, onClose }: { attachment: Attachment; onClose: () => void }) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  return createPortal(
    <div
      className="animate-fade fixed inset-0 z-[80] flex flex-col items-center justify-center gap-3 bg-[rgba(8,12,21,0.82)] p-4"
      onMouseDown={(e) => { if (e.target === e.currentTarget) onClose(); }}
      role="dialog"
      aria-modal="true"
      aria-label={attachment.name}
    >
      <div className="flex w-full max-w-4xl items-center justify-between gap-3 text-white">
        <p className="truncate text-[13px] font-semibold">{attachment.name}</p>
        <div className="flex gap-2">
          <a href={attachment.url!} target="_blank" rel="noreferrer" className="btn btn-sm bg-white/10 text-white hover:bg-white/20">
            <ArrowSquareOutIcon size={14} />
            Open original
          </a>
          <button type="button" onClick={onClose} className="btn btn-sm bg-white/10 text-white hover:bg-white/20" aria-label="Close">
            <XIcon size={14} />
          </button>
        </div>
      </div>
      {/* eslint-disable-next-line @next/next/no-img-element -- signed storage URL, not a static asset */}
      <img src={attachment.url!} alt={attachment.name} className="max-h-[82vh] max-w-full rounded-2xl object-contain shadow-pop" />
    </div>,
    document.body,
  );
}
