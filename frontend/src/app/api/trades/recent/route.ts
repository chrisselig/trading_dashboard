import { type NextRequest, NextResponse } from "next/server";
import { turso } from "@/lib/turso";

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  const limit = Math.min(
    Number(request.nextUrl.searchParams.get("limit") ?? 5),
    20
  );

  const result = await turso().execute({
    sql: "SELECT * FROM trades ORDER BY opened_at DESC LIMIT ?",
    args: [limit],
  });

  return NextResponse.json(result.rows);
}
