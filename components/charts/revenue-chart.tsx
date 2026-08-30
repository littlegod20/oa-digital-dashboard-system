'use client'

import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Legend,
} from 'recharts'
import type { MonthlyRevenue } from '@/lib/types'
import { Card, CardTitle } from '@/components/ui/card'

function formatGHS(v: number) {
  if (v >= 1000) return `GHS ${(v / 1000).toFixed(0)}K`
  return `GHS ${v}`
}

interface RevenueChartProps { data: MonthlyRevenue[] }

export function RevenueChart({ data }: RevenueChartProps) {
  return (
    <Card className="p-5">
      <CardTitle className="mb-4 text-[14px]">Revenue vs Expenses</CardTitle>
      <ResponsiveContainer width="100%" height={200}>
        <AreaChart data={data} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
          <defs>
            <linearGradient id="gradRevenue" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%"  stopColor="#1D5FD1" stopOpacity={0.18} />
              <stop offset="95%" stopColor="#1D5FD1" stopOpacity={0} />
            </linearGradient>
            <linearGradient id="gradExpenses" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%"  stopColor="#D64545" stopOpacity={0.14} />
              <stop offset="95%" stopColor="#D64545" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="var(--divider)" />
          <XAxis dataKey="month" tick={{ fontSize: 11, fill: "var(--text-muted)", fontFamily: "DM Sans, sans-serif" }} axisLine={false} tickLine={false} />
          <YAxis tickFormatter={formatGHS} tick={{ fontSize: 10, fill: "var(--text-muted)", fontFamily: "DM Sans, sans-serif" }} axisLine={false} tickLine={false} />
          <Tooltip
            formatter={(v: number) => formatGHS(v)}
            contentStyle={{
              background: "var(--card-bg)",
              border: "1px solid var(--divider)",
              borderRadius: 10,
              fontSize: 12,
              fontFamily: "DM Sans, sans-serif",
              color: "var(--text-primary)",
            }}
          />
          <Legend wrapperStyle={{ fontSize: 11, paddingTop: 8, fontFamily: "DM Sans, sans-serif", color: "var(--text-secondary)" }} />
          <Area type="monotone" dataKey="revenue"  name="Revenue"  stroke="#1D5FD1" strokeWidth={2} fill="url(#gradRevenue)"  dot={false} />
          <Area type="monotone" dataKey="expenses" name="Expenses" stroke="#D64545" strokeWidth={2} fill="url(#gradExpenses)" dot={false} />
        </AreaChart>
      </ResponsiveContainer>
    </Card>
  )
}
