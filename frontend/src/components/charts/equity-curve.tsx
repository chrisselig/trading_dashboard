"use client";

import { useEffect, useRef } from "react";
import { createChart, ColorType, AreaSeries, type IChartApi, type Time } from "lightweight-charts";
import type { EquityPoint } from "@/lib/types";

interface EquityCurveProps {
  data: EquityPoint[];
  height?: number;
}

export function EquityCurve({ data, height = 300 }: EquityCurveProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<IChartApi | null>(null);

  useEffect(() => {
    if (!containerRef.current || data.length === 0) return;

    const chart = createChart(containerRef.current, {
      layout: {
        background: { type: ColorType.Solid, color: "transparent" },
        textColor: "#94a3b8",
        fontFamily: "ui-monospace, SFMono-Regular, monospace",
        fontSize: 11,
      },
      grid: {
        vertLines: { color: "#1e293b" },
        horzLines: { color: "#1e293b" },
      },
      width: containerRef.current.clientWidth,
      height,
      rightPriceScale: { borderColor: "#334155" },
      timeScale: { borderColor: "#334155", timeVisible: true },
      crosshair: {
        horzLine: { color: "#475569", labelBackgroundColor: "#334155" },
        vertLine: { color: "#475569", labelBackgroundColor: "#334155" },
      },
    });

    const lastEquity = data[data.length - 1]?.equity ?? 0;
    const isPositive = lastEquity >= 0;
    const lineColor = isPositive ? "#34d399" : "#f87171";
    const topColor = isPositive
      ? "rgba(52, 211, 153, 0.2)"
      : "rgba(248, 113, 113, 0.2)";

    const series = chart.addSeries(AreaSeries, {
      lineColor,
      topColor,
      bottomColor: "transparent",
      lineWidth: 2,
    });

    series.setData(
      data.map((point) => ({
        time: point.timestamp as unknown as Time,
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
  }, [data, height]);

  if (data.length === 0) {
    return (
      <div
        className="flex items-center justify-center text-sm text-slate-500"
        style={{ height }}
      >
        No equity data yet
      </div>
    );
  }

  return <div ref={containerRef} className="w-full" />;
}
