"""Add multi-table warehouse support

Revision ID: h5i6j7k8l9m0
Revises: g1h2i3j4k5l6
Create Date: 2026-04-07 10:30:00.000000

"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql


# revision identifiers, used by Alembic.
revision = 'h5i6j7k8l9m0'
down_revision = 'g1h2i3j4k5l6'
branch_labels = None
depends_on = None


def upgrade() -> None:
    # Create data_warehouses table
    op.create_table(
        'data_warehouses',
        sa.Column('id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('user_id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('name', sa.String(length=255), nullable=False),
        sa.Column('description', sa.Text(), nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=True),
        sa.Column('updated_at', sa.DateTime(timezone=True), nullable=True),
        sa.ForeignKeyConstraint(['user_id'], ['users.id'], ),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_data_warehouses_user_id'), 'data_warehouses', ['user_id'], unique=False)
    op.create_index(op.f('ix_data_warehouses_name'), 'data_warehouses', ['name'], unique=False)

    # Create data_tables table
    op.create_table(
        'data_tables',
        sa.Column('id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('user_id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('name', sa.String(length=255), nullable=False),
        sa.Column('description', sa.Text(), nullable=True),
        sa.Column('original_file', sa.String(length=500), nullable=False),
        sa.Column('file_type', sa.String(length=50), nullable=True, server_default='CSV'),
        sa.Column('row_count', sa.Integer(), nullable=False, server_default=sa.text('0')),
        sa.Column('column_count', sa.Integer(), nullable=False, server_default=sa.text('0')),
        sa.Column('columns_metadata', sa.JSON(), nullable=True),
        sa.Column('file_size', sa.Integer(), nullable=False, server_default=sa.text('0')),
        sa.Column('is_processed', sa.Boolean(), nullable=False, server_default=sa.false()),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=True),
        sa.Column('updated_at', sa.DateTime(timezone=True), nullable=True),
        sa.ForeignKeyConstraint(['user_id'], ['users.id'], ),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_data_tables_user_id'), 'data_tables', ['user_id'], unique=False)
    op.create_index(op.f('ix_data_tables_name'), 'data_tables', ['name'], unique=False)

    # Create warehouse_tables association table for many-to-many
    op.create_table(
        'warehouse_tables',
        sa.Column('warehouse_id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('table_id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.ForeignKeyConstraint(['warehouse_id'], ['data_warehouses.id'], ondelete='CASCADE'),
        sa.ForeignKeyConstraint(['table_id'], ['data_tables.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('warehouse_id', 'table_id')
    )
    op.create_index(op.f('ix_warehouse_tables_warehouse_id'), 'warehouse_tables', ['warehouse_id'], unique=False)
    op.create_index(op.f('ix_warehouse_tables_table_id'), 'warehouse_tables', ['table_id'], unique=False)

    # Create warehouse_relationships table
    op.create_table(
        'warehouse_relationships',
        sa.Column('id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('warehouse_id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('from_table_name', sa.String(length=255), nullable=False),
        sa.Column('to_table_name', sa.String(length=255), nullable=False),
        sa.Column('from_column', sa.String(length=255), nullable=False),
        sa.Column('to_column', sa.String(length=255), nullable=False),
        sa.Column('cardinality', sa.String(length=50), nullable=False, server_default='1:*'),
        sa.Column('join_type', sa.String(length=50), nullable=False, server_default='left'),
        sa.Column('is_auto_detected', sa.Boolean(), nullable=False, server_default=sa.true()),
        sa.Column('confidence_score', sa.Integer(), nullable=False, server_default=sa.text('100')),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=True),
        sa.Column('updated_at', sa.DateTime(timezone=True), nullable=True),
        sa.ForeignKeyConstraint(['warehouse_id'], ['data_warehouses.id'], ),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_warehouse_relationships_warehouse_id'), 'warehouse_relationships', ['warehouse_id'], unique=False)


def downgrade() -> None:
    # Drop indexes
    op.drop_index(op.f('ix_warehouse_relationships_warehouse_id'), table_name='warehouse_relationships')
    
    # Drop tables in reverse order
    op.drop_table('warehouse_relationships')
    
    op.drop_index(op.f('ix_warehouse_tables_table_id'), table_name='warehouse_tables')
    op.drop_index(op.f('ix_warehouse_tables_warehouse_id'), table_name='warehouse_tables')
    op.drop_table('warehouse_tables')
    
    op.drop_index(op.f('ix_data_tables_name'), table_name='data_tables')
    op.drop_index(op.f('ix_data_tables_user_id'), table_name='data_tables')
    op.drop_table('data_tables')
    
    op.drop_index(op.f('ix_data_warehouses_name'), table_name='data_warehouses')
    op.drop_index(op.f('ix_data_warehouses_user_id'), table_name='data_warehouses')
    op.drop_table('data_warehouses')
