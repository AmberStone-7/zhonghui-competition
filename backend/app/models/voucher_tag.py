# backend/app/models/voucher_tag.py
import uuid
from datetime import datetime
from sqlalchemy import String, Numeric, DateTime
from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy import Uuid as UUID
from app.database import Base


class VoucherTag(Base):
    __tablename__ = "voucher_tags"

    id: Mapped[uuid.UUID] = mapped_column(UUID, primary_key=True, default=uuid.uuid4)
    name: Mapped[str] = mapped_column(String(50), nullable=False)
    amount: Mapped[float] = mapped_column(Numeric(10, 2), nullable=False)
    color: Mapped[str] = mapped_column(String(7), nullable=False, default="#6366F1")
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)

    works: Mapped[list["Work"]] = relationship(back_populates="voucher_tag")
