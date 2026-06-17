from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func
from app.models.score import Score
from app.models.vote import Vote
from app.models.site_config import SiteConfig


async def calculate_popularity_score(work_id: str, db: AsyncSession) -> float:
    """根据票数计算人气分"""
    count_result = await db.execute(
        select(func.count()).select_from(Vote).where(Vote.work_id == work_id)
    )
    vote_count = count_result.scalar() or 0

    config_result = await db.execute(
        select(SiteConfig).where(SiteConfig.key == "popularity_score_config")
    )
    config = config_result.scalar_one_or_none()

    if not config:
        if vote_count == 0: return 1.0
        if vote_count <= 100: return 1.0
        if vote_count <= 300: return 2.0
        if vote_count <= 500: return 3.0
        if vote_count <= 999: return 4.0
        return 5.0

    tiers = config.value.get("tiers", [])
    for tier in tiers:
        if tier["min"] <= vote_count <= tier["max"]:
            return float(tier["score"])
    return 1.0


async def calculate_total_score(work_id: str, db: AsyncSession) -> dict:
    """计算作品综合总分"""
    scores_result = await db.execute(
        select(Score).where(Score.work_id == work_id)
    )
    scores = scores_result.scalars().all()

    board_scores = {}
    for score in scores:
        board_scores[score.scorer_role] = score.subtotal

    popularity = await calculate_popularity_score(work_id, db)

    total = (
        board_scores.get("scorer_a", 0)
        + board_scores.get("scorer_b", 0)
        + board_scores.get("scorer_c", 0)
        + board_scores.get("scorer_d", 0)
        + popularity
    )

    return {
        "score_a": board_scores.get("scorer_a", 0),
        "score_b": board_scores.get("scorer_b", 0),
        "score_c": board_scores.get("scorer_c", 0),
        "score_d": board_scores.get("scorer_d", 0),
        "popularity_score": popularity,
        "total": total,
    }
