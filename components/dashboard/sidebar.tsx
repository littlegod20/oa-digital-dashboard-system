'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'

const NAV = [
  { href: '/dashboard',          label: 'Overview',   icon: '◆' },
  { href: '/dashboard/pipeline', label: 'Pipeline',   icon: '▤' },
  { href: '/dashboard/finance',  label: 'Finance',    icon: '₵' },
  { href: '/dashboard/team',     label: 'Team',       icon: '☰' },
  { href: '/dashboard/contacts', label: 'Contacts',   icon: '⊕' },
]

export function Sidebar() {
  const pathname = usePathname()

  return (
    <>
      {/* ── Desktop sidebar ── */}
      <aside className="hidden lg:flex flex-col w-56 shrink-0 min-h-screen bg-[var(--navy)] text-white">
        {/* Logo */}
        <div className="flex items-center gap-3 px-5 py-6 border-b border-white/10">
          <div className="w-9 h-9 rounded-xl bg-white/10 flex items-center justify-center font-display font-bold text-sm text-[var(--cyan)]">
            OA
          </div>
          <div>
            <p className="font-display font-bold text-[13px] leading-tight">OA Digital</p>
            <p className="text-[11px] text-white/50">Command Center</p>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 py-5 space-y-1">
          {NAV.map(({ href, label, icon }) => {
            const active = pathname === href
            return (
              <Link
                key={href}
                href={href}
                className={cn(
                  'flex items-center gap-3 px-3 py-2.5 rounded-xl text-[13.5px] font-semibold transition-colors',
                  active
                    ? 'bg-[var(--cyan)]/15 text-[var(--cyan)]'
                    : 'text-white/60 hover:text-white hover:bg-white/8'
                )}
              >
                <span className="text-base w-5 text-center">{icon}</span>
                {label}
              </Link>
            )
          })}
        </nav>

        {/* Footer */}
        <div className="px-5 py-4 border-t border-white/10">
          <p className="text-[11px] text-white/30">© 2026 OA Digital Solutions</p>
        </div>
      </aside>

      {/* ── Mobile bottom nav ── */}
      <nav className="lg:hidden fixed bottom-0 inset-x-0 bg-[var(--navy)] flex justify-around items-center pb-safe z-50 border-t border-white/10">
        {NAV.map(({ href, label, icon }) => {
          const active = pathname === href
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                'flex flex-col items-center gap-0.5 py-2.5 px-3 text-[10px] font-semibold tracking-wide transition-colors',
                active ? 'text-[var(--cyan)]' : 'text-white/50'
              )}
            >
              <span className="text-lg leading-none">{icon}</span>
              {label}
            </Link>
          )
        })}
      </nav>
    </>
  )
}
