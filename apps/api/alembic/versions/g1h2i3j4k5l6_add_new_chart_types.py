"""Add new chart types to charttype enum

Revision ID: g1h2i3j4k5l6
Revises: f9e4c5d2a1b6
Create Date: 2026-04-07 08:40:00.000000

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = 'g1h2i3j4k5l6'
down_revision = 'f9e4c5d2a1b6'
branch_labels = None
depends_on = None


def upgrade() -> None:
    # PostgreSQL enums can't be modified, only have values added
    # Add UPPERCASE versions of new chart types
    op.execute("ALTER TYPE charttype ADD VALUE 'KPI_CARD'")
    op.execute("ALTER TYPE charttype ADD VALUE 'GAUGE'")
    op.execute("ALTER TYPE charttype ADD VALUE 'COMBO'")
    op.execute("ALTER TYPE charttype ADD VALUE 'TREEMAP'")
    op.execute("ALTER TYPE charttype ADD VALUE 'WATERFALL'")
    op.execute("ALTER TYPE charttype ADD VALUE 'FUNNEL'")
    op.execute("ALTER TYPE charttype ADD VALUE 'BUBBLE'")
    op.execute("ALTER TYPE charttype ADD VALUE 'HEATMAP'")
    op.execute("ALTER TYPE charttype ADD VALUE 'DONUT'")
    op.execute("ALTER TYPE charttype ADD VALUE 'MATRIX'")


def downgrade() -> None:
    pass
