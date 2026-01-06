from app.infrastructure.repositories.book_repo import BookRepository
from app.infrastructure.repositories.interfaces import BookRepositoryProtocol

class DeleteBookUseCase:
    def __init__(self, repo: BookRepositoryProtocol):
        self.repo = repo

    async def execute(self, book_id: str) -> None:
        # force existence check
        await self.repo.get_by_id(book_id)

        # delete
        await self.repo.remove(book_id)
