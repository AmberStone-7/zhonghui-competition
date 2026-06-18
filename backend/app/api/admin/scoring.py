from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.database import get_db
from app.models.score import Score
from app.models.contestant import Work, Contestant
from app.models.user import AdminUser
from app.schemas.score import ScoreSubmission
from app.api.deps import get_current_admin

router = APIRouter()

# 评分板块定义 (4 boards with items and scoring options)
BOARDS = {
    "scorer_a": {
        "name": "品牌与活动规范", "max_score": 4,
        "items": [
            {"name": "官方海报规范展示", "options": [
                {"score": 1.0, "description": "完整展示、无遮挡、位置醒目"},
                {"score": 0.5, "description": "有张贴但不规范"},
                {"score": 0, "description": "未展示"},
            ]},
            {"name": "MP 产品陈列占比", "options": [
                {"score": 1.0, "description": "MP 产品占比 ≥ 65%"},
                {"score": 0.5, "description": "MP 产品占比 50%-65%"},
                {"score": 0, "description": "MP 产品占比 < 50%"},
            ]},
            {"name": "指定新品露出", "options": [
                {"score": 1.0, "description": "清晰可见且有主推位置"},
                {"score": 0.5, "description": "有但不突出"},
                {"score": 0, "description": "无"},
            ]},
            {"name": "品牌识别度 - Logo 及视觉", "options": [
                {"score": 1.0, "description": "Logo 位置突出、视觉统一"},
                {"score": 0.5, "description": "可见但不明显"},
                {"score": 0, "description": "几乎无品牌识别"},
            ]},
        ],
    },
    "scorer_b": {
        "name": "视觉设计表现", "max_score": 5,
        "items": [
            {"name": "色彩搭配与整体美感", "options": [
                {"score": 2, "description": "色彩统一、有主题、有层次"},
                {"score": 1, "description": "基本协调但略杂"},
                {"score": 0, "description": "杂乱无章"},
            ]},
            {"name": "橱窗创意与主题表达", "options": [
                {"score": 2, "description": "有明确主题、创意突出、有记忆点"},
                {"score": 1, "description": "有基础设计但较普通"},
                {"score": 0, "description": "无明显设计"},
            ]},
            {"name": "空间布局与层次感", "options": [
                {"score": 1, "description": "前中后景清晰、视觉动线合理"},
                {"score": 0.5, "description": "有摆放但缺乏层次"},
                {"score": 0, "description": "堆叠混乱"},
            ]},
        ],
    },
    "scorer_c": {
        "name": "陈列专业度", "max_score": 4,
        "items": [
            {"name": "产品陈列逻辑", "options": [
                {"score": 2, "description": "分类清晰、易理解"},
                {"score": 1, "description": "基本分类但略乱"},
                {"score": 0, "description": "无逻辑摆放"},
            ]},
            {"name": "主推产品突出程度", "options": [
                {"score": 1, "description": "主推产品视觉焦点明显"},
                {"score": 0.5, "description": "有突出但不明显"},
                {"score": 0, "description": "无重点"},
            ]},
            {"name": "价格/信息展示清晰度", "options": [
                {"score": 1, "description": "有清晰标识"},
                {"score": 0.5, "description": "信息不完整"},
                {"score": 0, "description": "无信息"},
            ]},
        ],
    },
    "scorer_d": {
        "name": "执行与细节", "max_score": 2,
        "items": [
            {"name": "橱窗整洁度与维护", "options": [
                {"score": 1, "description": "干净整齐，无灰尘/歪斜"},
                {"score": 0.5, "description": "有轻微问题"},
                {"score": 0, "description": "明显杂乱"},
            ]},
            {"name": "灯光与展示效果", "options": [
                {"score": 1, "description": "灯光突出重点，氛围良好"},
                {"score": 0.5, "description": "有灯光但效果一般"},
                {"score": 0, "description": "无灯光或影响观感"},
            ]},
        ],
    },
}


@router.get("/api/admin/scoring/tasks")
async def get_scoring_tasks(
    db: AsyncSession = Depends(get_db),
    current_user: AdminUser = Depends(get_current_admin),
):
    if current_user.role not in BOARDS:
        raise HTTPException(status_code=403, detail="无评分权限")

    result = await db.execute(
        select(Work, Contestant)
        .join(Contestant, Work.contestant_id == Contestant.id)
        .where(Work.status == "approved")
    )
    rows = result.all()

    tasks = []
    for work, contestant in rows:
        score_result = await db.execute(
            select(Score).where(Score.work_id == work.id, Score.scorer_role == current_user.role)
        )
        score = score_result.scalar_one_or_none()
        tasks.append({
            "work_id": str(work.id),
            "work_number": work.work_number,
            "contestant_name": contestant.name,
            "status": score.status if score else "unreviewed",
        })

    board = BOARDS[current_user.role]
    return {
        "scorer_role": current_user.role,
        "board_name": board["name"],
        "max_score": board["max_score"],
        "tasks": tasks,
    }


@router.get("/api/admin/scoring/{work_id}")
async def get_scoring_detail(
    work_id: str,
    db: AsyncSession = Depends(get_db),
    current_user: AdminUser = Depends(get_current_admin),
):
    if current_user.role not in BOARDS:
        raise HTTPException(status_code=403, detail="无评分权限")

    work_result = await db.execute(
        select(Work, Contestant).join(Contestant, Work.contestant_id == Contestant.id).where(Work.id == work_id)
    )
    row = work_result.one_or_none()
    if not row:
        raise HTTPException(status_code=404, detail="作品不存在")
    work, contestant = row

    score_result = await db.execute(
        select(Score).where(Score.work_id == work_id, Score.scorer_role == current_user.role)
    )
    score = score_result.scalar_one_or_none()

    board = BOARDS[current_user.role]
    return {
        "work_info": {"number": work.work_number, "name": contestant.name, "images": work.images},
        "board": {"name": board["name"], "max_score": board["max_score"], "items": board["items"]},
        "current_score": {"items": score.items, "subtotal": score.subtotal, "status": score.status} if score else None,
    }


@router.post("/api/admin/scoring/{work_id}")
async def submit_score(
    work_id: str,
    req: ScoreSubmission,
    db: AsyncSession = Depends(get_db),
    current_user: AdminUser = Depends(get_current_admin),
):
    if current_user.role not in BOARDS:
        raise HTTPException(status_code=403, detail="无评分权限")

    existing = await db.execute(
        select(Score).where(Score.work_id == work_id, Score.scorer_role == current_user.role)
    )
    score = existing.scalar_one_or_none()
    if score and score.status == "locked":
        raise HTTPException(status_code=423, detail="评分已锁定，不可修改")

    subtotal = sum(item.selected_score for item in req.items)
    items_dict = [{"item_name": item.item_name, "selected_score": item.selected_score} for item in req.items]

    if score:
        score.items = items_dict
        score.subtotal = subtotal
        score.status = "reviewed"
    else:
        score = Score(
            work_id=work_id,
            scorer_role=current_user.role,
            items=items_dict,
            subtotal=subtotal,
            status="reviewed",
        )
        db.add(score)

    await db.commit()
    return {"subtotal": subtotal, "message": "评分已保存"}
