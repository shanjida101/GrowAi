"use client";

import { useEffect, useMemo, useState } from "react";
import { api, safe } from "@/lib/api";
import { exportCsv, parseCsv } from "@/lib/csv";
import AddProductModal, { Product } from "@/components/modals/AddProductModal";
import {
  Plus, Upload, Download, Search, Filter, AlertTriangle, RefreshCcw,
  ArrowUpDown, Pencil, Trash2
} from "lucide-react";

// Use the imported Product type instead
type LocalProduct = {
  id: number; sku: string; name: string; category: string;
  stock: number; price: number; reorder_point: number;
};

function Glass({ className = "", children }: { className?: string; children: any }) {
  return (
    <div className={`rounded-2xl border border-white/10 bg-white/5 backdrop-blur ${className}`}>
      {children}
    </div>
  );
}

export default function InventoryPage() {
  const [rows, setRows] = useState<Product[]>([]);
  const [q, setQ] = useState("");
  const [cat, setCat] = useState("all");
  const [onlyLow, setOnlyLow] = useState(false);
  const [openNew, setOpenNew] = useState(false);
  const [loading, setLoading] = useState(true);
  const [sortKey, setSortKey] = useState<keyof Product>("name");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("asc");

  async function load() {
    setLoading(true);
    const data = await safe(api.get<Product[]>("/api/v1/products"), []);
    setRows(data);
    setLoading(false);
  }
  useEffect(() => { load(); }, []);

  // ---- Derived data
  const categories = useMemo(
    () => ["all", ...Array.from(new Set(rows.map(r => r.category))).sort()],
    [rows]
  );

  const filtered = useMemo(() => {
    let r = rows.filter(p => {
      const matchQ = [p.sku, p.name, p.category].join(" ").toLowerCase().includes(q.toLowerCase());
      const matchC = cat === "all" || p.category === cat;
      const matchL = !onlyLow || p.stock <= p.reorder_point;
      return matchQ && matchC && matchL;
    });
    r = r.sort((a, b) => {
      const A = a[sortKey], B = b[sortKey];
      if (typeof A === "number" && typeof B === "number") return sortDir === "asc" ? A - B : B - A;
      return sortDir === "asc"
        ? String(A).localeCompare(String(B))
        : String(B).localeCompare(String(A));
    });
    return r;
  }, [rows, q, cat, onlyLow, sortKey, sortDir]);

  const lowCount = useMemo(() => rows.filter(r => r.stock <= r.reorder_point).length, [rows]);
  const totalValue = useMemo(() => rows.reduce((s, r) => s + r.price * r.stock, 0), [rows]);
  const avgPrice = useMemo(() => rows.length ? rows.reduce((s, r) => s + r.price, 0) / rows.length : 0, [rows]);

  // ---- Actions
  async function remove(id: number) {
    await api.delete(`/api/v1/products/${id}`);
    setRows(r => r.filter(x => x.id !== id));
  }

  async function adjustStock(r: Product) {
    const qty = Number(prompt(`Adjust stock for ${r.name} by (+/-):`, "1") || "0");
    if (!Number.isFinite(qty) || qty === 0) return;
    await api.patch(`/api/v1/products/${r.id}`, { stock: Math.max(0, r.stock + qty) });
    load();
  }

  async function handleImport(file?: File) {
    if (!file) return;
    const items = await parseCsv(file);
    const normalized = items.map((d: any) => ({
      sku: d.sku, name: d.name, category: d.category,
      stock: Number(d.stock || 0), price: Number(d.price || 0), reorder_point: Number(d.reorder_point || 0),
    }));
    await api.post("/api/v1/products/batch", { items: normalized });
    await load();
  }

  function exportAll() { exportCsv(rows, "products"); }

  function toggleSort(k: keyof Product) {
    if (sortKey === k) setSortDir(d => (d === "asc" ? "desc" : "asc"));
    else { setSortKey(k); setSortDir("asc"); }
  }

  return (
    <div className="space-y-5">
      {/* Top bar */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-white">Inventory</h1>
          <p className="text-sm text-white/60">Manage products, stock levels, and pricing.</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <button onClick={load}
                  className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-white hover:bg-white/10">
            <RefreshCcw size={16}/> Refresh
          </button>
          <input id="csv-in" type="file" accept=".csv" className="hidden"
                 onChange={e => handleImport(e.target.files?.[0] || undefined)} />
          <button onClick={() => document.getElementById("csv-in")!.click()}
                  className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-white hover:bg-white/10">
            <Upload size={16}/> Import CSV
          </button>
          <button onClick={exportAll}
                  className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-white hover:bg-white/10">
            <Download size={16}/> Export CSV
          </button>
          <button onClick={() => setOpenNew(true)}
                  className="inline-flex items-center gap-2 rounded-xl bg-indigo-500 px-3 py-2 text-sm text-white hover:bg-indigo-600">
            <Plus size={16}/> Add Product
          </button>
        </div>
      </div>

      {/* Metrics */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Glass className="p-4">
          <p className="text-xs text-white/60">Total Products</p>
          <p className="mt-1 text-2xl font-semibold text-white">{rows.length}</p>
        </Glass>
        <Glass className="p-4">
          <p className="text-xs text-white/60">Low-Stock Items</p>
          <div className="mt-1 flex items-center gap-2">
            <p className="text-2xl font-semibold text-white">{lowCount}</p>
            {lowCount > 0 && (
              <span className="inline-flex items-center gap-1 rounded-full border border-rose-500/30 bg-rose-500/10 px-2 py-0.5 text-[11px] text-rose-300">
                <AlertTriangle size={12} /> action needed
              </span>
            )}
          </div>
        </Glass>
        <Glass className="p-4">
          <p className="text-xs text-white/60">Avg Price</p>
          <p className="mt-1 text-2xl font-semibold text-white">৳{avgPrice.toFixed(0)}</p>
        </Glass>
        <Glass className="p-4">
          <p className="text-xs text-white/60">Inventory Value</p>
          <p className="mt-1 text-2xl font-semibold text-white">৳{totalValue.toLocaleString()}</p>
        </Glass>
      </div>

      {/* Filters */}
      <Glass className="p-4">
        <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
          {/* search */}
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-2.5 h-4 w-4 text-white/50" />
            <input
              value={q}
              onChange={e => setQ(e.target.value)}
              placeholder="Search SKU, name, or category"
              className="w-full rounded-xl border border-white/10 bg-white/5 pl-9 pr-3 py-2 text-sm text-white placeholder:text-white/50"
            />
          </div>

          {/* category */}
          <div className="relative">
            <Filter className="pointer-events-none absolute left-3 top-2.5 h-4 w-4 text-white/50" />
            <select
              value={cat}
              onChange={e => setCat(e.target.value)}
              className="w-full appearance-none rounded-xl border border-white/10 bg-white/5 pl-9 pr-9 py-2 text-sm text-white"
            >
              {categories.map(c => (
                <option key={c} value={c} className="bg-[#0b0d10]">{c}</option>
              ))}
            </select>
          </div>

          {/* low-stock toggle */}
          <button
            onClick={() => setOnlyLow(v => !v)}
            className={`inline-flex items-center justify-center gap-2 rounded-xl border px-3 py-2 text-sm
              ${onlyLow ? "border-rose-500/40 bg-rose-500/15 text-rose-200"
                        : "border-white/10 bg-white/5 text-white/80 hover:bg-white/10"}`}
          >
            <AlertTriangle size={16} />
            {onlyLow ? "Showing only low-stock" : "Show only low-stock"}
          </button>
        </div>
      </Glass>

      {/* Table */}
      <Glass className="p-0 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[900px] text-sm">
            <thead className="sticky top-0 bg-[#0f1217]">
              <tr className="text-left text-white/60">
                {[
                  {key:"sku", label:"SKU"},
                  {key:"name", label:"Name"},
                  {key:"category", label:"Category"},
                  {key:"stock", label:"Stock"},
                  {key:"price", label:"Price"},
                  {key:"reorder_point", label:"Reorder Point"},
                  {key:"__actions", label:"Actions"}
                ].map(col => (
                  <th key={col.key}
                      className="px-4 py-3 select-none"
                      onClick={() => col.key !== "__actions" && toggleSort(col.key as keyof Product)}>
                    <div className="inline-flex cursor-pointer items-center gap-1">
                      <span>{col.label}</span>
                      {col.key !== "__actions" && <ArrowUpDown className="h-3.5 w-3.5 opacity-60" />}
                    </div>
                  </th>
                ))}
              </tr>
            </thead>

            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={7} className="px-4 py-10 text-center text-white/60">Loading…</td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-14 text-center">
                    <div className="mx-auto max-w-md rounded-2xl border border-dashed border-white/15 bg-white/[.03] p-6">
                      <p className="text-base font-medium text-white">No products found</p>
                      <p className="mt-1 text-sm text-white/60">Try clearing filters or add a new product.</p>
                      <div className="mt-4 flex justify-center gap-2">
                        <button onClick={() => { setQ(""); setCat("all"); setOnlyLow(false); }}
                                className="rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-white hover:bg-white/10">
                          Reset filters
                        </button>
                        <button onClick={() => setOpenNew(true)}
                                className="rounded-xl bg-indigo-500 px-3 py-2 text-sm text-white hover:bg-indigo-600">
                          <Plus className="mr-1 inline h-4 w-4" /> Add Product
                        </button>
                      </div>
                    </div>
                  </td>
                </tr>
              ) : (
                filtered.map((r, idx) => (
                  <tr key={r.id} className={`${idx % 2 ? "bg-white/[.03]" : ""} border-t border-white/10 text-white hover:bg-white/[.06]`}>
                    <td className="px-4 py-3 font-medium">{r.sku}</td>
                    <td className="px-4 py-3">{r.name}</td>
                    <td className="px-4 py-3">
                      <span className="rounded-full border border-white/10 bg-white/5 px-2 py-0.5 text-xs text-white/80">
                        {r.category}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`rounded-full px-2 py-0.5 text-xs
                        ${r.stock <= r.reorder_point
                          ? "border border-rose-500/30 bg-rose-500/10 text-rose-300"
                          : "border border-emerald-500/30 bg-emerald-500/10 text-emerald-300"}`}>
                        {r.stock}
                      </span>
                    </td>
                    <td className="px-4 py-3">৳{r.price}</td>
                    <td className="px-4 py-3">{r.reorder_point}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => adjustStock(r)}
                          className="inline-flex items-center gap-1 rounded-lg border border-white/10 bg-white/5 px-2 py-1 text-white/80 hover:bg-white/10"
                          title="Adjust stock"
                        >
                          <Pencil size={14}/> Adjust
                        </button>
                        <button
                          onClick={() => remove(r.id)}
                          className="inline-flex items-center gap-1 rounded-lg border border-rose-500/30 bg-rose-500/10 px-2 py-1 text-rose-200 hover:bg-rose-500/20"
                          title="Delete product"
                        >
                          <Trash2 size={14}/> Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Glass>

      {/* IMPORTANT: your modal expects onAdded (not onCreated). */}
      <AddProductModal
        open={openNew}
        onClose={() => setOpenNew(false)}
        onAdded={(p: Product) => setRows(r => [p, ...r])}
      />
    </div>
  );
}
