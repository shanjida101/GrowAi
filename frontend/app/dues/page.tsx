"use client";
import { useEffect, useMemo, useState } from "react";
import { api, safe } from "@/lib/api";
import { toast } from "sonner";
import { CheckCircle2, Clock, Plus, RefreshCcw, Search } from "lucide-react";
import AddDueModal, { NewDue } from "@/components/modals/AddDueModal";

type Due = {
  id: number;
  customer_name: string;
  amount: number;
  note?: string;
  is_settled: boolean;
};

function Glass({ className = "", children }: { className?: string; children: any }) {
  return <div className={`rounded-2xl border border-white/10 bg-white/5 backdrop-blur ${className}`}>{children}</div>;
}

export default function DuesPage() {
  const [rows, setRows] = useState<Due[]>([]);
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<"all" | "pending" | "settled">("all");
  const [loading, setLoading] = useState(true);
  const [openNew, setOpenNew] = useState(false);
  const [saving, setSaving] = useState(false);

  async function load() {
    setLoading(true);
    const data = await safe(api.get<Due[]>("/api/v1/dues/"), [
      { id: 1, customer_name: "Rahim", amount: 320, note: "Milk & Rice", is_settled: false },
      { id: 2, customer_name: "Karim", amount: 150, note: "Snacks", is_settled: true },
    ]);
    setRows(data);
    setLoading(false);
  }
  useEffect(() => { load(); }, []);

  async function settle(id: number) {
    try {
      await api.patch(`/api/v1/dues/${id}`, { is_settled: true });
      toast.success("Due settled successfully");
      load();
    } catch {
      // demo fallback
      setRows(rs => rs.map(r => (r.id === id ? { ...r, is_settled: true } : r)));
      toast.info("Demo mode: Marked as settled");
    }
  }

  async function createDue(d: NewDue) {
    setSaving(true);
    try {
      const created = await api.post<Due>("/api/v1/dues", { ...d, is_settled: false });
      setRows(r => [created, ...r]);
      toast.success("New due added");
      setOpenNew(false);
    } catch {
      // demo path
      const created = { id: Date.now(), ...d, is_settled: false } as Due;
      setRows(r => [created, ...r]);
      toast.info("Demo mode: Added locally");
      setOpenNew(false);
    } finally {
      setSaving(false);
    }
  }

  const filtered = useMemo(() => {
    return rows.filter(r => {
      const matchesQuery = [r.customer_name, r.note].join(" ").toLowerCase().includes(query.toLowerCase());
      const matchesStatus =
        filter === "all" || (filter === "pending" && !r.is_settled) || (filter === "settled" && r.is_settled);
      return matchesQuery && matchesStatus;
    });
  }, [rows, query, filter]);

  const totalPending = useMemo(() => rows.filter(r => !r.is_settled).reduce((s, r) => s + r.amount, 0), [rows]);
  const totalSettled = useMemo(() => rows.filter(r => r.is_settled).reduce((s, r) => s + r.amount, 0), [rows]);

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-white">Dues Management</h1>
          <p className="text-sm text-white/60">Track customer dues and settlements clearly.</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={load}
            className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-white hover:bg-white/10"
          >
            <RefreshCcw size={16} /> Refresh
          </button>
          <button
            onClick={() => setOpenNew(true)}
            className="inline-flex items-center gap-2 rounded-xl bg-indigo-500 px-3 py-2 text-sm text-white hover:bg-indigo-600"
          >
            <Plus size={16} /> Add Due
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <Glass className="p-4">
          <p className="text-xs text-white/60">Total Dues</p>
          <p className="mt-1 text-2xl font-semibold text-white">
            ৳{(totalPending + totalSettled).toLocaleString()}
          </p>
        </Glass>
        <Glass className="p-4">
          <p className="text-xs text-white/60">Pending</p>
          <p className="mt-1 text-2xl font-semibold text-rose-400">৳{totalPending.toLocaleString()}</p>
        </Glass>
        <Glass className="p-4">
          <p className="text-xs text-white/60">Settled</p>
          <p className="mt-1 text-2xl font-semibold text-emerald-400">৳{totalSettled.toLocaleString()}</p>
        </Glass>
      </div>

      {/* Filters */}
      <Glass className="p-4">
        <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
          {/* Search */}
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-2.5 h-4 w-4 text-white/50" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search by name or note"
              className="w-full rounded-xl border border-white/10 bg-white/5 pl-9 pr-3 py-2 text-sm text-white placeholder:text-white/50"
            />
          </div>

          {/* Status filter */}
          <div className="flex items-center gap-2">
            {["all", "pending", "settled"].map((s) => (
              <button
                key={s}
                onClick={() => setFilter(s as any)}
                className={`flex-1 rounded-xl border px-3 py-2 text-sm capitalize transition
                  ${
                    filter === s
                      ? s === "pending"
                        ? "border-rose-500/40 bg-rose-500/15 text-rose-300"
                        : s === "settled"
                        ? "border-emerald-500/40 bg-emerald-500/15 text-emerald-300"
                        : "border-indigo-500/40 bg-indigo-500/15 text-indigo-300"
                      : "border-white/10 bg-white/5 text-white/70 hover:bg-white/10"
                  }`}
              >
                {s}
              </button>
            ))}
          </div>

          <div className="hidden md:flex items-center justify-end text-sm text-white/60">
            Showing {filtered.length} records
          </div>
        </div>
      </Glass>

      {/* Table */}
      <Glass className="overflow-hidden">
        <table className="w-full min-w-[760px] text-sm">
          <thead className="bg-white/[.03] text-white/60">
            <tr>
              {["Customer", "Amount", "Note", "Status", "Action"].map((h) => (
                <th key={h} className="px-4 py-3 text-left font-medium">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={5} className="px-4 py-10 text-center text-white/60">
                  Loading…
                </td>
              </tr>
            ) : filtered.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-4 py-10 text-center text-white/60">
                  No records found
                </td>
              </tr>
            ) : (
              filtered.map((d, idx) => (
                <tr
                  key={d.id}
                  className={`${idx % 2 ? "bg-white/[.03]" : ""} border-t border-white/10 text-white hover:bg-white/[.05]`}
                >
                  <td className="px-4 py-3 font-medium">{d.customer_name}</td>
                  <td className="px-4 py-3">৳{d.amount}</td>
                  <td className="px-4 py-3 text-white/70">{d.note || "—"}</td>
                  <td className="px-4 py-3">
                    {d.is_settled ? (
                      <span className="inline-flex items-center gap-1 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2 py-0.5 text-emerald-300 text-xs">
                        <CheckCircle2 size={12} /> Settled
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 rounded-full border border-rose-500/30 bg-rose-500/10 px-2 py-0.5 text-rose-300 text-xs">
                        <Clock size={12} /> Pending
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <button
                      onClick={() => settle(d.id)}
                      disabled={d.is_settled}
                      className={`rounded-xl px-3 py-1.5 text-sm transition
                        ${
                          d.is_settled
                            ? "border border-white/10 bg-white/5 text-white/40 cursor-not-allowed"
                            : "border border-emerald-500/30 bg-emerald-500/10 text-emerald-300 hover:bg-emerald-500/15"
                        }`}
                    >
                      {d.is_settled ? "Done" : "Settle"}
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </Glass>

      {/* Modal */}
      <AddDueModal
        open={openNew}
        onClose={() => setOpenNew(false)}
        onCreate={createDue}
        saving={saving}
      />
    </div>
  );
}
