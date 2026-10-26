"use client";

import Link from "next/link";
import { Suspense, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { deleteRequest, getRequest, listInvoices, updateRequest } from "@/lib/adminApi";
import { invoiceTotal, money, prettyDate, prettyPhone, toE164 } from "@/lib/format";
import { useLoad } from "@/lib/useLoad";
import { Loading, statusColors, useAdmin } from "@/components/admin/Flash";
import { statusStyles } from "@/components/InvoiceView";

const statuses = ["new", "reviewed", "invoiced", "scheduled", "completed", "cancelled"];

export default function RequestPage() {
  return (
    <Suspense>
      <RequestDetail />
    </Suspense>
  );
}

function RequestDetail() {
  const id = useSearchParams().get("id") || "";
  const router = useRouter();
  const { run, busy } = useAdmin();
  const { data: req, error, loading, setData } = useLoad(() => getRequest(id), [id]);
  const { data: invoices } = useLoad(() => listInvoices(id), [id]);

  // Opening a new request marks it as reviewed.
  useEffect(() => {
    if (req?.status === "new") {
      updateRequest(req.id, { status: "reviewed" }).then(() => setData({ ...req, status: "reviewed" }));
    }
  }, [req, setData]);

  if (!req) return <Loading error={loading ? null : error || "Request not found."} />;

  const listed = req.items.reduce((s, i) => s + i.quantity * i.unitPrice, 0);
  const tel = toE164(req.phone);

  return (
    <>
      <Link href="/admin/" className="text-sm text-muted hover:text-navy">← All requests</Link>
      <div className="mt-2 flex flex-wrap items-center gap-3">
        <h1 className="heading text-3xl">{req.type === "booking" ? "Booking" : "Estimate"} from {req.name}</h1>
        <span className={`badge ${statusColors[req.status]}`}>{req.status}</span>
      </div>
      <p className="text-sm text-muted">Received {req.createdAt.toLocaleString("en-US", { dateStyle: "full", timeStyle: "short" })}</p>

      <div className="mt-6 grid gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <section className="card">
            <h2 className="heading text-lg">Customer</h2>
            <dl className="mt-3 grid gap-3 sm:grid-cols-2">
              <div><dt className="text-xs uppercase text-muted">Name</dt><dd className="font-semibold">{req.name}</dd></div>
              <div><dt className="text-xs uppercase text-muted">Phone</dt><dd className="font-semibold">{prettyPhone(req.phone)}</dd></div>
              {req.email && <div><dt className="text-xs uppercase text-muted">Email</dt><dd><a href={`mailto:${req.email}`} className="text-sun-600 underline">{req.email}</a></dd></div>}
              {req.address && (
                <div>
                  <dt className="text-xs uppercase text-muted">Address</dt>
                  <dd>
                    {req.address}{" "}
                    <a href={`https://maps.google.com/?q=${encodeURIComponent(req.address)}`} target="_blank" rel="noopener" className="text-sm text-sun-600 underline">Map ↗</a>
                  </dd>
                </div>
              )}
              {req.preferredDate && <div><dt className="text-xs uppercase text-muted">Preferred date</dt><dd>{prettyDate(req.preferredDate)}</dd></div>}
            </dl>
            {tel && (
              <div className="mt-4 flex gap-2">
                <a href={`tel:${tel}`} className="btn-dark btn-sm">Call</a>
                <a href={`sms:${tel}`} className="btn-outline btn-sm">Text</a>
              </div>
            )}
          </section>

          {req.items.length > 0 && (
            <section className="card">
              <h2 className="heading text-lg">Materials requested</h2>
              <table className="mt-3 w-full text-sm">
                <tbody>
                  {req.items.map((i, idx) => (
                    <tr key={idx} className="border-b border-cream-200">
                      <td className="py-2">{i.quantity} × {i.materialName} <span className="text-muted">({i.unit})</span></td>
                      <td className="py-2 text-right">{money(i.unitPrice * i.quantity)}</td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr><td className="pt-3 font-semibold">Listed total</td><td className="pt-3 text-right font-display text-xl text-forest">{money(listed)}</td></tr>
                </tfoot>
              </table>
            </section>
          )}

          {req.details && (
            <section className="card">
              <h2 className="heading text-lg">Customer notes</h2>
              <p className="mt-2 whitespace-pre-line">{req.details}</p>
            </section>
          )}

          <section className="card">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <h2 className="heading text-lg">Invoices</h2>
              <Link href={`/admin/invoices/new/?request=${req.id}`} className="btn-primary btn-sm">+ Create Invoice</Link>
            </div>
            {invoices?.length ? (
              <ul className="mt-3 divide-y divide-cream-200">
                {invoices.map((inv) => (
                  <li key={inv.id}>
                    <Link href={`/admin/invoice/?id=${inv.id}`} className="flex items-center justify-between py-2 hover:text-sun-600">
                      <span>{inv.number} <span className={`badge ml-2 ${statusStyles[inv.status]}`}>{inv.status}</span></span>
                      <span className="font-semibold">{money(invoiceTotal(inv.items))}</span>
                    </Link>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="mt-2 text-sm text-muted">
                No invoice yet. Create one to confirm the price. You can add delivery, distance or other fees.
              </p>
            )}
          </section>
        </div>

        <aside className="space-y-6">
          <form
            className="card space-y-4"
            onSubmit={(e) => {
              e.preventDefault();
              const f = new FormData(e.currentTarget);
              const data = { status: String(f.get("status")), ownerNotes: String(f.get("ownerNotes") || "").trim() || null };
              run(async () => {
                await updateRequest(req.id, data);
                setData({ ...req, ...data });
              }, "Saved.");
            }}
          >
            <div>
              <label className="label" htmlFor="status">Status</label>
              <select id="status" name="status" defaultValue={req.status === "new" ? "reviewed" : req.status} key={req.status} className="input capitalize">
                {statuses.map((s) => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
            <div>
              <label className="label" htmlFor="ownerNotes">Private notes</label>
              <textarea id="ownerNotes" name="ownerNotes" rows={5} defaultValue={req.ownerNotes || ""} className="input" placeholder="Only you can see these." />
            </div>
            <button className="btn-dark w-full" disabled={busy}>Save</button>
          </form>
          <div className="text-center">
            <button
              className="text-sm text-red-700 hover:underline"
              onClick={() => {
                if (!confirm("Delete this request?")) return;
                run(async () => {
                  await deleteRequest(req.id);
                  router.push("/admin/");
                }, "Request deleted.");
              }}
            >
              Delete this request
            </button>
          </div>
        </aside>
      </div>
    </>
  );
}
