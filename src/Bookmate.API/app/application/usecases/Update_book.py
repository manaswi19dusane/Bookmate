from app.infrastructure.repositories.book_repo import BookRepository
from app.domain.models import Book


class UpdateBookUseCase:
    def __init__(self, repo: BookRepository):
        self.repo = repo

    async def execute(self, book_id: str, book: Book):
        await self.repo.update(book_id, book)
