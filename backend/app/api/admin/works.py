# backend/app/api/admin/works.py
from datetime import datetime, timezone
from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func
from app.database import get_db
from app.models.contestant import Work, Contestant
from app.models.audit_log import AuditLog
from app.models.user import AdminUser
from app.schemas.work import ApproveRequest, RejectRequest
from app.api.deps import require_role
from app.services.work_number import generate_work_number

router = APIRouter()


@router.get("/api/admin/works")
async def admin_list_works(
    status: str = Query("all"),
    page: int = Query(1, ge=1),
    size: int = Query(20, ge=1, le=100),
    db: AsyncSession = Depends(get_db),
    current_user: AdminUser = Depends(require_role("super_admin")),
):
    base_query = select(Work, Contestant).join(Contestant, Work.contestant_id == Contestant.id)
    if status != "all":
        base_query = base_query.where(Work.status == status)

    # Total count
    count_query = select(func.count()).select_from(base_query.subquery())
    total = (await db.execute(count_query)).scalar() or 0

    query = base_query.order_by(Work.created_at.desc()).offset((page - 1) * size).limit(size)
    result = await db.execute(query)
    rows = result.all()

    data = []
    for work, contestant in rows:
        data.append({
            "id": str(work.id),
            "work_number": work.work_number,
            "contestant_name": contestant.name,
            "contestant_phone": contestant.phone,
            "contestant_tax_id": contestant.tax_id,
            "contestant_address": contestant.address,
            "images": work.images,
            "status": work.status,
            "reject_reason": work.reject_reason,
            "reviewed_at": work.reviewed_at.isoformat() if work.reviewed_at else None,
            "created_at": work.created_at.isoformat() if work.created_at else None,
        })

    return {"data": data, "total": total, "page": page, "size": size}


@router.post("/api/admin/works/{work_id}/approve")
async def approve_work(
    work_id: UUID,
    req: ApproveRequest,
    db: AsyncSession = Depends(get_db),
    current_user: AdminUser = Depends(require_role("super_admin")),
):
    result = await db.execute(select(Work).where(Work.id == work_id))
    work = result.scalar_one_or_none()
    if not work:
        raise HTTPException(status_code=404, detail="作品不存在")
    if work.status != "pending":
        raise HTTPException(status_code=409, detail="作品状态不正确，仅待审核作品可操作")

    work.work_number = req.work_number or await generate_work_number(db)
    work.status = "approved"
    work.reviewed_at = datetime.now(timezone.utc)

    db.add(AuditLog(
        admin_user_id=current_user.id,
        action="approve_work",
        target_type="work",
        target_id=str(work.id),
        detail={"work_number": work.work_number},
        ip_address="system",
    ))
    await db.commit()
    return {"message": "审核通过", "work_number": work.work_number}


@router.post("/api/admin/works/{work_id}/reject")
async def reject_work(
    work_id: UUID,
    req: RejectRequest,
    db: AsyncSession = Depends(get_db),
    current_user: AdminUser = Depends(require_role("super_admin")),
):
    result = await db.execute(select(Work).where(Work.id == work_id))
    work = result.scalar_one_or_none()
    if not work:
        raise HTTPException(status_code=404, detail="作品不存在")
    if work.status != "pending":
        raise HTTPException(status_code=409, detail="作品状态不正确，仅待审核作品可操作")

    work.status = "rejected"
    work.reject_reason = req.reason
    work.reviewed_at = datetime.now(timezone.utc)

    db.add(AuditLog(
        admin_user_id=current_user.id,
        action="reject_work",
        target_type="work",
        target_id=str(work.id),
        detail={"reason": req.reason},
        ip_address="system",
    ))
    await db.commit()
    return {"message": "已拒绝"}


@router.delete("/api/admin/works/{work_id}")
async def delete_work(
    work_id: UUID,
    db: AsyncSession = Depends(get_db),
    current_user: AdminUser = Depends(require_role("super_admin")),
):
    result = await db.execute(select(Work).where(Work.id == work_id))
    work = result.scalar_one_or_none()
    if not work:
        raise HTTPException(status_code=404, detail="作品不存在")

    work.status = "deleted"
    db.add(AuditLog(
        admin_user_id=current_user.id,
        action="delete_work",
        target_type="work",
        target_id=str(work.id),
        detail={},
        ip_address="system",
    ))
    await db.commit()
    return {"message": "已删除"}
