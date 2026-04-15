import asyncio

from fastapi import FastAPI
from app.config import settings
from app.infrastructure.db import init_db
from app.infrastructure.seed.seed_data import run_seed, is_sample_data_loaded
from app.application.services.lending_service import LendingService
from app.interfaces.api_v1.books import router as books_router
from app.interfaces.api_v1.ai import router as ai_router
from app.interfaces.api_v1.users import router as users_router
from app.interfaces.api_v1.libraries import router as libraries_router
from app.interfaces.api_v1.institutions import router as institutions_router
from app.interfaces.api_v1.corporate_clubs import router as corporate_clubs_router
from app.interfaces.api_v1.community_groups import router as community_groups_router
from app.interfaces.api_v1.marketplaces import router as marketplaces_router
from app.interfaces.api_v1.lendings import router as lendings_router
from app.interfaces.api_v1.discover import router as discover_router
from app.interfaces.api_v1.wishlist import router as wishlist_router
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from app.infrastructure.db import async_session

app = FastAPI(
    title=settings.APP_NAME,
    swagger_ui_parameters={"defaultModelsExpandDepth": -1},
    openapi_tags=[
        {
            "name": "users",
            "description": "User authentication, preferences and interactions"
        },
    ],
    security=[
        {
            "Bearer": []
        }
    ]
)
reminder_task: asyncio.Task | None = None


async def run_lending_reminders_once():
    async with async_session() as session:
        service = LendingService(session)
        await service.process_due_reminders()


async def lending_reminder_loop():
    while True:
        try:
            await run_lending_reminders_once()
        except Exception as exc:
            print(f"Lending reminder loop failed: {exc}")
        await asyncio.sleep(60 * 60 * 24)

@app.on_event("startup")
async def on_startup():
    global reminder_task
    await init_db()
    if settings.ENABLE_SAMPLE_DATA:
        sync_url = settings.DATABASE_URL.replace("sqlite+aiosqlite:///", "sqlite:///")
        sync_engine = create_engine(sync_url, future=True)
        session_factory = sessionmaker(bind=sync_engine, autocommit=False, autoflush=False)
        db = session_factory()
        try:
            if not is_sample_data_loaded(db):
                run_seed(db)
        finally:
            db.close()
            sync_engine.dispose()
    if reminder_task is None:
        reminder_task = asyncio.create_task(lending_reminder_loop())

app.include_router(users_router)
app.include_router(books_router, prefix="/api")
app.include_router(ai_router)
app.include_router(libraries_router)
app.include_router(institutions_router)
app.include_router(corporate_clubs_router)
app.include_router(community_groups_router)
app.include_router(marketplaces_router)
app.include_router(lendings_router)
app.include_router(discover_router)
app.include_router(wishlist_router)


# Security scheme for Swagger UI
from fastapi.openapi.models import OAuthFlows as OAuthFlowsModel
from fastapi.openapi.models import OAuthFlowPassword
from fastapi.openapi.models import SecurityScheme

@app.on_event("startup")
async def configure_openapi():
    if not app.openapi_schema:
        app.openapi_schema = app.openapi()
    
    # Add Bearer token security scheme
    app.openapi_schema["components"]["securitySchemes"] = {
        "Bearer": {
            "type": "http",
            "scheme": "bearer",
            "bearerFormat": "JWT",
            "description": "Enter your JWT token obtained from /api/users/login"
        }
    }

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.on_event("shutdown")
async def on_shutdown():
    global reminder_task
    if reminder_task is not None:
        reminder_task.cancel()
        try:
            await reminder_task
        except asyncio.CancelledError:
            pass
        reminder_task = None
