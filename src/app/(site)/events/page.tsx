import { Suspense } from "react";
import { PageHeader } from "@/components/PageHeader";
import { EventsView } from "./EventsView";

export const metadata = { title: "Events" };

export default function EventsPage() {
  return (
    <>
      <PageHeader title="Events" subtitle="Where you can find us, specials, and community events." />
      <Suspense>
        <EventsView />
      </Suspense>
    </>
  );
}
