"use client";

import Link from "next/link";
import { listInvoices } from "@/lib/adminApi";
import { invoiceTotal, money } from "@/lib/format";
import { useLoad } from "@/lib/useLoad";
import { AdminTitle, Loading } from "@/components/admin/Flash";
import { statusStyles } from "@/components/InvoiceView";

export default function InvoicesPage() {
  const { data: invoices, error } = useLoad(() => listInvoices());

  const list = invoices || [];
  const outstanding = list.filter((i) => i.status === "sent").reduce((s, i) => s + invoiceTotal(i.items), 0);
  const monthStart = new Date(new Date().getFullYear(), new Date().getMonth(), 1);
  const paidThisMonth = list
    .filter((i) => i.status === "paid" && i.paidAt && i.paidAt >= monthStart)
    .reduce((s, i) => s + invoiceTotal(i.items), 0);

  return (
    <>
      <AdminTitle action={<Link href="/admin/invoices/new/" className="btn-primary btn-sm">+ New Invoice</Link>}>Invoices</AdminTitle>

      <div className="mb-6 grid gap-4 sm:grid-cols-2">
        <div className="card">
          <p className="text-sm uppercase tracking-wider text-muted">Outstanding</p>
          <p className="font-display text-3xl text-sun-600">{money(outstanding)}</p>
        </div>
        <div className="card">
          <p className="text-sm uppercase tracking-wider text-muted">Paid this month</p>
          <p className="font-display text-3xl text-forest">{money(paidThisMonth)}</p>
        </div>
      </div>

      {!invoices ? (
        <Loading error={error} />
      ) : list.length === 0 ? (
        <p className="card text-muted">
          No invoices yet. Create one from a request, or click &ldquo;New Invoice&rdquo; for a custom order.
        </p>
      ) : (
        <div className="card overflow-x-auto p-0">
          <table className="w-full min-w-[36rem] text-left text-sm">
            <thead className="border-b border-cream-200 bg-cream/60 text-xs uppercase tracking-wider text-muted">
              <tr>
                <th className="px-4 py-3">Invoice</th>
                <th className="px-4 py-3">Customer</th>
                <th className="px-4 py-3">Date</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3 text-right">Total</th>
              </tr>
            </thead>
            <tbody>
              {list.map((inv) => (
                <tr key={inv.id} className="border-b border-cream-200 hover:bg-cream/40">
                  <td className="px-4 py-3"><Link href={`/admin/invoice/?id=${inv.id}`} className="font-semibold text-navy hover:text-sun-600">{inv.number}</Link></td>
                  <td className="px-4 py-3">{inv.customerName}</td>
                  <td className="px-4 py-3 text-muted">{inv.createdAt.toLocaleDateString("en-US", { dateStyle: "medium" })}</td>
                  <td className="px-4 py-3"><span className={`badge ${statusStyles[inv.status]}`}>{inv.status}</span></td>
                  <td className="px-4 py-3 text-right font-semibold">{money(invoiceTotal(inv.items))}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </>
  );
}
