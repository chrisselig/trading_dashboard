from datetime import datetime

from pydantic import BaseModel


class StraddleParams(BaseModel):
    instrument: str
    straddle_distance_pips: float
    straddle_tp_pips: float
    straddle_sl_pips: float


class EventResponse(BaseModel):
    id: int | None = None
    title: str
    country: str = "USD"
    impact: str = "high"
    scheduled_at: datetime
    actual: str | None = None
    forecast: str | None = None
    previous: str | None = None
    fred_series: str | None = None
    created_at: datetime | None = None
    source: str | None = None
    pairs: list[StraddleParams] = []


class EventListResponse(BaseModel):
    upcoming: list[EventResponse]
    historical: list[EventResponse]
