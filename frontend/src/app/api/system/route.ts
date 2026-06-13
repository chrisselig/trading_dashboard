import { NextResponse } from "next/server";
import { turso } from "@/lib/turso";

export async function GET() {
  const [openPositions, pendingOrders, lastTrade, lastEvent] =
    await Promise.all([
      turso().execute(
        "SELECT instrument, side, quantity, entry_price, pnl as current_pnl FROM trades WHERE closed_at IS NULL"
      ),
      turso().execute(
        "SELECT id, instrument, side, order_type, quantity, price, stop_loss, take_profit, strategy, created_at FROM orders WHERE status IN ('PENDING', 'SUBMITTED') ORDER BY created_at DESC"
      ),
      turso().execute("SELECT MAX(opened_at) as ts FROM trades"),
      turso().execute("SELECT MAX(scheduled_at) as ts FROM events"),
    ]);

  return NextResponse.json({
    open_positions: openPositions.rows,
    pending_orders: pendingOrders.rows,
    bot_config: null,
    db_size_mb: 0,
    last_trade_at: (lastTrade.rows[0]?.ts as string) ?? null,
    last_event_at: (lastEvent.rows[0]?.ts as string) ?? null,
  });
}
