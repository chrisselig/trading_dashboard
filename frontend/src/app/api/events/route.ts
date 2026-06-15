import { type NextRequest, NextResponse } from "next/server";
import { turso } from "@/lib/turso";
import type { Row } from "@libsql/client";

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

function enrichWithPairs(rows: Row[]) {
  return rows.map((row) => {
    const pairsJson = row.pairs_json;
    let pairs: unknown[] = [];
    if (typeof pairsJson === "string" && pairsJson) {
      try {
        pairs = JSON.parse(pairsJson);
      } catch {
        /* ignore malformed JSON */
      }
    }
    return { ...row, pairs };
  });
}

export async function GET(request: NextRequest) {
  const params = request.nextUrl.searchParams;
  const upcomingDays = Math.min(Number(params.get("upcoming_days") ?? 30), 90);
  const historicalLimit = Math.min(
    Number(params.get("historical_limit") ?? 50),
    500
  );

  const [upcoming, historical] = await Promise.all([
    turso().execute({
      sql: "SELECT * FROM events WHERE scheduled_at >= datetime('now') AND scheduled_at <= datetime('now', '+' || ? || ' days') ORDER BY scheduled_at ASC",
      args: [upcomingDays],
    }),
    turso().execute({
      sql: "SELECT * FROM events WHERE scheduled_at < datetime('now') ORDER BY scheduled_at DESC LIMIT ?",
      args: [historicalLimit],
    }),
  ]);

  return NextResponse.json({
    upcoming: enrichWithPairs(upcoming.rows),
    historical: enrichWithPairs(historical.rows),
  });
}
