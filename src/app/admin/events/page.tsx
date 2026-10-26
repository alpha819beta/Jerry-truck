"use client";

import Link from "next/link";
import { Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { deleteEvent, getEvent, saveEvent } from "@/lib/adminApi";
import { listEventsInMonth } from "@/lib/api";
import { prettyDate, prettyTime } from "@/lib/format";
import { useLoad } from "@/lib/useLoad";
import { Calendar, parseMonth } from "@/components/Calendar";
import { AdminTitle, useAdmin } from "@/components/admin/Flash";

export default function EventsAdminPage() {
  return (
    <Suspense>
      <EventsAdmin />
    </Suspense>
  );
}

function EventsAdmin() {
  const sp = useSearchParams();
  const router = useRouter();
  const { run, busy } = useAdmin();
  const editId = sp.get("edit");
  const presetDate = sp.get("date") || "";
  const { data: editing } = useLoad(() => (editId ? getEvent(editId) : Promise.resolve(null)), [editId]);

  const { year, month } = parseMonth(sp.get("month") || presetDate.slice(0, 7) || undefined);
  const prefix = `${year}-${String(month + 1).padStart(2, "0")}`;
  const { data: events, reload } = useLoad(() => listEventsInMonth(prefix), [prefix]);
  const monthQ = `month=${prefix}`;

  return (
    <>
      <AdminTitle>Events Calendar</AdminTitle>
      <p className="-mt-4 mb-6 text-sm text-muted">Click a day&apos;s “+” to add an event on that date, or click an event to edit it.</p>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <Calendar
            year={year}
            month={month}
            events={events || []}
            basePath="/admin/events/"
            eventHref={(id) => `/admin/events/?${monthQ}&edit=${id}`}
            dayHref={(date) => `/admin/events/?${monthQ}&date=${date}`}
          />
          {events && events.length > 0 && (
            <ul className="card divide-y divide-cream-200 p-0">
              {events.map((e) => (
                <li key={e.id} className="flex flex-wrap items-center justify-between gap-3 px-4 py-3">
                  <div>
                    <p className="font-semibold text-navy">{e.title}</p>
                    <p className="text-sm text-muted">
                      {prettyDate(e.date, { dateStyle: "medium" })}
                      {e.startTime && ` · ${prettyTime(e.startTime)}`}
                      {e.location && ` · ${e.location}`}
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <Link href={`/admin/events/?${monthQ}&edit=${e.id}`} scroll={false} className="btn-outline btn-sm">Edit</Link>
                    <button
                      className="text-sm text-red-700 hover:underline"
                      onClick={() => confirm("Delete this event?") && run(async () => { await deleteEvent(e.id); await reload(); }, "Event deleted.")}
                    >
                      Delete
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        <form
          key={editing?.id ?? presetDate ?? "new"}
          className="card h-fit space-y-3"
          onSubmit={(e) => {
            e.preventDefault();
            const form = e.currentTarget;
            const f = new FormData(form);
            const s = (k: string) => String(f.get(k) || "").trim() || null;
            const data = {
              title: s("title") || "",
              date: s("date") || "",
              startTime: s("startTime"),
              endTime: s("endTime"),
              location: s("location"),
              description: s("description"),
            };
            run(async () => {
              await saveEvent(data, editing?.id);
              form.reset();
              await reload();
              if (editing || presetDate || data.date.slice(0, 7) !== prefix) {
                router.push(`/admin/events/?month=${data.date.slice(0, 7)}`, { scroll: false });
              }
            }, editing ? "Event updated." : "Event added.");
          }}
        >
          <h2 className="heading text-lg">{editing ? "Edit event" : "Add event"}</h2>
          <div>
            <label className="label">Title *</label>
            <input name="title" className="input" required defaultValue={editing?.title} placeholder="e.g. Spring mulch special" />
          </div>
          <div>
            <label className="label">Date *</label>
            <input name="date" type="date" className="input" required defaultValue={editing?.date ?? presetDate} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="label">Start</label>
              <input name="startTime" type="time" className="input" defaultValue={editing?.startTime ?? ""} />
            </div>
            <div>
              <label className="label">End</label>
              <input name="endTime" type="time" className="input" defaultValue={editing?.endTime ?? ""} />
            </div>
          </div>
          <div>
            <label className="label">Location</label>
            <input name="location" className="input" defaultValue={editing?.location ?? ""} />
          </div>
          <div>
            <label className="label">Description</label>
            <textarea name="description" rows={4} className="input" defaultValue={editing?.description ?? ""} />
          </div>
          <div className="flex items-center gap-3">
            <button className="btn-primary" disabled={busy}>{editing ? "Save Changes" : "Add Event"}</button>
            {editing && <Link href={`/admin/events/?${monthQ}`} scroll={false} className="text-sm text-muted hover:underline">Cancel</Link>}
          </div>
        </form>
      </div>
    </>
  );
}
