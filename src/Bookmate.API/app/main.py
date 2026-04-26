from __future__ import annotations

from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

from app.config import settings
from app.infrastructure.db import database_healthcheck, dispose_engine, init_db
from app.infrastructure.seed.seed_data import is_sample_data_loaded, run_seed
from app.interfaces.api_v1.ai import router as ai_router
from app.interfaces.api_v1.books import router as books_router
from app.interfaces.api_v1.community_groups import router as community_groups_router
from app.interfaces.api_v1.corporate_clubs import router as corporate_clubs_router
from app.interfaces.api_v1.google_books import router as google_books_router
from app.interfaces.api_v1.health import router as health_router
from app.interfaces.api_v1.institutions import router as institutions_router
from app.interfaces.api_v1.lendings import router as lendings_router
from app.interfaces.api_v1.libraries import router as libraries_router
from app.interfaces.api_v1.marketplaces import router as marketplaces_router
from app.interfaces.api_v1.users import router as users_router
from app.interfaces.api_v1.wishlist import router as wishlist_router


@asynccontextmanager
async def lifespan(_app: FastAPI):
    await init_db()
    _seed_sample_data_if_needed()
    yield
    await dispose_engine()


def create_app() -> FastAPI:
    app = FastAPI(
        title=settings.APP_NAME,
        swagger_ui_parameters={"defaultModelsExpandDepth": -1},
        lifespan=lifespan,
    )

    app.add_middleware(
        CORSMiddleware,
        allow_origins=settings.cors_origins,
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

    @app.get("/")
    async def root():
        return {
            "name": settings.APP_NAME,
            "environment": settings.ENVIRONMENT,
            "status": "ok",
        }

    @app.get("/healthz")
    async def liveness():
        return {"status": "ok"}

    @app.get("/readyz")
    async def readiness():
        db_ok = await database_healthcheck()
        return {
            "status": "ready" if db_ok else "degraded",
            "database": "ok" if db_ok else "unavailable",
            "environment": settings.ENVIRONMENT,
        }

    app.include_router(health_router)
    app.include_router(users_router)
    app.include_router(books_router, prefix="/api")
    app.include_router(ai_router)
    app.include_router(libraries_router)
    app.include_router(institutions_router)
    app.include_router(corporate_clubs_router)
    app.include_router(community_groups_router)
    app.include_router(marketplaces_router)
    app.include_router(google_books_router)
    app.include_router(lendings_router)
    app.include_router(wishlist_router)

    if not app.openapi_schema:
        app.openapi_schema = app.openapi()
    app.openapi_schema.setdefault("components", {})
    app.openapi_schema["components"]["securitySchemes"] = {
        "Bearer": {
            "type": "http",
            "scheme": "bearer",
            "bearerFormat": "JWT",
            "description": "Enter your JWT token obtained from /api/users/login",
        }
    }
    return app


def _seed_sample_data_if_needed() -> None:
    if not settings.ENABLE_SAMPLE_DATA or not settings.sync_database_url.startswith("sqlite"):
        return

    sync_engine = create_engine(settings.sync_database_url, future=True)
    session_factory = sessionmaker(bind=sync_engine, autocommit=False, autoflush=False)
    db = session_factory()
    try:
        if not is_sample_data_loaded(db):
            run_seed(db)
    finally:
        db.close()
        sync_engine.dispose()


app = create_app()
