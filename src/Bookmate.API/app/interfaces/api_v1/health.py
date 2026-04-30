from fastapi import APIRouter

from app.config import settings
from app.infrastructure.db import database_healthcheck

router = APIRouter(tags=["health"])


@router.get("/health")
async def health_check():
    db_ok = await database_healthcheck()
    return {
        "status": "ok" if db_ok else "degraded",
        "database": "ok" if db_ok else "unavailable",
        "environment": settings.ENVIRONMENT,
    }


@router.get("/ready")
async def readiness_check():
    db_ok = await database_healthcheck()
    return {
        "status": "ready" if db_ok else "degraded",
        "database": "ok" if db_ok else "unavailable",
        "environment": settings.ENVIRONMENT,
    }
