'use client'

import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts'
import type { MonthlyRevenue } from '@/lib/types'

// Palette validated against OA brand (light surface #F2F5FA):
//   Revenue #1D5FD1 (blue)  — passes CVD, contrast
//   Expenses #D64545 (red)  — passes CVD, contrast
//   Series are always paired the same way, never swapped

const TOOLTIP_STYLE = {
  background: '#fff',
  border: '1px solid #DCE4F0',
  borderRadius: 10,
  boxShadow: '0 4px 18px rgba(11,31,59,.08)',
  fontSize: 12,
  fontFamily: 'DM Sans, sans-serif',
  color: '#152238',
}

function formatGHS(v: number) {
  if (v >= 1000) return `GHS ${(v / 1000).toFixed(0)}K`
  return `GHS ${v}`
}

interface RevenueChartProps {
  data: MonthlyRevenue[]
}

export function RevenueChart({ data }: RevenueChartProps) {
  return (
    <div className="bg-[var(--card)] rounded-2xl p-5 shadow-[var(--shadow)]">
      <p className="font-display font-bold text-[var(--navy)] text-[14.5px] mb-4">
        Revenue vs Expenses
      </p>
      <ResponsiveContainer width="100%" height={220}>
        <AreaChart data={data} margin={{ top: 4, right: 4, left: 0, bottom: 0 }}>
          <defs>
            <linearGradient id="gradRevenue" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%"  stopColor="#1D5FD1" stopOpacity={0.18} />
              <stop offset="95%" stopColor="#1D5FD1" stopOpacity={0} />
            </linearGradient>
            <linearGradient id="gradExpenses" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%"  stopColor="#D64545" stopOpacity={0.12} />
              <stop offset="95%" stopColor="#D64545" stopOpacity={0} />
            </linearGradient>
          </defs>

          <CartesianGrid stroke="#DCE4F0" strokeDasharray="4 4" vertical={false} />

          <XAxis
            dataKey="month"
            tick={{ fontSize: 11, fill: '#5A6B85', fontFamily: 'DM Sans, sans-serif' }}
            axisLine={false}
            tickLine={false}
          />
          <YAxis
            tickFormatter={formatGHS}
            tick={{ fontSize: 11, fill: '#5A6B85', fontFamily: 'DM Sans, sans-serif' }}
            axisLine={false}
            tickLine={false}
            width={64}
          />

          <Tooltip
            contentStyle={TOOLTIP_STYLE}
            formatter={(value: number, name: string) => [
              formatGHS(value),
              name === 'revenue' ? 'Revenue' : 'Expenses',
            ]}
            cursor={{ stroke: '#DCE4F0', strokeWidth: 1 }}
          />

          <Legend
            iconType="circle"
            iconSize={8}
            formatter={(v) => (v === 'revenue' ? 'Revenue' : 'Expenses')}
            wrapperStyle={{ fontSize: 12, color: '#5A6B85' }}
          />

          <Area
            type="monotone"
            dataKey="revenue"
            stroke="#1D5FD1"
            strokeWidth={2}
            fill="url(#gradRevenue)"
            dot={false}
            activeDot={{ r: 5, strokeWidth: 2, stroke: '#fff', fill: '#1D5FD1' }}
          />
          <Area
            type="monotone"
            dataKey="expenses"
            stroke="#D64545"
            strokeWidth={2}
            fill="url(#gradExpenses)"
            dot={false}
            activeDot={{ r: 5, strokeWidth: 2, stroke: '#fff', fill: '#D64545' }}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  )
}
