from datetime import datetime
from typing import List
from uuid import uuid4

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlmodel import select
from sqlmodel.ext.asyncio.session import AsyncSession

from app.infrastructure.Mappers.extended_orm import CorporateClubORM
from app.infrastructure.Mappers.user_orm import UserORM
from app.infrastructure.db import async_session
from app.interfaces.schemas import (
    CorporateClubCreate,
    CorporateClubResponse,
    CorporateClubUpdate,
)

router = APIRouter(tags=["corporate-clubs"])


async def get_session():
    async with async_session() as session:
        yield session


@router.post("/corporate-clubs", response_model=CorporateClubResponse, status_code=status.HTTP_201_CREATED)
async def create_corporate_club(
    payload: CorporateClubCreate,
    session: AsyncSession = Depends(get_session),
):
    admin = await session.get(UserORM, payload.admin_user_id)
    if admin is None:
        raise HTTPException(status_code=400, detail="admin_user_id does not exist")

    club = CorporateClubORM(
        id=str(uuid4()),
        name=payload.name,
        organization_name=payload.organization_name,
        admin_user_id=payload.admin_user_id,
        description=payload.description,
        max_members=payload.max_members,
        created_at=datetime.utcnow(),
        is_active=payload.is_active,
    )
    session.add(club)
    await session.commit()
    await session.refresh(club)
    return club


@router.get("/corporate-clubs", response_model=List[CorporateClubResponse])
async def list_corporate_clubs(
    page: int = Query(1, ge=1),
    limit: int = Query(10, ge=1, le=100),
    session: AsyncSession = Depends(get_session),
):
    stmt = (
        select(CorporateClubORM)
        .offset((page - 1) * limit)
        .limit(limit)
        .order_by(CorporateClubORM.created_at.desc())
    )
    result = await session.exec(stmt)
    return result.all()


@router.get("/corporate-clubs/{club_id}", response_model=CorporateClubResponse)
async def get_corporate_club(
    club_id: str,
    session: AsyncSession = Depends(get_session),
):
    club = await session.get(CorporateClubORM, club_id)
    if club is None:
        raise HTTPException(status_code=404, detail="Corporate club not found")
    return club


@router.put("/corporate-clubs/{club_id}", response_model=CorporateClubResponse)
async def update_corporate_club(
    club_id: str,
    payload: CorporateClubUpdate,
    session: AsyncSession = Depends(get_session),
):
    club = await session.get(CorporateClubORM, club_id)
    if club is None:
        raise HTTPException(status_code=404, detail="Corporate club not found")

    updates = payload.model_dump(exclude_unset=True)
    for field, value in updates.items():
        setattr(club, field, value)

    session.add(club)
    await session.commit()
    await session.refresh(club)
    return club


@router.delete("/corporate-clubs/{club_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_corporate_club(
    club_id: str,
    session: AsyncSession = Depends(get_session),
):
    club = await session.get(CorporateClubORM, club_id)
    if club is None:
        raise HTTPException(status_code=404, detail="Corporate club not found")
    await session.delete(club)
    await session.commit()
