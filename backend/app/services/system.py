import os
from pathlib import Path

import yaml
from sqlalchemy import text
from sqlalchemy.ext.asyncio import AsyncSession

from app.config import settings
from app.models.system import (
    BotConfig,
    PendingOrderResponse,
    PositionResponse,
    SystemStatusResponse,
)


class SystemService:
    def __init__(self, session: AsyncSession) -> None:
        self._session = session

    async def get_status(self) -> SystemStatusResponse:
        open_positions = await self._open_positions()
        pending_orders = await self._pending_orders()
        bot_config = self._load_bot_config()
        db_size = self._db_size_mb()
        last_trade_at = await self._last_timestamp("trades", "opened_at")
        last_event_at = await self._last_timestamp("events", "scheduled_at")

        return SystemStatusResponse(
            open_positions=open_positions,
            pending_orders=pending_orders,
            bot_config=bot_config,
            db_size_mb=db_size,
            last_trade_at=last_trade_at,
            last_event_at=last_event_at,
        )

    async def _open_positions(self) -> list[PositionResponse]:
        stmt = text(
            "SELECT instrument, side, quantity, entry_price, pnl "
            "FROM trades WHERE closed_at IS NULL"
        )
        result = await self._session.execute(stmt)
        return [
            PositionResponse(
                instrument=row[0],
                side=row[1],
                quantity=row[2],
                entry_price=row[3],
                current_pnl=row[4],
            )
            for row in result.all()
        ]

    async def _pending_orders(self) -> list[PendingOrderResponse]:
        stmt = text(
            "SELECT id, instrument, side, order_type, quantity, price, "
            "stop_loss, take_profit, strategy, created_at "
            "FROM orders WHERE status IN ('PENDING', 'SUBMITTED') "
            "ORDER BY created_at DESC"
        )
        result = await self._session.execute(stmt)
        return [
            PendingOrderResponse(
                id=row[0],
                instrument=row[1],
                side=row[2],
                order_type=row[3],
                quantity=row[4],
                price=row[5],
                stop_loss=row[6],
                take_profit=row[7],
                strategy=row[8],
                created_at=row[9],
            )
            for row in result.all()
        ]

    async def _last_timestamp(self, table: str, column: str) -> str | None:
        allowed = {"trades": "opened_at", "events": "scheduled_at"}
        if table not in allowed or allowed[table] != column:
            return None
        stmt = text(f"SELECT MAX({column}) FROM {table}")
        result = await self._session.execute(stmt)
        return result.scalar_one_or_none()

    @staticmethod
    def _load_bot_config() -> BotConfig | None:
        config_path = Path(settings.bot_config_path)
        if not config_path.exists():
            return None
        with open(config_path) as f:
            raw = yaml.safe_load(f)

        trading = raw.get("trading", {})
        risk = raw.get("risk", {})
        strategy = raw.get("strategy", {})

        return BotConfig(
            instruments=trading.get("instruments", []),
            default_timeframe=trading.get("default_timeframe", "5 mins"),
            max_risk_per_trade_pct=risk.get("max_risk_per_trade_pct", 1.0),
            max_daily_drawdown_pct=risk.get("max_daily_drawdown_pct", 3.0),
            max_concurrent_positions=risk.get("max_concurrent_positions", 3),
            max_spread_pips=risk.get("max_spread_pips", 3.0),
            straddle_distance_pips=strategy.get("straddle_distance_pips", 20.0),
            straddle_tp_pips=strategy.get("straddle_tp_pips", 30.0),
            straddle_sl_pips=strategy.get("straddle_sl_pips", 15.0),
            straddle_pair_overrides=strategy.get("straddle_pair_overrides", {}),
        )

    @staticmethod
    def _db_size_mb() -> float:
        try:
            return os.path.getsize(settings.bot_db_path) / (1024 * 1024)
        except OSError:
            return 0.0
