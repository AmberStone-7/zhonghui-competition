"""initial migration - create all tables

Revision ID: 0001_initial
Revises:
Create Date: 2025-06-17 12:00:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects.postgresql import UUID, JSONB, ARRAY


# revision identifiers, used by Alembic.
revision: str = "0001_initial"
down_revision: Union[str, None] = None
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # Create enum types
    admin_role = sa.Enum(
        "super_admin", "scorer_a", "scorer_b", "scorer_c", "scorer_d",
        name="admin_role",
    )
    admin_role.create(op.get_bind())

    user_status = sa.Enum("active", "locked", name="user_status")
    user_status.create(op.get_bind())

    work_status = sa.Enum(
        "pending", "approved", "rejected", "deleted",
        name="work_status",
    )
    work_status.create(op.get_bind())

    scorer_role = sa.Enum(
        "scorer_a", "scorer_b", "scorer_c", "scorer_d",
        name="scorer_role",
    )
    scorer_role.create(op.get_bind())

    score_status = sa.Enum(
        "unreviewed", "reviewed", "locked",
        name="score_status",
    )
    score_status.create(op.get_bind())

    # admin_users table
    op.create_table(
        "admin_users",
        sa.Column("id", UUID(as_uuid=True), primary_key=True),
        sa.Column("username", sa.String(50), unique=True, nullable=False),
        sa.Column("password_hash", sa.String(255), nullable=False),
        sa.Column("role", admin_role, nullable=False),
        sa.Column("status", user_status, nullable=False, server_default=sa.text("'active'")),
        sa.Column("failed_login_count", sa.Integer(), nullable=False, server_default=sa.text("0")),
        sa.Column("created_at", sa.DateTime(), nullable=False, server_default=sa.text("NOW()")),
        sa.Column("updated_at", sa.DateTime(), nullable=False, server_default=sa.text("NOW()")),
    )

    # contestants table
    op.create_table(
        "contestants",
        sa.Column("id", UUID(as_uuid=True), primary_key=True),
        sa.Column("name", sa.String(20), nullable=False),
        sa.Column("address", sa.String(255), nullable=False),
        sa.Column("tax_id", sa.String(50), unique=True, nullable=False),
        sa.Column("phone", sa.String(20), unique=True, nullable=False),
        sa.Column("created_at", sa.DateTime(), nullable=False, server_default=sa.text("NOW()")),
    )

    # works table
    op.create_table(
        "works",
        sa.Column("id", UUID(as_uuid=True), primary_key=True),
        sa.Column(
            "contestant_id",
            UUID(as_uuid=True),
            sa.ForeignKey("contestants.id"),
            unique=True,
        ),
        sa.Column("work_number", sa.String(20), unique=True, nullable=True),
        sa.Column("images", ARRAY(sa.String()), nullable=False),
        sa.Column("status", work_status, nullable=False, server_default=sa.text("'pending'")),
        sa.Column("reject_reason", sa.Text(), nullable=True),
        sa.Column("reviewed_at", sa.DateTime(), nullable=True),
        sa.Column("created_at", sa.DateTime(), nullable=False, server_default=sa.text("NOW()")),
        sa.Column("updated_at", sa.DateTime(), nullable=False, server_default=sa.text("NOW()")),
    )

    # votes table
    op.create_table(
        "votes",
        sa.Column("id", UUID(as_uuid=True), primary_key=True),
        sa.Column(
            "work_id",
            UUID(as_uuid=True),
            sa.ForeignKey("works.id"),
            nullable=False,
        ),
        sa.Column("phone", sa.String(20), nullable=False),
        sa.Column("ip_address", sa.String(45), nullable=False),
        sa.Column("user_agent", sa.String(500), nullable=False),
        sa.Column("created_at", sa.DateTime(), nullable=False, server_default=sa.text("NOW()")),
        sa.UniqueConstraint("work_id", "phone", name="uq_vote_work_phone"),
    )

    # scores table
    op.create_table(
        "scores",
        sa.Column("id", UUID(as_uuid=True), primary_key=True),
        sa.Column(
            "work_id",
            UUID(as_uuid=True),
            sa.ForeignKey("works.id"),
            nullable=False,
        ),
        sa.Column("scorer_role", scorer_role, nullable=False),
        sa.Column("items", JSONB(), nullable=False),
        sa.Column("subtotal", sa.Float(), nullable=False),
        sa.Column("status", score_status, nullable=False, server_default=sa.text("'unreviewed'")),
        sa.Column("created_at", sa.DateTime(), nullable=False, server_default=sa.text("NOW()")),
        sa.Column("updated_at", sa.DateTime(), nullable=False, server_default=sa.text("NOW()")),
    )

    # audit_logs table
    op.create_table(
        "audit_logs",
        sa.Column("id", UUID(as_uuid=True), primary_key=True),
        sa.Column(
            "admin_user_id",
            UUID(as_uuid=True),
            sa.ForeignKey("admin_users.id"),
        ),
        sa.Column("action", sa.String(100), nullable=False),
        sa.Column("target_type", sa.String(50), nullable=False),
        sa.Column("target_id", sa.String(50), nullable=False),
        sa.Column("detail", JSONB(), nullable=True),
        sa.Column("ip_address", sa.String(45), nullable=False),
        sa.Column("created_at", sa.DateTime(), nullable=False, server_default=sa.text("NOW()")),
    )

    # site_configs table
    op.create_table(
        "site_configs",
        sa.Column("id", UUID(as_uuid=True), primary_key=True),
        sa.Column("key", sa.String(100), unique=True, nullable=False),
        sa.Column("value", JSONB(), nullable=False),
        sa.Column("updated_at", sa.DateTime(), nullable=False, server_default=sa.text("NOW()")),
    )


def downgrade() -> None:
    op.drop_table("site_configs")
    op.drop_table("audit_logs")
    op.drop_table("scores")
    op.drop_table("votes")
    op.drop_table("works")
    op.drop_table("contestants")
    op.drop_table("admin_users")

    # Drop enum types
    sa.Enum(name="score_status").drop(op.get_bind())
    sa.Enum(name="scorer_role").drop(op.get_bind())
    sa.Enum(name="work_status").drop(op.get_bind())
    sa.Enum(name="user_status").drop(op.get_bind())
    sa.Enum(name="admin_role").drop(op.get_bind())
