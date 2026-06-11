from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession

from app.db import get_session
from app.models.performance import PerformanceResponse
from app.services.performance import PerformanceService

router = APIRouter(prefix="/api/performance", tags=["performance"])


@router.get("", response_model=PerformanceResponse)
async def get_performance(
    session: AsyncSession = Depends(get_session),
) -> PerformanceResponse:
    service = PerformanceService(session)
    return await service.get_performance()
