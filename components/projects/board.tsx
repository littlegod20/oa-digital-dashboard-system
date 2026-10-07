"use client";

import { useState } from "react";
import { useMutation } from "convex/react";
import { CalendarBlankIcon, ChatCircleIcon, PlusIcon } from "@phosphor-icons/react";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";
import type { FunctionReturnType } from "convex/server";
import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { PRIORITY, TASK_COLUMNS, formatShortDate, type TaskStatus } from "./meta";

export type BoardTask = NonNullable<FunctionReturnType<typeof api.tasks.list>>[number];

/** Kanban board with drag-and-drop between and within columns. */
export function Board({ projectId, tasks, onOpen }: { projectId: Id<"projects">; tasks: BoardTask[]; onOpen: (id: string) => void }) {
  const move = useMutation(api.tasks.move).withOptimisticUpdate((store, { id, status, order }) => {
    const current = store.getQuery(api.tasks.list, { projectId });
    if (!current) return;
    store.setQuery(
      api.tasks.list,
      { projectId },
      current.map((t) => (t.id === id ? { ...t, status, order } : t)),
    );
  });
  const [dragId, setDragId] = useState<string | null>(null);
  const [drop, setDrop] = useState<{ status: TaskStatus; index: number } | null>(null);

  function columnTasks(status: TaskStatus) {
    return tasks.filter((t) => t.status === status).sort((a, b) => a.order - b.order);
  }

  function handleDrop(status: TaskStatus, index: number) {
    const id = dragId;
    setDragId(null);
    setDrop(null);
    if (!id) return;
    const others = columnTasks(status).filter((t) => t.id !== id);
    const before = others[index - 1];
    const after = others[index];
    const order = before && after ? (before.order + after.order) / 2 : before ? before.order + 1 : after ? after.order - 1 : 1;
    const task = tasks.find((t) => t.id === id);
    if (task && task.status === status && task.order === order) return;
    void move({ id: id as Id<"tasks">, status, order });
  }

  return (
    <div className="-mx-1 flex gap-4 overflow-x-auto px-1 pb-2">
      {TASK_COLUMNS.map((col) => {
        const items = columnTasks(col.status);
        return (
          <section
            key={col.status}
            className={cn(
              "flex w-[18.5rem] shrink-0 flex-col rounded-[22px] bg-muted p-3 transition-shadow xl:w-auto xl:flex-1",
              drop?.status === col.status && "shadow-[inset_0_0_0_2px_var(--brand-ring)]",
            )}
            onDragOver={(e) => {
              e.preventDefault();
              // Insert before the first card whose midpoint is below the pointer.
              const cards = Array.from(e.currentTarget.querySelectorAll<HTMLElement>("[data-card]"));
              const idx = cards.findIndex((c) => {
                const r = c.getBoundingClientRect();
                return e.clientY < r.top + r.height / 2;
              });
              const index = idx === -1 ? cards.length : idx;
              if (drop?.status !== col.status || drop.index !== index) setDrop({ status: col.status, index });
            }}
            onDragLeave={(e) => {
              if (!e.currentTarget.contains(e.relatedTarget as Node)) setDrop(null);
            }}
            onDrop={(e) => {
              e.preventDefault();
              handleDrop(col.status, drop?.status === col.status ? drop.index : items.length);
            }}
            aria-label={`${col.label} column`}
          >
            <header className="mb-3 flex items-center gap-2 px-1.5">
              <span className="h-2 w-2 rounded-full" style={{ background: col.dot }} />
              <h3 className="text-[13px] font-semibold text-fg">{col.label}</h3>
              <span className="tabular text-[12px] text-fg-3">{items.length}</span>
            </header>

            <ul className="flex min-h-16 flex-1 flex-col gap-2">
              {items.map((t, i) => (
                <li key={t.id}>
                  {drop?.status === col.status && drop.index === i && dragId !== t.id && <DropLine />}
                  <TaskCard task={t} dragging={dragId === t.id} onOpen={() => onOpen(t.id)} onDragStart={() => setDragId(t.id)} onDragEnd={() => { setDragId(null); setDrop(null); }} />
                </li>
              ))}
              {drop?.status === col.status && drop.index === items.length && <DropLine />}
            </ul>

            <QuickAdd projectId={projectId} status={col.status} />
          </section>
        );
      })}
    </div>
  );
}

function DropLine() {
  return <div className="my-0.5 h-1 rounded-full bg-brand" />;
}

function TaskCard({
  task: t,
  dragging,
  onOpen,
  onDragStart,
  onDragEnd,
}: {
  task: BoardTask;
  dragging: boolean;
  onOpen: () => void;
  onDragStart: () => void;
  onDragEnd: () => void;
}) {
  return (
    <button
      type="button"
      data-card
      draggable
      onDragStart={(e) => {
        e.dataTransfer.effectAllowed = "move";
        e.dataTransfer.setData("text/plain", t.id);
        onDragStart();
      }}
      onDragEnd={onDragEnd}
      onClick={onOpen}
      className={cn(
        "w-full cursor-grab rounded-2xl bg-solid p-3.5 text-left shadow-[0_0_0_1px_var(--divider),0_2px_6px_-3px_rgba(16,24,40,0.12)] transition-all hover:shadow-[0_0_0_1px_var(--brand-ring),0_8px_20px_-12px_rgba(16,24,40,0.3)] active:cursor-grabbing",
        dragging && "opacity-40",
      )}
    >
      <div className="flex items-center justify-between gap-2">
        <span className="text-[11px] font-semibold text-fg-3">{t.key}</span>
        <Badge tone={PRIORITY[t.priority].tone} className="h-5 px-2 text-[10px]">
          {PRIORITY[t.priority].label}
        </Badge>
      </div>
      <p className={cn("mt-1.5 text-[13.5px] font-semibold leading-snug text-fg", t.status === "done" && "text-fg-3 line-through")}>{t.title}</p>
      <div className="mt-3 flex items-center gap-2">
        {t.dueDate && (
          <span className={cn("flex items-center gap-1 text-[11.5px]", t.overdue ? "font-semibold text-danger" : "text-fg-3")}>
            <CalendarBlankIcon size={13} />
            {formatShortDate(t.dueDate)}
          </span>
        )}
        {t.comments > 0 && (
          <span className="flex items-center gap-1 text-[11.5px] text-fg-3">
            <ChatCircleIcon size={13} />
            {t.comments}
          </span>
        )}
        <span className="flex-1" />
        {t.assignee ? <Avatar name={t.assignee} size={24} /> : <span className="text-[11px] text-fg-3">Unassigned</span>}
      </div>
    </button>
  );
}

function QuickAdd({ projectId, status }: { projectId: Id<"projects">; status: TaskStatus }) {
  const create = useMutation(api.tasks.create);
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState("");

  if (!open) {
    return (
      <button type="button" onClick={() => setOpen(true)} className="mt-2 flex items-center gap-1.5 rounded-xl px-2 py-2 text-[12.5px] font-semibold text-fg-3 transition-colors hover:bg-solid hover:text-fg">
        <PlusIcon size={14} weight="bold" />
        Add task
      </button>
    );
  }
  return (
    <form
      className="mt-2"
      onSubmit={async (e) => {
        e.preventDefault();
        if (!title.trim()) return;
        await create({ projectId, title, status });
        setTitle("");
      }}
    >
      <input
        autoFocus
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        onBlur={() => !title.trim() && setOpen(false)}
        onKeyDown={(e) => e.key === "Escape" && (setTitle(""), setOpen(false))}
        placeholder="Task title, then Enter"
        className="input h-10 bg-solid"
      />
    </form>
  );
}
