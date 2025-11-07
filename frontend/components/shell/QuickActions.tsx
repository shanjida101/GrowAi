// components/shell/QuickActions.tsx
"use client";
import { useRouter } from "next/navigation";
import { CreditCard, Download, Plus, Upload } from "lucide-react";

export default function QuickActions() {
  const r = useRouter();
  const Btn = ({
    children,
    onClick,
  }: {
    children: React.ReactNode;
    onClick: () => void;
  }) => (
    <button
      onClick={onClick}
      className="rounded-xl border border-base-border bg-white/[.06] px-3 py-2 text-sm transition hover:bg-white/[.10]"
    >
      {children}
    </button>
  );

  return (
    <div className="flex flex-wrap gap-2">
      <Btn onClick={() => r.push("/inventory")}>
        <Plus className="mr-2 inline" size={16} />
        Add Product
      </Btn>
      <Btn onClick={() => r.push("/sales")}>
        <CreditCard className="mr-2 inline" size={16} />
        Add Sale
      </Btn>
      <Btn onClick={() => document.getElementById("productsCsv")?.click()}>
        <Upload className="mr-2 inline" size={16} />
        Import CSV
      </Btn>
      <Btn onClick={() => r.push("/dues")}>
        <Download className="mr-2 inline" size={16} />
        View Dues
      </Btn>
    </div>
  );
}
