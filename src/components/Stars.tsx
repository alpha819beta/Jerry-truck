export function Stars({ rating, className = "" }: { rating: number; className?: string }) {
  return (
    <span className={`text-sun ${className}`} aria-label={`${rating} out of 5 stars`}>
      {"★".repeat(Math.round(rating))}
      <span className="text-stone/30">{"★".repeat(5 - Math.round(rating))}</span>
    </span>
  );
}

export function ReviewCard({
  review,
}: {
  review: { author: string; text: string; rating: number | null; recommends?: boolean | null; source: string; createdAt: Date };
}) {
  return (
    <figure className="card flex h-full flex-col">
      <div className="flex items-center justify-between gap-2">
        {review.rating ? (
          <Stars rating={review.rating} className="text-lg" />
        ) : review.recommends ? (
          <span className="text-sm font-semibold text-forest">👍 Recommends</span>
        ) : (
          <span />
        )}
        {review.source === "facebook" && (
          <span className="badge bg-[#1877f2]/10 text-[#1877f2]">Facebook</span>
        )}
      </div>
      <blockquote className="mt-3 flex-1 whitespace-pre-line text-ink">“{review.text}”</blockquote>
      <figcaption className="mt-4 text-sm font-semibold text-navy">
        — {review.author}
        <span className="ml-2 font-normal text-muted">
          {review.createdAt.toLocaleDateString("en-US", { month: "short", year: "numeric" })}
        </span>
      </figcaption>
    </figure>
  );
}
