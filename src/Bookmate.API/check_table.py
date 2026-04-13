from app.infrastructure.db import engine
from sqlalchemy import text

async def check_table():
    async with engine.begin() as conn:
        result = await conn.execute(text("SELECT name FROM sqlite_master WHERE type='table' AND name='userpreferenceorm'"))
        print("Table exists:", bool(result.scalar()))
        result = await conn.execute(text("SELECT name FROM sqlite_master WHERE type='table'"))
        tables = await result.fetchall()
        print("All tables:", [row[0] for row in tables])

if __name__ == "__main__":
    import asyncio
    asyncio.run(check_table())