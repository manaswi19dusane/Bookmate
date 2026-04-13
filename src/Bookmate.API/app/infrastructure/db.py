from sqlmodel import SQLModel
from sqlalchemy.ext.asyncio import create_async_engine, AsyncEngine
from sqlalchemy.orm import sessionmaker
from sqlmodel.ext.asyncio.session import AsyncSession
from app.config import settings
import sqlalchemy as sa

engine: AsyncEngine = create_async_engine(settings.DATABASE_URL, echo=False, future=True)
async_session = sessionmaker(engine, class_=AsyncSession, expire_on_commit=False)

async def get_db():
    async with async_session() as session:
        yield session

async def init_db():
    async with engine.begin() as conn:
        await conn.run_sync(SQLModel.metadata.create_all)
        sample_data_table = sa.Table(
            'sample_data_tracking', sa.MetaData(),
            sa.Column('id', sa.Integer, primary_key=True),
            sa.Column('sample_data_loaded', sa.Boolean, nullable=False, default=False),
            sa.Column('created_at', sa.DateTime, nullable=False, server_default=sa.text('CURRENT_TIMESTAMP')),
            sa.Column('updated_at', sa.DateTime, nullable=False, server_default=sa.text('CURRENT_TIMESTAMP'), onupdate=sa.text('CURRENT_TIMESTAMP'))
        )
        await conn.run_sync(lambda sync_conn: sample_data_table.create(bind=sync_conn, checkfirst=True))
        result = await conn.execute(sa.text("PRAGMA table_info(userpreferenceorm)"))
        columns = {row[1] for row in result.fetchall()}
        if "book_id" not in columns:
            await conn.execute(
                sa.text(
                    "ALTER TABLE userpreferenceorm "
                    "ADD COLUMN book_id VARCHAR"
                )
            )
        user_columns_result = await conn.execute(sa.text("PRAGMA table_info(userorm)"))
        user_columns = {row[1] for row in user_columns_result.fetchall()}
        if "role" not in user_columns:
            await conn.execute(
                sa.text(
                    "ALTER TABLE userorm "
                    "ADD COLUMN role VARCHAR DEFAULT 'user'"
                )
            )
            await conn.execute(
                sa.text(
                    "UPDATE userorm SET role = 'admin' "
                    "WHERE id = (SELECT id FROM userorm ORDER BY created_at ASC LIMIT 1)"
                )
            )
