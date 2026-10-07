import { ConvexError, v } from "convex/values";
import { mutation, query, type MutationCtx } from "./_generated/server";
import type { Doc, Id } from "./_generated/dataModel";
import { getViewer } from "./lib";
import { notify } from "./notifications";
import { accessTo, logActivity, requireProject } from "./projects";
import { taskPriority, taskStatus } from "./schema";

const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;
const STATUS_LABEL = { todo: "To do", in_progress: "In progress", in_review: "In review", done: "Done" } as const;

function today() {
  return new Date().toISOString().slice(0, 10);
}

function checkDates(start?: string, due?: string) {
  for (const d of [start, due]) if (d && !DATE_RE.test(d)) throw new ConvexError("Dates must be YYYY-MM-DD.");
  if (start && due && due < start) throw new ConvexError("The due date is before the start date.");
}

async function assertAssignable(ctx: MutationCtx, project: Doc<"projects">, assigneeId?: Id<"employees">) {
  if (!assigneeId) return;
  const member = await ctx.db
    .query("projectMembers")
    .withIndex("by_project_employee", (q) => q.eq("projectId", project._id).eq("employeeId", assigneeId))
    .unique();
  if (!member && project.leadId !== assigneeId) throw new ConvexError("Add that person to the team before assigning them tasks.");
}

/** All tasks on a project. */
export const list = query({
  args: { projectId: v.id("projects") },
  handler: async (ctx, { projectId }) => {
    const viewer = await getViewer(ctx);
    const project = await ctx.db.get(projectId);
    if (!viewer || !project || !(await accessTo(ctx, viewer, project)).canView) return null;
    const tasks = await ctx.db.query("tasks").withIndex("by_project", (q) => q.eq("projectId", projectId)).collect();
    const names = new Map<string, string>();
    for (const t of tasks) {
      if (t.assigneeId && !names.has(t.assigneeId)) names.set(t.assigneeId, (await ctx.db.get(t.assigneeId))?.name ?? "Former member");
    }
    const now = today();
    return Promise.all(
      tasks
        .sort((a, b) => a.order - b.order)
        .map(async (t) => ({
          id: t._id,
          key: `${project.key}-${t.number}`,
          title: t.title,
          description: t.description,
          status: t.status,
          priority: t.priority,
          assigneeId: t.assigneeId ?? null,
          assignee: t.assigneeId ? (names.get(t.assigneeId) ?? null) : null,
          startDate: t.startDate ?? null,
          dueDate: t.dueDate ?? null,
          overdue: t.status !== "done" && !!t.dueDate && t.dueDate < now,
          order: t.order,
          comments: (await ctx.db.query("taskComments").withIndex("by_task", (q) => q.eq("taskId", t._id)).collect()).length,
          createdBy: t.createdBy,
          createdAt: t.createdAt,
          completedAt: t.completedAt ?? null,
        })),
    );
  },
});

/** Open tasks assigned to the viewer across all projects, soonest due first. */
export const mine = query({
  args: {},
  handler: async (ctx) => {
    const viewer = await getViewer(ctx);
    if (!viewer) return [];
    const tasks = (await ctx.db.query("tasks").withIndex("by_assignee", (q) => q.eq("assigneeId", viewer._id)).collect()).filter(
      (t) => t.status !== "done",
    );
    const now = today();
    const rows = await Promise.all(
      tasks.map(async (t) => {
        const project = await ctx.db.get(t.projectId);
        return {
          id: t._id,
          projectId: t.projectId,
          project: project?.name ?? "",
          key: project ? `${project.key}-${t.number}` : "",
          title: t.title,
          status: t.status,
          priority: t.priority,
          dueDate: t.dueDate ?? null,
          overdue: !!t.dueDate && t.dueDate < now,
        };
      }),
    );
    return rows.sort((a, b) => (a.dueDate ?? "9999").localeCompare(b.dueDate ?? "9999"));
  },
});

export const create = mutation({
  args: {
    projectId: v.id("projects"),
    title: v.string(),
    description: v.optional(v.string()),
    status: v.optional(taskStatus),
    priority: v.optional(taskPriority),
    assigneeId: v.optional(v.id("employees")),
    startDate: v.optional(v.string()),
    dueDate: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const { viewer, project } = await requireProject(ctx, args.projectId, "view");
    const title = args.title.trim();
    if (!title) throw new ConvexError("Give the task a title.");
    checkDates(args.startDate, args.dueDate);
    await assertAssignable(ctx, project, args.assigneeId);
    const status = args.status ?? "todo";
    const column = (await ctx.db.query("tasks").withIndex("by_project", (q) => q.eq("projectId", project._id)).collect()).filter(
      (t) => t.status === status,
    );
    const number = project.taskCounter + 1;
    await ctx.db.patch(project._id, { taskCounter: number });
    const id = await ctx.db.insert("tasks", {
      projectId: project._id,
      number,
      title,
      description: args.description?.trim() ?? "",
      status,
      priority: args.priority ?? "medium",
      assigneeId: args.assigneeId,
      startDate: args.startDate || undefined,
      dueDate: args.dueDate || undefined,
      order: column.length ? Math.max(...column.map((t) => t.order)) + 1 : 1,
      createdBy: viewer._id,
      createdAt: Date.now(),
      completedAt: status === "done" ? Date.now() : undefined,
    });
    await logActivity(ctx, project._id, viewer._id, `created ${project.key}-${number} "${title}"`);
    if (args.assigneeId && args.assigneeId !== viewer._id) {
      await notify(ctx, args.assigneeId, {
        title: "New task for you",
        body: `${viewer.name} assigned you ${project.key}-${number}: ${title}`,
        href: `/dashboard/projects/${project._id}?tab=board&task=${id}`,
      });
    }
    return id;
  },
});

export const update = mutation({
  args: {
    id: v.id("tasks"),
    title: v.optional(v.string()),
    description: v.optional(v.string()),
    status: v.optional(taskStatus),
    priority: v.optional(taskPriority),
    assigneeId: v.optional(v.union(v.id("employees"), v.null())),
    startDate: v.optional(v.union(v.string(), v.null())),
    dueDate: v.optional(v.union(v.string(), v.null())),
  },
  handler: async (ctx, { id, ...patch }) => {
    const task = await ctx.db.get(id);
    if (!task) throw new ConvexError("That task no longer exists.");
    const { viewer, project } = await requireProject(ctx, task.projectId, "view");

    const next: Partial<Doc<"tasks">> = {};
    if (patch.title !== undefined) {
      if (!patch.title.trim()) throw new ConvexError("Give the task a title.");
      next.title = patch.title.trim();
    }
    if (patch.description !== undefined) next.description = patch.description.trim();
    if (patch.priority !== undefined) next.priority = patch.priority;
    // `undefined` = leave as is; null or "" = clear.
    const start = patch.startDate !== undefined ? patch.startDate || undefined : task.startDate;
    const due = patch.dueDate !== undefined ? patch.dueDate || undefined : task.dueDate;
    checkDates(start, due);
    if (patch.startDate !== undefined) next.startDate = start;
    if (patch.dueDate !== undefined) next.dueDate = due;
    if (patch.assigneeId !== undefined) {
      await assertAssignable(ctx, project, patch.assigneeId ?? undefined);
      next.assigneeId = patch.assigneeId ?? undefined;
    }
    if (patch.status !== undefined && patch.status !== task.status) {
      next.status = patch.status;
      next.completedAt = patch.status === "done" ? Date.now() : undefined;
    }
    await ctx.db.patch(id, next);

    const label = `${project.key}-${task.number}`;
    if (next.status) await logActivity(ctx, project._id, viewer._id, `moved ${label} to ${STATUS_LABEL[next.status]}`);
    if (next.assigneeId && next.assigneeId !== task.assigneeId && next.assigneeId !== viewer._id) {
      await notify(ctx, next.assigneeId, {
        title: "New task for you",
        body: `${viewer.name} assigned you ${label}: ${next.title ?? task.title}`,
        href: `/dashboard/projects/${project._id}?tab=board&task=${id}`,
      });
    }
  },
});

/** Board drag-and-drop: new column and position. */
export const move = mutation({
  args: { id: v.id("tasks"), status: taskStatus, order: v.number() },
  handler: async (ctx, { id, status, order }) => {
    const task = await ctx.db.get(id);
    if (!task) throw new ConvexError("That task no longer exists.");
    const { viewer, project } = await requireProject(ctx, task.projectId, "view");
    const changed = status !== task.status;
    await ctx.db.patch(id, {
      status,
      order,
      completedAt: changed ? (status === "done" ? Date.now() : undefined) : task.completedAt,
    });
    if (changed) await logActivity(ctx, project._id, viewer._id, `moved ${project.key}-${task.number} to ${STATUS_LABEL[status]}`);
  },
});

export const remove = mutation({
  args: { id: v.id("tasks") },
  handler: async (ctx, { id }) => {
    const task = await ctx.db.get(id);
    if (!task) return;
    const { viewer, project, access } = await requireProject(ctx, task.projectId, "view");
    if (!access.canManage && task.createdBy !== viewer._id) throw new ConvexError("Only the task's creator or the project lead can delete it.");
    for (const c of await ctx.db.query("taskComments").withIndex("by_task", (q) => q.eq("taskId", id)).collect()) await ctx.db.delete(c._id);
    await ctx.db.delete(id);
    await logActivity(ctx, project._id, viewer._id, `deleted ${project.key}-${task.number} "${task.title}"`);
  },
});

// ── Comments ───────────────────────────────────────────────────────────

export const comments = query({
  args: { taskId: v.id("tasks") },
  handler: async (ctx, { taskId }) => {
    const viewer = await getViewer(ctx);
    const task = await ctx.db.get(taskId);
    if (!viewer || !task) return [];
    const project = await ctx.db.get(task.projectId);
    if (!project || !(await accessTo(ctx, viewer, project)).canView) return [];
    const rows = await ctx.db.query("taskComments").withIndex("by_task", (q) => q.eq("taskId", taskId)).collect();
    return Promise.all(
      rows.map(async (c) => ({
        id: c._id,
        author: (await ctx.db.get(c.authorId))?.name ?? "Someone",
        body: c.body,
        createdAt: c.createdAt,
        mine: c.authorId === viewer._id,
      })),
    );
  },
});

export const addComment = mutation({
  args: { taskId: v.id("tasks"), body: v.string() },
  handler: async (ctx, { taskId, body }) => {
    const task = await ctx.db.get(taskId);
    if (!task) throw new ConvexError("That task no longer exists.");
    const { viewer, project } = await requireProject(ctx, task.projectId, "view");
    const text = body.trim();
    if (!text) return;
    await ctx.db.insert("taskComments", { taskId, authorId: viewer._id, body: text, createdAt: Date.now() });
    const label = `${project.key}-${task.number}`;
    const recipients = new Set([task.assigneeId, task.createdBy].filter((x): x is Id<"employees"> => !!x && x !== viewer._id));
    for (const r of recipients) {
      await notify(ctx, r, {
        title: `New comment on ${label}`,
        body: `${viewer.name}: ${text.length > 120 ? `${text.slice(0, 117)}…` : text}`,
        href: `/dashboard/projects/${project._id}?tab=board&task=${taskId}`,
      });
    }
  },
});
