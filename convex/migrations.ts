import { v } from "convex/values";
import { internalMutation } from "./_generated/server";
import { components } from "./_generated/api";
import type { Id } from "./_generated/dataModel";
import type { AccessRole } from "./permissions";

/**
 * ONE-OFF (Phase 1): builds departments and employees from the old `teamMembers`
 * table, adds Naa Momoh, and links each deal to its owner. Idempotent: safe to re-run.
 * Run with `npx convex run migrations:phase1Setup` (add `--prod` for production),
 * then delete this file.
 */
export const phase1Setup = internalMutation({
  args: {},
  handler: async (ctx) => {
    const now = Date.now();

    // Departments
    const deptIds: Record<string, Id<"departments">> = {};
    for (const name of ["Executive", "Engineering", "Human Resources & PR", "Project Management"]) {
      const existing = await ctx.db.query("departments").withIndex("by_name", (q) => q.eq("name", name)).first();
      deptIds[name] = existing?._id ?? (await ctx.db.insert("departments", { name, createdAt: now }));
    }

    type Plan = { jobTitle: string; dept: string; role: AccessRole; reportsTo: "gerhard" | "andrew" | null };
    const planFor = (name: string): Plan => {
      const n = name.toLowerCase();
      if (n.includes("gerhard")) return { jobTitle: "Chief Executive Officer", dept: "Executive", role: "ceo", reportsTo: null };
      if (n.includes("andrew")) return { jobTitle: "Chief Technology Officer", dept: "Engineering", role: "admin", reportsTo: "gerhard" };
      if (n.includes("victoria")) return { jobTitle: "Public Relations Officer", dept: "Human Resources & PR", role: "hr", reportsTo: "gerhard" };
      if (n.includes("naa")) return { jobTitle: "Project Manager", dept: "Project Management", role: "pm", reportsTo: "gerhard" };
      return { jobTitle: "Software Developer", dept: "Engineering", role: "staff", reportsTo: "andrew" };
    };
    // Company inboxes aren't live yet; this person's login uses a real inbox for testing.
    const loginEmailOverride: Record<string, string> = {
      "theophilous asante frimpong": "theophilusfrimpong17@gmail.com",
    };

    const people = (await ctx.db.query("teamMembers").collect()).map((m) => ({ name: m.name.trim(), email: m.email, phone: m.phone }));
    if (!people.some((p) => p.name.toLowerCase().includes("naa"))) {
      people.push({ name: "Naa Momoh", email: "naa.momoh@oadigismartsecurity.com", phone: undefined });
    }

    const created: string[] = [];
    const ids: Record<string, Id<"employees">> = {};
    for (const p of people) {
      const plan = planFor(p.name);
      const email = (loginEmailOverride[p.name.toLowerCase()] ?? p.email).trim().toLowerCase();
      let employee = await ctx.db.query("employees").withIndex("by_email", (q) => q.eq("email", email)).first();
      if (!employee) {
        const id = await ctx.db.insert("employees", {
          name: p.name,
          email,
          phone: p.phone,
          jobTitle: plan.jobTitle,
          departmentId: deptIds[plan.dept],
          accessRole: plan.role,
          status: "active",
          createdAt: now,
        });
        employee = (await ctx.db.get(id))!;
        created.push(p.name);
      }
      ids[p.name.toLowerCase()] = employee._id;
    }

    // Line managers (only filled in where not already set, so later edits survive re-runs)
    const find = (key: string) => Object.entries(ids).find(([n]) => n.includes(key))?.[1];
    const gerhard = find("gerhard");
    const andrew = find("andrew");
    for (const [name, id] of Object.entries(ids)) {
      const plan = planFor(name);
      const manager = plan.reportsTo === "gerhard" ? gerhard : plan.reportsTo === "andrew" ? andrew : undefined;
      const doc = await ctx.db.get(id);
      if (doc && manager && !doc.lineManagerId && manager !== id) await ctx.db.patch(id, { lineManagerId: manager });
    }

    // Deal owners: match the free-text assignee ("Andrew", "Gerhard ") to a person
    const employees = await ctx.db.query("employees").collect();
    let linked = 0;
    const unmatched = new Set<string>();
    for (const d of await ctx.db.query("deals").collect()) {
      if (d.ownerId) continue;
      const a = d.assignee.trim().toLowerCase();
      if (!a) continue;
      const match =
        employees.find((e) => e.name.toLowerCase() === a) ??
        employees.find((e) => e.name.toLowerCase().split(/\s+/)[0] === a.split(/\s+/)[0]);
      if (match) {
        await ctx.db.patch(d._id, { ownerId: match._id, assignee: match.name });
        linked++;
      } else unmatched.add(d.assignee);
    }

    return { departments: Object.keys(deptIds).length, employeesCreated: created, dealsLinked: linked, unmatchedOwners: [...unmatched] };
  },
});

/**
 * ONE-OFF: deletes the old shared logins (info@ / sales@) and the legacy `profiles` rows.
 * Run only after Gerhard has signed in with his own account:
 *   npx convex run --prod migrations:removeLegacyAccounts '{"confirm":true}'
 */
export const removeLegacyAccounts = internalMutation({
  args: { confirm: v.boolean() },
  handler: async (ctx, { confirm }) => {
    if (!confirm) throw new Error("Pass {\"confirm\":true} to delete the legacy accounts.");
    const ceo = (await ctx.db.query("employees").collect()).find((e) => e.accessRole === "ceo" && e.userId && e.status === "active");
    if (!ceo) throw new Error("No CEO has signed in with their own account yet. Refusing, so nobody gets locked out.");

    const removed: string[] = [];
    for (const email of ["info@oadigismartsecurity.com", "sales@oadigismartsecurity.com"]) {
      const user = (await ctx.runQuery(components.betterAuth.adapter.findOne, {
        model: "user",
        where: [{ field: "email", value: email }],
      })) as { _id: string } | null;
      if (!user) continue;
      // Never delete a login that an employee record is still using.
      const linked = (await ctx.db.query("employees").withIndex("by_userId", (q) => q.eq("userId", user._id)).first()) !== null;
      if (linked) continue;
      for (const model of ["session", "account"] as const) {
        await ctx.runMutation(components.betterAuth.adapter.deleteMany, {
          input: { model, where: [{ field: "userId", value: user._id }] },
          paginationOpts: { cursor: null, numItems: 1000 },
        });
      }
      await ctx.runMutation(components.betterAuth.adapter.deleteOne, {
        input: { model: "user", where: [{ field: "_id", value: user._id }] },
      });
      removed.push(email);
    }
    for (const p of await ctx.db.query("profiles").collect()) await ctx.db.delete(p._id);
    return { removed };
  },
});

/**
 * ONE-OFF (Phase 2): seeds the leave types if there are none yet. Idempotent.
 * `npx convex run migrations:phase2Setup` (add `--prod` for production).
 */
export const phase2Setup = internalMutation({
  args: {},
  handler: async (ctx) => {
    if (await ctx.db.query("leaveTypes").first()) return { seeded: 0 };
    const types = [
      { name: "Annual Leave", countsAgainstAllowance: true, paid: true },
      { name: "Sick Leave", countsAgainstAllowance: false, paid: true },
      { name: "Maternity / Paternity Leave", countsAgainstAllowance: false, paid: true },
      { name: "Compassionate Leave", countsAgainstAllowance: false, paid: true },
      { name: "Unpaid Leave", countsAgainstAllowance: false, paid: false },
    ];
    for (const [order, t] of types.entries()) await ctx.db.insert("leaveTypes", { ...t, active: true, order });
    return { seeded: types.length };
  },
});

/**
 * ONE-OFF: expense claims now go straight to the CEO. Claims still waiting on a line
 * manager skip that step and move to the CEO. Idempotent.
 * `npx convex run migrations:expensesDirectToCeo` (add `--prod` for production).
 */
export const expensesDirectToCeo = internalMutation({
  args: {},
  handler: async (ctx) => {
    const pending = await ctx.db.query("expenseClaims").withIndex("by_status", (q) => q.eq("status", "pending")).collect();
    let rerouted = 0;
    for (const c of pending) {
      const current = c.steps.find((s) => s.status === "pending");
      if (!current || current.kind !== "line_manager") continue;
      const steps = c.steps.map((s) => (s.kind === "line_manager" && s.status === "pending" ? { ...s, status: "skipped" as const } : s));
      const ceoStep = steps.find((s) => s.kind === "ceo" && s.status === "pending");
      if (!ceoStep) continue;
      await ctx.db.patch(c._id, { steps, currentApproverId: ceoStep.approverId });
      const who = await ctx.db.get(c.employeeId);
      await ctx.db.insert("notifications", {
        employeeId: ceoStep.approverId,
        title: "New request to approve",
        body: `${who?.name ?? "Someone"} submitted an expense claim "${c.title}" (${c.currency} ${c.total.toFixed(2)}).`,
        href: "/dashboard/approvals",
        tone: "warning",
        createdAt: Date.now(),
      });
      rerouted++;
    }
    return { rerouted };
  },
});
