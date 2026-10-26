"use client";

import Link from "next/link";
import { listApprovedReviews, listEventsFrom, listMaterials, listPhotos } from "@/lib/api";
import { money, prettyDate, prettyTime, todayYmd } from "@/lib/format";
import { useLoad } from "@/lib/useLoad";
import { ReviewCard } from "@/components/Stars";

export function HomeRates() {
  const { data: materials, error } = useLoad(() => listMaterials());
  return (
    <div className="card p-0">
      {error && <p className="p-6 text-muted">Prices are temporarily unavailable. Call or text for a quote.</p>}
      {!materials && !error && <p className="p-6 text-muted">Loading prices…</p>}
      <ul className="divide-y divide-cream-200">
        {materials?.map((m) => (
          <li key={m.id} className="flex items-center justify-between gap-4 px-6 py-3">
            <div>
              <p className="font-semibold text-navy">{m.name}</p>
              <p className="text-sm text-muted">{m.unit}{m.description ? ` · ${m.description}` : ""}</p>
            </div>
            <p className="font-display text-xl text-forest">{money(m.price)}</p>
          </li>
        ))}
      </ul>
    </div>
  );
}

export function HomePhotos() {
  const { data: photos } = useLoad(() => listPhotos(6));
  if (!photos?.length) return null;
  return (
    <section className="container-page py-16">
      <div className="flex items-end justify-between gap-4">
        <h2 className="heading text-3xl">Recent work</h2>
        <Link href="/gallery/" className="font-display uppercase tracking-wider text-sun hover:underline">See all →</Link>
      </div>
      <div className="mt-6 grid grid-cols-2 gap-3 md:grid-cols-3">
        {photos.map((p) => (
          <Link key={p.id} href="/gallery/" className="group relative aspect-square overflow-hidden rounded-xl bg-navy">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={p.thumb} alt={p.caption || "Job photo"} loading="lazy" className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105" />
          </Link>
        ))}
      </div>
    </section>
  );
}

export function HomeReviews() {
  const { data: reviews } = useLoad(() => listApprovedReviews());
  return (
    <section className="bg-navy py-16 text-cream">
      <div className="container-page">
        <div className="flex items-end justify-between gap-4">
          <h2 className="font-display text-3xl uppercase tracking-wide">What customers say</h2>
          <Link href="/reviews/" className="font-display uppercase tracking-wider text-sun hover:underline">All reviews →</Link>
        </div>
        {reviews?.length ? (
          <div className="mt-6 grid gap-5 text-ink md:grid-cols-3">
            {reviews.slice(0, 3).map((r) => <ReviewCard key={r.id} review={r} />)}
          </div>
        ) : (
          <p className="mt-6 text-cream/80">
            Worked with us? We&apos;d love to hear about it.{" "}
            <Link href="/reviews/" className="text-sun underline">Leave a review</Link>.
          </p>
        )}
      </div>
    </section>
  );
}

export function HomeEvents() {
  const { data: events } = useLoad(() => listEventsFrom(todayYmd(), 3));
  return (
    <div>
      <div className="flex items-end justify-between gap-4">
        <h2 className="heading text-3xl">Upcoming events</h2>
        <Link href="/events/" className="font-display uppercase tracking-wider text-sun hover:underline">Calendar →</Link>
      </div>
      {events?.length ? (
        <ul className="mt-6 space-y-3">
          {events.map((e) => (
            <li key={e.id} className="card flex gap-4 p-4">
              <div className="w-16 shrink-0 rounded-lg bg-forest py-2 text-center text-white">
                <p className="text-xs uppercase">{prettyDate(e.date, { month: "short" })}</p>
                <p className="font-display text-2xl leading-none">{Number(e.date.slice(8))}</p>
              </div>
              <div>
                <p className="font-semibold text-navy">{e.title}</p>
                <p className="text-sm text-muted">
                  {[e.startTime && prettyTime(e.startTime), e.location].filter(Boolean).join(" · ")}
                </p>
              </div>
            </li>
          ))}
        </ul>
      ) : (
        <p className="mt-6 text-muted">
          {events ? "No events scheduled right now. Check back soon or subscribe to the newsletter." : "Loading…"}
        </p>
      )}
    </div>
  );
}
