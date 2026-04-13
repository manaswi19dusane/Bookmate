"""Add sample_data_loaded flag to track sample data loading

Revision ID: add_sample_data_loaded_flag
Revises: 9ae61e3bbf8c
Create Date: 2026-04-11 19:10:00.000000

"""
from alembic import op
import sqlalchemy as sa

# revision identifiers, used by Alembic
revision = 'add_sample_data_loaded_flag'
down_revision = '9ae61e3bbf8c'
branch_labels = None
depends_on = None

def upgrade():
    # Add a new table to track sample data loading status
    op.create_table(
        'sample_data_tracking',
        sa.Column('id', sa.Integer, primary_key=True),
        sa.Column('sample_data_loaded', sa.Boolean, nullable=False, default=False),
        sa.Column('created_at', sa.DateTime, nullable=False, server_default=sa.text('CURRENT_TIMESTAMP')),
        sa.Column('updated_at', sa.DateTime, nullable=False, server_default=sa.text('CURRENT_TIMESTAMP'), onupdate=sa.text('CURRENT_TIMESTAMP'))
    )

def downgrade():
    op.drop_table('sample_data_tracking')