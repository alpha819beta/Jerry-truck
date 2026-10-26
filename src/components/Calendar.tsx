"use client";

import Link from "next/link";
import { prettyTime, todayYmd } from "@/lib/format";

type CalEvent = { id: string; title: string; date: string; startTime: string | null };

export function parseMonth(param: string | undefined) {
  const m = /^(\d{4})-(\d{2})$/.exec(param || "");
  const now = new Date();
  const year = m ? Number(m[1]) : now.getFullYear();
  const month = m ? Number(m[2]) - 1 : now.getMonth();
  return { year, month };
}

const pad = (n: number) => String(n).padStart(2, "0");
const ym = (y: number, m: number) => {
  const d = new Date(y, m, 1);
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}`;
};

/** Month grid. `hrefFor` builds the link for an event (or day, when adding). */
export function Calendar({
  year,
  month,
  events,
  basePath,
  eventHref,
  dayHref,
}: {
  year: number;
  month: number;
  events: CalEvent[];
  basePath: string;
  eventHref?: (id: string) => string;
  dayHref?: (date: string) => string;
}) {
  const first = new Date(year, month, 1);
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const lead = first.getDay();
  const cells: (number | null)[] = [
    ...Array(lead).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ];
  while (cells.length % 7) cells.push(null);

  const today = todayYmd();
  const byDate = new Map<string, CalEvent[]>();
  for (const e of events) byDate.set(e.date, [...(byDate.get(e.date) || []), e]);

  return (
    <div className="card p-0">
      <div className="flex items-center justify-between border-b border-cream-200 px-4 py-3">
        <Link href={`${basePath}?month=${ym(year, month - 1)}`} scroll={false} className="btn-outline btn-sm" aria-label="Previous month">←</Link>
        <h2 className="heading text-xl">
          {first.toLocaleDateString("en-US", { month: "long", year: "numeric" })}
        </h2>
        <Link href={`${basePath}?month=${ym(year, month + 1)}`} scroll={false} className="btn-outline btn-sm" aria-label="Next month">→</Link>
      </div>
      <div className="grid grid-cols-7 border-b border-cream-200 bg-cream/60 text-center text-xs font-semibold uppercase tracking-wider text-muted">
        {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((d) => (
          <div key={d} className="py-2">{d}</div>
        ))}
      </div>
      <div className="grid grid-cols-7">
        {cells.map((day, i) => {
          if (!day) return <div key={i} className="min-h-20 border-b border-r border-cream-200 bg-cream/30 sm:min-h-28" />;
          const date = `${year}-${pad(month + 1)}-${pad(day)}`;
          const list = byDate.get(date) || [];
          const isToday = date === today;
          return (
            <div key={i} className="group relative min-h-20 border-b border-r border-cream-200 p-1 sm:min-h-28 sm:p-2">
              <div className="flex items-center justify-between">
                <span className={`flex h-7 w-7 items-center justify-center rounded-full text-sm ${isToday ? "bg-sun font-bold text-white" : "text-ink"}`}>
                  {day}
                </span>
                {dayHref && (
                  <Link href={dayHref(date)} scroll={false} className="hidden rounded px-1 text-lg leading-none text-forest group-hover:block" aria-label={`Add event on ${date}`}>+</Link>
                )}
              </div>
              <ul className="mt-1 space-y-1">
                {list.map((e) => {
                  const label = (
                    <>
                      <span className="hidden sm:inline">{e.startTime ? `${prettyTime(e.startTime)} ` : ""}</span>
                      {e.title}
                    </>
                  );
                  return (
                    <li key={e.id}>
                      {eventHref ? (
                        <Link href={eventHref(e.id)} scroll={false} className="block truncate rounded bg-forest px-1.5 py-0.5 text-[11px] text-white hover:bg-forest-600 sm:text-xs">{label}</Link>
                      ) : (
                        <a href={`#event-${e.id}`} className="block truncate rounded bg-forest px-1.5 py-0.5 text-[11px] text-white hover:bg-forest-600 sm:text-xs">{label}</a>
                      )}
                    </li>
                  );
                })}
              </ul>
            </div>
          );
        })}
      </div>
    </div>
  );
}
