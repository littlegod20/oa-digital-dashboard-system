import type { BadgeTone } from "@/components/ui/badge";

export type ProjectStatus = "planned" | "active" | "on_hold" | "completed" | "cancelled";
export type TaskStatus = "todo" | "in_progress" | "in_review" | "done";
export type TaskPriority = "low" | "medium" | "high" | "urgent";

export const PROJECT_STATUS: Record<ProjectStatus, { label: string; tone: BadgeTone }> = {
  planned: { label: "Planned", tone: "neutral" },
  active: { label: "Active", tone: "info" },
  on_hold: { label: "On hold", tone: "warning" },
  completed: { label: "Completed", tone: "success" },
  cancelled: { label: "Cancelled", tone: "danger" },
};

export const TASK_COLUMNS: { status: TaskStatus; label: string; dot: string }[] = [
  { status: "todo", label: "To do", dot: "var(--text-muted)" },
  { status: "in_progress", label: "In progress", dot: "var(--oa-blue)" },
  { status: "in_review", label: "In review", dot: "var(--oa-amber)" },
  { status: "done", label: "Done", dot: "var(--oa-green)" },
];

export const TASK_STATUS_LABEL: Record<TaskStatus, string> = {
  todo: "To do",
  in_progress: "In progress",
  in_review: "In review",
  done: "Done",
};

export const PRIORITY: Record<TaskPriority, { label: string; tone: BadgeTone; rank: number }> = {
  urgent: { label: "Urgent", tone: "danger", rank: 0 },
  high: { label: "High", tone: "warning", rank: 1 },
  medium: { label: "Medium", tone: "info", rank: 2 },
  low: { label: "Low", tone: "neutral", rank: 3 },
};

/** Bar colour for Gantt/calendar by task status. */
export const STATUS_FILL: Record<TaskStatus, string> = {
  todo: "linear-gradient(90deg,#94A3B8,#A8B4C6)",
  in_progress: "linear-gradient(90deg,#1D5FD1,#22B8F0)",
  in_review: "linear-gradient(90deg,#F7A274,#E8677E)",
  done: "linear-gradient(90deg,#0E9F6E,#4cc4a2)",
};

export function formatShortDate(d: string) {
  return new Date(`${d}T00:00:00Z`).toLocaleDateString("en-GB", { timeZone: "UTC", day: "numeric", month: "short" });
}
