from fastapi import FastAPI
from app.config import settings
from app.infrastructure.db import init_db
from app.interfaces.api_v1.books import router as books_router
from app.interfaces.api_v1.ai import router as ai_router
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI(title=settings.APP_NAME)

@app.on_event("startup")
async def on_startup():
    # create tables (if not using migrations yet)
    await init_db()

app.include_router(books_router, prefix="/api")
app.include_router(ai_router)


app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
