"use client";

import { useSearchParams } from "next/navigation";
import { getInvoice } from "@/lib/api";
import { site } from "@/lib/site";
import { useLoad } from "@/lib/useLoad";
import { InvoiceView } from "@/components/InvoiceView";
import { PrintButton } from "@/components/PrintButton";

export function CustomerInvoice() {
  const token = useSearchParams().get("t") || "";
  const { data: invoice, loading } = useLoad(
    () => (token ? getInvoice(token).catch(() => null) : Promise.resolve(null)),
    [token],
  );

  if (loading) return <p className="card text-muted">Loading invoice…</p>;
  if (!invoice || invoice.status === "draft") {
    return (
      <div className="card text-center">
        <p className="heading text-xl">Invoice not found</p>
        <p className="mt-2 text-muted">
          Check the link, or call/text <a href={site.phoneHref} className="font-semibold text-navy">{site.phone}</a>.
        </p>
      </div>
    );
  }

  return (
    <>
      <InvoiceView invoice={invoice} />
      <div className="mt-6 flex flex-wrap items-center justify-center gap-3 print:hidden">
        {invoice.status === "sent" && invoice.payUrl && (
          <a href={invoice.payUrl} target="_blank" rel="noopener" className="btn-primary text-lg">Pay Online</a>
        )}
        <PrintButton />
      </div>
      {invoice.status === "sent" && (
        <p className="mt-4 text-center text-sm text-muted print:hidden">
          {invoice.payUrl ? "Or pay" : "Pay"} by cash or check at delivery. Questions? Call or text{" "}
          <a href={site.phoneHref} className="font-semibold text-navy">{site.phone}</a>.
        </p>
      )}
      {invoice.status === "paid" && <p className="mt-4 text-center font-semibold text-forest">Paid. Thank you!</p>}
    </>
  );
}
