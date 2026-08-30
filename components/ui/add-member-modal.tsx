"use client";

import { useState } from "react";
import { Modal, Field, Input, Select, ModalActions } from "./modal";

const ROLES = [
  "Creative Director", "Brand Strategist", "Project Manager",
  "Content Writer", "Designer", "Developer", "Account Manager",
  "Social Media Manager", "Analyst", "Intern",
];

interface AddMemberModalProps {
  open: boolean;
  onClose: () => void;
  onAdd?: (member: MemberDraft) => void;
}

export interface MemberDraft {
  name: string;
  role: string;
  email: string;
}

const empty: MemberDraft = { name: "", role: ROLES[0], email: "" };

export function AddMemberModal({ open, onClose, onAdd }: AddMemberModalProps) {
  const [form, setForm] = useState<MemberDraft>(empty);

  function set(k: keyof MemberDraft, v: string) {
    setForm((f) => ({ ...f, [k]: v }));
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    onAdd?.(form);
    setForm(empty);
    onClose();
  }

  function handleClose() {
    setForm(empty);
    onClose();
  }

  return (
    <Modal open={open} onClose={handleClose} title="Add Team Member" width="28rem">
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
          <Select
            required
            value={form.role}
            onChange={(e) => set("role", e.target.value)}
          >
            {ROLES.map((r) => (
              <option key={r} value={r}>{r}</option>
            ))}
          </Select>
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

        <ModalActions onClose={handleClose} submitLabel="Add Member" />
      </form>
    </Modal>
  );
}
