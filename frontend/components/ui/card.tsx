import { cn } from "@/lib/cn";

export function Card({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "rounded-2xl border border-base-border bg-base-card/90 backdrop-blur-md shadow-soft",
        "hover:border-neutral-700 transition",
        className
      )}
      {...props}
    />
  );
}
