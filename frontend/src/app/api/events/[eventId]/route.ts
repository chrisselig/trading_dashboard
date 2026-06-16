import { type NextRequest, NextResponse } from "next/server";
import { turso } from "@/lib/turso";
import { enrichEventRow } from "@/lib/events";

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ eventId: string }> }
) {
  const { eventId } = await params;
  const result = await turso().execute({
    sql: "SELECT * FROM events WHERE id = ?",
    args: [Number(eventId)],
  });

  if (result.rows.length === 0) {
    return NextResponse.json({ detail: "Event not found" }, { status: 404 });
  }

  return NextResponse.json(enrichEventRow(result.rows[0]));
}
