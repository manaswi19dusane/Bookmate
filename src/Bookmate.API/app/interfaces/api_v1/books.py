from fastapi import APIRouter, Depends, HTTPException
from typing import List
from sqlmodel import select
from app.interfaces.schemas import CreateBookRequest, BookResponse, UpdateBookRequest
from app.infrastructure.db import get_db
from app.infrastructure.repositories.book_repo import BookRepository
from app.application.usecases.create_book import CreateBookUseCase
from app.application.usecases.list_books import ListBooksUseCase
from app.application.usecases.Update_book import UpdateBookUseCase
from app.application.usecases.Delete_book import DeleteBookUseCase
from sqlmodel.ext.asyncio.session import AsyncSession
from app.domain.exceptions import BookNotFound
from app.application.services.auth_dependency import get_current_user
from app.domain.models_user import User
from app.infrastructure.Mappers.user_orm import UserInteractionORM
from app.infrastructure.Mappers.book_orm import BookORM

router = APIRouter(tags=["books"])

@router.post("/books", response_model=BookResponse, status_code=201)
async def create_book(payload: CreateBookRequest, session: AsyncSession = Depends(get_db)):
    repo = BookRepository(session)
    usecase = CreateBookUseCase(repo)
    dto = await usecase.execute(payload)
    return dto

@router.get("/books", response_model=List[BookResponse])
async def list_books(session: AsyncSession = Depends(get_db)):
    repo = BookRepository(session)
    usecase = ListBooksUseCase(repo)
    return await usecase.execute()

@router.get("/books/available", response_model=List[BookResponse])
async def list_available_books(
    current_user: User = Depends(get_current_user),
    session: AsyncSession = Depends(get_db),
):
    stmt = select(BookORM).where(
        ~BookORM.id.in_(
            select(UserInteractionORM.book_id).where(
                UserInteractionORM.user_id == current_user.id.value
            )
        )
    )
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

@router.get("/books/{book_id}", response_model=BookResponse)
async def get_book(book_id: str, session: AsyncSession = Depends(get_db)):
    repo = BookRepository(session)
    try:
        domain_book = await repo.get_by_id(book_id)
    except BookNotFound:
        raise HTTPException(status_code=404, detail="Book not found")

    return {
        "id": domain_book.id.value,
        "title": domain_book.title,
        "author": domain_book.author,
        "language": domain_book.language,
        "published_date": domain_book.published_date,
        "image_url": domain_book.image_url,
        "purchased_date": domain_book.purchased_date
    }

@router.put("/books/{book_id}", response_model=BookResponse)
async def update_book(
    book_id: str,
    payload: UpdateBookRequest,
    session: AsyncSession = Depends(get_db),
):
    repo = BookRepository(session)
    usecase = UpdateBookUseCase(repo)

    try:
        return await usecase.execute(book_id, payload)
    except BookNotFound:
        raise HTTPException(status_code=404, detail="Book not found")

@router.patch("/books/{book_id}", response_model=BookResponse)
async def patch_book(
    book_id: str,
    payload: UpdateBookRequest,
    session: AsyncSession = Depends(get_db),
):
    repo = BookRepository(session)
    usecase = UpdateBookUseCase(repo)

    try:
        return await usecase.execute(book_id, payload)
    except BookNotFound:
        raise HTTPException(status_code=404, detail="Book not found")
    

@router.delete("/books/{book_id}", status_code=204)
async def delete_book(
    book_id: str,
    session: AsyncSession = Depends(get_db),
):
    repo = BookRepository(session)

    try:
        await repo.remove(book_id)
    except BookNotFound:
        raise HTTPException(status_code=404, detail="Book not found")

@router.post("/books/bulk", response_model=List[BookResponse], status_code=201)
async def create_books(payload: List[CreateBookRequest], session: AsyncSession = Depends(get_db)):
    repo = BookRepository(session)
    usecase = CreateBookUseCase(repo)

    results = []
    for book in payload:
        dto = await usecase.execute(book)
        results.append(dto)

    return results       
