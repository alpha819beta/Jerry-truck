"use client";

import Link from "next/link";
import { useState } from "react";
import { listRequests, loadStarterContent } from "@/lib/adminApi";
import { listMaterials } from "@/lib/api";
import { emailConfigured } from "@/lib/notify";
import { money, prettyPhone } from "@/lib/format";
import { useLoad } from "@/lib/useLoad";
import { AdminTitle, ConfigNotice, Loading, statusColors, useAdmin } from "@/components/admin/Flash";

const filters = ["open", "new", "reviewed", "invoiced", "scheduled", "completed", "cancelled", "all"];

export default function RequestsPage() {
  const [status, setStatus] = useState("open");
  const { data: requests, error } = useLoad(listRequests);
  const { data: materials, reload: reloadMaterials } = useLoad(() => listMaterials(false));
  const { run, busy } = useAdmin();

  const shown = (requests || []).filter((r) =>
    status === "all" ? true : status === "open" ? !["completed", "cancelled"].includes(r.status) : r.status === status,
  );

  return (
    <>
      {materials && materials.length === 0 && (
        <div className="card mb-6 border-sun">
          <p className="heading text-lg">Welcome! Let&apos;s set up the site.</p>
          <p className="mt-1 text-sm text-muted">Load your price list (from the delivery-rates sign) and the starter job photos.</p>
          <button
            className="btn-primary btn-sm mt-3"
            disabled={busy}
            onClick={() => run(async () => { await loadStarterContent(); reloadMaterials(); }, "Starter price list and photos loaded.")}
          >
            {busy ? "Loading…" : "Load starter content"}
          </button>
        </div>
      )}
      <ConfigNotice show={!emailConfigured}>
        Email alerts aren&apos;t set up yet. New requests still show here; add your EmailJS keys (see README) to get
        them by email/text.
      </ConfigNotice>
      <AdminTitle action={<Link href="/admin/invoices/new/" className="btn-primary btn-sm">+ Custom Invoice</Link>}>
        Requests
      </AdminTitle>

      <div className="mb-4 flex flex-wrap gap-2">
        {filters.map((f) => (
          <button
            key={f}
            onClick={() => setStatus(f)}
            className={`rounded-full px-3 py-1 text-sm capitalize ${f === status ? "bg-navy text-cream" : "bg-white text-navy hover:bg-cream-200"}`}
          >
            {f}
          </button>
        ))}
      </div>

      {!requests ? (
        <Loading error={error} />
      ) : shown.length === 0 ? (
        <p className="card text-muted">No requests here.</p>
      ) : (
        <ul className="space-y-3">
          {shown.map((r) => {
            const listed = r.items.reduce((s, i) => s + i.quantity * i.unitPrice, 0);
            return (
              <li key={r.id}>
                <Link href={`/admin/request/?id=${r.id}`} className="card flex flex-wrap items-center justify-between gap-3 p-4 hover:border-sun">
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className={`badge ${statusColors[r.status]}`}>{r.status}</span>
                      <span className="badge bg-cream-200 text-navy">{r.type === "booking" ? "Booking" : "Estimate"}</span>
                      <span className="text-sm text-muted">{r.createdAt.toLocaleString("en-US", { dateStyle: "medium", timeStyle: "short" })}</span>
                    </div>
                    <p className="mt-1 font-semibold text-navy">{r.name} · {prettyPhone(r.phone)}</p>
                    <p className="truncate text-sm text-muted">
                      {r.items.length ? r.items.map((i) => `${i.quantity}× ${i.materialName}`).join(", ") : r.details || "No details"}
                      {r.address ? ` · ${r.address}` : ""}
                    </p>
                  </div>
                  {listed > 0 && <p className="font-display text-xl text-forest">{money(listed)}</p>}
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </>
  );
}
