from app.infrastructure.repositories.book_repository import BookRepository


class DeleteBookUseCase:
    def __init__(self, repo: BookRepository):
        self.repo = repo

    async def execute(self, book_id: str):
        await self.repo.remove(book_id)
