'use client'

import { useState, useEffect } from 'react'
import { PipelineCard } from '@/components/ui/pipeline-card'
import { PHASE_META } from '@/lib/types'
import type { PipelinePhase } from '@/lib/types'
import { cn } from '@/lib/utils'
import { AddDealModal } from '@/components/ui/add-deal-modal'

const ALL_PHASES = ['all', 'lead', 'proposal', 'await', 'meet', 'action', 'progress', 'done', 'hold'] as const
type FilterPhase = typeof ALL_PHASES[number]

type Deal = {
  id: string; client: string; title: string; value: string | number; currency: string;
  phase: PipelinePhase; assignee: string; paid: string | number; nextAction: string; notes: string;
  createdAt: string | null; updatedAt: string | null;
}

function n(v: string | number) { return Number(v) }

export default function PipelinePage() {
  const [filter, setFilter] = useState<FilterPhase>('all')
  const [dealModalOpen, setDealModalOpen] = useState(false)
  const [deals, setDeals] = useState<Deal[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/deals')
      .then(r => r.ok ? r.json() : [])
      .then(setDeals)
      .finally(() => setLoading(false))
  }, [])

  const filtered = filter === 'all' ? deals : deals.filter((d) => d.phase === filter)
  const totalValue = filtered.reduce((sum, d) => sum + n(d.value), 0)
  const totalPaid  = filtered.reduce((sum, d) => sum + n(d.paid), 0)

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display font-bold text-[20px] leading-tight" style={{ color: "var(--text-primary)" }}>Pipeline</h1>
          <p className="text-[13px] mt-0.5" style={{ color: "var(--text-muted)" }}>
            {filtered.length} deal{filtered.length !== 1 ? 's' : ''} · GHS {(totalValue / 1000).toFixed(0)}K total
          </p>
        </div>
        <button onClick={() => setDealModalOpen(true)} className="btn-primary text-[13px] font-semibold px-4 py-2 rounded-xl">
          + Add Deal
        </button>
      </div>

      <div className="flex gap-2 overflow-x-auto pb-1 -mx-1 px-1">
        {ALL_PHASES.map((phase) => {
          const label = phase === 'all' ? 'All' : PHASE_META[phase as PipelinePhase].label
          const count = phase === 'all' ? deals.length : deals.filter((d) => d.phase === phase).length
          if (count === 0 && phase !== 'all') return null
          return (
            <button
              key={phase}
              onClick={() => setFilter(phase)}
              className="whitespace-nowrap text-[12.5px] font-medium px-3.5 py-1.5 rounded-full border shrink-0 transition-colors"
              style={{
                background: filter === phase ? "var(--brand-strong)" : "var(--card-bg)",
                color: filter === phase ? "var(--brand-on)" : "var(--text-secondary)",
                borderColor: filter === phase ? "var(--brand-strong)" : "var(--divider)",
              }}
            >
              {label} {count > 0 && <span style={{ opacity: 0.7 }}>({count})</span>}
            </button>
          )
        })}
      </div>

      {filtered.length > 0 && (
        <div className="rounded-xl px-4 py-3 flex items-center gap-6 text-[12.5px]"
          style={{ background: "var(--card-bg)", border: "1px solid var(--card-border)" }}>
          <div><span style={{ color: "var(--text-muted)" }}>Total value </span>
            <span className="font-semibold" style={{ color: "var(--text-primary)" }}>GHS {(totalValue / 1000).toFixed(0)}K</span></div>
          <div><span style={{ color: "var(--text-muted)" }}>Collected </span>
            <span className="font-semibold" style={{ color: "var(--badge-success-text)" }}>GHS {(totalPaid / 1000).toFixed(0)}K</span></div>
          <div><span style={{ color: "var(--text-muted)" }}>Outstanding </span>
            <span className="font-semibold" style={{ color: "var(--badge-warning-text)" }}>GHS {((totalValue - totalPaid) / 1000).toFixed(0)}K</span></div>
        </div>
      )}

      {loading ? (
        <div className="py-16 text-center text-[13.5px]" style={{ color: "var(--text-muted)" }}>Loading deals...</div>
      ) : filtered.length === 0 ? (
        <div className="py-16 text-center text-[13.5px]" style={{ color: "var(--text-muted)" }}>No deals in this phase.</div>
      ) : (
        <div className="space-y-3">
          {filtered.map((deal) => (
            <PipelineCard key={deal.id} deal={{
              ...deal,
              value: n(deal.value),
              paid: n(deal.paid),
              createdAt: deal.createdAt ?? '',
              updatedAt: deal.updatedAt ?? '',
            }} />
          ))}
        </div>
      )}

      <AddDealModal
        open={dealModalOpen}
        onClose={() => setDealModalOpen(false)}
        onAdd={(form) => {
          fetch('/api/deals', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) })
            .then(r => r.ok ? r.json() : null)
            .then(d => { if (d) setDeals(prev => [d, ...prev]) })
        }}
      />
    </div>
  )
}
