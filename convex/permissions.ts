/**
 * Access levels and what each one may do. Shared by Convex functions (enforcement)
 * and the UI (hiding what a person can't use). Job titles are separate and free text.
 */

export const ACCESS_ROLES = ["ceo", "admin", "hr", "pm", "staff"] as const;
export type AccessRole = (typeof ACCESS_ROLES)[number];

export const ACCESS_ROLE_META: Record<AccessRole, { label: string; description: string }> = {
  ceo: { label: "CEO", description: "Sees and runs everything, including finance." },
  admin: { label: "Admin", description: "Runs everything except finance." },
  hr: { label: "HR", description: "People records, leave register, onboarding, recruitment, announcements." },
  pm: { label: "Projects lead", description: "Oversees every delivery project." },
  staff: { label: "Staff", description: "Their own records and the projects they're on." },
};

export type Permission =
  | "finance.view" // balances, transactions, revenue
  | "pipeline.view" // deals and contacts
  | "people.manage" // job titles, departments, line managers, invites
  | "people.setAccess" // change someone's access level
  | "hr.manage" // leave register, onboarding, recruitment
  | "announcements.send"
  | "projects.manageAll"
  | "reports.view";

const GRANTS: Record<AccessRole, readonly Permission[]> = {
  ceo: [
    "finance.view",
    "pipeline.view",
    "people.manage",
    "people.setAccess",
    "hr.manage",
    "announcements.send",
    "projects.manageAll",
    "reports.view",
  ],
  admin: ["pipeline.view", "people.manage", "hr.manage", "announcements.send", "projects.manageAll", "reports.view"],
  hr: ["people.manage", "hr.manage", "announcements.send", "reports.view"],
  pm: ["projects.manageAll"],
  staff: [],
};

export function can(role: AccessRole | undefined | null, permission: Permission) {
  return !!role && GRANTS[role].includes(permission);
}
