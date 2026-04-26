from datetime import datetime
from typing import List
from uuid import uuid4

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlmodel import select
from sqlmodel.ext.asyncio.session import AsyncSession

from app.infrastructure.Mappers.extended_orm import InstitutionORM
from app.infrastructure.db import get_db
from app.interfaces.schemas import InstitutionCreate, InstitutionResponse, InstitutionUpdate

router = APIRouter(tags=["institutions"])

@router.post("/institutions", response_model=InstitutionResponse, status_code=status.HTTP_201_CREATED)
async def create_institution(
    payload: InstitutionCreate,
    session: AsyncSession = Depends(get_db),
):
    institution = InstitutionORM(
        id=str(uuid4()),
        name=payload.name,
        type=payload.type,
        address=payload.address,
        website=payload.website,
        contact_email=payload.contact_email,
        created_at=datetime.utcnow(),
        is_verified=payload.is_verified,
    )
    session.add(institution)
    await session.commit()
    await session.refresh(institution)
    return institution


@router.get("/institutions", response_model=List[InstitutionResponse])
async def list_institutions(
    page: int = Query(1, ge=1),
    limit: int = Query(10, ge=1, le=100),
    session: AsyncSession = Depends(get_db),
):
    stmt = (
        select(InstitutionORM)
        .offset((page - 1) * limit)
        .limit(limit)
        .order_by(InstitutionORM.created_at.desc())
    )
    result = await session.exec(stmt)
    return result.all()


@router.get("/institutions/{institution_id}", response_model=InstitutionResponse)
async def get_institution(
    institution_id: str,
    session: AsyncSession = Depends(get_db),
):
    institution = await session.get(InstitutionORM, institution_id)
    if institution is None:
        raise HTTPException(status_code=404, detail="Institution not found")
    return institution


@router.put("/institutions/{institution_id}", response_model=InstitutionResponse)
async def update_institution(
    institution_id: str,
    payload: InstitutionUpdate,
    session: AsyncSession = Depends(get_db),
):
    institution = await session.get(InstitutionORM, institution_id)
    if institution is None:
        raise HTTPException(status_code=404, detail="Institution not found")

    updates = payload.model_dump(exclude_unset=True)
    for field, value in updates.items():
        setattr(institution, field, value)

    session.add(institution)
    await session.commit()
    await session.refresh(institution)
    return institution


@router.delete("/institutions/{institution_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_institution(
    institution_id: str,
    session: AsyncSession = Depends(get_db),
):
    institution = await session.get(InstitutionORM, institution_id)
    if institution is None:
        raise HTTPException(status_code=404, detail="Institution not found")
    await session.delete(institution)
    await session.commit()
