"use client";

import { createContext, useCallback, useContext, useEffect, useState } from "react";

export const statusColors: Record<string, string> = {
  new: "bg-sun text-white",
  reviewed: "bg-navy/10 text-navy",
  invoiced: "bg-sun/15 text-sun-600",
  scheduled: "bg-forest/15 text-forest",
  completed: "bg-forest text-white",
  cancelled: "bg-stone/15 text-stone",
};

type Msg = { text: string; bad: boolean; at: number } | null;
type Ctx = {
  msg: Msg;
  flash: (text: string, bad?: boolean) => void;
  busy: boolean;
  /** Run an admin action: shows a busy state, a success message, or the error. */
  run: (fn: () => Promise<unknown>, success?: string) => Promise<boolean>;
  refreshCounts: () => void;
};

const AdminCtx = createContext<Ctx | null>(null);

export function AdminProvider({
  children,
  refreshCounts,
  pathname,
}: {
  children: React.ReactNode;
  refreshCounts: () => void;
  pathname: string;
}) {
  const [msg, setMsg] = useState<Msg>(null);
  const [busy, setBusy] = useState(false);

  // Clear old messages when moving between pages (but keep one set just before navigating).
  useEffect(() => {
    setMsg((m) => (m && Date.now() - m.at < 2000 ? m : null));
  }, [pathname]);

  const flash = useCallback((text: string, bad = false) => {
    setMsg({ text, bad, at: Date.now() });
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

  const run = useCallback(
    async (fn: () => Promise<unknown>, success?: string) => {
      setBusy(true);
      try {
        await fn();
        if (success) flash(success);
        refreshCounts();
        return true;
      } catch (e) {
        console.error(e);
        flash(e instanceof Error ? e.message : "Something went wrong.", true);
        return false;
      } finally {
        setBusy(false);
      }
    },
    [flash, refreshCounts],
  );

  return <AdminCtx.Provider value={{ msg, flash, busy, run, refreshCounts }}>{children}</AdminCtx.Provider>;
}

export function useAdmin() {
  const ctx = useContext(AdminCtx);
  if (!ctx) throw new Error("useAdmin must be used inside AdminProvider");
  return ctx;
}

export function Flash() {
  const { msg } = useAdmin();
  if (!msg) return null;
  return (
    <p
      role="status"
      className={`mb-6 rounded-lg px-4 py-3 font-semibold print:hidden ${msg.bad ? "bg-red-50 text-red-800" : "bg-forest/10 text-forest"}`}
    >
      {msg.text}
    </p>
  );
}

export function AdminTitle({ children, action }: { children: React.ReactNode; action?: React.ReactNode }) {
  return (
    <div className="mb-6 flex flex-wrap items-center justify-between gap-3 print:hidden">
      <h1 className="heading text-3xl">{children}</h1>
      {action}
    </div>
  );
}

export function ConfigNotice({ show, children }: { show: boolean; children: React.ReactNode }) {
  if (!show) return null;
  return (
    <div className="mb-6 rounded-lg border border-sun/40 bg-sun/10 px-4 py-3 text-sm text-ink print:hidden">
      ⚙️ {children}
    </div>
  );
}

export function Loading({ error }: { error?: string | null }) {
  return <p className={`card ${error ? "text-red-700" : "text-muted"}`}>{error || "Loading…"}</p>;
}
