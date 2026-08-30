"use client";

import { useState } from "react";
import { Modal, Field, Input, Textarea, ModalActions } from "./modal";

interface AddContactModalProps {
  open: boolean;
  onClose: () => void;
  onAdd?: (contact: ContactDraft) => void;
}

export interface ContactDraft {
  name: string;
  company: string;
  email: string;
  phone: string;
  tags: string;
  notes: string;
}

const empty: ContactDraft = {
  name: "", company: "", email: "", phone: "", tags: "", notes: "",
};

export function AddContactModal({ open, onClose, onAdd }: AddContactModalProps) {
  const [form, setForm] = useState<ContactDraft>(empty);

  function set(k: keyof ContactDraft, v: string) {
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
    <Modal open={open} onClose={handleClose} title="Add Contact" width="32rem">
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <div className="grid grid-cols-2 gap-4">
          <Field label="Full Name">
            <Input
              required
              placeholder="e.g. Kofi Mensah"
              value={form.name}
              onChange={(e) => set("name", e.target.value)}
            />
          </Field>
          <Field label="Company">
            <Input
              placeholder="e.g. Accra Motors Ltd"
              value={form.company}
              onChange={(e) => set("company", e.target.value)}
            />
          </Field>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <Field label="Email">
            <Input
              type="email"
              placeholder="kofi@example.com"
              value={form.email}
              onChange={(e) => set("email", e.target.value)}
            />
          </Field>
          <Field label="Phone">
            <Input
              type="tel"
              placeholder="+233 XX XXX XXXX"
              value={form.phone}
              onChange={(e) => set("phone", e.target.value)}
            />
          </Field>
        </div>

        <Field label="Tags">
          <Input
            placeholder="e.g. Client, Partner, VIP  (comma-separated)"
            value={form.tags}
            onChange={(e) => set("tags", e.target.value)}
          />
        </Field>

        <Field label="Notes">
          <Textarea
            placeholder="Any additional notes..."
            value={form.notes}
            onChange={(e) => set("notes", e.target.value)}
          />
        </Field>

        <ModalActions onClose={handleClose} submitLabel="Add Contact" />
      </form>
    </Modal>
  );
}
