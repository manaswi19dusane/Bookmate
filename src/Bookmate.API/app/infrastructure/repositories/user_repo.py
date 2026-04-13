from typing import List, Optional
from datetime import datetime
from sqlmodel import select
from sqlmodel.ext.asyncio.session import AsyncSession
from app.domain.models_user import User, UserPreference, UserInteraction
from app.domain.exceptions import UserNotFound
from app.infrastructure.Mappers.user_mapper import UserMapper
from app.infrastructure.Mappers.user_orm import UserORM, UserPreferenceORM, UserInteractionORM


class UserRepository:
    def __init__(self, session: AsyncSession):
        self.session = session

    async def add(self, user: User) -> None:
        orm = UserMapper.to_orm(user)
        self.session.add(orm)
        await self.session.commit()
        await self.session.refresh(orm)

    async def get_by_email(self, email: str) -> Optional[User]:
        stmt = select(UserORM).where(UserORM.email == email)
        result = await self.session.execute(stmt)
        orm = result.scalars().first()
        return UserMapper.to_domain_from_orm(orm) if orm else None

    async def get_by_id(self, id: str) -> User:
        stmt = select(UserORM).where(UserORM.id == id)
        result = await self.session.execute(stmt)
        orm = result.scalars().first()
        if orm is None:
            raise UserNotFound(id)
        return UserMapper.to_domain_from_orm(orm)

    async def list_preferences(self, user_id: str) -> List[UserPreference]:
        stmt = select(UserPreferenceORM).where(UserPreferenceORM.user_id == user_id)
        result = await self.session.execute(stmt)
        orm_list = result.scalars().all()
        return [UserMapper.to_preference_domain_from_orm(orm) for orm in orm_list]

    async def add_preference(self, preference: UserPreference) -> None:
        orm = UserMapper.to_preference_orm(preference)
        self.session.add(orm)
        await self.session.commit()
        await self.session.refresh(orm)

    async def list_interactions(self, user_id: str) -> List[UserInteraction]:
        stmt = select(UserInteractionORM).where(UserInteractionORM.user_id == user_id)
        result = await self.session.execute(stmt)
        orm_list = result.scalars().all()
        return [UserMapper.to_interaction_domain_from_orm(orm) for orm in orm_list]

    async def add_interaction(self, interaction: UserInteraction) -> None:
        orm = UserMapper.to_interaction_orm(interaction)
        self.session.add(orm)
        await self.session.commit()
        await self.session.refresh(orm)
