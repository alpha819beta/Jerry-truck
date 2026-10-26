import { PageHeader } from "@/components/PageHeader";
import { SubscribeForm } from "@/components/forms/SubscribeForm";

export const metadata = { title: "Newsletter" };

export default function NewsletterPage() {
  return (
    <>
      <PageHeader
        title="Newsletter"
        subtitle="Seasonal specials, delivery availability and upcoming events, straight to your inbox."
      />
      <div className="container-page max-w-xl py-12">
        <div className="card">
          <h2 className="heading text-xl">Subscribe</h2>
          <p className="mb-4 mt-1 text-muted">Unsubscribe anytime with one click.</p>
          <SubscribeForm withName />
        </div>
      </div>
    </>
  );
}
