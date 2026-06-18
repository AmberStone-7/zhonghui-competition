from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.database import get_db
from app.models.site_config import SiteConfig

router = APIRouter()


@router.get("/api/config/{key}")
async def get_config(key: str, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(SiteConfig).where(SiteConfig.key == key))
    config = result.scalar_one_or_none()
    if not config:
        return {"value": None}
    return config.value
