import { Header } from '@/components/dashboard/header'
import { CONTACTS } from '@/lib/mock-data'
import { getInitials, formatDate } from '@/lib/utils'

const TAG_COLORS: Record<string, { bg: string; color: string }> = {
  client:     { bg: '#EAF1FF', color: '#1D5FD1' },
  enterprise: { bg: '#F1EAFE', color: '#6B3FC9' },
  partner:    { bg: '#E3F6EE', color: '#0E9F6E' },
  prospect:   { bg: '#FFF4E0', color: '#C77E12' },
  ecommerce:  { bg: '#E7F7FE', color: '#0D7FB0' },
  logistics:  { bg: '#EEF1F6', color: '#5A6B85' },
}

export default function ContactsPage() {
  return (
    <>
      <Header
        title="Contacts"
        subtitle={`${CONTACTS.length} contacts`}
        action={
          <button className="bg-gradient-to-r from-[var(--blue)] to-[var(--cyan)] text-white text-[13px] font-bold px-4 py-2 rounded-xl shadow-[0_3px_10px_rgba(29,95,209,.35)]">
            + Add Contact
          </button>
        }
      />

      <div className="bg-[var(--card)] rounded-2xl shadow-[var(--shadow)] divide-y divide-[var(--line)]">
        {CONTACTS.map((contact) => (
          <div key={contact.id} className="flex items-start gap-4 px-4 py-4">
            {/* Avatar */}
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[var(--navy)] to-[var(--blue)] flex items-center justify-center font-display font-bold text-white text-[13px] shrink-0 mt-0.5">
              {getInitials(contact.name)}
            </div>

            {/* Info */}
            <div className="flex-1 min-w-0">
              <p className="font-bold text-[var(--navy)] text-[14px] leading-tight">{contact.name}</p>
              {contact.company && (
                <p className="text-[12.5px] text-[var(--slate)] mt-0.5">{contact.company}</p>
              )}
              <div className="flex flex-wrap gap-1.5 mt-2">
                {contact.tags.map((tag) => {
                  const style = TAG_COLORS[tag] ?? { bg: '#EEF1F6', color: '#5A6B85' }
                  return (
                    <span
                      key={tag}
                      className="text-[10.5px] font-bold px-2 py-0.5 rounded-full"
                      style={style}
                    >
                      {tag}
                    </span>
                  )
                })}
              </div>
              {contact.notes && (
                <p className="text-[11.5px] text-[var(--slate)] mt-2 line-clamp-2">{contact.notes}</p>
              )}
            </div>

            {/* Contact details */}
            <div className="text-right shrink-0 space-y-1">
              {contact.email && (
                <a
                  href={`mailto:${contact.email}`}
                  className="block text-[11.5px] text-[var(--blue)] hover:underline"
                >
                  {contact.email}
                </a>
              )}
              {contact.phone && (
                <p className="text-[11.5px] text-[var(--slate)]">{contact.phone}</p>
              )}
              <p className="text-[10.5px] text-[var(--slate)] opacity-70">
                Added {formatDate(contact.createdAt)}
              </p>
            </div>
          </div>
        ))}
      </div>
    </>
  )
}
