import { Suspense } from "react";
import { CustomerInvoice } from "./CustomerInvoice";

export const metadata = { title: "Invoice", robots: { index: false } };

export default function InvoicePage() {
  return (
    <div className="container-page max-w-3xl py-8">
      <Suspense>
        <CustomerInvoice />
      </Suspense>
    </div>
  );
}
