# backend/app/api/admin/auth.py
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
import bcrypt
from app.database import get_db
from app.models.user import AdminUser
from app.models.audit_log import AuditLog
from app.schemas.auth import LoginRequest, LoginResponse
from app.api.deps import create_token

router = APIRouter()


def verify_password(plain: str, hashed: str) -> bool:
    return bcrypt.checkpw(plain.encode("utf-8"), hashed.encode("utf-8"))


@router.post("/api/admin/login", response_model=LoginResponse)
async def login(req: LoginRequest, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(AdminUser).where(AdminUser.username == req.username))
    user = result.scalar_one_or_none()

    if user and user.status == "locked":
        raise HTTPException(status_code=423, detail="账户已锁定，请联系管理员解锁")

    if user is None or not verify_password(req.password, user.password_hash):
        if user:
            user.failed_login_count += 1
            if user.failed_login_count >= 5:
                user.status = "locked"
            await db.commit()
        raise HTTPException(status_code=401, detail="用户名或密码错误")

    user.failed_login_count = 0
    await db.commit()
    return LoginResponse(token=create_token(user), role=user.role)
