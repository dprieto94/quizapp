import { cn } from "@/lib/cn";

type Props = {
  value: number;
  className?: string;
  "aria-label"?: string;
};

export function ProgressBar({ value, className, "aria-label": ariaLabel }: Props) {
  const v = Math.min(100, Math.max(0, value));
  return (
    <div
      role="progressbar"
      aria-valuenow={v}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-label={ariaLabel}
      className={cn(
        "h-2 w-full overflow-hidden rounded-full bg-border",
        className,
      )}
    >
      <div
        className="h-full bg-primary transition-all duration-300 ease-out"
        style={{ width: `${v}%` }}
      />
    </div>
  );
}
