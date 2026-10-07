"use client";

import { useState } from "react";
import { UserPlusIcon } from "@phosphor-icons/react";
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
  const editing = Boolean(initial?.id);

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={editing ? "Edit team member" : "Add team member"}
      icon={UserPlusIcon}
      description="Team members can be assigned to deals."
      width="28rem"
    >
      {/* Remounts per opened record, so the form state starts from props without an effect. */}
      <MemberForm key={initial?.id ?? "new"} initial={initial} onSave={onSave} onClose={onClose} />
    </Modal>
  );
}

function MemberForm({
  initial,
  onSave,
  onClose,
}: {
  initial?: MemberModalValues | null;
  onSave?: (member: MemberDraft) => void;
  onClose: () => void;
}) {
  const [form, setForm] = useState<MemberDraft>(() =>
    initial
      ? {
          name: initial.name,
          role: initial.role,
          email: initial.email,
          phone: initial.phone ?? "",
        }
      : empty,
  );
  const editing = Boolean(initial?.id);

  function set(k: keyof MemberDraft, v: string) {
    setForm((f) => ({ ...f, [k]: v }));
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    onSave?.(form);
    onClose();
  }

  return (
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

      <ModalActions onClose={onClose} submitLabel={editing ? "Save changes" : "Add member"} />
    </form>
  );
}
