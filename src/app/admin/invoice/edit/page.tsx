"use client";

import Link from "next/link";
import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { getInvoice, listMaterials } from "@/lib/api";
import { useLoad } from "@/lib/useLoad";
import { InvoiceEditor } from "@/components/admin/InvoiceEditor";
import { Loading } from "@/components/admin/Flash";

export default function EditInvoicePage() {
  return (
    <Suspense>
      <EditInvoice />
    </Suspense>
  );
}

function EditInvoice() {
  const id = useSearchParams().get("id") || "";
  const { data, error } = useLoad(async () => Promise.all([getInvoice(id), listMaterials()]), [id]);
  if (!data) return <Loading error={error} />;
  const [inv, materials] = data;
  if (!inv) return <Loading error="Invoice not found." />;
  if (inv.status !== "draft") return <Loading error="Only draft invoices can be edited." />;

  return (
    <>
      <Link href={`/admin/invoice/?id=${id}`} className="text-sm text-muted hover:text-navy">← Back</Link>
      <h1 className="heading mb-6 mt-2 text-3xl">Edit {inv.number}</h1>
      <InvoiceEditor
        materials={materials}
        initial={{
          id: inv.id,
          requestId: inv.requestId,
          customerName: inv.customerName,
          customerPhone: inv.customerPhone ?? "",
          customerEmail: inv.customerEmail ?? "",
          address: inv.address ?? "",
          notes: inv.notes ?? "",
          dueDate: inv.dueDate ?? "",
          payUrl: inv.payUrl ?? "",
          items: inv.items.map((i) => ({ description: i.description, quantity: i.quantity, price: (i.unitPrice / 100).toFixed(2) })),
        }}
      />
    </>
  );
}
