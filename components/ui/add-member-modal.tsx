"use client";

import { useEffect, useState } from "react";
import { Modal, Field, Input, ModalActions } from "./modal";

const ROLES = [
  "Operations", "Engineering", "Sales", "Team",
  "Creative Director", "Brand Strategist", "Project Manager",
  "Content Writer", "Designer", "Developer", "Account Manager",
  "Social Media Manager", "Analyst", "Intern",
];

export interface MemberDraft {
  name: string;
  role: string;
  email: string;
  phone: string;
}

export type MemberModalValues = MemberDraft & { id?: string };

const empty: MemberDraft = { name: "", role: "", email: "", phone: "" };

interface MemberModalProps {
  open: boolean;
  onClose: () => void;
  onSave?: (member: MemberDraft) => void;
  initial?: MemberModalValues | null;
}

export function AddMemberModal({ open, onClose, onSave, initial }: MemberModalProps) {
  const [form, setForm] = useState<MemberDraft>(empty);
  const editing = Boolean(initial?.id);

  useEffect(() => {
    if (!open) return;
    if (initial) {
      setForm({
        name: initial.name,
        role: initial.role,
        email: initial.email,
        phone: initial.phone ?? "",
      });
    } else {
      setForm(empty);
    }
  }, [open, initial?.id]);

  function set(k: keyof MemberDraft, v: string) {
    setForm((f) => ({ ...f, [k]: v }));
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    onSave?.(form);
    setForm(empty);
    onClose();
  }

  function handleClose() {
    setForm(empty);
    onClose();
  }

  return (
    <Modal open={open} onClose={handleClose} title={editing ? "Edit Team Member" : "Add Team Member"} width="28rem">
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <Field label="Full Name">
          <Input
            required
            placeholder="e.g. Ama Asante"
            value={form.name}
            onChange={(e) => set("name", e.target.value)}
          />
        </Field>

        <Field label="Role">
          <Input
            required
            list="member-roles"
            placeholder="e.g. Operations"
            value={form.role}
            onChange={(e) => set("role", e.target.value)}
          />
          <datalist id="member-roles">
            {ROLES.map((r) => (
              <option key={r} value={r} />
            ))}
          </datalist>
        </Field>

        <Field label="Email">
          <Input
            required
            type="email"
            placeholder="ama@oadigital.com"
            value={form.email}
            onChange={(e) => set("email", e.target.value)}
          />
        </Field>

        <Field label="Phone">
          <Input
            placeholder="Optional"
            value={form.phone}
            onChange={(e) => set("phone", e.target.value)}
          />
        </Field>

        <ModalActions onClose={handleClose} submitLabel={editing ? "Save Changes" : "Add Member"} />
      </form>
    </Modal>
  );
}
