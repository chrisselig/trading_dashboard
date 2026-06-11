import { cn } from "@/lib/utils";

interface KpiCardProps {
  label: string;
  value: string;
  trend?: "up" | "down" | "neutral";
  subtitle?: string;
}

export function KpiCard({
  label,
  value,
  trend = "neutral",
  subtitle,
}: KpiCardProps) {
  return (
    <div className="rounded-lg border border-slate-700 bg-slate-800/50 p-4">
      <p className="text-xs font-medium uppercase tracking-wider text-slate-400">
        {label}
      </p>
      <p
        className={cn(
          "mt-1 font-mono text-2xl font-semibold",
          trend === "up" && "text-emerald-400",
          trend === "down" && "text-red-400",
          trend === "neutral" && "text-slate-50"
        )}
      >
        {value}
      </p>
      {subtitle && (
        <p className="mt-0.5 text-xs text-slate-500">{subtitle}</p>
      )}
    </div>
  );
}
