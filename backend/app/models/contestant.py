# backend/app/models/contestant.py
import uuid
from datetime import datetime
from sqlalchemy import String, Enum as SAEnum, DateTime, ForeignKey, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy.dialects.postgresql import UUID, ARRAY
from app.database import Base


class Contestant(Base):
    __tablename__ = "contestants"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    name: Mapped[str] = mapped_column(String(20), nullable=False)
    address: Mapped[str] = mapped_column(String(255), nullable=False)
    tax_id: Mapped[str] = mapped_column(String(50), unique=True, nullable=False)
    phone: Mapped[str] = mapped_column(String(20), unique=True, nullable=False)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)

    work: Mapped["Work"] = relationship(back_populates="contestant", uselist=False)


class Work(Base):
    __tablename__ = "works"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    contestant_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("contestants.id"), unique=True)
    work_number: Mapped[str | None] = mapped_column(String(20), unique=True, nullable=True)
    images: Mapped[list[str]] = mapped_column(ARRAY(String), nullable=False)
    status: Mapped[str] = mapped_column(
        SAEnum("pending", "approved", "rejected", "deleted", name="work_status"),
        default="pending",
    )
    reject_reason: Mapped[str | None] = mapped_column(Text, nullable=True)
    reviewed_at: Mapped[datetime | None] = mapped_column(DateTime, nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)
    updated_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    contestant: Mapped["Contestant"] = relationship(back_populates="work")
