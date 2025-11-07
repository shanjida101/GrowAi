"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/cn";
import { BarChart2, Package, Layers, AlertTriangle } from "lucide-react";

const links = [
  { href: "/", label: "Dashboard", icon: BarChart2 },
  { href: "/inventory", label: "Inventory", icon: Package },
  { href: "/sales", label: "Sales", icon: Layers },
  { href: "/dues", label: "Dues", icon: AlertTriangle },
];

export default function Nav() {
  const pathname = usePathname();
  return (
    <nav className="flex items-center justify-between mb-6">
      <Link href="/" className="text-xl font-semibold tracking-tight">
        GrowAI
      </Link>
      <ul className="flex gap-1 rounded-2xl border border-base-border bg-base-card/60 p-1">
        {links.map(({ href, label, icon: Icon }) => (
          <li key={href}>
            <Link
              href={href}
              className={cn(
                "flex items-center gap-2 rounded-xl px-3 py-2 text-sm text-base-mute hover:text-white transition",
                pathname === href && "bg-white/10 text-white"
              )}
            >
              <Icon size={16} />
              {label}
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}
