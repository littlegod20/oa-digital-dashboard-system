"use client";

import { useState } from "react";
import { Mail, ArrowLeft, CheckCircle, Copy, Check, AlertCircle } from "lucide-react";
import Link from "next/link";

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
    <main
      style={{ background: "var(--page-bg)", minHeight: "100dvh" }}
      className="flex items-center justify-center p-4"
    >
      <div style={{ width: "100%", maxWidth: "400px" }}>
        {/* Logo */}
        <div className="text-center mb-8">
          <div
            className="inline-flex items-center justify-center w-14 h-14 rounded-2xl font-bold text-xl mb-4"
            style={{ background: "var(--brand-strong)", color: "#fff" }}
          >
            OA
          </div>
          <h1 className="text-xl font-semibold" style={{ color: "var(--text-primary)" }}>
            Reset your password
          </h1>
          <p className="text-sm mt-1" style={{ color: "var(--text-secondary)" }}>
            {submitted
              ? "A reset link has been generated"
              : "Enter your email and we'll generate a reset link"}
          </p>
        </div>

        <div
          className="rounded-2xl p-6"
          style={{ background: "var(--card-bg)", border: "1px solid var(--header-border)" }}
        >
          {!submitted ? (
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <div
                  className="flex items-center gap-2 rounded-lg px-3 py-2.5 text-sm"
                  style={{ background: "var(--badge-danger-bg)", color: "var(--badge-danger-text)" }}
                >
                  <AlertCircle className="size-4 shrink-0" />
                  {error}
                </div>
              )}
              <div>
                <label
                  className="block text-sm font-medium mb-1.5"
                  style={{ color: "var(--text-primary)" }}
                >
                  Email address
                </label>
                <div className="relative">
                  <Mail
                    className="absolute left-3 top-1/2 -translate-y-1/2 size-4"
                    style={{ color: "var(--text-secondary)" }}
                  />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    className="w-full rounded-lg pl-9 pr-4 py-2.5 text-sm outline-none"
                    style={{
                      background: "var(--page-bg)",
                      border: "1px solid var(--header-border)",
                      color: "var(--text-primary)",
                    }}
                  />
                </div>
              </div>
              <button
                type="submit"
                disabled={loading}
                className="w-full rounded-lg py-2.5 text-sm font-semibold transition-opacity disabled:opacity-60"
                style={{ background: "var(--brand-strong)", color: "#fff" }}
              >
                {loading ? "Generating link..." : "Send reset link"}
              </button>
            </form>
          ) : (
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <CheckCircle
                  className="size-5 shrink-0 mt-0.5"
                  style={{ color: "var(--badge-success-text)" }}
                />
                <p className="text-sm" style={{ color: "var(--text-primary)" }}>
                  {resetUrl
                    ? "Copy the link below and open it in your browser to set a new password. It expires in 1 hour."
                    : "If that email is registered, a reset link will be sent. Contact your administrator if you need further help."}
                </p>
              </div>

              {resetUrl && (
                <div>
                  <p
                    className="text-xs font-medium mb-1.5"
                    style={{ color: "var(--text-secondary)" }}
                  >
                    Reset link (valid for 1 hour)
                  </p>
                  <div
                    className="flex items-center gap-2 rounded-lg px-3 py-2"
                    style={{
                      background: "var(--page-bg)",
                      border: "1px solid var(--header-border)",
                    }}
                  >
                    <span
                      className="text-xs truncate flex-1 font-mono"
                      style={{ color: "var(--brand)" }}
                    >
                      {resetUrl}
                    </span>
                    <button
                      onClick={copyUrl}
                      className="shrink-0"
                      style={{ color: "var(--text-secondary)" }}
                      title="Copy link"
                    >
                      {copied ? (
                        <Check className="size-4" style={{ color: "var(--badge-success-text)" }} />
                      ) : (
                        <Copy className="size-4" />
                      )}
                    </button>
                  </div>
                  <p className="text-xs mt-2" style={{ color: "var(--text-secondary)" }}>
                    In production, this link would be sent to your email automatically.
                  </p>
                </div>
              )}
            </div>
          )}
        </div>

        <div className="text-center mt-5">
          <Link
            href="/login"
            className="inline-flex items-center gap-1.5 text-sm hover:underline"
            style={{ color: "var(--text-secondary)" }}
          >
            <ArrowLeft className="size-4" />
            Back to sign in
          </Link>
        </div>
      </div>
    </main>
  );
}
