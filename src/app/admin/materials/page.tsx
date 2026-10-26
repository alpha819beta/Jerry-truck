"use client";

import { deleteMaterial, saveMaterial } from "@/lib/adminApi";
import { listMaterials } from "@/lib/api";
import type { Material } from "@/lib/data";
import { toCents } from "@/lib/format";
import { useLoad } from "@/lib/useLoad";
import { AdminTitle, Loading, useAdmin } from "@/components/admin/Flash";

function readForm(form: HTMLFormElement): Omit<Material, "id"> | string {
  const f = new FormData(form);
  const name = String(f.get("name") || "").trim();
  const price = toCents(String(f.get("price") || ""));
  if (!name || Number.isNaN(price)) return "Name and a valid price are required.";
  return {
    name,
    unit: String(f.get("unit") || "").trim() || "load",
    price,
    description: String(f.get("description") || "").trim() || null,
    // Edit rows send a hidden "off" plus the checkbox; the add form sends neither (new = shown).
    active: f.has("active") ? f.getAll("active").includes("on") : true,
    sortOrder: Number(f.get("sortOrder")) || 0,
  };
}

export default function MaterialsAdmin() {
  const { data: materials, error, reload } = useLoad(() => listMaterials(false));
  const { run, busy, flash } = useAdmin();

  function submit(e: React.FormEvent<HTMLFormElement>, id?: string) {
    e.preventDefault();
    const form = e.currentTarget;
    const data = readForm(form);
    if (typeof data === "string") return flash(data, true);
    run(async () => {
      await saveMaterial(data, id);
      if (!id) form.reset();
      await reload();
    }, "Saved.");
  }

  if (!materials) return <Loading error={error} />;

  return (
    <>
      <AdminTitle>Materials & Prices</AdminTitle>
      <p className="-mt-4 mb-6 text-sm text-muted">
        These show on the home page price list and the Book Now form. Uncheck &ldquo;Show&rdquo; to hide one temporarily.
      </p>

      <div className="space-y-3">
        {materials.map((m) => (
          <div key={m.id} className="card p-4">
            <form onSubmit={(e) => submit(e, m.id)} className="grid items-end gap-3 sm:grid-cols-12">
              <div className="sm:col-span-4">
                <label className="label text-xs">Name</label>
                <input name="name" defaultValue={m.name} className="input" required />
              </div>
              <div className="sm:col-span-2">
                <label className="label text-xs">Per load</label>
                <input name="unit" defaultValue={m.unit} className="input" />
              </div>
              <div className="sm:col-span-2">
                <label className="label text-xs">Price ($)</label>
                <input name="price" defaultValue={(m.price / 100).toFixed(2)} className="input" inputMode="decimal" required />
              </div>
              <div className="sm:col-span-1">
                <label className="label text-xs">Order</label>
                <input name="sortOrder" type="number" defaultValue={m.sortOrder} className="input px-2" />
              </div>
              <label className="flex items-center gap-2 pb-3 text-sm sm:col-span-1">
                <input type="hidden" name="active" value="off" />
                <input type="checkbox" name="active" defaultChecked={m.active} className="h-4 w-4 accent-sun" /> Show
              </label>
              <div className="sm:col-span-2">
                <button className="btn-dark btn-sm w-full" disabled={busy}>Save</button>
              </div>
              <div className="sm:col-span-12">
                <input name="description" defaultValue={m.description ?? ""} className="input text-sm" placeholder="Short note (optional), e.g. great for driveways" />
              </div>
            </form>
            <button
              className="mt-2 text-xs text-red-700 hover:underline"
              onClick={() => confirm(`Delete ${m.name}?`) && run(async () => { await deleteMaterial(m.id); await reload(); }, "Material deleted.")}
            >
              Delete
            </button>
          </div>
        ))}
      </div>

      <form onSubmit={(e) => submit(e)} className="card mt-8 grid items-end gap-3 sm:grid-cols-12">
        <h2 className="heading text-lg sm:col-span-12">Add a material</h2>
        <div className="sm:col-span-5">
          <label className="label text-xs">Name</label>
          <input name="name" className="input" required />
        </div>
        <div className="sm:col-span-2">
          <label className="label text-xs">Per load</label>
          <input name="unit" className="input" placeholder="5 tons" />
        </div>
        <div className="sm:col-span-2">
          <label className="label text-xs">Price ($)</label>
          <input name="price" className="input" inputMode="decimal" required />
        </div>
        <div className="sm:col-span-1">
          <label className="label text-xs">Order</label>
          <input name="sortOrder" type="number" defaultValue={materials.length} className="input px-2" />
        </div>
        <div className="sm:col-span-2">
          <button className="btn-primary btn-sm w-full" disabled={busy}>Add</button>
        </div>
      </form>
    </>
  );
}
