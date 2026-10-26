"use client";

import { useState } from "react";

export type FormState = { ok: boolean; message: string; errors?: Record<string, string> } | null;

/** Wire a form's onSubmit to an async handler with pending + result state. */
export function useSubmit(handler: (form: FormData) => Promise<FormState>) {
  const [state, setState] = useState<FormState>(null);
  const [pending, setPending] = useState(false);
  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    // Bots fill the hidden "company" field; people never see it.
    if (String(form.get("company") || "")) return setState({ ok: true, message: "Thanks!" });
    setPending(true);
    try {
      setState(await handler(form));
    } catch (err) {
      console.error(err);
      setState({ ok: false, message: "Sorry, something went wrong. Please try again or call us." });
    } finally {
      setPending(false);
    }
  }
  return { state, pending, onSubmit };
}

export function invalid(errors: Record<string, string>): FormState {
  return { ok: false, message: "Please fix the highlighted fields.", errors };
}

export function FieldError({ state, name }: { state: FormState; name: string }) {
  const msg = state?.errors?.[name];
  return msg ? <p className="mt-1 text-sm text-red-700">{msg}</p> : null;
}

export function FormMessage({ state }: { state: FormState }) {
  if (!state) return null;
  return (
    <p
      role="status"
      className={`rounded-lg px-4 py-3 text-sm font-semibold ${
        state.ok ? "bg-forest/10 text-forest" : "bg-red-50 text-red-800"
      }`}
    >
      {state.message}
    </p>
  );
}

/** Hidden field that only bots fill in. */
export function Honeypot() {
  return (
    <div aria-hidden="true" className="absolute -left-[9999px] h-0 w-0 overflow-hidden">
      <label>
        Company
        <input type="text" name="company" tabIndex={-1} autoComplete="off" />
      </label>
    </div>
  );
}

export function ContactFields({ state, emailHint }: { state: FormState; emailHint?: string }) {
  return (
    <div className="grid gap-4 sm:grid-cols-2">
      <div className="sm:col-span-2">
        <label className="label" htmlFor="name">Name *</label>
        <input id="name" name="name" className="input" autoComplete="name" maxLength={120} required />
        <FieldError state={state} name="name" />
      </div>
      <div>
        <label className="label" htmlFor="phone">Phone *</label>
        <input id="phone" name="phone" type="tel" className="input" autoComplete="tel" placeholder="(304) 555-1234" maxLength={30} required />
        <FieldError state={state} name="phone" />
      </div>
      <div>
        <label className="label" htmlFor="email">Email</label>
        <input id="email" name="email" type="email" className="input" autoComplete="email" maxLength={200} />
        {emailHint && <p className="mt-1 text-xs text-muted">{emailHint}</p>}
        <FieldError state={state} name="email" />
      </div>
    </div>
  );
}

export function SubscribeCheckbox() {
  return (
    <label className="flex items-start gap-2 text-sm text-muted">
      <input type="checkbox" name="subscribe" className="mt-1 h-4 w-4 accent-sun" />
      Email me about deals and upcoming events (needs an email above).
    </label>
  );
}
