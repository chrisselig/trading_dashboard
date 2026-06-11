# Skill: Styling and Theming (Dark Theme, Hedge-Fund Grade UI)

## When to use
When styling components, creating layouts, or working with the design system in `frontend/src/`.

## Conventions
- Dark theme by default (slate/zinc backgrounds)
- Data-dense layouts — maximize information per screen
- Monospace numbers for all financial figures
- Color coding: emerald-400 profit, red-400 loss, amber-400 warning, violet-500 accent
- Mobile-responsive — usable on phone
- Bloomberg Terminal meets modern web — professional, not flashy
- shadcn/ui for primitives, Tailwind CSS v4 for custom styling

## Color palette reference
```
Background:     slate-950 (#020617)
Surface:        slate-900 (#0f172a)
Card:           slate-800/50 with border-slate-700
Text primary:   slate-50
Text secondary: slate-400
Profit/Up:      emerald-400 (#34d399)
Loss/Down:      red-400 (#f87171)
Warning:        amber-400 (#fbbf24)
Accent:         violet-500 (#8b5cf6)
```

## Good example

```tsx
// frontend/src/components/layout/dashboard-card.tsx
interface DashboardCardProps {
  title: string;
  children: React.ReactNode;
}

export function DashboardCard({ title, children }: DashboardCardProps) {
  return (
    <div className="rounded-lg border border-slate-700 bg-slate-800/50 p-4">
      <h3 className="mb-3 text-sm font-medium text-slate-400">{title}</h3>
      {children}
    </div>
  );
}
```

```tsx
// frontend/src/components/layout/kpi-card.tsx
import { cn } from "@/lib/utils";

interface KpiCardProps {
  label: string;
  value: string;
  trend?: "up" | "down" | "neutral";
}

export function KpiCard({ label, value, trend = "neutral" }: KpiCardProps) {
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
    </div>
  );
}
```

```tsx
// Good: Data-dense dashboard grid, mobile responsive
<div className="grid grid-cols-2 gap-3 md:grid-cols-4">
  <KpiCard label="Today's P&L" value="$142.30" trend="up" />
  <KpiCard label="Win Rate" value="68.2%" trend="up" />
  <KpiCard label="Open Positions" value="2" />
  <KpiCard label="Next Event" value="14m 32s" />
</div>

// Good: P&L value with correct color coding and monospace
<span className={cn(
  "font-mono",
  pnl >= 0 ? "text-emerald-400" : "text-red-400"
)}>
  {pnl >= 0 ? "+" : ""}{formatCurrency(pnl)}
</span>

// Good: Skeleton loader instead of spinner
<Skeleton className="h-8 w-24 bg-slate-700" />
```

## Bad example

```tsx
// BAD: Light theme colors
<div className="bg-white text-black border-gray-200">
// Should be: bg-slate-800/50 text-slate-50 border-slate-700

// BAD: Inline styles instead of Tailwind
<div style={{ backgroundColor: "#0f172a", padding: "16px", borderRadius: "8px" }}>
// Use Tailwind classes: bg-slate-900 p-4 rounded-lg

// BAD: Sans-serif font for financial numbers
<span className="text-2xl font-sans">{trade.pnl}</span>
// Financial figures need monospace: className="font-mono"

// BAD: Using generic green/red instead of palette colors
<span className="text-green-500">+$100</span>
// Use emerald-400 for profit: text-emerald-400

// BAD: Loading spinner instead of skeleton
<div className="flex items-center justify-center h-96">
  <Spinner />  {/* Use Skeleton loaders for cached data */}
</div>

// BAD: Too much whitespace, not data-dense
<div className="space-y-12 p-12">
  <div className="max-w-md mx-auto">
    {/* Wasting screen real estate — maximize info density */}
  </div>
</div>

// BAD: Not mobile responsive
<div className="grid grid-cols-4 gap-6">  {/* breaks on mobile */}
// Use responsive breakpoints: grid-cols-2 md:grid-cols-4

// BAD: Flashy gradients, animations, decorative elements
<div className="bg-gradient-to-r from-purple-500 to-pink-500 animate-pulse shadow-2xl">
// Bloomberg Terminal, not a landing page. Keep it professional.
```
