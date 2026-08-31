'use client'

import { useState, useEffect } from 'react'
import { formatCurrency, getInitials } from '@/lib/utils'
import { AddMemberModal } from '@/components/ui/add-member-modal'

type Member = {
  id: string; name: string; role: string; email: string;
  phone?: string | null; avatar?: string | null;
  activeDeals: number; totalRevenue: string | number;
}

export default function TeamPage() {
  const [memberModalOpen, setMemberModalOpen] = useState(false)
  const [team, setTeam] = useState<Member[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/team')
      .then(r => r.ok ? r.json() : [])
      .then(setTeam)
      .finally(() => setLoading(false))
  }, [])

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display font-bold text-[20px] leading-tight" style={{ color: "var(--text-primary)" }}>Team</h1>
          <p className="text-[13px] mt-0.5" style={{ color: "var(--text-muted)" }}>{team.length} members</p>
        </div>
        <button onClick={() => setMemberModalOpen(true)} className="btn-primary text-[13px] font-semibold px-4 py-2 rounded-xl">
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
              </div>
              <div className="text-right shrink-0">
                <p className="font-display font-bold text-[15px]" style={{ color: "var(--text-primary)" }}>{member.activeDeals}</p>
                <p className="text-[10.5px]" style={{ color: "var(--text-muted)" }}>active deals</p>
                <p className="font-medium text-[12px] mt-0.5" style={{ color: "var(--badge-success-text)" }}>
                  {formatCurrency(Number(member.totalRevenue), 'GHS')}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}

      <AddMemberModal
        open={memberModalOpen}
        onClose={() => setMemberModalOpen(false)}
        onAdd={(form) => {
          fetch('/api/team', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) })
            .then(r => r.ok ? r.json() : null)
            .then(m => { if (m) setTeam(prev => [...prev, m].sort((a, b) => a.name.localeCompare(b.name))) })
        }}
      />
    </div>
  )
}
