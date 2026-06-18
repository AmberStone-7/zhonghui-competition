from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func, cast, Integer
from app.models.contestant import Work


async def generate_work_number(db: AsyncSession) -> str:
    """自动生成下一个作品编号 ZH26-XXX，基于当前最大编号递增"""
    # Extract numeric suffix from work_number (e.g. 'ZH26-003' -> 3) and find max
    result = await db.execute(
        select(func.max(cast(func.substring(Work.work_number, 6), Integer)))
        .where(Work.work_number.isnot(None))
    )
    max_num = result.scalar() or 0
    return f"ZH26-{max_num + 1:03d}"
