'use client'

import { BalanceCard } from '@/components/ui/balance-card'
import { KpiCard } from '@/components/ui/kpi-card'
import { PipelineCard } from '@/components/ui/pipeline-card'
import { RevenueChart } from '@/components/charts/revenue-chart'
import { PipelineFunnel } from '@/components/charts/pipeline-funnel'
import { formatCurrency, formatRelativeDate } from '@/lib/utils'
import { KPI, MONTHLY_REVENUE, DEALS, TRANSACTIONS } from '@/lib/mock-data'
import { useRole } from '@/lib/role-context'

const ACTIVE_DEALS = DEALS.filter((d) => !['done', 'hold'].includes(d.phase))
const RECENT_TX = TRANSACTIONS.slice(0, 5)
// Deals with outstanding payments (for sales follow-up)
const OUTSTANDING_DEALS = DEALS.filter((d) => d.value - d.paid > 0 && d.phase !== 'done')

export default function OverviewPage() {
  const { isManagement, isSales } = useRole()

  return (
    <div className="space-y-5">

      {/* Management only: balance cards */}
      {isManagement && (
        <div className="grid grid-cols-2 gap-3">
          <BalanceCard currency="GHS" balance={KPI.balanceGHS} label="Cedis Account" subLabel="OA Digital GHS" />
          <BalanceCard currency="USD" balance={KPI.balanceUSD} label="Dollar Account" subLabel="OA Digital USD" />
        </div>
      )}

      {/* Management only: revenue / expenses / profit */}
      {isManagement && (
        <div className="grid grid-cols-3 gap-3">
          <KpiCard label="Revenue"  value={`GHS ${(KPI.revenueGHS / 1000).toFixed(0)}K`}  delta="Aug MTD" deltaUp={true} />
          <KpiCard label="Expenses" value={`GHS ${(KPI.expensesGHS / 1000).toFixed(0)}K`} delta="vs last mo" deltaUp={false} />
          <KpiCard label="Profit"   value={`GHS ${(KPI.profitGHS / 1000).toFixed(0)}K`}   delta={`${((KPI.profitGHS / KPI.revenueGHS) * 100).toFixed(0)}% margin`} deltaUp={true} />
        </div>
      )}

      {/* Both roles: pipeline KPIs */}
      <div className="grid grid-cols-3 gap-3">
        <KpiCard label="Pipeline"    value={`GHS ${(KPI.pipelineValue / 1000).toFixed(0)}K`} />
        <KpiCard label="Expected In" value={`GHS ${(KPI.expectedIncoming / 1000).toFixed(0)}K`} delta="incoming" deltaUp={true} />
        <KpiCard label="Owed to Us"  value={`GHS ${(KPI.owedToUs / 1000).toFixed(0)}K`} />
      </div>

      {/* Sales: outstanding deals for follow-up */}
      {isSales && OUTSTANDING_DEALS.length > 0 && (
        <section>
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-display font-semibold text-[14.5px]" style={{ color: "var(--text-primary)" }}>
              Outstanding Payments
            </h2>
            <span className="text-[12px] font-medium px-2.5 py-0.5 rounded-full" style={{ background: "var(--badge-warning-bg)", color: "var(--badge-warning-text)" }}>
              Follow up
            </span>
          </div>
          <div
            className="rounded-2xl divide-y overflow-hidden"
            style={{ background: "var(--card-bg)", border: "1px solid var(--card-border)" }}
          >
            {OUTSTANDING_DEALS.map((deal) => {
              const outstanding = deal.value - deal.paid
              return (
                <div key={deal.id} className="flex items-center justify-between px-4 py-3.5 gap-3 trow">
                  <div>
                    <p className="font-medium text-[13.5px] leading-tight" style={{ color: "var(--text-primary)" }}>
                      {deal.client}
                    </p>
                    <p className="text-[11.5px] mt-0.5" style={{ color: "var(--text-muted)" }}>
                      {deal.title} · {deal.nextAction}
                    </p>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="font-semibold text-[13.5px]" style={{ color: "var(--badge-warning-text)" }}>
                      {formatCurrency(outstanding, deal.currency)} owed
                    </p>
                    <p className="text-[11px]" style={{ color: "var(--text-muted)" }}>
                      of {formatCurrency(deal.value, deal.currency)}
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
        {isManagement && <RevenueChart data={MONTHLY_REVENUE} />}
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
