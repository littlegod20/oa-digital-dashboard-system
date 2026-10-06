"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { EnvelopeSimpleIcon, EyeIcon, EyeSlashIcon, LockSimpleIcon, WarningCircleIcon } from "@phosphor-icons/react";
import { useRole } from "@/lib/role-context";
import { authClient } from "@/lib/auth-client";
import { AuthShell } from "@/components/auth/auth-shell";
import { Alert, Field, Input } from "@/components/ui/field";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { hydrated, user } = useRole();

  // Already signed in: go straight to the dashboard.
  useEffect(() => {
    if (hydrated && user) router.replace("/dashboard");
  }, [hydrated, user, router]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    const { error: signInError } = await authClient.signIn.email({
      email: email.trim().toLowerCase(),
      password,
    });
    if (signInError) {
      setError(
        signInError.status === 401 || signInError.code === "INVALID_EMAIL_OR_PASSWORD"
          ? "Invalid email or password"
          : signInError.message ?? "Login failed. Please try again.",
      );
      setLoading(false);
      return;
    }
    const from = new URLSearchParams(window.location.search).get("from");
    router.replace(from?.startsWith("/dashboard") ? from : "/dashboard");
  }

  return (
    <AuthShell title="Welcome back" subtitle="Sign in to your OA Digital workspace.">
      <form onSubmit={handleSubmit} className="space-y-5">
        {error && <Alert icon={WarningCircleIcon}>{error}</Alert>}

        <Field label="Email address">
          <Input
            icon={EnvelopeSimpleIcon}
            type="email"
            required
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@oadigismartsecurity.com"
            className="h-12"
          />
        </Field>

        <Field
          label="Password"
          hint={
            <Link href="/forgot-password" className="text-[12px] font-semibold text-brand hover:underline">
              Forgot password?
            </Link>
          }
        >
          <Input
            icon={LockSimpleIcon}
            type={showPassword ? "text" : "password"}
            required
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            className="h-12"
            trailing={
              <button
                type="button"
                onClick={() => setShowPassword((v) => !v)}
                className="icon-btn icon-btn-sm"
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? <EyeSlashIcon size={18} /> : <EyeIcon size={18} />}
              </button>
            }
          />
        </Field>

        <button type="submit" disabled={loading} className="btn btn-primary btn-lg w-full">
          {loading ? "Signing in…" : "Sign in"}
        </button>
      </form>
    </AuthShell>
  );
}
