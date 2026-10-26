"use client";

import { PageHeader } from "@/components/PageHeader";
import { ReviewCard, Stars } from "@/components/Stars";
import { ReviewForm } from "@/components/forms/ReviewForm";
import { listApprovedReviews } from "@/lib/api";
import { site } from "@/lib/site";
import { useLoad } from "@/lib/useLoad";

export function ReviewsList() {
  const { data: reviews } = useLoad(() => listApprovedReviews());
  const rated = (reviews || []).filter((r) => r.rating);
  const avg = rated.length ? rated.reduce((s, r) => s + (r.rating || 0), 0) / rated.length : null;

  return (
    <>
      <PageHeader
        title="Reviews"
        subtitle={
          avg ? (
            <span className="flex items-center gap-3">
              <Stars rating={avg} className="text-2xl" /> {avg.toFixed(1)} average from {rated.length} rating{rated.length === 1 ? "" : "s"}
            </span>
          ) : (
            "What our customers are saying."
          )
        }
      />
      <div className="container-page grid gap-10 py-12 lg:grid-cols-3">
        <div className="lg:col-span-2">
          {!reviews ? (
            <p className="text-muted">Loading reviews…</p>
          ) : reviews.length ? (
            <div className="grid gap-5 sm:grid-cols-2">
              {reviews.map((r) => <ReviewCard key={r.id} review={r} />)}
            </div>
          ) : (
            <p className="text-muted">No reviews yet. Be the first!</p>
          )}
        </div>
        <aside className="space-y-5">
          <ReviewForm />
          <div className="card">
            <p className="heading text-lg">Recommend us on Facebook</p>
            <p className="mt-2 text-muted">Reviews on our Facebook page help neighbors find us too.</p>
            <a href={`${site.facebookUrl}/reviews`} target="_blank" rel="noopener" className="btn mt-3 bg-[#1877f2] text-white hover:bg-[#1465d0]">
              Review on Facebook
            </a>
          </div>
        </aside>
      </div>
    </>
  );
}
