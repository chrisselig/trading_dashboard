import { NextResponse } from "next/server";
import { turso } from "@/lib/turso";
import { enrichEventRow } from "@/lib/events";

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET() {
  const result = await turso().execute(
    "SELECT * FROM events WHERE scheduled_at >= datetime('now') ORDER BY scheduled_at ASC LIMIT 1"
  );

  const row = result.rows[0];
  if (!row) return NextResponse.json(null);

  return NextResponse.json(enrichEventRow(row));
}
