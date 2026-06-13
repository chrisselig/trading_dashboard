import { type NextRequest, NextResponse } from "next/server";
import { turso } from "@/lib/turso";

export async function GET(request: NextRequest) {
  const days = Math.min(
    Number(request.nextUrl.searchParams.get("days") ?? 30),
    90
  );

  const result = await turso().execute({
    sql: "SELECT * FROM events WHERE scheduled_at >= datetime('now') AND scheduled_at <= datetime('now', '+' || ? || ' days') ORDER BY scheduled_at ASC",
    args: [days],
  });

  return NextResponse.json(result.rows);
}
