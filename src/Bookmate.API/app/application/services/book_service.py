from typing import List, Optional

from app.domain.models import Book, BookId
from app.domain.exceptions import BookNotFound
from app.infrastructure.repositories.book_repo import BookRepository
from app.application.usecases import (
    CreateBookUseCase,
    ListBooksUseCase,
    UpdateBookUseCase,
    DeleteBookUseCase
)

class BookService:
    def __init__(self, book_repo: BookRepository):
        self.book_repo = book_repo

    async def create_book(self, create_book: CreateBookUseCase) -> Book:
        book = Book(
            id=BookId.new(),
            title=create_book.title,
            author=create_book.author,
            isbn=create_book.isbn,
            published_year=create_book.published_year,
            description=create_book.description,
            cover_image=create_book.cover_image,
            created_at=create_book.created_at,
            updated_at=create_book.updated_at
        )
        return await self.book_repo.add(book)

    async def get_book(self, book_id: str) -> Book:
        return await self.book_repo.get_by_id(book_id)

    async def list_books(self, page: int = 1, limit: int = 10) -> List[Book]:
        return await self.book_repo.list(page=page, limit=limit)

    async def update_book(self, book_id: str, update_book: UpdateBookUseCase) -> Book:
        book = await self.book_repo.get_by_id(book_id)
        if book is None:
            raise BookNotFound(book_id)

        if update_book.title:
            book.title = update_book.title
        if update_book.author:
            book.author = update_book.author
        if update_book.isbn:
            book.isbn = update_book.isbn
        if update_book.published_year:
            book.published_year = update_book.published_year
        if update_book.description:
            book.description = update_book.description
        if update_book.cover_image:
            book.cover_image = update_book.cover_image

        book.updated_at = update_book.updated_at
        return await self.book_repo.update(book)

    async def delete_book(self, book_id: str) -> bool:
        return await self.book_repo.delete(book_id)