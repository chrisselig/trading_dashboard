from sqlalchemy import text
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.events import EventResponse


class EventService:
    def __init__(self, session: AsyncSession) -> None:
        self._session = session

    async def get_upcoming(self, limit: int = 20) -> list[EventResponse]:
        stmt = text(
            "SELECT * FROM events WHERE scheduled_at >= datetime('now') "
            "ORDER BY scheduled_at ASC LIMIT :limit"
        )
        result = await self._session.execute(stmt, {"limit": limit})
        return [EventResponse(**dict(row._mapping)) for row in result.all()]

    async def get_historical(self, limit: int = 50) -> list[EventResponse]:
        stmt = text(
            "SELECT * FROM events WHERE scheduled_at < datetime('now') "
            "ORDER BY scheduled_at DESC LIMIT :limit"
        )
        result = await self._session.execute(stmt, {"limit": limit})
        return [EventResponse(**dict(row._mapping)) for row in result.all()]

    async def get_event_by_id(self, event_id: int) -> EventResponse | None:
        stmt = text("SELECT * FROM events WHERE id = :event_id")
        result = await self._session.execute(stmt, {"event_id": event_id})
        row = result.first()
        return EventResponse(**dict(row._mapping)) if row else None

    async def get_events_for_date_range(
        self,
        date_from: str,
        date_to: str,
    ) -> list[EventResponse]:
        stmt = text(
            "SELECT * FROM events "
            "WHERE scheduled_at >= :date_from AND scheduled_at <= :date_to "
            "ORDER BY scheduled_at ASC"
        )
        result = await self._session.execute(
            stmt, {"date_from": date_from, "date_to": date_to}
        )
        return [EventResponse(**dict(row._mapping)) for row in result.all()]

    async def get_next_event(self) -> EventResponse | None:
        stmt = text(
            "SELECT * FROM events WHERE scheduled_at >= datetime('now') "
            "ORDER BY scheduled_at ASC LIMIT 1"
        )
        result = await self._session.execute(stmt)
        row = result.first()
        return EventResponse(**dict(row._mapping)) if row else None
