from fastapi import FastAPI
from app.config import settings
from app.infrastructure.db import init_db, get_db
from app.infrastructure.seed.seed_data import run_seed, is_sample_data_loaded
from app.interfaces.api_v1.books import router as books_router
from app.interfaces.api_v1.ai import router as ai_router
from app.interfaces.api_v1.users import router as users_router
from app.interfaces.api_v1.libraries import router as libraries_router
from app.interfaces.api_v1.institutions import router as institutions_router
from app.interfaces.api_v1.corporate_clubs import router as corporate_clubs_router
from app.interfaces.api_v1.community_groups import router as community_groups_router
from app.interfaces.api_v1.marketplaces import router as marketplaces_router
from fastapi.middleware.cors import CORSMiddleware

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
    # create tables (if not using migrations yet)
    await init_db()
    
    # Seed sample data if enabled
    if settings.ENABLE_SAMPLE_DATA:
        import asyncio
        from sqlalchemy import create_engine
        from app.infrastructure.seed.seed_data import run_seed, is_sample_data_loaded
        
        # Use sync engine for seeding (since seed functions are sync)
        sync_url = settings.DATABASE_URL.replace("sqlite+aiosqlite:///", "sqlite:///")
        sync_engine = create_engine(sync_url)
        
        # Create Session for ORM operations
        from sqlalchemy.orm import sessionmaker
        SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=sync_engine)
        
        db = SessionLocal()
        try:
            if not is_sample_data_loaded(db):
                run_seed(db)
        finally:
            db.close()

app.include_router(books_router, prefix="/api")
app.include_router(ai_router)
app.include_router(users_router)
app.include_router(libraries_router)
app.include_router(institutions_router)
app.include_router(corporate_clubs_router)
app.include_router(community_groups_router)
app.include_router(marketplaces_router)


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
