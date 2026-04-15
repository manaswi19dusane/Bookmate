from typing import List

from fastapi import APIRouter, Depends, HTTPException, status
from sqlmodel import select
from sqlmodel.ext.asyncio.session import AsyncSession

from app.application.services.auth_dependency import get_current_user
from app.application.usecases.Update_book import UpdateBookUseCase
from app.application.usecases.create_book import CreateBookUseCase
from app.application.usecases.list_books import ListBooksUseCase
from app.domain.exceptions import BookNotFound
from app.domain.models_user import User
from app.infrastructure.Mappers.book_orm import BookORM
from app.infrastructure.Mappers.user_orm import UserInteractionORM
from app.infrastructure.db import async_session
from app.infrastructure.repositories.book_repo import BookRepository
from app.interfaces.schemas import BookResponse, CreateBookRequest, UpdateBookRequest

router = APIRouter(tags=["books"])


async def get_session():
    async with async_session() as session:
        yield session


def serialize_book(book):
    book_id = book.id.value if hasattr(book.id, "value") else book.id
    return {
        "id": book_id,
        "title": book.title,
        "author": book.author,
        "language": book.language,
        "published_date": book.published_date,
        "image_url": book.image_url,
        "description": getattr(book, "description", None),
        "isbn": getattr(book, "isbn", None),
        "source": getattr(book, "source", None),
        "purchased_date": book.purchased_date,
        "owner_id": book.owner_id,
    }


@router.post("/books", response_model=BookResponse, status_code=status.HTTP_201_CREATED)
async def create_book(
    payload: CreateBookRequest,
    current_user: User = Depends(get_current_user),
    session: AsyncSession = Depends(get_session),
):
    repo = BookRepository(session)
    usecase = CreateBookUseCase(repo)
    dto = await usecase.execute(payload, current_user.id.value)
    return dto


@router.get("/books", response_model=List[BookResponse])
async def list_books(session: AsyncSession = Depends(get_session)):
    repo = BookRepository(session)
    usecase = ListBooksUseCase(repo)
    return await usecase.execute()


@router.get("/books/available", response_model=List[BookResponse])
async def list_available_books(
    current_user: User = Depends(get_current_user),
    session: AsyncSession = Depends(get_session),
):
    stmt = select(BookORM).where(
        BookORM.owner_id == current_user.id.value,
        ~BookORM.id.in_(
            select(UserInteractionORM.book_id).where(
                UserInteractionORM.user_id == current_user.id.value
            )
        ),
    )
    result = await session.execute(stmt)
    return [serialize_book(book) for book in result.scalars().all()]


@router.get("/books/mine", response_model=List[BookResponse])
async def list_my_books(
    current_user: User = Depends(get_current_user),
    session: AsyncSession = Depends(get_session),
):
    repo = BookRepository(session)
    books = await repo.list_by_owner(current_user.id.value)
    return [serialize_book(book) for book in books]


@router.get("/books/{book_id}", response_model=BookResponse)
async def get_book(book_id: str, session: AsyncSession = Depends(get_session)):
    repo = BookRepository(session)
    try:
        domain_book = await repo.get_by_id(book_id)
    except BookNotFound:
        raise HTTPException(status_code=404, detail="Book not found")
    return serialize_book(domain_book)


@router.put("/books/{book_id}", response_model=BookResponse)
async def update_book(
    book_id: str,
    payload: UpdateBookRequest,
    current_user: User = Depends(get_current_user),
    session: AsyncSession = Depends(get_session),
):
    repo = BookRepository(session)
    try:
        existing = await repo.get_by_id(book_id)
    except BookNotFound:
        raise HTTPException(status_code=404, detail="Book not found")
    if existing.owner_id != current_user.id.value:
        raise HTTPException(status_code=403, detail="You can only edit books you own")

    usecase = UpdateBookUseCase(repo)
    try:
        updated = await usecase.execute(book_id, payload)
    except BookNotFound:
        raise HTTPException(status_code=404, detail="Book not found")
    return updated


@router.patch("/books/{book_id}", response_model=BookResponse)
async def patch_book(
    book_id: str,
    payload: UpdateBookRequest,
    current_user: User = Depends(get_current_user),
    session: AsyncSession = Depends(get_session),
):
    return await update_book(book_id, payload, current_user, session)


@router.delete("/books/{book_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_book(
    book_id: str,
    current_user: User = Depends(get_current_user),
    session: AsyncSession = Depends(get_session),
):
    repo = BookRepository(session)
    try:
        existing = await repo.get_by_id(book_id)
    except BookNotFound:
        raise HTTPException(status_code=404, detail="Book not found")
    if existing.owner_id != current_user.id.value:
        raise HTTPException(status_code=403, detail="You can only delete books you own")
    await repo.remove(book_id)
