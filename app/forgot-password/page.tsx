"use client";

import { useState } from "react";
import Link from "next/link";
import {
  ArrowLeftIcon,
  CheckCircleIcon,
  CheckIcon,
  CopyIcon,
  EnvelopeSimpleIcon,
  WarningCircleIcon,
} from "@phosphor-icons/react";
import { AuthShell } from "@/components/auth/auth-shell";
import { Alert, Field, Input } from "@/components/ui/field";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [resetUrl, setResetUrl] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error ?? "Something went wrong"); setLoading(false); return; }
      setResetUrl(data.resetUrl ?? null);
      setSubmitted(true);
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  function copyUrl() {
    if (!resetUrl) return;
    navigator.clipboard.writeText(resetUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <AuthShell
      title="Reset your password"
      subtitle={submitted ? "A reset link has been generated." : "Enter your email and we'll generate a reset link."}
      footer={
        <Link href="/login" className="inline-flex items-center gap-1.5 font-semibold text-fg-2 hover:text-fg">
          <ArrowLeftIcon size={15} weight="bold" />
          Back to sign in
        </Link>
      }
    >
      {!submitted ? (
        <form onSubmit={handleSubmit} className="space-y-5">
          {error && <Alert icon={WarningCircleIcon}>{error}</Alert>}
          <Field label="Email address">
            <Input
              icon={EnvelopeSimpleIcon}
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              className="h-12"
            />
          </Field>
          <button type="submit" disabled={loading} className="btn btn-primary btn-lg w-full">
            {loading ? "Generating link…" : "Send reset link"}
          </button>
        </form>
      ) : (
        <div className="space-y-5">
          <Alert tone="success" icon={CheckCircleIcon}>
            {resetUrl
              ? "Copy the link below and open it in your browser to set a new password. It expires in 1 hour."
              : "If that email is registered, a reset link will be sent. Contact your administrator if you need further help."}
          </Alert>

          {resetUrl && (
            <div>
              <p className="mb-1.5 text-[12px] font-semibold text-fg-2">Reset link (valid for 1 hour)</p>
              <div className="flex items-center gap-2 rounded-[var(--radius-control)] bg-[var(--input-bg)] py-1.5 pl-3.5 pr-1.5 shadow-[inset_0_0_0_1px_var(--input-border)]">
                <span className="flex-1 truncate font-mono text-[12px] text-brand">{resetUrl}</span>
                <button onClick={copyUrl} className="icon-btn icon-btn-sm" aria-label="Copy link" title="Copy link">
                  {copied ? <CheckIcon size={17} weight="bold" className="text-success" /> : <CopyIcon size={17} />}
                </button>
              </div>
              <p className="mt-2 text-[12px] text-fg-3">In production, this link would be sent to your email automatically.</p>
            </div>
          )}
        </div>
      )}
    </AuthShell>
  );
}
