import { cn } from "@/lib/utils";
import { ButtonHTMLAttributes, forwardRef } from "react";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "outline" | "ghost" | "danger" | "gold";
  size?: "sm" | "md" | "lg";
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "primary", size = "md", ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={cn(
          "inline-flex items-center justify-center font-medium transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold-400 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-40",
          {
            "bg-charcoal text-white hover:bg-gold-700":
              variant === "primary",
            "bg-gold-50 text-charcoal hover:bg-gold-100":
              variant === "secondary",
            "border border-gold-200 bg-transparent text-charcoal/70 hover:border-gold-500 hover:text-gold-700":
              variant === "outline",
            "bg-transparent text-charcoal/60 hover:text-gold-600":
              variant === "ghost",
            "bg-red-600 text-white hover:bg-red-700": variant === "danger",
            "bg-gold-500 text-white hover:bg-gold-600": variant === "gold",
          },
          {
            "h-8 px-4 text-[11px] uppercase tracking-[0.15em]": size === "sm",
            "h-10 px-5 text-[12px] uppercase tracking-[0.15em]": size === "md",
            "h-12 px-8 text-[12px] uppercase tracking-[0.2em]": size === "lg",
          },
          className
        )}
        {...props}
      />
    );
  }
);

Button.displayName = "Button";

export { Button };
