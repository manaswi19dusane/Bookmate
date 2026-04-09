from typing import List
from datetime import datetime

from fastapi import APIRouter, Depends, HTTPException, status
from sqlmodel.ext.asyncio.session import AsyncSession

from app.interfaces.schemas import (
    RegisterRequest,
    LoginRequest,
    AuthResponse,
    UserPreferenceRequest,
    UserPreferenceResponse,
    UserInteractionRequest,
    UserInteractionResponse,
)
from app.infrastructure.db import async_session
from app.infrastructure.repositories.user_repo import UserRepository
from app.application.services.auth_service import AuthService
from app.application.services.auth_dependency import get_current_user
from app.domain.exceptions import UserAlreadyExists, UserNotFound
from app.domain.models_user import User, UserPreference, UserPreferenceId, UserInteraction


router = APIRouter(prefix="/api", tags=["users"])


async def get_session():
    async with async_session() as session:
        yield session


@router.post("/users/register", response_model=AuthResponse, status_code=status.HTTP_201_CREATED)
async def register_user(
    payload: RegisterRequest, session: AsyncSession = Depends(get_session)
):
    repo = UserRepository(session)
    service = AuthService(repo)

    try:
        return await service.register_user(payload)
    except UserAlreadyExists as exc:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(exc))


@router.post("/users/login", response_model=AuthResponse)
async def login_user(payload: LoginRequest, session: AsyncSession = Depends(get_session)):
    repo = UserRepository(session)
    service = AuthService(repo)

    try:
        return await service.authenticate_user(payload)
    except UserNotFound:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password",
        )


@router.get("/users/preferences", response_model=List[UserPreferenceResponse])
async def list_preferences(
    current_user: User = Depends(get_current_user),
    session: AsyncSession = Depends(get_session),
):
    repo = UserRepository(session)
    preferences = await repo.list_preferences(current_user.id.value)
    return [
        {
            "id": preference.id.value,
            "genre": preference.genre,
            "author": preference.author,
            "created_at": preference.created_at,
        }
        for preference in preferences
    ]


@router.post("/users/preferences", response_model=UserPreferenceResponse, status_code=status.HTTP_201_CREATED)
async def create_preference(
    payload: UserPreferenceRequest,
    current_user: User = Depends(get_current_user),
    session: AsyncSession = Depends(get_session),
):
    try:
        repo = UserRepository(session)
        preference = UserPreference(
            id=UserPreferenceId.new(),
            user_id=current_user.id.value,
            genre=payload.genre,
            author=payload.author,
            book_id=payload.book_id,
            created_at=datetime.utcnow(),
        )
        await repo.add_preference(preference)
        return {
            "id": preference.id.value,
            "genre": preference.genre,
            "author": preference.author,
            "book_id": preference.book_id,
            "created_at": preference.created_at,
        }
    except Exception as e:
        print(f"Error creating preference: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to create preference"
        )


@router.get("/interactions", response_model=List[UserInteractionResponse])
async def list_interactions(
    current_user: User = Depends(get_current_user),
    session: AsyncSession = Depends(get_session),
):
    repo = UserRepository(session)
    interactions = await repo.list_interactions(current_user.id.value)
    return [
        {
            "id": interaction.id.value,
            "book_id": interaction.book_id,
            "interaction_type": interaction.interaction_type,
            "rating": interaction.rating,
            "created_at": interaction.created_at,
        }
        for interaction in interactions
    ]


@router.get("/books/available", response_model=List[dict])
async def list_available_books(
    current_user: User = Depends(get_current_user),
    session: AsyncSession = Depends(get_session),
):
    repo = UserRepository(session)
    # Get books that the user hasn't interacted with yet
    stmt = select(BookORM).where(~BookORM.id.in_(
        select(UserInteractionORM.book_id).where(UserInteractionORM.user_id == current_user.id.value)
    ))
    result = await session.execute(stmt)
    books = result.scalars().all()
    return [
        {
            "id": book.id,
            "title": book.title,
            "author": book.author,
            "language": book.language,
            "published_date": book.published_date,
            "image_url": book.image_url,
            "purchased_date": book.purchased_date,
        }
        for book in books
    ]


@router.post("/interactions", response_model=UserInteractionResponse, status_code=status.HTTP_201_CREATED)
async def create_interaction(
    payload: UserInteractionRequest,
    current_user: User = Depends(get_current_user),
    session: AsyncSession = Depends(get_session),
):
    repo = UserRepository(session)
    interaction = UserInteraction(
        id=UserInteraction.new(),
        user_id=current_user.id.value,
        book_id=payload.book_id,
        interaction_type=payload.interaction_type,
        rating=payload.rating,
        created_at=datetime.utcnow(),
    )
    await repo.add_interaction(interaction)
    return {
        "id": interaction.id.value,
        "book_id": interaction.book_id,
        "interaction_type": interaction.interaction_type,
        "rating": interaction.rating,
        "created_at": interaction.created_at,
    }