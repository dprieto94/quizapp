"use client";

import { type InputHTMLAttributes } from "react";
import { cn } from "@/lib/cn";

export function Input({
  className,
  ...props
}: InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      className={cn(
        "block w-full h-11 rounded-lg border border-border bg-background px-3",
        "text-foreground placeholder:text-muted",
        "transition-colors duration-150",
        "focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-0 focus:border-primary",
        "disabled:opacity-50 disabled:cursor-not-allowed disabled:bg-primary-soft/30",
        "aria-invalid:border-danger aria-invalid:focus:ring-danger aria-invalid:focus:border-danger",
        className,
      )}
      {...props}
    />
  );
}
