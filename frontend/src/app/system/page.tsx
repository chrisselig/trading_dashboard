"use client";

import { useSystemStatus } from "@/hooks/useApi";
import { KpiCard } from "@/components/ui/kpi-card";
import { Card, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/ui/empty-state";
import { formatToET, formatCurrency, formatNumber } from "@/lib/formatters";
import { cn } from "@/lib/utils";

export default function SystemPage() {
  const { data, isLoading } = useSystemStatus();

  if (isLoading || !data) {
    return (
      <div className="space-y-4 p-4 md:p-6">
        <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-20" />
          ))}
        </div>
        <Skeleton className="h-64" />
      </div>
    );
  }

  return (
    <div className="space-y-4 p-4 md:p-6">
      <h1 className="text-xl font-semibold text-slate-50">System Status</h1>

      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        <KpiCard
          label="Open Positions"
          value={String(data.open_positions.length)}
        />
        <KpiCard
          label="Pending Orders"
          value={String(data.pending_orders.length)}
        />
        <KpiCard
          label="DB Size"
          value={`${formatNumber(data.db_size_mb)} MB`}
        />
        <KpiCard
          label="Last Trade"
          value={data.last_trade_at ? formatToET(data.last_trade_at) : "Never"}
        />
      </div>

      <Card>
        <CardHeader title="Open Positions" />
        {data.open_positions.length === 0 ? (
          <EmptyState title="No open positions" />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-700">
                  <th className="px-3 py-2 text-left text-xs font-medium uppercase tracking-wider text-slate-400">Pair</th>
                  <th className="px-3 py-2 text-left text-xs font-medium uppercase tracking-wider text-slate-400">Side</th>
                  <th className="px-3 py-2 text-left text-xs font-medium uppercase tracking-wider text-slate-400">Qty</th>
                  <th className="px-3 py-2 text-left text-xs font-medium uppercase tracking-wider text-slate-400">Entry</th>
                  <th className="px-3 py-2 text-left text-xs font-medium uppercase tracking-wider text-slate-400">P&L</th>
                </tr>
              </thead>
              <tbody>
                {data.open_positions.map((pos, i) => (
                  <tr key={i} className="border-b border-slate-800">
                    <td className="px-3 py-2 font-medium">{pos.instrument}</td>
                    <td className="px-3 py-2">
                      <Badge variant={pos.side === "BUY" ? "profit" : "loss"}>
                        {pos.side}
                      </Badge>
                    </td>
                    <td className="px-3 py-2 font-mono">{pos.quantity}</td>
                    <td className="px-3 py-2 font-mono">{pos.entry_price.toFixed(5)}</td>
                    <td className={cn(
                      "px-3 py-2 font-mono",
                      (pos.current_pnl ?? 0) >= 0 ? "text-emerald-400" : "text-red-400"
                    )}>
                      {pos.current_pnl != null ? formatCurrency(pos.current_pnl) : "-"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      <Card>
        <CardHeader title="Pending Orders" />
        {data.pending_orders.length === 0 ? (
          <EmptyState title="No pending orders" />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-700">
                  <th className="px-3 py-2 text-left text-xs font-medium uppercase tracking-wider text-slate-400">Pair</th>
                  <th className="px-3 py-2 text-left text-xs font-medium uppercase tracking-wider text-slate-400">Side</th>
                  <th className="px-3 py-2 text-left text-xs font-medium uppercase tracking-wider text-slate-400">Type</th>
                  <th className="px-3 py-2 text-left text-xs font-medium uppercase tracking-wider text-slate-400">Qty</th>
                  <th className="px-3 py-2 text-left text-xs font-medium uppercase tracking-wider text-slate-400">Price</th>
                  <th className="px-3 py-2 text-left text-xs font-medium uppercase tracking-wider text-slate-400">Strategy</th>
                  <th className="px-3 py-2 text-left text-xs font-medium uppercase tracking-wider text-slate-400">Created</th>
                </tr>
              </thead>
              <tbody>
                {data.pending_orders.map((order) => (
                  <tr key={order.id} className="border-b border-slate-800">
                    <td className="px-3 py-2 font-medium">{order.instrument}</td>
                    <td className="px-3 py-2">
                      <Badge variant={order.side === "BUY" ? "profit" : "loss"}>
                        {order.side}
                      </Badge>
                    </td>
                    <td className="px-3 py-2">
                      <Badge variant="muted">{order.order_type}</Badge>
                    </td>
                    <td className="px-3 py-2 font-mono">{order.quantity}</td>
                    <td className="px-3 py-2 font-mono">
                      {order.price?.toFixed(5) ?? "-"}
                    </td>
                    <td className="px-3 py-2">
                      <Badge variant="muted">{order.strategy || "-"}</Badge>
                    </td>
                    <td className="px-3 py-2 font-mono text-slate-400">
                      {formatToET(order.created_at)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {data.bot_config && (
        <Card>
          <CardHeader title="Bot Configuration" />
          <div className="grid grid-cols-2 gap-x-6 gap-y-2 text-sm md:grid-cols-3">
            <div>
              <span className="text-slate-400">Instruments:</span>{" "}
              <span className="font-mono text-slate-50">
                {data.bot_config.instruments.join(", ")}
              </span>
            </div>
            <div>
              <span className="text-slate-400">Timeframe:</span>{" "}
              <span className="font-mono text-slate-50">
                {data.bot_config.default_timeframe}
              </span>
            </div>
            <div>
              <span className="text-slate-400">Max Positions:</span>{" "}
              <span className="font-mono text-slate-50">
                {data.bot_config.max_concurrent_positions}
              </span>
            </div>
            <div>
              <span className="text-slate-400">Max Risk/Trade:</span>{" "}
              <span className="font-mono text-slate-50">
                {data.bot_config.max_risk_per_trade_pct}%
              </span>
            </div>
            <div>
              <span className="text-slate-400">Max Daily DD:</span>{" "}
              <span className="font-mono text-slate-50">
                {data.bot_config.max_daily_drawdown_pct}%
              </span>
            </div>
            <div>
              <span className="text-slate-400">Max Spread:</span>{" "}
              <span className="font-mono text-slate-50">
                {data.bot_config.max_spread_pips} pips
              </span>
            </div>
            <div>
              <span className="text-slate-400">Straddle Distance:</span>{" "}
              <span className="font-mono text-slate-50">
                {data.bot_config.straddle_distance_pips} pips
              </span>
            </div>
            <div>
              <span className="text-slate-400">Straddle TP:</span>{" "}
              <span className="font-mono text-slate-50">
                {data.bot_config.straddle_tp_pips} pips
              </span>
            </div>
            <div>
              <span className="text-slate-400">Straddle SL:</span>{" "}
              <span className="font-mono text-slate-50">
                {data.bot_config.straddle_sl_pips} pips
              </span>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
}
