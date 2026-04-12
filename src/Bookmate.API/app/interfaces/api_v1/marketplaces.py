from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from typing import List

from app.config import get_settings
from app.infrastructure.db import async_session
from app.infrastructure.repositories.interfaces import MarketplaceRepository
from app.application.services.marketplace_service import MarketplaceService
from app.application.usecases import (
    CreateMarketplace,
    ListMarketplaces,
    GetMarketplace,
    UpdateMarketplace,
    DeleteMarketplace
)
from app.interfaces.schemas import (
    MarketplaceCreate,
    MarketplaceResponse,
    MarketplaceUpdate
)

router = APIRouter()

async def get_marketplace_service(session: AsyncSession = Depends(async_session)) -> MarketplaceService:
    return MarketplaceService(MarketplaceRepository(session))

@router.post("/marketplaces", response_model=MarketplaceResponse, status_code=status.HTTP_201_CREATED)
async def create_marketplace(marketplace_create: MarketplaceCreate, marketplace_service: MarketplaceService = Depends(get_marketplace_service)):
    create_marketplace = CreateMarketplace(
        name=marketplace_create.name,
        description=marketplace_create.description,
        category=marketplace_create.category,
        is_public=marketplace_create.is_public,
        created_by=marketplace_create.created_by,
        created_at=marketplace_create.created_at,
        updated_at=marketplace_create.updated_at
    )
    marketplace = await marketplace_service.create_marketplace(create_marketplace)
    return MarketplaceResponse(
        id=marketplace.id.value,
        name=marketplace.name,
        description=marketplace.description,
        category=marketplace.category,
        is_public=marketplace.is_public,
        created_by=marketplace.created_by,
        created_at=marketplace.created_at,
        updated_at=marketplace.updated_at
    )

@router.get("/marketplaces/{marketplace_id}", response_model=MarketplaceResponse)
async def get_marketplace(marketplace_id: str, marketplace_service: MarketplaceService = Depends(get_marketplace_service)):
    marketplace = await marketplace_service.get_marketplace(marketplace_id)
    if marketplace is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Marketplace not found")
    return MarketplaceResponse(
        id=marketplace.id.value,
        name=marketplace.name,
        description=marketplace.description,
        category=marketplace.category,
        is_public=marketplace.is_public,
        created_by=marketplace.created_by,
        created_at=marketplace.created_at,
        updated_at=marketplace.updated_at
    )

@router.get("/marketplaces", response_model=List[MarketplaceResponse])
async def list_marketplaces(page: int = 1, limit: int = 10, marketplace_service: MarketplaceService = Depends(get_marketplace_service)):
    marketplaces = await marketplace_service.list_marketplaces(page=page, limit=limit)
    return [
        MarketplaceResponse(
            id=marketplace.id.value,
            name=marketplace.name,
            description=marketplace.description,
            category=marketplace.category,
            is_public=marketplace.is_public,
            created_by=marketplace.created_by,
            created_at=marketplace.created_at,
            updated_at=marketplace.updated_at
        )
        for marketplace in marketplaces
    ]

@router.put("/marketplaces/{marketplace_id}", response_model=MarketplaceResponse)
async def update_marketplace(marketplace_id: str, marketplace_update: MarketplaceUpdate, marketplace_service: MarketplaceService = Depends(get_marketplace_service)):
    update_marketplace = UpdateMarketplace(
        name=marketplace_update.name,
        description=marketplace_update.description,
        category=marketplace_update.category,
        is_public=marketplace_update.is_public,
        updated_at=marketplace_update.updated_at
    )
    marketplace = await marketplace_service.update_marketplace(marketplace_id, update_marketplace)
    return MarketplaceResponse(
        id=marketplace.id.value,
        name=marketplace.name,
        description=marketplace.description,
        category=marketplace.category,
        is_public=marketplace.is_public,
        created_by=marketplace.created_by,
        created_at=marketplace.created_at,
        updated_at=marketplace.updated_at
    )

@router.delete("/marketplaces/{marketplace_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_marketplace(marketplace_id: str, marketplace_service: MarketplaceService = Depends(get_marketplace_service)):
    result = await marketplace_service.delete_marketplace(marketplace_id)
    if not result:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Marketplace not found")