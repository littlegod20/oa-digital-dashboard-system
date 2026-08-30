'use client'

import { useState } from 'react'
import { BalanceCard } from '@/components/ui/balance-card'
import { TRANSACTIONS, KPI } from '@/lib/mock-data'
import { formatCurrency, formatRelativeDate } from '@/lib/utils'
import type { TransactionType } from '@/lib/types'

const TX_TYPES = ['all', 'income', 'payment_received', 'expense', 'transfer'] as const
type FilterType = typeof TX_TYPES[number]

const TYPE_LABEL: Record<TransactionType | 'all', string> = {
  all: 'All', income: 'Income', payment_received: 'Received', expense: 'Expense', transfer: 'Transfer',
}

export default function FinancePage() {
  const [filter, setFilter] = useState<FilterType>('all')
  const filtered = filter === 'all' ? TRANSACTIONS : TRANSACTIONS.filter((t) => t.type === filter)

  return (
    <div className="space-y-5">
      {/* Page title */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display font-bold text-[20px] leading-tight" style={{ color: "var(--text-primary)" }}>Finance</h1>
          <p className="text-[13px] mt-0.5" style={{ color: "var(--text-muted)" }}>Transactions & account balances</p>
        </div>
        <button className="btn-primary text-[13px] font-semibold px-4 py-2 rounded-xl">
          + Add Transaction
        </button>
      </div>

      {/* Balance cards */}
      <div className="grid grid-cols-2 gap-3">
        <BalanceCard currency="GHS" balance={KPI.balanceGHS} label="Cedis Account" />
        <BalanceCard currency="USD" balance={KPI.balanceUSD} label="Dollar Account" />
      </div>

      {/* Summary row */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: 'Revenue',  value: formatCurrency(KPI.revenueGHS,  'GHS'), color: "var(--badge-success-text)" },
          { label: 'Expenses', value: formatCurrency(KPI.expensesGHS, 'GHS'), color: "var(--badge-danger-text)" },
          { label: 'Profit',   value: formatCurrency(KPI.profitGHS,   'GHS'), color: "var(--brand)" },
        ].map(({ label, value, color }) => (
          <div key={label} className="rounded-xl px-4 py-3" style={{ background: "var(--card-bg)", border: "1px solid var(--card-border)" }}>
            <p className="text-[10.5px] font-semibold uppercase tracking-wider" style={{ color: "var(--text-muted)" }}>{label}</p>
            <p className="font-display font-bold text-[15px] mt-1" style={{ color }}>{value}</p>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex gap-2 overflow-x-auto pb-1 -mx-1 px-1">
        {TX_TYPES.map((type) => (
          <button
            key={type}
            onClick={() => setFilter(type)}
            className="whitespace-nowrap text-[12.5px] font-medium px-3.5 py-1.5 rounded-full border shrink-0 transition-colors"
            style={{
              background: filter === type ? "var(--brand-strong)" : "var(--card-bg)",
              color: filter === type ? "var(--brand-on)" : "var(--text-secondary)",
              borderColor: filter === type ? "var(--brand-strong)" : "var(--divider)",
            }}
          >
            {TYPE_LABEL[type]}
          </button>
        ))}
      </div>

      {/* Transaction list */}
      <div className="rounded-2xl overflow-hidden divide-y" style={{ background: "var(--card-bg)", border: "1px solid var(--card-border)", borderColor: "var(--divider)" }}>
        {filtered.length === 0 ? (
          <p className="text-center py-12 text-[13.5px]" style={{ color: "var(--text-muted)" }}>No transactions.</p>
        ) : filtered.map((tx) => {
          const isIn = tx.type === 'income' || tx.type === 'payment_received'
          const isTransfer = tx.type === 'transfer'
          const iconColor = isIn ? "var(--badge-success-text)" : isTransfer ? "var(--brand)" : "var(--badge-danger-text)"
          const iconBg    = isIn ? "var(--badge-success-bg)" : isTransfer ? "var(--badge-info-bg)" : "var(--badge-danger-bg)"
          return (
            <div key={tx.id} className="flex items-center gap-3 px-4 py-4 trow">
              <div className="w-9 h-9 rounded-xl flex items-center justify-center text-base shrink-0"
                style={{ background: iconBg, color: iconColor }}>
                {isIn ? '↓' : isTransfer ? '⇄' : '↑'}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-[13.5px] truncate" style={{ color: "var(--text-primary)" }}>{tx.description}</p>
                <p className="text-[11.5px] mt-0.5" style={{ color: "var(--text-muted)" }}>
                  {tx.category}{tx.person ? ` · ${tx.person}` : ''} · {formatRelativeDate(tx.date)}
                </p>
              </div>
              <p className="font-semibold text-[14px] whitespace-nowrap" style={{ color: iconColor }}>
                {isIn ? '+' : isTransfer ? '' : '-'}{formatCurrency(tx.amount, tx.currency)}
              </p>
            </div>
          )
        })}
      </div>
    </div>
  )
}
