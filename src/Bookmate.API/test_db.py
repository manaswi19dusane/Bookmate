from app.infrastructure.db import engine
from sqlalchemy import text
import asyncio

async def test_connection():
    try:
        async with engine.begin() as conn:
            result = await conn.execute(text("SELECT 1"))
            print("Database connection successful!")
            print("Result:", result.scalar())
    except Exception as e:
        print("Database connection failed!")
        print("Error:", str(e))

if __name__ == "__main__":
    asyncio.run(test_connection())