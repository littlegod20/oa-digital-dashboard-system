'use client'

import { useState, useEffect } from 'react'
import {
  CoinsIcon,
  EnvelopeSimpleIcon,
  KanbanIcon,
  PencilSimpleIcon,
  PhoneIcon,
  TrashIcon,
  UserPlusIcon,
  UsersThreeIcon,
} from '@phosphor-icons/react'
import { formatCurrency } from '@/lib/utils'
import { PageHeader } from '@/components/ui/page-header'
import { StatStrip } from '@/components/ui/stat-strip'
import { Avatar } from '@/components/ui/avatar'
import { EmptyState, Skeleton } from '@/components/ui/states'
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

  const totalDeals = team.reduce((s, m) => s + m.activeDeals, 0)
  const totalRevenue = team.reduce((s, m) => s + Number(m.totalRevenue), 0)

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="People"
        title="Team"
        description="Who's on the team and what they're carrying."
        actions={
          <button onClick={openAdd} className="btn btn-primary">
            <UserPlusIcon size={17} weight="bold" />
            Add member
          </button>
        }
      />

      {loading ? (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
          {[0, 1, 2].map((i) => <Skeleton key={i} className="h-64 rounded-[22px]" />)}
        </div>
      ) : team.length === 0 ? (
        <div className="card">
          <EmptyState
            icon={UsersThreeIcon}
            title="No team members yet"
            description="Add the people who work on deals so you can assign and track them."
            action={<button onClick={openAdd} className="btn btn-primary"><UserPlusIcon size={17} weight="bold" />Add member</button>}
          />
        </div>
      ) : (
        <>
          <StatStrip
            stats={[
              { label: 'Members', value: String(team.length), icon: UsersThreeIcon },
              { label: 'Active deals', value: String(totalDeals), icon: KanbanIcon },
              { label: 'Revenue generated', value: `GHS ${(totalRevenue / 1000).toFixed(0)}K`, icon: CoinsIcon },
            ]}
          />

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
            {team.map((member) => (
              <article key={member.id} className="card flex flex-col p-5 transition-shadow hover:shadow-pop">
                <div className="flex items-start gap-3.5">
                  <Avatar name={member.name} size={52} />
                  <div className="min-w-0 flex-1 pt-0.5">
                    <p className="truncate font-display text-[17px] font-semibold leading-tight text-fg">{member.name}</p>
                    <p className="mt-0.5 truncate text-[12.5px] text-fg-2">{member.role}</p>
                  </div>
                  <span className={member.activeDeals > 0 ? 'badge badge-success' : 'badge badge-neutral'}>
                    <span className="h-1.5 w-1.5 rounded-full bg-current" />
                    {member.activeDeals > 0 ? 'On deals' : 'Available'}
                  </span>
                </div>

                <dl className="mt-5 grid grid-cols-2 gap-3 rounded-2xl bg-muted p-3.5 text-[12px]">
                  <div>
                    <dt className="text-fg-3">Active deals</dt>
                    <dd className="tabular mt-0.5 font-display text-[18px] font-semibold text-fg">{member.activeDeals}</dd>
                  </div>
                  <div>
                    <dt className="text-fg-3">Revenue</dt>
                    <dd className="tabular mt-0.5 truncate font-display text-[18px] font-semibold text-fg">
                      {formatCurrency(Number(member.totalRevenue), 'GHS').replace('.00', '')}
                    </dd>
                  </div>
                </dl>

                <div className="mt-4 space-y-2 text-[12.5px]">
                  <a href={`mailto:${member.email}`} className="flex items-center gap-2.5 text-fg-2 hover:text-brand">
                    <EnvelopeSimpleIcon size={16} className="shrink-0 text-fg-3" />
                    <span className="truncate">{member.email}</span>
                  </a>
                  {member.phone && (
                    <a href={`tel:${member.phone}`} className="flex items-center gap-2.5 text-fg-2 hover:text-brand">
                      <PhoneIcon size={16} className="shrink-0 text-fg-3" />
                      <span className="truncate">{member.phone}</span>
                    </a>
                  )}
                </div>

                <div className="flex-1" />
                <div className="mt-4 flex justify-end gap-1 border-t border-line pt-3">
                  <button type="button" onClick={() => openEdit(member)} className="icon-btn icon-btn-sm" aria-label={`Edit ${member.name}`} title="Edit">
                    <PencilSimpleIcon size={17} />
                  </button>
                  <button
                    type="button"
                    onClick={() => setRemoving(member)}
                    className="icon-btn icon-btn-sm icon-btn-danger"
                    aria-label={`Remove ${member.name}`}
                    title="Remove"
                  >
                    <TrashIcon size={17} />
                  </button>
                </div>
              </article>
            ))}
          </div>
        </>
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
        confirmLabel="Remove member"
        onClose={() => setRemoving(null)}
        onConfirm={handleRemove}
      />
    </div>
  )
}
