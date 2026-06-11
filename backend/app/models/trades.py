from datetime import datetime

from pydantic import BaseModel


class TradeResponse(BaseModel):
    id: int
    order_id: int | None = None
    instrument: str
    side: str
    quantity: float
    entry_price: float
    exit_price: float | None = None
    stop_loss: float | None = None
    take_profit: float | None = None
    pnl: float | None = None
    pnl_pips: float | None = None
    event_id: int | None = None
    strategy: str = ""
    opened_at: datetime
    closed_at: datetime | None = None
    notes: str | None = None


class TradeListResponse(BaseModel):
    trades: list[TradeResponse]
    total: int


class OrderResponse(BaseModel):
    id: int
    ib_order_id: int | None = None
    instrument: str
    side: str
    order_type: str
    quantity: float
    price: float | None = None
    stop_loss: float | None = None
    take_profit: float | None = None
    status: str = "PENDING"
    event_id: int | None = None
    strategy: str = ""
    created_at: datetime
    filled_at: datetime | None = None
    fill_price: float | None = None


class OrderListResponse(BaseModel):
    orders: list[OrderResponse]
    total: int
