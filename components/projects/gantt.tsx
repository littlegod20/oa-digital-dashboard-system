"use client";

import { useRef, useState } from "react";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";
import { Segmented } from "@/components/ui/segmented";
import { cn } from "@/lib/utils";
import { STATUS_FILL, TASK_COLUMNS } from "./meta";
import type { BoardTask } from "./board";

const DAY_MS = 86400000;
const ROW = 44;
const LABEL_W = 260;

function toDay(d: string) {
  return Math.round(Date.parse(`${d}T00:00:00Z`) / DAY_MS);
}
function fromDay(n: number) {
  return new Date(n * DAY_MS).toISOString().slice(0, 10);
}

type Drag = { id: string; mode: "move" | "resize"; startX: number; start: number; end: number; dx: number };

/** Timeline of tasks with draggable bars (move) and right-edge handles (change due date). */
export function Gantt({ tasks, projectDue, onOpen }: { tasks: BoardTask[]; projectDue: string | null; onOpen: (id: string) => void }) {
  const update = useMutation(api.tasks.update);
  const [zoom, setZoom] = useState<"week" | "month">("week");
  const [drag, setDrag] = useState<Drag | null>(null);
  const moved = useRef(false);
  const dayW = zoom === "week" ? 36 : 12;

  const scheduled = tasks
    .filter((t) => t.startDate || t.dueDate)
    .map((t) => {
      const s = toDay(t.startDate ?? t.dueDate!);
      const e = toDay(t.dueDate ?? t.startDate!);
      return { ...t, s: Math.min(s, e), e: Math.max(s, e) };
    })
    .sort((a, b) => a.s - b.s || a.e - b.e);
  const unscheduled = tasks.filter((t) => !t.startDate && !t.dueDate);

  const today = toDay(new Date().toISOString().slice(0, 10));
  const due = projectDue ? toDay(projectDue) : null;
  const min = Math.min(today, ...scheduled.map((t) => t.s), ...(due ? [due] : [])) - 3;
  const max = Math.max(today + 21, ...scheduled.map((t) => t.e), ...(due ? [due] : [])) + 7;
  const days = Array.from({ length: max - min + 1 }, (_, i) => min + i);
  const width = days.length * dayW;

  // Month bands for the top header row.
  const months: { label: string; from: number; span: number }[] = [];
  for (const d of days) {
    const date = new Date(d * DAY_MS);
    const label = date.toLocaleDateString("en-GB", { timeZone: "UTC", month: "short", year: "numeric" });
    const last = months[months.length - 1];
    if (last && last.label === label) last.span++;
    else months.push({ label, from: d, span: 1 });
  }

  function onPointerDown(e: React.PointerEvent, t: (typeof scheduled)[number], mode: Drag["mode"]) {
    e.stopPropagation();
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
    moved.current = false;
    setDrag({ id: t.id, mode, startX: e.clientX, start: t.s, end: t.e, dx: 0 });
  }
  function onPointerMove(e: React.PointerEvent) {
    if (!drag) return;
    const dx = Math.round((e.clientX - drag.startX) / dayW);
    if (dx !== drag.dx) {
      moved.current = true;
      setDrag({ ...drag, dx });
    }
  }
  async function onPointerUp() {
    if (!drag) return;
    const d = drag;
    setDrag(null);
    if (!d.dx) return;
    const start = d.mode === "move" ? d.start + d.dx : d.start;
    const end = Math.max(start, d.end + d.dx);
    await update({ id: d.id as Id<"tasks">, startDate: fromDay(start), dueDate: fromDay(end) });
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-3 text-[12px] text-fg-2">
          {TASK_COLUMNS.map((c) => (
            <span key={c.status} className="flex items-center gap-1.5">
              <span className="h-2.5 w-2.5 rounded-full" style={{ background: STATUS_FILL[c.status] }} />
              {c.label}
            </span>
          ))}
          <span className="text-fg-3">· Drag a bar to move it, its right edge to change the due date.</span>
        </div>
        <Segmented
          label="Zoom"
          value={zoom}
          onChange={setZoom}
          options={[
            { value: "week", label: "Days" },
            { value: "month", label: "Months" },
          ]}
        />
      </div>

      {scheduled.length === 0 ? (
        <div className="card px-6 py-12 text-center text-[13px] text-fg-3">Give tasks a start or due date to see them on the timeline.</div>
      ) : (
        <div className="card overflow-hidden p-0">
          <div className="overflow-x-auto" onPointerMove={onPointerMove} onPointerUp={onPointerUp} onPointerCancel={() => setDrag(null)}>
            <div style={{ width: LABEL_W + width }} className="relative select-none">
              {/* Header */}
              <div className="sticky top-0 z-10 flex border-b border-line bg-solid">
                <div className="sticky left-0 z-20 shrink-0 border-r border-line bg-solid px-4 py-2 text-[11px] font-semibold text-fg-3" style={{ width: LABEL_W }}>
                  Task
                </div>
                <div className="relative" style={{ width }}>
                  <div className="flex h-6 border-b border-line">
                    {months.map((m) => (
                      <div key={m.from} className="truncate border-r border-line px-2 text-[11px] font-semibold leading-6 text-fg-2" style={{ width: m.span * dayW }}>
                        {m.label}
                      </div>
                    ))}
                  </div>
                  <div className="flex h-6">
                    {days.map((d) => {
                      const date = new Date(d * DAY_MS);
                      const weekend = date.getUTCDay() === 0 || date.getUTCDay() === 6;
                      const show = zoom === "week" || date.getUTCDay() === 1;
                      return (
                        <div key={d} className={cn("shrink-0 text-center text-[10px] leading-6", weekend ? "text-fg-3/60" : "text-fg-3", d === today && "font-bold text-brand")} style={{ width: dayW }}>
                          {show ? date.getUTCDate() : ""}
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Rows */}
              <div className="relative">
                {/* weekend shading + today + project due lines */}
                <div className="pointer-events-none absolute inset-y-0" style={{ left: LABEL_W, width }}>
                  {zoom === "week" &&
                    days.map((d) => {
                      const wd = new Date(d * DAY_MS).getUTCDay();
                      return wd === 0 || wd === 6 ? <div key={d} className="absolute inset-y-0 bg-[var(--track)]" style={{ left: (d - min) * dayW, width: dayW }} /> : null;
                    })}
                  <div className="absolute inset-y-0 w-0.5 bg-brand" style={{ left: (today - min) * dayW + dayW / 2 }} />
                  {due !== null && <div className="absolute inset-y-0 border-l-2 border-dashed border-peach" style={{ left: (due - min + 1) * dayW }} title="Project due date" />}
                </div>

                {scheduled.map((t) => {
                  const active = drag?.id === t.id ? drag : null;
                  const s = active && active.mode === "move" ? t.s + active.dx : t.s;
                  // Both moving and resizing shift the end by dx; only moving shifts the start.
                  const e = active ? Math.max(s, t.e + active.dx) : t.e;
                  const barWidth = Math.max(dayW - 4, (e - s + 1) * dayW - 4);
                  return (
                    <div key={t.id} className="relative flex border-b border-line last:border-b-0" style={{ height: ROW }}>
                      <button
                        type="button"
                        onClick={() => onOpen(t.id)}
                        className="sticky left-0 z-[5] flex shrink-0 items-center gap-2 border-r border-line bg-solid px-4 text-left hover:bg-muted"
                        style={{ width: LABEL_W }}
                      >
                        <span className="text-[10.5px] font-semibold text-fg-3">{t.key}</span>
                        <span className={cn("truncate text-[12.5px] font-semibold text-fg", t.status === "done" && "text-fg-3 line-through")}>{t.title}</span>
                      </button>
                      <div className="relative" style={{ width }}>
                        <div
                          role="button"
                          tabIndex={0}
                          onPointerDown={(ev) => onPointerDown(ev, t, "move")}
                          onClick={() => !moved.current && onOpen(t.id)}
                          onKeyDown={(ev) => ev.key === "Enter" && onOpen(t.id)}
                          title={`${t.key} · ${fromDay(s)} → ${fromDay(e)}${t.assignee ? ` · ${t.assignee}` : ""}`}
                          className={cn(
                            "absolute top-2 flex h-7 cursor-grab items-center overflow-hidden rounded-full px-2.5 text-[11px] font-semibold text-white shadow-[0_4px_10px_-4px_rgba(16,24,40,0.35)] active:cursor-grabbing",
                            t.overdue && "ring-2 ring-danger",
                            active && "opacity-80",
                          )}
                          style={{ left: (s - min) * dayW + 2, width: barWidth, background: STATUS_FILL[t.status] }}
                        >
                          {/* Only label bars wide enough to read; the tooltip always has the details. */}
                          <span className="truncate">{barWidth >= 70 ? (t.assignee ?? "Unassigned") : ""}</span>
                          <span
                            onPointerDown={(ev) => onPointerDown(ev, t, "resize")}
                            className="absolute inset-y-0 right-0 w-2.5 cursor-ew-resize rounded-r-full bg-white/25"
                            aria-hidden
                          />
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}

      {unscheduled.length > 0 && (
        <p className="text-[12px] text-fg-3">
          {unscheduled.length} task{unscheduled.length !== 1 ? "s have" : " has"} no dates and {unscheduled.length !== 1 ? "aren't" : "isn't"} shown.
        </p>
      )}
    </div>
  );
}
