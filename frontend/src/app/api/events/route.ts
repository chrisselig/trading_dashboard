import { type NextRequest, NextResponse } from "next/server";
import { turso } from "@/lib/turso";

export async function GET(request: NextRequest) {
  const params = request.nextUrl.searchParams;
  const upcomingDays = Math.min(Number(params.get("upcoming_days") ?? 30), 90);
  const historicalLimit = Math.min(
    Number(params.get("historical_limit") ?? 50),
    500
  );

  const [upcoming, historical] = await Promise.all([
    turso.execute({
      sql: "SELECT * FROM events WHERE scheduled_at >= datetime('now') AND scheduled_at <= datetime('now', '+' || ? || ' days') ORDER BY scheduled_at ASC",
      args: [upcomingDays],
    }),
    turso.execute({
      sql: "SELECT * FROM events WHERE scheduled_at < datetime('now') ORDER BY scheduled_at DESC LIMIT ?",
      args: [historicalLimit],
    }),
  ]);

  return NextResponse.json({
    upcoming: upcoming.rows,
    historical: historical.rows,
  });
}
