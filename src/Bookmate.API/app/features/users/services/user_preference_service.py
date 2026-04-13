from typing import List, Optional

from app.domain.models_user import UserPreference, UserPreferenceId
from app.domain.exceptions import UserPreferenceNotFound
from app.infrastructure.repositories.user_repo import UserRepository
from app.application.usecases import (
    CreateUserPreference,
    ListUserPreferences,
    GetUserPreference,
    UpdateUserPreference,
    DeleteUserPreference
)

class UserPreferenceService:
    def __init__(self, user_repo: UserRepository):
        self.user_repo = user_repo

    async def create_user_preference(self, create_preference: CreateUserPreference) -> UserPreference:
        user_preference = UserPreference(
            id=UserPreferenceId.new(),
            user_id=create_preference.user_id,
            book_id=create_preference.book_id,
            preference_type=create_preference.preference_type,
            value=create_preference.value,
            created_at=create_preference.created_at,
            updated_at=create_preference.updated_at
        )
        return await self.user_repo.add_user_preference(user_preference)

    async def get_user_preference(self, user_preference_id: str) -> UserPreference:
        return await self.user_repo.get_user_preference_by_id(user_preference_id)

    async def list_user_preferences(self, user_id: str, page: int = 1, limit: int = 10) -> List[UserPreference]:
        return await self.user_repo.list_user_preferences_by_user(user_id, page=page, limit=limit)

    async def update_user_preference(self, user_preference_id: str, update_preference: UpdateUserPreference) -> UserPreference:
        user_preference = await self.user_repo.get_user_preference_by_id(user_preference_id)
        if user_preference is None:
            raise UserPreferenceNotFound(user_preference_id)

        if update_preference.preference_type:
            user_preference.preference_type = update_preference.preference_type
        if update_preference.value:
            user_preference.value = update_preference.value

        user_preference.updated_at = update_preference.updated_at
        return await self.user_repo.update_user_preference(user_preference)

    async def delete_user_preference(self, user_preference_id: str) -> bool:
        return await self.user_repo.delete_user_preference(user_preference_id)