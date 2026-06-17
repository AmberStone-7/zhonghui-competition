# backend/app/api/public/works.py
from fastapi import APIRouter, Depends, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func
from app.database import get_db
from app.models.contestant import Work, Contestant
from app.models.vote import Vote

router = APIRouter()


@router.get("/api/works")
async def list_works(
    search: str = Query("", description="搜索作品编号或参赛者姓名"),
    sort: str = Query("number", description="排序: number/latest/votes"),
    page: int = Query(1, ge=1),
    size: int = Query(12, ge=1, le=50),
    db: AsyncSession = Depends(get_db),
):
    query = (
        select(Work, Contestant)
        .join(Contestant, Work.contestant_id == Contestant.id)
        .where(Work.status == "approved")
    )

    if search:
        query = query.where(
            (Work.work_number.ilike(f"%{search}%")) | (Contestant.name.ilike(f"%{search}%"))
        )

    # 总数
    count_query = select(func.count()).select_from(query.subquery())
    total = (await db.execute(count_query)).scalar() or 0

    # 排序
    if sort == "votes":
        vote_counts = (
            select(Vote.work_id, func.count().label("cnt"))
            .group_by(Vote.work_id)
            .subquery()
        )
        query = query.outerjoin(vote_counts, Work.id == vote_counts.c.work_id).order_by(
            vote_counts.c.cnt.desc().nullslast()
        )
    elif sort == "latest":
        query = query.order_by(Work.created_at.desc())
    else:
        query = query.order_by(Work.work_number.asc())

    # 分页
    query = query.offset((page - 1) * size).limit(size)
    result = await db.execute(query)
    rows = result.all()

    data = []
    for work, contestant in rows:
        vote_result = await db.execute(
            select(func.count()).select_from(Vote).where(Vote.work_id == work.id)
        )
        vote_count = vote_result.scalar() or 0

        name_masked = contestant.name[0] + "**" if len(contestant.name) > 1 else contestant.name

        data.append({
            "work_number": work.work_number,
            "name_masked": name_masked,
            "images": work.images,
            "vote_count": vote_count,
        })

    return {"data": data, "total": total, "page": page, "size": size}
