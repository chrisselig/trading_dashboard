"use client";

import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  flexRender,
  type ColumnDef,
  type SortingState,
} from "@tanstack/react-table";
import { useState } from "react";
import { ArrowUpDown } from "lucide-react";

import type { Trade } from "@/lib/types";
import { formatToET, formatCurrency, formatPips } from "@/lib/formatters";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/ui/empty-state";

const columns: ColumnDef<Trade>[] = [
  {
    accessorKey: "opened_at",
    header: ({ column }) => (
      <button
        className="flex items-center gap-1"
        onClick={() => column.toggleSorting()}
      >
        Date <ArrowUpDown className="h-3 w-3" />
      </button>
    ),
    cell: ({ getValue }) => (
      <span className="text-slate-400">
        {formatToET(getValue<string>())}
      </span>
    ),
  },
  {
    accessorKey: "instrument",
    header: "Pair",
    cell: ({ getValue }) => (
      <span className="font-medium">{getValue<string>()}</span>
    ),
  },
  {
    accessorKey: "side",
    header: "Side",
    cell: ({ getValue }) => {
      const side = getValue<string>();
      return (
        <Badge variant={side === "BUY" ? "profit" : "loss"}>
          {side}
        </Badge>
      );
    },
  },
  {
    accessorKey: "entry_price",
    header: "Entry",
    cell: ({ getValue }) => getValue<number>().toFixed(5),
  },
  {
    accessorKey: "exit_price",
    header: "Exit",
    cell: ({ getValue }) => {
      const v = getValue<number | null>();
      return v != null ? v.toFixed(5) : "-";
    },
  },
  {
    accessorKey: "pnl_pips",
    header: "Pips",
    cell: ({ getValue }) => {
      const v = getValue<number | null>();
      if (v == null) return "-";
      return (
        <span className={cn(v >= 0 ? "text-emerald-400" : "text-red-400")}>
          {formatPips(v)}
        </span>
      );
    },
  },
  {
    accessorKey: "pnl",
    header: ({ column }) => (
      <button
        className="flex items-center gap-1"
        onClick={() => column.toggleSorting()}
      >
        P&L <ArrowUpDown className="h-3 w-3" />
      </button>
    ),
    cell: ({ getValue }) => {
      const v = getValue<number | null>();
      if (v == null) return "-";
      return (
        <span className={cn(v >= 0 ? "text-emerald-400" : "text-red-400")}>
          {formatCurrency(v)}
        </span>
      );
    },
  },
  {
    accessorKey: "strategy",
    header: "Strategy",
    cell: ({ getValue }) => {
      const v = getValue<string>();
      return v ? <Badge variant="muted">{v}</Badge> : "-";
    },
  },
  {
    accessorKey: "closed_at",
    header: "Status",
    cell: ({ getValue }) =>
      getValue<string | null>() ? (
        <Badge variant="muted">Closed</Badge>
      ) : (
        <Badge variant="warning">Open</Badge>
      ),
  },
];

interface TradeTableProps {
  trades: Trade[];
}

export function TradeTable({ trades }: TradeTableProps) {
  const [sorting, setSorting] = useState<SortingState>([
    { id: "opened_at", desc: true },
  ]);

  const table = useReactTable({
    data: trades,
    columns,
    state: { sorting },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
  });

  if (trades.length === 0) {
    return <EmptyState title="No trades yet" description="Trades will appear here once the bot starts trading" />;
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          {table.getHeaderGroups().map((headerGroup) => (
            <tr key={headerGroup.id} className="border-b border-slate-700">
              {headerGroup.headers.map((header) => (
                <th
                  key={header.id}
                  className="px-3 py-2 text-left text-xs font-medium uppercase tracking-wider text-slate-400"
                >
                  {header.isPlaceholder
                    ? null
                    : flexRender(
                        header.column.columnDef.header,
                        header.getContext()
                      )}
                </th>
              ))}
            </tr>
          ))}
        </thead>
        <tbody>
          {table.getRowModel().rows.map((row) => (
            <tr
              key={row.id}
              className="border-b border-slate-800 transition-colors hover:bg-slate-800/30"
            >
              {row.getVisibleCells().map((cell) => (
                <td key={cell.id} className="whitespace-nowrap px-3 py-2 font-mono">
                  {flexRender(cell.column.columnDef.cell, cell.getContext())}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
