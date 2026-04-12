from sqlmodel import SQLModel
from sqlalchemy.ext.asyncio import create_async_engine, AsyncEngine
from sqlalchemy.orm import sessionmaker
from sqlmodel.ext.asyncio.session import AsyncSession
from app.config import settings
from sqlalchemy import MetaData, Table, Column, Integer, String, Boolean, DateTime, text
from sqlalchemy.sql import func
import sqlalchemy as sa

engine: AsyncEngine = create_async_engine(settings.DATABASE_URL, echo=False, future=True)
async_session = sessionmaker(engine, class_=AsyncSession, expire_on_commit=False)

async def get_db():
    async with async_session() as session:
        yield session

async def init_db():
    # create tables (runs SQLModel.metadata.create_all via sync call)
    async with engine.begin() as conn:
        await conn.run_sync(SQLModel.metadata.create_all)

        # Create sample data tracking table
        sample_data_table = sa.Table(
            'sample_data_tracking', sa.MetaData(),
            sa.Column('id', sa.Integer, primary_key=True),
            sa.Column('sample_data_loaded', sa.Boolean, nullable=False, default=False),
            sa.Column('created_at', sa.DateTime, nullable=False, server_default=sa.text('CURRENT_TIMESTAMP')),
            sa.Column('updated_at', sa.DateTime, nullable=False, server_default=sa.text('CURRENT_TIMESTAMP'), onupdate=sa.text('CURRENT_TIMESTAMP'))
        )
        await conn.run_sync(lambda sync_conn: sample_data_table.create(bind=sync_conn, checkfirst=True))

        # Sample data loading temporarily disabled to fix startup
        # Will be restored once ORM models are properly imported
        # from app.infrastructure.sample_data import load_sample_data, is_sample_data_loaded
        # from app.config import settings
        # if settings.load_sample_data and not await conn.run_sync(is_sample_data_loaded):
        #     await conn.run_sync(load_sample_data)

