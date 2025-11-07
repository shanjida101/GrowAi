"use client";

import { useEffect, useMemo, useState } from "react";
import {
  AreaChart, Area, LineChart, Line, ResponsiveContainer,
  XAxis, YAxis, CartesianGrid, Tooltip
} from "recharts";
import { motion, useSpring, useTransform } from "framer-motion";
import { Plus, CreditCard, Upload, AlertTriangle, TrendingUp, MoreHorizontal } from "lucide-react";

/* ---------- Demo data (no syntax errors) ---------- */
type Product = { id: number; sku: string; name: string };
type Point = { date: string; forecast_qty: number };

export const PRODUCTS: Product[] = [
  { id: 1, sku: "MILK-500", name: "Milk 500ml" },
  { id: 2, sku: "RICE-5KG", name: "Rice 5kg" },
];

const spark = (base: number, amp: number) =>
  Array.from({ length: 24 }, (_, i) => ({
    x: i,
    y: base + Math.sin(i / 2) * amp + (i % 3),
  }));

const ORDER_LABELS = ["1 Feb", "2 Feb", "3 Feb", "5 Feb", "6 Feb", "7 Feb", "8 Feb", "9 Feb", "10 Feb"];
const ORDER_SERIES = ORDER_LABELS.map((label, i) => ({
  label,
  a: 140 + Math.sin(i / 1.2) * 35 + (i % 3) * 8,
}));

const REVENUE_LABELS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug"];
const REVENUE_SERIES = REVENUE_LABELS.map((label, i) => ({
  label,
  a: 11800 + Math.sin(i / 1.2) * 1200 + (i % 2 ? 400 : -300),
  b: 11000 + Math.cos(i / 1.1) * 900,
}));

/* ---------- UI Components ---------- */
function Glass({ className = "", children }: { className?: string; children: React.ReactNode }) {
  return (
    <div
      className={`rounded-2xl border border-white/10 bg-white/5 backdrop-blur shadow-[0_10px_32px_rgba(0,0,0,0.35)] ${className}`}
    >
      {children}
    </div>
  );
}

function Action({ icon, children }: { icon: React.ReactNode; children: React.ReactNode }) {
  return (
    <button className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-white/90 hover:bg-white/10 transition">
      {icon}
      {children}
    </button>
  );
}

function AnimatedNumber({ value }: { value: number }) {
  const spring = useSpring(0, { stiffness: 120, damping: 20 });
  useEffect(() => spring.set(value), [value, spring]);
  const int = useTransform(spring, (v) => Math.round(v));
  return <motion.span>{int}</motion.span>;
}

function StatCard({
  title,
  value,
  delta,
  up = true,
  series,
}: {
  title: string;
  value: number | string;
  delta: string;
  up?: boolean;
  series: { x: number; y: number }[];
}) {
  return (
    <Glass className="p-4">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs text-white/60">{title}</p>
          <div className="mt-1 flex items-baseline gap-2">
            <p className="text-2xl font-semibold text-white">
              {typeof value === "number" ? <AnimatedNumber value={value} /> : value}
            </p>
            <span
              className={`rounded-full px-2 py-0.5 text-[11px] ${
                up ? "bg-emerald-500/15 text-emerald-300" : "bg-rose-500/15 text-rose-300"
              }`}
            >
              {up ? "▲" : "▼"} {delta}
            </span>
          </div>
        </div>
        <div className="h-10 w-24">
          <ResponsiveContainer>
            <LineChart data={series}>
              <YAxis hide domain={["dataMin - 5", "dataMax + 5"]} />
              <XAxis hide dataKey="x" />
              <Line type="monotone" dataKey="y" stroke="#8b93ff" strokeWidth={2} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
      <div className="mt-3 h-1.5 w-full rounded-full bg-white/5 overflow-hidden">
        <div className="h-full w-4/5 bg-gradient-to-r from-indigo-400 to-sky-400" />
      </div>
    </Glass>
  );
}

function MiniTile({
  title,
  value,
  delta,
  up = true,
  tone = "default",
}: {
  title: string;
  value: string;
  delta: string;
  up?: boolean;
  tone?: "default" | "info";
}) {
  const toneClass =
    tone === "info"
      ? "bg-indigo-400/15 border-indigo-400/25"
      : "bg-white/5 border-white/10";
  return (
    <div className={`rounded-2xl border ${toneClass} px-4 py-3`}>
      <div className="text-xs text-white/60">{title}</div>
      <div className="mt-1 text-xl font-semibold text-white">{value}</div>
      <div className={`mt-1 text-xs ${up ? "text-emerald-300" : "text-rose-300"}`}>
        {up ? "▲" : "▼"} {delta}
      </div>
    </div>
  );
}

/* ---------- Page ---------- */
export default function Page() {
  const [products] = useState<Product[]>(PRODUCTS);
  const [productId, setProductId] = useState<number>(PRODUCTS[0].id);
  const [horizon, setHorizon] = useState(14);
  const [data, setData] = useState<Point[]>([]);
  const lowStockCount = 8;

  useEffect(() => {
    const pts = Array.from({ length: horizon }, (_, i) => ({
      date: new Date(Date.now() + (i + 1) * 864e5).toISOString(),
      forecast_qty: 80 + Math.sin(i / 2) * 22 + (i % 4) * 6,
    }));
    setData(pts);
  }, [productId, horizon]);

  const rows = useMemo(
    () =>
      data.map((p) => ({
        date: p.date.slice(5, 10),
        qty: +p.forecast_qty.toFixed(1),
      })),
    [data]
  );

  return (
    <>
      {/* Welcome section */}
      <Glass className="relative overflow-hidden p-5">
        <div
          className="absolute inset-0 pointer-events-none opacity-40"
          style={{
            background:
              "radial-gradient(900px_300px_at_10%_0%,rgba(59,130,246,.25),transparent 60%), radial-gradient(900px_300px_at_90%_100%,rgba(16,185,129,.25),transparent 60%)",
          }}
        />
        <div className="relative z-10 flex items-center justify-between">
          <div>
            <p className="text-sm text-white/60">Welcome back,</p>
            <p className="text-3xl font-semibold text-white">Admin</p>
          </div>
          <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-xs text-white/70">
            Last sync · 3m ago
          </span>
        </div>

        <div className="relative z-10 mt-4 flex flex-wrap items-center gap-3">
          <Action icon={<Plus size={16} />}>Add Product</Action>
          <Action icon={<CreditCard size={16} />}>Add Sale</Action>
          <Action icon={<Upload size={16} />}>Import CSV</Action>
          <Action icon={<TrendingUp size={16} />}>View Dues</Action>
          {lowStockCount > 0 && (
            <span className="inline-flex items-center gap-2 rounded-xl bg-rose-500/10 px-3 py-2 text-sm text-rose-300 border border-rose-500/20">
              <AlertTriangle size={16} /> {lowStockCount} low-stock items
            </span>
          )}
        </div>
      </Glass>

      {/* KPI cards */}
      <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard title="Today Sales" value="৳12,340" delta="+4.3%" up series={spark(60, 12)} />
        <StatCard title="Total Dues" value="৳4,210" delta="-1.2%" up={false} series={spark(45, 10)} />
        <StatCard title="Low Stock Items" value={8} delta="+2" up={false} series={spark(12, 4)} />
        <StatCard title="Forecast Accuracy (7d)" value="92%" delta="+1.1%" up series={spark(88, 3)} />
      </div>

      {/* Order & Revenue section */}
      <div className="mt-6 grid grid-cols-1 gap-4 lg:grid-cols-3">
        {/* Order Summary */}
        <Glass className="p-4 lg:col-span-1">
          <div className="mb-2 flex items-start justify-between">
            <div>
              <div className="text-xs text-white/70">
                Order Summary <span className="text-emerald-300 ml-2">Order Received ▲ 1.11%</span>
              </div>
              <div className="mt-1 text-2xl font-semibold text-white">2,501.00</div>
              <div className="text-xs text-white/60">Total Order Completed</div>
            </div>
            <button className="rounded-lg border border-white/10 bg-white/5 p-1.5 text-white/70 hover:bg-white/10">
              <MoreHorizontal size={16} />
            </button>
          </div>
          <div className="h-40">
            <ResponsiveContainer>
              <AreaChart data={ORDER_SERIES}>
                <defs>
                  <linearGradient id="g1" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#86efac" stopOpacity={0.45} />
                    <stop offset="80%" stopColor="#86efac" stopOpacity={0.08} />
                    <stop offset="100%" stopColor="#86efac" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid stroke="rgba(255,255,255,0.06)" vertical={false} />
                <XAxis dataKey="label" stroke="rgba(255,255,255,0.55)" tickMargin={8} />
                <YAxis hide />
                <Tooltip
                  contentStyle={{
                    background: "#0f1217",
                    border: "1px solid rgba(255,255,255,0.12)",
                    borderRadius: 12,
                    color: "white",
                  }}
                />
                <Area type="monotone" dataKey="a" stroke="#86efac" strokeWidth={2} fill="url(#g1)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Glass>

        {/* Revenue Generated */}
        <Glass className="p-4 lg:col-span-2">
          <div className="mb-2 flex items-start justify-between">
            <div>
              <div className="text-xs text-white/70">
                Revenue Generated{" "}
                <span className="ml-2 text-rose-300">Total decreased ▼ 0.86%</span>
              </div>
              <div className="mt-1 text-2xl font-semibold text-white"> ৳12,501.00 </div>
              <div className="text-xs text-white/60">Total Order Completed</div>
            </div>
            <button className="rounded-lg border border-white/10 bg-white/5 p-1.5 text-white/70 hover:bg-white/10">
              <MoreHorizontal size={16} />
            </button>
          </div>
          <div className="h-40">
            <ResponsiveContainer>
              <LineChart data={REVENUE_SERIES}>
                <CartesianGrid stroke="rgba(255,255,255,0.06)" vertical={false} />
                <XAxis dataKey="label" stroke="rgba(255,255,255,0.55)" tickMargin={8} />
                <YAxis hide />
                <Tooltip
                  contentStyle={{
                    background: "#0f1217",
                    border: "1px solid rgba(255,255,255,0.12)",
                    borderRadius: 12,
                    color: "white",
                  }}
                />
                <Line type="monotone" dataKey="a" stroke="#93c5fd" strokeWidth={2} dot={false} />
                <Line type="monotone" dataKey="b" stroke="rgba(255,255,255,0.35)" strokeWidth={1.5} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </Glass>
      </div>

      {/* Mini KPI tiles */}
      <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <MiniTile title="All Session" value="245.15k" delta="+1.11%" up />
        <MiniTile title="Product Views" value="154.12k" delta="+2.11%" up />
        <MiniTile title="In the Cart" value="101.05k" delta="+1.11%" up />
        <MiniTile title="Ordered" value="95.34k" delta="-0.11%" up={false} tone="info" />
      </div>

      {/* Demand Forecast */}
      <Glass className="mt-6 p-5">
        <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <h2 className="text-lg font-semibold text-white">Demand Forecast</h2>
          <div className="flex items-center gap-2">
            <select
              value={productId}
              onChange={(e) => setProductId(Number(e.target.value))}
              className="h-10 rounded-xl border border-white/10 bg-white/5 px-3 text-sm text-white"
            >
              {products.map((p) => (
                <option key={p.id} value={p.id} className="bg-[#0b0d10]">
                  {p.sku} — {p.name}
                </option>
              ))}
            </select>
            <select
              value={horizon}
              onChange={(e) => setHorizon(Number(e.target.value))}
              className="h-10 rounded-xl border border-white/10 bg-white/5 px-3 text-sm text-white"
            >
              {[7, 14, 21, 28].map((h) => (
                <option key={h} value={h} className="bg-[#0b0d10]">
                  {h} days
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="h-[360px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={rows}>
              <defs>
                <linearGradient id="f1" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#8b93ff" stopOpacity={0.45} />
                  <stop offset="70%" stopColor="#8b93ff" stopOpacity={0.12} />
                  <stop offset="100%" stopColor="#8b93ff" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid stroke="rgba(255,255,255,0.06)" vertical={false} />
              <XAxis dataKey="date" stroke="rgba(255,255,255,0.5)" tickMargin={8} />
              <YAxis hide />
              <Tooltip
                cursor={{ stroke: "rgba(255,255,255,0.12)", strokeWidth: 1 }}
                contentStyle={{
                  background: "#0f1217",
                  border: "1px solid rgba(255,255,255,0.12)",
                  borderRadius: 12,
                  color: "white",
                }}
              />
              <Area type="monotone" dataKey="qty" stroke="#8b93ff" strokeWidth={2} fill="url(#f1)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </Glass>
    </>
  );
}
