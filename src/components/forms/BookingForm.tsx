"use client";

import { useState } from "react";
import { listMaterials, submitRequest } from "@/lib/api";
import { money, str, todayYmd } from "@/lib/format";
import { useLoad } from "@/lib/useLoad";
import { ContactFields, FieldError, FormMessage, Honeypot, SubscribeCheckbox, invalid, useSubmit } from "./Field";
import { contactFields, maybeSubscribe } from "./contact";

export function BookingForm() {
  const { data: materials, error } = useLoad(() => listMaterials());
  const [qty, setQty] = useState<Record<string, number>>({});

  const list = materials || [];
  const total = list.reduce((s, m) => s + (qty[m.id] || 0) * m.price, 0);
  const set = (id: string, n: number) => setQty((q) => ({ ...q, [id]: Math.max(0, Math.min(50, n)) }));

  const { state, pending, onSubmit } = useSubmit(async (form) => {
    const { name, phone, email, errors } = contactFields(form);
    const address = str(form, "address");
    if (!address) errors.address = "Please enter the delivery address.";
    const items = list
      .filter((m) => (qty[m.id] || 0) > 0)
      .map((m) => ({ materialName: m.name, unit: m.unit, unitPrice: m.price, quantity: qty[m.id] }));
    if (!items.length) errors.materials = "Pick at least one material (set the number of loads).";
    if (Object.keys(errors).length) return invalid(errors);

    await submitRequest({
      type: "booking",
      name,
      phone,
      email: email || null,
      address,
      details: str(form, "details") || null,
      preferredDate: str(form, "preferredDate") || null,
      items,
    });
    await maybeSubscribe(form, email, name);
    return {
      ok: true,
      message: "Your request is in! We'll review it and text you to confirm the delivery and final price.",
    };
  });

  if (state?.ok) {
    return (
      <div className="card text-center">
        <p className="heading text-2xl">Booking request sent!</p>
        <p className="mt-2 text-muted">{state.message}</p>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} className="relative space-y-8" noValidate>
      <Honeypot />

      <section className="card">
        <h2 className="heading text-xl">1. Choose your materials</h2>
        <p className="mt-1 text-sm text-muted">Set how many loads of each you need.</p>
        {!materials && !error && <p className="mt-4 text-muted">Loading price list…</p>}
        {error && <p className="mt-4 text-red-700">Couldn&apos;t load the price list. Please refresh or call us.</p>}
        <ul className="mt-4 divide-y divide-cream-200">
          {list.map((m) => {
            const n = qty[m.id] || 0;
            return (
              <li key={m.id} className={`flex flex-wrap items-center justify-between gap-3 py-3 ${n ? "bg-sun/5" : ""}`}>
                <div className="min-w-0">
                  <p className="font-semibold text-navy">{m.name}</p>
                  <p className="text-sm text-muted">
                    {money(m.price)} per {m.unit} load{m.description ? ` · ${m.description}` : ""}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <button type="button" onClick={() => set(m.id, n - 1)} className="h-9 w-9 rounded-lg border border-stone/40 text-lg hover:bg-cream" aria-label={`Fewer ${m.name}`}>−</button>
                  <input
                    type="number"
                    min={0}
                    max={50}
                    value={n}
                    onChange={(e) => set(m.id, parseInt(e.target.value || "0", 10) || 0)}
                    className="input w-16 text-center"
                    aria-label={`Loads of ${m.name}`}
                  />
                  <button type="button" onClick={() => set(m.id, n + 1)} className="h-9 w-9 rounded-lg border border-stone/40 text-lg hover:bg-cream" aria-label={`More ${m.name}`}>+</button>
                </div>
              </li>
            );
          })}
        </ul>
        <FieldError state={state} name="materials" />
        <div className="mt-4 flex items-center justify-between rounded-xl bg-navy px-4 py-3 text-cream">
          <span className="font-display uppercase tracking-wider">Listed price</span>
          <span className="font-display text-2xl">{money(total)}</span>
        </div>
        <p className="mt-2 text-xs text-muted">
          Typical delivered prices, dumped or tailgated. Location and bulk quantities can change the final price.
          Your second load onward is usually less than the first. We&apos;ll confirm the final total before delivery.
        </p>
      </section>

      <section className="card space-y-4">
        <h2 className="heading text-xl">2. Your contact info</h2>
        <ContactFields state={state} emailHint="Optional, if you'd like your invoice by email." />
      </section>

      <section className="card space-y-4">
        <h2 className="heading text-xl">3. Delivery details</h2>
        <div>
          <label className="label" htmlFor="address">Delivery address *</label>
          <input id="address" name="address" className="input" autoComplete="street-address" placeholder="Street, town, ZIP" maxLength={300} required />
          <FieldError state={state} name="address" />
        </div>
        <div className="sm:w-1/2">
          <label className="label" htmlFor="preferredDate">Preferred delivery date</label>
          <input id="preferredDate" name="preferredDate" type="date" min={todayYmd()} className="input" />
        </div>
        <div>
          <label className="label" htmlFor="details">Additional details</label>
          <textarea
            id="details"
            name="details"
            rows={4}
            maxLength={3000}
            className="input"
            placeholder="Where should we dump it? Gate codes, tight driveways, dump vs. tailgate (spread)…"
          />
        </div>
        <SubscribeCheckbox />
      </section>

      <FormMessage state={state} />
      <button className="btn-primary w-full text-lg sm:w-auto" disabled={pending || !materials}>
        {pending ? "Sending…" : "Submit Booking Request"}
      </button>
    </form>
  );
}
