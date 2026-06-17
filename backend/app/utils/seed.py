import asyncio
from passlib.context import CryptContext
from sqlalchemy import select
from app.database import async_session
from app.models.user import AdminUser
from app.models.site_config import SiteConfig

pwd_context = CryptContext(schemes=["bcrypt"])


async def seed():
    async with async_session() as db:
        # 创建管理员和评分员账户
        users = [
            {"username": "admin", "password": "admin123", "role": "super_admin"},
            {"username": "scorer_a", "password": "scorer123", "role": "scorer_a"},
            {"username": "scorer_b", "password": "scorer123", "role": "scorer_b"},
            {"username": "scorer_c", "password": "scorer123", "role": "scorer_c"},
            {"username": "scorer_d", "password": "scorer123", "role": "scorer_d"},
        ]
        for u in users:
            existing = await db.execute(
                select(AdminUser).where(AdminUser.username == u["username"])
            )
            if not existing.scalar_one_or_none():
                db.add(AdminUser(
                    username=u["username"],
                    password_hash=pwd_context.hash(u["password"]),
                    role=u["role"],
                ))

        # 初始配置
        configs = [
            {"key": "register_channel", "value": {"status": "open", "start_time": None, "end_time": None}},
            {"key": "vote_channel", "value": {"status": "closed", "start_time": None, "end_time": None}},
            {"key": "rules_content", "value": {"content": "规则内容待配置"}},
            {"key": "awards_content", "value": {"categories": []}},
            {"key": "register_closed_message", "value": {"message": "报名已关闭"}},
            {"key": "vote_not_started_message", "value": {"message": "投票暂未开始"}},
            {"key": "vote_closed_message", "value": {"message": "投票已结束"}},
            {"key": "popularity_score_config", "value": {
                "tiers": [
                    {"min": 0, "max": 0, "score": 1},
                    {"min": 1, "max": 100, "score": 1},
                    {"min": 101, "max": 300, "score": 2},
                    {"min": 301, "max": 500, "score": 3},
                    {"min": 501, "max": 999, "score": 4},
                    {"min": 1000, "max": 999999, "score": 5},
                ]
            }},
        ]
        for c in configs:
            existing = await db.execute(
                select(SiteConfig).where(SiteConfig.key == c["key"])
            )
            if not existing.scalar_one_or_none():
                db.add(SiteConfig(key=c["key"], value=c["value"]))

        await db.commit()
        print("Seed data created successfully.")


if __name__ == "__main__":
    asyncio.run(seed())
