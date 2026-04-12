"""Add extended models for library management, institutions, corporate clubs, community groups, and marketplace

Revision ID: 2ddd1040407e
Revises:
Create Date: 2026-04-09 22:01:18.000000

"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import sqlite

# revision identifiers, used by Alembic.
revision = '2ddd1040407e'
down_revision = None
branch_labels = None
depends_on = None

def upgrade():
    op.create_table('extended_books',
    sa.Column('id', sa.String(), nullable=False),
    sa.Column('title', sa.String(), nullable=True),
    sa.Column('author', sa.String(), nullable=True),
    sa.Column('language', sa.String(), nullable=True),
    sa.Column('published_date', sa.Date(), nullable=True),
    sa.Column('image_url', sa.String(), nullable=True),
    sa.Column('purchased_date', sa.Date(), nullable=True),
    sa.Column('isbn', sa.String(), nullable=True),
    sa.Column('description', sa.String(), nullable=True),
    sa.Column('page_count', sa.Integer(), nullable=True),
    sa.Column('categories', sa.String(), nullable=True),
    sa.Column('status', sa.String(), nullable=True),
    sa.Column('created_at', sa.DateTime(), nullable=True),
    sa.Column('updated_at', sa.DateTime(), nullable=True),
    sa.PrimaryKeyConstraint('id')
    )
    op.create_table('libraries',
    sa.Column('id', sa.String(), nullable=False),
    sa.Column('name', sa.String(), nullable=True),
    sa.Column('description', sa.String(), nullable=True),
    sa.Column('address', sa.String(), nullable=True),
    sa.Column('contact_email', sa.String(), nullable=True),
    sa.Column('created_at', sa.DateTime(), nullable=True),
    sa.Column('updated_at', sa.DateTime(), nullable=True),
    sa.PrimaryKeyConstraint('id')
    )
    op.create_table('institutions',
    sa.Column('id', sa.String(), nullable=False),
    sa.Column('name', sa.String(), nullable=True),
    sa.Column('type', sa.String(), nullable=True),
    sa.Column('address', sa.String(), nullable=True),
    sa.Column('contact_email', sa.String(), nullable=True),
    sa.Column('created_at', sa.DateTime(), nullable=True),
    sa.Column('updated_at', sa.DateTime(), nullable=True),
    sa.PrimaryKeyConstraint('id')
    )
    op.create_table('corporate_clubs',
    sa.Column('id', sa.String(), nullable=False),
    sa.Column('name', sa.String(), nullable=True),
    sa.Column('company_name', sa.String(), nullable=True),
    sa.Column('description', sa.String(), nullable=True),
    sa.Column('contact_email', sa.String(), nullable=True),
    sa.Column('created_at', sa.DateTime(), nullable=True),
    sa.Column('updated_at', sa.DateTime(), nullable=True),
    sa.PrimaryKeyConstraint('id')
    )
    op.create_table('community_groups',
    sa.Column('id', sa.String(), nullable=False),
    sa.Column('name', sa.String(), nullable=True),
    sa.Column('description', sa.String(), nullable=True),
    sa.Column('location', sa.String(), nullable=True),
    sa.Column('contact_email', sa.String(), nullable=True),
    sa.Column('created_at', sa.DateTime(), nullable=True),
    sa.Column('updated_at', sa.DateTime(), nullable=True),
    sa.PrimaryKeyConstraint('id')
    )
    op.create_table('marketplaces',
    sa.Column('id', sa.String(), nullable=False),
    sa.Column('name', sa.String(), nullable=True),
    sa.Column('description', sa.String(), nullable=True),
    sa.Column('commission_rate', sa.Float(), nullable=True),
    sa.Column('payment_gateway', sa.String(), nullable=True),
    sa.Column('created_at', sa.DateTime(), nullable=True),
    sa.Column('updated_at', sa.DateTime(), nullable=True),
    sa.PrimaryKeyConstraint('id')
    )
    op.create_table('wishlists',
    sa.Column('id', sa.String(), nullable=False),
    sa.Column('user_id', sa.String(), nullable=True),
    sa.Column('book_id', sa.String(), nullable=True),
    sa.Column('added_at', sa.DateTime(), nullable=True),
    sa.Column('priority', sa.Integer(), nullable=True),
    sa.PrimaryKeyConstraint('id')
    )
    op.create_table('reading_progress',
    sa.Column('id', sa.String(), nullable=False),
    sa.Column('user_id', sa.String(), nullable=True),
    sa.Column('book_id', sa.String(), nullable=True),
    sa.Column('current_page', sa.Integer(), nullable=True),
    sa.Column('total_pages', sa.Integer(), nullable=True),
    sa.Column('status', sa.String(), nullable=True),
    sa.Column('started_at', sa.DateTime(), nullable=True),
    sa.Column('completed_at', sa.DateTime(), nullable=True),
    sa.Column('rating', sa.Integer(), nullable=True),
    sa.Column('review', sa.String(), nullable=True),
    sa.Column('updated_at', sa.DateTime(), nullable=True),
    sa.PrimaryKeyConstraint('id')
    )
    op.create_table('book_libraries',
    sa.Column('book_id', sa.String(), nullable=False),
    sa.Column('library_id', sa.String(), nullable=False),
    sa.Column('added_at', sa.DateTime(), nullable=True),
    sa.Column('status', sa.String(), nullable=True),
    sa.Column('location', sa.String(), nullable=True),
    sa.ForeignKeyConstraint(['book_id'], ['bookorm.id'], ),
    sa.ForeignKeyConstraint(['library_id'], ['libraries.id'], ),
    sa.PrimaryKeyConstraint('book_id', 'library_id')
    )
    op.create_table('book_institutions',
    sa.Column('book_id', sa.String(), nullable=False),
    sa.Column('institution_id', sa.String(), nullable=False),
    sa.Column('added_at', sa.DateTime(), nullable=True),
    sa.Column('course_code', sa.String(), nullable=True),
    sa.Column('required', sa.Boolean(), nullable=True),
    sa.ForeignKeyConstraint(['book_id'], ['bookorm.id'], ),
    sa.ForeignKeyConstraint(['institution_id'], ['institutions.id'], ),
    sa.PrimaryKeyConstraint('book_id', 'institution_id')
    )
    op.create_table('book_corporate_clubs',
    sa.Column('book_id', sa.String(), nullable=False),
    sa.Column('corporate_club_id', sa.String(), nullable=False),
    sa.Column('added_at', sa.DateTime(), nullable=True),
    sa.Column('recommended_by', sa.String(), nullable=True),
    sa.ForeignKeyConstraint(['book_id'], ['bookorm.id'], ),
    sa.ForeignKeyConstraint(['corporate_club_id'], ['corporate_clubs.id'], ),
    sa.PrimaryKeyConstraint('book_id', 'corporate_club_id')
    )
    op.create_table('book_community_groups',
    sa.Column('book_id', sa.String(), nullable=False),
    sa.Column('community_group_id', sa.String(), nullable=False),
    sa.Column('added_at', sa.DateTime(), nullable=True),
    sa.Column('discussion_topic', sa.String(), nullable=True),
    sa.ForeignKeyConstraint(['book_id'], ['bookorm.id'], ),
    sa.ForeignKeyConstraint(['community_group_id'], ['community_groups.id'], ),
    sa.PrimaryKeyConstraint('book_id', 'community_group_id')
    )
    op.create_table('book_marketplaces',
    sa.Column('book_id', sa.String(), nullable=False),
    sa.Column('marketplace_id', sa.String(), nullable=False),
    sa.Column('listed_at', sa.DateTime(), nullable=True),
    sa.Column('price', sa.Float(), nullable=True),
    sa.Column('condition', sa.String(), nullable=True),
    sa.Column('quantity', sa.Integer(), nullable=True),
    sa.Column('sold_count', sa.Integer(), nullable=True),
    sa.ForeignKeyConstraint(['book_id'], ['bookorm.id'], ),
    sa.ForeignKeyConstraint(['marketplace_id'], ['marketplaces.id'], ),
    sa.PrimaryKeyConstraint('book_id', 'marketplace_id')
    )

def downgrade():
    op.drop_table('book_marketplaces')
    op.drop_table('book_community_groups')
    op.drop_table('book_corporate_clubs')
    op.drop_table('book_institutions')
    op.drop_table('book_libraries')
    op.drop_table('reading_progress')
    op.drop_table('wishlists')
    op.drop_table('marketplaces')
    op.drop_table('community_groups')
    op.drop_table('corporate_clubs')
    op.drop_table('institutions')
    op.drop_table('libraries')
    op.drop_table('extended_books')