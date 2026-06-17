from fastapi import APIRouter, Depends, Query
from fastapi.responses import StreamingResponse
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.database import get_db
from app.models.contestant import Work, Contestant
from app.models.vote import Vote
from app.models.score import Score
from app.models.audit_log import AuditLog
from app.models.user import AdminUser
from app.api.deps import require_role
from app.utils.export import generate_csv, generate_excel
from app.services.score_calculator import calculate_total_score
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
        result = await db.execute(
            select(Work).where(Work.status == "approved").order_by(Work.work_number)
        )
        works = result.scalars().all()
        rows_with_scores = []
        for w in works:
            totals = await calculate_total_score(str(w.id), db)
            rows_with_scores.append((w, totals))
        rows_with_scores.sort(key=lambda x: x[1]["total"], reverse=True)
        rows = []
        for rank, (w, t) in enumerate(rows_with_scores, 1):
            c_result = await db.execute(select(Contestant).where(Contestant.id == w.contestant_id))
            c = c_result.scalar_one()
            rows.append([w.work_number, c.name, t["score_a"], t["score_b"], t["score_c"], t["score_d"], t["popularity_score"], t["total"], rank])

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
        return {"error": "无效的导出类型"}

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
