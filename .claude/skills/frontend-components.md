# Skill: Frontend Components (Next.js + React + TypeScript)

## When to use
When creating or modifying React components in `frontend/src/`.

## Conventions
- TypeScript strict mode — no `any` types, no `@ts-ignore`
- Functional components with hooks, no class components
- File naming: `kebab-case.tsx` for components, `camelCase.ts` for utilities
- Colocate tests: `component.test.tsx` next to `component.tsx`
- Server components by default, `"use client"` only when needed (interactivity, hooks)
- TanStack Query for data fetching (caching + refetching)
- shadcn/ui for UI primitives, Tailwind CSS v4 for styling

## Good example

```tsx
// frontend/src/components/tables/trade-table.tsx
"use client";

import { useQuery } from "@tanstack/react-query";
import {
  useReactTable,
  getCoreRowModel,
  flexRender,
  type ColumnDef,
} from "@tanstack/react-table";

import { fetchTrades } from "@/lib/api";
import type { Trade } from "@/lib/types";
import { formatCurrency, formatPips } from "@/lib/formatters";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";

const columns: ColumnDef<Trade>[] = [
  {
    accessorKey: "opened_at",
    header: "Date",
    cell: ({ getValue }) => formatToET(getValue<string>()),
  },
  {
    accessorKey: "instrument",
    header: "Pair",
  },
  {
    accessorKey: "pnl_cad",
    header: "P&L (CAD)",
    cell: ({ getValue }) => {
      const value = getValue<number>();
      return (
        <span className={value >= 0 ? "text-emerald-400" : "text-red-400"}>
          {formatCurrency(value)}
        </span>
      );
    },
  },
];

interface TradeTableProps {
  pair?: string;
}

export function TradeTable({ pair }: TradeTableProps) {
  const { data, isLoading } = useQuery({
    queryKey: ["trades", pair],
    queryFn: () => fetchTrades({ pair }),
  });

  const table = useReactTable({
    data: data?.trades ?? [],
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  if (isLoading) {
    return <Skeleton className="h-96 w-full" />;
  }

  return (
    <Table>
      <TableHeader>
        {table.getHeaderGroups().map((headerGroup) => (
          <TableRow key={headerGroup.id}>
            {headerGroup.headers.map((header) => (
              <TableHead key={header.id}>
                {flexRender(header.column.columnDef.header, header.getContext())}
              </TableHead>
            ))}
          </TableRow>
        ))}
      </TableHeader>
      <TableBody>
        {table.getRowModel().rows.map((row) => (
          <TableRow key={row.id}>
            {row.getVisibleCells().map((cell) => (
              <TableCell key={cell.id} className="font-mono">
                {flexRender(cell.column.columnDef.cell, cell.getContext())}
              </TableCell>
            ))}
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
```

```tsx
// frontend/src/app/trades/page.tsx (server component — no "use client")
import { TradeTable } from "@/components/tables/trade-table";

export default function TradesPage() {
  return (
    <div className="space-y-6 p-6">
      <h1 className="text-2xl font-semibold text-slate-50">Trade Journal</h1>
      <TradeTable />
    </div>
  );
}
```

## Bad example

```tsx
// BAD: Using `any` type
const TradeTable = ({ data }: any) => {  // no `any` — define a proper interface
  return <div>{data.map((d: any) => <p>{d}</p>)}</div>;
};

// BAD: Class component
class TradeTable extends React.Component {  // use functional components only
  render() { return <div />; }
}

// BAD: File named TradeTable.tsx or trade_table.tsx
// Should be: trade-table.tsx (kebab-case)

// BAD: Using useEffect + useState for data fetching instead of TanStack Query
const [trades, setTrades] = useState([]);
const [loading, setLoading] = useState(true);
useEffect(() => {
  fetch("/api/trades")
    .then((r) => r.json())
    .then((d) => { setTrades(d); setLoading(false); });
}, []);
// Use TanStack Query instead — it handles caching, refetching, error states

// BAD: Hardcoding colors instead of using the palette
<span style={{ color: "green" }}>+$100</span>  // use text-emerald-400 / text-red-400

// BAD: Adding "use client" to a page that doesn't need interactivity
"use client";  // unnecessary — server components by default
export default function TradesPage() {
  return <h1>Trades</h1>;
}

// BAD: Displaying monetary values in USD
<span>${trade.pnl.toFixed(2)} USD</span>
// All values are in CAD (account base currency)
```
