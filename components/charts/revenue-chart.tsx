'use client'

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import type { MonthlyRevenue } from '@/lib/types'
import { formatCompact } from '@/lib/utils'

interface RevenueChartProps { data: MonthlyRevenue[]; height?: number }

const AXIS_TICK = { fontSize: 11, fill: 'var(--text-muted)', fontFamily: 'var(--font-inter)' }

/** Revenue vs expenses as rounded bars over a soft full-height track. */
export function RevenueChart({ data, height = 240 }: RevenueChartProps) {
  if (data.length === 0) {
    return (
      <div className="flex items-center justify-center text-[13px] text-fg-3" style={{ height }}>
        No transactions recorded yet.
      </div>
    )
  }

  return (
    <ResponsiveContainer width="100%" height={height}>
      <BarChart data={data} margin={{ top: 8, right: 0, left: 0, bottom: 0 }} barGap={6} barCategoryGap="28%">
        <defs>
          <linearGradient id="barRevenue" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#22B8F0" />
            <stop offset="100%" stopColor="#1D5FD1" />
          </linearGradient>
          <linearGradient id="barExpenses" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#F7A274" />
            <stop offset="100%" stopColor="#E8677E" />
          </linearGradient>
        </defs>
        <CartesianGrid stroke="var(--divider)" strokeDasharray="4 6" vertical={false} />
        <XAxis dataKey="month" tick={AXIS_TICK} axisLine={false} tickLine={false} dy={8} />
        <YAxis tickFormatter={(v) => (Number(v) >= 1000 ? `${Math.round(Number(v) / 1000)}K` : formatCompact(Number(v)))} tick={AXIS_TICK} axisLine={false} tickLine={false} width={40} />
        <Tooltip
          cursor={{ fill: 'var(--track)', radius: 12 }}
          formatter={(v, name) => [`GHS ${Number(v).toLocaleString('en-GH')}`, name]}
          contentStyle={{
            background: 'var(--card-solid)',
            border: 'none',
            borderRadius: 14,
            boxShadow: 'var(--pop-shadow)',
            fontSize: 12,
            fontFamily: 'var(--font-inter)',
            color: 'var(--text-primary)',
            padding: '10px 12px',
          }}
          labelStyle={{ fontWeight: 600, marginBottom: 4 }}
        />
        <Bar
          dataKey="revenue"
          name="Revenue"
          fill="url(#barRevenue)"
          radius={[999, 999, 999, 999]}
          maxBarSize={14}
          background={{ fill: 'var(--track)', radius: 999 }}
        />
        <Bar
          dataKey="expenses"
          name="Expenses"
          fill="url(#barExpenses)"
          radius={[999, 999, 999, 999]}
          maxBarSize={14}
          background={{ fill: 'var(--track)', radius: 999 }}
        />
      </BarChart>
    </ResponsiveContainer>
  )
}

export function RevenueLegend() {
  return (
    <div className="flex items-center gap-4 text-[12px] font-medium text-fg-2">
      <span className="flex items-center gap-1.5">
        <span className="h-2.5 w-2.5 rounded-full" style={{ background: 'linear-gradient(180deg,#22B8F0,#1D5FD1)' }} />
        Revenue
      </span>
      <span className="flex items-center gap-1.5">
        <span className="h-2.5 w-2.5 rounded-full" style={{ background: 'linear-gradient(180deg,#F7A274,#E8677E)' }} />
        Expenses
      </span>
    </div>
  )
}
