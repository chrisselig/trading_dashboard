import { cn } from "@/lib/utils";

interface BadgeProps {
  children: React.ReactNode;
  variant?: "default" | "profit" | "loss" | "warning" | "muted";
  className?: string;
}

const variantStyles: Record<string, string> = {
  default: "bg-slate-700 text-slate-200",
  profit: "bg-emerald-400/10 text-emerald-400",
  loss: "bg-red-400/10 text-red-400",
  warning: "bg-amber-400/10 text-amber-400",
  muted: "bg-slate-700/50 text-slate-400",
};

export function Badge({ children, variant = "default", className }: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-md px-2 py-0.5 text-xs font-medium",
        variantStyles[variant],
        className
      )}
    >
      {children}
    </span>
  );
}
