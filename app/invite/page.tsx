"use client";

import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { useAction, useQuery } from "convex/react";
import { EyeIcon, EyeSlashIcon, LockSimpleIcon, WarningCircleIcon } from "@phosphor-icons/react";
import { api } from "@/convex/_generated/api";
import { AuthShell } from "@/components/auth/auth-shell";
import { Alert, Field, Input } from "@/components/ui/field";
import { authClient } from "@/lib/auth-client";
import { errorMessage } from "@/lib/utils";

function InviteForm() {
  const router = useRouter();
  const token = useSearchParams().get("token") ?? "";
  const invite = useQuery(api.invites.lookup, token ? { token } : "skip");
  const accept = useAction(api.invites.accept);

  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [showPwd, setShowPwd] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (password !== confirm) return setError("Passwords do not match.");
    if (password.length < 8) return setError("Password must be at least 8 characters.");
    setBusy(true);
    setError("");
    try {
      const { email } = await accept({ token, password });
      const { error: signInError } = await authClient.signIn.email({ email, password });
      if (signInError) {
        // The password is set; only the automatic sign-in failed.
        router.replace("/login");
        return;
      }
      router.replace("/dashboard");
    } catch (err) {
      setError(errorMessage(err));
      setBusy(false);
    }
  }

  const backToLogin = (
    <Link href="/login" className="font-semibold text-fg-2 hover:text-fg">
      Already set up? Sign in
    </Link>
  );

  if (!token || invite?.valid === false) {
    return (
      <AuthShell title="This link doesn't work" subtitle="It may have been used already or expired." footer={backToLogin}>
        <Alert icon={WarningCircleIcon}>
          Invite links work once and expire after 7 days. Ask whoever invited you (Gerhard or HR) to send a new one.
        </Alert>
      </AuthShell>
    );
  }

  if (invite === undefined) {
    return (
      <AuthShell title="Checking your invite…" subtitle="One moment.">
        <div className="skeleton h-40" />
      </AuthShell>
    );
  }

  return (
    <AuthShell
      title={`Welcome, ${invite.name.split(" ")[0]}`}
      subtitle={`Choose a password for ${invite.email} to finish setting up your account.`}
      footer={backToLogin}
    >
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
            placeholder="At least 8 characters"
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
            placeholder="Repeat it"
            className="h-12"
          />
        </Field>
        <button type="submit" disabled={busy} className="btn btn-primary btn-lg w-full">
          {busy ? "Setting up…" : "Set password and sign in"}
        </button>
      </form>
    </AuthShell>
  );
}

export default function InvitePage() {
  return (
    <Suspense>
      <InviteForm />
    </Suspense>
  );
}
