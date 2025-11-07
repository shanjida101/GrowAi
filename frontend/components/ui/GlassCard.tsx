import { cn } from "@/lib/cn";
export default function GlassCard({className, ...props}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "rounded-2xl border border-base-border bg-[linear-gradient(180deg,rgba(99,102,241,.12),transparent),rgba(15,18,23,.9)] shadow-glass backdrop-blur-md",
        className
      )}
      {...props}
    />
  );
}
