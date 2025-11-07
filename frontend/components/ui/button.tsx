// simple classnames utility to avoid importing from '@/lib/cn'
function cn(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(" ");
}

export function Button({
  className,
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      className={cn(
        "rounded-xl px-4 py-2 text-sm font-medium",
        "bg-white/10 hover:bg-white/15 border border-base-border transition",
        "focus:outline-none focus:ring-2 focus:ring-white/20",
        className
      )}
      {...props}
    />
  );
}
