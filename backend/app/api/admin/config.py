from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.database import get_db
from app.models.site_config import SiteConfig
from app.models.user import AdminUser
from app.schemas.config import ConfigUpdateRequest
from app.api.deps import require_role

router = APIRouter()


@router.get("/api/admin/config/{key}")
async def admin_get_config(
    key: str,
    db: AsyncSession = Depends(get_db),
    current_user: AdminUser = Depends(require_role("super_admin")),
):
    result = await db.execute(select(SiteConfig).where(SiteConfig.key == key))
    config = result.scalar_one_or_none()
    if not config:
        raise HTTPException(status_code=404, detail="配置项不存在")
    return {"key": config.key, "value": config.value}


@router.put("/api/admin/config/{key}")
async def admin_update_config(
    key: str,
    req: ConfigUpdateRequest,
    db: AsyncSession = Depends(get_db),
    current_user: AdminUser = Depends(require_role("super_admin")),
):
    result = await db.execute(select(SiteConfig).where(SiteConfig.key == key))
    config = result.scalar_one_or_none()
    if not config:
        config = SiteConfig(key=key, value=req.value)
        db.add(config)
    else:
        config.value = req.value
    await db.commit()
    return {"message": "配置已更新"}
