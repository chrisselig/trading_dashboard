import { NextResponse } from "next/server";
import { turso } from "@/lib/turso";

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET() {
  const result = await turso().execute(
    "SELECT * FROM events WHERE scheduled_at >= datetime('now') ORDER BY scheduled_at ASC LIMIT 1"
  );

  const row = result.rows[0];
  if (!row) return NextResponse.json(null);

  const pairsJson = row.pairs_json;
  let pairs: unknown[] = [];
  if (typeof pairsJson === "string" && pairsJson) {
    try { pairs = JSON.parse(pairsJson); } catch { /* ignore */ }
  }

  return NextResponse.json({ ...row, pairs });
}
