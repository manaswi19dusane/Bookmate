from datetime import datetime
from typing import List
from uuid import uuid4

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlmodel import select
from sqlmodel.ext.asyncio.session import AsyncSession

from app.infrastructure.Mappers.extended_orm import CommunityGroupORM
from app.infrastructure.Mappers.user_orm import UserORM
from app.infrastructure.db import async_session
from app.interfaces.schemas import (
    CommunityGroupCreate,
    CommunityGroupResponse,
    CommunityGroupUpdate,
)

router = APIRouter(tags=["community-groups"])


async def get_session():
    async with async_session() as session:
        yield session


@router.post("/community-groups", response_model=CommunityGroupResponse, status_code=status.HTTP_201_CREATED)
async def create_community_group(
    payload: CommunityGroupCreate,
    session: AsyncSession = Depends(get_session),
):
    creator = await session.get(UserORM, payload.creator_user_id)
    if creator is None:
        raise HTTPException(status_code=400, detail="creator_user_id does not exist")

    group = CommunityGroupORM(
        id=str(uuid4()),
        name=payload.name,
        creator_user_id=payload.creator_user_id,
        topic=payload.topic,
        description=payload.description,
        created_at=datetime.utcnow(),
        is_public=payload.is_public,
    )
    session.add(group)
    await session.commit()
    await session.refresh(group)
    return group


@router.get("/community-groups", response_model=List[CommunityGroupResponse])
async def list_community_groups(
    page: int = Query(1, ge=1),
    limit: int = Query(10, ge=1, le=100),
    session: AsyncSession = Depends(get_session),
):
    stmt = (
        select(CommunityGroupORM)
        .offset((page - 1) * limit)
        .limit(limit)
        .order_by(CommunityGroupORM.created_at.desc())
    )
    result = await session.exec(stmt)
    return result.all()


@router.get("/community-groups/{group_id}", response_model=CommunityGroupResponse)
async def get_community_group(
    group_id: str,
    session: AsyncSession = Depends(get_session),
):
    group = await session.get(CommunityGroupORM, group_id)
    if group is None:
        raise HTTPException(status_code=404, detail="Community group not found")
    return group


@router.put("/community-groups/{group_id}", response_model=CommunityGroupResponse)
async def update_community_group(
    group_id: str,
    payload: CommunityGroupUpdate,
    session: AsyncSession = Depends(get_session),
):
    group = await session.get(CommunityGroupORM, group_id)
    if group is None:
        raise HTTPException(status_code=404, detail="Community group not found")

    updates = payload.model_dump(exclude_unset=True)
    for field, value in updates.items():
        setattr(group, field, value)

    session.add(group)
    await session.commit()
    await session.refresh(group)
    return group


@router.delete("/community-groups/{group_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_community_group(
    group_id: str,
    session: AsyncSession = Depends(get_session),
):
    group = await session.get(CommunityGroupORM, group_id)
    if group is None:
        raise HTTPException(status_code=404, detail="Community group not found")
    await session.delete(group)
    await session.commit()
