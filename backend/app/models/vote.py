# backend/app/models/vote.py
import uuid
from datetime import datetime
from sqlalchemy import String, DateTime, ForeignKey, UniqueConstraint
from sqlalchemy.orm import Mapped, mapped_column
from sqlalchemy import Uuid as UUID
from app.database import Base


class Vote(Base):
    __tablename__ = "votes"
    __table_args__ = (
        UniqueConstraint("work_id", "phone", name="uq_vote_work_phone"),
    )

    id: Mapped[uuid.UUID] = mapped_column(UUID, primary_key=True, default=uuid.uuid4)
    work_id: Mapped[uuid.UUID] = mapped_column(UUID, ForeignKey("works.id"), nullable=False)
    phone: Mapped[str] = mapped_column(String(20), nullable=False)
    ip_address: Mapped[str] = mapped_column(String(45), nullable=False)
    user_agent: Mapped[str] = mapped_column(String(500), nullable=False)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)
