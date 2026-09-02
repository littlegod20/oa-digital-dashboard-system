'use client'

import { useState, useEffect } from 'react'
import { Pencil, Trash2 } from 'lucide-react'
import { formatCurrency, getInitials } from '@/lib/utils'
import { AddMemberModal, type MemberDraft } from '@/components/ui/add-member-modal'
import { ConfirmDialog } from '@/components/ui/modal'

type Member = {
  id: string; name: string; role: string; email: string;
  phone?: string | null; avatar?: string | null;
  activeDeals: number; totalRevenue: string | number;
}

export default function TeamPage() {
  const [memberModalOpen, setMemberModalOpen] = useState(false)
  const [editing, setEditing] = useState<Member | null>(null)
  const [removing, setRemoving] = useState<Member | null>(null)
  const [team, setTeam] = useState<Member[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/team')
      .then(r => r.ok ? r.json() : [])
      .then(setTeam)
      .finally(() => setLoading(false))
  }, [])

  function openAdd() {
    setEditing(null)
    setMemberModalOpen(true)
  }

  function openEdit(member: Member) {
    setEditing(member)
    setMemberModalOpen(true)
  }

  async function handleSave(form: MemberDraft) {
    if (editing) {
      const res = await fetch(`/api/team/${editing.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      const updated = res.ok ? await res.json() : null
      if (updated) {
        setTeam((prev) =>
          prev.map((m) => m.id === updated.id ? updated : m).sort((a, b) => a.name.localeCompare(b.name))
        )
      }
    } else {
      const res = await fetch('/api/team', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      const created = res.ok ? await res.json() : null
      if (created) setTeam((prev) => [...prev, created].sort((a, b) => a.name.localeCompare(b.name)))
    }
  }

  async function handleRemove() {
    if (!removing) return
    const id = removing.id
    const res = await fetch(`/api/team/${id}`, { method: 'DELETE' })
    if (res.ok) setTeam((prev) => prev.filter((m) => m.id !== id))
    setRemoving(null)
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display font-bold text-[20px] leading-tight" style={{ color: "var(--text-primary)" }}>Team</h1>
          <p className="text-[13px] mt-0.5" style={{ color: "var(--text-muted)" }}>{team.length} members</p>
        </div>
        <button onClick={openAdd} className="btn-primary text-[13px] font-semibold px-4 py-2 rounded-xl">
          + Add Member
        </button>
      </div>

      {loading ? (
        <div className="py-16 text-center text-[13.5px]" style={{ color: "var(--text-muted)" }}>Loading team...</div>
      ) : (
        <div className="space-y-3">
          {team.map((member) => (
            <div key={member.id} className="rounded-2xl p-4 flex items-center gap-4 trow transition-colors"
              style={{ background: "var(--card-bg)", border: "1px solid var(--card-border)" }}>
              <div className="w-11 h-11 rounded-xl flex items-center justify-center font-display font-bold text-white text-[14px] shrink-0"
                style={{ background: "var(--brand-strong)" }}>
                {getInitials(member.name)}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-[14px] leading-tight" style={{ color: "var(--text-primary)" }}>{member.name}</p>
                <p className="text-[12.5px] mt-0.5" style={{ color: "var(--text-secondary)" }}>{member.role}</p>
                <p className="text-[11.5px] mt-0.5" style={{ color: "var(--brand)" }}>{member.email}</p>
                {member.phone && (
                  <p className="text-[11.5px] mt-0.5" style={{ color: "var(--text-muted)" }}>{member.phone}</p>
                )}
              </div>
              <div className="text-right shrink-0">
                <p className="font-display font-bold text-[15px]" style={{ color: "var(--text-primary)" }}>{member.activeDeals}</p>
                <p className="text-[10.5px]" style={{ color: "var(--text-muted)" }}>active deals</p>
                <p className="font-medium text-[12px] mt-0.5" style={{ color: "var(--badge-success-text)" }}>
                  {formatCurrency(Number(member.totalRevenue), 'GHS')}
                </p>
              </div>
              <div className="flex flex-col gap-1 shrink-0">
                <button
                  type="button"
                  onClick={() => openEdit(member)}
                  className="btn-ghost inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-[12px] font-medium"
                >
                  <Pencil className="size-3.5" />
                  Edit
                </button>
                <button
                  type="button"
                  onClick={() => setRemoving(member)}
                  className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-[12px] font-medium"
                  style={{ color: "var(--badge-danger-text)" }}
                >
                  <Trash2 className="size-3.5" />
                  Remove
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      <AddMemberModal
        open={memberModalOpen}
        onClose={() => { setMemberModalOpen(false); setEditing(null) }}
        initial={editing ? {
          id: editing.id,
          name: editing.name,
          role: editing.role,
          email: editing.email,
          phone: editing.phone ?? '',
        } : null}
        onSave={handleSave}
      />

      <ConfirmDialog
        open={Boolean(removing)}
        title="Remove team member?"
        message={removing ? `This will permanently remove ${removing.name} from the team list.` : ''}
        confirmLabel="Remove"
        onClose={() => setRemoving(null)}
        onConfirm={handleRemove}
      />
    </div>
  )
}
