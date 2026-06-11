from fastapi import APIRouter, Depends
from pydantic import BaseModel
from sqlalchemy.ext.asyncio import AsyncSession

from app.db import get_session
from app.models.events import EventResponse
from app.models.performance import EquityPoint
from app.models.trades import TradeResponse
from app.services.events import EventService
from app.services.performance import PerformanceService
from app.services.trades import TradeService

router = APIRouter(prefix="/api/dashboard", tags=["dashboard"])


class DashboardResponse(BaseModel):
    todays_pnl: float
    open_position_count: int
    next_event: EventResponse | None
    recent_trades: list[TradeResponse]
    upcoming_events: list[EventResponse]
    equity_curve: list[EquityPoint]


@router.get("", response_model=DashboardResponse)
async def get_dashboard(
    session: AsyncSession = Depends(get_session),
) -> DashboardResponse:
    trade_svc = TradeService(session)
    event_svc = EventService(session)
    perf_svc = PerformanceService(session)

    todays_pnl = await trade_svc.get_todays_pnl()
    open_trades = await trade_svc.get_open_trades()
    recent_trades = await trade_svc.get_recent_trades(limit=5)
    next_event = await event_svc.get_next_event()
    upcoming_events = await event_svc.get_upcoming(limit=3)
    perf = await perf_svc.get_performance()

    return DashboardResponse(
        todays_pnl=todays_pnl,
        open_position_count=len(open_trades),
        next_event=next_event,
        recent_trades=recent_trades,
        upcoming_events=upcoming_events,
        equity_curve=perf.equity_curve[-30:] if perf.equity_curve else [],
    )
