# backend/app/database.py
from sqlalchemy.ext.asyncio import AsyncSession, create_async_engine, async_sessionmaker
from sqlalchemy.orm import DeclarativeBase
from app.config import settings


def _to_async_url(url: str) -> str:
    """Convert database URL to async-compatible format."""
    if url.startswith("sqlite"):
        return url  # aiosqlite handles sqlite+aiosqlite:/// natively
    if url.startswith("postgres://"):
        url = url.replace("postgres://", "postgresql+asyncpg://", 1)
    elif url.startswith("postgresql://"):
        url = url.replace("postgresql://", "postgresql+asyncpg://", 1)
    return url


_is_sqlite = settings.database_url.startswith("sqlite")

if _is_sqlite:
    engine = create_async_engine(
        _to_async_url(settings.database_url),
        echo=False,
        connect_args={"check_same_thread": False},
    )
else:
    engine = create_async_engine(_to_async_url(settings.database_url), echo=False)

async_session = async_sessionmaker(engine, class_=AsyncSession, expire_on_commit=False)


class Base(DeclarativeBase):
    pass


async def get_db() -> AsyncSession:
    async with async_session() as session:
        try:
            yield session
            await session.commit()
        except Exception:
            await session.rollback()
            raise
