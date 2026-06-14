import { NextResponse } from "next/server";
import { turso } from "@/lib/turso";

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET() {
  const closedResult = await turso().execute(
    "SELECT pnl FROM trades WHERE closed_at IS NOT NULL AND pnl IS NOT NULL ORDER BY closed_at ASC"
  );
  const closed = closedResult.rows.map((r) => r.pnl as number);

  if (closed.length === 0) {
    return NextResponse.json({
      total_pnl: 0,
      trade_count: 0,
      win_count: 0,
      loss_count: 0,
      win_rate: 0,
      profit_factor: 0,
      sharpe_ratio: 0,
      max_drawdown: 0,
      best_trade: 0,
      worst_trade: 0,
      avg_win: 0,
      avg_loss: 0,
      equity_curve: [],
      pnl_by_pair: [],
      pnl_by_strategy: [],
    });
  }

  const wins = closed.filter((p) => p > 0);
  const losses = closed.filter((p) => p < 0);
  const grossProfit = wins.reduce((a, b) => a + b, 0);
  const grossLoss = Math.abs(losses.reduce((a, b) => a + b, 0));

  const [equityResult, pairResult, strategyResult] = await Promise.all([
    turso().execute(
      "SELECT closed_at, pnl FROM trades WHERE closed_at IS NOT NULL AND pnl IS NOT NULL ORDER BY closed_at ASC"
    ),
    turso().execute(
      "SELECT instrument as 'group', SUM(pnl) as total_pnl, COUNT(*) as trade_count FROM trades WHERE closed_at IS NOT NULL AND pnl IS NOT NULL GROUP BY instrument ORDER BY total_pnl DESC"
    ),
    turso().execute(
      "SELECT strategy as 'group', SUM(pnl) as total_pnl, COUNT(*) as trade_count FROM trades WHERE closed_at IS NOT NULL AND pnl IS NOT NULL GROUP BY strategy ORDER BY total_pnl DESC"
    ),
  ]);

  let cumulative = 0;
  const equityCurve = equityResult.rows.map((row) => {
    cumulative += row.pnl as number;
    return { timestamp: row.closed_at as string, equity: cumulative };
  });

  return NextResponse.json({
    total_pnl: closed.reduce((a, b) => a + b, 0),
    trade_count: closed.length,
    win_count: wins.length,
    loss_count: losses.length,
    win_rate: wins.length / closed.length,
    profit_factor: grossLoss > 0 ? grossProfit / grossLoss : Infinity,
    sharpe_ratio: sharpe(closed),
    max_drawdown: maxDrawdown(closed),
    best_trade: Math.max(...closed),
    worst_trade: Math.min(...closed),
    avg_win: wins.length > 0 ? grossProfit / wins.length : 0,
    avg_loss: losses.length > 0 ? -grossLoss / losses.length : 0,
    equity_curve: equityCurve,
    pnl_by_pair: pairResult.rows,
    pnl_by_strategy: strategyResult.rows,
  });
}

function sharpe(pnls: number[], riskFree = 0): number {
  if (pnls.length < 2) return 0;
  const mean = pnls.reduce((a, b) => a + b, 0) / pnls.length - riskFree;
  const variance =
    pnls.reduce((sum, p) => sum + (p - mean) ** 2, 0) / (pnls.length - 1);
  const std = Math.sqrt(variance);
  if (std === 0) return 0;
  return (mean / std) * Math.sqrt(252);
}

function maxDrawdown(pnls: number[]): number {
  let cumulative = 0;
  let peak = 0;
  let maxDd = 0;
  for (const p of pnls) {
    cumulative += p;
    if (cumulative > peak) peak = cumulative;
    const dd = peak - cumulative;
    if (dd > maxDd) maxDd = dd;
  }
  return maxDd;
}
