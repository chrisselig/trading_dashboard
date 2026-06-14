import { type NextRequest, NextResponse } from "next/server";
import { turso } from "@/lib/turso";

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ tradeId: string }> }
) {
  const { tradeId } = await params;
  const result = await turso().execute({
    sql: "SELECT * FROM trades WHERE id = ?",
    args: [Number(tradeId)],
  });

  if (result.rows.length === 0) {
    return NextResponse.json({ detail: "Trade not found" }, { status: 404 });
  }

  return NextResponse.json(result.rows[0]);
}
