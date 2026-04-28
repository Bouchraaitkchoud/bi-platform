"""merge concurrent migration branches

Revision ID: 3f15f0a8763f
Revises: 001_add_transformations, i8j9k0l1m2n3
Create Date: 2026-04-28 09:32:57.605485

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = '3f15f0a8763f'
down_revision = ('001_add_transformations', 'i8j9k0l1m2n3')
branch_labels = None
depends_on = None


def upgrade() -> None:
    pass


def downgrade() -> None:
    pass
