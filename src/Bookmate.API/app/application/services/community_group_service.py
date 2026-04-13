from typing import List, Optional

from app.domain.extended_models import CommunityGroup, CommunityGroupId
from app.domain.exceptions import CommunityGroupNotFound
from app.infrastructure.repositories.interfaces import CommunityGroupRepository
from app.application.usecases import (
    CreateCommunityGroup,
    ListCommunityGroups,
    GetCommunityGroup,
    UpdateCommunityGroup,
    DeleteCommunityGroup
)

class CommunityGroupService:
    def __init__(self, community_group_repo: CommunityGroupRepository):
        self.community_group_repo = community_group_repo

    async def create_community_group(self, create_group: CreateCommunityGroup) -> CommunityGroup:
        community_group = CommunityGroup(
            id=CommunityGroupId.new(),
            name=create_group.name,
            description=create_group.description,
            category=create_group.category,
            is_public=create_group.is_public,
            created_by=create_group.created_by,
            created_at=create_group.created_at,
            updated_at=create_group.updated_at
        )
        return await self.community_group_repo.add(community_group)

    async def get_community_group(self, group_id: str) -> CommunityGroup:
        return await self.community_group_repo.get_by_id(group_id)

    async def list_community_groups(self, page: int = 1, limit: int = 10) -> List[CommunityGroup]:
        return await self.community_group_repo.list(page=page, limit=limit)

    async def update_community_group(self, group_id: str, update_group: UpdateCommunityGroup) -> CommunityGroup:
        community_group = await self.community_group_repo.get_by_id(group_id)
        if community_group is None:
            raise CommunityGroupNotFound(group_id)

        if update_group.name:
            community_group.name = update_group.name
        if update_group.description:
            community_group.description = update_group.description
        if update_group.category:
            community_group.category = update_group.category
        if update_group.is_public is not None:
            community_group.is_public = update_group.is_public

        community_group.updated_at = update_group.updated_at
        return await self.community_group_repo.update(community_group)

    async def delete_community_group(self, group_id: str) -> bool:
        return await self.community_group_repo.delete(group_id)