'use client'

import { useState } from 'react'
import { Header } from '@/components/dashboard/header'
import { BalanceCard } from '@/components/ui/balance-card'
import { TRANSACTIONS, KPI } from '@/lib/mock-data'
import { formatCurrency, formatRelativeDate } from '@/lib/utils'
import type { TransactionType } from '@/lib/types'
import { cn } from '@/lib/utils'

const TX_TYPES = ['all', 'income', 'payment_received', 'expense', 'transfer'] as const
type FilterType = typeof TX_TYPES[number]

const TYPE_LABEL: Record<TransactionType | 'all', string> = {
  all:               'All',
  income:            'Income',
  payment_received:  'Received',
  expense:           'Expense',
  transfer:          'Transfer',
}

export default function FinancePage() {
  const [filter, setFilter] = useState<FilterType>('all')

  const filtered = filter === 'all' ? TRANSACTIONS : TRANSACTIONS.filter((t) => t.type === filter)

  return (
    <>
      <Header
        title="Finance"
        subtitle="Transactions & account balances"
        action={
          <button className="bg-gradient-to-r from-[var(--blue)] to-[var(--cyan)] text-white text-[13px] font-bold px-4 py-2 rounded-xl shadow-[0_3px_10px_rgba(29,95,209,.35)]">
            + Add Transaction
          </button>
        }
      />

      {/* Balance cards */}
      <div className="grid grid-cols-2 gap-3 mb-5">
        <BalanceCard currency="GHS" balance={KPI.balanceGHS} label="Cedis Account" />
        <BalanceCard currency="USD" balance={KPI.balanceUSD} label="Dollar Account" />
      </div>

      {/* Summary row */}
      <div className="grid grid-cols-3 gap-2.5 mb-5">
        {[
          { label: 'Revenue', value: formatCurrency(KPI.revenueGHS, 'GHS'), color: 'var(--green)' },
          { label: 'Expenses', value: formatCurrency(KPI.expensesGHS, 'GHS'), color: 'var(--red)' },
          { label: 'Profit', value: formatCurrency(KPI.profitGHS, 'GHS'), color: 'var(--blue)' },
        ].map(({ label, value, color }) => (
          <div key={label} className="bg-[var(--card)] rounded-xl px-3 py-3 shadow-[var(--shadow)]">
            <p className="text-[10.5px] font-bold text-[var(--slate)] uppercase tracking-wider">{label}</p>
            <p className="font-display font-bold text-[15px] mt-1" style={{ color }}>{value}</p>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex gap-2 overflow-x-auto pb-1 mb-3 -mx-1 px-1">
        {TX_TYPES.map((type) => (
          <button
            key={type}
            onClick={() => setFilter(type)}
            className={cn(
              'whitespace-nowrap text-[12.5px] font-semibold px-3.5 py-1.5 rounded-full border transition-colors shrink-0',
              filter === type
                ? 'bg-[var(--navy)] text-white border-[var(--navy)]'
                : 'bg-white text-[var(--slate)] border-[var(--line)]'
            )}
          >
            {TYPE_LABEL[type]}
          </button>
        ))}
      </div>

      {/* Transaction list */}
      <div className="bg-[var(--card)] rounded-2xl shadow-[var(--shadow)] divide-y divide-[var(--line)]">
        {filtered.length === 0 ? (
          <p className="text-center text-[var(--slate)] text-[13.5px] py-12">No transactions.</p>
        ) : (
          filtered.map((tx) => {
            const isIn = tx.type === 'income' || tx.type === 'payment_received'
            const isTransfer = tx.type === 'transfer'
            return (
              <div key={tx.id} className="flex items-center gap-3 px-4 py-4">
                {/* Icon */}
                <div
                  className="w-9 h-9 rounded-xl flex items-center justify-center text-base shrink-0"
                  style={{
                    background: isIn ? '#E3F6EE' : isTransfer ? '#EAF1FF' : '#FFE9E9',
                    color: isIn ? 'var(--green)' : isTransfer ? 'var(--blue)' : 'var(--red)',
                  }}
                >
                  {isIn ? '↓' : isTransfer ? '⇄' : '↑'}
                </div>
                {/* Details */}
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-[var(--ink)] text-[13.5px] truncate">{tx.description}</p>
                  <p className="text-[11.5px] text-[var(--slate)] mt-0.5">
                    {tx.category}
                    {tx.person ? ` · ${tx.person}` : ''}
                    {' · '}{formatRelativeDate(tx.date)}
                  </p>
                </div>
                {/* Amount */}
                <p
                  className="font-bold text-[14px] whitespace-nowrap"
                  style={{ color: isIn ? 'var(--green)' : isTransfer ? 'var(--blue)' : 'var(--red)' }}
                >
                  {isIn ? '+' : isTransfer ? '' : '-'}{formatCurrency(tx.amount, tx.currency)}
                </p>
              </div>
            )
          })
        )}
      </div>
    </>
  )
}
