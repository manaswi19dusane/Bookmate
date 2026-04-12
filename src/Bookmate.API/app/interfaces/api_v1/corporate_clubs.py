from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from typing import List

from app.config import get_settings
from app.infrastructure.db import async_session
from app.infrastructure.repositories.interfaces import CorporateClubRepository
from app.application.services.corporate_club_service import CorporateClubService
from app.application.usecases import (
    CreateCorporateClub,
    ListCorporateClubs,
    GetCorporateClub,
    UpdateCorporateClub,
    DeleteCorporateClub
)
from app.interfaces.schemas import (
    CorporateClubCreate,
    CorporateClubResponse,
    CorporateClubUpdate
)

router = APIRouter()

async def get_corporate_club_service(session: AsyncSession = Depends(async_session)) -> CorporateClubService:
    return CorporateClubService(CorporateClubRepository(session))

@router.post("/corporate-clubs", response_model=CorporateClubResponse, status_code=status.HTTP_201_CREATED)
async def create_corporate_club(corporate_club_create: CorporateClubCreate, corporate_club_service: CorporateClubService = Depends(get_corporate_club_service)):
    create_club = CreateCorporateClub(
        name=corporate_club_create.name,
        description=corporate_club_create.description,
        company_name=corporate_club_create.company_name,
        is_public=corporate_club_create.is_public,
        created_by=corporate_club_create.created_by,
        created_at=corporate_club_create.created_at,
        updated_at=corporate_club_create.updated_at
    )
    corporate_club = await corporate_club_service.create_corporate_club(create_club)
    return CorporateClubResponse(
        id=corporate_club.id.value,
        name=corporate_club.name,
        description=corporate_club.description,
        company_name=corporate_club.company_name,
        is_public=corporate_club.is_public,
        created_by=corporate_club.created_by,
        created_at=corporate_club.created_at,
        updated_at=corporate_club.updated_at
    )

@router.get("/corporate-clubs/{club_id}", response_model=CorporateClubResponse)
async def get_corporate_club(club_id: str, corporate_club_service: CorporateClubService = Depends(get_corporate_club_service)):
    corporate_club = await corporate_club_service.get_corporate_club(club_id)