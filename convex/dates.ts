/** Date helpers shared by Convex functions and the UI (no server imports). */

/** Working days (Mon–Fri) from start to end inclusive, as YYYY-MM-DD. Public holidays aren't excluded. */
export function workingDays(start: string, end: string) {
  if (!start || !end || end < start) return 0;
  const d = new Date(`${start}T00:00:00Z`);
  const last = new Date(`${end}T00:00:00Z`);
  let n = 0;
  while (d <= last) {
    const day = d.getUTCDay();
    if (day !== 0 && day !== 6) n++;
    d.setUTCDate(d.getUTCDate() + 1);
  }
  return n;
}

/** "3 Oct 2026", or "3–7 Oct 2026" / "30 Oct – 2 Nov 2026" for ranges. */
export function formatDateRange(start: string, end: string) {
  const s = new Date(`${start}T00:00:00Z`);
  const e = new Date(`${end}T00:00:00Z`);
  const fmt = (d: Date, opts: Intl.DateTimeFormatOptions) => d.toLocaleDateString("en-GB", { timeZone: "UTC", ...opts });
  if (start === end) return fmt(s, { day: "numeric", month: "short", year: "numeric" });
  if (s.getUTCFullYear() === e.getUTCFullYear() && s.getUTCMonth() === e.getUTCMonth()) {
    return `${s.getUTCDate()}–${fmt(e, { day: "numeric", month: "short", year: "numeric" })}`;
  }
  return `${fmt(s, { day: "numeric", month: "short" })} – ${fmt(e, { day: "numeric", month: "short", year: "numeric" })}`;
}
