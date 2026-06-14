import { NextResponse } from "next/server";
import { turso } from "@/lib/turso";

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET() {
  const result = await turso().execute(
    "SELECT * FROM trades WHERE closed_at IS NULL ORDER BY opened_at DESC"
  );
  return NextResponse.json(result.rows);
}
