"""Migrate shares to granular permissions

Revision ID: e7f8c2d3b4a5
Revises: ca493cd501f4
Create Date: 2026-03-31 10:50:00.000000

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = 'e7f8c2d3b4a5'
down_revision = 'ca493cd501f4'
branch_labels = None
depends_on = None


def upgrade() -> None:
    # Add new permission columns
    op.add_column('shares', sa.Column('can_view', sa.Boolean(), server_default=sa.true(), nullable=False))
    op.add_column('shares', sa.Column('can_comment', sa.Boolean(), server_default=sa.false(), nullable=False))
    op.add_column('shares', sa.Column('can_edit', sa.Boolean(), server_default=sa.false(), nullable=False))
    
    # Migrate data from permission_type to granular permissions
    # VIEWER -> can_view only, EDITOR -> can_view + can_edit
    op.execute("""
        UPDATE shares 
        SET can_view = TRUE,
            can_comment = FALSE,
            can_edit = CASE WHEN permission_type = 'EDITOR' THEN TRUE ELSE FALSE END
    """)
    
    # Drop old permission_type column
    op.drop_column('shares', 'permission_type')


def downgrade() -> None:
    # Add back permission_type column
    op.add_column('shares', sa.Column('permission_type', sa.Enum('VIEWER', 'EDITOR', 'COMMENTER', name='sharetype'), nullable=True))
    
    # Migrate data back from granular permissions to permission_type
    op.execute("""
        UPDATE shares 
        SET permission_type = CASE 
            WHEN can_edit = TRUE THEN 'EDITOR'
            WHEN can_comment = TRUE THEN 'COMMENTER'
            ELSE 'VIEWER'
        END
    """)
    
    # Drop granular permission columns
    op.drop_column('shares', 'can_view')
    op.drop_column('shares', 'can_comment')
    op.drop_column('shares', 'can_edit')
