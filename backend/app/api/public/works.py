# backend/app/api/public/works.py
from fastapi import APIRouter, Depends, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func
from app.database import get_db
from app.models.contestant import Work, Contestant
from app.models.vote import Vote

router = APIRouter()


def _escape_like(s: str) -> str:
    """Escape LIKE special characters to prevent wildcard injection."""
    return s.replace("\\", "\\\\").replace("%", "\\%").replace("_", "\\_")


@router.get("/api/works")
async def list_works(
    search: str = Query("", description="搜索作品编号或参赛者姓名"),
    sort: str = Query("number", description="排序: number/latest/votes"),
    page: int = Query(1, ge=1),
    size: int = Query(12, ge=1, le=50),
    db: AsyncSession = Depends(get_db),
):
    # Vote counts subquery (used for both sorting and output)
    vote_counts = (
        select(Vote.work_id, func.count().label("cnt"))
        .group_by(Vote.work_id)
        .subquery()
    )

    query = (
        select(Work, Contestant, func.coalesce(vote_counts.c.cnt, 0).label("vote_count"))
        .join(Contestant, Work.contestant_id == Contestant.id)
        .outerjoin(vote_counts, Work.id == vote_counts.c.work_id)
        .where(Work.status == "approved")
    )

    if search:
        escaped = _escape_like(search)
        query = query.where(
            (Work.work_number.ilike(f"%{escaped}%")) | (Contestant.name.ilike(f"%{escaped}%"))
        )

    # 总数
    count_query = select(func.count()).select_from(query.subquery())
    total = (await db.execute(count_query)).scalar() or 0

    # 排序
    if sort == "votes":
        query = query.order_by(vote_counts.c.cnt.desc().nullslast())
    elif sort == "latest":
        query = query.order_by(Work.created_at.desc())
    else:
        query = query.order_by(Work.work_number.asc().nullslast())

    # 分页
    query = query.offset((page - 1) * size).limit(size)
    result = await db.execute(query)
    rows = result.all()

    data = []
    for work, contestant, vote_count in rows:
        name_masked = contestant.name[0] + "**" if len(contestant.name) > 1 else contestant.name

        data.append({
            "id": str(work.id),
            "work_number": work.work_number,
            "name_masked": name_masked,
            "images": work.images,
            "vote_count": vote_count,
        })

    return {"data": data, "total": total, "page": page, "size": size}
