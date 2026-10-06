"use client";

import { useState } from "react";
import type { Icon } from "@phosphor-icons/react";
import { CheckCircleIcon, DesktopIcon, MoonIcon, SunIcon, WarningIcon } from "@phosphor-icons/react";
import { Field, Input, Select } from "@/components/ui/field";
import { PageHeader } from "@/components/ui/page-header";
import { Card, CardHeader } from "@/components/ui/card";
import { Avatar } from "@/components/ui/avatar";
import { useRole } from "@/lib/role-context";
import { useTheme, type ThemePreference } from "@/lib/theme";
import { cn } from "@/lib/utils";

const THEME_OPTIONS: { value: ThemePreference; label: string; icon: Icon }[] = [
  { value: "light", label: "Light", icon: SunIcon },
  { value: "dark", label: "Dark", icon: MoonIcon },
  { value: "system", label: "System", icon: DesktopIcon },
];

export default function SettingsPage() {
  const { user } = useRole();
  const { preference, setPreference } = useTheme();
  const [name, setName] = useState(user?.name ?? "");
  const [email, setEmail] = useState(user?.email ?? "");
  const [currency, setCurrency] = useState("GHS");
  const [saved, setSaved] = useState(false);
  const roleLabel = user?.role === "management" ? "Management" : user?.role === "sales" ? "Sales" : "Member";

  function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  }

  return (
    <div className="max-w-3xl space-y-6">
      <PageHeader eyebrow="Account" title="Settings" description="Manage your profile and preferences." />

      {/* Profile */}
      <Card flush className="overflow-hidden">
        <div className="h-24 md:h-28" style={{ background: "var(--ink-bg)" }} />
        <form onSubmit={handleSave} className="px-5 pb-6 md:px-6">
          <Avatar name={name || "User"} size={80} className="-mt-10 ring-4 ring-[var(--card-solid)]" />
          <div className="mt-3 flex flex-wrap items-center gap-2.5">
            <p className="font-display text-[20px] font-semibold text-fg">{name || "Your name"}</p>
            <span className={user?.role === "management" ? "badge badge-info" : "badge badge-success"}>{roleLabel}</span>
          </div>

          <div className="mt-6 grid gap-4 sm:grid-cols-2">
            <Field label="Full name">
              <Input value={name} onChange={(e) => setName(e.target.value)} />
            </Field>
            <Field label="Email">
              <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
            </Field>
            <Field label="Role">
              <Input value={roleLabel} disabled className="cursor-not-allowed opacity-70" />
            </Field>
            <Field label="Default currency">
              <Select value={currency} onChange={(e) => setCurrency(e.target.value)}>
                <option value="GHS">GHS – Ghanaian Cedi</option>
                <option value="USD">USD – US Dollar</option>
                <option value="EUR">EUR – Euro</option>
              </Select>
            </Field>
          </div>

          <div className="mt-6 flex items-center gap-3">
            <button type="submit" className="btn btn-primary">Save changes</button>
            {saved && (
              <span className="animate-fade flex items-center gap-1.5 text-[12.5px] font-medium text-success" role="status">
                <CheckCircleIcon size={17} weight="fill" />
                Saved
              </span>
            )}
          </div>
        </form>
      </Card>

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

      {/* Danger zone */}
      <Card className="shadow-[0_0_0_1px_color-mix(in_srgb,var(--status-danger)_25%,transparent)]">
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-danger-soft text-danger">
            <WarningIcon size={22} weight="duotone" />
          </div>
          <div className="min-w-0 flex-1">
            <h2 className="font-display text-[16px] font-semibold text-fg">Delete account</h2>
            <p className="text-[13px] text-fg-2">Once you delete your account, there is no going back.</p>
          </div>
          <button type="button" className="btn bg-danger-soft text-danger hover:bg-danger hover:text-white">
            Delete account
          </button>
        </div>
      </Card>
    </div>
  );
}
