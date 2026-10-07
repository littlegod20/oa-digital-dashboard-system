import { ConvexError, v } from "convex/values";
import { mutation, query, type QueryCtx } from "./_generated/server";
import type { Doc, Id } from "./_generated/dataModel";
import { getViewer, requirePermission, requireViewer, viewerWith } from "./lib";
import { can } from "./permissions";
import { buildChain, describeSteps, notifyFirstApprover, previewRoute, stepLabel } from "./approvals";
import { notify } from "./notifications";
import { workingDays } from "./dates";

export const DEFAULT_ANNUAL_DAYS = 15;

const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;

function today() {
  return new Date().toISOString().slice(0, 10);
}

function allowanceOf(e: Doc<"employees">) {
  return e.annualLeaveDays ?? DEFAULT_ANNUAL_DAYS;
}

/** Days used from the yearly allowance: approved and pending, in `year`. */
async function allowanceUse(ctx: QueryCtx, employeeId: Id<"employees">, year: string) {
  const [requests, types] = await Promise.all([
    ctx.db.query("leaveRequests").withIndex("by_employee", (q) => q.eq("employeeId", employeeId)).collect(),
    ctx.db.query("leaveTypes").collect(),
  ]);
  const counts = new Set(types.filter((t) => t.countsAgainstAllowance).map((t) => t._id));
  const inYear = requests.filter((r) => counts.has(r.leaveTypeId) && r.startDate.startsWith(year));
  const sum = (status: Doc<"leaveRequests">["status"]) =>
    inYear.filter((r) => r.status === status).reduce((s, r) => s + r.days, 0);
  return { taken: sum("approved"), pending: sum("pending") };
}

async function shapeRequest(ctx: QueryCtx, r: Doc<"leaveRequests">) {
  const [type, employee] = await Promise.all([ctx.db.get(r.leaveTypeId), ctx.db.get(r.employeeId)]);
  const pendingStep = r.steps.find((s) => s.status === "pending");
  return {
    id: r._id,
    employee: employee?.name ?? "Unknown",
    employeeId: r.employeeId,
    type: type?.name ?? "Leave",
    startDate: r.startDate,
    endDate: r.endDate,
    days: r.days,
    reason: r.reason,
    status: r.status,
    currentStep: pendingStep
      ? `${stepLabel(pendingStep.kind)} · ${(await ctx.db.get(pendingStep.approverId))?.name ?? ""}`
      : null,
    steps: await describeSteps(ctx, r.steps),
    createdAt: r.createdAt,
    canWithdraw: r.status === "pending" || (r.status === "approved" && r.startDate > today()),
  };
}

/** The viewer's balance, requests and the leave types they can pick. */
export const mine = query({
  args: {},
  handler: async (ctx) => {
    const viewer = await getViewer(ctx);
    if (!viewer) return null;
    const year = today().slice(0, 4);
    const [use, requests, types] = await Promise.all([
      allowanceUse(ctx, viewer._id, year),
      ctx.db.query("leaveRequests").withIndex("by_employee", (q) => q.eq("employeeId", viewer._id)).order("desc").collect(),
      ctx.db.query("leaveTypes").withIndex("by_order").collect(),
    ]);
    const entitlement = allowanceOf(viewer);
    return {
      year,
      balance: {
        entitlement,
        taken: use.taken,
        pending: use.pending,
        remaining: Math.max(0, entitlement - use.taken - use.pending),
        pendingRequests: requests.filter((r) => r.status === "pending").length,
      },
      requests: await Promise.all(requests.map((r) => shapeRequest(ctx, r))),
      types: types.filter((t) => t.active).map((t) => ({ id: t._id, name: t.name, countsAgainstAllowance: t.countsAgainstAllowance, paid: t.paid })),
      autoApproved: viewer.accessRole === "ceo",
      route: await previewRoute(ctx, viewer),
    };
  },
});

/** Approved leave from today to 60 days out, company-wide. The type is shown only to HR. */
export const whosAway = query({
  args: {},
  handler: async (ctx) => {
    const viewer = await getViewer(ctx);
    if (!viewer) return [];
    const showType = can(viewer.accessRole, "hr.manage");
    const from = today();
    const until = new Date(Date.now() + 60 * 86400000).toISOString().slice(0, 10);
    const approved = await ctx.db.query("leaveRequests").withIndex("by_status", (q) => q.eq("status", "approved")).collect();
    const upcoming = approved.filter((r) => r.endDate >= from && r.startDate <= until).sort((a, b) => a.startDate.localeCompare(b.startDate));
    return Promise.all(
      upcoming.map(async (r) => {
        const [e, type] = await Promise.all([ctx.db.get(r.employeeId), ctx.db.get(r.leaveTypeId)]);
        const dept = e?.departmentId ? await ctx.db.get(e.departmentId) : null;
        return {
          id: r._id,
          name: e?.name ?? "Unknown",
          department: dept?.name ?? null,
          type: showType ? (type?.name ?? "Leave") : "On leave",
          startDate: r.startDate,
          endDate: r.endDate,
          days: r.days,
          awayToday: r.startDate <= from && r.endDate >= from,
        };
      }),
    );
  },
});

export const request = mutation({
  args: { leaveTypeId: v.id("leaveTypes"), startDate: v.string(), endDate: v.string(), reason: v.string() },
  handler: async (ctx, args) => {
    const viewer = await requireViewer(ctx);
    if (!DATE_RE.test(args.startDate) || !DATE_RE.test(args.endDate)) throw new ConvexError("Pick a start and end date.");
    if (args.endDate < args.startDate) throw new ConvexError("The end date is before the start date.");
    const type = await ctx.db.get(args.leaveTypeId);
    if (!type || !type.active) throw new ConvexError("That leave type isn't available.");
    const days = workingDays(args.startDate, args.endDate);
    if (days === 0) throw new ConvexError("Those dates are all weekend days.");

    const mine = await ctx.db.query("leaveRequests").withIndex("by_employee", (q) => q.eq("employeeId", viewer._id)).collect();
    const clash = mine.find(
      (r) => (r.status === "pending" || r.status === "approved") && r.startDate <= args.endDate && r.endDate >= args.startDate,
    );
    if (clash) throw new ConvexError(`You already have leave from ${clash.startDate} to ${clash.endDate} that overlaps.`);

    if (type.countsAgainstAllowance) {
      const year = args.startDate.slice(0, 4);
      if (args.endDate.slice(0, 4) !== year) throw new ConvexError("Split leave that crosses into a new year into two requests.");
      const use = await allowanceUse(ctx, viewer._id, year);
      const left = allowanceOf(viewer) - use.taken - use.pending;
      if (days > left) {
        throw new ConvexError(`That's ${days} days but you have ${Math.max(0, left)} left for ${year} (including pending requests).`);
      }
    }

    const chain = await buildChain(ctx, viewer);
    const id = await ctx.db.insert("leaveRequests", {
      employeeId: viewer._id,
      leaveTypeId: type._id,
      startDate: args.startDate,
      endDate: args.endDate,
      days,
      reason: args.reason.trim(),
      ...chain,
      createdAt: Date.now(),
      decidedAt: chain.status === "approved" ? Date.now() : undefined,
    });
    await notifyFirstApprover(ctx, chain.currentApproverId, viewer, `${type.name} leave for ${days} day${days !== 1 ? "s" : ""}`);
    return id;
  },
});

export const withdraw = mutation({
  args: { id: v.id("leaveRequests") },
  handler: async (ctx, { id }) => {
    const viewer = await requireViewer(ctx);
    const r = await ctx.db.get(id);
    if (!r || r.employeeId !== viewer._id) throw new ConvexError("That isn't your request.");
    const startsLater = r.startDate > today();
    if (!(r.status === "pending" || (r.status === "approved" && startsLater))) {
      throw new ConvexError("Only pending requests, or approved leave that hasn't started, can be withdrawn.");
    }
    const wasApproved = r.status === "approved";
    await ctx.db.patch(id, { status: "withdrawn", currentApproverId: undefined, decidedAt: Date.now() });
    if (wasApproved && viewer.lineManagerId) {
      await notify(ctx, viewer.lineManagerId, {
        title: "Leave withdrawn",
        body: `${viewer.name} cancelled approved leave from ${r.startDate} to ${r.endDate}.`,
        href: "/dashboard/leave?tab=away",
      });
    }
  },
});

// ── HR ─────────────────────────────────────────────────────────────────

/** Every request in the company plus each person's allowance (HR). */
export const register = query({
  args: {},
  handler: async (ctx) => {
    if (!(await viewerWith(ctx, "hr.manage"))) return null;
    const year = today().slice(0, 4);
    const [requests, employees, types] = await Promise.all([
      ctx.db.query("leaveRequests").order("desc").collect(),
      ctx.db.query("employees").withIndex("by_name").collect(),
      ctx.db.query("leaveTypes").withIndex("by_order").collect(),
    ]);
    const allowances = await Promise.all(
      employees
        .filter((e) => e.status === "active")
        .map(async (e) => {
          const use = await allowanceUse(ctx, e._id, year);
          return {
            employeeId: e._id,
            name: e.name,
            jobTitle: e.jobTitle,
            entitlement: allowanceOf(e),
            isDefault: e.annualLeaveDays === undefined,
            taken: use.taken,
            pending: use.pending,
          };
        }),
    );
    return {
      year,
      defaultDays: DEFAULT_ANNUAL_DAYS,
      requests: await Promise.all(requests.map((r) => shapeRequest(ctx, r))),
      allowances,
      types: types.map((t) => ({ id: t._id, name: t.name, countsAgainstAllowance: t.countsAgainstAllowance, paid: t.paid, active: t.active })),
    };
  },
});

export const setAllowance = mutation({
  args: { employeeId: v.id("employees"), days: v.optional(v.number()) },
  handler: async (ctx, { employeeId, days }) => {
    await requirePermission(ctx, "hr.manage");
    if (days !== undefined && (!Number.isInteger(days) || days < 0 || days > 60)) {
      throw new ConvexError("Use a whole number of days between 0 and 60.");
    }
    await ctx.db.patch(employeeId, { annualLeaveDays: days });
  },
});

export const saveType = mutation({
  args: {
    id: v.optional(v.id("leaveTypes")),
    name: v.string(),
    countsAgainstAllowance: v.boolean(),
    paid: v.boolean(),
    active: v.boolean(),
  },
  handler: async (ctx, { id, ...fields }) => {
    await requirePermission(ctx, "hr.manage");
    const name = fields.name.trim();
    if (!name) throw new ConvexError("Give the leave type a name.");
    if (id) {
      await ctx.db.patch(id, { ...fields, name });
    } else {
      const order = (await ctx.db.query("leaveTypes").collect()).length;
      await ctx.db.insert("leaveTypes", { ...fields, name, order });
    }
  },
});
