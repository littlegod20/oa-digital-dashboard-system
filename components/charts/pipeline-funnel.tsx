'use client'

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts'
import type { Deal, PipelinePhase } from '@/lib/types'
import { PHASE_META } from '@/lib/types'
import { formatCompact } from '@/lib/utils'

interface PipelineFunnelProps {
  deals: Deal[]
}

const PHASE_ORDER: PipelinePhase[] = ['lead', 'proposal', 'await', 'meet', 'action', 'progress', 'done']

const TOOLTIP_STYLE = {
  background: '#fff',
  border: '1px solid #DCE4F0',
  borderRadius: 10,
  boxShadow: '0 4px 18px rgba(11,31,59,.08)',
  fontSize: 12,
  fontFamily: 'DM Sans, sans-serif',
  color: '#152238',
}

export function PipelineFunnel({ deals }: PipelineFunnelProps) {
  const data = PHASE_ORDER.map((phase) => {
    const phaseDeals = deals.filter((d) => d.phase === phase)
    const totalValue = phaseDeals.reduce((sum, d) => sum + d.value, 0)
    return {
      phase,
      label: PHASE_META[phase].label,
      value: totalValue,
      count: phaseDeals.length,
      color: PHASE_META[phase].color,
      bg: PHASE_META[phase].bg,
    }
  }).filter((d) => d.count > 0)

  return (
    <div className="bg-[var(--card)] rounded-2xl p-5 shadow-[var(--shadow)]">
      <p className="font-display font-bold text-[var(--navy)] text-[14.5px] mb-4">
        Pipeline by Phase
      </p>
      <ResponsiveContainer width="100%" height={200}>
        <BarChart data={data} margin={{ top: 4, right: 4, left: 0, bottom: 0 }}>
          <CartesianGrid stroke="#DCE4F0" strokeDasharray="4 4" vertical={false} />
          <XAxis
            dataKey="label"
            tick={{ fontSize: 10, fill: '#5A6B85', fontFamily: 'DM Sans, sans-serif' }}
            axisLine={false}
            tickLine={false}
          />
          <YAxis
            tickFormatter={(v) => `GHS ${formatCompact(v)}`}
            tick={{ fontSize: 10, fill: '#5A6B85', fontFamily: 'DM Sans, sans-serif' }}
            axisLine={false}
            tickLine={false}
            width={68}
          />
          <Tooltip
            contentStyle={TOOLTIP_STYLE}
            formatter={(value: number, _, props) => [
              `GHS ${formatCompact(value)} · ${props.payload.count} deal${props.payload.count !== 1 ? 's' : ''}`,
              'Value',
            ]}
          />
          <Bar dataKey="value" radius={[6, 6, 0, 0]} maxBarSize={48}>
            {data.map((entry) => (
              <Cell key={entry.phase} fill={entry.color} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}
