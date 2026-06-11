"use client";

import { useState } from "react";
import { useTrades } from "@/hooks/useApi";
import { Card } from "@/components/ui/card";
import { TradeTable } from "@/components/tables/trade-table";
import { Skeleton } from "@/components/ui/skeleton";

const pairs = ["All", "USDZAR", "USDTRY", "USDJPY"];
const statuses = ["All", "open", "closed"];

export default function TradesPage() {
  const [pair, setPair] = useState("All");
  const [status, setStatus] = useState("All");
  const [limit] = useState(100);

  const { data, isLoading } = useTrades({
    pair: pair === "All" ? undefined : pair,
    status: status === "All" ? undefined : status,
    limit,
  });

  return (
    <div className="space-y-4 p-4 md:p-6">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold text-slate-50">Trade Journal</h1>
        <p className="font-mono text-sm text-slate-400">
          {data ? `${data.total} trades` : ""}
        </p>
      </div>

      <div className="flex flex-wrap gap-2">
        <div className="flex gap-1">
          {pairs.map((p) => (
            <button
              key={p}
              onClick={() => setPair(p)}
              className={`rounded-md px-3 py-1.5 text-xs font-medium transition-colors ${
                pair === p
                  ? "bg-slate-700 text-slate-50"
                  : "text-slate-400 hover:bg-slate-800 hover:text-slate-200"
              }`}
            >
              {p}
            </button>
          ))}
        </div>
        <div className="flex gap-1">
          {statuses.map((s) => (
            <button
              key={s}
              onClick={() => setStatus(s)}
              className={`rounded-md px-3 py-1.5 text-xs font-medium capitalize transition-colors ${
                status === s
                  ? "bg-slate-700 text-slate-50"
                  : "text-slate-400 hover:bg-slate-800 hover:text-slate-200"
              }`}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      <Card>
        {isLoading ? (
          <Skeleton className="h-96" />
        ) : (
          <TradeTable trades={data?.trades ?? []} />
        )}
      </Card>
    </div>
  );
}
