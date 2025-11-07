import { cn } from "@/lib/cn";

export function StatCard({
  label, value, delta, className
}: { label:string; value:string; delta?:string; className?:string }) {
  return (
    <div className={cn(
      "rounded-2xl border border-base-border bg-base-card/80 shadow-glass backdrop-blur-md p-4",
      className
    )}>
      <div className="text-xs text-base-mute">{label}</div>
      <div className="mt-1 flex items-baseline gap-2">
        <div className="text-2xl font-semibold">{value}</div>
        {delta && <span className="rounded-pill bg-mint-500/15 text-mint-500 text-[11px] px-2 py-0.5">{delta}</span>}
      </div>
      <div className="mt-3 h-1.5 w-full rounded-pill bg-white/5 overflow-hidden">
        <div className="h-full w-2/3 bg-gradient-to-r from-brand-500 to-mint-500"></div>
      </div>
    </div>
  );
}
