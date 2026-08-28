import { cn } from '@/lib/utils'

interface KpiCardProps {
  label: string
  value: string
  trend?: 'up' | 'down' | 'neutral'
  trendLabel?: string
  className?: string
}

const TREND_STYLES = {
  up:      { color: 'text-[var(--green)]', icon: '↑' },
  down:    { color: 'text-[var(--red)]',   icon: '↓' },
  neutral: { color: 'text-[var(--slate)]', icon: '→' },
}

export function KpiCard({ label, value, trend = 'neutral', trendLabel, className }: KpiCardProps) {
  const t = TREND_STYLES[trend]

  return (
    <div
      className={cn(
        'bg-[var(--card)] rounded-xl px-4 py-3.5 shadow-[var(--shadow)] flex flex-col gap-1.5',
        className
      )}
    >
      <p className="text-[10.5px] font-bold text-[var(--slate)] uppercase tracking-wider">{label}</p>
      <p className={cn('font-display font-bold text-[17px] text-[var(--navy)]', trend !== 'neutral' && t.color)}>
        {value}
      </p>
      {trendLabel && (
        <p className={cn('text-[11px] font-semibold flex items-center gap-0.5', t.color)}>
          <span>{t.icon}</span>
          {trendLabel}
        </p>
      )}
    </div>
  )
}
