from fastapi import FastAPI
from app.config import settings
from app.infrastructure.db import init_db
from app.interfaces.api_v1.books import router as books_router
from app.interfaces.api_v1.ai import router as ai_router
from app.interfaces.api_v1.users import router as users_router
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

app.include_router(books_router, prefix="/api")
app.include_router(ai_router)
app.include_router(users_router)


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
