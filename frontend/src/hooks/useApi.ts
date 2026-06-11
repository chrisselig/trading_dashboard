"use client";

import { useQuery } from "@tanstack/react-query";

import {
  fetchDashboard,
  fetchEvents,
  fetchPerformance,
  fetchSystemStatus,
  fetchTrades,
} from "@/lib/api";

export function useDashboard() {
  return useQuery({
    queryKey: ["dashboard"],
    queryFn: fetchDashboard,
    refetchInterval: 30_000,
  });
}

export function useTrades(params?: {
  pair?: string;
  strategy?: string;
  status?: string;
  limit?: number;
  offset?: number;
}) {
  return useQuery({
    queryKey: ["trades", params],
    queryFn: () => fetchTrades(params),
  });
}

export function usePerformance() {
  return useQuery({
    queryKey: ["performance"],
    queryFn: fetchPerformance,
  });
}

export function useEvents() {
  return useQuery({
    queryKey: ["events"],
    queryFn: fetchEvents,
  });
}

export function useSystemStatus() {
  return useQuery({
    queryKey: ["system"],
    queryFn: fetchSystemStatus,
    refetchInterval: 15_000,
  });
}
