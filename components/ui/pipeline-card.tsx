import { PhaseBadge } from './phase-badge'
import { formatCurrency } from '@/lib/utils'
import type { Deal } from '@/lib/types'

interface PipelineCardProps {
  deal: Deal
}

export function PipelineCard({ deal }: PipelineCardProps) {
  const outstanding = deal.value - deal.paid
  const progress = deal.value > 0 ? (deal.paid / deal.value) * 100 : 0

  return (
    <div className="bg-[var(--card)] rounded-2xl p-4 shadow-[var(--shadow)] space-y-3">
      {/* Top row */}
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="font-bold text-[var(--navy)] text-[15px] leading-tight">{deal.client}</p>
          <p className="text-[var(--slate)] text-[12.5px] mt-0.5">{deal.title}</p>
        </div>
        <div className="text-right shrink-0">
          <p className="font-display font-bold text-[16px] text-[var(--navy)]">
            {formatCurrency(deal.value, deal.currency)}
          </p>
          {outstanding > 0 && (
            <p className="text-[11px] text-[var(--slate)] mt-0.5">
              {formatCurrency(outstanding, deal.currency)} remaining
            </p>
          )}
        </div>
      </div>

      {/* Progress bar */}
      {deal.paid > 0 && (
        <div>
          <div className="h-1.5 bg-[var(--line)] rounded-full overflow-hidden">
            <div
              className="h-full bg-[var(--green)] rounded-full transition-all"
              style={{ width: `${progress}%` }}
            />
          </div>
          <p className="text-[10.5px] text-[var(--slate)] mt-1">
            {formatCurrency(deal.paid, deal.currency)} paid ({progress.toFixed(0)}%)
          </p>
        </div>
      )}

      {/* Meta row */}
      <div className="flex flex-wrap items-center gap-2">
        <PhaseBadge phase={deal.phase} />
        <span className="text-[11.5px] font-semibold text-[var(--blue)] bg-[#EAF1FF] px-2.5 py-1 rounded-full">
          {deal.assignee}
        </span>
      </div>

      {/* Next action */}
      {deal.nextAction && (
        <div className="text-[12px] text-[var(--ink)] bg-[var(--bg)] border-l-[3px] border-[var(--cyan)] pl-2.5 py-1.5 rounded-r-lg">
          {deal.nextAction}
        </div>
      )}
    </div>
  )
}
