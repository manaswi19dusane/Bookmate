import pytest
from httpx import AsyncClient
from app.main import app

@pytest.mark.asyncio
async def test_create_and_list():
    async with AsyncClient(app=app, base_url="http://test") as ac:
        res = await ac.post("/api/books", json={"title":"My Book","author":"Me"})
        assert res.status_code == 201
        data = res.json()
        assert data["title"] == "My Book"

        res2 = await ac.get("/api/books")
        assert res2.status_code == 200
        assert any(b["title"] == "My Book" for b in res2.json())
