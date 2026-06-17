# backend/app/api/public/register.py
import uuid
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, or_
from app.database import get_db
from app.models.contestant import Contestant, Work
from app.models.site_config import SiteConfig
from app.services.storage import upload_image
from app.services.work_number import generate_work_number

router = APIRouter()


@router.post("/api/register", status_code=201)
async def register(
    name: str = Form(...),
    address: str = Form(...),
    tax_id: str = Form(...),
    phone: str = Form(...),
    images: list[UploadFile] = File(...),
    db: AsyncSession = Depends(get_db),
):
    # 验证字段
    if len(name) < 2 or len(name) > 20:
        raise HTTPException(status_code=400, detail="姓名须为 2-20 字")
    if not phone.startswith("1") or len(phone) != 11:
        raise HTTPException(status_code=400, detail="手机号格式错误")
    if len(images) > 3:
        raise HTTPException(status_code=400, detail="最多上传 3 张图片")
    if len(images) == 0:
        raise HTTPException(status_code=400, detail="请上传至少一张作品图片")

    # 检查报名通道
    result = await db.execute(select(SiteConfig).where(SiteConfig.key == "register_channel"))
    config = result.scalar_one_or_none()
    if config and config.value.get("status") == "closed":
        raise HTTPException(status_code=503, detail="报名通道已关闭")

    # 检查重复报名
    result = await db.execute(
        select(Contestant).where(or_(Contestant.tax_id == tax_id, Contestant.phone == phone))
    )
    existing = result.scalar_one_or_none()
    if existing:
        raise HTTPException(status_code=409, detail="该税号或电话号码已报名")

    # 上传图片
    image_urls = []
    for img in images:
        content = await img.read()
        filename = f"{uuid.uuid4()}_{img.filename}"
        url = await upload_image(content, filename)
        image_urls.append(url)

    # 创建参赛者和作品
    contestant = Contestant(name=name, address=address, tax_id=tax_id, phone=phone)
    db.add(contestant)
    await db.flush()

    work = Work(contestant_id=contestant.id, images=image_urls, status="pending")
    db.add(work)
    await db.commit()

    return {"message": "报名成功！您的作品正在等待审核，审核通过后将获得专属作品编号。"}
