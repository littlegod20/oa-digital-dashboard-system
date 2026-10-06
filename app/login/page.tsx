"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { EnvelopeSimpleIcon, EyeIcon, EyeSlashIcon, LockSimpleIcon, WarningCircleIcon } from "@phosphor-icons/react";
import { useRole } from "@/lib/role-context";
import { AuthShell } from "@/components/auth/auth-shell";
import { Alert, Field, Input } from "@/components/ui/field";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { setUser } = useRole();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (res.ok) {
        setUser(data.user);
        router.replace("/dashboard");
        router.refresh();
      } else {
        setError(data.error ?? "Login failed. Please try again.");
        setLoading(false);
      }
    } catch {
      setError("Network error. Please try again.");
      setLoading(false);
    }
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
