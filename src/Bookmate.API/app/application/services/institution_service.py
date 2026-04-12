from typing import List, Optional
from datetime import datetime

from app.domain.extended_models import Institution, EntityId
from app.domain.exceptions import InstitutionNotFound
from app.infrastructure.repositories.interfaces import InstitutionRepository


class InstitutionService:
    def __init__(self, institution_repo: InstitutionRepository):
        self.institution_repo = institution_repo

    async def create_institution(self, data: dict) -> Institution:
        institution = Institution(
            id=EntityId.new(),
            name=data.get('name'),
            description=data.get('description'),
            type=data.get('type'),
            is_public=data.get('is_public', True),
            created_by=data.get('created_by'),
            created_at=data.get('created_at', datetime.utcnow()),
            updated_at=data.get('updated_at')
        )
        return await self.institution_repo.add(institution)

    async def get_institution(self, institution_id: str) -> Institution:
        return await self.institution_repo.get_by_id(institution_id)

    async def list_institutions(self, page: int = 1, limit: int = 10) -> List[Institution]:
        return await self.institution_repo.list(page=page, limit=limit)

    async def update_institution(self, institution_id: str, data: dict) -> Institution:
        institution = await self.institution_repo.get_by_id(institution_id)
        if institution is None:
            raise InstitutionNotFound(institution_id)

        if 'name' in data:
            institution.name = data['name']
        if 'description' in data:
            institution.description = data['description']
        if 'type' in data:
            institution.type = data['type']
        if 'is_public' in data:
            institution.is_public = data['is_public']

        institution.updated_at = datetime.utcnow()
        return await self.institution_repo.update(institution)

    async def delete_institution(self, institution_id: str) -> bool:
        return await self.institution_repo.delete(institution_id)
