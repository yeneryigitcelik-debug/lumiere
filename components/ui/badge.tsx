import { cn } from "@/lib/utils";

interface BadgeProps {
  variant?: "default" | "success" | "warning" | "danger" | "info" | "gold";
  children: React.ReactNode;
  className?: string;
}

export function Badge({ variant = "default", children, className }: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center px-2.5 py-0.5 text-[10px] uppercase tracking-[0.1em] font-medium",
        {
          "bg-charcoal/5 text-charcoal/70": variant === "default",
          "bg-green-50 text-green-700": variant === "success",
          "bg-amber-50 text-amber-700": variant === "warning",
          "bg-red-50 text-red-700": variant === "danger",
          "bg-blue-50 text-blue-700": variant === "info",
          "bg-gold-50 text-gold-700": variant === "gold",
        },
        className
      )}
    >
      {children}
    </span>
  );
}
