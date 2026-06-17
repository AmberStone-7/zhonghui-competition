from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func
from app.models.contestant import Work


async def generate_work_number(db: AsyncSession) -> str:
    """自动生成下一个作品编号 ZH26-XXX"""
    result = await db.execute(
        select(func.count()).select_from(Work).where(Work.work_number.isnot(None))
    )
    count = result.scalar() or 0
    return f"ZH26-{count + 1:03d}"
