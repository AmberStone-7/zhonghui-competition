"""Generate demo data for public preview."""
import asyncio, uuid, random
from datetime import datetime, timezone, timedelta
from app.database import async_session
from app.models.contestant import Contestant, Work
from app.models.vote import Vote
from app.models.score import Score
from app.models.site_config import SiteConfig
from app.models.user import AdminUser
from sqlalchemy import select
import bcrypt

NAMES = ["张建国","李美玲","王大明","陈小芳","刘志强","赵丽华","周文博","吴秀英","郑伟杰","冯雪梅",
         "蒋海龙","沈玉兰","韩磊","杨静","朱建华","秦晓燕","许志明","何丽","吕强","施美华"]
PROVINCES = ["浙江省","江苏省","广东省","福建省","山东省","河南省","湖北省","四川省"]
CITIES = ["杭州市","南京市","广州市","福州市","济南市","郑州市","武汉市","成都市"]
STREETS = ["中山路","解放路","人民路","建设路","和平街","长安街","南京路","北京路"]

STATUSES = ["pending"]*5 + ["approved"]*12 + ["rejected"]*3

async def seed_demo():
    async with async_session() as db:
        # Check if already seeded
        result = await db.execute(select(Contestant).limit(1))
        if result.scalar_one_or_none():
            print("Demo data already exists, skipping seed.")
            return

        now = datetime.now(timezone.utc)
        work_ids = []

        # Create admin users
        users_data = [
            ("admin", "admin123", "super_admin"),
            ("scorer_a", "scorer123", "scorer_a"),
            ("scorer_b", "scorer123", "scorer_b"),
            ("scorer_c", "scorer123", "scorer_c"),
            ("scorer_d", "scorer123", "scorer_d"),
        ]
        for username, password, role in users_data:
            existing = await db.execute(select(AdminUser).where(AdminUser.username == username))
            if not existing.scalar_one_or_none():
                db.add(AdminUser(
                    username=username,
                    password_hash=bcrypt.hashpw(password.encode(), bcrypt.gensalt()).decode(),
                    role=role,
                ))

        # Create contestants + works
        for i, name in enumerate(NAMES):
            cid = uuid.uuid4()
            db.add(Contestant(
                id=cid, name=name,
                address=f"{random.choice(PROVINCES)}{random.choice(CITIES)}{random.choice(STREETS)}{random.randint(1,300)}号",
                tax_id=f"91330100MA28W{random.randint(10000,99999)}X",
                phone=f"138{random.randint(10000000,99999999)}",
                created_at=now - timedelta(days=random.randint(1,14))
            ))
            wid = uuid.uuid4()
            status = STATUSES[i]
            work_number = f"CC2024{str(i+1).zfill(3)}"
            work_ids.append((wid, status, work_number))
            db.add(Work(
                id=wid, contestant_id=cid, work_number=work_number,
                images=["https://placehold.co/600x400/E2E8F0/475569?text=Work+"+str(i+1)],
                status=status,
                reject_reason="照片模糊，不符合参赛要求" if status == "rejected" else None,
                reviewed_at=now - timedelta(days=random.randint(1,10)) if status != "pending" else None,
                created_at=now - timedelta(days=random.randint(1,14)),
                updated_at=now - timedelta(days=random.randint(0,7))
            ))

        # Votes for approved works
        for wid, status, _ in work_ids:
            if status == "approved":
                for _ in range(random.randint(50, 800)):
                    db.add(Vote(
                        id=uuid.uuid4(), work_id=wid,
                        phone=f"139{random.randint(10000000,99999999)}",
                        ip_address=f"192.168.{random.randint(1,255)}.{random.randint(1,255)}",
                        user_agent="Mozilla/5.0",
                        created_at=now - timedelta(days=random.randint(1,10))
                    ))

        # Scores
        for wid, status, _ in work_ids:
            if status == "approved":
                for role in ["scorer_a","scorer_b","scorer_c","scorer_d"]:
                    items = {k: random.randint(12,20) for k in ["creativity","technique","aesthetics","relevance","overall"]}
                    db.add(Score(
                        id=uuid.uuid4(), work_id=wid, scorer_role=role,
                        items=items, subtotal=sum(items.values()),
                        status=random.choice(["reviewed","reviewed","reviewed","locked"]),
                        created_at=now - timedelta(days=random.randint(1,7)),
                        updated_at=now - timedelta(days=random.randint(0,3))
                    ))

        # Site configs
        configs = {
            "register_channel": {"status":"open"},
            "vote_channel": {"status":"open"},
            "rules_content": {"content":"参赛规则：每位参赛者仅限提交一份作品；作品需为原创橱窗设计。"},
            "awards_content": {"categories":[
                {"name":"一等奖","amount":"¥50,000","count":1},
                {"name":"二等奖","amount":"¥20,000","count":3},
                {"name":"三等奖","amount":"¥10,000","count":5},
                {"name":"人气奖","amount":"¥5,000","count":3},
            ]},
            "popularity_score_config": {"tiers":[
                {"min":0,"max":0,"score":1},{"min":1,"max":100,"score":1},
                {"min":101,"max":300,"score":2},{"min":301,"max":500,"score":3},
                {"min":501,"max":999,"score":4},{"min":1000,"max":999999,"score":5},
            ]},
        }
        for key, value in configs.items():
            existing = await db.execute(select(SiteConfig).where(SiteConfig.key == key))
            if not existing.scalar_one_or_none():
                db.add(SiteConfig(key=key, value=value))

        await db.commit()
        print("Demo data seeded: 20 contestants, 20 works, votes & scores.")

if __name__ == "__main__":
    asyncio.run(seed_demo())
