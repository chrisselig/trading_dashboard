# Skill: Timestamps, Currency, and Data Formatting

## When to use
When formatting dates, times, currencies, or financial metrics for display.

## Conventions
- Backend returns all timestamps as UTC ISO 8601
- Frontend converts and displays in Eastern Time (ET) — industry standard for US economic releases
- User is in Mountain Time (America/Edmonton) but display is ET
- All monetary values in CAD (account base currency)
- OANDA is NOT available in Alberta — never suggest it
- Monospace font for all numerical/financial displays

## Good example

```typescript
// frontend/src/lib/formatters.ts

const etFormatter = new Intl.DateTimeFormat("en-US", {
  timeZone: "America/New_York",
  month: "short",
  day: "numeric",
  hour: "2-digit",
  minute: "2-digit",
  hour12: true,
});

export function formatToET(isoString: string): string {
  return etFormatter.format(new Date(isoString));
}

const cadFormatter = new Intl.NumberFormat("en-CA", {
  style: "currency",
  currency: "CAD",
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

export function formatCurrency(value: number): string {
  return cadFormatter.format(value);
}

export function formatPips(value: number): string {
  const sign = value >= 0 ? "+" : "";
  return `${sign}${value.toFixed(1)} pips`;
}

export function formatPercent(value: number): string {
  return `${(value * 100).toFixed(1)}%`;
}

export function formatSharpe(value: number): string {
  return value.toFixed(2);
}
```

```python
# backend — always return UTC ISO 8601
from datetime import datetime, timezone

class TradeResponse(BaseModel):
    opened_at: datetime  # Pydantic serializes as ISO 8601 UTC by default
    closed_at: datetime | None
```

```tsx
// frontend — display with correct formatting
<TableCell className="font-mono text-slate-400">
  {formatToET(trade.opened_at)}
</TableCell>
<TableCell className={cn(
  "font-mono",
  trade.pnl_cad >= 0 ? "text-emerald-400" : "text-red-400"
)}>
  {formatCurrency(trade.pnl_cad)}
</TableCell>
<TableCell className="font-mono text-slate-50">
  {formatPips(trade.pnl_pips)}
</TableCell>
```

## Bad example

```typescript
// BAD: Displaying in Mountain Time
const mtFormatter = new Intl.DateTimeFormat("en-US", {
  timeZone: "America/Edmonton",  // display in ET, not MT
});

// BAD: Displaying in UTC without conversion
<span>{trade.opened_at}</span>  // raw ISO string, no ET conversion

// BAD: Using USD instead of CAD
const formatter = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",  // account currency is CAD, not USD
});

// BAD: Inconsistent decimal places
<span>${pnl}</span>                    // no formatting at all
<span>${pnl.toFixed(5)}</span>          // too many decimals for currency
<span>{`$${Math.round(pnl)}`}</span>    // rounding away cents

// BAD: Using toLocaleString without explicit timezone
new Date(timestamp).toLocaleString()  // uses system locale (Mountain Time), not ET

// BAD: Non-monospace font for numbers
<span className="font-sans text-lg">{formatCurrency(pnl)}</span>
// Always use font-mono for financial figures
```
