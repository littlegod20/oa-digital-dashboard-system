'use client'

import type { Deal, PipelinePhase } from '@/lib/types'
import { PHASE_META } from '@/lib/types'
import { formatCompact } from '@/lib/utils'

interface PipelineFunnelProps { deals: Deal[] }

const PHASE_ORDER: PipelinePhase[] = ['lead', 'proposal', 'await', 'meet', 'action', 'progress', 'done']

/** Pipeline value per phase as labelled horizontal bars. */
export function PipelineFunnel({ deals }: PipelineFunnelProps) {
  const rows = PHASE_ORDER.map((phase) => {
    const phaseDeals = deals.filter((d) => d.phase === phase)
    return {
      phase,
      label: PHASE_META[phase].label,
      value: phaseDeals.reduce((sum, d) => sum + d.value, 0),
      count: phaseDeals.length,
      color: PHASE_META[phase].color,
    }
  }).filter((r) => r.count > 0)

  const max = Math.max(...rows.map((r) => r.value), 1)

  if (rows.length === 0) {
    return <p className="py-10 text-center text-[13px] text-fg-3">No deals in the pipeline yet.</p>
  }

  return (
    <ul className="space-y-4">
      {rows.map((r) => (
        <li key={r.phase}>
          <div className="mb-1.5 flex items-center justify-between gap-3 text-[12.5px]">
            <span className="flex min-w-0 items-center gap-2 font-medium text-fg">
              <span className="h-2 w-2 shrink-0 rounded-full" style={{ background: r.color === '#ffffff' ? 'var(--oa-navy)' : r.color }} />
              <span className="truncate">{r.label}</span>
              <span className="text-[11px] font-normal text-fg-3">
                {r.count} deal{r.count !== 1 ? 's' : ''}
              </span>
            </span>
            <span className="tabular shrink-0 font-semibold text-fg">{formatCompact(r.value)}</span>
          </div>
          <div className="h-2.5 overflow-hidden rounded-full bg-track">
            <div
              className="h-full rounded-full transition-[width] duration-700"
              style={{
                width: `${Math.max((r.value / max) * 100, 4)}%`,
                background: 'linear-gradient(90deg, #1D5FD1, #22B8F0)',
                opacity: 0.45 + 0.55 * (r.value / max),
              }}
            />
          </div>
        </li>
      ))}
    </ul>
  )
}
