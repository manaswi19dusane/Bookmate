from fastapi import FastAPI
from app.config import settings
from app.infrastructure.db import init_db
from app.infrastructure.seed.seed_data import ensure_default_admin, run_seed, is_sample_data_loaded
from app.interfaces.api_v1.books import router as books_router
from app.interfaces.api_v1.ai import router as ai_router
from app.interfaces.api_v1.users import router as users_router
from app.interfaces.api_v1.libraries import router as libraries_router
from app.interfaces.api_v1.institutions import router as institutions_router
from app.interfaces.api_v1.corporate_clubs import router as corporate_clubs_router
from app.interfaces.api_v1.community_groups import router as community_groups_router
from app.interfaces.api_v1.marketplaces import router as marketplaces_router
from app.interfaces.api_v1.admin import router as admin_router
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

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

@app.on_event("startup")
async def on_startup():
    await init_db()
    if settings.ENABLE_SAMPLE_DATA:
        sync_url = settings.DATABASE_URL.replace("sqlite+aiosqlite:///", "sqlite:///")
        sync_engine = create_engine(sync_url, future=True)
        session_factory = sessionmaker(bind=sync_engine, autocommit=False, autoflush=False)
        db = session_factory()
        try:
            ensure_default_admin(db)
            if not is_sample_data_loaded(db):
                run_seed(db)
        finally:
            db.close()
            sync_engine.dispose()
    else:
        sync_url = settings.DATABASE_URL.replace("sqlite+aiosqlite:///", "sqlite:///")
        sync_engine = create_engine(sync_url, future=True)
        session_factory = sessionmaker(bind=sync_engine, autocommit=False, autoflush=False)
        db = session_factory()
        try:
            ensure_default_admin(db)
        finally:
            db.close()
            sync_engine.dispose()

app.include_router(users_router)
app.include_router(books_router, prefix="/api")
app.include_router(ai_router)
app.include_router(libraries_router)
app.include_router(institutions_router)
app.include_router(corporate_clubs_router)
app.include_router(community_groups_router)
app.include_router(marketplaces_router)
app.include_router(admin_router)


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
