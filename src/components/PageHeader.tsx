export function PageHeader({ title, subtitle }: { title: string; subtitle?: React.ReactNode }) {
  return (
    <section className="bg-navy py-12 text-cream">
      <div className="container-page">
        <h1 className="font-display text-4xl uppercase tracking-wide sm:text-5xl">{title}</h1>
        {subtitle && <p className="mt-3 max-w-2xl text-lg text-cream/80">{subtitle}</p>}
      </div>
    </section>
  );
}
