import { CONTACTS } from '@/lib/mock-data'
import { getInitials, formatDate } from '@/lib/utils'

const TAG_TONE: Record<string, { bg: string; color: string }> = {
  client:     { bg: "var(--badge-info-bg)",    color: "var(--badge-info-text)" },
  enterprise: { bg: "rgba(107,63,201,0.12)",   color: "#6B3FC9" },
  partner:    { bg: "var(--badge-success-bg)", color: "var(--badge-success-text)" },
  prospect:   { bg: "var(--badge-warning-bg)", color: "var(--badge-warning-text)" },
  ecommerce:  { bg: "rgba(13,127,176,0.12)",   color: "#0D7FB0" },
  logistics:  { bg: "var(--badge-neutral-bg)", color: "var(--badge-neutral-text)" },
}

export default function ContactsPage() {
  return (
    <div className="space-y-4">
      {/* Page title */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display font-bold text-[20px] leading-tight" style={{ color: "var(--text-primary)" }}>Contacts</h1>
          <p className="text-[13px] mt-0.5" style={{ color: "var(--text-muted)" }}>{CONTACTS.length} contacts</p>
        </div>
        <button className="btn-primary text-[13px] font-semibold px-4 py-2 rounded-xl">
          + Add Contact
        </button>
      </div>

      <div
        className="rounded-2xl overflow-hidden divide-y"
        style={{ background: "var(--card-bg)", border: "1px solid var(--card-border)", borderColor: "var(--divider)" }}
      >
        {CONTACTS.map((contact) => (
          <div key={contact.id} className="flex items-start gap-4 px-4 py-4 trow">
            {/* Avatar */}
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center font-display font-bold text-white text-[12px] shrink-0 mt-0.5"
              style={{ background: "linear-gradient(135deg, var(--oa-navy) 0%, var(--brand-strong) 100%)" }}
            >
              {getInitials(contact.name)}
            </div>

            {/* Info */}
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-[14px] leading-tight" style={{ color: "var(--text-primary)" }}>{contact.name}</p>
              {contact.company && (
                <p className="text-[12.5px] mt-0.5" style={{ color: "var(--text-secondary)" }}>{contact.company}</p>
              )}
              <div className="flex flex-wrap gap-1.5 mt-2">
                {contact.tags.map((tag) => {
                  const style = TAG_TONE[tag] ?? { bg: "var(--badge-neutral-bg)", color: "var(--badge-neutral-text)" }
                  return (
                    <span
                      key={tag}
                      className="text-[10.5px] font-medium px-2 py-0.5 rounded-full"
                      style={{ background: style.bg, color: style.color }}
                    >
                      {tag}
                    </span>
                  )
                })}
              </div>
              {contact.notes && (
                <p className="text-[11.5px] mt-2 line-clamp-2" style={{ color: "var(--text-muted)" }}>{contact.notes}</p>
              )}
            </div>

            {/* Contact details */}
            <div className="text-right shrink-0 space-y-1">
              {contact.email && (
                <a href={`mailto:${contact.email}`} className="block text-[11.5px] hover:underline" style={{ color: "var(--brand)" }}>
                  {contact.email}
                </a>
              )}
              {contact.phone && (
                <p className="text-[11.5px]" style={{ color: "var(--text-secondary)" }}>{contact.phone}</p>
              )}
              <p className="text-[10.5px]" style={{ color: "var(--text-muted)", opacity: 0.8 }}>
                Added {formatDate(contact.createdAt)}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
