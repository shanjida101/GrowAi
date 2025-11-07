"use client";
import { useEffect, useState } from "react";
import { api, safe } from "@/lib/api";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import AddSaleModal from "@/components/modals/AddSaleModal";

type Sale = {
  id:number; product_id:number; product_name:string;
  qty:number; unit_price:number; is_credit:boolean;
  customer_name?:string | null; created_at:string;
};
type Product = { id:number; name:string; price:number };

export default function SalesPage() {
  const [rows, setRows] = useState<Sale[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [open, setOpen] = useState(false);

  async function load() {
    const [sales, prods] = await Promise.all([
      safe(api.get<Sale[]>("/api/v1/sales/"), []),
      safe(api.get<Product[]>("/api/v1/products/"), []),
    ]);
    setRows(sales);
    setProducts(prods.map(p => ({ id:p.id, name:p.name, price:(p as any).price ?? 0 })));
  }

  useEffect(()=>{ load(); }, []);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-white">Sales</h1>
        <Button onClick={()=>setOpen(true)}>Add Sale</Button>
      </div>

      <Card className="overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-white/[.03]">
            <tr>
              {["Time","Product","Qty","Unit Price","Credit?","Customer"].map(h=>(
                <th key={h} className="px-4 py-3 text-left font-medium text-neutral-400">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.length===0 ? (
              <tr><td colSpan={6} className="px-4 py-8 text-center text-neutral-500">No sales yet</td></tr>
            ) : rows.map(s=>(
              <tr key={s.id} className="border-t border-neutral-800">
                <td className="px-4 py-3">{new Date(s.created_at).toLocaleString()}</td>
                <td className="px-4 py-3">{s.product_name}</td>
                <td className="px-4 py-3">{s.qty}</td>
                <td className="px-4 py-3">৳{s.unit_price}</td>
                <td className="px-4 py-3">
                  {s.is_credit ? <span className="rounded-full bg-amber-500/15 px-2 py-0.5 text-amber-200">Yes</span>
                               : <span className="rounded-full bg-emerald-500/15 px-2 py-0.5 text-emerald-200">No</span>}
                </td>
                <td className="px-4 py-3">{s.customer_name ?? "—"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>

      <AddSaleModal
        open={open}
        onClose={()=>setOpen(false)}
        onCreated={load}
        products={products}
      />
    </div>
  );
}
