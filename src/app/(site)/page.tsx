import Image from "next/image";
import Link from "next/link";
import { site } from "@/lib/site";
import { HomeEvents, HomePhotos, HomeRates, HomeReviews } from "./HomeSections";

export default function HomePage() {
  return (
    <>
      {/* Hero */}
      <section className="relative overflow-hidden bg-navy text-cream">
        <div
          className="pointer-events-none absolute inset-0 opacity-20"
          style={{ background: "radial-gradient(circle at 75% 30%, #c8843a 0, transparent 45%)" }}
        />
        <div className="container-page relative grid items-center gap-10 py-14 md:grid-cols-2 md:py-20">
          <div>
            <p className="font-display uppercase tracking-[0.25em] text-sun">{site.tagline}</p>
            <h1 className="mt-3 font-display text-5xl uppercase leading-[0.95] sm:text-6xl">
              Need a haul?<br />
              <span className="text-sun">We&apos;ve got you.</span>
            </h1>
            <p className="mt-5 max-w-md text-lg text-cream/80">
              Gravel, rock, mulch, soil, and sand dumped or tailgated wherever you need it. Plus hauling
              and transportation for just about anything else.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link href="/book/" className="btn-primary text-lg">Book Now</Link>
              <Link href="/estimate/" className="btn border-2 border-cream text-lg text-cream hover:bg-cream hover:text-navy">
                Get an Estimate
              </Link>
            </div>
            <p className="mt-6 text-cream/80">
              or Call / Text{" "}
              <a href={site.phoneHref} className="font-display text-xl tracking-wider text-cream hover:text-sun">
                {site.phone}
              </a>
            </p>
          </div>
          <div className="relative mx-auto w-full max-w-md">
            <Image
              src="/brand/logo-wide.webp"
              alt="Appalachian Assists logo: pickup truck towing a dump trailer through the mountains"
              width={1280}
              height={1062}
              priority
              className="drop-shadow-2xl"
            />
          </div>
        </div>
      </section>

      {/* Services */}
      <section className="container-page py-16">
        <h2 className="heading text-center text-3xl">What we do</h2>
        <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {site.services.map((s) => (
            <div key={s.title} className="card">
              <h3 className="heading text-lg">{s.title}</h3>
              <p className="mt-2 text-muted">{s.text}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Rates */}
      <section id="rates" className="bg-cream-200/60 py-16">
        <div className="container-page grid gap-10 lg:grid-cols-5">
          <div className="lg:col-span-2">
            <h2 className="heading text-3xl">Current delivery rates</h2>
            <p className="mt-3 text-muted">
              These are typical prices delivered, dumped or tailgated. The second load onward is usually less than the
              first. Location and bulk quantities can make prices vary. We always confirm before delivery.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Link href="/book/" className="btn-primary">Book a Delivery</Link>
              <Link href="/estimate/" className="btn-outline">Get a Custom Quote</Link>
            </div>
          </div>
          <div className="lg:col-span-3">
            <HomeRates />
          </div>
        </div>
      </section>

      <HomePhotos />
      <HomeReviews />

      {/* Events + contact */}
      <section className="container-page grid gap-10 py-16 lg:grid-cols-2">
        <HomeEvents />

        <div id="contact" className="card bg-forest text-white">
          <h2 className="font-display text-3xl uppercase tracking-wide">Get in touch</h2>
          <dl className="mt-6 space-y-4 text-lg">
            <div>
              <dt className="text-sm uppercase tracking-wider text-white/70">Call or text</dt>
              <dd><a href={site.phoneHref} className="font-display text-3xl tracking-wider hover:text-sun">{site.phone}</a></dd>
            </div>
            {site.email && (
              <div>
                <dt className="text-sm uppercase tracking-wider text-white/70">Email</dt>
                <dd><a href={`mailto:${site.email}`} className="hover:text-sun">{site.email}</a></dd>
              </div>
            )}
            <div>
              <dt className="text-sm uppercase tracking-wider text-white/70">Facebook</dt>
              <dd><a href={site.facebookUrl} target="_blank" rel="noopener" className="hover:text-sun">facebook.com/AppalachianAssists</a></dd>
            </div>
            <div>
              <dt className="text-sm uppercase tracking-wider text-white/70">Service area</dt>
              <dd>{site.serviceArea}</dd>
            </div>
            <div>
              <dt className="text-sm uppercase tracking-wider text-white/70">Hours</dt>
              <dd>{site.hours}</dd>
            </div>
          </dl>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link href="/book/" className="btn-primary">Book Now</Link>
            <Link href="/estimate/" className="btn border-2 border-white text-white hover:bg-white hover:text-forest">Get an Estimate</Link>
          </div>
        </div>
      </section>
    </>
  );
}
