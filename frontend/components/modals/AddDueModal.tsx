"use client";
import { useEffect, useState } from "react";

export type NewDue = {
  customer_name: string;
  amount: number;
  note?: string;
};

export default function AddDueModal({
  open,
  onClose,
  onCreate,
  saving = false,
}: {
  open: boolean;
  onClose: () => void;
  onCreate: (value: NewDue) => Promise<void> | void;
  saving?: boolean;
}) {
  const [customer_name, setName] = useState("");
  const [amount, setAmount] = useState<number | "">("");
  const [note, setNote] = useState("");

  // Reset form on open
  useEffect(() => {
    if (open) {
      setName("");
      setAmount("");
      setNote("");
    }
  }, [open]);

  function valid() {
    return customer_name.trim().length >= 2 && Number(amount) > 0;
  }

  async function submit() {
    if (!valid()) return;
    await onCreate({
      customer_name: customer_name.trim(),
      amount: Number(amount),
      note: note.trim() || undefined,
    });
  }

  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-black/60">
      <div className="w-[520px] rounded-2xl border border-white/10 bg-[#0f1217] p-5">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-lg font-semibold text-white">Add New Due</h3>
          <button
            onClick={onClose}
            className="rounded-lg border border-white/10 bg-white/5 px-2 py-1 text-white/70 hover:bg-white/10"
          >
            Close
          </button>
        </div>

        <div className="grid grid-cols-1 gap-3">
          <label className="text-sm text-white/70">
            Customer Name
            <input
              value={customer_name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g., Rahim"
              className="mt-1 w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-white"
            />
          </label>

          <label className="text-sm text-white/70">
            Amount (৳)
            <input
              value={amount}
              onChange={(e) => setAmount(e.target.value === "" ? "" : Number(e.target.value))}
              type="number"
              min={1}
              step="1"
              placeholder="e.g., 320"
              className="mt-1 w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-white"
            />
          </label>

          <label className="text-sm text-white/70">
            Note (optional)
            <input
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="e.g., Milk & Rice"
              className="mt-1 w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-white"
            />
          </label>
        </div>

        <div className="mt-5 flex justify-end gap-2">
          <button
            onClick={onClose}
            className="rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-white/80 hover:bg-white/10"
          >
            Cancel
          </button>
          <button
            onClick={submit}
            disabled={!valid() || saving}
            className="rounded-xl bg-indigo-500 px-4 py-2 text-white hover:bg-indigo-600 disabled:opacity-60"
          >
            {saving ? "Saving..." : "Create Due"}
          </button>
        </div>
      </div>
    </div>
  );
}
