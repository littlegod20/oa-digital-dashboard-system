'use client'

interface HeaderProps {
  title: string
  subtitle?: string
  action?: React.ReactNode
}

export function Header({ title, subtitle, action }: HeaderProps) {
  const now = new Date()
  const greeting =
    now.getHours() < 12 ? 'Good morning' :
    now.getHours() < 17 ? 'Good afternoon' : 'Good evening'

  return (
    <div className="flex items-center justify-between mb-6">
      <div>
        <p className="text-xs font-semibold text-[var(--slate)] uppercase tracking-widest mb-0.5">
          {greeting}, Asante
        </p>
        <h1 className="font-display font-bold text-[var(--navy)] text-xl leading-tight">{title}</h1>
        {subtitle && (
          <p className="text-sm text-[var(--slate)] mt-0.5">{subtitle}</p>
        )}
      </div>
      {action && <div>{action}</div>}
    </div>
  )
}
