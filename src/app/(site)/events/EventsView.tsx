"use client";

import { useSearchParams } from "next/navigation";
import { Calendar, parseMonth } from "@/components/Calendar";
import { listEventsFrom, listEventsInMonth } from "@/lib/api";
import { prettyDate, prettyTime, todayYmd } from "@/lib/format";
import { useLoad } from "@/lib/useLoad";

export function EventsView() {
  const { year, month } = parseMonth(useSearchParams().get("month") || undefined);
  const prefix = `${year}-${String(month + 1).padStart(2, "0")}`;
  const { data: monthEvents } = useLoad(() => listEventsInMonth(prefix), [prefix]);
  const { data: upcoming } = useLoad(() => listEventsFrom(todayYmd(), 20));

  return (
    <div className="container-page grid gap-10 py-12 lg:grid-cols-3">
      <div className="lg:col-span-2">
        <Calendar year={year} month={month} events={monthEvents || []} basePath="/events/" />
      </div>
      <aside>
        <h2 className="heading text-2xl">Coming up</h2>
        {upcoming?.length ? (
          <ul className="mt-4 space-y-4">
            {upcoming.map((e) => (
              <li key={e.id} id={`event-${e.id}`} className="card scroll-mt-24 p-5">
                <p className="text-sm font-semibold uppercase tracking-wider text-sun">
                  {prettyDate(e.date, { weekday: "short", month: "short", day: "numeric" })}
                  {e.startTime && ` · ${prettyTime(e.startTime)}`}
                  {e.endTime && `–${prettyTime(e.endTime)}`}
                </p>
                <p className="heading mt-1 text-lg">{e.title}</p>
                {e.location && <p className="text-sm text-muted">📍 {e.location}</p>}
                {e.description && <p className="mt-2 whitespace-pre-line text-ink">{e.description}</p>}
              </li>
            ))}
          </ul>
        ) : (
          <p className="mt-4 text-muted">
            {upcoming ? "Nothing scheduled yet. Subscribe to the newsletter to hear first." : "Loading…"}
          </p>
        )}
      </aside>
    </div>
  );
}
