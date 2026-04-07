"""Add XLS support to FileType enum

Revision ID: f9e4c5d2a1b6
Revises: e7f8c2d3b4a5
Create Date: 2026-04-02 08:30:00.000000

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = 'f9e4c5d2a1b6'
down_revision = 'e7f8c2d3b4a5'
branch_labels = None
depends_on = None


def upgrade() -> None:
    # Add 'XLS' value to the FileType enum in PostgreSQL
    # Note: Database has uppercase enum values (CSV, XLSX, JSON, not csv, xlsx, json)
    op.execute("ALTER TYPE filetype ADD VALUE 'XLS'")


def downgrade() -> None:
    # Note: PostgreSQL doesn't allow removing enum values easily
    # This is a limitation of PostgreSQL's enum type system
    # The enum value will remain in the database but won't be used
    pass
