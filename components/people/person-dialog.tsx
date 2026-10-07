"use client";

import { useState } from "react";
import { useMutation } from "convex/react";
import { UserCircleGearIcon, UserPlusIcon, WarningCircleIcon } from "@phosphor-icons/react";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";
import { ACCESS_ROLES, ACCESS_ROLE_META, type AccessRole } from "@/convex/permissions";
import { Modal, ModalActions } from "@/components/ui/modal";
import { Alert, Field, Input, Select } from "@/components/ui/field";
import { errorMessage } from "@/lib/utils";

export type PersonOption = { id: string; name: string };
export type DepartmentOption = { id: string; name: string };

export type PersonDraft = {
  id?: string;
  name: string;
  email: string;
  jobTitle: string;
  phone: string;
  departmentId: string;
  lineManagerId: string;
  accessRole: AccessRole;
};

const JOB_TITLE_SUGGESTIONS = [
  "Chief Executive Officer",
  "Chief Technology Officer",
  "Software Developer",
  "Senior Software Developer",
  "Project Manager",
  "Public Relations Officer",
  "HR Officer",
  "Designer",
  "Intern",
];

export const EMPTY_PERSON: PersonDraft = {
  name: "",
  email: "",
  jobTitle: "",
  phone: "",
  departmentId: "",
  lineManagerId: "",
  accessRole: "staff",
};

export function PersonDialog({
  open,
  onClose,
  initial,
  people,
  departments,
  canSetAccess,
}: {
  open: boolean;
  onClose: () => void;
  initial: PersonDraft | null;
  people: PersonOption[];
  departments: DepartmentOption[];
  canSetAccess: boolean;
}) {
  const editing = Boolean(initial?.id);
  return (
    <Modal
      open={open}
      onClose={onClose}
      title={editing ? `Edit ${initial?.name}` : "Add a person"}
      description={editing ? "Update their title, department and who they report to." : "They can sign in once you send them an invite."}
      icon={editing ? UserCircleGearIcon : UserPlusIcon}
      width="34rem"
    >
      {/* Remounts per person, so the form starts from props without an effect. */}
      <PersonForm
        key={initial?.id ?? "new"}
        initial={initial ?? EMPTY_PERSON}
        people={people}
        departments={departments}
        canSetAccess={canSetAccess}
        onClose={onClose}
      />
    </Modal>
  );
}

function PersonForm({
  initial,
  people,
  departments,
  canSetAccess,
  onClose,
}: {
  initial: PersonDraft;
  people: PersonOption[];
  departments: DepartmentOption[];
  canSetAccess: boolean;
  onClose: () => void;
}) {
  const [form, setForm] = useState<PersonDraft>(initial);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const create = useMutation(api.people.create);
  const update = useMutation(api.people.update);
  const setAccess = useMutation(api.people.setAccess);
  const editing = Boolean(initial.id);

  function set<K extends keyof PersonDraft>(k: K, v: PersonDraft[K]) {
    setForm((f) => ({ ...f, [k]: v }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError("");
    const fields = {
      name: form.name,
      jobTitle: form.jobTitle,
      phone: form.phone,
      departmentId: (form.departmentId || undefined) as Id<"departments"> | undefined,
      lineManagerId: (form.lineManagerId || undefined) as Id<"employees"> | undefined,
    };
    try {
      if (editing) {
        const id = initial.id as Id<"employees">;
        await update({ id, ...fields });
        if (canSetAccess && form.accessRole !== initial.accessRole) await setAccess({ id, accessRole: form.accessRole });
      } else {
        await create({ ...fields, email: form.email, accessRole: canSetAccess ? form.accessRole : undefined });
      }
      onClose();
    } catch (err) {
      setError(errorMessage(err));
      setSaving(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      {error && <Alert icon={WarningCircleIcon}>{error}</Alert>}

      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Full name">
          <Input required value={form.name} onChange={(e) => set("name", e.target.value)} placeholder="e.g. Ama Mensah" />
        </Field>
        <Field label="Job title">
          <Input
            required
            list="job-titles"
            value={form.jobTitle}
            onChange={(e) => set("jobTitle", e.target.value)}
            placeholder="e.g. Software Developer"
          />
          <datalist id="job-titles">
            {JOB_TITLE_SUGGESTIONS.map((t) => (
              <option key={t} value={t} />
            ))}
          </datalist>
        </Field>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Department">
          <Select value={form.departmentId} onChange={(e) => set("departmentId", e.target.value)}>
            <option value="">No department</option>
            {departments.map((d) => (
              <option key={d.id} value={d.id}>{d.name}</option>
            ))}
          </Select>
        </Field>
        <Field label="Line manager">
          <Select value={form.lineManagerId} onChange={(e) => set("lineManagerId", e.target.value)}>
            <option value="">Nobody (reports to no one)</option>
            {people
              .filter((p) => p.id !== initial.id)
              .map((p) => (
                <option key={p.id} value={p.id}>{p.name}</option>
              ))}
          </Select>
        </Field>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Email (used to sign in)">
          <Input
            required
            type="email"
            value={form.email}
            onChange={(e) => set("email", e.target.value)}
            disabled={editing}
            className={editing ? "cursor-not-allowed opacity-70" : undefined}
            placeholder="name@oadigismartsecurity.com"
          />
        </Field>
        <Field label="Phone">
          <Input type="tel" value={form.phone} onChange={(e) => set("phone", e.target.value)} placeholder="Optional" />
        </Field>
      </div>

      {canSetAccess && (
        <Field label="Access level">
          <Select value={form.accessRole} onChange={(e) => set("accessRole", e.target.value as AccessRole)}>
            {ACCESS_ROLES.map((r) => (
              <option key={r} value={r}>
                {ACCESS_ROLE_META[r].label}: {ACCESS_ROLE_META[r].description}
              </option>
            ))}
          </Select>
        </Field>
      )}

      <ModalActions onClose={onClose} submitLabel={saving ? "Saving…" : editing ? "Save changes" : "Add person"} />
    </form>
  );
}
