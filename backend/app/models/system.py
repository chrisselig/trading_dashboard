from datetime import datetime

from pydantic import BaseModel


class PositionResponse(BaseModel):
    instrument: str
    side: str
    quantity: float
    entry_price: float
    current_pnl: float | None = None


class PendingOrderResponse(BaseModel):
    id: int
    instrument: str
    side: str
    order_type: str
    quantity: float
    price: float | None = None
    stop_loss: float | None = None
    take_profit: float | None = None
    strategy: str = ""
    created_at: datetime


class BotConfig(BaseModel):
    instruments: list[str]
    default_timeframe: str
    max_risk_per_trade_pct: float
    max_daily_drawdown_pct: float
    max_concurrent_positions: int
    max_spread_pips: float
    straddle_distance_pips: float
    straddle_tp_pips: float
    straddle_sl_pips: float
    straddle_pair_overrides: dict


class SystemStatusResponse(BaseModel):
    open_positions: list[PositionResponse]
    pending_orders: list[PendingOrderResponse]
    bot_config: BotConfig | None = None
    db_size_mb: float
    last_trade_at: datetime | None = None
    last_event_at: datetime | None = None
