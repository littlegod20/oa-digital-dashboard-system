"use client";

import { useState } from "react";
import { useAction } from "convex/react";
import { CheckIcon, CopyIcon, EnvelopeSimpleIcon, LinkIcon, PaperPlaneTiltIcon, WarningCircleIcon } from "@phosphor-icons/react";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";
import { Modal } from "@/components/ui/modal";
import { Alert } from "@/components/ui/field";
import { errorMessage } from "@/lib/utils";

export type InviteTarget = { id: string; name: string; email: string; signedIn: boolean };

/** Generate a single-use "set your password" link, then copy it or have it emailed. */
export function InviteDialog({ target, onClose }: { target: InviteTarget | null; onClose: () => void }) {
  return (
    <Modal
      open={Boolean(target)}
      onClose={onClose}
      title={target?.signedIn ? `New sign-in link for ${target?.name}` : `Invite ${target?.name}`}
      description="The link works once and expires in 7 days. A new link replaces any earlier one."
      icon={EnvelopeSimpleIcon}
      width="32rem"
    >
      {target && <InviteBody key={target.id} target={target} onClose={onClose} />}
    </Modal>
  );
}

function InviteBody({ target, onClose }: { target: InviteTarget; onClose: () => void }) {
  const createInvite = useAction(api.invites.createInvite);
  const [url, setUrl] = useState("");
  const [emailed, setEmailed] = useState(false);
  const [busy, setBusy] = useState<"" | "link" | "email">("");
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState("");

  async function run(sendEmail: boolean) {
    setBusy(sendEmail ? "email" : "link");
    setError("");
    try {
      const res = await createInvite({ employeeId: target.id as Id<"employees">, sendEmail });
      setUrl(res.url);
      setEmailed(res.emailed);
      setCopied(false);
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setBusy("");
    }
  }

  async function copy() {
    await navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div className="space-y-4">
      {target.signedIn && (
        <Alert tone="info" icon={WarningCircleIcon}>
          {target.name} already signs in. A new link lets them set a fresh password and signs them out everywhere
          else. Only use this if they&apos;re locked out.
        </Alert>
      )}
      {error && <Alert icon={WarningCircleIcon}>{error}</Alert>}

      {emailed && (
        <Alert tone="success" icon={CheckIcon}>
          Sent to {target.email}.
        </Alert>
      )}

      {url && (
        <div>
          <p className="mb-1.5 text-[12px] font-semibold text-fg-2">Invite link</p>
          <div className="flex items-center gap-2 rounded-[var(--radius-control)] bg-[var(--input-bg)] py-1.5 pl-3.5 pr-1.5 shadow-[inset_0_0_0_1px_var(--input-border)]">
            <span className="flex-1 truncate font-mono text-[12px] text-brand">{url}</span>
            <button type="button" onClick={copy} className="btn btn-secondary btn-sm">
              {copied ? <CheckIcon size={14} weight="bold" className="text-success" /> : <CopyIcon size={14} />}
              {copied ? "Copied" : "Copy"}
            </button>
          </div>
          <p className="mt-2 text-[12px] text-fg-3">Share it privately, for example on WhatsApp. Anyone with the link can set this password.</p>
        </div>
      )}

      <div className="-mx-6 flex flex-wrap justify-end gap-2 border-t border-line px-6 pt-5">
        <button type="button" onClick={onClose} className="btn btn-ghost">
          Done
        </button>
        <button type="button" onClick={() => run(false)} disabled={busy !== ""} className="btn btn-secondary">
          <LinkIcon size={16} />
          {busy === "link" ? "Creating…" : url ? "New link" : "Create link"}
        </button>
        <button type="button" onClick={() => run(true)} disabled={busy !== ""} className="btn btn-primary">
          <PaperPlaneTiltIcon size={16} weight="bold" />
          {busy === "email" ? "Sending…" : `Email ${target.email.split("@")[0]}`}
        </button>
      </div>
    </div>
  );
}
