"use client";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/cn";
import { api, safe } from "@/lib/api";
import { toast } from "sonner";

type Product = { id:number; sku:string; name:string; price:number };

export default function AddSaleSheet({
  open,
  onClose,
  onCreated,
}: { open:boolean; onClose:()=>void; onCreated:()=>void }) {
  const [products, setProducts] = useState<Product[]>([]);
  const [productId, setProductId] = useState<number | "">("");
  const [qty, setQty] = useState(1);
  const [price, setPrice] = useState<number | "">("");
  const [isCredit, setIsCredit] = useState(false);
  const [customer, setCustomer] = useState("");

  useEffect(() => {
    if (!open) return;
    safe(api.get<Product[]>("/api/v1/products/"), [
      { id:1, sku:"MILK-500", name:"Milk 500ml", price:70 },
      { id:2, sku:"RICE-5KG", name:"Rice 5kg", price:550 }
    ]).then(p => setProducts(p));
  }, [open]);

  useEffect(() => {
    if (productId) {
      const p = products.find(x=>x.id===productId);
      if (p) setPrice(p.price);
    }
  }, [productId, products]);

 async function submit() {
  if (!productId || !price) { toast.error("Select product and price"); return; }

  const sale = {
    product_id: productId, qty, unit_price: Number(price),
    is_credit: isCredit, customer_name: customer || undefined
  };

  try {
    await api.post("/api/v1/sales/", sale);

    // if credit, auto-create due
    if (isCredit && customer) {
      await api.post("/api/v1/dues/", { customer_name: customer, amount: Number(price) * qty, note: `Auto from sale of ${productId}` });
    }

    toast.success("Sale recorded");
    onCreated(); onClose();
  } catch {
    // Demo fallback
    if (isCredit && customer) toast.info("Demo: due auto-created locally");
    toast.info("Demo: sale recorded locally");
    onCreated(); onClose();
  }
}

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/60">
      <div className="absolute right-0 top-0 h-full w-full max-w-md border-l border-neutral-800 bg-neutral-900 p-6 shadow-soft">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-lg font-semibold">Add Sale</h3>
          <button onClick={onClose} className="text-neutral-400 hover:text-white">✕</button>
        </div>

        <div className="space-y-3">
          <div>
            <label className="text-xs text-neutral-400">Product</label>
            <select value={productId} onChange={(e)=>setProductId(Number(e.target.value))}
              className="mt-1 w-full rounded-xl bg-neutral-800 px-3 py-2 text-sm outline-none border border-neutral-700">
              <option value="">Select product</option>
              {products.map(p=>(
                <option key={p.id} value={p.id}>{p.sku} — {p.name}</option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-neutral-400">Qty</label>
              <input type="number" value={qty} onChange={(e)=>setQty(Math.max(1, Number(e.target.value)))}
                className="mt-1 w-full rounded-xl bg-neutral-800 px-3 py-2 text-sm outline-none border border-neutral-700" />
            </div>
            <div>
              <label className="text-xs text-neutral-400">Unit Price</label>
              <input type="number" value={price} onChange={(e)=>setPrice(e.target.value as any)}
                className="mt-1 w-full rounded-xl bg-neutral-800 px-3 py-2 text-sm outline-none border border-neutral-700" />
            </div>
          </div>

          <div className="flex items-center gap-3">
            <input id="credit" type="checkbox" checked={isCredit} onChange={(e)=>setIsCredit(e.target.checked)} />
            <label htmlFor="credit" className="text-sm">Credit sale?</label>
          </div>

          {isCredit && (
            <div>
              <label className="text-xs text-neutral-400">Customer</label>
              <input value={customer} onChange={(e)=>setCustomer(e.target.value)}
                className="mt-1 w-full rounded-xl bg-neutral-800 px-3 py-2 text-sm outline-none border border-neutral-700" placeholder="Customer name"/>
            </div>
          )}

          <div className="pt-2 flex justify-end gap-2">
            <Button onClick={onClose} className="bg-white/5">Cancel</Button>
            <Button onClick={submit}>Save Sale</Button>
          </div>
        </div>
      </div>
    </div>
  );
}
