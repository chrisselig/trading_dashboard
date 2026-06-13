import { NextResponse } from "next/server";
import { turso } from "@/lib/turso";

export async function GET() {
  const [todayPnl, openTrades, recentTrades, upcomingEvents, equityCurve] =
    await Promise.all([
      turso.execute(
        "SELECT COALESCE(SUM(pnl), 0) as total FROM trades WHERE date(closed_at) = date('now') AND pnl IS NOT NULL"
      ),
      turso.execute(
        "SELECT * FROM trades WHERE closed_at IS NULL ORDER BY opened_at DESC"
      ),
      turso.execute(
        "SELECT * FROM trades ORDER BY opened_at DESC LIMIT 5"
      ),
      turso.execute(
        "SELECT * FROM events WHERE scheduled_at >= datetime('now') ORDER BY scheduled_at ASC LIMIT 3"
      ),
      turso.execute(
        "SELECT closed_at, pnl FROM trades WHERE closed_at IS NOT NULL AND pnl IS NOT NULL ORDER BY closed_at ASC"
      ),
    ]);

  let cumulative = 0;
  const curve = equityCurve.rows.map((row) => {
    cumulative += row.pnl as number;
    return { timestamp: row.closed_at as string, equity: cumulative };
  });

  const upcoming = upcomingEvents.rows;
  const nextEvent = upcoming.length > 0 ? upcoming[0] : null;

  return NextResponse.json({
    todays_pnl: todayPnl.rows[0]?.total ?? 0,
    open_position_count: openTrades.rows.length,
    next_event: nextEvent,
    recent_trades: recentTrades.rows,
    upcoming_events: upcoming,
    equity_curve: curve.slice(-30),
  });
}
