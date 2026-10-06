"use client";

import { useState } from "react";
import { ReceiptIcon } from "@phosphor-icons/react";
import { Modal, Field, Input, Select, ModalActions } from "./modal";

const CURRENCIES = ["GHS", "USD"] as const;
const TYPES = [
  { value: "income", label: "Income" },
  { value: "payment_received", label: "Payment received" },
  { value: "expense", label: "Expense" },
  { value: "transfer", label: "Transfer" },
] as const;
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
  currency: (typeof CURRENCIES)[number];
  type: (typeof TYPES)[number]["value"];
  category: string;
  person: string;
}

const empty: TransactionDraft = {
  description: "", amount: "", currency: "GHS",
  type: "income", category: CATEGORIES[0], person: "",
};

export function AddTransactionModal({ open, onClose, onAdd }: AddTransactionModalProps) {
  const [form, setForm] = useState<TransactionDraft>(empty);

  function set<K extends keyof TransactionDraft>(k: K, v: TransactionDraft[K]) {
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
    <Modal open={open} onClose={handleClose} title="New transaction" icon={ReceiptIcon} description="Record money coming in or going out." width="32rem">
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <Field label="Description">
          <Input
            required
            placeholder="e.g. Invoice #42 — Accra Motors"
            value={form.description}
            onChange={(e) => set("description", e.target.value)}
          />
        </Field>

        <div className="grid gap-4 sm:grid-cols-2">
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
              onChange={(e) => set("currency", e.target.value as TransactionDraft["currency"])}
            >
              {CURRENCIES.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </Select>
          </Field>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Type">
            <Select
              value={form.type}
              onChange={(e) => set("type", e.target.value as TransactionDraft["type"])}
            >
              {TYPES.map((t) => (
                <option key={t.value} value={t.value}>{t.label}</option>
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

        <ModalActions onClose={handleClose} submitLabel="Save transaction" />
      </form>
    </Modal>
  );
}
