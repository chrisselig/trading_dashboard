# Skill: Database Queries (SQLAlchemy Async, Read-Only)

## When to use
When creating or modifying database access code in `backend/app/services/` or `backend/app/db.py`.

## Conventions
- SQLAlchemy 2.0 async with aiosqlite
- **Read-only** — never INSERT, UPDATE, or DELETE against the bot's SQLite DB
- Use the shared conda env's SQLAlchemy models where possible
- Async session via dependency injection
- All service methods are async
- DB path configured via `BOT_DB_PATH` env var

## Good example

```python
# backend/app/db.py
from sqlalchemy.ext.asyncio import AsyncSession, async_sessionmaker, create_async_engine

from app.config import settings

engine = create_async_engine(
    f"sqlite+aiosqlite:///{settings.bot_db_path}",
    echo=False,
)

async_session = async_sessionmaker(engine, class_=AsyncSession, expire_on_commit=False)


async def get_session():
    async with async_session() as session:
        yield session
```

```python
# backend/app/services/trades.py
from sqlalchemy import select, func
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.trades import TradeResponse


class TradeService:
    def __init__(self, session: AsyncSession) -> None:
        self._session = session

    async def get_trades(
        self,
        pair: str | None = None,
        limit: int = 50,
        offset: int = 0,
    ) -> list[TradeResponse]:
        stmt = select(Trade).order_by(Trade.opened_at.desc()).limit(limit).offset(offset)
        if pair:
            stmt = stmt.where(Trade.instrument == pair)
        result = await self._session.execute(stmt)
        return [TradeResponse.model_validate(row) for row in result.scalars().all()]

    async def count_trades(self, pair: str | None = None) -> int:
        stmt = select(func.count()).select_from(Trade)
        if pair:
            stmt = stmt.where(Trade.instrument == pair)
        result = await self._session.execute(stmt)
        return result.scalar_one()

    async def get_trade_by_id(self, trade_id: int) -> TradeResponse | None:
        stmt = select(Trade).where(Trade.id == trade_id)
        result = await self._session.execute(stmt)
        row = result.scalar_one_or_none()
        return TradeResponse.model_validate(row) if row else None
```

```python
# backend/app/services/performance.py
from sqlalchemy import select, func
from sqlalchemy.ext.asyncio import AsyncSession


class PerformanceService:
    def __init__(self, session: AsyncSession) -> None:
        self._session = session

    async def get_pnl_by_pair(self) -> list[dict[str, float]]:
        stmt = (
            select(Trade.instrument, func.sum(Trade.pnl_cad).label("total_pnl"))
            .group_by(Trade.instrument)
            .order_by(func.sum(Trade.pnl_cad).desc())
        )
        result = await self._session.execute(stmt)
        return [
            {"pair": row.instrument, "total_pnl": row.total_pnl}
            for row in result.all()
        ]
```

## Bad example

```python
# BAD: Synchronous connection — blocks the event loop
import sqlite3
conn = sqlite3.connect(settings.bot_db_path)
cursor = conn.execute("SELECT * FROM trades")

# BAD: Writing to the bot's database
async def mark_trade_reviewed(self, trade_id: int) -> None:
    stmt = update(Trade).where(Trade.id == trade_id).values(reviewed=True)
    await self._session.execute(stmt)
    await self._session.commit()  # NEVER write — the DB is read-only

# BAD: Raw SQL strings with f-string interpolation (SQL injection risk)
async def get_trades(self, pair: str) -> list:
    query = f"SELECT * FROM trades WHERE instrument = '{pair}'"  # SQL injection!
    result = await self._session.execute(text(query))
    return result.fetchall()  # returns raw rows, not Pydantic models

# BAD: Hardcoded database path
engine = create_async_engine("sqlite+aiosqlite:///home/doopdeep/forex_bot.db")
# Use settings.bot_db_path from config

# BAD: Not using async session
from sqlalchemy import create_engine
from sqlalchemy.orm import Session
engine = create_engine(f"sqlite:///{settings.bot_db_path}")  # sync engine, not async
```
