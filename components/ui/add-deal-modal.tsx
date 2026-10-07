"use client";

import { useState } from "react";
import { HandshakeIcon } from "@phosphor-icons/react";
import { Modal, Field, Input, Select, Textarea, ModalActions } from "./modal";
import { PHASE_META, type Currency, type PipelinePhase } from "@/lib/types";

const PHASES = Object.keys(PHASE_META) as PipelinePhase[];

export interface DealDraft {
  client: string;
  title: string;
  value: string;
  currency: Currency;
  phase: PipelinePhase;
  assignee: string;
  paid: string;
  nextAction: string;
  notes: string;
}

export type DealModalValues = DealDraft & { id?: string };

const empty: DealDraft = {
  client: "",
  title: "",
  value: "",
  currency: "GHS",
  phase: "lead",
  assignee: "",
  paid: "0",
  nextAction: "",
  notes: "",
};

interface DealModalProps {
  open: boolean;
  onClose: () => void;
  onSave?: (deal: DealDraft) => void;
  initial?: DealModalValues | null;
  assignees?: string[];
}

export function AddDealModal({ open, onClose, onSave, initial, assignees = [] }: DealModalProps) {
  const editing = Boolean(initial?.id);

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={editing ? "Edit deal" : "New deal"}
      icon={HandshakeIcon}
      description={editing ? "Update the deal details and payment status." : "Track a new opportunity in the pipeline."}
      width="32rem"
    >
      {/* Remounts per opened record, so the form state starts from props without an effect. */}
      <DealForm key={initial?.id ?? "new"} initial={initial} onSave={onSave} onClose={onClose} assignees={assignees} />
    </Modal>
  );
}

function DealForm({
  initial,
  onSave,
  onClose,
  assignees,
}: {
  initial?: DealModalValues | null;
  onSave?: (deal: DealDraft) => void;
  onClose: () => void;
  assignees: string[];
}) {
  const [form, setForm] = useState<DealDraft>(() =>
    initial
      ? {
          client: initial.client,
          title: initial.title,
          value: String(initial.value ?? ""),
          currency: initial.currency,
          phase: initial.phase,
          assignee: initial.assignee,
          paid: String(initial.paid ?? "0"),
          nextAction: initial.nextAction,
          notes: initial.notes,
        }
      : empty,
  );
  const editing = Boolean(initial?.id);

  function set<K extends keyof DealDraft>(k: K, v: DealDraft[K]) {
    setForm((f) => ({ ...f, [k]: v }));
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    onSave?.(form);
    onClose();
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Client Name">
          <Input
            required
            placeholder="e.g. Accra Motors Ltd"
            value={form.client}
            onChange={(e) => set("client", e.target.value)}
          />
        </Field>
        <Field label="Deal Title">
          <Input
            required
            placeholder="e.g. Brand Refresh"
            value={form.title}
            onChange={(e) => set("title", e.target.value)}
          />
        </Field>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Value">
          <Input
            type="number"
            min="0"
            step="0.01"
            placeholder="0.00"
            value={form.value}
            onChange={(e) => set("value", e.target.value)}
          />
        </Field>
        <Field label="Currency">
          <Select
            required
            value={form.currency}
            onChange={(e) => set("currency", e.target.value as Currency)}
          >
            <option value="GHS">GHS</option>
            <option value="USD">USD</option>
          </Select>
        </Field>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Paid">
          <Input
            type="number"
            min="0"
            step="0.01"
            placeholder="0.00"
            value={form.paid}
            onChange={(e) => set("paid", e.target.value)}
          />
        </Field>
        <Field label="Phase">
          <Select
            required
            value={form.phase}
            onChange={(e) => set("phase", e.target.value as PipelinePhase)}
          >
            {PHASES.map((p) => (
              <option key={p} value={p}>{PHASE_META[p].label}</option>
            ))}
          </Select>
        </Field>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Assignee">
          <Input
            list="deal-assignees"
            placeholder="e.g. Gerhard"
            value={form.assignee}
            onChange={(e) => set("assignee", e.target.value)}
          />
          {assignees.length > 0 && (
            <datalist id="deal-assignees">
              {assignees.map((name) => (
                <option key={name} value={name} />
              ))}
            </datalist>
          )}
        </Field>
        <Field label="Next Action">
          <Input
            placeholder="e.g. Send proposal"
            value={form.nextAction}
            onChange={(e) => set("nextAction", e.target.value)}
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

      <ModalActions onClose={onClose} submitLabel={editing ? "Save changes" : "Create deal"} />
    </form>
  );
}
