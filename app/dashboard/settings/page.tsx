"use client";

import { useState } from "react";
import { Field, Input, Select } from "@/components/ui/modal";

export default function SettingsPage() {
  const [name, setName] = useState("Asante Frimpong");
  const [email, setEmail] = useState("asante@oadigital.com");
  const [role, setRole] = useState("Admin");
  const [currency, setCurrency] = useState("GHS");
  const [saved, setSaved] = useState(false);

  function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  }

  return (
    <div className="space-y-6 max-w-xl">
      {/* Page title */}
      <div>
        <h1 className="font-display font-bold text-[20px] leading-tight" style={{ color: "var(--text-primary)" }}>Settings</h1>
        <p className="text-[13px] mt-0.5" style={{ color: "var(--text-muted)" }}>Manage your profile and preferences</p>
      </div>

      {/* Profile card */}
      <form onSubmit={handleSave} className="rounded-2xl p-6 space-y-5" style={{ background: "var(--card-bg)", border: "1px solid var(--card-border)" }}>
        <h2 className="font-semibold text-[14px]" style={{ color: "var(--text-primary)" }}>Profile</h2>

        {/* Avatar row */}
        <div className="flex items-center gap-4">
          <div
            className="h-14 w-14 rounded-xl flex items-center justify-center font-display font-bold text-white text-[18px]"
            style={{ background: "var(--oa-blue)" }}
          >
            AF
          </div>
          <div>
            <p className="font-semibold text-[14px]" style={{ color: "var(--text-primary)" }}>{name}</p>
            <p className="text-[12.5px]" style={{ color: "var(--text-muted)" }}>{role}</p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <Field label="Full Name">
            <Input value={name} onChange={(e) => setName(e.target.value)} />
          </Field>
          <Field label="Email">
            <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
          </Field>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <Field label="Role">
            <Select value={role} onChange={(e) => setRole(e.target.value)}>
              <option value="Admin">Admin</option>
              <option value="Manager">Manager</option>
              <option value="Member">Member</option>
            </Select>
          </Field>
          <Field label="Default Currency">
            <Select value={currency} onChange={(e) => setCurrency(e.target.value)}>
              <option value="GHS">GHS – Ghanaian Cedi</option>
              <option value="USD">USD – US Dollar</option>
              <option value="EUR">EUR – Euro</option>
            </Select>
          </Field>
        </div>

        <div className="flex items-center gap-3">
          <button type="submit" className="btn-primary px-5 py-2 rounded-xl text-[13px] font-semibold">
            Save changes
          </button>
          {saved && (
            <span className="text-[12.5px] font-medium" style={{ color: "var(--badge-success-text)" }}>
              Saved!
            </span>
          )}
        </div>
      </form>

      {/* Appearance card */}
      <div className="rounded-2xl p-6 space-y-4" style={{ background: "var(--card-bg)", border: "1px solid var(--card-border)" }}>
        <h2 className="font-semibold text-[14px]" style={{ color: "var(--text-primary)" }}>Appearance</h2>
        <p className="text-[13px]" style={{ color: "var(--text-secondary)" }}>
          Use the sun/moon toggle in the top bar to switch between light and dark mode.
        </p>
      </div>

      {/* Danger zone */}
      <div className="rounded-2xl p-6 space-y-3" style={{ background: "var(--card-bg)", border: "1px solid color-mix(in srgb, var(--badge-danger-text) 30%, transparent)" }}>
        <h2 className="font-semibold text-[14px]" style={{ color: "var(--badge-danger-text)" }}>Danger Zone</h2>
        <p className="text-[13px]" style={{ color: "var(--text-secondary)" }}>
          Once you delete your account, there is no going back.
        </p>
        <button
          type="button"
          className="px-4 py-2 rounded-xl text-[13px] font-semibold transition-opacity hover:opacity-80"
          style={{ background: "var(--badge-danger-bg)", color: "var(--badge-danger-text)" }}
        >
          Delete account
        </button>
      </div>
    </div>
  );
}
