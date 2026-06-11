# Skill: Backend API Endpoints (FastAPI)

## When to use
When creating or modifying FastAPI route handlers in `backend/app/routers/`.

## Conventions
- Async/await throughout — never block the event loop
- All responses use Pydantic v2 models (not raw dicts)
- Database is **read-only** — never write to the bot's DB
- Absolute imports: `from app.services.trades import TradeService`
- Error responses follow RFC 7807 (Problem Details)
- All timestamps returned as UTC ISO 8601
- Python 3.12+ features are fine

## Good example

```python
# backend/app/routers/trades.py
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.ext.asyncio import AsyncSession

from app.db import get_session
from app.models.trades import TradeResponse, TradeListResponse
from app.services.trades import TradeService

router = APIRouter(prefix="/api/trades", tags=["trades"])


@router.get("", response_model=TradeListResponse)
async def list_trades(
    pair: str | None = Query(None, description="Filter by currency pair"),
    limit: int = Query(50, ge=1, le=500),
    offset: int = Query(0, ge=0),
    session: AsyncSession = Depends(get_session),
) -> TradeListResponse:
    service = TradeService(session)
    trades = await service.get_trades(pair=pair, limit=limit, offset=offset)
    total = await service.count_trades(pair=pair)
    return TradeListResponse(trades=trades, total=total)


@router.get("/{trade_id}", response_model=TradeResponse)
async def get_trade(
    trade_id: int,
    session: AsyncSession = Depends(get_session),
) -> TradeResponse:
    service = TradeService(session)
    trade = await service.get_trade_by_id(trade_id)
    if trade is None:
        raise HTTPException(status_code=404, detail="Trade not found")
    return trade
```

```python
# backend/app/models/trades.py
from datetime import datetime
from pydantic import BaseModel


class TradeResponse(BaseModel):
    id: int
    instrument: str
    side: str
    entry_price: float
    exit_price: float | None
    pnl_pips: float | None
    pnl_cad: float | None
    strategy: str
    event_id: int | None
    status: str
    opened_at: datetime
    closed_at: datetime | None

    model_config = {"from_attributes": True}


class TradeListResponse(BaseModel):
    trades: list[TradeResponse]
    total: int
```

## Bad example

```python
# BAD: Blocking sync call in async endpoint
@router.get("/trades")
async def list_trades():
    import sqlite3
    conn = sqlite3.connect("/path/to/db")  # blocks the event loop
    rows = conn.execute("SELECT * FROM trades").fetchall()
    return rows  # returns raw list of tuples, not Pydantic models

# BAD: Writing to the bot's database
@router.post("/trades")
async def create_trade(trade: dict):  # raw dict, not a Pydantic model
    await session.execute(insert(Trade).values(**trade))  # NEVER write to bot DB
    await session.commit()

# BAD: Relative imports, no type annotations
from ..services import trades  # use absolute imports
@router.get("/trades/{id}")
def get_trade(id):  # missing async, missing type hint, shadows built-in
    result = trades.get(id)
    return {"data": result}  # raw dict instead of Pydantic model

# BAD: Returning naive timestamps
@router.get("/trades")
async def list_trades(session: AsyncSession = Depends(get_session)):
    trades = await service.get_trades()
    for t in trades:
        t.opened_at = t.opened_at.strftime("%m/%d/%Y %I:%M %p")  # local format, not ISO 8601
    return trades
```
