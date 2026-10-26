import { PageHeader } from "@/components/PageHeader";
import { EstimateForm } from "@/components/forms/EstimateForm";
import { site } from "@/lib/site";

export const metadata = { title: "Get an Estimate" };

export default function EstimatePage() {
  return (
    <>
      <PageHeader
        title="Get an Estimate"
        subtitle="Leave your contact info and a little about the job. We'll get back to you with a price."
      />
      <div className="container-page grid gap-10 py-12 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <EstimateForm />
        </div>
        <aside className="space-y-4 text-muted">
          <div className="card">
            <p className="heading text-lg">Rather talk?</p>
            <p className="mt-2">Call or text us anytime.</p>
            <a href={site.phoneHref} className="mt-2 block font-display text-2xl tracking-wider text-navy hover:text-sun">
              {site.phone}
            </a>
          </div>
          <div className="card">
            <p className="heading text-lg">Know what you need?</p>
            <p className="mt-2">Skip the estimate and pick your materials directly.</p>
            <a href="/book" className="btn-primary btn-sm mt-3">Book Now</a>
          </div>
        </aside>
      </div>
    </>
  );
}
