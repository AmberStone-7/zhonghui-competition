from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func
from app.database import get_db
from app.models.score import Score
from app.models.contestant import Work, Contestant
from app.models.vote import Vote
from app.models.user import AdminUser
from app.api.deps import require_role
from app.models.site_config import SiteConfig

router = APIRouter()


@router.get("/api/admin/scores")
async def get_score_ranking(
    page: int = Query(1, ge=1),
    size: int = Query(20, ge=1, le=100),
    sort: str = Query("total"),
    db: AsyncSession = Depends(get_db),
    current_user: AdminUser = Depends(require_role("super_admin")),
):
    # Batch: fetch works + contestants, scores, vote counts in 3 queries
    works_result = await db.execute(
        select(Work, Contestant)
        .join(Contestant, Work.contestant_id == Contestant.id)
        .where(Work.status == "approved")
    )
    work_rows = works_result.all()
    work_ids = [w.id for w, _ in work_rows]

    scores_result = await db.execute(select(Score).where(Score.work_id.in_(work_ids)))
    all_scores = scores_result.scalars().all()

    vote_counts_result = await db.execute(
        select(Vote.work_id, func.count().label("cnt"))
        .where(Vote.work_id.in_(work_ids))
        .group_by(Vote.work_id)
    )
    vote_counts = {row.work_id: row.cnt for row in vote_counts_result.all()}

    config_result = await db.execute(
        select(SiteConfig).where(SiteConfig.key == "popularity_score_config")
    )
    pop_config = config_result.scalar_one_or_none()

    def _popularity(vc: int) -> float:
        if not pop_config:
            if vc <= 0: return 1.0
            if vc <= 100: return 1.0
            if vc <= 300: return 2.0
            if vc <= 500: return 3.0
            if vc <= 999: return 4.0
            return 5.0
        for tier in pop_config.value.get("tiers", []):
            if tier["min"] <= vc <= tier["max"]:
                return float(tier["score"])
        return 1.0

    scored_works = []
    for w, c in work_rows:
        board = {}
        for s in all_scores:
            if s.work_id == w.id:
                board[s.scorer_role] = s.subtotal
        pop = _popularity(vote_counts.get(w.id, 0))
        total = board.get("scorer_a", 0) + board.get("scorer_b", 0) + board.get("scorer_c", 0) + board.get("scorer_d", 0) + pop
        scored_works.append({
            "work_id": str(w.id),
            "work_number": w.work_number,
            "contestant_name": c.name,
            "score_a": board.get("scorer_a", 0),
            "score_b": board.get("scorer_b", 0),
            "score_c": board.get("scorer_c", 0),
            "score_d": board.get("scorer_d", 0),
            "popularity_score": pop,
            "total": total,
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
