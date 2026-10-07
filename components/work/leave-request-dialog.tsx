"use client";

import { useState } from "react";
import { useMutation } from "convex/react";
import { CalendarPlusIcon, InfoIcon, WarningCircleIcon } from "@phosphor-icons/react";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";
import { workingDays } from "@/convex/dates";
import { Modal, ModalActions } from "@/components/ui/modal";
import { Alert, Field, Input, Select, Textarea } from "@/components/ui/field";
import { errorMessage } from "@/lib/utils";

type LeaveType = { id: string; name: string; countsAgainstAllowance: boolean; paid: boolean };

export function LeaveRequestDialog({
  open,
  onClose,
  types,
  remaining,
  autoApproved,
  route,
}: {
  open: boolean;
  onClose: () => void;
  types: LeaveType[];
  remaining: number;
  autoApproved: boolean;
  route: string[];
}) {
  return (
    <Modal open={open} onClose={onClose} title="Request leave" description="Working days only (Mon–Fri)." icon={CalendarPlusIcon} width="32rem">
      {open && <LeaveForm types={types} remaining={remaining} autoApproved={autoApproved} route={route} onClose={onClose} />}
    </Modal>
  );
}

function LeaveForm({
  types,
  remaining,
  autoApproved,
  route,
  onClose,
}: {
  types: LeaveType[];
  remaining: number;
  autoApproved: boolean;
  route: string[];
  onClose: () => void;
}) {
  const submit = useMutation(api.leave.request);
  const today = new Date().toISOString().slice(0, 10);
  const [typeId, setTypeId] = useState(types[0]?.id ?? "");
  const [start, setStart] = useState(today);
  const [end, setEnd] = useState(today);
  const [reason, setReason] = useState("");
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  const type = types.find((t) => t.id === typeId);
  const days = workingDays(start, end);
  const over = type?.countsAgainstAllowance && days > remaining;

  const routeText = autoApproved
    ? "As CEO, your leave is approved automatically."
    : route.length
      ? `Goes to ${route.join(", then ")} for approval.`
      : "There's nobody to approve this yet. Ask HR to set your line manager.";

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError("");
    try {
      await submit({ leaveTypeId: typeId as Id<"leaveTypes">, startDate: start, endDate: end, reason });
      onClose();
    } catch (err) {
      setError(errorMessage(err));
      setSaving(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      {error && <Alert icon={WarningCircleIcon}>{error}</Alert>}

      <Field label="Type of leave">
        <Select value={typeId} onChange={(e) => setTypeId(e.target.value)}>
          {types.map((t) => (
            <option key={t.id} value={t.id}>
              {t.name}
              {!t.paid ? " (unpaid)" : ""}
            </option>
          ))}
        </Select>
      </Field>

      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="First day">
          <Input
            type="date"
            required
            value={start}
            onChange={(e) => {
              setStart(e.target.value);
              if (e.target.value > end) setEnd(e.target.value);
            }}
          />
        </Field>
        <Field label="Last day">
          <Input type="date" required min={start} value={end} onChange={(e) => setEnd(e.target.value)} />
        </Field>
      </div>

      <div className="flex items-center justify-between rounded-2xl bg-muted px-4 py-3 text-[13px]">
        <span className="text-fg-2">Working days</span>
        <span className="tabular font-display text-[18px] font-semibold text-fg">{days}</span>
      </div>
      {type?.countsAgainstAllowance && (
        <p className={over ? "text-[12.5px] font-semibold text-danger" : "text-[12.5px] text-fg-3"}>
          {over ? `That's more than the ${remaining} days you have left this year.` : `${remaining - days} days of your allowance will be left.`}
        </p>
      )}

      <Field label="Reason">
        <Textarea required value={reason} onChange={(e) => setReason(e.target.value)} placeholder="e.g. Family holiday" />
      </Field>

      <Alert tone="info" icon={InfoIcon}>
        {routeText}
      </Alert>

      <ModalActions onClose={onClose} submitLabel={saving ? "Sending…" : autoApproved ? "Book leave" : "Send request"} />
    </form>
  );
}
