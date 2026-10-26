"use client";

import { Lightbox } from "@/components/Lightbox";
import { listPhotos } from "@/lib/api";
import { useLoad } from "@/lib/useLoad";

export function Gallery() {
  const { data: photos, error } = useLoad(() => listPhotos());
  if (error) return <p className="text-muted">Couldn&apos;t load photos right now. Please try again later.</p>;
  if (!photos) return <p className="text-muted">Loading photos…</p>;
  if (!photos.length) return <p className="text-muted">Photos coming soon!</p>;
  return <Lightbox photos={photos} />;
}
