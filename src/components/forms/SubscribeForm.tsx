"use client";

import { subscribe } from "@/lib/api";
import { isEmail, str } from "@/lib/format";
import { Honeypot, useSubmit } from "./Field";

export function SubscribeForm({ dark = false, withName = false }: { dark?: boolean; withName?: boolean }) {
  const { state, pending, onSubmit } = useSubmit(async (form) => {
    const email = str(form, "email");
    if (!isEmail(email)) return { ok: false, message: "Please enter a valid email address." };
    await subscribe(email, str(form, "name") || null);
    return { ok: true, message: "You're subscribed. Thanks for following along!" };
  });

  if (state?.ok) {
    return <p className={`font-semibold ${dark ? "text-sun" : "text-forest"}`}>{state.message}</p>;
  }

  return (
    <form onSubmit={onSubmit} className="relative space-y-2" noValidate>
      <Honeypot />
      {withName && <input name="name" placeholder="Your name (optional)" className="input" autoComplete="name" maxLength={120} />}
      <div className="flex gap-2">
        <input
          name="email"
          type="email"
          required
          maxLength={200}
          placeholder="you@email.com"
          aria-label="Email address"
          className={`input ${dark ? "border-navy-700" : ""}`}
          autoComplete="email"
        />
        <button className="btn-primary shrink-0" disabled={pending}>
          {pending ? "…" : "Subscribe"}
        </button>
      </div>
      {state && !state.ok && <p className="text-sm text-red-400">{state.message}</p>}
    </form>
  );
}
