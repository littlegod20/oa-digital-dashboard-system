'use client'

import { useState, useEffect, useMemo } from 'react'
import Link from 'next/link'
import {
  ArrowRightIcon,
  ChartLineUpIcon,
  CoinsIcon,
  HandCoinsIcon,
  KanbanIcon,
  ReceiptIcon,
  TrendUpIcon,
} from '@phosphor-icons/react'
import { PageHeader } from '@/components/ui/page-header'
import { Card, CardHeader, InkCard } from '@/components/ui/card'
import { StatStrip, type Stat } from '@/components/ui/stat-strip'
import { PageSkeleton, Progress } from '@/components/ui/states'
import { Avatar } from '@/components/ui/avatar'
import { PhaseBadge } from '@/components/ui/phase-badge'
import { RevenueChart, RevenueLegend } from '@/components/charts/revenue-chart'
import { PipelineFunnel } from '@/components/charts/pipeline-funnel'
import { CashCard, InkMetric, TopPerformers, TransactionRow, type Performer } from '@/components/dashboard/widgets'
import { formatCurrency } from '@/lib/utils'
import { useRole } from '@/lib/role-context'
import type { Deal as LibDeal, MonthlyRevenue, PipelinePhase, Currency } from '@/lib/types'

type Phase = PipelinePhase
type TxType = 'income' | 'expense' | 'payment_received' | 'transfer'

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

interface Member {
  name: string
  role: string
  activeDeals: number
  totalRevenue: string | number
}

function n(v: string | number): number {
  return Number(v)
}

function ghsK(v: number) {
  return `GHS ${(v / 1000).toFixed(0)}K`
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

function greeting() {
  const h = new Date().getHours()
  return h < 12 ? 'Good morning' : h < 17 ? 'Good afternoon' : 'Good evening'
}

export default function OverviewPage() {
  const { user, isManagement } = useRole()
  const [deals, setDeals] = useState<Deal[]>([])
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [team, setTeam] = useState<Member[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([
      fetch('/api/deals').then((r) => r.json()),
      fetch('/api/transactions').then((r) => r.json()),
      fetch('/api/team').then((r) => (r.ok ? r.json() : [])),
    ])
      .then(([d, t, m]) => {
        setDeals(Array.isArray(d) ? d : [])
        setTransactions(Array.isArray(t) ? t : [])
        setTeam(Array.isArray(m) ? m : [])
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

  const performers: Performer[] = team.map((m) => ({
    name: m.name,
    role: m.role,
    revenue: n(m.totalRevenue),
    activeDeals: m.activeDeals,
  }))

  const recentTx = transactions.slice(0, 5)
  const firstName = user?.name?.split(' ')[0] ?? 'there'
  const today = new Date().toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long' })

  const header = (
    <PageHeader
      eyebrow={today}
      title={`${greeting()}, ${firstName}`}
      description={
        isManagement
          ? 'Here is how OA Digital is performing today.'
          : 'Your pipeline and follow-ups at a glance.'
      }
      actions={
        <>
          <Link href="/dashboard/pipeline" className="btn btn-secondary">
            <KanbanIcon size={17} />
            Pipeline
          </Link>
          <Link href="/dashboard/finance" className="btn btn-primary">
            <ReceiptIcon size={17} weight="bold" />
            Transactions
          </Link>
        </>
      }
    />
  )

  if (loading) {
    return (
      <div className="space-y-6">
        {header}
        <PageSkeleton />
      </div>
    )
  }

  const pipelineStats: Stat[] = [
    { label: 'Pipeline value', value: ghsK(kpi.pipelineValue), icon: KanbanIcon, hint: `${activeDeals.length} active deals` },
    { label: 'Expected incoming', value: ghsK(kpi.expectedIncoming), icon: HandCoinsIcon, hint: 'From active deals', trend: 'up' },
    { label: 'Owed to us', value: ghsK(kpi.owedToUs), icon: CoinsIcon, hint: `${outstandingDeals.length} open balances` },
  ]

  const financeStats: Stat[] = [
    { label: 'Revenue', value: ghsK(kpi.revenueGHS), icon: ChartLineUpIcon, hint: 'All GHS income', trend: 'up' },
    { label: 'Expenses', value: ghsK(kpi.expensesGHS), icon: ReceiptIcon, hint: 'All GHS spend', trend: 'down' },
    {
      label: 'Profit',
      value: ghsK(kpi.profitGHS),
      icon: TrendUpIcon,
      hint: kpi.revenueGHS > 0 ? `${((kpi.profitGHS / kpi.revenueGHS) * 100).toFixed(0)}% margin` : '—',
      trend: kpi.profitGHS >= 0 ? 'up' : 'down',
    },
  ]

  const collectedPct = kpi.pipelineValue > 0 ? ((kpi.pipelineValue - kpi.expectedIncoming) / kpi.pipelineValue) * 100 : 0

  return (
    <div className="space-y-6">
      {header}

      <div className="grid grid-cols-1 gap-5 xl:grid-cols-12">
        {/* Left column */}
        <div className="animate-rise space-y-5 xl:col-span-8">
          <StatStrip stats={isManagement ? financeStats : pipelineStats} />

          <Card>
            <div className="grid gap-6 lg:grid-cols-[1fr_15rem]">
              <div className="min-w-0">
                {isManagement ? (
                  <>
                    <CardHeader
                      title="Revenue vs expenses"
                      description="Last 6 months · GHS & USD combined"
                      action={<RevenueLegend />}
                    />
                    <RevenueChart data={monthlyRevenue} />
                  </>
                ) : (
                  <>
                    <CardHeader title="Pipeline by phase" description="Deal value in each stage" />
                    <PipelineFunnel deals={deals.map(toLibDeal)} />
                  </>
                )}
              </div>
              <TopPerformers people={performers} />
            </div>
          </Card>
        </div>

        {/* Right column: one dark feature card */}
        <div className="animate-rise xl:col-span-4" style={{ animationDelay: '60ms' }}>
          {isManagement ? (
            <CashCard
              className="h-full"
              balanceGHS={kpi.balanceGHS}
              balanceUSD={kpi.balanceUSD}
              footer={
                <>
                  <InkMetric label="Pipeline value" value={ghsK(kpi.pipelineValue)} />
                  <InkMetric label="Expected incoming" value={ghsK(kpi.expectedIncoming)} />
                  <InkMetric label="Owed to us" value={ghsK(kpi.owedToUs)} tone="warm" />
                </>
              }
            />
          ) : (
            <FollowUpCard deals={outstandingDeals} />
          )}
        </div>
      </div>

      {isManagement && (
        <div className="grid grid-cols-1 gap-5 lg:grid-cols-12">
          <Card className="lg:col-span-8">
            <CardHeader
              title="Pipeline by phase"
              description="Deal value in each stage"
              action={
                <Link href="/dashboard/pipeline" className="btn btn-ghost btn-sm">
                  Open pipeline <ArrowRightIcon size={14} weight="bold" />
                </Link>
              }
            />
            <PipelineFunnel deals={deals.map(toLibDeal)} />
          </Card>
          <Card className="flex flex-col lg:col-span-4">
            <CardHeader title="Collection health" description="Active GHS deals" />
            <p className="tabular font-display text-[44px] font-semibold leading-none text-fg">
              {collectedPct.toFixed(0)}
              <span className="text-[22px] text-fg-3">%</span>
            </p>
            <p className="mt-2 text-[12.5px] text-fg-3">of active pipeline value already collected</p>
            <div className="mt-6 space-y-4">
              <HealthRow label="Collected" value={kpi.pipelineValue - kpi.expectedIncoming} total={kpi.pipelineValue} tone="brand" />
              <HealthRow label="Outstanding" value={kpi.expectedIncoming} total={kpi.pipelineValue} tone="warm" />
            </div>
          </Card>
        </div>
      )}

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-12">
        {/* Active deals */}
        <Card flush className="lg:col-span-7">
          <div className="p-5 pb-0 md:p-6 md:pb-0">
            <CardHeader
              title="Active deals"
              description={`${activeDeals.length} in progress`}
              action={
                <Link href="/dashboard/pipeline" className="btn btn-ghost btn-sm">
                  View all <ArrowRightIcon size={14} weight="bold" />
                </Link>
              }
              className="mb-3"
            />
          </div>
          <ul className="divide-y divide-line">
            {activeDeals.slice(0, 5).map((deal) => {
              const pct = n(deal.value) > 0 ? (n(deal.paid) / n(deal.value)) * 100 : 0
              return (
                <li key={deal.id} className="trow flex items-center gap-3.5 px-5 py-3.5 md:px-6">
                  <Avatar name={deal.client} size={40} square />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-[13.5px] font-semibold text-fg">{deal.client}</p>
                    <p className="truncate text-[12px] text-fg-3">{deal.title}</p>
                  </div>
                  <div className="hidden w-28 sm:block">
                    <Progress value={pct} className="h-1.5" />
                    <p className="mt-1 text-[11px] text-fg-3">{pct.toFixed(0)}% collected</p>
                  </div>
                  <div className="hidden md:block">
                    <PhaseBadge phase={deal.phase} />
                  </div>
                  <p className="tabular w-28 shrink-0 text-right text-[13px] font-semibold text-fg">
                    {formatCurrency(n(deal.value), deal.currency)}
                  </p>
                </li>
              )
            })}
            {activeDeals.length === 0 && (
              <li className="px-6 py-10 text-center text-[13px] text-fg-3">No active deals right now.</li>
            )}
          </ul>
        </Card>

        {/* Recent transactions */}
        <Card flush className="lg:col-span-5">
          <div className="p-5 pb-0 md:p-6 md:pb-0">
            <CardHeader
              title="Recent transactions"
              description="Latest money in and out"
              action={
                <Link href="/dashboard/finance" className="btn btn-ghost btn-sm">
                  View all <ArrowRightIcon size={14} weight="bold" />
                </Link>
              }
              className="mb-3"
            />
          </div>
          <div className="divide-y divide-line">
            {recentTx.map((tx) => (
              <TransactionRow key={tx.id} tx={tx} compact />
            ))}
            {recentTx.length === 0 && (
              <p className="px-6 py-10 text-center text-[13px] text-fg-3">No transactions yet.</p>
            )}
          </div>
        </Card>
      </div>

    </div>
  )
}

function HealthRow({ label, value, total, tone }: { label: string; value: number; total: number; tone: 'brand' | 'warm' }) {
  const pct = total > 0 ? (value / total) * 100 : 0
  return (
    <div>
      <div className="mb-1.5 flex items-center justify-between text-[12.5px]">
        <span className="font-medium text-fg-2">{label}</span>
        <span className="tabular font-semibold text-fg">{ghsK(value)}</span>
      </div>
      <Progress value={pct} tone={tone} />
    </div>
  )
}

function FollowUpCard({ deals }: { deals: Deal[] }) {
  return (
    <InkCard className="flex h-full flex-col">
      <div className="relative z-10 flex items-center justify-between">
        <h2 className="font-display text-[18px] font-semibold">Follow-ups</h2>
        <span className="rounded-full bg-ink-chip px-2.5 py-1 text-[11px] font-medium text-ink-muted">
          {deals.length} open
        </span>
      </div>
      <p className="relative z-10 mt-1 text-[12.5px] text-ink-muted">Clients with outstanding balances</p>
      <ul className="relative z-10 mt-5 space-y-1">
        {deals.slice(0, 5).map((deal) => {
          const owed = n(deal.value) - n(deal.paid)
          return (
            <li key={deal.id} className="flex items-start gap-3 border-t border-ink-line py-3.5 first:border-t-0">
              <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-peach" />
              <div className="min-w-0 flex-1">
                <p className="truncate text-[13.5px] font-semibold">{deal.client}</p>
                <p className="truncate text-[11.5px] text-ink-muted">{deal.nextAction || deal.title}</p>
              </div>
              <p className="tabular shrink-0 text-[13px] font-semibold">{formatCurrency(owed, deal.currency)}</p>
            </li>
          )
        })}
        {deals.length === 0 && <li className="py-8 text-center text-[13px] text-ink-muted">All balances settled</li>}
      </ul>
      <Link
        href="/dashboard/finance"
        className="relative z-10 mt-auto inline-flex items-center gap-2 pt-4 text-[13px] font-semibold text-white/90 hover:text-white"
      >
        Open finance <ArrowRightIcon size={14} weight="bold" />
      </Link>
    </InkCard>
  )
}
