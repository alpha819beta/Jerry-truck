"use client";

import { useRef, useState } from "react";
import { addPhoto, deletePhoto, updatePhotoCaption } from "@/lib/adminApi";
import { listPhotos } from "@/lib/api";
import { useLoad } from "@/lib/useLoad";
import { AdminTitle, Loading, useAdmin } from "@/components/admin/Flash";

export default function PhotosAdmin() {
  const { data: photos, error, reload } = useLoad(() => listPhotos());
  const { run, busy, flash } = useAdmin();
  const [progress, setProgress] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);
  const captionRef = useRef<HTMLInputElement>(null);

  async function upload(e: React.FormEvent) {
    e.preventDefault();
    const files = Array.from(fileRef.current?.files || []);
    if (!files.length) return flash("Choose at least one photo.", true);
    const caption = captionRef.current?.value.trim() || null;
    let ok = 0;
    await run(async () => {
      for (const [i, file] of files.entries()) {
        setProgress(`Uploading ${i + 1} of ${files.length}…`);
        try {
          await addPhoto(file, caption);
          ok++;
        } catch (err) {
          console.error(file.name, err);
        }
      }
      setProgress("");
      if (fileRef.current) fileRef.current.value = "";
      if (captionRef.current) captionRef.current.value = "";
      await reload();
    });
    flash(`Uploaded ${ok} of ${files.length} photo${files.length > 1 ? "s" : ""}.`, ok < files.length);
  }

  return (
    <>
      <AdminTitle>Job Photos</AdminTitle>

      <form onSubmit={upload} className="card mb-8 space-y-4">
        <h2 className="heading text-lg">Upload photos</h2>
        <div>
          <label className="label" htmlFor="photos">Photos (pick as many as you like)</label>
          <input
            ref={fileRef}
            id="photos"
            type="file"
            accept="image/*"
            multiple
            required
            className="block w-full text-sm file:mr-4 file:rounded-lg file:border-0 file:bg-navy file:px-4 file:py-2.5 file:font-display file:uppercase file:tracking-wider file:text-cream hover:file:bg-navy-700"
          />
          <p className="mt-1 text-xs text-muted">Photos are shrunk automatically so they load fast.</p>
        </div>
        <div>
          <label className="label" htmlFor="caption">Caption (optional, applies to all photos in this upload)</label>
          <input ref={captionRef} id="caption" className="input" placeholder="e.g. 10 tons of #57 for a new driveway" />
        </div>
        <button className="btn-primary" disabled={busy}>{progress || (busy ? "Working…" : "Upload")}</button>
      </form>

      {!photos ? (
        <Loading error={error} />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {photos.map((p) => (
            <div key={p.id} className="card overflow-hidden p-0">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={p.thumb} alt={p.caption || ""} className="aspect-[4/3] w-full object-cover" loading="lazy" />
              <div className="space-y-2 p-4">
                <form
                  className="flex gap-2"
                  onSubmit={(e) => {
                    e.preventDefault();
                    const caption = String(new FormData(e.currentTarget).get("caption") || "").trim() || null;
                    run(() => updatePhotoCaption(p.id, caption), "Caption saved.");
                  }}
                >
                  <input name="caption" defaultValue={p.caption || ""} placeholder="Caption" className="input py-1.5 text-sm" />
                  <button className="btn-outline btn-sm" disabled={busy}>Save</button>
                </form>
                <button
                  className="text-sm text-red-700 hover:underline"
                  onClick={() => confirm("Delete this photo?") && run(async () => { await deletePhoto(p.id); await reload(); }, "Photo deleted.")}
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </>
  );
}
