"use client";

import type { EconomicEvent } from "@/lib/types";
import { formatToET, formatCountdown } from "@/lib/formatters";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/ui/empty-state";
import { useEffect, useState } from "react";

interface EventTableProps {
  events: EconomicEvent[];
  showCountdown?: boolean;
}

function CountdownCell({ scheduledAt }: { scheduledAt: string }) {
  const [text, setText] = useState(() => formatCountdown(scheduledAt));

  useEffect(() => {
    const interval = setInterval(() => {
      setText(formatCountdown(scheduledAt));
    }, 1000);
    return () => clearInterval(interval);
  }, [scheduledAt]);

  return <span className="font-mono text-amber-400">{text}</span>;
}

const impactVariant: Record<string, "loss" | "warning" | "muted"> = {
  high: "loss",
  medium: "warning",
  low: "muted",
};

export function EventTable({ events, showCountdown = false }: EventTableProps) {
  if (events.length === 0) {
    return <EmptyState title="No events" />;
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-slate-700">
            {showCountdown && (
              <th className="px-3 py-2 text-left text-xs font-medium uppercase tracking-wider text-slate-400">
                In
              </th>
            )}
            <th className="px-3 py-2 text-left text-xs font-medium uppercase tracking-wider text-slate-400">
              Time (ET)
            </th>
            <th className="px-3 py-2 text-left text-xs font-medium uppercase tracking-wider text-slate-400">
              Event
            </th>
            <th className="px-3 py-2 text-left text-xs font-medium uppercase tracking-wider text-slate-400">
              Country
            </th>
            <th className="px-3 py-2 text-left text-xs font-medium uppercase tracking-wider text-slate-400">
              Impact
            </th>
            <th className="px-3 py-2 text-left text-xs font-medium uppercase tracking-wider text-slate-400">
              Forecast
            </th>
            <th className="px-3 py-2 text-left text-xs font-medium uppercase tracking-wider text-slate-400">
              Previous
            </th>
            <th className="px-3 py-2 text-left text-xs font-medium uppercase tracking-wider text-slate-400">
              Actual
            </th>
          </tr>
        </thead>
        <tbody>
          {events.map((event) => (
            <tr
              key={event.id}
              className="border-b border-slate-800 transition-colors hover:bg-slate-800/30"
            >
              {showCountdown && (
                <td className="whitespace-nowrap px-3 py-2">
                  <CountdownCell scheduledAt={event.scheduled_at} />
                </td>
              )}
              <td className="whitespace-nowrap px-3 py-2 font-mono text-slate-400">
                {formatToET(event.scheduled_at)}
              </td>
              <td className="px-3 py-2 font-medium text-slate-50">
                {event.title}
              </td>
              <td className="px-3 py-2">
                <Badge variant="muted">{event.country}</Badge>
              </td>
              <td className="px-3 py-2">
                <Badge variant={impactVariant[event.impact] ?? "muted"}>
                  {event.impact}
                </Badge>
              </td>
              <td className="whitespace-nowrap px-3 py-2 font-mono text-slate-300">
                {event.forecast ?? "-"}
              </td>
              <td className="whitespace-nowrap px-3 py-2 font-mono text-slate-400">
                {event.previous ?? "-"}
              </td>
              <td className="whitespace-nowrap px-3 py-2 font-mono text-slate-50">
                {event.actual ?? "-"}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
