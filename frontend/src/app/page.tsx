"use client";

import { useDashboard } from "@/hooks/useApi";
import { KpiCard } from "@/components/ui/kpi-card";
import { Card, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { EquityCurve } from "@/components/charts/equity-curve";
import { TradeTable } from "@/components/tables/trade-table";
import { EventTable } from "@/components/tables/event-table";
import { formatCurrency, formatCountdown } from "@/lib/formatters";

export default function DashboardPage() {
  const { data, isLoading } = useDashboard();

  if (isLoading || !data) {
    return (
      <div className="space-y-4 p-4 md:p-6">
        <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-20" />
          ))}
        </div>
        <Skeleton className="h-80" />
      </div>
    );
  }

  const pnlTrend =
    data.todays_pnl > 0 ? "up" : data.todays_pnl < 0 ? "down" : "neutral";

  return (
    <div className="space-y-4 p-4 md:p-6">
      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        <KpiCard
          label="Today's P&L"
          value={formatCurrency(data.todays_pnl)}
          trend={pnlTrend}
        />
        <KpiCard
          label="Open Positions"
          value={String(data.open_position_count)}
        />
        <KpiCard
          label="Next Event"
          value={
            data.next_event
              ? formatCountdown(data.next_event.scheduled_at)
              : "None"
          }
          subtitle={data.next_event?.title}
        />
        <KpiCard label="Status" value="Connected" trend="up" />
      </div>

      <Card>
        <CardHeader title="Equity Curve (Recent)" />
        <EquityCurve data={data.equity_curve} height={250} />
      </Card>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader title="Recent Trades" />
          <TradeTable trades={data.recent_trades} />
        </Card>
        <Card>
          <CardHeader title="Upcoming Events" />
          <EventTable events={data.upcoming_events} showCountdown />
        </Card>
      </div>
    </div>
  );
}
