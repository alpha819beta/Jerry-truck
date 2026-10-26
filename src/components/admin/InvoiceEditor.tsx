"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { saveInvoice } from "@/lib/adminApi";
import type { Material } from "@/lib/data";
import { isEmail, money, toCents } from "@/lib/format";
import { useAdmin } from "./Flash";

type Line = { key: number; description: string; quantity: number; price: string };

export type EditorInitial = {
  id?: string;
  requestId?: string | null;
  customerName: string;
  customerPhone: string;
  customerEmail: string;
  address: string;
  notes: string;
  dueDate: string;
  payUrl: string;
  items: Omit<Line, "key">[];
};

const quickFees = ["Delivery / distance fee", "Fuel surcharge", "Spreading / tailgating", "Extra labor", "Discount"];

let nextKey = 1;

export function InvoiceEditor({ initial, materials }: { initial: EditorInitial; materials: Material[] }) {
  const router = useRouter();
  const { run, busy } = useAdmin();
  const [f, setF] = useState(initial);
  const [lines, setLines] = useState<Line[]>(() =>
    initial.items.length
      ? initial.items.map((i) => ({ ...i, key: nextKey++ }))
      : [{ key: nextKey++, description: "", quantity: 1, price: "" }],
  );
  const [error, setError] = useState("");

  const field = (k: keyof EditorInitial) => ({
    value: (f[k] as string) ?? "",
    onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => setF({ ...f, [k]: e.target.value }),
  });
  const update = (key: number, patch: Partial<Line>) =>
    setLines((ls) => ls.map((l) => (l.key === key ? { ...l, ...patch } : l)));
  const add = (l: Omit<Line, "key">) =>
    setLines((ls) => [...ls.filter((x) => x.description || x.price), { ...l, key: nextKey++ }]);

  const cents = (p: string) => {
    const c = toCents(p);
    return Number.isNaN(c) ? 0 : c;
  };
  const total = lines.reduce((s, l) => s + cents(l.price) * (l.quantity || 0), 0);

  function submit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    const items = lines
      .filter((l) => l.description.trim())
      .map((l) => ({
        description: l.description.trim(),
        quantity: Math.max(1, Math.round(Number(l.quantity) || 1)),
        unitPrice: toCents(l.price),
      }));
    if (!f.customerName.trim()) return setError("Customer name is required.");
    if (!items.length) return setError("Add at least one line item.");
    if (items.some((i) => Number.isNaN(i.unitPrice))) return setError("Check the prices; one isn't a number.");
    if (f.customerEmail.trim() && !isEmail(f.customerEmail.trim())) return setError("Customer email looks wrong.");
    if (f.payUrl.trim() && !/^https?:\/\//.test(f.payUrl.trim())) return setError("Payment link must start with https://");

    run(async () => {
      const id = await saveInvoice(
        {
          customerName: f.customerName.trim(),
          customerPhone: f.customerPhone.trim() || null,
          customerEmail: f.customerEmail.trim() || null,
          address: f.address.trim() || null,
          notes: f.notes.trim() || null,
          dueDate: f.dueDate || null,
          payUrl: f.payUrl.trim() || null,
          items,
        },
        { id: f.id, requestId: f.requestId },
      );
      router.push(`/admin/invoice/?id=${id}`);
    }, "Invoice saved. Review it, then send it.");
  }

  return (
    <form onSubmit={submit} className="space-y-6">
      <section className="card grid gap-4 sm:grid-cols-2">
        <h2 className="heading text-lg sm:col-span-2">Customer</h2>
        <div className="sm:col-span-2">
          <label className="label">Name *</label>
          <input className="input" required {...field("customerName")} />
        </div>
        <div>
          <label className="label">Phone (for texting the invoice)</label>
          <input className="input" type="tel" {...field("customerPhone")} />
        </div>
        <div>
          <label className="label">Email (for emailing the invoice)</label>
          <input className="input" type="email" {...field("customerEmail")} />
        </div>
        <div className="sm:col-span-2">
          <label className="label">Address</label>
          <input className="input" {...field("address")} />
        </div>
      </section>

      <section className="card">
        <h2 className="heading text-lg">Line items</h2>
        <div className="mt-4 space-y-3">
          {lines.map((l) => (
            <div key={l.key} className="grid grid-cols-12 items-end gap-2">
              <div className="col-span-12 sm:col-span-7">
                <label className="label text-xs">Description</label>
                <input className="input" value={l.description} onChange={(e) => update(l.key, { description: e.target.value })} placeholder="e.g. 5 tons #57 gravel, delivered" />
              </div>
              <div className="col-span-3 sm:col-span-1">
                <label className="label text-xs">Qty</label>
                <input className="input px-2 text-center" type="number" min={1} value={l.quantity} onChange={(e) => update(l.key, { quantity: parseInt(e.target.value || "1", 10) })} />
              </div>
              <div className="col-span-5 sm:col-span-2">
                <label className="label text-xs">Price ($)</label>
                <input className="input" inputMode="decimal" value={l.price} onChange={(e) => update(l.key, { price: e.target.value })} placeholder="0.00" />
              </div>
              <div className="col-span-3 pb-2.5 text-right text-sm font-semibold sm:col-span-1">
                {money(cents(l.price) * (l.quantity || 0))}
              </div>
              <button type="button" onClick={() => setLines((ls) => ls.filter((x) => x.key !== l.key))} className="col-span-1 pb-2.5 text-xl text-red-700 hover:text-red-900" aria-label="Remove line">×</button>
            </div>
          ))}
        </div>

        <div className="mt-4 flex flex-wrap gap-2">
          <button type="button" onClick={() => add({ description: "", quantity: 1, price: "" })} className="btn-outline btn-sm">+ Blank line</button>
          {quickFees.map((q) => (
            <button key={q} type="button" onClick={() => add({ description: q, quantity: 1, price: q === "Discount" ? "-" : "" })} className="rounded-full bg-cream-200 px-3 py-1 text-sm text-navy hover:bg-sun/20">
              + {q}
            </button>
          ))}
        </div>
        {materials.length > 0 && (
          <div className="mt-3">
            <select
              className="input sm:w-auto"
              value=""
              onChange={(e) => {
                const m = materials.find((x) => x.id === e.target.value);
                if (m) add({ description: `${m.name} (${m.unit}), delivered`, quantity: 1, price: (m.price / 100).toFixed(2) });
              }}
            >
              <option value="">+ Add a material from your price list…</option>
              {materials.map((m) => <option key={m.id} value={m.id}>{m.name} · {money(m.price)}</option>)}
            </select>
          </div>
        )}

        <div className="mt-6 flex items-center justify-between rounded-xl bg-navy px-4 py-3 text-cream">
          <span className="font-display uppercase tracking-wider">Total</span>
          <span className="font-display text-2xl">{money(total)}</span>
        </div>
      </section>

      <section className="card grid gap-4 sm:grid-cols-3">
        <div>
          <label className="label">Due date</label>
          <input className="input" type="date" {...field("dueDate")} />
        </div>
        <div className="sm:col-span-2">
          <label className="label">Notes for the customer</label>
          <textarea className="input" rows={3} {...field("notes")} placeholder="e.g. Delivery scheduled for Saturday morning. Cash, check or card accepted." />
        </div>
        <div className="sm:col-span-3">
          <label className="label">Online payment link (optional)</label>
          <input className="input" type="url" {...field("payUrl")} placeholder="Your Square / PayPal / Stripe payment link, e.g. https://square.link/u/…" />
          <p className="mt-1 text-xs text-muted">Adds a &ldquo;Pay Online&rdquo; button to the invoice. Leave blank for cash/check.</p>
        </div>
      </section>

      {error && <p className="rounded-lg bg-red-50 px-4 py-3 font-semibold text-red-800">{error}</p>}
      <button className="btn-primary" disabled={busy}>{busy ? "Saving…" : "Save & Preview"}</button>
    </form>
  );
}
