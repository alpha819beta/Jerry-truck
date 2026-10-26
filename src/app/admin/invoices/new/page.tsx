"use client";

import Link from "next/link";
import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { getRequest } from "@/lib/adminApi";
import { listMaterials } from "@/lib/api";
import { useLoad } from "@/lib/useLoad";
import { InvoiceEditor } from "@/components/admin/InvoiceEditor";
import { Loading } from "@/components/admin/Flash";

export default function NewInvoicePage() {
  return (
    <Suspense>
      <NewInvoice />
    </Suspense>
  );
}

function plusDays(n: number) {
  const d = new Date(Date.now() + n * 86_400_000);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

function NewInvoice() {
  const requestId = useSearchParams().get("request");
  const { data, error } = useLoad(
    async () => Promise.all([requestId ? getRequest(requestId) : null, listMaterials()]),
    [requestId],
  );
  if (!data) return <Loading error={error} />;
  const [req, materials] = data;

  return (
    <>
      <Link href={req ? `/admin/request/?id=${req.id}` : "/admin/invoices/"} className="text-sm text-muted hover:text-navy">← Back</Link>
      <h1 className="heading mb-6 mt-2 text-3xl">{req ? `Invoice for ${req.name}` : "New custom invoice"}</h1>
      <InvoiceEditor
        materials={materials}
        initial={{
          requestId: req?.id ?? null,
          customerName: req?.name ?? "",
          customerPhone: req?.phone ?? "",
          customerEmail: req?.email ?? "",
          address: req?.address ?? "",
          notes: "",
          dueDate: plusDays(7),
          payUrl: "",
          items: (req?.items ?? []).map((i) => ({
            description: `${i.materialName} (${i.unit}), delivered`,
            quantity: i.quantity,
            price: (i.unitPrice / 100).toFixed(2),
          })),
        }}
      />
    </>
  );
}
