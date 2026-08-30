"use client";

import { useState } from "react";
import { Modal, Field, Input, Select, ModalActions } from "./modal";

const CURRENCIES = ["GHS", "USD", "EUR", "GBP"];
const TYPES = ["Income", "Expense", "Transfer"];
const CATEGORIES = [
  "Client Payment", "Salary", "Software & Tools", "Marketing",
  "Office & Supplies", "Travel", "Freelance", "Tax", "Other",
];

interface AddTransactionModalProps {
  open: boolean;
  onClose: () => void;
  onAdd?: (transaction: TransactionDraft) => void;
}

export interface TransactionDraft {
  description: string;
  amount: string;
  currency: string;
  type: string;
  category: string;
  person: string;
}

const empty: TransactionDraft = {
  description: "", amount: "", currency: "GHS",
  type: "Income", category: CATEGORIES[0], person: "",
};

export function AddTransactionModal({ open, onClose, onAdd }: AddTransactionModalProps) {
  const [form, setForm] = useState<TransactionDraft>(empty);

  function set(k: keyof TransactionDraft, v: string) {
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
    <Modal open={open} onClose={handleClose} title="Add Transaction" width="32rem">
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <Field label="Description">
          <Input
            required
            placeholder="e.g. Invoice #42 — Accra Motors"
            value={form.description}
            onChange={(e) => set("description", e.target.value)}
          />
        </Field>

        <div className="grid grid-cols-2 gap-4">
          <Field label="Amount">
            <Input
              required
              type="number"
              min="0"
              step="0.01"
              placeholder="0.00"
              value={form.amount}
              onChange={(e) => set("amount", e.target.value)}
            />
          </Field>
          <Field label="Currency">
            <Select
              value={form.currency}
              onChange={(e) => set("currency", e.target.value)}
            >
              {CURRENCIES.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </Select>
          </Field>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <Field label="Type">
            <Select
              value={form.type}
              onChange={(e) => set("type", e.target.value)}
            >
              {TYPES.map((t) => (
                <option key={t} value={t}>{t}</option>
              ))}
            </Select>
          </Field>
          <Field label="Category">
            <Select
              value={form.category}
              onChange={(e) => set("category", e.target.value)}
            >
              {CATEGORIES.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </Select>
          </Field>
        </div>

        <Field label="Person / Client (optional)">
          <Input
            placeholder="e.g. Kofi Mensah"
            value={form.person}
            onChange={(e) => set("person", e.target.value)}
          />
        </Field>

        <ModalActions onClose={handleClose} submitLabel="Add Transaction" />
      </form>
    </Modal>
  );
}
