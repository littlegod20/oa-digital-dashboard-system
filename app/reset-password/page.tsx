"use client";

import { useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import {
  ArrowLeftIcon,
  CheckCircleIcon,
  EyeIcon,
  EyeSlashIcon,
  LockSimpleIcon,
  WarningCircleIcon,
} from "@phosphor-icons/react";
import { AuthShell } from "@/components/auth/auth-shell";
import { Alert, Field, Input } from "@/components/ui/field";
import { authClient } from "@/lib/auth-client";
import Link from "next/link";

function ResetPasswordForm() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const token = searchParams.get("token") ?? "";
  // Better Auth redirects here with ?error=INVALID_TOKEN when the link is bad or expired.
  const linkError = searchParams.get("error") || !token ? "Invalid or expired reset link. Please request a new one." : "";

  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [showPwd, setShowPwd] = useState(false);
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [formError, setFormError] = useState("");
  const error = formError || linkError;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (password !== confirm) { setFormError("Passwords do not match."); return; }
    if (password.length < 8) { setFormError("Password must be at least 8 characters."); return; }
    setLoading(true);
    setFormError("");
    const { error: resetError } = await authClient.resetPassword({ newPassword: password, token });
    setLoading(false);
    if (resetError) {
      setFormError(resetError.message ?? "Reset failed. The link may have expired.");
      return;
    }
    setDone(true);
    setTimeout(() => router.push("/login"), 2500);
  }

  return (
    <AuthShell
      title={done ? "Password updated" : "Set a new password"}
      subtitle={done ? "Redirecting you to sign in…" : "Choose a strong password for your account."}
      footer={
        !done && (
          <Link href="/login" className="inline-flex items-center gap-1.5 font-semibold text-fg-2 hover:text-fg">
            <ArrowLeftIcon size={15} weight="bold" />
            Back to sign in
          </Link>
        )
      }
    >
      {done ? (
        <Alert tone="success" icon={CheckCircleIcon}>
          Your password has been updated. Taking you to sign in…
        </Alert>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-5">
          {error && <Alert icon={WarningCircleIcon}>{error}</Alert>}
          <Field label="New password">
            <Input
              icon={LockSimpleIcon}
              type={showPwd ? "text" : "password"}
              required
              autoComplete="new-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Min. 8 characters"
              className="h-12"
              trailing={
                <button
                  type="button"
                  onClick={() => setShowPwd((v) => !v)}
                  className="icon-btn icon-btn-sm"
                  aria-label={showPwd ? "Hide password" : "Show password"}
                >
                  {showPwd ? <EyeSlashIcon size={18} /> : <EyeIcon size={18} />}
                </button>
              }
            />
          </Field>
          <Field label="Confirm password">
            <Input
              icon={LockSimpleIcon}
              type={showPwd ? "text" : "password"}
              required
              autoComplete="new-password"
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              placeholder="Repeat new password"
              className="h-12"
            />
          </Field>
          <button type="submit" disabled={loading || Boolean(linkError)} className="btn btn-primary btn-lg w-full">
            {loading ? "Updating…" : "Update password"}
          </button>
        </form>
      )}
    </AuthShell>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense>
      <ResetPasswordForm />
    </Suspense>
  );
}
