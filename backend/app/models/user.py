# backend/app/models/user.py
import uuid
from datetime import datetime
from sqlalchemy import String, Integer, Enum as SAEnum, DateTime
from sqlalchemy.orm import Mapped, mapped_column
from sqlalchemy import Uuid as UUID
from app.database import Base


class AdminUser(Base):
    __tablename__ = "admin_users"

    id: Mapped[uuid.UUID] = mapped_column(UUID, primary_key=True, default=uuid.uuid4)
    username: Mapped[str] = mapped_column(String(50), unique=True, nullable=False)
    password_hash: Mapped[str] = mapped_column(String(255), nullable=False)
    role: Mapped[str] = mapped_column(
        SAEnum("super_admin", "scorer_a", "scorer_b", "scorer_c", "scorer_d", name="admin_role"),
        nullable=False,
    )
    status: Mapped[str] = mapped_column(
        SAEnum("active", "locked", name="user_status"), default="active"
    )
    failed_login_count: Mapped[int] = mapped_column(Integer, default=0)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)
    updated_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
