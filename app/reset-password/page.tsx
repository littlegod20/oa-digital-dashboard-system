"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Lock, Eye, EyeOff, CheckCircle, AlertCircle } from "lucide-react";
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
    <main
      style={{ background: "var(--page-bg)", minHeight: "100dvh" }}
      className="flex items-center justify-center p-4"
    >
      <div style={{ width: "100%", maxWidth: "400px" }}>
        <div className="text-center mb-8">
          <div
            className="inline-flex items-center justify-center w-14 h-14 rounded-2xl font-bold text-xl mb-4"
            style={{ background: "var(--brand-strong)", color: "#fff" }}
          >
            OA
          </div>
          <h1 className="text-xl font-semibold" style={{ color: "var(--text-primary)" }}>
            {done ? "Password updated" : "Set a new password"}
          </h1>
          <p className="text-sm mt-1" style={{ color: "var(--text-secondary)" }}>
            {done
              ? "Redirecting you to sign in..."
              : "Choose a strong password for your account"}
          </p>
        </div>

        <div
          className="rounded-2xl p-6"
          style={{ background: "var(--card-bg)", border: "1px solid var(--header-border)" }}
        >
          {done ? (
            <div className="flex items-center gap-3">
              <CheckCircle
                className="size-5 shrink-0"
                style={{ color: "var(--badge-success-text)" }}
              />
              <p className="text-sm" style={{ color: "var(--text-primary)" }}>
                Your password has been updated. Taking you to sign in...
              </p>
            </div>
          ) : (
            <>
              {error && (
                <div
                  className="flex items-center gap-2 rounded-lg px-3 py-2.5 mb-4 text-sm"
                  style={{
                    background: "var(--badge-danger-bg)",
                    color: "var(--badge-danger-text)",
                  }}
                >
                  <AlertCircle className="size-4 shrink-0" />
                  {error}
                </div>
              )}
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label
                    className="block text-sm font-medium mb-1.5"
                    style={{ color: "var(--text-primary)" }}
                  >
                    New password
                  </label>
                  <div className="relative">
                    <Lock
                      className="absolute left-3 top-1/2 -translate-y-1/2 size-4"
                      style={{ color: "var(--text-secondary)" }}
                    />
                    <input
                      type={showPwd ? "text" : "password"}
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Min. 8 characters"
                      className="w-full rounded-lg pl-9 pr-10 py-2.5 text-sm outline-none"
                      style={{
                        background: "var(--page-bg)",
                        border: "1px solid var(--header-border)",
                        color: "var(--text-primary)",
                      }}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPwd((v) => !v)}
                      className="absolute right-3 top-1/2 -translate-y-1/2"
                      style={{ color: "var(--text-secondary)" }}
                    >
                      {showPwd ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                    </button>
                  </div>
                </div>

                <div>
                  <label
                    className="block text-sm font-medium mb-1.5"
                    style={{ color: "var(--text-primary)" }}
                  >
                    Confirm password
                  </label>
                  <div className="relative">
                    <Lock
                      className="absolute left-3 top-1/2 -translate-y-1/2 size-4"
                      style={{ color: "var(--text-secondary)" }}
                    />
                    <input
                      type={showPwd ? "text" : "password"}
                      required
                      value={confirm}
                      onChange={(e) => setConfirm(e.target.value)}
                      placeholder="Repeat new password"
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
                  disabled={loading || !token}
                  className="w-full rounded-lg py-2.5 text-sm font-semibold transition-opacity disabled:opacity-60"
                  style={{ background: "var(--brand-strong)", color: "#fff" }}
                >
                  {loading ? "Updating..." : "Update password"}
                </button>
              </form>
            </>
          )}
        </div>

        {!done && (
          <div className="text-center mt-5">
            <Link
              href="/login"
              className="text-sm hover:underline"
              style={{ color: "var(--text-secondary)" }}
            >
              Back to sign in
            </Link>
          </div>
        )}
      </div>
    </main>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense>
      <ResetPasswordForm />
    </Suspense>
  );
}
