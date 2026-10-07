"use client";

import { useRef, useState } from "react";
import { useMutation } from "convex/react";
import { InfoIcon, PaperclipIcon, PlusIcon, ReceiptIcon, TrashIcon, WarningCircleIcon, XIcon } from "@phosphor-icons/react";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";
import { Modal, ModalActions } from "@/components/ui/modal";
import { Alert, Field, Input, Select } from "@/components/ui/field";
import { errorMessage, formatCurrency } from "@/lib/utils";

type Item = { key: number; date: string; category: string; description: string; amount: string };

const MAX_FILES = 5;
const MAX_BYTES = 10 * 1024 * 1024;

export function ExpenseClaimDialog({
  open,
  onClose,
  categories,
  autoApproved,
  route,
}: {
  open: boolean;
  onClose: () => void;
  categories: string[];
  autoApproved: boolean;
  route: string[];
}) {
  return (
    <Modal open={open} onClose={onClose} title="New expense claim" description="Claim back what you spent for work." icon={ReceiptIcon} width="40rem">
      {open && <ClaimForm categories={categories} autoApproved={autoApproved} route={route} onClose={onClose} />}
    </Modal>
  );
}

function ClaimForm({
  categories,
  autoApproved,
  route,
  onClose,
}: {
  categories: string[];
  autoApproved: boolean;
  route: string[];
  onClose: () => void;
}) {
  const submit = useMutation(api.expenses.submit);
  const generateUploadUrl = useMutation(api.expenses.generateUploadUrl);
  const today = new Date().toISOString().slice(0, 10);
  const nextKey = useRef(1);
  const fileInput = useRef<HTMLInputElement>(null);

  const [title, setTitle] = useState("");
  const [currency, setCurrency] = useState<"GHS" | "USD">("GHS");
  const [items, setItems] = useState<Item[]>([{ key: 0, date: today, category: categories[0] ?? "Other", description: "", amount: "" }]);
  const [files, setFiles] = useState<File[]>([]);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  const total = items.reduce((s, i) => s + (Number(i.amount) || 0), 0);

  function updateItem(key: number, patch: Partial<Item>) {
    setItems((xs) => xs.map((x) => (x.key === key ? { ...x, ...patch } : x)));
  }

  function addFiles(list: FileList | null) {
    if (!list) return;
    const picked = Array.from(list);
    const tooBig = picked.find((f) => f.size > MAX_BYTES);
    if (tooBig) return setError(`"${tooBig.name}" is over 10 MB.`);
    setError("");
    setFiles((fs) => [...fs, ...picked].slice(0, MAX_FILES));
  }

  async function upload(file: File) {
    const url = await generateUploadUrl();
    const res = await fetch(url, { method: "POST", headers: { "Content-Type": file.type || "application/octet-stream" }, body: file });
    if (!res.ok) throw new Error(`Upload failed for ${file.name}`);
    const { storageId } = (await res.json()) as { storageId: Id<"_storage"> };
    return { storageId, name: file.name };
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError("");
    try {
      const receipts = await Promise.all(files.map(upload));
      await submit({
        title,
        currency,
        items: items.map((i) => ({ date: i.date, category: i.category, description: i.description, amount: Number(i.amount) || 0 })),
        receipts,
      });
      onClose();
    } catch (err) {
      setError(err instanceof Error && !("data" in err) ? err.message : errorMessage(err));
      setSaving(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      {error && <Alert icon={WarningCircleIcon}>{error}</Alert>}

      <div className="grid gap-4 sm:grid-cols-[1fr_8rem]">
        <Field label="What's this claim for?">
          <Input required value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g. Site visit to Kumasi" />
        </Field>
        <Field label="Currency">
          <Select value={currency} onChange={(e) => setCurrency(e.target.value as "GHS" | "USD")}>
            <option value="GHS">GHS</option>
            <option value="USD">USD</option>
          </Select>
        </Field>
      </div>

      <div>
        <p className="mb-2 text-[12px] font-semibold text-fg-2">Expenses</p>
        <ul className="space-y-2">
          {items.map((item) => (
            <li key={item.key} className="grid grid-cols-2 gap-2 rounded-2xl bg-muted p-3 sm:grid-cols-[8.5rem_10rem_1fr_7rem_2rem] sm:items-center">
              <Input type="date" required value={item.date} onChange={(e) => updateItem(item.key, { date: e.target.value })} className="h-10" aria-label="Date" />
              <Select value={item.category} onChange={(e) => updateItem(item.key, { category: e.target.value })} className="h-10" aria-label="Category">
                {categories.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </Select>
              <Input
                required
                value={item.description}
                onChange={(e) => updateItem(item.key, { description: e.target.value })}
                placeholder="Description"
                className="col-span-2 h-10 sm:col-span-1"
                aria-label="Description"
              />
              <Input
                required
                type="number"
                min="0.01"
                step="0.01"
                value={item.amount}
                onChange={(e) => updateItem(item.key, { amount: e.target.value })}
                placeholder="0.00"
                className="h-10"
                aria-label="Amount"
              />
              <button
                type="button"
                onClick={() => setItems((xs) => xs.filter((x) => x.key !== item.key))}
                disabled={items.length === 1}
                className="icon-btn icon-btn-sm icon-btn-danger justify-self-end disabled:opacity-30"
                aria-label="Remove expense"
              >
                <TrashIcon size={16} />
              </button>
            </li>
          ))}
        </ul>
        <div className="mt-2 flex items-center justify-between">
          <button
            type="button"
            className="btn btn-ghost btn-sm"
            onClick={() => setItems((xs) => [...xs, { key: nextKey.current++, date: today, category: categories[0] ?? "Other", description: "", amount: "" }])}
          >
            <PlusIcon size={14} weight="bold" />
            Add another expense
          </button>
          <p className="text-[13px] text-fg-2">
            Total <span className="tabular ml-1 font-display text-[18px] font-semibold text-fg">{formatCurrency(total, currency)}</span>
          </p>
        </div>
      </div>

      <div>
        <p className="mb-2 text-[12px] font-semibold text-fg-2">Receipts (up to {MAX_FILES}, 10 MB each)</p>
        {files.length > 0 && (
          <ul className="mb-2 flex flex-wrap gap-2">
            {files.map((f, i) => (
              <li key={`${f.name}-${i}`} className="flex items-center gap-1.5 rounded-full bg-muted py-1 pl-3 pr-1 text-[12px] text-fg-2">
                <PaperclipIcon size={13} />
                <span className="max-w-[12rem] truncate">{f.name}</span>
                <button type="button" onClick={() => setFiles((fs) => fs.filter((_, j) => j !== i))} className="icon-btn icon-btn-sm h-6! w-6!" aria-label={`Remove ${f.name}`}>
                  <XIcon size={12} />
                </button>
              </li>
            ))}
          </ul>
        )}
        <input ref={fileInput} type="file" accept="image/*,application/pdf" multiple hidden onChange={(e) => addFiles(e.target.files)} />
        <button type="button" onClick={() => fileInput.current?.click()} disabled={files.length >= MAX_FILES} className="btn btn-secondary btn-sm">
          <PaperclipIcon size={14} />
          Attach receipts
        </button>
      </div>

      <Alert tone="info" icon={InfoIcon}>
        {autoApproved
          ? "As CEO, your claim is approved automatically and goes straight to payment."
          : route.length
            ? `Goes to ${route.join(", then ")} for approval, then it's paid.`
            : "There's nobody to approve this yet. Ask HR to set your line manager."}
      </Alert>

      <ModalActions onClose={onClose} submitLabel={saving ? "Submitting…" : "Submit claim"} />
    </form>
  );
}
