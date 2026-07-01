import math

from sqlalchemy import text
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.performance import EquityPoint, PerformanceResponse, PnlByGroup


class PerformanceService:
    def __init__(self, session: AsyncSession) -> None:
        self._session = session

    async def get_performance(self) -> PerformanceResponse:
        closed = await self._get_closed_pnls()
        total_commission = await self._get_total_commission()

        if not closed:
            return PerformanceResponse(
                total_pnl=0,
                total_commission=total_commission,
                net_pnl=-total_commission,
                trade_count=0,
                win_count=0,
                loss_count=0,
                win_rate=0,
                profit_factor=0,
                sharpe_ratio=0,
                max_drawdown=0,
                best_trade=0,
                worst_trade=0,
                avg_win=0,
                avg_loss=0,
                equity_curve=[],
                pnl_by_pair=[],
                pnl_by_strategy=[],
            )

        wins = [p for p in closed if p > 0]
        losses = [p for p in closed if p < 0]
        total_pnl = sum(closed)
        gross_profit = sum(wins) if wins else 0
        gross_loss = abs(sum(losses)) if losses else 0

        return PerformanceResponse(
            total_pnl=total_pnl,
            total_commission=total_commission,
            net_pnl=total_pnl - total_commission,
            trade_count=len(closed),
            win_count=len(wins),
            loss_count=len(losses),
            win_rate=len(wins) / len(closed) if closed else 0,
            profit_factor=gross_profit / gross_loss if gross_loss > 0 else float("inf"),
            sharpe_ratio=self._sharpe(closed),
            max_drawdown=self._max_drawdown(closed),
            best_trade=max(closed) if closed else 0,
            worst_trade=min(closed) if closed else 0,
            avg_win=gross_profit / len(wins) if wins else 0,
            avg_loss=-gross_loss / len(losses) if losses else 0,
            equity_curve=await self._equity_curve(),
            pnl_by_pair=await self._pnl_by_group("instrument"),
            pnl_by_strategy=await self._pnl_by_group("strategy"),
        )

    async def _get_total_commission(self) -> float:
        stmt = text(
            "SELECT COALESCE(SUM(commission), 0) FROM trades "
            "WHERE closed_at IS NOT NULL AND commission IS NOT NULL"
        )
        result = await self._session.execute(stmt)
        return result.scalar_one()

    async def _get_closed_pnls(self) -> list[float]:
        stmt = text(
            "SELECT pnl FROM trades WHERE closed_at IS NOT NULL AND pnl IS NOT NULL "
            "ORDER BY closed_at ASC"
        )
        result = await self._session.execute(stmt)
        return [row[0] for row in result.all()]

    async def _equity_curve(self) -> list[EquityPoint]:
        stmt = text(
            "SELECT closed_at, pnl FROM trades "
            "WHERE closed_at IS NOT NULL AND pnl IS NOT NULL "
            "ORDER BY closed_at ASC"
        )
        result = await self._session.execute(stmt)
        rows = result.all()

        cumulative = 0.0
        points: list[EquityPoint] = []
        for row in rows:
            cumulative += row[1]
            points.append(EquityPoint(timestamp=row[0], equity=cumulative))
        return points

    async def _pnl_by_group(self, column: str) -> list[PnlByGroup]:
        stmt = text(
            f"SELECT {column}, SUM(pnl) as total_pnl, COUNT(*) as trade_count "
            f"FROM trades WHERE closed_at IS NOT NULL AND pnl IS NOT NULL "
            f"GROUP BY {column} ORDER BY total_pnl DESC"
        )
        result = await self._session.execute(stmt)
        return [
            PnlByGroup(group=row[0] or "unknown", total_pnl=row[1], trade_count=row[2])
            for row in result.all()
        ]

    @staticmethod
    def _sharpe(pnls: list[float], risk_free: float = 0.0) -> float:
        if len(pnls) < 2:
            return 0.0
        mean = sum(pnls) / len(pnls) - risk_free
        variance = sum((p - mean) ** 2 for p in pnls) / (len(pnls) - 1)
        std = math.sqrt(variance)
        if std == 0:
            return 0.0
        return (mean / std) * math.sqrt(252)

    @staticmethod
    def _max_drawdown(pnls: list[float]) -> float:
        if not pnls:
            return 0.0
        cumulative = 0.0
        peak = 0.0
        max_dd = 0.0
        for p in pnls:
            cumulative += p
            if cumulative > peak:
                peak = cumulative
            dd = peak - cumulative
            if dd > max_dd:
                max_dd = dd
        return max_dd
