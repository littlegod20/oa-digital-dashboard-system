"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useMutation, useQuery } from "convex/react";
import { FolderPlusIcon, FolderSimpleIcon, WarningCircleIcon } from "@phosphor-icons/react";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";
import { Modal, ModalActions } from "@/components/ui/modal";
import { Alert, Field, Input, Select, Textarea } from "@/components/ui/field";
import { Avatar } from "@/components/ui/avatar";
import { cn, errorMessage } from "@/lib/utils";
import { PROJECT_STATUS, type ProjectStatus } from "./meta";

export type ProjectDraft = {
  id?: string;
  name: string;
  client: string;
  description: string;
  status: ProjectStatus;
  startDate: string;
  dueDate: string;
};

export function ProjectDialog({ open, onClose, initial }: { open: boolean; onClose: () => void; initial?: ProjectDraft | null }) {
  const editing = Boolean(initial?.id);
  return (
    <Modal
      open={open}
      onClose={onClose}
      title={editing ? "Edit project" : "New project"}
      description={editing ? "Update the details. Manage the team from the Team tab." : "Set up a delivery project and its team."}
      icon={editing ? FolderSimpleIcon : FolderPlusIcon}
      width="40rem"
    >
      {open && <ProjectForm initial={initial ?? null} onClose={onClose} />}
    </Modal>
  );
}

function ProjectForm({ initial, onClose }: { initial: ProjectDraft | null; onClose: () => void }) {
  const router = useRouter();
  const editing = Boolean(initial?.id);
  const create = useMutation(api.projects.create);
  const update = useMutation(api.projects.update);
  const directory = useQuery(api.people.directory, editing ? "skip" : {});
  const deals = useQuery(api.projects.linkableDeals, editing ? "skip" : {});

  const today = new Date().toISOString().slice(0, 10);
  const [form, setForm] = useState<ProjectDraft>(
    initial ?? { name: "", client: "", description: "", status: "active", startDate: today, dueDate: "" },
  );
  const [leadId, setLeadId] = useState("");
  const [memberIds, setMemberIds] = useState<string[]>([]);
  const [dealId, setDealId] = useState("");
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  function set<K extends keyof ProjectDraft>(k: K, v: ProjectDraft[K]) {
    setForm((f) => ({ ...f, [k]: v }));
  }

  function pickDeal(id: string) {
    setDealId(id);
    const deal = deals?.find((d) => d.id === id);
    if (deal) {
      setForm((f) => ({ ...f, client: f.client || deal.client, name: f.name || deal.label.split(" · ")[1] || "" }));
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError("");
    const details = {
      name: form.name,
      client: form.client,
      description: form.description,
      status: form.status,
      startDate: form.startDate || undefined,
      dueDate: form.dueDate || undefined,
    };
    try {
      if (editing) {
        await update({ id: initial!.id as Id<"projects">, ...details });
        onClose();
      } else {
        const id = await create({
          ...details,
          leadId: (leadId || undefined) as Id<"employees"> | undefined,
          memberIds: memberIds as Id<"employees">[],
          dealId: (dealId || undefined) as Id<"deals"> | undefined,
        });
        onClose();
        router.push(`/dashboard/projects/${id}`);
      }
    } catch (err) {
      setError(errorMessage(err));
      setSaving(false);
    }
  }

  const people = directory?.people ?? [];

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      {error && <Alert icon={WarningCircleIcon}>{error}</Alert>}

      {!editing && deals && deals.length > 0 && (
        <Field label="Linked deal (optional)">
          <Select value={dealId} onChange={(e) => pickDeal(e.target.value)}>
            <option value="">Not linked to a deal</option>
            {deals.map((d) => (
              <option key={d.id} value={d.id}>{d.label}</option>
            ))}
          </Select>
        </Field>
      )}

      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Project name">
          <Input required value={form.name} onChange={(e) => set("name", e.target.value)} placeholder="e.g. Ashesi Attendance System" />
        </Field>
        <Field label="Client">
          <Input value={form.client} onChange={(e) => set("client", e.target.value)} placeholder="e.g. Ashesi University" />
        </Field>
      </div>

      <Field label="Description">
        <Textarea value={form.description} onChange={(e) => set("description", e.target.value)} placeholder="Scope, goals and anything the team should know." />
      </Field>

      <div className="grid gap-4 sm:grid-cols-3">
        <Field label="Status">
          <Select value={form.status} onChange={(e) => set("status", e.target.value as ProjectStatus)}>
            {(Object.keys(PROJECT_STATUS) as ProjectStatus[]).map((s) => (
              <option key={s} value={s}>{PROJECT_STATUS[s].label}</option>
            ))}
          </Select>
        </Field>
        <Field label="Start">
          <Input type="date" value={form.startDate} onChange={(e) => set("startDate", e.target.value)} />
        </Field>
        <Field label="Due">
          <Input type="date" min={form.startDate || undefined} value={form.dueDate} onChange={(e) => set("dueDate", e.target.value)} />
        </Field>
      </div>

      {!editing && (
        <>
          <Field label="Team lead">
            <Select value={leadId} onChange={(e) => setLeadId(e.target.value)}>
              <option value="">Choose later</option>
              {people.map((p) => (
                <option key={p.id} value={p.id}>{p.name} · {p.jobTitle}</option>
              ))}
            </Select>
          </Field>
          <div>
            <p className="mb-2 text-[12px] font-semibold text-fg-2">Team members</p>
            <div className="flex flex-wrap gap-2">
              {people.map((p) => {
                const on = memberIds.includes(p.id) || p.id === leadId;
                return (
                  <button
                    key={p.id}
                    type="button"
                    disabled={p.id === leadId}
                    onClick={() => setMemberIds((ids) => (ids.includes(p.id) ? ids.filter((x) => x !== p.id) : [...ids, p.id]))}
                    className={cn(
                      "flex items-center gap-2 rounded-full py-1 pl-1 pr-3 text-[12.5px] font-medium transition-colors",
                      on ? "bg-brand-soft text-brand shadow-[inset_0_0_0_1px_var(--brand-ring)]" : "bg-muted text-fg-2 hover:text-fg",
                    )}
                    aria-pressed={on}
                  >
                    <Avatar name={p.name} size={24} />
                    {p.name.split(" ")[0]}
                    {p.id === leadId && <span className="text-[10.5px] font-semibold">· Lead</span>}
                  </button>
                );
              })}
            </div>
          </div>
        </>
      )}

      <ModalActions onClose={onClose} submitLabel={saving ? "Saving…" : editing ? "Save changes" : "Create project"} />
    </form>
  );
}
