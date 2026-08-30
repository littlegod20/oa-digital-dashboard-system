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
    <div className="space-y-5">
      {/* Balance cards */}
      <div className="grid grid-cols-2 gap-3">
        <BalanceCard currency="GHS" balance={KPI.balanceGHS} label="Cedis Account" subLabel="OA Digital GHS" />
        <BalanceCard currency="USD" balance={KPI.balanceUSD} label="Dollar Account" subLabel="OA Digital USD" />
      </div>

      {/* KPI tiles – row 1 */}
      <div className="grid grid-cols-3 gap-3">
        <KpiCard label="Revenue"  value={`GHS ${(KPI.revenueGHS / 1000).toFixed(0)}K`}  delta="Aug MTD" deltaUp={true} />
        <KpiCard label="Expenses" value={`GHS ${(KPI.expensesGHS / 1000).toFixed(0)}K`} delta="vs last mo" deltaUp={false} />
        <KpiCard label="Profit"   value={`GHS ${(KPI.profitGHS / 1000).toFixed(0)}K`}   delta={`${((KPI.profitGHS / KPI.revenueGHS) * 100).toFixed(0)}% margin`} deltaUp={true} />
      </div>

      {/* KPI tiles – row 2 */}
      <div className="grid grid-cols-3 gap-3">
        <KpiCard label="Pipeline"    value={`GHS ${(KPI.pipelineValue / 1000).toFixed(0)}K`}    />
        <KpiCard label="Expected In" value={`GHS ${(KPI.expectedIncoming / 1000).toFixed(0)}K`} delta="incoming" deltaUp={true} />
        <KpiCard label="Owed to Us"  value={`GHS ${(KPI.owedToUs / 1000).toFixed(0)}K`}         />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <RevenueChart data={MONTHLY_REVENUE} />
        <PipelineFunnel deals={DEALS} />
      </div>

      {/* Active deals */}
      <section>
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-display font-semibold text-[14.5px]" style={{ color: "var(--text-primary)" }}>
            Active Deals
          </h2>
          <a href="/dashboard/pipeline" className="text-[12.5px] font-medium" style={{ color: "var(--brand)" }}>
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
      <section>
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-display font-semibold text-[14.5px]" style={{ color: "var(--text-primary)" }}>
            Recent Transactions
          </h2>
          <a href="/dashboard/finance" className="text-[12.5px] font-medium" style={{ color: "var(--brand)" }}>
            View all →
          </a>
        </div>
        <div
          className="rounded-2xl divide-y overflow-hidden"
          style={{ background: "var(--card-bg)", border: "1px solid var(--card-border)", divideColor: "var(--divider)" }}
        >
          {RECENT_TX.map((tx) => {
            const isIn = tx.type === 'income' || tx.type === 'payment_received'
            return (
              <div key={tx.id} className="flex items-center justify-between px-4 py-3.5 gap-3 trow">
                <div>
                  <p className="font-medium text-[13.5px] leading-tight" style={{ color: "var(--text-primary)" }}>
                    {tx.description}
                  </p>
                  <p className="text-[11.5px] mt-0.5" style={{ color: "var(--text-muted)" }}>
                    {tx.category} · {formatRelativeDate(tx.date)}
                  </p>
                </div>
                <p
                  className="font-semibold text-[13.5px] whitespace-nowrap"
                  style={{ color: isIn ? "var(--badge-success-text)" : "var(--badge-danger-text)" }}
                >
                  {isIn ? '+' : '-'}{formatCurrency(tx.amount, tx.currency)}
                </p>
              </div>
            )
          })}
        </div>
      </section>
    </div>
  )
}
