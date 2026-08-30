"use client";

import { useState } from "react";
import { Modal, Field, Input, Select, Textarea, ModalActions } from "./modal";

const PHASES = ["Discovery", "Proposal", "Negotiation", "Contract", "Closed Won", "Closed Lost"];

interface AddDealModalProps {
  open: boolean;
  onClose: () => void;
  onAdd?: (deal: DealDraft) => void;
}

export interface DealDraft {
  clientName: string;
  dealTitle: string;
  value: string;
  phase: string;
  nextAction: string;
  nextActionDate: string;
  notes: string;
}

const empty: DealDraft = {
  clientName: "", dealTitle: "", value: "", phase: PHASES[0],
  nextAction: "", nextActionDate: "", notes: "",
};

export function AddDealModal({ open, onClose, onAdd }: AddDealModalProps) {
  const [form, setForm] = useState<DealDraft>(empty);

  function set(k: keyof DealDraft, v: string) {
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
    <Modal open={open} onClose={handleClose} title="Add Deal" width="32rem">
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <div className="grid grid-cols-2 gap-4">
          <Field label="Client Name">
            <Input
              required
              placeholder="e.g. Accra Motors Ltd"
              value={form.clientName}
              onChange={(e) => set("clientName", e.target.value)}
            />
          </Field>
          <Field label="Deal Title">
            <Input
              required
              placeholder="e.g. Brand Refresh"
              value={form.dealTitle}
              onChange={(e) => set("dealTitle", e.target.value)}
            />
          </Field>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <Field label="Value (GHS)">
            <Input
              type="number"
              min="0"
              step="0.01"
              placeholder="0.00"
              value={form.value}
              onChange={(e) => set("value", e.target.value)}
            />
          </Field>
          <Field label="Phase">
            <Select
              required
              value={form.phase}
              onChange={(e) => set("phase", e.target.value)}
            >
              {PHASES.map((p) => (
                <option key={p} value={p}>{p}</option>
              ))}
            </Select>
          </Field>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <Field label="Next Action">
            <Input
              placeholder="e.g. Send proposal"
              value={form.nextAction}
              onChange={(e) => set("nextAction", e.target.value)}
            />
          </Field>
          <Field label="Next Action Date">
            <Input
              type="date"
              value={form.nextActionDate}
              onChange={(e) => set("nextActionDate", e.target.value)}
            />
          </Field>
        </div>

        <Field label="Notes">
          <Textarea
            placeholder="Any additional notes..."
            value={form.notes}
            onChange={(e) => set("notes", e.target.value)}
          />
        </Field>

        <ModalActions onClose={handleClose} submitLabel="Add Deal" />
      </form>
    </Modal>
  );
}
