import { cn } from "@/lib/utils";
import { InputHTMLAttributes, forwardRef } from "react";

const Input = forwardRef<
  HTMLInputElement,
  InputHTMLAttributes<HTMLInputElement>
>(({ className, ...props }, ref) => {
  return (
    <input
      ref={ref}
      className={cn(
        "flex h-10 w-full border border-gold-200 bg-white px-3 py-2 text-sm text-charcoal placeholder:text-charcoal/30 focus:border-gold-500 focus:outline-none focus:ring-1 focus:ring-gold-500 disabled:cursor-not-allowed disabled:opacity-40",
        className
      )}
      {...props}
    />
  );
});

Input.displayName = "Input";

export { Input };
