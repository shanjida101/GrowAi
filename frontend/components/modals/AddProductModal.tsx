"use client";
import { useState } from "react";
import { api } from "@/lib/api";

type Product = {
  id?: number; sku: string; name: string; category: string;
  stock: number; price: number; reorder_point: number;
};

export default function AddProductModal({
  open, onClose, onAdded,
}: { open: boolean; onClose: ()=>void; onAdded:(p:Product)=>void }) {

  const [form, setForm] = useState<Product>({
    sku:"", name:"", category:"", stock:0, price:0, reorder_point:5
  });
  const [saving, setSaving] = useState(false);

  async function save() {
    setSaving(true);
    const created = await api.post<Product>("/api/v1/products", form);
    setSaving(false);
    onAdded(created);
    onClose();
  }

  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-black/60">
      <div className="w-[520px] rounded-2xl border border-white/10 bg-[#0f1217] p-5">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-lg font-semibold text-white">Add Product</h3>
          <button onClick={onClose} className="rounded-lg border border-white/10 bg-white/5 px-2 py-1 text-white/70 hover:bg-white/10">Close</button>
        </div>

        <div className="grid grid-cols-2 gap-3">
          {[
            {k:"sku", label:"SKU"},
            {k:"name", label:"Name"},
            {k:"category", label:"Category"},
            {k:"stock", label:"Stock", type:"number"},
            {k:"price", label:"Price", type:"number"},
            {k:"reorder_point", label:"Reorder Point", type:"number"},
          ].map(f=>(
            <label key={f.k} className="text-sm text-white/70">
              {f.label}
              <input
                value={(form as any)[f.k] ?? ""}
                onChange={e=> setForm(s=>({...s, [f.k]: f.type==="number"? Number(e.target.value): e.target.value}))}
                type={f.type||"text"}
                className="mt-1 w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-white"
              />
            </label>
          ))}
        </div>

        <div className="mt-5 flex justify-end gap-2">
          <button onClick={onClose} className="rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-white/80 hover:bg-white/10">Cancel</button>
          <button onClick={save} disabled={saving}
            className="rounded-xl bg-indigo-500 px-4 py-2 text-white hover:bg-indigo-600 disabled:opacity-60">
            {saving? "Saving..." : "Save"}
          </button>
        </div>
      </div>
    </div>
  );
}
