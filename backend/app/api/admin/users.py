from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from passlib.context import CryptContext
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.database import get_db
from app.models.user import AdminUser
from app.api.deps import require_role

router = APIRouter()
pwd_context = CryptContext(schemes=["bcrypt"])


class ResetPasswordRequest(BaseModel):
    new_password: str


@router.post("/api/admin/users/{user_id}/reset-password")
async def reset_password(
    user_id: str,
    req: ResetPasswordRequest,
    db: AsyncSession = Depends(get_db),
    current_user: AdminUser = Depends(require_role("super_admin")),
):
    result = await db.execute(select(AdminUser).where(AdminUser.id == user_id))
    user = result.scalar_one_or_none()
    if not user:
        raise HTTPException(status_code=404, detail="用户不存在")

    user.password_hash = pwd_context.hash(req.new_password)
    user.failed_login_count = 0
    if user.status == "locked":
        user.status = "active"
    await db.commit()
    return {"message": "密码已重置"}
