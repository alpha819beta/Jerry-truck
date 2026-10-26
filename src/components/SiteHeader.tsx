import Image from "next/image";
import Link from "next/link";
import { site } from "@/lib/site";

const links = [
  { href: "/", label: "Home" },
  { href: "/gallery", label: "Our Work" },
  { href: "/reviews", label: "Reviews" },
  { href: "/events", label: "Events" },
  { href: "/newsletter", label: "Newsletter" },
];

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-40 border-b border-navy-700 bg-navy text-cream">
      <div className="container-page flex h-16 items-center justify-between gap-4">
        <Link href="/" className="flex items-center gap-3">
          <Image src="/brand/logo-round.webp" alt="" width={44} height={44} className="rounded-full" priority />
          <span className="font-display text-lg uppercase leading-tight tracking-wider">
            Appalachian <span className="text-sun">Assists</span>
          </span>
        </Link>

        <nav className="hidden items-center gap-6 lg:flex">
          {links.map((l) => (
            <Link key={l.href} href={l.href} className="font-display text-sm uppercase tracking-wider hover:text-sun">
              {l.label}
            </Link>
          ))}
          <Link href="/book" className="btn-primary btn-sm">
            Book Now
          </Link>
        </nav>

        <details className="group relative lg:hidden">
          <summary className="flex cursor-pointer list-none items-center rounded-md p-2 hover:bg-navy-700" aria-label="Menu">
            <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M4 7h16M4 12h16M4 17h16" />
            </svg>
          </summary>
          <div className="absolute right-0 mt-2 w-56 rounded-xl bg-navy p-3 shadow-xl ring-1 ring-navy-700">
            {links.map((l) => (
              <Link key={l.href} href={l.href} className="block rounded-md px-3 py-2 font-display uppercase tracking-wider hover:bg-navy-700">
                {l.label}
              </Link>
            ))}
            <Link href="/book" className="btn-primary mt-2 w-full">Book Now</Link>
            <Link href="/estimate" className="btn mt-2 w-full border-2 border-cream/60 text-cream">Get an Estimate</Link>
            <a href={site.phoneHref} className="mt-3 block text-center text-sm text-cream/80">Call {site.phone}</a>
          </div>
        </details>
      </div>
    </header>
  );
}
