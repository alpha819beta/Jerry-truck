import Image from "next/image";
import { invoiceTotal, money, prettyDate } from "@/lib/format";
import { site } from "@/lib/site";

type Inv = {
  number: string;
  customerName: string;
  customerPhone: string | null;
  customerEmail: string | null;
  address: string | null;
  notes: string | null;
  dueDate: string | null;
  status: string;
  createdAt: Date;
  paidAt: Date | null;
  items: { description: string; quantity: number; unitPrice: number }[];
};

export const statusStyles: Record<string, string> = {
  draft: "bg-stone/15 text-stone",
  sent: "bg-sun/15 text-sun-600",
  paid: "bg-forest/15 text-forest",
  void: "bg-red-100 text-red-800",
};

/** The printable invoice, shared by the customer page and the admin preview. */
export function InvoiceView({ invoice }: { invoice: Inv }) {
  const total = invoiceTotal(invoice.items);
  return (
    <div className="card p-6 sm:p-10 print:border-0 print:shadow-none">
      <div className="flex flex-wrap items-start justify-between gap-6">
        <div className="flex items-center gap-4">
          <Image src="/brand/logo-round.webp" alt="" width={72} height={72} />
          <div>
            <p className="heading text-2xl">{site.name}</p>
            <p className="text-sm text-muted">{site.tagline}</p>
            <p className="text-sm text-muted">{site.phone}{site.email ? ` · ${site.email}` : ""}</p>
          </div>
        </div>
        <div className="text-right">
          <p className="heading text-3xl">Invoice</p>
          <p className="font-semibold text-navy">{invoice.number}</p>
          <span className={`badge mt-2 ${statusStyles[invoice.status]}`}>{invoice.status === "sent" ? "Due" : invoice.status}</span>
        </div>
      </div>

      <div className="mt-8 grid gap-6 sm:grid-cols-2">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-muted">Bill to</p>
          <p className="mt-1 font-semibold text-navy">{invoice.customerName}</p>
          {invoice.address && <p className="whitespace-pre-line text-sm">{invoice.address}</p>}
          {invoice.customerPhone && <p className="text-sm">{invoice.customerPhone}</p>}
          {invoice.customerEmail && <p className="text-sm">{invoice.customerEmail}</p>}
        </div>
        <div className="text-sm sm:text-right">
          <p><span className="text-muted">Issued:</span> {invoice.createdAt.toLocaleDateString("en-US", { dateStyle: "medium" })}</p>
          {invoice.dueDate && <p><span className="text-muted">Due:</span> {prettyDate(invoice.dueDate, { dateStyle: "medium" })}</p>}
          {invoice.paidAt && <p><span className="text-muted">Paid:</span> {invoice.paidAt.toLocaleDateString("en-US", { dateStyle: "medium" })}</p>}
        </div>
      </div>

      <div className="mt-8 overflow-x-auto">
        <table className="w-full min-w-[28rem] text-left text-sm">
          <thead>
            <tr className="border-b-2 border-navy text-xs uppercase tracking-wider text-muted">
              <th className="py-2">Description</th>
              <th className="py-2 text-right">Qty</th>
              <th className="py-2 text-right">Price</th>
              <th className="py-2 text-right">Amount</th>
            </tr>
          </thead>
          <tbody>
            {invoice.items.map((i, idx) => (
              <tr key={idx} className="border-b border-cream-200">
                <td className="py-3 pr-2">{i.description}</td>
                <td className="py-3 text-right">{i.quantity}</td>
                <td className="py-3 text-right">{money(i.unitPrice)}</td>
                <td className="py-3 text-right font-semibold">{money(i.quantity * i.unitPrice)}</td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr>
              <td colSpan={3} className="pt-4 text-right font-display text-lg uppercase tracking-wider text-navy">Total</td>
              <td className="pt-4 text-right font-display text-2xl text-navy">{money(total)}</td>
            </tr>
          </tfoot>
        </table>
      </div>

      {invoice.notes && (
        <div className="mt-8 rounded-lg bg-cream/60 p-4 text-sm">
          <p className="font-semibold text-navy">Notes</p>
          <p className="mt-1 whitespace-pre-line">{invoice.notes}</p>
        </div>
      )}
      <p className="mt-8 text-center text-sm text-muted">Thank you for your business!</p>
    </div>
  );
}
