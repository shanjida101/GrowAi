"use client";

import * as Select from "@radix-ui/react-select";
import { ChevronDown, Check } from "lucide-react";
import { cn } from "@/lib/cn";

export type Option = { value: string; label: string; disabled?: boolean };

export default function FancySelect({
  value,
  onChange,
  options,
  placeholder = "Select…",
  className,
  contentClassName,
  align = "end",
  size = "md",
}: {
  value: string | undefined;
  onChange: (v: string) => void;
  options: Option[];
  placeholder?: string;
  className?: string;
  contentClassName?: string;
  align?: "start" | "center" | "end";
  size?: "sm" | "md";
}) {
  const sizes = {
    sm: "h-9 text-sm px-3",
    md: "h-10 text-sm px-4",
  }[size];

  return (
    <Select.Root value={value} onValueChange={onChange}>
      <Select.Trigger
        className={cn(
          "inline-flex items-center justify-between rounded-xl border border-base-border",
          "bg-white/[.06] backdrop-blur outline-none hover:bg-white/[.10] transition",
          "focus:ring-2 focus:ring-white/10",
          sizes,
          className
        )}
      >
        <Select.Value placeholder={placeholder} />
        <Select.Icon className="ml-2 opacity-70">
          <ChevronDown size={16} />
        </Select.Icon>
      </Select.Trigger>

      <Select.Portal>
        <Select.Content
          align={align}
          sideOffset={8}
          className={cn(
            "z-50 overflow-hidden rounded-xl border border-base-border shadow-soft",
            "bg-base-card/95 backdrop-blur",
            contentClassName
          )}
        >
          <Select.Viewport className="p-1">
            {options.map((opt) => (
              <Select.Item
                key={opt.value}
                value={opt.value}
                disabled={opt.disabled}
                className={cn(
                  "group relative flex cursor-pointer select-none items-center",
                  "rounded-lg px-3 py-2 text-sm text-base-text/90 hover:text-white",
                  "outline-none data-[disabled]:opacity-50 data-[disabled]:cursor-not-allowed",
                  "hover:bg-white/10"
                )}
              >
                <Select.ItemText>{opt.label}</Select.ItemText>
                <Select.ItemIndicator className="absolute right-2 opacity-80">
                  <Check size={16} />
                </Select.ItemIndicator>
              </Select.Item>
            ))}
          </Select.Viewport>
        </Select.Content>
      </Select.Portal>
    </Select.Root>
  );
}
