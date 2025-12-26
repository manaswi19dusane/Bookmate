import asyncio
from logging.config import fileConfig
from sqlalchemy import pool
from sqlalchemy.engine import Connection
from sqlalchemy import engine_from_config
from sqlalchemy.ext.asyncio import create_async_engine
from alembic import context
import os, sys
sys.path.append(os.getcwd())

# this is the Alembic Config object, which provides
# access to the values within the .ini file in use.
config = context.config

# Interpret the config file for Python logging.
fileConfig(config.config_file_name)

# import your models' MetaData object for 'autogenerate' support
from app.infrastructure.db import engine
from app.infrastructure.repositories.book_repo import BookORM
from sqlmodel import SQLModel

target_metadata = SQLModel.metadata

def run_migrations_offline():
    url = config.get_main_option("sqlalchemy.url")
    context.configure(url=url, target_metadata=target_metadata, literal_binds=True)
    with context.begin_transaction():
        context.run_migrations()

def do_run_migrations(connection):
    context.configure(connection=connection, target_metadata=target_metadata)
    with context.begin_transaction():
        context.run_migrations()

async def run_async_migrations():
    # use the engine from our app
    async with engine.begin() as conn:
        await conn.run_sync(do_run_migrations)

def run_migrations_online():
    try:
        asyncio.run(run_async_migrations())
    except Exception:
        # fallback to sync-style (for alembic commands that expect sync URL)
        url = config.get_main_option("sqlalchemy.url")
        connectable = create_async_engine(url)
        with connectable.connect() as connection:
            do_run_migrations(connection)

if context.is_offline_mode():
    run_migrations_offline()
else:
    run_migrations_online()
