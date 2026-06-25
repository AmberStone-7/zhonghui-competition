"""initial migration - create all tables

Revision ID: 0001_initial
Revises:
Create Date: 2025-06-17 12:00:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


revision: str = "0001_initial"
down_revision: Union[str, None] = None
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    bind = op.get_bind()
    is_sqlite = bind.dialect.name == "sqlite"

    # Create enum types (PG only; SQLite skips)
    if not is_sqlite:
        sa.Enum(
            "super_admin", "scorer_a", "scorer_b", "scorer_c", "scorer_d",
            name="admin_role",
        ).create(bind, checkfirst=True)
        sa.Enum("active", "locked", name="user_status").create(bind, checkfirst=True)
        sa.Enum("pending", "approved", "rejected", "deleted", name="work_status").create(bind, checkfirst=True)
        sa.Enum("scorer_a", "scorer_b", "scorer_c", "scorer_d", name="scorer_role").create(bind, checkfirst=True)
        sa.Enum("unreviewed", "reviewed", "locked", name="score_status").create(bind, checkfirst=True)

    uuid_type = sa.String(36) if is_sqlite else sa.Uuid(as_uuid=True)
    array_type = sa.JSON() if is_sqlite else sa.ARRAY(sa.String())
    json_type = sa.JSON
    now_default = sa.text("CURRENT_TIMESTAMP") if is_sqlite else sa.text("NOW()")

    # admin_users table
    op.create_table(
        "admin_users",
        sa.Column("id", uuid_type, primary_key=True),
        sa.Column("username", sa.String(50), unique=True, nullable=False),
        sa.Column("password_hash", sa.String(255), nullable=False),
        sa.Column("role", sa.String(50), nullable=False),
        sa.Column("status", sa.String(20), nullable=False, server_default=sa.text("'active'")),
        sa.Column("failed_login_count", sa.Integer(), nullable=False, server_default=sa.text("0")),
        sa.Column("created_at", sa.DateTime(), nullable=False, server_default=now_default),
        sa.Column("updated_at", sa.DateTime(), nullable=False, server_default=now_default),
    )

    # contestants table
    op.create_table(
        "contestants",
        sa.Column("id", uuid_type, primary_key=True),
        sa.Column("name", sa.String(20), nullable=False),
        sa.Column("address", sa.String(255), nullable=False),
        sa.Column("tax_id", sa.String(50), unique=True, nullable=False),
        sa.Column("phone", sa.String(20), unique=True, nullable=False),
        sa.Column("created_at", sa.DateTime(), nullable=False, server_default=now_default),
    )

    # works table
    op.create_table(
        "works",
        sa.Column("id", uuid_type, primary_key=True),
        sa.Column("contestant_id", uuid_type, sa.ForeignKey("contestants.id"), unique=True),
        sa.Column("work_number", sa.String(20), unique=True, nullable=True),
        sa.Column("images", array_type, nullable=False),
        sa.Column("status", sa.String(20), nullable=False, server_default=sa.text("'pending'")),
        sa.Column("reject_reason", sa.Text(), nullable=True),
        sa.Column("reviewed_at", sa.DateTime(), nullable=True),
        sa.Column("created_at", sa.DateTime(), nullable=False, server_default=now_default),
        sa.Column("updated_at", sa.DateTime(), nullable=False, server_default=now_default),
    )

    # votes table
    op.create_table(
        "votes",
        sa.Column("id", uuid_type, primary_key=True),
        sa.Column("work_id", uuid_type, sa.ForeignKey("works.id"), nullable=False),
        sa.Column("phone", sa.String(20), nullable=False),
        sa.Column("ip_address", sa.String(45), nullable=False),
        sa.Column("user_agent", sa.String(500), nullable=False),
        sa.Column("created_at", sa.DateTime(), nullable=False, server_default=now_default),
        sa.UniqueConstraint("work_id", "phone", name="uq_vote_work_phone"),
    )

    # scores table
    op.create_table(
        "scores",
        sa.Column("id", uuid_type, primary_key=True),
        sa.Column("work_id", uuid_type, sa.ForeignKey("works.id"), nullable=False),
        sa.Column("scorer_role", sa.String(20), nullable=False),
        sa.Column("items", json_type(), nullable=False),
        sa.Column("subtotal", sa.Float(), nullable=False),
        sa.Column("status", sa.String(20), nullable=False, server_default=sa.text("'unreviewed'")),
        sa.Column("created_at", sa.DateTime(), nullable=False, server_default=now_default),
        sa.Column("updated_at", sa.DateTime(), nullable=False, server_default=now_default),
    )

    # audit_logs table
    op.create_table(
        "audit_logs",
        sa.Column("id", uuid_type, primary_key=True),
        sa.Column("admin_user_id", uuid_type, sa.ForeignKey("admin_users.id")),
        sa.Column("action", sa.String(100), nullable=False),
        sa.Column("target_type", sa.String(50), nullable=False),
        sa.Column("target_id", sa.String(50), nullable=False),
        sa.Column("detail", json_type(), nullable=True),
        sa.Column("ip_address", sa.String(45), nullable=False),
        sa.Column("created_at", sa.DateTime(), nullable=False, server_default=now_default),
    )

    # site_configs table
    op.create_table(
        "site_configs",
        sa.Column("id", uuid_type, primary_key=True),
        sa.Column("key", sa.String(100), unique=True, nullable=False),
        sa.Column("value", json_type(), nullable=False),
        sa.Column("updated_at", sa.DateTime(), nullable=False, server_default=now_default),
    )


def downgrade() -> None:
    bind = op.get_bind()
    is_sqlite = bind.dialect.name == "sqlite"

    op.drop_table("site_configs")
    op.drop_table("audit_logs")
    op.drop_table("scores")
    op.drop_table("votes")
    op.drop_table("works")
    op.drop_table("contestants")
    op.drop_table("admin_users")

    if not is_sqlite:
        sa.Enum(name="score_status").drop(bind, checkfirst=True)
        sa.Enum(name="scorer_role").drop(bind, checkfirst=True)
        sa.Enum(name="work_status").drop(bind, checkfirst=True)
        sa.Enum(name="user_status").drop(bind, checkfirst=True)
        sa.Enum(name="admin_role").drop(bind, checkfirst=True)
