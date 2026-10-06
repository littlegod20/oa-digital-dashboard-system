"use client";

import { useState, useEffect, Suspense } from "react";
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
import Link from "next/link";

function ResetPasswordForm() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const token = searchParams.get("token") ?? "";

  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [showPwd, setShowPwd] = useState(false);
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!token) setError("Invalid or missing reset token. Please request a new link.");
  }, [token]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (password !== confirm) { setError("Passwords do not match."); return; }
    if (password.length < 8) { setError("Password must be at least 8 characters."); return; }
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, password }),
      });
      const data = await res.json();
      if (res.ok) {
        setDone(true);
        setTimeout(() => router.push("/login"), 2500);
      } else {
        setError(data.error ?? "Reset failed. The link may have expired.");
      }
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
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
          <button type="submit" disabled={loading || !token} className="btn btn-primary btn-lg w-full">
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
