from __future__ import annotations

from collections.abc import AsyncIterator

import sqlalchemy as sa
from sqlalchemy import event
from sqlalchemy.exc import OperationalError
from sqlalchemy.ext.asyncio import AsyncEngine, AsyncSession, async_sessionmaker, create_async_engine
from sqlmodel import SQLModel

from app.config import settings

_engine: AsyncEngine | None = None
_session_factory: async_sessionmaker[AsyncSession] | None = None


def _ensure_sqlite_directory() -> None:
    sqlite_path = settings.sqlite_database_path
    if sqlite_path is None:
        return
    sqlite_path.parent.mkdir(parents=True, exist_ok=True)


def _build_engine() -> AsyncEngine:
    _ensure_sqlite_directory()

    connect_args: dict[str, object] = {}
    if settings.sqlalchemy_database_url.startswith("sqlite"):
        connect_args["timeout"] = settings.SQLITE_TIMEOUT_SECONDS

    engine = create_async_engine(
        settings.sqlalchemy_database_url,
        echo=False,
        future=True,
        pool_pre_ping=not settings.sqlalchemy_database_url.startswith("sqlite"),
        connect_args=connect_args,
    )

    if settings.sqlalchemy_database_url.startswith("sqlite"):
        @event.listens_for(engine.sync_engine, "connect")
        def configure_sqlite(dbapi_connection, _connection_record) -> None:
            cursor = dbapi_connection.cursor()
            cursor.execute("PRAGMA foreign_keys = ON")
            cursor.execute("PRAGMA busy_timeout = 30000")
            cursor.execute("PRAGMA journal_mode = WAL")
            cursor.close()

    return engine


def get_engine() -> AsyncEngine:
    global _engine
    if _engine is None:
        _engine = _build_engine()
    return _engine


def get_session_factory() -> async_sessionmaker[AsyncSession]:
    global _session_factory
    if _session_factory is None:
        _session_factory = async_sessionmaker(
            get_engine(),
            expire_on_commit=False,
            class_=AsyncSession,
        )
    return _session_factory


async def get_db() -> AsyncIterator[AsyncSession]:
    async with get_session_factory()() as session:
        yield session


get_db_session = get_db


async def dispose_engine() -> None:
    global _engine, _session_factory
    if _engine is not None:
        await _engine.dispose()
    _engine = None
    _session_factory = None


async def database_healthcheck() -> bool:
    try:
        async with get_engine().connect() as conn:
            await conn.execute(sa.text("SELECT 1"))
        return True
    except OperationalError:
        return False


async def init_db() -> None:
    try:
        async with get_engine().begin() as conn:
            await conn.run_sync(SQLModel.metadata.create_all)
            await conn.run_sync(_apply_schema_guards)
    except OperationalError as exc:
        sqlite_path = settings.sqlite_database_path
        location = f" at {sqlite_path}" if sqlite_path else ""
        raise RuntimeError(
            f"Database initialization failed{location}. "
            "Check whether the SQLite file is corrupted or DATABASE_URL points to an inaccessible location."
        ) from exc


def _apply_schema_guards(sync_conn) -> None:
    sample_data_table = sa.Table(
        "sample_data_tracking",
        sa.MetaData(),
        sa.Column("id", sa.Integer, primary_key=True),
        sa.Column("sample_data_loaded", sa.Boolean, nullable=False, default=False),
        sa.Column("created_at", sa.DateTime, nullable=False, server_default=sa.text("CURRENT_TIMESTAMP")),
        sa.Column(
            "updated_at",
            sa.DateTime,
            nullable=False,
            server_default=sa.text("CURRENT_TIMESTAMP"),
            onupdate=sa.text("CURRENT_TIMESTAMP"),
        ),
    )
    sample_data_table.create(bind=sync_conn, checkfirst=True)

    dialect_name = sync_conn.dialect.name
    if dialect_name != "sqlite":
        return

    inspector = sa.inspect(sync_conn)
    if not inspector.has_table("userpreferenceorm"):
        return

    existing_columns = {column["name"] for column in inspector.get_columns("userpreferenceorm")}
    if "book_id" not in existing_columns:
        sync_conn.execute(sa.text("ALTER TABLE userpreferenceorm ADD COLUMN book_id VARCHAR"))
