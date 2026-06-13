import { type NextRequest, NextResponse } from "next/server";
import { turso } from "@/lib/turso";
import type { InArgs } from "@libsql/client";

export async function GET(request: NextRequest) {
  const params = request.nextUrl.searchParams;
  const status = params.get("status");
  const limit = Math.min(Number(params.get("limit") ?? 50), 500);
  const offset = Math.max(Number(params.get("offset") ?? 0), 0);

  const clauses: string[] = [];
  const args: InArgs = [];

  if (status) {
    clauses.push("status = ?");
    args.push(status);
  }

  const where = clauses.length > 0 ? `WHERE ${clauses.join(" AND ")}` : "";

  const [orders, countResult] = await Promise.all([
    turso.execute({
      sql: `SELECT * FROM orders ${where} ORDER BY created_at DESC LIMIT ? OFFSET ?`,
      args: [...args, limit, offset],
    }),
    turso.execute({
      sql: `SELECT COUNT(*) as total FROM orders ${where}`,
      args,
    }),
  ]);

  return NextResponse.json({
    orders: orders.rows,
    total: countResult.rows[0]?.total ?? 0,
  });
}
