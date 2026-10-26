"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { onAuthStateChanged, signInWithEmailAndPassword, signOut, type User } from "firebase/auth";
import { auth, firebaseConfigured } from "@/lib/firebase";
import { isOwner, navCounts } from "@/lib/adminApi";
import { siteUrl } from "@/lib/site";
import { AdminProvider, Flash } from "./Flash";

type AuthState = { status: "loading" } | { status: "out" } | { status: "notOwner"; user: User } | { status: "owner"; user: User };

export function AdminShell({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<AuthState>({ status: "loading" });

  useEffect(
    () =>
      onAuthStateChanged(auth, async (user) => {
        if (!user) return setState({ status: "out" });
        const owner = await isOwner(user.uid).catch(() => false);
        setState(owner ? { status: "owner", user } : { status: "notOwner", user });
      }),
    [],
  );

  if (state.status === "loading") {
    return <Centered><p className="text-muted">Loading…</p></Centered>;
  }
  if (state.status === "out") return <Login />;
  if (state.status === "notOwner") {
    return (
      <Centered>
        <h1 className="heading text-2xl">Almost there</h1>
        <p className="mt-3 text-left text-sm text-muted">
          You&apos;re signed in as <strong>{state.user.email}</strong>, but this account isn&apos;t set as the owner
          yet. In the Firebase console, open <strong>Firestore Database</strong>, create a collection named{" "}
          <code>admins</code>, and add a document whose ID is:
        </p>
        <input readOnly value={state.user.uid} className="input mt-3 text-center font-mono text-sm" onFocus={(e) => e.target.select()} />
        <p className="mt-3 text-left text-sm text-muted">(Give it any field, e.g. <code>name: owner</code>.) Then reload this page.</p>
        <button className="btn-outline btn-sm mt-4" onClick={() => signOut(auth)}>Sign out</button>
      </Centered>
    );
  }
  return <Panel>{children}</Panel>;
}

function Centered({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-navy p-4">
      <div className="card w-full max-w-sm text-center">
        <Image src="/brand/logo-round.webp" alt="" width={96} height={96} className="mx-auto mb-4" />
        {children}
      </div>
    </div>
  );
}

function Login() {
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);
  return (
    <Centered>
      <h1 className="heading text-2xl">Owner Login</h1>
      {!firebaseConfigured && (
        <p className="mt-3 rounded bg-sun/10 p-2 text-left text-xs">Firebase isn&apos;t configured yet. Fill in <code>.env.local</code> (see README).</p>
      )}
      <form
        className="mt-6 space-y-4 text-left"
        onSubmit={async (e) => {
          e.preventDefault();
          const f = new FormData(e.currentTarget);
          setPending(true);
          setError("");
          try {
            await signInWithEmailAndPassword(auth, String(f.get("email")), String(f.get("password")));
          } catch {
            setError("Wrong email or password.");
          } finally {
            setPending(false);
          }
        }}
      >
        <div>
          <label className="label" htmlFor="email">Email</label>
          <input id="email" name="email" type="email" className="input" autoComplete="username" required />
        </div>
        <div>
          <label className="label" htmlFor="password">Password</label>
          <input id="password" name="password" type="password" className="input" autoComplete="current-password" required />
        </div>
        {error && <p className="text-sm text-red-700">{error}</p>}
        <button className="btn-dark w-full" disabled={pending}>{pending ? "Checking…" : "Log in"}</button>
      </form>
    </Centered>
  );
}

function Panel({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [counts, setCounts] = useState({ newRequests: 0, pendingReviews: 0 });
  const refreshCounts = useCallback(() => {
    navCounts().then(setCounts).catch(console.error);
  }, []);
  useEffect(refreshCounts, [refreshCounts, pathname]);

  const nav = [
    { href: "/admin/", label: "Requests", count: counts.newRequests },
    { href: "/admin/invoices/", label: "Invoices" },
    { href: "/admin/photos/", label: "Photos" },
    { href: "/admin/reviews/", label: "Reviews", count: counts.pendingReviews },
    { href: "/admin/events/", label: "Events" },
    { href: "/admin/newsletter/", label: "Newsletter" },
    { href: "/admin/materials/", label: "Materials & Prices" },
  ];
  const active = (href: string) =>
    href === "/admin/" ? pathname === "/admin/" || pathname.startsWith("/admin/request") : pathname.startsWith(href.replace(/\/$/, "")) || (href === "/admin/invoices/" && pathname.startsWith("/admin/invoice"));

  return (
    <AdminProvider refreshCounts={refreshCounts} pathname={pathname}>
      <div className="min-h-screen bg-cream">
        <header className="bg-navy text-cream print:hidden">
          <div className="container-page flex flex-wrap items-center justify-between gap-3 py-3">
            <Link href="/admin/" className="font-display text-lg uppercase tracking-wider">
              Appalachian <span className="text-sun">Assists</span> <span className="text-cream/60">· Owner</span>
            </Link>
            <div className="flex items-center gap-4 text-sm">
              <a href={siteUrl("/")} target="_blank" rel="noopener" className="hover:text-sun">View site ↗</a>
              <button className="hover:text-sun" onClick={() => signOut(auth)}>Log out</button>
            </div>
          </div>
          <nav className="container-page flex gap-1 overflow-x-auto pb-2">
            {nav.map((n) => (
              <Link
                key={n.href}
                href={n.href}
                className={`flex shrink-0 items-center gap-2 rounded-lg px-3 py-2 font-display text-sm uppercase tracking-wider hover:bg-navy-700 ${active(n.href) ? "bg-navy-700 text-sun" : ""}`}
              >
                {n.label}
                {n.count ? <span className="rounded-full bg-sun px-2 text-xs text-white">{n.count}</span> : null}
              </Link>
            ))}
          </nav>
        </header>
        <main className="container-page py-8">
          <Flash />
          {children}
        </main>
      </div>
    </AdminProvider>
  );
}
