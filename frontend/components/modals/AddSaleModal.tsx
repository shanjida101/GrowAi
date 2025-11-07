"use client";

import { useEffect, useState, useCallback } from "react";
import { api } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

type Product = { id: number; name: string; price: number };

type Props = {
  open: boolean;
  onClose: () => void;
  onCreated: () => void;
  products: Product[];
};

export default function AddSaleModal({ open, onClose, onCreated, products }: Props) {
  const [productId, setProductId] = useState<number | null>(null);
  const [qty, setQty] = useState<number>(1);
  const [unitPrice, setUnitPrice] = useState<number>(0);
  const [isCredit, setIsCredit] = useState<boolean>(false);
  const [customer, setCustomer] = useState<string>("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // When modal opens or products change, ensure we have a valid selection + price
  useEffect(() => {
    if (!open) return;

    if (products.length === 0) {
      setProductId(null);
      setUnitPrice(0);
      return;
    }

    // If the current selection is invalid/missing, select the first product
    const exists = productId != null && products.some((p) => p.id === productId);
    const selectedId = exists ? productId! : products[0].id;
    setProductId(selectedId);

    // Sync price with the selected product
    const selected = products.find((p) => p.id === selectedId)!;
    setUnitPrice(Number(selected.price ?? 0));
  }, [open, products, productId]);

  const hardReset = useCallback(() => {
    setQty(1);
    setIsCredit(false);
    setCustomer("");
    setError(null);
    // keep productId so reopening remembers last pick
  }, []);

  const canSave =
    open &&
    !submitting &&
    productId != null &&
    qty > 0 &&
    unitPrice >= 0 &&
    (!isCredit || customer.trim().length > 0);

  async function save() {
    if (submitting) return; // guard strict-mode double invoke
    if (!productId) return;
    if (qty <= 0 || unitPrice < 0) return;
    if (isCredit && !customer.trim()) {
      setError("Customer name is required for credit sales.");
      return;
    }

    try {
      setSubmitting(true);
      setError(null);
      await api.post("/api/v1/sales/", {
        product_id: productId,
        qty,
        unit_price: unitPrice,
        is_credit: isCredit,
        customer_name: isCredit ? customer.trim() : null,
      });
      hardReset();
      onCreated();
      onClose();
    } catch (e: any) {
      setError(e?.message ?? "Failed to save sale.");
    } finally {
      setSubmitting(false);
    }
  }

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 grid place-items-center bg-black/60"
      onKeyDown={(e) => {
        if (e.key === "Escape") {
          hardReset();
          onClose();
        }
        if (e.key === "Enter" && canSave) {
          e.preventDefault();
          void save();
        }
      }}
    >
      <Card className="w-[640px] rounded-2xl border border-white/10 bg-[#0e1116] p-6">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-xl font-semibold text-white">Add Sale</h2>
          <button
            className="rounded-lg border border-white/10 px-3 py-1.5 text-white/80 hover:bg-white/10"
            onClick={() => {
              hardReset();
              onClose();
            }}
          >
            Close
          </button>
        </div>

        {products.length === 0 ? (
          <div className="rounded-xl border border-white/10 bg-white/5 p-4 text-sm text-white/70">
            No products available. Please add a product first.
          </div>
        ) : (
          <div className="space-y-4">
            <label className="block text-sm text-white/70">
              Product
              <select
                className="mt-1 w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-white"
                value={productId ?? ""}
                onChange={(e) => {
                  const id = Number(e.target.value);
                  setProductId(id);
                  const p = products.find((x) => x.id === id);
                  setUnitPrice(Number(p?.price ?? 0));
                }}
              >
                {products.map((p) => (
                  <option className="bg-[#0b0d10]" value={p.id} key={p.id}>
                    {p.name}
                  </option>
                ))}
              </select>
            </label>

            <div className="grid grid-cols-2 gap-4">
              <label className="block text-sm text-white/70">
                Qty
                <input
                  type="number"
                  min={1}
                  step={1}
                  className="mt-1 w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-white"
                  value={qty}
                  onChange={(e) => {
                    const v = e.currentTarget.valueAsNumber;
                    setQty(Number.isFinite(v) ? Math.max(1, Math.floor(v)) : 1);
                  }}
                />
              </label>

              <label className="block text-sm text-white/70">
                Unit Price
                <input
                  type="number"
                  min={0}
                  step={0.01}
                  className="mt-1 w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-white"
                  value={unitPrice}
                  onChange={(e) => {
                    const v = e.currentTarget.valueAsNumber;
                    setUnitPrice(Number.isFinite(v) ? Math.max(0, v) : 0);
                  }}
                />
              </label>
            </div>

            <label className="flex items-center gap-3 text-sm text-white/80">
              <input
                type="checkbox"
                checked={isCredit}
                onChange={(e) => setIsCredit(e.target.checked)}
              />
              Credit sale?
            </label>

            {isCredit && (
              <label className="block text-sm text-white/70">
                Customer (for due)
                <input
                  className="mt-1 w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-white"
                  value={customer}
                  onChange={(e) => setCustomer(e.target.value)}
                  placeholder="Customer name"
                />
              </label>
            )}

            {error && (
              <div className="rounded-xl border border-rose-500/30 bg-rose-500/10 px-3 py-2 text-rose-200">
                {error}
              </div>
            )}
          </div>
        )}

        <div className="mt-6 flex justify-end gap-3">
          <Button
            variant="secondary"
            onClick={() => {
              hardReset();
              onClose();
            }}
          >
            Cancel
          </Button>
          <Button onClick={save} disabled={!canSave}>
            {submitting ? "Saving…" : "Save"}
          </Button>
        </div>
      </Card>
    </div>
  );
}
