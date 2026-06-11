import json
from datetime import datetime, timezone
from pathlib import Path

from sqlalchemy import text
from sqlalchemy.ext.asyncio import AsyncSession

from app.config import settings
from app.models.events import EventResponse, StraddleParams


class EventService:
    def __init__(self, session: AsyncSession) -> None:
        self._session = session

    async def get_upcoming(self, days: int = 30) -> list[EventResponse]:
        db_events = await self._upcoming_from_db(days)
        cal_events = self._upcoming_from_calendar()
        merged = self._merge_events(db_events, cal_events)
        return sorted(merged, key=lambda e: e.scheduled_at.replace(tzinfo=None))

    async def get_historical(self, limit: int = 50) -> list[EventResponse]:
        stmt = text(
            "SELECT * FROM events WHERE scheduled_at < datetime('now') "
            "ORDER BY scheduled_at DESC LIMIT :limit"
        )
        result = await self._session.execute(stmt, {"limit": limit})
        return [self._row_to_event(row) for row in result.all()]

    async def get_event_by_id(self, event_id: int) -> EventResponse | None:
        stmt = text("SELECT * FROM events WHERE id = :event_id")
        result = await self._session.execute(stmt, {"event_id": event_id})
        row = result.first()
        return self._row_to_event(row) if row else None

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
        return [self._row_to_event(row) for row in result.all()]

    async def get_next_event(self) -> EventResponse | None:
        db_events = await self._upcoming_from_db(days=7)
        cal_events = self._upcoming_from_calendar()
        merged = self._merge_events(db_events, cal_events)
        now_naive = datetime.now(timezone.utc).replace(tzinfo=None)
        upcoming = sorted(
            [e for e in merged if e.scheduled_at.replace(tzinfo=None) >= now_naive],
            key=lambda e: e.scheduled_at.replace(tzinfo=None),
        )
        return upcoming[0] if upcoming else None

    async def _upcoming_from_db(self, days: int) -> list[EventResponse]:
        stmt = text(
            "SELECT * FROM events "
            "WHERE scheduled_at >= datetime('now') "
            "AND scheduled_at <= datetime('now', '+' || :days || ' days') "
            "ORDER BY scheduled_at ASC"
        )
        result = await self._session.execute(stmt, {"days": days})
        return [self._row_to_event(row) for row in result.all()]

    @staticmethod
    def _upcoming_from_calendar() -> list[EventResponse]:
        cal_path = Path(settings.calendar_json_path)
        if not cal_path.exists():
            return []
        try:
            data = json.loads(cal_path.read_text())
        except (json.JSONDecodeError, OSError):
            return []

        now = datetime.now(timezone.utc).replace(tzinfo=None)
        events: list[EventResponse] = []
        for entry in data.get("events", []):
            scheduled = datetime.fromisoformat(entry["datetime_utc"]).replace(tzinfo=None)
            if scheduled < now:
                continue
            pairs = [
                StraddleParams(**p) for p in entry.get("pairs", [])
            ]
            events.append(
                EventResponse(
                    title=entry["event"],
                    country=entry.get("country", "USD"),
                    impact="high",
                    scheduled_at=scheduled,
                    forecast=entry.get("forecast"),
                    previous=entry.get("previous"),
                    source=entry.get("source"),
                    pairs=pairs,
                )
            )
        return events

    @staticmethod
    def _merge_events(
        db_events: list[EventResponse],
        cal_events: list[EventResponse],
    ) -> list[EventResponse]:
        cal_by_key: dict[tuple[str, str], EventResponse] = {}
        for event in cal_events:
            key = (event.title, event.scheduled_at.replace(tzinfo=None).isoformat())
            cal_by_key[key] = event

        merged: list[EventResponse] = []
        seen: set[tuple[str, str]] = set()
        for event in db_events:
            key = (event.title, event.scheduled_at.replace(tzinfo=None).isoformat())
            seen.add(key)
            if key in cal_by_key:
                # Enrich DB event with calendar pairs data
                cal = cal_by_key[key]
                event = event.model_copy(update={
                    "pairs": cal.pairs,
                    "source": cal.source or event.source,
                })
            merged.append(event)
        for key, event in cal_by_key.items():
            if key not in seen:
                merged.append(event)
        return merged

    @staticmethod
    def _row_to_event(row) -> EventResponse:
        return EventResponse(**dict(row._mapping))
