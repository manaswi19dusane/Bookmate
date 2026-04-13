from app.domain.models_user import (
    User,
    UserId,
    UserPreference,
    UserPreferenceId,
    UserInteraction,
    UserInteractionId,
)
from app.infrastructure.Mappers.user_orm import UserORM, UserPreferenceORM, UserInteractionORM


class UserMapper:
    @staticmethod
    def to_orm(user: User) -> UserORM:
        return UserORM(
            id=user.id.value,
            email=user.email,
            password=user.password,
            created_at=user.created_at,
            role=user.role,
        )

    @staticmethod
    def to_domain_from_orm(orm: UserORM) -> User:
        return User(
            id=UserId(orm.id),
            email=orm.email,
            password=orm.password,
            created_at=orm.created_at,
            role=getattr(orm, "role", "user"),
        )

    @staticmethod
    def to_preference_orm(preference: UserPreference) -> UserPreferenceORM:
        return UserPreferenceORM(
            id=preference.id.value,
            user_id=preference.user_id,
            genre=preference.genre,
            author=preference.author,
            created_at=preference.created_at,
            book_id=preference.book_id,
        )

    @staticmethod
    def to_preference_domain_from_orm(orm: UserPreferenceORM) -> UserPreference:
        return UserPreference(
            id=UserPreferenceId(orm.id),
            user_id=orm.user_id,
            genre=orm.genre,
            author=orm.author,
            created_at=orm.created_at,
            book_id=orm.book_id,
        )

    @staticmethod
    def to_interaction_orm(interaction: UserInteraction) -> UserInteractionORM:
        return UserInteractionORM(
            id=interaction.id.value,
            user_id=interaction.user_id,
            book_id=interaction.book_id,
            interaction_type=interaction.interaction_type,
            rating=interaction.rating,
            created_at=interaction.created_at,
        )

    @staticmethod
    def to_interaction_domain_from_orm(orm: UserInteractionORM) -> UserInteraction:
        return UserInteraction(
            id=UserInteractionId(orm.id),
            user_id=orm.user_id,
            book_id=orm.book_id,
            interaction_type=orm.interaction_type,
            rating=orm.rating,
            created_at=orm.created_at,
        )
