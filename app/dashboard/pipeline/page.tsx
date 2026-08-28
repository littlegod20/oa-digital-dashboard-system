'use client'

import { useState } from 'react'
import { Header } from '@/components/dashboard/header'
import { PipelineCard } from '@/components/ui/pipeline-card'
import { DEALS } from '@/lib/mock-data'
import { PHASE_META } from '@/lib/types'
import type { PipelinePhase } from '@/lib/types'
import { cn } from '@/lib/utils'

const ALL_PHASES = ['all', 'lead', 'proposal', 'await', 'meet', 'action', 'progress', 'done', 'hold'] as const
type FilterPhase = typeof ALL_PHASES[number]

export default function PipelinePage() {
  const [filter, setFilter] = useState<FilterPhase>('all')

  const filtered = filter === 'all'
    ? DEALS
    : DEALS.filter((d) => d.phase === filter)

  const totalValue = filtered.reduce((sum, d) => sum + d.value, 0)
  const totalPaid  = filtered.reduce((sum, d) => sum + d.paid, 0)

  return (
    <>
      <Header
        title="Pipeline"
        subtitle={`${filtered.length} deal${filtered.length !== 1 ? 's' : ''} · GHS ${(totalValue / 1000).toFixed(0)}K total`}
        action={
          <button className="bg-gradient-to-r from-[var(--blue)] to-[var(--cyan)] text-white text-[13px] font-bold px-4 py-2 rounded-xl shadow-[0_3px_10px_rgba(29,95,209,.35)]">
            + Add Deal
          </button>
        }
      />

      {/* Phase filter chips */}
      <div className="flex gap-2 overflow-x-auto pb-1 mb-4 -mx-1 px-1">
        {ALL_PHASES.map((phase) => {
          const label = phase === 'all' ? 'All' : PHASE_META[phase as PipelinePhase].label
          const count = phase === 'all' ? DEALS.length : DEALS.filter((d) => d.phase === phase).length
          if (count === 0 && phase !== 'all') return null
          return (
            <button
              key={phase}
              onClick={() => setFilter(phase)}
              className={cn(
                'whitespace-nowrap text-[12.5px] font-semibold px-3.5 py-1.5 rounded-full border transition-colors shrink-0',
                filter === phase
                  ? 'bg-[var(--navy)] text-white border-[var(--navy)]'
                  : 'bg-white text-[var(--slate)] border-[var(--line)] hover:border-[var(--navy)]'
              )}
            >
              {label} {count > 0 && <span className="opacity-70">({count})</span>}
            </button>
          )
        })}
      </div>

      {/* Summary bar */}
      {filtered.length > 0 && (
        <div className="bg-[var(--card)] rounded-xl px-4 py-3 mb-4 shadow-[var(--shadow)] flex items-center gap-6 text-[12.5px]">
          <div>
            <span className="text-[var(--slate)] font-medium">Total value </span>
            <span className="font-bold text-[var(--navy)]">GHS {(totalValue / 1000).toFixed(0)}K</span>
          </div>
          <div>
            <span className="text-[var(--slate)] font-medium">Collected </span>
            <span className="font-bold text-[var(--green)]">GHS {(totalPaid / 1000).toFixed(0)}K</span>
          </div>
          <div>
            <span className="text-[var(--slate)] font-medium">Outstanding </span>
            <span className="font-bold text-[var(--amber)]">GHS {((totalValue - totalPaid) / 1000).toFixed(0)}K</span>
          </div>
        </div>
      )}

      {/* Deal cards */}
      {filtered.length === 0 ? (
        <div className="text-center text-[var(--slate)] text-[13.5px] py-16">
          No deals in this phase.
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((deal) => (
            <PipelineCard key={deal.id} deal={deal} />
          ))}
        </div>
      )}
    </>
  )
}
