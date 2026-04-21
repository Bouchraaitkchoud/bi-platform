# apps/api/alembic/versions/add_transformations_and_features.py
"""Add transformations table, dataset status, user last_activity

Revision ID: 001_add_transformations
Revises: h5i6j7k8l9m0
Create Date: 2026-04-15 10:00:00.000000

"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql


# revision identifiers, used by Alembic.
revision = '001_add_transformations'
down_revision = 'h5i6j7k8l9m0'
branch_labels = None
depends_on = None


def upgrade() -> None:
    # Create ENUM types using raw SQL
    op.execute("""
        CREATE TYPE datasetstatus AS ENUM ('UPLOADED', 'PROCESSING', 'READY', 'FAILED')
    """)
    
    op.execute("""
        CREATE TYPE transformationoperation AS ENUM (
            'DROP_NULLS', 'DROP_DUPLICATES', 'RENAME_COLUMN', 'CAST_TYPE', 
            'FILTER_ROWS', 'DROP_COLUMN', 'COMPUTED_COLUMN', 'FILL_MISSING',
            'SPLIT_COLUMN', 'MERGE_COLUMNS', 'UPPERCASE', 'LOWERCASE', 'TRIM_WHITESPACE'
        )
    """)
    
    # Add last_activity column to users table
    op.add_column('users', sa.Column('last_activity', sa.DateTime(timezone=True), nullable=True))
    
    # Add status column to datasets table using raw SQL to avoid ENUM creation conflicts
    op.execute("""
        ALTER TABLE datasets ADD COLUMN status datasetstatus NOT NULL DEFAULT 'UPLOADED'
    """)
    
    # Create transformations table using raw SQL to avoid ENUM creation conflicts
    op.execute("""
        CREATE TABLE transformations (
            id UUID NOT NULL PRIMARY KEY,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
            updated_at TIMESTAMP WITH TIME ZONE,
            dataset_id UUID NOT NULL REFERENCES datasets(id),
            step_order INTEGER NOT NULL,
            operation transformationoperation NOT NULL,
            parameters JSONB NOT NULL,
            description TEXT,
            UNIQUE(dataset_id, step_order)
        )
    """)
    
    # Create indexes
    op.execute("CREATE INDEX ix_transformations_dataset_id ON transformations(dataset_id)")
    op.execute("CREATE INDEX ix_transformations_step_order ON transformations(step_order)")


def downgrade() -> None:
    op.drop_index(op.f('ix_transformations_step_order'), table_name='transformations')
    op.drop_index(op.f('ix_transformations_dataset_id'), table_name='transformations')
    op.drop_table('transformations')
    op.drop_column('datasets', 'status')
    op.drop_column('users', 'last_activity')
    op.execute('DROP TYPE IF EXISTS datasetstatus')
    op.execute('DROP TYPE IF EXISTS transformationoperation')
