"use client";

import { useCallback, useEffect, useState } from "react";
import { getPhotoFull } from "@/lib/api";

type Photo = { id: string; thumb: string; caption: string | null };

export function Lightbox({ photos }: { photos: Photo[] }) {
  const [open, setOpen] = useState<number | null>(null);
  const [full, setFull] = useState<Record<string, string>>({});
  const close = useCallback(() => setOpen(null), []);
  const step = useCallback(
    (d: number) => setOpen((i) => (i === null ? i : (i + d + photos.length) % photos.length)),
    [photos.length],
  );

  useEffect(() => {
    if (open === null) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
      if (e.key === "ArrowRight") step(1);
      if (e.key === "ArrowLeft") step(-1);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, close, step]);

  const current = open !== null ? photos[open] : null;

  // Load the full-size version only when a photo is opened.
  useEffect(() => {
    if (!current || full[current.id]) return;
    getPhotoFull(current.id)
      .then((src) => src && setFull((f) => ({ ...f, [current.id]: src })))
      .catch(console.error);
  }, [current, full]);

  return (
    <>
      <div className="columns-1 gap-4 sm:columns-2 lg:columns-3">
        {photos.map((p, i) => (
          <button
            key={p.id}
            onClick={() => setOpen(i)}
            className="group mb-4 block w-full break-inside-avoid overflow-hidden rounded-xl bg-white text-left shadow-sm"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={p.thumb} alt={p.caption || "Job photo"} loading="lazy" className="w-full transition-transform duration-300 group-hover:scale-[1.02]" />
            {p.caption && <p className="px-4 py-3 text-sm text-ink">{p.caption}</p>}
          </button>
        ))}
      </div>

      {current && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-black/90 p-4"
          onClick={close}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={full[current.id] || current.thumb} alt={current.caption || "Job photo"} className="max-h-[80vh] max-w-full rounded-lg object-contain" onClick={(e) => e.stopPropagation()} />
          {current.caption && <p className="mt-4 text-center text-cream">{current.caption}</p>}
          <div className="mt-4 flex gap-3" onClick={(e) => e.stopPropagation()}>
            <button className="btn-dark btn-sm" onClick={() => step(-1)}>← Prev</button>
            <button className="btn-dark btn-sm" onClick={close}>Close</button>
            <button className="btn-dark btn-sm" onClick={() => step(1)}>Next →</button>
          </div>
        </div>
      )}
    </>
  );
}
