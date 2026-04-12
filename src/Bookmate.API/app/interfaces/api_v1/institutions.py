from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from typing import List

from app.config import settings
from app.infrastructure.db import async_session
from app.infrastructure.repositories.interfaces import InstitutionRepository
from app.application.services.institution_service import InstitutionService
from app.interfaces.schemas import (
    InstitutionCreate,
    InstitutionResponse,
    InstitutionUpdate
)

router = APIRouter()

async def get_institution_service(session: AsyncSession = Depends(async_session)) -> InstitutionService:
    return InstitutionService(InstitutionRepository(session))

@router.post("/institutions", response_model=InstitutionResponse, status_code=status.HTTP_201_CREATED)
async def create_institution(institution_create: InstitutionCreate, institution_service: InstitutionService = Depends(get_institution_service)):
    institution = await institution_service.create_institution(institution_create.dict())
    return InstitutionResponse(
        id=institution.id.value,
        name=institution.name,
        description=institution.description,
        type=institution.type,
        is_public=institution.is_public,
        created_by=institution.created_by,
        created_at=institution.created_at,
        updated_at=institution.updated_at
    )

@router.get("/institutions/{institution_id}", response_model=InstitutionResponse)
async def get_institution(institution_id: str, institution_service: InstitutionService = Depends(get_institution_service)):
    institution = await institution_service.get_institution(institution_id)
    if institution is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Institution not found")
    return InstitutionResponse(
        id=institution.id.value,
        name=institution.name,
        description=institution.description,
        type=institution.type,
        is_public=institution.is_public,
        created_by=institution.created_by,
        created_at=institution.created_at,
        updated_at=institution.updated_at
    )

@router.get("/institutions", response_model=List[InstitutionResponse])
async def list_institutions(page: int = 1, limit: int = 10, institution_service: InstitutionService = Depends(get_institution_service)):
    institutions = await institution_service.list_institutions(page=page, limit=limit)
    return [
        InstitutionResponse(
            id=institution.id.value,
            name=institution.name,
            description=institution.description,
            type=institution.type,
            is_public=institution.is_public,
            created_by=institution.created_by,
            created_at=institution.created_at,
            updated_at=institution.updated_at
        )
        for institution in institutions
    ]

@router.put("/institutions/{institution_id}", response_model=InstitutionResponse)
async def update_institution(institution_id: str, institution_update: InstitutionUpdate, institution_service: InstitutionService = Depends(get_institution_service)):
    institution = await institution_service.update_institution(institution_id, institution_update.dict(exclude_unset=True))
    return InstitutionResponse(
        id=institution.id.value,
        name=institution.name,
        description=institution.description,
        type=institution.type,
        is_public=institution.is_public,
        created_by=institution.created_by,
        created_at=institution.created_at,
        updated_at=institution.updated_at
    )

@router.delete("/institutions/{institution_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_institution(institution_id: str, institution_service: InstitutionService = Depends(get_institution_service)):
    result = await institution_service.delete_institution(institution_id)
    if not result:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Institution not found")