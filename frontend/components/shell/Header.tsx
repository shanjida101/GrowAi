"use client";
import { Search } from "lucide-react";
export default function Header() {
  return (
    <header className="flex items-center justify-between mb-5">
      <div className="relative w-full max-w-[520px]">
        <Search className="absolute left-3 top-2.5 h-4 w-4 text-base-mute" />
        <input
          placeholder="Search products, customers, actions…"
          className="w-full rounded-pill bg-white/5 pl-9 pr-3 py-2 text-sm border border-base-border outline-none focus:ring-2 focus:ring-white/10"
        />
      </div>
      <div className="flex items-center gap-3 rounded-pill bg-white/5 border border-base-border px-3 py-1.5">
        <div className="h-6 w-6 rounded-full bg-gradient-to-br from-brand-500 to-mint-500" />
        <span className="text-sm">Admin</span>
      </div>
    </header>
  );
}
