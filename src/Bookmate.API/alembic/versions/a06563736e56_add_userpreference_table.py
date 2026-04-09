"""Add UserPreference table

Revision ID: a06563736e56
Revises:
Create Date: 2026-04-09 14:50:34.000000

"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import sqlite

# revision identifiers, used by Alembic.
revision = 'a06563736e56'
down_revision = None
branch_labels = None
depends_on = None


def upgrade():
    op.create_table(
        'userpreferenceorm',
        sa.Column('id', sa.String(), nullable=False),
        sa.Column('user_id', sa.String(), nullable=False),
        sa.Column('genre', sa.String(), nullable=False),
        sa.Column('author', sa.String(), nullable=False),
        sa.Column('created_at', sa.DateTime(), nullable=False),
        sa.PrimaryKeyConstraint('id'),
        sa.ForeignKeyConstraint(['user_id'], ['userorm.id'], ondelete='CASCADE'),
        sa.Index('ix_userpreferenceorm_user_id', 'user_id')
    )


def downgrade():
    op.drop_table('userpreferenceorm')