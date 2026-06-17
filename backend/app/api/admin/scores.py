from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.database import get_db
from app.models.score import Score
from app.models.contestant import Work, Contestant
from app.models.user import AdminUser
from app.api.deps import require_role
from app.services.score_calculator import calculate_total_score

router = APIRouter()


@router.get("/api/admin/scores")
async def get_score_ranking(
    page: int = Query(1, ge=1),
    size: int = Query(20, ge=1, le=100),
    sort: str = Query("total"),
    db: AsyncSession = Depends(get_db),
    current_user: AdminUser = Depends(require_role("super_admin")),
):
    result = await db.execute(
        select(Work, Contestant)
        .join(Contestant, Work.contestant_id == Contestant.id)
        .where(Work.status == "approved")
    )
    rows = result.all()

    scored_works = []
    for work, contestant in rows:
        totals = await calculate_total_score(str(work.id), db)
        scored_works.append({
            "work_id": str(work.id),
            "work_number": work.work_number,
            "contestant_name": contestant.name,
            **totals,
        })

    scored_works.sort(key=lambda x: x["total"], reverse=True)

    for rank, item in enumerate(scored_works, 1):
        item["rank"] = rank

    start = (page - 1) * size
    return {"data": scored_works[start:start + size], "total": len(scored_works), "page": page}


@router.post("/api/admin/scores/{work_id}/lock")
async def lock_scores(
    work_id: str,
    db: AsyncSession = Depends(get_db),
    current_user: AdminUser = Depends(require_role("super_admin")),
):
    result = await db.execute(select(Score).where(Score.work_id == work_id))
    scores = result.scalars().all()
    if not scores:
        raise HTTPException(status_code=404, detail="该作品暂无评分记录")

    for score in scores:
        score.status = "locked"
    await db.commit()
    return {"message": f"已锁定 {len(scores)} 条评分记录"}
