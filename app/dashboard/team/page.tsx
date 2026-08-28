import { Header } from '@/components/dashboard/header'
import { TEAM } from '@/lib/mock-data'
import { formatCurrency, getInitials } from '@/lib/utils'

export default function TeamPage() {
  return (
    <>
      <Header
        title="Team"
        subtitle={`${TEAM.length} members`}
        action={
          <button className="bg-gradient-to-r from-[var(--blue)] to-[var(--cyan)] text-white text-[13px] font-bold px-4 py-2 rounded-xl shadow-[0_3px_10px_rgba(29,95,209,.35)]">
            + Add Member
          </button>
        }
      />

      <div className="space-y-3">
        {TEAM.map((member) => (
          <div
            key={member.id}
            className="bg-[var(--card)] rounded-2xl p-4 shadow-[var(--shadow)] flex items-center gap-4"
          >
            {/* Avatar */}
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[var(--blue)] to-[var(--cyan)] flex items-center justify-center font-display font-bold text-white text-[15px] shrink-0">
              {getInitials(member.name)}
            </div>

            {/* Info */}
            <div className="flex-1 min-w-0">
              <p className="font-bold text-[var(--navy)] text-[14.5px] leading-tight">{member.name}</p>
              <p className="text-[12.5px] text-[var(--slate)] mt-0.5">{member.role}</p>
              <p className="text-[11.5px] text-[var(--blue)] mt-1">{member.email}</p>
            </div>

            {/* Stats */}
            <div className="text-right shrink-0">
              <p className="font-display font-bold text-[var(--navy)] text-[15px]">
                {member.activeDeals}
              </p>
              <p className="text-[10.5px] text-[var(--slate)]">active deals</p>
              <p className="font-semibold text-[var(--green)] text-[12px] mt-0.5">
                {formatCurrency(member.totalRevenue, 'GHS')}
              </p>
            </div>
          </div>
        ))}
      </div>
    </>
  )
}
