from pathlib import Path
import asyncio

import pytest
from fastapi.testclient import TestClient

from app.config import settings
from app.infrastructure.db import dispose_engine
from app.main import create_app


@pytest.fixture()
def client(tmp_path: Path):
    asyncio.run(dispose_engine())
    original_database_url = settings.DATABASE_URL
    settings.DATABASE_URL = f"sqlite+aiosqlite:///{(tmp_path / 'test-bookmate.db').as_posix()}"

    app = create_app()
    with TestClient(app) as test_client:
        yield test_client

    settings.DATABASE_URL = original_database_url
    asyncio.run(dispose_engine())


def test_create_and_list(client: TestClient):
    create_response = client.post(
        "/api/books",
        json={"title": "My Book", "author": "Me", "language": "English"},
    )
    assert create_response.status_code == 201
    data = create_response.json()
    assert data["title"] == "My Book"
    assert data["language"] == "English"

    list_response = client.get("/api/books")
    assert list_response.status_code == 200
    assert any(book["title"] == "My Book" for book in list_response.json())


@pytest.fixture(autouse=True)
def reset_database_engine():
    yield
    asyncio.run(dispose_engine())
