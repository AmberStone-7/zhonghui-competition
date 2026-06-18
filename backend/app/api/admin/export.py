from fastapi import APIRouter, Depends, HTTPException, Query
from fastapi.responses import StreamingResponse
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func
from app.database import get_db
from app.models.contestant import Work, Contestant
from app.models.vote import Vote
from app.models.score import Score
from app.models.audit_log import AuditLog
from app.models.site_config import SiteConfig
from app.models.user import AdminUser
from app.api.deps import require_role
from app.utils.export import generate_csv, generate_excel
import io

router = APIRouter()


@router.get("/api/admin/export")
async def export_data(
    type: str = Query(..., description="scores|registrations|votes|logs"),
    format: str = Query("csv", description="csv|xlsx"),
    db: AsyncSession = Depends(get_db),
    current_user: AdminUser = Depends(require_role("super_admin")),
):
    if type == "scores":
        headers = ["作品编号", "姓名", "A-品牌(4)", "B-视觉(5)", "C-陈列(4)", "D-执行(2)", "人气分(5)", "总分(20)", "排名"]
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

        rows_with_scores = []
        for w, c in work_rows:
            board = {}
            for s in all_scores:
                if s.work_id == w.id:
                    board[s.scorer_role] = s.subtotal
            pop = _popularity(vote_counts.get(w.id, 0))
            total = board.get("scorer_a", 0) + board.get("scorer_b", 0) + board.get("scorer_c", 0) + board.get("scorer_d", 0) + pop
            rows_with_scores.append((w.work_number, c.name, board.get("scorer_a", 0), board.get("scorer_b", 0), board.get("scorer_c", 0), board.get("scorer_d", 0), pop, total))

        rows_with_scores.sort(key=lambda x: x[7], reverse=True)
        rows = [[r[0], r[1], r[2], r[3], r[4], r[5], r[6], r[7], rank] for rank, r in enumerate(rows_with_scores, 1)]

    elif type == "registrations":
        headers = ["姓名", "地址", "税号", "电话", "作品编号", "状态", "提交时间"]
        result = await db.execute(select(Work, Contestant).join(Contestant, Work.contestant_id == Contestant.id).order_by(Work.created_at.desc()))
        rows = [[c.name, c.address, c.tax_id, c.phone, w.work_number or "-", w.status, w.created_at.isoformat()] for w, c in result.all()]

    elif type == "votes":
        headers = ["作品编号", "手机号", "IP", "时间"]
        result = await db.execute(select(Vote, Work).join(Work, Vote.work_id == Work.id).order_by(Vote.created_at.desc()))
        rows = [[w.work_number or "-", v.phone[:3] + "****" + v.phone[7:], v.ip_address, v.created_at.isoformat()] for v, w in result.all()]

    elif type == "logs":
        headers = ["操作人", "操作", "对象类型", "对象ID", "详情", "时间"]
        result = await db.execute(select(AuditLog, AdminUser).join(AdminUser, AuditLog.admin_user_id == AdminUser.id).order_by(AuditLog.created_at.desc()))
        rows = [[u.username, l.action, l.target_type, l.target_id, str(l.detail), l.created_at.isoformat()] for l, u in result.all()]

    else:
        raise HTTPException(status_code=400, detail="无效的导出类型")

    if format == "xlsx":
        content = generate_excel(headers, rows)
        media_type = "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
        ext = "xlsx"
    else:
        content = generate_csv(headers, rows)
        media_type = "text/csv"
        ext = "csv"

    return StreamingResponse(
        io.BytesIO(content),
        media_type=media_type,
        headers={"Content-Disposition": f"attachment; filename=export_{type}.{ext}"},
    )
