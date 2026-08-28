import { PHASE_META } from '@/lib/types'
import type { PipelinePhase } from '@/lib/types'

interface PhaseBadgeProps {
  phase: PipelinePhase
}

export function PhaseBadge({ phase }: PhaseBadgeProps) {
  const meta = PHASE_META[phase]
  return (
    <span
      className="inline-block text-[10.5px] font-bold px-2.5 py-1 rounded-full"
      style={{ background: meta.bg, color: meta.color }}
    >
      {meta.label}
    </span>
  )
}
