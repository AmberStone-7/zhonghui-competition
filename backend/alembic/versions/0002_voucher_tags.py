"""add voucher_tags and work management fields

Revision ID: 0002_voucher_tags
Revises: 0001_initial
Create Date: 2026-06-26 12:00:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


revision: str = "0002_voucher_tags"
down_revision: Union[str, None] = "0001_initial"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    bind = op.get_bind()
    is_sqlite = bind.dialect.name == "sqlite"
    uuid_type = sa.String(36) if is_sqlite else sa.Uuid(as_uuid=True)
    now_default = sa.text("CURRENT_TIMESTAMP") if is_sqlite else sa.text("NOW()")

    # PostgreSQL: alter work_status enum to add 'hold'
    if not is_sqlite:
        op.execute("ALTER TYPE work_status ADD VALUE IF NOT EXISTS 'hold'")

    # Create voucher_tags table
    op.create_table(
        "voucher_tags",
        sa.Column("id", uuid_type, primary_key=True),
        sa.Column("name", sa.String(50), nullable=False),
        sa.Column("amount", sa.Numeric(10, 2), nullable=False),
        sa.Column("color", sa.String(7), nullable=False, server_default=sa.text("'#6366F1'")),
        sa.Column("created_at", sa.DateTime(), nullable=False, server_default=now_default),
    )

    # Add new columns to works table
    op.add_column("works", sa.Column("customer_number", sa.String(50), nullable=True))
    op.add_column("works", sa.Column("admin_remarks", sa.Text(), nullable=True))
    op.add_column("works", sa.Column("voucher_tag_id", uuid_type, sa.ForeignKey("voucher_tags.id"), nullable=True))


def downgrade() -> None:
    bind = op.get_bind()
    is_sqlite = bind.dialect.name == "sqlite"

    # Remove columns from works
    with op.batch_alter_table("works") as batch_op:
        batch_op.drop_column("voucher_tag_id")
        batch_op.drop_column("admin_remarks")
        batch_op.drop_column("customer_number")

    # Drop voucher_tags table
    op.drop_table("voucher_tags")

    # PostgreSQL: we can't remove enum values easily, so skip
