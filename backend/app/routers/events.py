from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.ext.asyncio import AsyncSession

from app.db import get_session
from app.models.events import EventListResponse, EventResponse
from app.services.events import EventService

router = APIRouter(prefix="/api/events", tags=["events"])


@router.get("", response_model=EventListResponse)
async def list_events(
    upcoming_days: int = Query(30, ge=1, le=90, description="Days ahead for upcoming events"),
    historical_limit: int = Query(50, ge=1, le=500),
    session: AsyncSession = Depends(get_session),
) -> EventListResponse:
    service = EventService(session)
    upcoming = await service.get_upcoming(days=upcoming_days)
    historical = await service.get_historical(limit=historical_limit)
    return EventListResponse(upcoming=upcoming, historical=historical)


@router.get("/upcoming", response_model=list[EventResponse])
async def upcoming_events(
    days: int = Query(30, ge=1, le=90, description="Days ahead"),
    session: AsyncSession = Depends(get_session),
) -> list[EventResponse]:
    service = EventService(session)
    return await service.get_upcoming(days=days)


@router.get("/next", response_model=EventResponse | None)
async def next_event(
    session: AsyncSession = Depends(get_session),
) -> EventResponse | None:
    service = EventService(session)
    return await service.get_next_event()


@router.get("/{event_id}", response_model=EventResponse)
async def get_event(
    event_id: int,
    session: AsyncSession = Depends(get_session),
) -> EventResponse:
    service = EventService(session)
    event = await service.get_event_by_id(event_id)
    if event is None:
        raise HTTPException(status_code=404, detail="Event not found")
    return event
