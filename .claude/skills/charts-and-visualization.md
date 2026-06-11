# Skill: Charts and Data Visualization

## When to use
When creating or modifying chart components in `frontend/src/components/charts/`.

## Conventions
- **Lightweight Charts** (TradingView) for equity curves and time-series financial data
- **Recharts** for bar charts, pie charts, and statistical distributions
- Dark theme colors matching the project palette
- Monospace font for all financial figures
- Green (emerald-400) for profit, red (red-400) for loss
- All times displayed in Eastern Time (ET) — convert from UTC
- Monetary values in CAD

## Good example

```tsx
// frontend/src/components/charts/equity-curve.tsx
"use client";

import { useEffect, useRef } from "react";
import { createChart, type IChartApi, ColorType } from "lightweight-charts";
import { useQuery } from "@tanstack/react-query";

import { fetchEquityCurve } from "@/lib/api";
import type { EquityPoint } from "@/lib/types";

interface EquityCurveProps {
  days?: number;
}

export function EquityCurve({ days = 30 }: EquityCurveProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<IChartApi | null>(null);

  const { data } = useQuery({
    queryKey: ["equity-curve", days],
    queryFn: () => fetchEquityCurve(days),
  });

  useEffect(() => {
    if (!containerRef.current || !data) return;

    const chart = createChart(containerRef.current, {
      layout: {
        background: { type: ColorType.Solid, color: "#0f172a" },
        textColor: "#94a3b8",
        fontFamily: "ui-monospace, monospace",
      },
      grid: {
        vertLines: { color: "#1e293b" },
        horzLines: { color: "#1e293b" },
      },
      width: containerRef.current.clientWidth,
      height: 300,
      timeScale: { timeVisible: true },
    });

    const series = chart.addAreaSeries({
      lineColor: "#34d399",
      topColor: "rgba(52, 211, 153, 0.2)",
      bottomColor: "rgba(52, 211, 153, 0)",
      lineWidth: 2,
    });

    series.setData(
      data.map((point: EquityPoint) => ({
        time: point.timestamp,
        value: point.equity,
      }))
    );

    chart.timeScale().fitContent();
    chartRef.current = chart;

    const handleResize = () => {
      if (containerRef.current) {
        chart.applyOptions({ width: containerRef.current.clientWidth });
      }
    };
    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
      chart.remove();
    };
  }, [data]);

  return <div ref={containerRef} className="w-full" />;
}
```

```tsx
// frontend/src/components/charts/pnl-by-pair-chart.tsx
"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";
import { useQuery } from "@tanstack/react-query";

import { fetchPnlByPair } from "@/lib/api";
import { formatCurrency } from "@/lib/formatters";

export function PnlByPairChart() {
  const { data } = useQuery({
    queryKey: ["pnl-by-pair"],
    queryFn: fetchPnlByPair,
  });

  if (!data) return null;

  return (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart data={data}>
        <XAxis
          dataKey="pair"
          tick={{ fill: "#94a3b8", fontFamily: "ui-monospace" }}
          axisLine={{ stroke: "#334155" }}
        />
        <YAxis
          tick={{ fill: "#94a3b8", fontFamily: "ui-monospace" }}
          axisLine={{ stroke: "#334155" }}
          tickFormatter={(v: number) => formatCurrency(v)}
        />
        <Tooltip
          contentStyle={{
            backgroundColor: "#1e293b",
            border: "1px solid #334155",
            borderRadius: "8px",
            fontFamily: "ui-monospace",
          }}
          labelStyle={{ color: "#f8fafc" }}
          formatter={(value: number) => [formatCurrency(value), "P&L (CAD)"]}
        />
        <Bar dataKey="total_pnl" radius={[4, 4, 0, 0]}>
          {data.map((entry, index) => (
            <Cell
              key={index}
              fill={entry.total_pnl >= 0 ? "#34d399" : "#f87171"}
            />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}
```

## Bad example

```tsx
// BAD: Using Chart.js or other libraries instead of Lightweight Charts / Recharts
import { Chart } from "chart.js";  // not in the stack — use Lightweight Charts or Recharts

// BAD: Light theme colors on charts
const chart = createChart(container, {
  layout: {
    background: { type: ColorType.Solid, color: "#ffffff" },  // should be slate-900
    textColor: "#000000",  // should be slate-400
  },
});

// BAD: Using non-monospace fonts for financial data
<YAxis tick={{ fill: "#94a3b8", fontFamily: "Arial" }} />
// Financial figures must use monospace: "ui-monospace, monospace"

// BAD: Hardcoded pixel width instead of responsive
<BarChart width={800} height={300} data={data}>
// Use ResponsiveContainer to handle resizing

// BAD: Displaying times in Mountain Time or UTC
cell: ({ getValue }) => {
  const date = new Date(getValue<string>());
  return date.toLocaleString("en-CA", { timeZone: "America/Edmonton" });
  // Display in Eastern Time (ET), not Mountain Time
}

// BAD: Not cleaning up chart on unmount
useEffect(() => {
  const chart = createChart(container, options);
  series.setData(data);
  // Missing return () => chart.remove() — causes memory leak
}, [data]);

// BAD: Displaying values in USD
formatter={(value: number) => [`$${value.toFixed(2)} USD`, "P&L"]}
// All values in CAD
```
