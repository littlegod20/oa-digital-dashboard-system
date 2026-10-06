"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowLeftIcon, CheckCircleIcon, EnvelopeSimpleIcon, WarningCircleIcon } from "@phosphor-icons/react";
import { AuthShell } from "@/components/auth/auth-shell";
import { Alert, Field, Input } from "@/components/ui/field";
import { authClient } from "@/lib/auth-client";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    const { error: requestError } = await authClient.requestPasswordReset({
      email: email.trim().toLowerCase(),
      redirectTo: "/reset-password",
    });
    setLoading(false);
    if (requestError) {
      setError(requestError.message ?? "Something went wrong. Please try again.");
      return;
    }
    setSubmitted(true);
  }

  return (
    <AuthShell
      title="Reset your password"
      subtitle={submitted ? "Request received." : "Enter your email and we'll generate a reset link."}
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
        <Alert tone="success" icon={CheckCircleIcon}>
          If that email belongs to an account, a reset link valid for 1 hour has been generated. Your administrator
          will send it to you.
        </Alert>
      )}
    </AuthShell>
  );
}
