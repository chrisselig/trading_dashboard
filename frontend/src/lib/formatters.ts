const etFormatter = new Intl.DateTimeFormat("en-US", {
  timeZone: "America/New_York",
  month: "short",
  day: "numeric",
  hour: "2-digit",
  minute: "2-digit",
  hour12: true,
});

const etDateFormatter = new Intl.DateTimeFormat("en-US", {
  timeZone: "America/New_York",
  month: "short",
  day: "numeric",
  year: "numeric",
});

const etTimeFormatter = new Intl.DateTimeFormat("en-US", {
  timeZone: "America/New_York",
  hour: "2-digit",
  minute: "2-digit",
  hour12: true,
});

const cadFormatter = new Intl.NumberFormat("en-CA", {
  style: "currency",
  currency: "CAD",
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

export function formatToET(isoString: string): string {
  return etFormatter.format(new Date(isoString));
}

export function formatDateET(isoString: string): string {
  return etDateFormatter.format(new Date(isoString));
}

export function formatTimeET(isoString: string): string {
  return etTimeFormatter.format(new Date(isoString));
}

export function formatCurrency(value: number): string {
  return cadFormatter.format(value);
}

export function formatPips(value: number): string {
  const sign = value >= 0 ? "+" : "";
  return `${sign}${value.toFixed(1)}`;
}

export function formatPercent(value: number): string {
  return `${(value * 100).toFixed(1)}%`;
}

export function formatNumber(value: number, decimals = 2): string {
  return value.toFixed(decimals);
}

export function formatCountdown(isoString: string): string {
  const diff = new Date(isoString).getTime() - Date.now();
  if (diff <= 0) return "Now";
  const hours = Math.floor(diff / 3600000);
  const mins = Math.floor((diff % 3600000) / 60000);
  const secs = Math.floor((diff % 60000) / 1000);
  if (hours > 24) {
    const days = Math.floor(hours / 24);
    return `${days}d ${hours % 24}h ${mins}m`;
  }
  if (hours > 0) return `${hours}h ${mins}m`;
  if (mins > 0) return `${mins}m ${secs}s`;
  return `${secs}s`;
}
