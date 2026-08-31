'use client'

import { useState, useEffect, useMemo } from 'react'
import { BalanceCard } from '@/components/ui/balance-card'
import { formatCurrency, formatRelativeDate } from '@/lib/utils'
import type { TransactionType } from '@/lib/types'
import { AddTransactionModal } from '@/components/ui/add-transaction-modal'
import { useRole } from '@/lib/role-context'

const TX_TYPES = ['all', 'income', 'payment_received', 'expense', 'transfer'] as const
type FilterType = typeof TX_TYPES[number]
const TYPE_LABEL: Record<TransactionType | 'all', string> = {
  all: 'All', income: 'Income', payment_received: 'Received', expense: 'Expense', transfer: 'Transfer',
}

type Tx = { id: string; type: string; description: string; amount: string | number; currency: string; person?: string | null; category: string; date: string; orderId?: string | null }
type Deal = { id: string; client: string; title: string; value: string | number; currency: string; phase: string; paid: string | number; nextAction: string }

function n(v: string | number) { return Number(v) }

export default function FinancePage() {
  const [filter, setFilter] = useState<FilterType>('all')
  const [txModalOpen, setTxModalOpen] = useState(false)
  const [transactions, setTransactions] = useState<Tx[]>([])
  const [deals, setDeals] = useState<Deal[]>([])
  const [loading, setLoading] = useState(true)
  const { isManagement, isSales } = useRole()

  useEffect(() => {
    Promise.all([
      fetch('/api/transactions').then(r => r.ok ? r.json() : []),
      fetch('/api/deals').then(r => r.ok ? r.json() : []),
    ]).then(([txs, ds]) => { setTransactions(txs); setDeals(ds) })
      .finally(() => setLoading(false))
  }, [])

  const filtered = filter === 'all' ? transactions : transactions.filter((t) => t.type === filter)
  const outstanding = deals.filter(d => n(d.value) - n(d.paid) > 0 && d.phase !== 'done')

  const kpi = useMemo(() => {
    const ghsTx = transactions.filter(t => t.currency === 'GHS')
    const usdTx = transactions.filter(t => t.currency === 'USD')
    const ghsIn  = ghsTx.filter(t => t.type === 'income' || t.type === 'payment_received').reduce((s, t) => s + n(t.amount), 0)
    const ghsOut = ghsTx.filter(t => t.type === 'expense').reduce((s, t) => s + n(t.amount), 0)
    const usdIn  = usdTx.filter(t => t.type === 'income' || t.type === 'payment_received').reduce((s, t) => s + n(t.amount), 0)
    const usdOut = usdTx.filter(t => t.type === 'expense').reduce((s, t) => s + n(t.amount), 0)
    return { revenueGHS: ghsIn, expensesGHS: ghsOut, profitGHS: ghsIn - ghsOut, balanceGHS: ghsIn - ghsOut, balanceUSD: usdIn - usdOut }
  }, [transactions])

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display font-bold text-[20px] leading-tight" style={{ color: "var(--text-primary)" }}>Finance</h1>
          <p className="text-[13px] mt-0.5" style={{ color: "var(--text-muted)" }}>
            {isManagement ? 'Transactions & account balances' : 'Transaction entry & payment tracking'}
          </p>
        </div>
        <button onClick={() => setTxModalOpen(true)} className="btn-primary text-[13px] font-semibold px-4 py-2 rounded-xl">
          + Add Transaction
        </button>
      </div>

      {isManagement && !loading && (
        <>
          <div className="grid grid-cols-2 gap-3">
            <BalanceCard currency="GHS" balance={kpi.balanceGHS} label="Cedis Account" />
            <BalanceCard currency="USD" balance={kpi.balanceUSD} label="Dollar Account" />
          </div>
          <div className="grid grid-cols-3 gap-3">
            {[
              { label: 'Revenue',  value: formatCurrency(kpi.revenueGHS,  'GHS'), color: "var(--badge-success-text)" },
              { label: 'Expenses', value: formatCurrency(kpi.expensesGHS, 'GHS'), color: "var(--badge-danger-text)" },
              { label: 'Profit',   value: formatCurrency(kpi.profitGHS,   'GHS'), color: "var(--brand)" },
            ].map(({ label, value, color }) => (
              <div key={label} className="rounded-xl px-4 py-3" style={{ background: "var(--card-bg)", border: "1px solid var(--card-border)" }}>
                <p className="text-[10.5px] font-semibold uppercase tracking-wider" style={{ color: "var(--text-muted)" }}>{label}</p>
                <p className="font-display font-bold text-[15px] mt-1" style={{ color }}>{value}</p>
              </div>
            ))}
          </div>
        </>
      )}

      {isSales && !loading && outstanding.length > 0 && (
        <section>
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-display font-semibold text-[14px]" style={{ color: "var(--text-primary)" }}>Outstanding Payments</h2>
            <span className="text-[11.5px] font-medium px-2.5 py-0.5 rounded-full" style={{ background: "var(--badge-warning-bg)", color: "var(--badge-warning-text)" }}>
              {outstanding.length} to follow up
            </span>
          </div>
          <div className="rounded-2xl overflow-hidden divide-y" style={{ background: "var(--card-bg)", border: "1px solid var(--card-border)", borderColor: "var(--divider)" }}>
            {outstanding.map((deal) => {
              const owed = n(deal.value) - n(deal.paid)
              const pct = Math.round((n(deal.paid) / n(deal.value)) * 100)
              return (
                <div key={deal.id} className="px-4 py-3.5 trow">
                  <div className="flex items-center justify-between gap-3 mb-2">
                    <div className="min-w-0">
                      <p className="font-medium text-[13.5px] leading-tight truncate" style={{ color: "var(--text-primary)" }}>{deal.client}</p>
                      <p className="text-[11.5px] mt-0.5 truncate" style={{ color: "var(--text-muted)" }}>{deal.title} · {deal.nextAction}</p>
                    </div>
                    <div className="text-right shrink-0">
                      <p className="font-semibold text-[13.5px]" style={{ color: "var(--badge-warning-text)" }}>
                        {formatCurrency(owed, deal.currency as 'GHS'|'USD')} owed
                      </p>
                      <p className="text-[11px]" style={{ color: "var(--text-muted)" }}>
                        {pct}% paid of {formatCurrency(n(deal.value), deal.currency as 'GHS'|'USD')}
                      </p>
                    </div>
                  </div>
                  <div className="h-1.5 w-full rounded-full overflow-hidden" style={{ background: "var(--divider)" }}>
                    <div className="h-full rounded-full" style={{ width: `${pct}%`, background: "var(--badge-success-text)" }} />
                  </div>
                </div>
              )
            })}
          </div>
        </section>
      )}

      <div className="flex gap-2 overflow-x-auto pb-1 -mx-1 px-1">
        {TX_TYPES.map((type) => (
          <button key={type} onClick={() => setFilter(type)}
            className="whitespace-nowrap text-[12.5px] font-medium px-3.5 py-1.5 rounded-full border shrink-0 transition-colors"
            style={{
              background: filter === type ? "var(--brand-strong)" : "var(--card-bg)",
              color: filter === type ? "var(--brand-on)" : "var(--text-secondary)",
              borderColor: filter === type ? "var(--brand-strong)" : "var(--divider)",
            }}>
            {TYPE_LABEL[type]}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="py-12 text-center text-[13.5px]" style={{ color: "var(--text-muted)" }}>Loading transactions...</div>
      ) : (
        <div className="rounded-2xl overflow-hidden divide-y" style={{ background: "var(--card-bg)", border: "1px solid var(--card-border)", borderColor: "var(--divider)" }}>
          {filtered.length === 0 ? (
            <p className="text-center py-12 text-[13.5px]" style={{ color: "var(--text-muted)" }}>No transactions.</p>
          ) : filtered.map((tx) => {
            const isIn = tx.type === 'income' || tx.type === 'payment_received'
            const isTransfer = tx.type === 'transfer'
            const iconColor = isIn ? "var(--badge-success-text)" : isTransfer ? "var(--brand)" : "var(--badge-danger-text)"
            const iconBg = isIn ? "var(--badge-success-bg)" : isTransfer ? "var(--badge-info-bg)" : "var(--badge-danger-bg)"
            return (
              <div key={tx.id} className="flex items-center gap-3 px-4 py-4 trow">
                <div className="w-9 h-9 rounded-xl flex items-center justify-center text-base shrink-0" style={{ background: iconBg, color: iconColor }}>
                  {isIn ? '↓' : isTransfer ? '⇄' : '↑'}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-[13.5px] truncate" style={{ color: "var(--text-primary)" }}>{tx.description}</p>
                  <p className="text-[11.5px] mt-0.5" style={{ color: "var(--text-muted)" }}>
                    {tx.category}{tx.person ? ` · ${tx.person}` : ''} · {formatRelativeDate(tx.date)}
                  </p>
                </div>
                <p className="font-semibold text-[14px] whitespace-nowrap" style={{ color: iconColor }}>
                  {isIn ? '+' : isTransfer ? '' : '-'}{formatCurrency(n(tx.amount), tx.currency as 'GHS'|'USD')}
                </p>
              </div>
            )
          })}
        </div>
      )}

      <AddTransactionModal
        open={txModalOpen}
        onClose={() => setTxModalOpen(false)}
        onAdd={(form) => {
          fetch('/api/transactions', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) })
            .then(r => r.ok ? r.json() : null)
            .then(t => { if (t) setTransactions(prev => [t, ...prev]) })
        }}
      />
    </div>
  )
}
