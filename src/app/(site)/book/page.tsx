import { PageHeader } from "@/components/PageHeader";
import { BookingForm } from "@/components/forms/BookingForm";

export const metadata = { title: "Book Now" };

export default function BookPage() {
  return (
    <>
      <PageHeader
        title="Book a Delivery"
        subtitle="Pick your materials, tell us where it's going, and we'll text you to confirm the final price and delivery time."
      />
      <div className="container-page max-w-3xl py-12">
        <BookingForm />
      </div>
    </>
  );
}
