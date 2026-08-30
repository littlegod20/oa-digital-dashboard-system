'use client'

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts'
import type { Deal, PipelinePhase } from '@/lib/types'
import { PHASE_META } from '@/lib/types'
import { formatCompact } from '@/lib/utils'
import { Card, CardTitle } from '@/components/ui/card'

interface PipelineFunnelProps { deals: Deal[] }

const PHASE_ORDER: PipelinePhase[] = ['lead', 'proposal', 'await', 'meet', 'action', 'progress', 'done']

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
    }
  }).filter((d) => d.count > 0)

  return (
    <Card className="p-5">
      <CardTitle className="mb-4 text-[14px]">Pipeline by Phase</CardTitle>
      <ResponsiveContainer width="100%" height={200}>
        <BarChart data={data} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="var(--divider)" vertical={false} />
          <XAxis dataKey="label" tick={{ fontSize: 10, fill: "var(--text-muted)", fontFamily: "DM Sans, sans-serif" }} axisLine={false} tickLine={false} />
          <YAxis tickFormatter={formatCompact} tick={{ fontSize: 10, fill: "var(--text-muted)", fontFamily: "DM Sans, sans-serif" }} axisLine={false} tickLine={false} />
          <Tooltip
            formatter={(v: number, _: string, entry: { payload: { label: string; count: number } }) =>
              [`GHS ${formatCompact(v)} (${entry.payload.count} deal${entry.payload.count !== 1 ? 's' : ''})`, entry.payload.label]
            }
            contentStyle={{
              background: "var(--card-bg)",
              border: "1px solid var(--divider)",
              borderRadius: 10,
              fontSize: 12,
              fontFamily: "DM Sans, sans-serif",
              color: "var(--text-primary)",
            }}
          />
          <Bar dataKey="value" radius={[6, 6, 0, 0]}>
            {data.map((entry) => (
              <Cell key={entry.phase} fill={entry.color} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </Card>
  )
}
