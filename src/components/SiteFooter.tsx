import Link from "next/link";
import { site } from "@/lib/site";
import { SubscribeForm } from "./forms/SubscribeForm";

export function SiteFooter() {
  return (
    <footer className="mt-20 bg-navy text-cream">
      <div className="container-page grid gap-10 py-12 md:grid-cols-3">
        <div>
          <p className="font-display text-xl uppercase tracking-wider">
            Appalachian <span className="text-sun">Assists</span>
          </p>
          <p className="mt-1 text-sm text-cream/70">{site.tagline}</p>
          <p className="mt-4 text-sm text-cream/70">Est. {site.established} · Proudly Serving {site.serviceArea}</p>
        </div>
        <div className="space-y-2 text-sm">
          <p className="font-display uppercase tracking-wider text-sun">Contact</p>
          <p><a href={site.phoneHref} className="hover:text-sun">Call: {site.phone}</a></p>
          <p><a href={site.smsHref} className="hover:text-sun">Text: {site.phone}</a></p>
          {site.email && <p><a href={`mailto:${site.email}`} className="hover:text-sun">{site.email}</a></p>}
          <p>Facebook: <a href={site.facebookUrl} target="_blank" rel="noopener" className="underline underline-offset-2 hover:text-sun">/AppalachianAssists</a></p>
          <div className="flex flex-wrap gap-x-4 gap-y-1 pt-2 text-cream/70">
            <Link href="/book" className="hover:text-sun">Book Now</Link>
            <Link href="/estimate" className="hover:text-sun">Estimate</Link>
            <Link href="/gallery" className="hover:text-sun">Our Work</Link>
            <Link href="/reviews" className="hover:text-sun">Reviews</Link>
            <Link href="/events" className="hover:text-sun">Events</Link>
          </div>
        </div>
        <div>
          <p className="font-display uppercase tracking-wider text-sun">Get the newsletter</p>
          <p className="mb-3 mt-1 text-sm text-cream/70">Deals, availability, and upcoming events. No spam.</p>
          <SubscribeForm dark />
        </div>
      </div>
      <div className="border-t border-navy-700 py-4 text-center text-xs text-cream/50">
        © {new Date().getFullYear()} {site.name}
      </div>
    </footer>
  );
}
