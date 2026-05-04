"""Add database source fields to datasets

Revision ID: b8c9d0e1f2a3
Revises: 3f15f0a8763f
Create Date: 2026-05-04 00:00:00.000000

"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql


# revision identifiers, used by Alembic.
revision = 'b8c9d0e1f2a3'
down_revision = '3f15f0a8763f'
branch_labels = None
depends_on = None


def upgrade() -> None:
    # Add source_type with default to backfill existing rows
    op.add_column(
        'datasets',
        sa.Column(
            'source_type',
            sa.Enum('FILE', 'WAREHOUSE', 'DATABASE', name='sourcetype', native_enum=False),
            nullable=False,
            server_default='FILE'
        )
    )

    # Make file-based columns optional for DATABASE sources
    op.alter_column(
        'datasets',
        'original_file',
        existing_type=sa.String(length=500),
        nullable=True
    )
    op.alter_column(
        'datasets',
        'file_type',
        existing_type=postgresql.ENUM(name='filetype'),
        nullable=True
    )

    # Add database source fields
    op.add_column('datasets', sa.Column('db_connection_details', sa.JSON(), nullable=True))
    op.add_column('datasets', sa.Column('sql_query', sa.Text(), nullable=True))


def downgrade() -> None:
    # Drop database source fields
    op.drop_column('datasets', 'sql_query')
    op.drop_column('datasets', 'db_connection_details')

    # Restore file-based columns to not-null (best-effort)
    op.alter_column(
        'datasets',
        'file_type',
        existing_type=postgresql.ENUM(name='filetype'),
        nullable=False
    )
    op.alter_column(
        'datasets',
        'original_file',
        existing_type=sa.String(length=500),
        nullable=False
    )

    # Drop source_type column
    op.drop_column('datasets', 'source_type')
