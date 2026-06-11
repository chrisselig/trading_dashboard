"use client";

import { usePerformance } from "@/hooks/useApi";
import { KpiCard } from "@/components/ui/kpi-card";
import { Card, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { EquityCurve } from "@/components/charts/equity-curve";
import { PnlBarChart } from "@/components/charts/pnl-bar-chart";
import { formatCurrency, formatPercent, formatNumber } from "@/lib/formatters";

export default function PerformancePage() {
  const { data, isLoading } = usePerformance();

  if (isLoading || !data) {
    return (
      <div className="space-y-4 p-4 md:p-6">
        <div className="grid grid-cols-2 gap-3 md:grid-cols-5">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-20" />
          ))}
        </div>
        <Skeleton className="h-80" />
      </div>
    );
  }

  const pnlTrend =
    data.total_pnl > 0 ? "up" : data.total_pnl < 0 ? "down" : "neutral";

  return (
    <div className="space-y-4 p-4 md:p-6">
      <h1 className="text-xl font-semibold text-slate-50">
        Performance Analytics
      </h1>

      <div className="grid grid-cols-2 gap-3 md:grid-cols-5">
        <KpiCard
          label="Total P&L"
          value={formatCurrency(data.total_pnl)}
          trend={pnlTrend}
        />
        <KpiCard
          label="Win Rate"
          value={formatPercent(data.win_rate)}
          trend={data.win_rate >= 0.5 ? "up" : "down"}
        />
        <KpiCard
          label="Profit Factor"
          value={formatNumber(data.profit_factor)}
          trend={data.profit_factor >= 1 ? "up" : "down"}
        />
        <KpiCard
          label="Sharpe Ratio"
          value={formatNumber(data.sharpe_ratio)}
          trend={data.sharpe_ratio >= 1 ? "up" : "down"}
        />
        <KpiCard
          label="Max Drawdown"
          value={formatCurrency(data.max_drawdown)}
          trend="down"
        />
      </div>

      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        <KpiCard
          label="Total Trades"
          value={String(data.trade_count)}
        />
        <KpiCard
          label="Best Trade"
          value={formatCurrency(data.best_trade)}
          trend="up"
        />
        <KpiCard
          label="Worst Trade"
          value={formatCurrency(data.worst_trade)}
          trend="down"
        />
        <KpiCard
          label="Avg Win / Loss"
          value={`${formatCurrency(data.avg_win)} / ${formatCurrency(data.avg_loss)}`}
        />
      </div>

      <Card>
        <CardHeader title="Equity Curve" />
        <EquityCurve data={data.equity_curve} height={350} />
      </Card>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader title="P&L by Pair" />
          <PnlBarChart data={data.pnl_by_pair} />
        </Card>
        <Card>
          <CardHeader title="P&L by Strategy" />
          <PnlBarChart data={data.pnl_by_strategy} />
        </Card>
      </div>
    </div>
  );
}
