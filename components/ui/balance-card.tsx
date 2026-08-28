import { formatCurrency } from '@/lib/utils'
import type { Currency } from '@/lib/types'
import { cn } from '@/lib/utils'

interface BalanceCardProps {
  currency: Currency
  balance: number
  label: string
  subLabel?: string
  className?: string
}

const GRADIENT: Record<Currency, string> = {
  GHS: 'from-[var(--navy)] to-[var(--blue)]',
  USD: 'from-[#0E3A63] to-[var(--cyan)]',
}

export function BalanceCard({ currency, balance, label, subLabel, className }: BalanceCardProps) {
  return (
    <div
      className={cn(
        'relative overflow-hidden rounded-2xl p-5 text-white min-h-[120px] flex flex-col justify-between',
        `bg-gradient-to-br ${GRADIENT[currency]}`,
        className
      )}
    >
      {/* Decorative circle */}
      <div className="absolute -right-6 -top-6 w-28 h-28 rounded-full bg-white/8 pointer-events-none" />

      <div>
        <p className="text-[10.5px] font-bold tracking-widest uppercase opacity-80">{label}</p>
        <p className="font-display font-bold text-[28px] leading-tight mt-2">
          {formatCurrency(balance, currency)}
        </p>
      </div>

      {subLabel && (
        <p className="text-[11.5px] opacity-75">{subLabel}</p>
      )}
    </div>
  )
}
