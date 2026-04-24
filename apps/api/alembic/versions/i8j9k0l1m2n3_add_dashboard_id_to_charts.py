"""Add dashboard_id to charts

Revision ID: i8j9k0l1m2n3
Revises: h5i6j7k8l9m0
Create Date: 2026-04-24 10:00:00.000000

"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql


# revision identifiers, used by Alembic.
revision = 'i8j9k0l1m2n3'
down_revision = 'h5i6j7k8l9m0'
branch_labels = None
depends_on = None


def upgrade() -> None:
    # Add dashboard_id column to charts table
    op.add_column('charts', sa.Column('dashboard_id', postgresql.UUID(as_uuid=True), nullable=True))
    op.create_index(op.f('ix_charts_dashboard_id'), 'charts', ['dashboard_id'], unique=False)
    op.create_foreign_key('fk_charts_dashboard_id', 'charts', 'dashboards', ['dashboard_id'], ['id'])


def downgrade() -> None:
    # Remove the foreign key, index, and column
    op.drop_constraint('fk_charts_dashboard_id', 'charts', type_='foreignkey')
    op.drop_index(op.f('ix_charts_dashboard_id'), table_name='charts')
    op.drop_column('charts', 'dashboard_id')
