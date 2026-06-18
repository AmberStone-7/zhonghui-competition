from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.database import get_db
from app.models.site_config import SiteConfig
from app.models.audit_log import AuditLog
from app.models.user import AdminUser
from app.schemas.config import ChannelUpdateRequest
from app.api.deps import require_role

router = APIRouter()


@router.get("/api/admin/channels")
async def get_channels(
    db: AsyncSession = Depends(get_db),
    current_user: AdminUser = Depends(require_role("super_admin")),
):
    channels = {}
    for key in ["register_channel", "vote_channel"]:
        result = await db.execute(select(SiteConfig).where(SiteConfig.key == key))
        config = result.scalar_one_or_none()
        channels[key.replace("_channel", "")] = config.value if config else {"status": "closed"}
    return channels


@router.put("/api/admin/channels/{channel_type}")
async def update_channel(
    channel_type: str,
    req: ChannelUpdateRequest,
    db: AsyncSession = Depends(get_db),
    current_user: AdminUser = Depends(require_role("super_admin")),
):
    if channel_type not in ("register", "vote"):
        raise HTTPException(status_code=400, detail="无效的通道类型")

    key = f"{channel_type}_channel"
    result = await db.execute(select(SiteConfig).where(SiteConfig.key == key))
    config = result.scalar_one_or_none()
    new_value = {
        "status": req.status,
        "start_time": req.start_time,
        "end_time": req.end_time,
    }
    if config:
        config.value = new_value
    else:
        db.add(SiteConfig(key=key, value=new_value))

    db.add(AuditLog(
        admin_user_id=current_user.id,
        action=f"update_{channel_type}_channel",
        target_type="channel",
        target_id=channel_type,
        detail=new_value,
        ip_address="system",
    ))
    await db.commit()
    return {"message": f"{channel_type} 通道已更新", "value": new_value}
