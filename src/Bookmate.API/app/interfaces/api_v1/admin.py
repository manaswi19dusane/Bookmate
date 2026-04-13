from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy import func
from sqlmodel import select
from sqlmodel.ext.asyncio.session import AsyncSession

from app.application.services.auth_dependency import require_admin
from app.infrastructure.Mappers.book_orm import BookORM
from app.infrastructure.Mappers.extended_orm import (
    CommunityGroupORM,
    CorporateClubORM,
    InstitutionORM,
    LibraryORM,
    MarketplaceORM,
)
from app.infrastructure.Mappers.user_orm import (
    UserInteractionORM,
    UserORM,
    UserPreferenceORM,
)
from app.infrastructure.db import async_session
from app.interfaces.schemas import (
    AdminLibrarySummary,
    AdminOverviewResponse,
    AdminUserSummary,
    AdminUserUpdateRequest,
    BookResponse,
    CommunityGroupResponse,
    CorporateClubResponse,
    InstitutionResponse,
    LibraryResponse,
    MarketplaceResponse,
    UserInteractionResponse,
    UserPreferenceResponse,
    UserResponse,
)

router = APIRouter(prefix="/api/admin", tags=["admin"])


async def get_session():
    async with async_session() as session:
        yield session


@router.get("/overview", response_model=AdminOverviewResponse)
async def get_admin_overview(
    _: UserORM = Depends(require_admin),
    session: AsyncSession = Depends(get_session),
):
    async def count(model, condition=None):
        stmt = select(func.count()).select_from(model)
        if condition is not None:
            stmt = stmt.where(condition)
        result = await session.exec(stmt)
        return result.one()

    return AdminOverviewResponse(
        users=await count(UserORM),
        admins=await count(UserORM, UserORM.role == "admin"),
        books=await count(BookORM),
        library_items=await count(LibraryORM),
        preferences=await count(UserPreferenceORM),
        interactions=await count(UserInteractionORM),
        institutions=await count(InstitutionORM),
        corporate_clubs=await count(CorporateClubORM),
        community_groups=await count(CommunityGroupORM),
        marketplace_items=await count(MarketplaceORM),
        active_marketplace_items=await count(MarketplaceORM, MarketplaceORM.is_available == True),
    )


@router.get("/users", response_model=list[AdminUserSummary])
async def list_admin_users(
    _: UserORM = Depends(require_admin),
    session: AsyncSession = Depends(get_session),
    search: str | None = Query(default=None),
):
    stmt = select(UserORM).order_by(UserORM.created_at.desc())
    if search:
        stmt = stmt.where(UserORM.email.contains(search))
    users = (await session.exec(stmt)).all()

    preference_counts = {
        user_id: count
        for user_id, count in (
            await session.exec(
                select(UserPreferenceORM.user_id, func.count())
                .group_by(UserPreferenceORM.user_id)
            )
        ).all()
    }
    interaction_counts = {
        user_id: count
        for user_id, count in (
            await session.exec(
                select(UserInteractionORM.user_id, func.count())
                .group_by(UserInteractionORM.user_id)
            )
        ).all()
    }
    library_counts = {
        user_id: count
        for user_id, count in (
            await session.exec(
                select(LibraryORM.user_id, func.count())
                .group_by(LibraryORM.user_id)
            )
        ).all()
    }

    return [
        AdminUserSummary(
            id=user.id,
            email=user.email,
            role=user.role,
            created_at=user.created_at,
            preference_count=preference_counts.get(user.id, 0),
            interaction_count=interaction_counts.get(user.id, 0),
            library_count=library_counts.get(user.id, 0),
        )
        for user in users
    ]


@router.patch("/users/{user_id}", response_model=UserResponse)
async def update_admin_user(
    user_id: str,
    payload: AdminUserUpdateRequest,
    current_admin = Depends(require_admin),
    session: AsyncSession = Depends(get_session),
):
    user = await session.get(UserORM, user_id)
    if user is None:
        raise HTTPException(status_code=404, detail="User not found")

    updates = payload.model_dump(exclude_unset=True)
    if "role" in updates:
        if updates["role"] not in {"admin", "user"}:
            raise HTTPException(status_code=400, detail="Invalid role")
        if current_admin.id.value == user.id and updates["role"] != "admin":
            raise HTTPException(status_code=400, detail="You cannot remove your own admin access")
        user.role = updates["role"]

    session.add(user)
    await session.commit()
    await session.refresh(user)
    return UserResponse.model_validate(user)


@router.delete("/users/{user_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_admin_user(
    user_id: str,
    current_admin = Depends(require_admin),
    session: AsyncSession = Depends(get_session),
):
    user = await session.get(UserORM, user_id)
    if user is None:
        raise HTTPException(status_code=404, detail="User not found")
    if current_admin.id.value == user.id:
        raise HTTPException(status_code=400, detail="You cannot delete your own account from admin panel")

    for model in (UserPreferenceORM, UserInteractionORM, LibraryORM):
        records = (
            await session.exec(select(model).where(model.user_id == user_id))
        ).all()
        for record in records:
            await session.delete(record)

    clubs = (await session.exec(select(CorporateClubORM).where(CorporateClubORM.admin_user_id == user_id))).all()
    for club in clubs:
        await session.delete(club)

    groups = (await session.exec(select(CommunityGroupORM).where(CommunityGroupORM.creator_user_id == user_id))).all()
    for group in groups:
        await session.delete(group)

    seller_items = (await session.exec(select(MarketplaceORM).where(MarketplaceORM.seller_user_id == user_id))).all()
    for item in seller_items:
        await session.delete(item)

    await session.delete(user)
    await session.commit()


@router.get("/books", response_model=list[BookResponse])
async def list_admin_books(
    _: UserORM = Depends(require_admin),
    session: AsyncSession = Depends(get_session),
):
    return (await session.exec(select(BookORM).order_by(BookORM.title.asc()))).all()


@router.get("/libraries", response_model=list[AdminLibrarySummary])
async def list_admin_libraries(
    _: UserORM = Depends(require_admin),
    session: AsyncSession = Depends(get_session),
):
    library_items = (await session.exec(select(LibraryORM).order_by(LibraryORM.added_at.desc()))).all()
    users = {user.id: user.email for user in (await session.exec(select(UserORM))).all()}
    books = {book.id: book.title for book in (await session.exec(select(BookORM))).all()}
    return [
        AdminLibrarySummary(
            id=item.id,
            user_id=item.user_id,
            user_email=users.get(item.user_id),
            book_id=item.book_id,
            book_title=books.get(item.book_id),
            status=item.status,
            added_at=item.added_at,
            progress=item.progress,
            notes=item.notes,
        )
        for item in library_items
    ]


@router.delete("/libraries/{library_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_admin_library(
    library_id: str,
    _: UserORM = Depends(require_admin),
    session: AsyncSession = Depends(get_session),
):
    item = await session.get(LibraryORM, library_id)
    if item is None:
        raise HTTPException(status_code=404, detail="Library entry not found")
    await session.delete(item)
    await session.commit()


@router.get("/preferences", response_model=list[UserPreferenceResponse])
async def list_admin_preferences(
    _: UserORM = Depends(require_admin),
    session: AsyncSession = Depends(get_session),
):
    return (await session.exec(select(UserPreferenceORM).order_by(UserPreferenceORM.created_at.desc()))).all()


@router.get("/interactions", response_model=list[UserInteractionResponse])
async def list_admin_interactions(
    _: UserORM = Depends(require_admin),
    session: AsyncSession = Depends(get_session),
):
    return (await session.exec(select(UserInteractionORM).order_by(UserInteractionORM.created_at.desc()))).all()


@router.get("/institutions", response_model=list[InstitutionResponse])
async def list_admin_institutions(
    _: UserORM = Depends(require_admin),
    session: AsyncSession = Depends(get_session),
):
    return (await session.exec(select(InstitutionORM).order_by(InstitutionORM.created_at.desc()))).all()


@router.get("/corporate-clubs", response_model=list[CorporateClubResponse])
async def list_admin_corporate_clubs(
    _: UserORM = Depends(require_admin),
    session: AsyncSession = Depends(get_session),
):
    return (await session.exec(select(CorporateClubORM).order_by(CorporateClubORM.created_at.desc()))).all()


@router.get("/community-groups", response_model=list[CommunityGroupResponse])
async def list_admin_community_groups(
    _: UserORM = Depends(require_admin),
    session: AsyncSession = Depends(get_session),
):
    return (await session.exec(select(CommunityGroupORM).order_by(CommunityGroupORM.created_at.desc()))).all()


@router.get("/marketplaces", response_model=list[MarketplaceResponse])
async def list_admin_marketplaces(
    _: UserORM = Depends(require_admin),
    session: AsyncSession = Depends(get_session),
):
    return (await session.exec(select(MarketplaceORM).order_by(MarketplaceORM.listed_at.desc()))).all()
