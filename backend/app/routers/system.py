from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession

from app.db import get_session
from app.models.system import SystemStatusResponse
from app.services.system import SystemService

router = APIRouter(prefix="/api/system", tags=["system"])


@router.get("", response_model=SystemStatusResponse)
async def get_system_status(
    session: AsyncSession = Depends(get_session),
) -> SystemStatusResponse:
    service = SystemService(session)
    return await service.get_status()
