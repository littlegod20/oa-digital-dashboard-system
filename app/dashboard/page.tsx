'use client'

import { useState, useEffect, useMemo } from 'react'
import { BalanceCard } from '@/components/ui/balance-card'
import { KpiCard } from '@/components/ui/kpi-card'
import { PipelineCard } from '@/components/ui/pipeline-card'
import { RevenueChart } from '@/components/charts/revenue-chart'
import { PipelineFunnel } from '@/components/charts/pipeline-funnel'
import { formatCurrency, formatRelativeDate } from '@/lib/utils'
import { useRole } from '@/lib/role-context'
import type { Deal as LibDeal, MonthlyRevenue, PipelinePhase, Currency } from '@/lib/types'

type Phase = PipelinePhase
type TxType = 'income' | 'expense' | 'payment_received'

interface Deal {
  id: string
  client: string
  title: string
  value: string | number
  paid: string | number
  currency: Currency
  phase: Phase
  assignee: string
  nextAction: string
  notes?: string
  createdAt?: string
  updatedAt?: string
}

interface Transaction {
  id: string
  type: TxType
  description: string
  amount: string | number
  currency: Currency
  person?: string
  category: string
  date: string
  orderId?: string
}

function n(v: string | number): number {
  return Number(v)
}

function toLibDeal(d: Deal): LibDeal {
  return {
    id: d.id,
    client: d.client,
    title: d.title,
    value: n(d.value),
    currency: d.currency,
    phase: d.phase,
    assignee: d.assignee,
    paid: n(d.paid),
    nextAction: d.nextAction,
    notes: d.notes ?? '',
    createdAt: d.createdAt ?? '',
    updatedAt: d.updatedAt ?? '',
  }
}

function buildMonthlyRevenue(transactions: Transaction[]): MonthlyRevenue[] {
  const monthMap: Record<string, MonthlyRevenue> = {}
  transactions.forEach((tx) => {
    const d = new Date(tx.date)
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
    const label = d.toLocaleString('default', { month: 'short' })
    if (!monthMap[key]) monthMap[key] = { month: label, revenue: 0, expenses: 0, profit: 0 }
    const amt = n(tx.amount)
    if (tx.type === 'income' || tx.type === 'payment_received') {
      monthMap[key].revenue += amt
    } else if (tx.type === 'expense') {
      monthMap[key].expenses += amt
    }
  })
  return Object.entries(monthMap)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([, v]) => ({ ...v, profit: v.revenue - v.expenses }))
    .slice(-6)
}

export default function OverviewPage() {
  const { isManagement, isSales } = useRole()
  const [deals, setDeals] = useState<Deal[]>([])
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([
      fetch('/api/deals').then((r) => r.json()),
      fetch('/api/transactions').then((r) => r.json()),
    ])
      .then(([d, t]) => {
        setDeals(Array.isArray(d) ? d : [])
        setTransactions(Array.isArray(t) ? t : [])
      })
      .finally(() => setLoading(false))
  }, [])

  const kpi = useMemo(() => {
    const ghsTx = transactions.filter((t) => t.currency === 'GHS')
    const revenueGHS = ghsTx
      .filter((t) => t.type === 'income' || t.type === 'payment_received')
      .reduce((s, t) => s + n(t.amount), 0)
    const expensesGHS = ghsTx
      .filter((t) => t.type === 'expense')
      .reduce((s, t) => s + n(t.amount), 0)
    const profitGHS = revenueGHS - expensesGHS
    const usdTx = transactions.filter((t) => t.currency === 'USD')
    const usdIn = usdTx
      .filter((t) => t.type === 'income' || t.type === 'payment_received')
      .reduce((s, t) => s + n(t.amount), 0)
    const usdOut = usdTx
      .filter((t) => t.type === 'expense')
      .reduce((s, t) => s + n(t.amount), 0)
    const activeDeals = deals.filter((d) => !['done', 'hold'].includes(d.phase))
    const pipelineValue = activeDeals
      .filter((d) => d.currency === 'GHS')
      .reduce((s, d) => s + n(d.value), 0)
    const expectedIncoming = activeDeals
      .filter((d) => d.currency === 'GHS')
      .reduce((s, d) => s + (n(d.value) - n(d.paid)), 0)
    const owedToUs = deals
      .filter((d) => n(d.value) - n(d.paid) > 0 && d.phase !== 'done' && d.currency === 'GHS')
      .reduce((s, d) => s + (n(d.value) - n(d.paid)), 0)
    return {
      revenueGHS,
      expensesGHS,
      profitGHS,
      balanceGHS: revenueGHS - expensesGHS,
      balanceUSD: usdIn - usdOut,
      pipelineValue,
      expectedIncoming,
      owedToUs,
    }
  }, [deals, transactions])

  const monthlyRevenue = useMemo(() => buildMonthlyRevenue(transactions), [transactions])

  const activeDeals = useMemo(
    () => deals.filter((d) => !['done', 'hold'].includes(d.phase)),
    [deals]
  )

  const outstandingDeals = useMemo(
    () => deals.filter((d) => n(d.value) - n(d.paid) > 0 && d.phase !== 'done'),
    [deals]
  )

  const recentTx = transactions.slice(0, 5)

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64 text-sm" style={{ color: 'var(--text-muted)' }}>
        Loading dashboard...
      </div>
    )
  }

  return (
    <div className="space-y-5">

      {/* Management only: balance cards */}
      {isManagement && (
        <div className="grid grid-cols-2 gap-3">
          <BalanceCard currency="GHS" balance={kpi.balanceGHS} label="Cedis Account" subLabel="OA Digital GHS" />
          <BalanceCard currency="USD" balance={kpi.balanceUSD} label="Dollar Account" subLabel="OA Digital USD" />
        </div>
      )}

      {/* Management only: revenue / expenses / profit */}
      {isManagement && (
        <div className="grid grid-cols-3 gap-3">
          <KpiCard label="Revenue"  value={`GHS ${(kpi.revenueGHS / 1000).toFixed(0)}K`}  delta="Aug MTD" deltaUp={true} />
          <KpiCard label="Expenses" value={`GHS ${(kpi.expensesGHS / 1000).toFixed(0)}K`} delta="vs last mo" deltaUp={false} />
          <KpiCard label="Profit"   value={`GHS ${(kpi.profitGHS / 1000).toFixed(0)}K`}   delta={kpi.revenueGHS > 0 ? `${((kpi.profitGHS / kpi.revenueGHS) * 100).toFixed(0)}% margin` : '—'} deltaUp={true} />
        </div>
      )}

      {/* Both roles: pipeline KPIs */}
      <div className="grid grid-cols-3 gap-3">
        <KpiCard label="Pipeline"    value={`GHS ${(kpi.pipelineValue / 1000).toFixed(0)}K`} />
        <KpiCard label="Expected In" value={`GHS ${(kpi.expectedIncoming / 1000).toFixed(0)}K`} delta="incoming" deltaUp={true} />
        <KpiCard label="Owed to Us"  value={`GHS ${(kpi.owedToUs / 1000).toFixed(0)}K`} />
      </div>

      {/* Sales: outstanding deals for follow-up */}
      {isSales && outstandingDeals.length > 0 && (
        <section>
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-display font-semibold text-[14.5px]" style={{ color: 'var(--text-primary)' }}>
              Outstanding Payments
            </h2>
            <span className="text-[12px] font-medium px-2.5 py-0.5 rounded-full" style={{ background: 'var(--badge-warning-bg)', color: 'var(--badge-warning-text)' }}>
              Follow up
            </span>
          </div>
          <div
            className="rounded-2xl divide-y overflow-hidden"
            style={{ background: 'var(--card-bg)', border: '1px solid var(--card-border)' }}
          >
            {outstandingDeals.map((deal) => {
              const outstanding = n(deal.value) - n(deal.paid)
              return (
                <div key={deal.id} className="flex items-center justify-between px-4 py-3.5 gap-3 trow">
                  <div>
                    <p className="font-medium text-[13.5px] leading-tight" style={{ color: 'var(--text-primary)' }}>
                      {deal.client}
                    </p>
                    <p className="text-[11.5px] mt-0.5" style={{ color: 'var(--text-muted)' }}>
                      {deal.title} · {deal.nextAction}
                    </p>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="font-semibold text-[13.5px]" style={{ color: 'var(--badge-warning-text)' }}>
                      {formatCurrency(outstanding, deal.currency)} owed
                    </p>
                    <p className="text-[11px]" style={{ color: 'var(--text-muted)' }}>
                      of {formatCurrency(n(deal.value), deal.currency)}
                    </p>
                  </div>
                </div>
              )
            })}
          </div>
        </section>
      )}

      {/* Charts */}
      <div className={`grid gap-4 ${isManagement ? 'grid-cols-1 lg:grid-cols-2' : 'grid-cols-1'}`}>
        {isManagement && <RevenueChart data={monthlyRevenue} />}
        <PipelineFunnel deals={deals.map(toLibDeal)} />
      </div>

      {/* Active deals */}
      <section>
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-display font-semibold text-[14.5px]" style={{ color: 'var(--text-primary)' }}>
            Active Deals
          </h2>
          <a href="/dashboard/pipeline" className="text-[12.5px] font-medium" style={{ color: 'var(--brand)' }}>
            View all →
          </a>
        </div>
        <div className="space-y-3">
          {activeDeals.slice(0, 3).map((deal) => (
            <PipelineCard key={deal.id} deal={toLibDeal(deal)} />
          ))}
        </div>
      </section>

      {/* Recent transactions */}
      <section>
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-display font-semibold text-[14.5px]" style={{ color: 'var(--text-primary)' }}>
            Recent Transactions
          </h2>
          <a href="/dashboard/finance" className="text-[12.5px] font-medium" style={{ color: 'var(--brand)' }}>
            View all →
          </a>
        </div>
        <div
          className="rounded-2xl divide-y overflow-hidden"
          style={{ background: 'var(--card-bg)', border: '1px solid var(--card-border)' }}
        >
          {recentTx.map((tx) => {
            const isIn = tx.type === 'income' || tx.type === 'payment_received'
            return (
              <div key={tx.id} className="flex items-center justify-between px-4 py-3.5 gap-3 trow">
                <div>
                  <p className="font-medium text-[13.5px] leading-tight" style={{ color: 'var(--text-primary)' }}>
                    {tx.description}
                  </p>
                  <p className="text-[11.5px] mt-0.5" style={{ color: 'var(--text-muted)' }}>
                    {tx.category} · {formatRelativeDate(tx.date)}
                  </p>
                </div>
                <p
                  className="font-semibold text-[13.5px] whitespace-nowrap"
                  style={{ color: isIn ? 'var(--badge-success-text)' : 'var(--badge-danger-text)' }}
                >
                  {isIn ? '+' : '-'}{formatCurrency(n(tx.amount), tx.currency)}
                </p>
              </div>
            )
          })}
        </div>
      </section>
    </div>
  )
}
