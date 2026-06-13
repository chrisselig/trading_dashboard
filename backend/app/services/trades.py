from datetime import datetime

from sqlalchemy import Select, select, text
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.trades import OrderResponse, TradeResponse


class TradeService:
    def __init__(self, session: AsyncSession) -> None:
        self._session = session

    def _base_trade_query(self) -> Select:
        return select(text("*")).select_from(text("trades"))

    async def get_trades(
        self,
        pair: str | None = None,
        strategy: str | None = None,
        status: str | None = None,
        date_from: datetime | None = None,
        date_to: datetime | None = None,
        limit: int = 50,
        offset: int = 0,
    ) -> list[TradeResponse]:
        sql = self._build_trades_sql(
            pair, strategy, status, date_from, date_to, limit, offset
        )
        stmt = text(sql)
        params = self._build_trades_params(
            pair, strategy, status, date_from, date_to, limit, offset
        )
        result = await self._session.execute(stmt, params)
        return [TradeResponse(**dict(row._mapping)) for row in result.all()]

    async def count_trades(
        self,
        pair: str | None = None,
        strategy: str | None = None,
        status: str | None = None,
        date_from: datetime | None = None,
        date_to: datetime | None = None,
    ) -> int:
        clauses, params = self._where_clauses(pair, strategy, status, date_from, date_to)
        where = f"WHERE {' AND '.join(clauses)}" if clauses else ""
        stmt = text(f"SELECT COUNT(*) FROM trades {where}")
        result = await self._session.execute(stmt, params)
        return result.scalar_one()

    async def get_trade_by_id(self, trade_id: int) -> TradeResponse | None:
        stmt = text("SELECT * FROM trades WHERE id = :trade_id")
        result = await self._session.execute(stmt, {"trade_id": trade_id})
        row = result.first()
        return TradeResponse(**dict(row._mapping)) if row else None

    async def get_recent_trades(self, limit: int = 5) -> list[TradeResponse]:
        stmt = text("SELECT * FROM trades ORDER BY opened_at DESC LIMIT :limit")
        result = await self._session.execute(stmt, {"limit": limit})
        return [TradeResponse(**dict(row._mapping)) for row in result.all()]

    async def get_open_trades(self) -> list[TradeResponse]:
        stmt = text("SELECT * FROM trades WHERE closed_at IS NULL ORDER BY opened_at DESC")
        result = await self._session.execute(stmt)
        return [TradeResponse(**dict(row._mapping)) for row in result.all()]

    async def get_todays_pnl(self) -> float:
        stmt = text(
            "SELECT COALESCE(SUM(pnl), 0) FROM trades "
            "WHERE date(closed_at) = date('now') AND pnl IS NOT NULL"
        )
        result = await self._session.execute(stmt)
        return result.scalar_one()

    async def get_orders(
        self,
        status: str | None = None,
        limit: int = 50,
        offset: int = 0,
    ) -> list[OrderResponse]:
        clauses: list[str] = []
        params: dict = {"limit": limit, "offset": offset}
        if status:
            clauses.append("status = :status")
            params["status"] = status
        where = f"WHERE {' AND '.join(clauses)}" if clauses else ""
        stmt = text(
            f"SELECT * FROM orders {where} ORDER BY created_at DESC LIMIT :limit OFFSET :offset"
        )
        result = await self._session.execute(stmt, params)
        return [OrderResponse(**dict(row._mapping)) for row in result.all()]

    async def count_orders(self, status: str | None = None) -> int:
        if status:
            stmt = text("SELECT COUNT(*) FROM orders WHERE status = :status")
            result = await self._session.execute(stmt, {"status": status})
        else:
            stmt = text("SELECT COUNT(*) FROM orders")
            result = await self._session.execute(stmt)
        return result.scalar_one()

    async def get_pending_orders(self) -> list[OrderResponse]:
        stmt = text(
            "SELECT * FROM orders WHERE status IN ('PENDING', 'SUBMITTED') "
            "ORDER BY created_at DESC"
        )
        result = await self._session.execute(stmt)
        return [OrderResponse(**dict(row._mapping)) for row in result.all()]

    def _where_clauses(
        self,
        pair: str | None,
        strategy: str | None,
        status: str | None,
        date_from: datetime | None,
        date_to: datetime | None,
    ) -> tuple[list[str], dict]:
        clauses: list[str] = []
        params: dict = {}
        if pair:
            clauses.append("instrument = :pair")
            params["pair"] = pair
        if strategy:
            clauses.append("strategy = :strategy")
            params["strategy"] = strategy
        if status == "open":
            clauses.append("closed_at IS NULL")
        elif status == "closed":
            clauses.append("closed_at IS NOT NULL")
        if date_from:
            clauses.append("opened_at >= :date_from")
            params["date_from"] = date_from.isoformat()
        if date_to:
            clauses.append("opened_at <= :date_to")
            params["date_to"] = date_to.isoformat()
        return clauses, params

    def _build_trades_sql(
        self,
        pair: str | None,
        strategy: str | None,
        status: str | None,
        date_from: datetime | None,
        date_to: datetime | None,
        limit: int,
        offset: int,
    ) -> str:
        clauses, _ = self._where_clauses(pair, strategy, status, date_from, date_to)
        where = f"WHERE {' AND '.join(clauses)}" if clauses else ""
        return f"SELECT * FROM trades {where} ORDER BY opened_at DESC LIMIT :limit OFFSET :offset"

    def _build_trades_params(
        self,
        pair: str | None,
        strategy: str | None,
        status: str | None,
        date_from: datetime | None,
        date_to: datetime | None,
        limit: int,
        offset: int,
    ) -> dict:
        _, params = self._where_clauses(pair, strategy, status, date_from, date_to)
        params["limit"] = limit
        params["offset"] = offset
        return params
