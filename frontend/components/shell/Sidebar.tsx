"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { BarChart3, Boxes, ShoppingCart, AlertTriangle, Settings, LogOut } from "lucide-react";

const nav = [
  { href: "/",          name: "Dashboard", icon: BarChart3 },
  { href: "/inventory", name: "Inventory", icon: Boxes },
  { href: "/sales",     name: "Sales",     icon: ShoppingCart },
  { href: "/dues",      name: "Dues",      icon: AlertTriangle },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="sticky top-0 h-[100dvh] w-[270px] shrink-0 border-r border-white/10 bg-[linear-gradient(180deg,#0c0f14,transparent),radial-gradient(1200px_300px_at_0%_0%,rgba(99,102,241,.12),transparent)] px-5 py-5">
      <div className="mb-6">
        <div className="text-2xl font-semibold text-white">GrowAI</div>
      </div>

      <nav className="space-y-1">
        {nav.map(({ href, name, icon: Icon }) => {
          const active = pathname === href || (href !== "/" && pathname.startsWith(href));
          return (
            <Link
              key={href}
              href={href}
              className={[
                "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition",
                active
                  ? "bg-white/10 text-white shadow-[0_0_0_1px_rgba(255,255,255,0.08)]"
                  : "text-white/75 hover:bg-white/5 hover:text-white",
              ].join(" ")}
            >
              <Icon size={18} className={active ? "text-indigo-300" : "text-white/60"} />
              <span>{name}</span>
              {active && <span className="ml-auto h-2 w-2 rounded-full bg-indigo-400/90 shadow-[0_0_10px_rgba(99,102,241,.8)]" />}
            </Link>
          );
        })}
      </nav>

      <div className="absolute bottom-5 left-0 w-full px-5">
        <div className="space-y-2 rounded-xl border border-white/10 bg-white/5 p-3">
          <button className="flex w-full items-center gap-2 rounded-lg px-2 py-1.5 text-sm text-white/80 hover:bg-white/10">
            <Settings size={16} /> Settings
          </button>
          <button className="flex w-full items-center gap-2 rounded-lg px-2 py-1.5 text-sm text-white/80 hover:bg-white/10">
            <LogOut size={16} /> Logout
          </button>
        </div>
      </div>
    </aside>
  );
}
