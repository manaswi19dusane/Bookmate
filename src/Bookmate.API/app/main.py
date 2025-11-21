from fastapi import FastAPI
from app.config import settings
from app.infrastructure.db import init_db
from app.interfaces.api_v1.books import router as books_router

app = FastAPI(title=settings.APP_NAME)

@app.on_event("startup")
async def on_startup():
    # create tables (if not using migrations yet)
    await init_db()

app.include_router(books_router, prefix="/api")
