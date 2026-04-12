from typing import List, Optional

from app.domain.extended_models import Marketplace, MarketplaceId
from app.domain.exceptions import MarketplaceNotFound
from app.infrastructure.repositories.interfaces import MarketplaceRepository
from app.application.usecases import (
    CreateMarketplace,
    ListMarketplaces,
    GetMarketplace,
    UpdateMarketplace,
    DeleteMarketplace
)

class MarketplaceService:
    def __init__(self, marketplace_repo: MarketplaceRepository):
        self.marketplace_repo = marketplace_repo

    async def create_marketplace(self, create_marketplace: CreateMarketplace) -> Marketplace:
        marketplace = Marketplace(
            id=MarketplaceId.new(),
            name=create_marketplace.name,
            description=create_marketplace.description,
            category=create_marketplace.category,
            is_public=create_marketplace.is_public,
            created_by=create_marketplace.created_by,
            created_at=create_marketplace.created_at,
            updated_at=create_marketplace.updated_at
        )
        return await self.marketplace_repo.add(marketplace)

    async def get_marketplace(self, marketplace_id: str) -> Marketplace:
        return await self.marketplace_repo.get_by_id(marketplace_id)

    async def list_marketplaces(self, page: int = 1, limit: int = 10) -> List[Marketplace]:
        return await self.marketplace_repo.list(page=page, limit=limit)

    async def update_marketplace(self, marketplace_id: str, update_marketplace: UpdateMarketplace) -> Marketplace:
        marketplace = await self.marketplace_repo.get_by_id(marketplace_id)
        if marketplace is None:
            raise MarketplaceNotFound(marketplace_id)

        if update_marketplace.name:
            marketplace.name = update_marketplace.name
        if update_marketplace.description:
            marketplace.description = update_marketplace.description
        if update_marketplace.category:
            marketplace.category = update_marketplace.category
        if update_marketplace.is_public is not None:
            marketplace.is_public = update_marketplace.is_public

        marketplace.updated_at = update_marketplace.updated_at
        return await self.marketplace_repo.update(marketplace)

    async def delete_marketplace(self, marketplace_id: str) -> bool:
        return await self.marketplace_repo.delete(marketplace_id)