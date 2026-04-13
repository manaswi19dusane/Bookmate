from typing import List, Optional

from app.domain.extended_models import CorporateClub, CorporateClubId
from app.domain.exceptions import CorporateClubNotFound
from app.infrastructure.repositories.interfaces import CorporateClubRepository
from app.application.usecases import (
    CreateCorporateClub,
    ListCorporateClubs,
    GetCorporateClub,
    UpdateCorporateClub,
    DeleteCorporateClub
)

class CorporateClubService:
    def __init__(self, corporate_club_repo: CorporateClubRepository):
        self.corporate_club_repo = corporate_club_repo

    async def create_corporate_club(self, create_club: CreateCorporateClub) -> CorporateClub:
        corporate_club = CorporateClub(
            id=CorporateClubId.new(),
            name=create_club.name,
            description=create_club.description,
            company_name=create_club.company_name,
            is_public=create_club.is_public,
            created_by=create_club.created_by,
            created_at=create_club.created_at,
            updated_at=create_club.updated_at
        )
        return await self.corporate_club_repo.add(corporate_club)

    async def get_corporate_club(self, club_id: str) -> CorporateClub:
        return await self.corporate_club_repo.get_by_id(club_id)

    async def list_corporate_clubs(self, page: int = 1, limit: int = 10) -> List[CorporateClub]:
        return await self.corporate_club_repo.list(page=page, limit=limit)

    async def update_corporate_club(self, club_id: str, update_club: UpdateCorporateClub) -> CorporateClub:
        corporate_club = await self.corporate_club_repo.get_by_id(club_id)
        if corporate_club is None:
            raise CorporateClubNotFound(club_id)

        if update_club.name:
            corporate_club.name = update_club.name
        if update_club.description:
            corporate_club.description = update_club.description
        if update_club.company_name:
            corporate_club.company_name = update_club.company_name
        if update_club.is_public is not None:
            corporate_club.is_public = update_club.is_public

        corporate_club.updated_at = update_club.updated_at
        return await self.corporate_club_repo.update(corporate_club)

    async def delete_corporate_club(self, club_id: str) -> bool:
        return await self.corporate_club_repo.delete(club_id)