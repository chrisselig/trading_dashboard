from datetime import datetime

from pydantic import BaseModel


class EventResponse(BaseModel):
    id: int
    title: str
    country: str = "USD"
    impact: str = "high"
    scheduled_at: datetime
    actual: str | None = None
    forecast: str | None = None
    previous: str | None = None
    fred_series: str | None = None
    created_at: datetime


class EventListResponse(BaseModel):
    upcoming: list[EventResponse]
    historical: list[EventResponse]
