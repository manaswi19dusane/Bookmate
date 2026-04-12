from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from typing import List

from app.config import get_settings
from app.infrastructure.db import async_session
from app.infrastructure.repositories.interfaces import CommunityGroupRepository
from app.application.services.community_group_service import CommunityGroupService
from app.application.usecases import (
    CreateCommunityGroup,
    ListCommunityGroups,
    GetCommunityGroup,
    UpdateCommunityGroup,
    DeleteCommunityGroup
)
from app.interfaces.schemas import (
    CommunityGroupCreate,
    CommunityGroupResponse,
    CommunityGroupUpdate
)

router = APIRouter()

async def get_community_group_service(session: AsyncSession = Depends(async_session)) -> CommunityGroupService:
    return CommunityGroupService(CommunityGroupRepository(session))

@router.post("/community-groups", response_model=CommunityGroupResponse, status_code=status.HTTP_201_CREATED)
async def create_community_group(community_group_create: CommunityGroupCreate, community_group_service: CommunityGroupService = Depends(get_community_group_service)):
    create_group = CreateCommunityGroup(
        name=community_group_create.name,
        description=community_group_create.description,
        category=community_group_create.category,
        is_public=community_group_create.is_public,
        created_by=community_group_create.created_by,
        created_at=community_group_create.created_at,
        updated_at=community_group_create.updated_at
    )
    community_group = await community_group_service.create_community_group(create_group)
    return CommunityGroupResponse(
        id=community_group.id.value,
        name=community_group.name,
        description=community_group.description,
        category=community_group.category,
        is_public=community_group.is_public,
        created_by=community_group.created_by,
        created_at=community_group.created_at,
        updated_at=community_group.updated_at
    )

@router.get("/community-groups/{group_id}", response_model=CommunityGroupResponse)
async def get_community_group(group_id: str, community_group_service: CommunityGroupService = Depends(get_community_group_service)):
    community_group = await community_group_service.get_community_group(group_id)
    if community_group is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Community group not found")
    return CommunityGroupResponse(
        id=community_group.id.value,
        name=community_group.name,
        description=community_group.description,
        category=community_group.category,
        is_public=community_group.is_public,
        created_by=community_group.created_by,
        created_at=community_group.created_at,
        updated_at=community_group.updated_at
    )

@router.get("/community-groups", response_model=List[CommunityGroupResponse])
async def list_community_groups(page: int = 1, limit: int = 10, community_group_service: CommunityGroupService = Depends(get_community_group_service)):
    community_groups = await community_group_service.list_community_groups(page=page, limit=limit)
    return [
        CommunityGroupResponse(
            id=group.id.value,
            name=group.name,
            description=group.description,
            category=group.category,
            is_public=group.is_public,
            created_by=group.created_by,
            created_at=group.created_at,
            updated_at=group.updated_at
        )
        for group in community_groups
    ]

@router.put("/community-groups/{group_id}", response_model=CommunityGroupResponse)
async def update_community_group(group_id: str, community_group_update: CommunityGroupUpdate, community_group_service: CommunityGroupService = Depends(get_community_group_service)):
    update_group = UpdateCommunityGroup(
        name=community_group_update.name,
        description=community_group_update.description,
        category=community_group_update.category,
        is_public=community_group_update.is_public,
        updated_at=community_group_update.updated_at
    )
    community_group = await community_group_service.update_community_group(group_id, update_group)
    return CommunityGroupResponse(
        id=community_group.id.value,
        name=community_group.name,
        description=community_group.description,
        category=community_group.category,
        is_public=community_group.is_public,
        created_by=community_group.created_by,
        created_at=community_group.created_at,
        updated_at=community_group.updated_at
    )

@router.delete("/community-groups/{group_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_community_group(group_id: str, community_group_service: CommunityGroupService = Depends(get_community_group_service)):
    result