import { Header } from '@/components/dashboard/header'
import { BalanceCard } from '@/components/ui/balance-card'
import { KpiCard } from '@/components/ui/kpi-card'
import { PipelineCard } from '@/components/ui/pipeline-card'
import { RevenueChart } from '@/components/charts/revenue-chart'
import { PipelineFunnel } from '@/components/charts/pipeline-funnel'
import { formatCurrency, formatRelativeDate } from '@/lib/utils'
import { KPI, MONTHLY_REVENUE, DEALS, TRANSACTIONS } from '@/lib/mock-data'

const ACTIVE_DEALS = DEALS.filter((d) => !['done', 'hold'].includes(d.phase))
const RECENT_TX = TRANSACTIONS.slice(0, 5)

export default function OverviewPage() {
  return (
    <>
      <Header
        title="Command Center"
        subtitle={`${new Date().toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}`}
      />

      {/* Balance cards */}
      <div className="grid grid-cols-2 gap-3 mb-4">
        <BalanceCard
          currency="GHS"
          balance={KPI.balanceGHS}
          label="Cedis Account"
          subLabel="OA Digital GHS"
        />
        <BalanceCard
          currency="USD"
          balance={KPI.balanceUSD}
          label="Dollar Account"
          subLabel="OA Digital USD"
        />
      </div>

      {/* KPI tiles – row 1 */}
      <div className="grid grid-cols-3 gap-2.5 mb-2.5">
        <KpiCard
          label="Revenue"
          value={`GHS ${(KPI.revenueGHS / 1000).toFixed(0)}K`}
          trend="up"
          trendLabel="Aug MTD"
        />
        <KpiCard
          label="Expenses"
          value={`GHS ${(KPI.expensesGHS / 1000).toFixed(0)}K`}
          trend="down"
        />
        <KpiCard
          label="Profit"
          value={`GHS ${(KPI.profitGHS / 1000).toFixed(0)}K`}
          trend="up"
          trendLabel={`${((KPI.profitGHS / KPI.revenueGHS) * 100).toFixed(0)}% margin`}
        />
      </div>

      {/* KPI tiles – row 2 */}
      <div className="grid grid-cols-3 gap-2.5 mb-5">
        <KpiCard
          label="Pipeline"
          value={`GHS ${(KPI.pipelineValue / 1000).toFixed(0)}K`}
          trend="neutral"
        />
        <KpiCard
          label="Expected In"
          value={`GHS ${(KPI.expectedIncoming / 1000).toFixed(0)}K`}
          trend="up"
        />
        <KpiCard
          label="Owed to Us"
          value={`GHS ${(KPI.owedToUs / 1000).toFixed(0)}K`}
          trend="neutral"
        />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-5">
        <RevenueChart data={MONTHLY_REVENUE} />
        <PipelineFunnel deals={DEALS} />
      </div>

      {/* Active deals */}
      <section>
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-display font-bold text-[var(--navy)] text-[15px]">Active Deals</h2>
          <a href="/dashboard/pipeline" className="text-[12.5px] font-semibold text-[var(--blue)]">
            View all →
          </a>
        </div>
        <div className="space-y-3">
          {ACTIVE_DEALS.slice(0, 3).map((deal) => (
            <PipelineCard key={deal.id} deal={deal} />
          ))}
        </div>
      </section>

      {/* Recent transactions */}
      <section className="mt-5">
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-display font-bold text-[var(--navy)] text-[15px]">Recent Transactions</h2>
          <a href="/dashboard/finance" className="text-[12.5px] font-semibold text-[var(--blue)]">
            View all →
          </a>
        </div>
        <div className="bg-[var(--card)] rounded-2xl shadow-[var(--shadow)] divide-y divide-[var(--line)]">
          {RECENT_TX.map((tx) => {
            const isIn = tx.type === 'income' || tx.type === 'payment_received'
            return (
              <div key={tx.id} className="flex items-center justify-between px-4 py-3.5 gap-3">
                <div>
                  <p className="font-semibold text-[var(--ink)] text-[13.5px] leading-tight">{tx.description}</p>
                  <p className="text-[11.5px] text-[var(--slate)] mt-0.5">
                    {tx.category} · {formatRelativeDate(tx.date)}
                  </p>
                </div>
                <p
                  className="font-bold text-[13.5px] whitespace-nowrap"
                  style={{ color: isIn ? 'var(--green)' : 'var(--red)' }}
                >
                  {isIn ? '+' : '-'}{formatCurrency(tx.amount, tx.currency)}
                </p>
              </div>
            )
          })}
        </div>
      </section>
    </>
  )
}
