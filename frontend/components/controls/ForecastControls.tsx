// components/controls/ForecastControls.tsx
"use client";
import FancySelect from "@/components/ui/Select";

export default function ForecastControls({
  productId,
  setProductId,
  horizon,
  setHorizon,
  products,
}: {
  productId: number;
  setProductId: (v: number) => void;
  horizon: number;
  setHorizon: (v: number) => void;
  products: { id: number; sku: string; name: string }[];
}) {
  const productOpts = products.map((p) => ({
    value: String(p.id),
    label: `${p.sku} — ${p.name}`,
  }));
  const horizonOpts = [7, 14, 21, 28].map((h) => ({
    value: String(h),
    label: `${h} days`,
  }));

  return (
    <div className="flex flex-wrap items-center gap-3">
      <FancySelect
        value={String(productId)}
        onChange={(v) => setProductId(Number(v))}
        options={productOpts}
        placeholder="Choose product"
        size="md"
      />
      <FancySelect
        value={String(horizon)}
        onChange={(v) => setHorizon(Number(v))}
        options={horizonOpts}
        placeholder="Horizon"
        size="md"
      />
    </div>
  );
}
