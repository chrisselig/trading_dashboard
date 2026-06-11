import type {
  Dashboard,
  EventListResponse,
  EconomicEvent,
  Performance,
  SystemStatus,
  Trade,
  TradeListResponse,
} from "./types";

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

async function fetchJson<T>(path: string): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`);
  if (!res.ok) {
    throw new Error(`API error: ${res.status} ${res.statusText}`);
  }
  return res.json() as Promise<T>;
}

export function fetchDashboard(): Promise<Dashboard> {
  return fetchJson("/api/dashboard");
}

export function fetchTrades(params?: {
  pair?: string;
  strategy?: string;
  status?: string;
  limit?: number;
  offset?: number;
}): Promise<TradeListResponse> {
  const searchParams = new URLSearchParams();
  if (params?.pair) searchParams.set("pair", params.pair);
  if (params?.strategy) searchParams.set("strategy", params.strategy);
  if (params?.status) searchParams.set("status", params.status);
  if (params?.limit) searchParams.set("limit", String(params.limit));
  if (params?.offset) searchParams.set("offset", String(params.offset));
  const qs = searchParams.toString();
  return fetchJson(`/api/trades${qs ? `?${qs}` : ""}`);
}

export function fetchRecentTrades(limit = 5): Promise<Trade[]> {
  return fetchJson(`/api/trades/recent?limit=${limit}`);
}

export function fetchOpenTrades(): Promise<Trade[]> {
  return fetchJson("/api/trades/open");
}

export function fetchPerformance(): Promise<Performance> {
  return fetchJson("/api/performance");
}

export function fetchEvents(): Promise<EventListResponse> {
  return fetchJson("/api/events");
}

export function fetchUpcomingEvents(limit = 20): Promise<EconomicEvent[]> {
  return fetchJson(`/api/events/upcoming?limit=${limit}`);
}

export function fetchNextEvent(): Promise<EconomicEvent | null> {
  return fetchJson("/api/events/next");
}

export function fetchSystemStatus(): Promise<SystemStatus> {
  return fetchJson("/api/system");
}
