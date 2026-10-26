"use client";

import Link from "next/link";
import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { getInvoice } from "@/lib/api";
import { deleteInvoice, markInvoicePaid, markInvoiceSent, voidInvoice } from "@/lib/adminApi";
import type { Invoice } from "@/lib/data";
import { emailConfigured, emailCustomer } from "@/lib/notify";
import { invoiceTotal, money, toE164 } from "@/lib/format";
import { site, siteUrl } from "@/lib/site";
import { useLoad } from "@/lib/useLoad";
import { InvoiceView } from "@/components/InvoiceView";
import { PrintButton } from "@/components/PrintButton";
import { Loading, useAdmin } from "@/components/admin/Flash";

export default function InvoicePage() {
  return (
    <Suspense>
      <InvoiceDetail />
    </Suspense>
  );
}

function message(inv: Invoice, link: string) {
  const total = money(invoiceTotal(inv.items));
  return (
    `Hi ${inv.customerName.split(" ")[0]}, here's your invoice ${inv.number} from ${site.name} for ${total}: ${link}` +
    (inv.payUrl ? `\nPay online: ${inv.payUrl}` : "") +
    `\nQuestions? Call/text ${site.phone}`
  );
}

function InvoiceDetail() {
  const id = useSearchParams().get("id") || "";
  const router = useRouter();
  const { run, busy } = useAdmin();
  const { data: inv, error, loading, reload } = useLoad(() => getInvoice(id), [id]);
  const [method, setMethod] = useState("cash");

  if (!inv) return <Loading error={loading ? null : error || "Invoice not found."} />;

  const link = siteUrl(`/invoice/?t=${inv.id}`);
  const open = inv.status === "draft" || inv.status === "sent";
  const tel = toE164(inv.customerPhone);
  // Opens the Messages app on your phone with the text filled in (free).
  const smsHref = tel ? `sms:${tel}?&body=${encodeURIComponent(message(inv, link))}` : "";

  const ensureSent = async () => {
    if (inv.status === "draft") await markInvoiceSent(inv);
  };

  return (
    <>
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3 print:hidden">
        <Link href={inv.requestId ? `/admin/request/?id=${inv.requestId}` : "/admin/invoices/"} className="text-sm text-muted hover:text-navy">
          ← {inv.requestId ? "Back to request" : "Invoices"}
        </Link>
        <div className="flex gap-2">
          {inv.status === "draft" && <Link href={`/admin/invoice/edit/?id=${inv.id}`} className="btn-outline btn-sm">Edit</Link>}
          <PrintButton label="Print" className="btn-outline btn-sm" />
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <InvoiceView invoice={inv} />
        </div>

        <aside className="space-y-6 print:hidden">
          {open && (
            <div className="card space-y-3">
              <h2 className="heading text-lg">{inv.status === "draft" ? "Send invoice" : "Resend invoice"}</h2>
              {tel ? (
                <a
                  href={smsHref}
                  className="btn-primary w-full"
                  onClick={() => run(async () => { await ensureSent(); await reload(); })}
                >
                  Text to {inv.customerPhone}
                </a>
              ) : (
                <p className="text-sm text-muted">No phone number on this invoice.</p>
              )}
              <p className="text-xs text-muted">Opens your phone&apos;s Messages app with the invoice link filled in. Just hit send.</p>

              {inv.customerEmail && (
                <button
                  className="btn-dark w-full"
                  disabled={busy || !emailConfigured}
                  onClick={() =>
                    run(async () => {
                      const r = await emailCustomer(inv.customerEmail!, inv.customerName, `Invoice ${inv.number} from ${site.name} (${money(invoiceTotal(inv.items))})`, message(inv, link));
                      if (!r.ok) throw new Error(`Email failed: ${r.error}`);
                      await ensureSent();
                      await reload();
                    }, `Emailed to ${inv.customerEmail} ✓`)
                  }
                >
                  Email to {inv.customerEmail}
                </button>
              )}
              {inv.customerEmail && !emailConfigured && <p className="text-xs text-muted">Email isn&apos;t set up (EmailJS keys missing).</p>}

              <button
                className="btn-outline btn-sm w-full"
                onClick={() =>
                  run(async () => {
                    await ensureSent();
                    await navigator.clipboard.writeText(link).catch(() => {});
                    await reload();
                  }, "Link copied. Paste it anywhere (Messenger, etc.).")
                }
              >
                Copy invoice link
              </button>
            </div>
          )}

          {inv.status !== "draft" && (
            <div className="card space-y-2">
              <h2 className="heading text-lg">Customer link</h2>
              <input readOnly value={link} className="input text-xs" onFocus={(e) => e.target.select()} />
              <a href={link} target="_blank" rel="noopener" className="text-sm text-sun-600 underline">Open customer view ↗</a>
            </div>
          )}

          {inv.status === "sent" && (
            <div className="card space-y-3">
              <h2 className="heading text-lg">Record payment</h2>
              <select className="input" value={method} onChange={(e) => setMethod(e.target.value)}>
                <option value="cash">Cash</option>
                <option value="check">Check</option>
                <option value="card">Card</option>
                <option value="Venmo/Cash App/Zelle">Venmo / Cash App / Zelle</option>
                <option value="other">Other</option>
              </select>
              <button className="btn-green w-full" disabled={busy} onClick={() => run(async () => { await markInvoicePaid(inv, method); await reload(); }, "Marked as paid.")}>
                Mark as Paid
              </button>
            </div>
          )}

          {inv.status === "paid" && (
            <div className="card">
              <p className="heading text-lg text-forest">Paid ✓</p>
              <p className="text-sm text-muted">
                {inv.paidAt?.toLocaleDateString("en-US", { dateStyle: "medium" })} · {inv.paidMethod}
              </p>
            </div>
          )}

          {inv.status === "draft" && (
            <div className="text-center">
              <button
                className="text-sm text-red-700 hover:underline"
                onClick={() => {
                  if (!confirm("Delete this draft?")) return;
                  run(async () => { await deleteInvoice(inv.id); router.push("/admin/invoices/"); }, "Draft deleted.");
                }}
              >
                Delete draft
              </button>
            </div>
          )}
          {inv.status === "sent" && (
            <div className="text-center">
              <button
                className="text-sm text-red-700 hover:underline"
                onClick={() => {
                  if (!confirm("Void this invoice? The customer link will stop working.")) return;
                  run(async () => { await voidInvoice(inv.id); await reload(); }, "Invoice voided.");
                }}
              >
                Void this invoice
              </button>
            </div>
          )}
          {!open && inv.status === "void" && <p className="text-center text-sm text-muted">This invoice was voided.</p>}
        </aside>
      </div>
    </>
  );
}
