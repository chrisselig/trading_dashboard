from datetime import datetime

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.ext.asyncio import AsyncSession

from app.db import get_session
from app.models.trades import (
    OrderListResponse,
    TradeListResponse,
    TradeResponse,
)
from app.services.trades import TradeService

router = APIRouter(prefix="/api/trades", tags=["trades"])


@router.get("", response_model=TradeListResponse)
async def list_trades(
    pair: str | None = Query(None, description="Filter by currency pair"),
    strategy: str | None = Query(None, description="Filter by strategy"),
    status: str | None = Query(None, description="open or closed"),
    date_from: datetime | None = Query(None, description="Start date (ISO 8601)"),
    date_to: datetime | None = Query(None, description="End date (ISO 8601)"),
    limit: int = Query(50, ge=1, le=500),
    offset: int = Query(0, ge=0),
    session: AsyncSession = Depends(get_session),
) -> TradeListResponse:
    service = TradeService(session)
    trades = await service.get_trades(
        pair=pair,
        strategy=strategy,
        status=status,
        date_from=date_from,
        date_to=date_to,
        limit=limit,
        offset=offset,
    )
    total = await service.count_trades(
        pair=pair, strategy=strategy, status=status, date_from=date_from, date_to=date_to
    )
    return TradeListResponse(trades=trades, total=total)


@router.get("/recent", response_model=list[TradeResponse])
async def recent_trades(
    limit: int = Query(5, ge=1, le=20),
    session: AsyncSession = Depends(get_session),
) -> list[TradeResponse]:
    service = TradeService(session)
    return await service.get_recent_trades(limit=limit)


@router.get("/open", response_model=list[TradeResponse])
async def open_trades(
    session: AsyncSession = Depends(get_session),
) -> list[TradeResponse]:
    service = TradeService(session)
    return await service.get_open_trades()


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


orders_router = APIRouter(prefix="/api/orders", tags=["orders"])


@orders_router.get("", response_model=OrderListResponse)
async def list_orders(
    status: str | None = Query(None, description="Filter by status"),
    limit: int = Query(50, ge=1, le=500),
    offset: int = Query(0, ge=0),
    session: AsyncSession = Depends(get_session),
) -> OrderListResponse:
    service = TradeService(session)
    orders = await service.get_orders(status=status, limit=limit, offset=offset)
    total = await service.count_orders(status=status)
    return OrderListResponse(orders=orders, total=total)
