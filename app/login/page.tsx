"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { useRole, USERS } from "@/lib/role-context";
import { Briefcase, TrendingUp } from "lucide-react";

const ROLE_META = {
  management: {
    icon: Briefcase,
    description: "Full access — financials, pipeline, team, contacts",
    accent: "var(--brand-strong)",
    accentSoft: "var(--brand-soft)",
  },
  sales: {
    icon: TrendingUp,
    description: "Pipeline, follow-up tracking, transaction entry",
    accent: "var(--badge-success-text)",
    accentSoft: "var(--badge-success-bg)",
  },
};

export default function LoginPage() {
  const { setUser, user, hydrated } = useRole();
  const router = useRouter();

  useEffect(() => {
    if (hydrated && user) router.replace("/dashboard");
  }, [hydrated, user, router]);

  if (!hydrated) return null;

  function login(email: string) {
    const profile = USERS.find((u) => u.email === email);
    if (!profile) return;
    setUser(profile);
    router.push("/dashboard");
  }

  return (
    <div
      className="min-h-dvh flex items-center justify-center p-4"
      style={{ background: "var(--page-bg)" }}
    >
      <div className="w-full max-w-sm space-y-6">
        {/* Logo */}
        <div className="text-center space-y-1">
          <div
            className="inline-flex h-14 w-14 items-center justify-center rounded-2xl mb-2"
            style={{ background: "var(--sidebar-bg)" }}
          >
            <span className="font-display font-bold text-white text-[18px]">OA</span>
          </div>
          <h1 className="font-display font-bold text-[22px]" style={{ color: "var(--text-primary)" }}>
            OA Digital
          </h1>
          <p className="text-[13.5px]" style={{ color: "var(--text-muted)" }}>
            Choose your account to continue
          </p>
        </div>

        {/* Role cards */}
        <div className="space-y-3">
          {USERS.map((u) => {
            const meta = ROLE_META[u.role];
            const Icon = meta.icon;
            return (
              <button
                key={u.email}
                type="button"
                onClick={() => login(u.email)}
                className="w-full rounded-2xl p-4 text-left transition-all group"
                style={{
                  background: "var(--card-bg)",
                  border: "1px solid var(--card-border)",
                }}
                onMouseEnter={(e) => {
                  (e.currentTarget as HTMLElement).style.borderColor = meta.accent;
                  (e.currentTarget as HTMLElement).style.boxShadow = `0 0 0 3px ${meta.accentSoft}`;
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLElement).style.borderColor = "var(--card-border)";
                  (e.currentTarget as HTMLElement).style.boxShadow = "none";
                }}
              >
                <div className="flex items-center gap-3">
                  <div
                    className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl"
                    style={{ background: meta.accentSoft, color: meta.accent }}
                  >
                    <Icon className="size-5" strokeWidth={1.75} />
                  </div>
                  <div className="min-w-0">
                    <p className="font-semibold text-[14px]" style={{ color: "var(--text-primary)" }}>
                      {u.name}
                    </p>
                    <p className="text-[11.5px] mt-0.5 truncate" style={{ color: "var(--text-muted)" }}>
                      {u.email}
                    </p>
                  </div>
                </div>
                <p className="text-[12px] mt-2.5" style={{ color: "var(--text-secondary)" }}>
                  {meta.description}
                </p>
              </button>
            );
          })}
        </div>

        <p className="text-center text-[11.5px]" style={{ color: "var(--text-muted)" }}>
          OA Digi Smart Security · Internal Dashboard
        </p>
      </div>
    </div>
  );
}
