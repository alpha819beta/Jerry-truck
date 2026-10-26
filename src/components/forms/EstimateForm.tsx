"use client";

import { submitRequest } from "@/lib/api";
import { str } from "@/lib/format";
import { ContactFields, FieldError, FormMessage, Honeypot, SubscribeCheckbox, invalid, useSubmit } from "./Field";
import { contactFields, maybeSubscribe } from "./contact";

export function EstimateForm() {
  const { state, pending, onSubmit } = useSubmit(async (form) => {
    const { name, phone, email, errors } = contactFields(form);
    if (Object.keys(errors).length) return invalid(errors);
    await submitRequest({
      type: "estimate",
      name,
      phone,
      email: email || null,
      address: str(form, "address") || null,
      details: str(form, "details") || null,
      preferredDate: null,
      items: [],
    });
    await maybeSubscribe(form, email, name);
    return { ok: true, message: "Got it! We'll reach out shortly with your estimate." };
  });

  if (state?.ok) {
    return (
      <div className="card text-center">
        <p className="heading text-2xl">Request sent!</p>
        <p className="mt-2 text-muted">{state.message}</p>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} className="card relative space-y-5" noValidate>
      <Honeypot />
      <ContactFields state={state} />
      <div>
        <label className="label" htmlFor="address">Job location (town or address)</label>
        <input id="address" name="address" className="input" autoComplete="street-address" maxLength={300} />
      </div>
      <div>
        <label className="label" htmlFor="details">What do you need?</label>
        <textarea
          id="details"
          name="details"
          rows={4}
          maxLength={3000}
          className="input"
          placeholder="E.g. 2 loads of #57 gravel for a driveway, about 80 ft long…"
        />
        <FieldError state={state} name="details" />
      </div>
      <SubscribeCheckbox />
      <FormMessage state={state} />
      <button className="btn-primary w-full sm:w-auto" disabled={pending}>
        {pending ? "Sending…" : "Request Estimate"}
      </button>
    </form>
  );
}
