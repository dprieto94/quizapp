import { type HTMLAttributes } from "react";
import { cn } from "@/lib/cn";

type Variant = "default" | "success" | "warning" | "danger" | "neutral";

const variants: Record<Variant, string> = {
  default: "bg-primary-soft text-primary",
  success: "bg-success text-white",
  warning: "bg-warning text-foreground",
  danger: "bg-danger text-white",
  neutral: "bg-border text-muted",
};

type BadgeProps = HTMLAttributes<HTMLSpanElement> & { variant?: Variant };

export function Badge({ className, variant = "default", ...props }: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium",
        variants[variant],
        className,
      )}
      {...props}
    />
  );
}
