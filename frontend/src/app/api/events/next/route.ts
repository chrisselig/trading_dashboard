import { NextResponse } from "next/server";
import { turso } from "@/lib/turso";

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET() {
  const result = await turso().execute(
    "SELECT * FROM events WHERE scheduled_at >= datetime('now') ORDER BY scheduled_at ASC LIMIT 1"
  );

  return NextResponse.json(result.rows[0] ?? null);
}
