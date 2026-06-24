# backend/app/models/score.py
import uuid
from datetime import datetime
from sqlalchemy import String, Float, Enum as SAEnum, DateTime, ForeignKey
from sqlalchemy.orm import Mapped, mapped_column
from sqlalchemy import Uuid as UUID, JSON
from app.database import Base


class Score(Base):
    __tablename__ = "scores"

    id: Mapped[uuid.UUID] = mapped_column(UUID, primary_key=True, default=uuid.uuid4)
    work_id: Mapped[uuid.UUID] = mapped_column(UUID, ForeignKey("works.id"), nullable=False)
    scorer_role: Mapped[str] = mapped_column(
        SAEnum("scorer_a", "scorer_b", "scorer_c", "scorer_d", name="scorer_role"),
        nullable=False,
    )
    items: Mapped[dict] = mapped_column(JSON, nullable=False)
    subtotal: Mapped[float] = mapped_column(Float, nullable=False)
    status: Mapped[str] = mapped_column(
        SAEnum("unreviewed", "reviewed", "locked", name="score_status"),
        default="unreviewed",
    )
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)
    updated_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
