"""Add book_id to user_preference table

Revision ID: 1444fd36a23e
Revises: a06563736e56
Create Date: 2026-04-09 16:01:00.000000

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic
revision = '1444fd36a23e'
down_revision = 'a06563736e56'
branch_labels = None
depends_on = None


def upgrade():
    op.add_column('userpreferenceorm', sa.Column('book_id', sa.String(), nullable=True))


def downgrade():
    op.drop_column('userpreferenceorm', 'book_id')
