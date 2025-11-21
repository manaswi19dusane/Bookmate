from fastapi import APIRouter, Depends, HTTPException
from typing import List
from app.interfaces.schemas import CreateBookRequest, BookResponse
from app.infrastructure.db import async_session
from app.infrastructure.repositories.book_repo import BookRepository
from app.application.usecases.create_book import CreateBookUseCase
from app.application.usecases.list_books import ListBooksUseCase
from sqlmodel.ext.asyncio.session import AsyncSession
from contextlib import asynccontextmanager
from app.domain.exceptions import BookNotFound

router = APIRouter(tags=["books"])

@asynccontextmanager
async def get_session():
    async with async_session() as session:
        yield session

@router.post("/books", response_model=BookResponse, status_code=201)
async def create_book(payload: CreateBookRequest, session: AsyncSession = Depends(get_session)):
    repo = BookRepository(session)
    usecase = CreateBookUseCase(repo)
    dto = await usecase.execute(payload)
    return dto

@router.get("/books", response_model=List[BookResponse])
async def list_books(session: AsyncSession = Depends(get_session)):
    repo = BookRepository(session)
    usecase = ListBooksUseCase(repo)
    return await usecase.execute()

@router.get("/books/{book_id}", response_model=BookResponse)
async def get_book(book_id: str, session: AsyncSession = Depends(get_session)):
    repo = BookRepository(session)
    try:
        domain_book = await repo.get_by_id(book_id)
    except BookNotFound:
        raise HTTPException(status_code=404, detail="Book not found")
    return {
        "id": domain_book.id.value,
        "title": domain_book.title,
        "author": domain_book.author,
        "published_date": domain_book.published_date,
        "image_url": domain_book.image_url,
        "purchased_date": domain_book.purchased_date
    }
