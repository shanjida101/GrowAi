import { cn } from "@/lib/cn";

export function SectionTitle({ children }: { children: React.ReactNode }) {
  return <h2 className="text-lg font-semibold tracking-tight">{children}</h2>;
}

export function Panel({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "rounded-2xl border border-base-border bg-white/[.04] shadow-soft backdrop-blur",
        className
      )}
      {...props}
    />
  );
}
