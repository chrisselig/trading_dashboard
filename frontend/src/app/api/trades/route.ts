import { type NextRequest, NextResponse } from "next/server";
import { turso } from "@/lib/turso";
import type { InArgs } from "@libsql/client";

export async function GET(request: NextRequest) {
  const params = request.nextUrl.searchParams;
  const pair = params.get("pair");
  const strategy = params.get("strategy");
  const status = params.get("status");
  const dateFrom = params.get("date_from");
  const dateTo = params.get("date_to");
  const limit = Math.min(Number(params.get("limit") ?? 50), 500);
  const offset = Math.max(Number(params.get("offset") ?? 0), 0);

  const clauses: string[] = [];
  const args: InArgs = [];

  if (pair) {
    clauses.push("instrument = ?");
    args.push(pair);
  }
  if (strategy) {
    clauses.push("strategy = ?");
    args.push(strategy);
  }
  if (status === "open") clauses.push("closed_at IS NULL");
  else if (status === "closed") clauses.push("closed_at IS NOT NULL");
  if (dateFrom) {
    clauses.push("opened_at >= ?");
    args.push(dateFrom);
  }
  if (dateTo) {
    clauses.push("opened_at <= ?");
    args.push(dateTo);
  }

  const where = clauses.length > 0 ? `WHERE ${clauses.join(" AND ")}` : "";

  const [trades, countResult] = await Promise.all([
    turso.execute({
      sql: `SELECT * FROM trades ${where} ORDER BY opened_at DESC LIMIT ? OFFSET ?`,
      args: [...args, limit, offset],
    }),
    turso.execute({
      sql: `SELECT COUNT(*) as total FROM trades ${where}`,
      args,
    }),
  ]);

  return NextResponse.json({
    trades: trades.rows,
    total: countResult.rows[0]?.total ?? 0,
  });
}
