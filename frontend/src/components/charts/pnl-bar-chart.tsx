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
import type { PnlByGroup } from "@/lib/types";
import { formatCurrency } from "@/lib/formatters";

interface PnlBarChartProps {
  data: PnlByGroup[];
  title?: string;
  height?: number;
}

export function PnlBarChart({ data, height = 300 }: PnlBarChartProps) {
  if (data.length === 0) {
    return (
      <div
        className="flex items-center justify-center text-sm text-slate-500"
        style={{ height }}
      >
        No data yet
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={height}>
      <BarChart data={data} margin={{ top: 4, right: 4, bottom: 4, left: 4 }}>
        <XAxis
          dataKey="group"
          tick={{ fill: "#94a3b8", fontFamily: "ui-monospace", fontSize: 11 }}
          axisLine={{ stroke: "#334155" }}
          tickLine={{ stroke: "#334155" }}
        />
        <YAxis
          tick={{ fill: "#94a3b8", fontFamily: "ui-monospace", fontSize: 11 }}
          axisLine={{ stroke: "#334155" }}
          tickLine={{ stroke: "#334155" }}
          tickFormatter={(v: number) => formatCurrency(v)}
        />
        <Tooltip
          contentStyle={{
            backgroundColor: "#1e293b",
            border: "1px solid #334155",
            borderRadius: "8px",
            fontFamily: "ui-monospace",
            fontSize: "12px",
          }}
          labelStyle={{ color: "#f8fafc" }}
          formatter={(value) => [formatCurrency(Number(value)), "P&L (CAD)"]}
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
