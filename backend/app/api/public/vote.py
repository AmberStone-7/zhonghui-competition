from fastapi import APIRouter, Depends, HTTPException, Request
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func
from app.database import get_db
from app.models.vote import Vote
from app.models.contestant import Work
from app.models.site_config import SiteConfig
from app.schemas.vote import VoteRequest, VoteResponse, VoteStatusResponse

router = APIRouter()


@router.get("/api/vote/status", response_model=VoteStatusResponse)
async def get_vote_status(db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(SiteConfig).where(SiteConfig.key == "vote_channel"))
    config = result.scalar_one_or_none()

    if not config:
        return VoteStatusResponse(channel_status="closed", custom_message="")

    status = config.value.get("status", "closed")
    message_key = {
        "open": "",
        "closed": "vote_closed_message",
        "not_started": "vote_not_started_message",
    }.get(status, "")

    custom_message = ""
    if message_key:
        msg_result = await db.execute(select(SiteConfig).where(SiteConfig.key == message_key))
        msg_config = msg_result.scalar_one_or_none()
        if msg_config:
            custom_message = msg_config.value.get("message", "")

    return VoteStatusResponse(channel_status=status, custom_message=custom_message)


@router.post("/api/vote", response_model=VoteResponse)
async def vote(
    req: VoteRequest,
    request: Request,
    db: AsyncSession = Depends(get_db),
):
    # 检查投票通道
    result = await db.execute(select(SiteConfig).where(SiteConfig.key == "vote_channel"))
    config = result.scalar_one_or_none()
    if not config or config.value.get("status") != "open":
        raise HTTPException(status_code=503, detail="投票通道未开启")

    # 检查作品是否存在且已审核
    work_result = await db.execute(select(Work).where(Work.id == req.work_id, Work.status == "approved"))
    if not work_result.scalar_one_or_none():
        raise HTTPException(status_code=404, detail="作品不存在或未审核")

    # 检查是否已投票（手机号 + 作品）
    existing = await db.execute(
        select(Vote).where(Vote.work_id == req.work_id, Vote.phone == req.phone)
    )
    if existing.scalar_one_or_none():
        raise HTTPException(status_code=409, detail="您已对该作品投过票")

    # IP 限流：同一 IP 对同一作品限投 1 次
    client_ip = request.client.host if request.client else "unknown"
    ip_existing = await db.execute(
        select(Vote).where(Vote.work_id == req.work_id, Vote.ip_address == client_ip)
    )
    if ip_existing.scalar_one_or_none():
        raise HTTPException(status_code=409, detail="该 IP 已对该作品投过票")

    # 创建投票记录
    vote_record = Vote(
        work_id=req.work_id,
        phone=req.phone,
        ip_address=client_ip,
        user_agent=request.headers.get("user-agent", ""),
    )
    db.add(vote_record)
    await db.flush()

    # 获取新票数
    count_result = await db.execute(
        select(func.count()).select_from(Vote).where(Vote.work_id == req.work_id)
    )
    new_count = count_result.scalar() or 0

    await db.commit()
    return VoteResponse(message="投票成功", new_vote_count=new_count)
