"use client";

import { addManualReview, deleteReview, listAllReviews, setReviewApproved } from "@/lib/adminApi";
import { site } from "@/lib/site";
import { useLoad } from "@/lib/useLoad";
import { AdminTitle, Loading, useAdmin } from "@/components/admin/Flash";
import { Stars } from "@/components/Stars";

export default function ReviewsAdmin() {
  const { data: reviews, error, reload } = useLoad(listAllReviews);
  const { run, busy } = useAdmin();

  return (
    <>
      <AdminTitle
        action={<a href={`${site.facebookUrl}/reviews`} target="_blank" rel="noopener" className="btn btn-sm bg-[#1877f2] text-white">Open Facebook reviews ↗</a>}
      >
        Reviews
      </AdminTitle>
      <p className="-mt-4 mb-6 text-sm text-muted">
        Facebook doesn&apos;t let websites pull reviews in automatically for free. Copy your favorites from your
        Facebook page with the form on the right; they show with a Facebook badge.
      </p>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="space-y-3 lg:col-span-2">
          {!reviews && <Loading error={error} />}
          {reviews?.length === 0 && <p className="card text-muted">No reviews yet.</p>}
          {reviews?.map((r) => (
            <div key={r.id} className={`card p-4 ${r.approved ? "" : "border-sun"}`}>
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-navy">{r.author}</span>
                  {r.rating ? <Stars rating={r.rating} /> : r.recommends ? <span className="text-sm">👍 Recommends</span> : null}
                  <span className="badge bg-cream-200 text-navy">{r.source}</span>
                  {!r.approved && <span className="badge bg-sun text-white">Pending</span>}
                </div>
                <span className="text-xs text-muted">{r.createdAt.toLocaleDateString("en-US", { dateStyle: "medium" })}</span>
              </div>
              <p className="mt-2 whitespace-pre-line text-sm">{r.text}</p>
              <div className="mt-3 flex items-center gap-3">
                <button
                  className={r.approved ? "btn-outline btn-sm" : "btn-green btn-sm"}
                  disabled={busy}
                  onClick={() => run(async () => { await setReviewApproved(r.id, !r.approved); await reload(); })}
                >
                  {r.approved ? "Hide" : "Approve"}
                </button>
                <button
                  className="text-sm text-red-700 hover:underline"
                  onClick={() => confirm("Delete this review?") && run(async () => { await deleteReview(r.id); await reload(); }, "Review deleted.")}
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>

        <form
          className="card h-fit space-y-3"
          onSubmit={(e) => {
            e.preventDefault();
            const form = e.currentTarget;
            const f = new FormData(form);
            const rating = parseInt(String(f.get("rating")), 10);
            run(async () => {
              await addManualReview({
                author: String(f.get("author")).trim(),
                text: String(f.get("text")).trim(),
                rating: rating >= 1 && rating <= 5 ? rating : null,
                source: f.get("source") === "facebook" ? "facebook" : "manual",
                date: String(f.get("date") || "") || null,
              });
              form.reset();
              await reload();
            }, "Review added.");
          }}
        >
          <h2 className="heading text-lg">Add a review</h2>
          <p className="text-sm text-muted">From Facebook, texts, or word of mouth (with permission).</p>
          <div>
            <label className="label">Customer name</label>
            <input name="author" className="input" required />
          </div>
          <div>
            <label className="label">Review</label>
            <textarea name="text" rows={4} className="input" required />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="label">Rating</label>
              <select name="rating" className="input">
                <option value="5">★★★★★</option>
                <option value="4">★★★★</option>
                <option value="3">★★★</option>
                <option value="2">★★</option>
                <option value="1">★</option>
                <option value="">Recommends (no stars)</option>
              </select>
            </div>
            <div>
              <label className="label">From</label>
              <select name="source" className="input">
                <option value="facebook">Facebook</option>
                <option value="manual">Other</option>
              </select>
            </div>
          </div>
          <div>
            <label className="label">Date (optional)</label>
            <input name="date" type="date" className="input" />
          </div>
          <button className="btn-dark w-full" disabled={busy}>Add Review</button>
        </form>
      </div>
    </>
  );
}
