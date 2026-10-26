import { Suspense } from "react";
import { PageHeader } from "@/components/PageHeader";
import { Unsubscribe } from "./Unsubscribe";

export const metadata = { title: "Unsubscribe", robots: { index: false } };

export default function UnsubscribePage() {
  return (
    <>
      <PageHeader title="Unsubscribe" />
      <div className="container-page max-w-xl py-12">
        <Suspense>
          <Unsubscribe />
        </Suspense>
      </div>
    </>
  );
}
