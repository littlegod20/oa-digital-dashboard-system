"use client";

import { useState } from "react";
import type { Icon } from "@phosphor-icons/react";
import { CheckCircleIcon, DesktopIcon, LockSimpleIcon, MoonIcon, SunIcon, WarningCircleIcon } from "@phosphor-icons/react";
import { Alert, Field, Input } from "@/components/ui/field";
import { PageHeader } from "@/components/ui/page-header";
import { Card, CardHeader } from "@/components/ui/card";
import { Avatar } from "@/components/ui/avatar";
import { useRole } from "@/lib/role-context";
import { useTheme, type ThemePreference } from "@/lib/theme";
import { authClient } from "@/lib/auth-client";
import { cn } from "@/lib/utils";

const THEME_OPTIONS: { value: ThemePreference; label: string; icon: Icon }[] = [
  { value: "light", label: "Light", icon: SunIcon },
  { value: "dark", label: "Dark", icon: MoonIcon },
  { value: "system", label: "System", icon: DesktopIcon },
];

export default function SettingsPage() {
  const { user } = useRole();
  const { preference, setPreference } = useTheme();
  if (!user) return null;

  const details: [string, string][] = [
    ["Email", user.email],
    ["Job title", user.jobTitle],
    ["Department", user.department ?? "Not set"],
    ["Line manager", user.lineManager?.name ?? "None"],
    ["Access", user.accessLabel],
  ];

  return (
    <div className="max-w-3xl space-y-6">
      <PageHeader eyebrow="Account" title="Settings" description="Your profile, password and preferences." />

      {/* Profile */}
      <Card flush className="overflow-hidden">
        <div className="h-24 md:h-28" style={{ background: "var(--ink-bg)" }} />
        <div className="px-5 pb-6 md:px-6">
          <Avatar name={user.name} size={80} className="-mt-10 ring-4 ring-[var(--card-solid)]" />
          <div className="mt-3 flex flex-wrap items-center gap-2.5">
            <p className="font-display text-[20px] font-semibold text-fg">{user.name}</p>
            <span className="badge badge-info">{user.accessLabel}</span>
          </div>
          <dl className="mt-5 grid gap-x-6 gap-y-4 sm:grid-cols-2">
            {details.map(([label, value]) => (
              <div key={label}>
                <dt className="text-[12px] font-semibold text-fg-3">{label}</dt>
                <dd className="mt-0.5 truncate text-[13.5px] text-fg">{value}</dd>
              </div>
            ))}
          </dl>
          <p className="mt-5 text-[12px] text-fg-3">
            Your job title, department and line manager are managed by HR. Ask them if anything is wrong.
          </p>
        </div>
      </Card>

      <ChangePasswordCard />

      {/* Appearance */}
      <Card>
        <CardHeader title="Appearance" description="Choose how the dashboard looks on this device." />
        <div className="grid grid-cols-3 gap-3" role="radiogroup" aria-label="Theme">
          {THEME_OPTIONS.map(({ value, label, icon: IconCmp }) => {
            const selected = preference === value;
            return (
              <button
                key={value}
                type="button"
                role="radio"
                aria-checked={selected}
                onClick={() => setPreference(value)}
                className={cn(
                  "flex flex-col items-center gap-2 rounded-2xl p-4 text-[12.5px] font-semibold transition-all",
                  selected
                    ? "bg-solid text-fg shadow-[0_0_0_2px_var(--brand),0_8px_20px_-10px_rgba(29,95,209,0.5)]"
                    : "bg-muted text-fg-2 hover:text-fg",
                )}
              >
                <IconCmp size={24} weight={selected ? "duotone" : "regular"} className={selected ? "text-brand" : ""} />
                {label}
              </button>
            );
          })}
        </div>
      </Card>
    </div>
  );
}

function ChangePasswordCard() {
  const [current, setCurrent] = useState("");
  const [next, setNext] = useState("");
  const [confirm, setConfirm] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [done, setDone] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setDone(false);
    if (next !== confirm) return setError("New passwords do not match.");
    if (next.length < 8) return setError("New password must be at least 8 characters.");
    setBusy(true);
    setError("");
    const { error: err } = await authClient.changePassword({
      currentPassword: current,
      newPassword: next,
      revokeOtherSessions: true,
    });
    setBusy(false);
    if (err) {
      setError(err.code === "INVALID_PASSWORD" ? "Your current password is incorrect." : (err.message ?? "Couldn't change your password."));
      return;
    }
    setCurrent("");
    setNext("");
    setConfirm("");
    setDone(true);
  }

  return (
    <Card>
      <CardHeader title="Password" description="Changing it signs you out on your other devices." />
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && <Alert icon={WarningCircleIcon}>{error}</Alert>}
        {done && (
          <Alert tone="success" icon={CheckCircleIcon}>
            Password changed.
          </Alert>
        )}
        <Field label="Current password">
          <Input icon={LockSimpleIcon} type="password" required autoComplete="current-password" value={current} onChange={(e) => setCurrent(e.target.value)} />
        </Field>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="New password">
            <Input type="password" required autoComplete="new-password" value={next} onChange={(e) => setNext(e.target.value)} placeholder="At least 8 characters" />
          </Field>
          <Field label="Confirm new password">
            <Input type="password" required autoComplete="new-password" value={confirm} onChange={(e) => setConfirm(e.target.value)} />
          </Field>
        </div>
        <button type="submit" disabled={busy} className="btn btn-primary">
          {busy ? "Changing…" : "Change password"}
        </button>
      </form>
    </Card>
  );
}
