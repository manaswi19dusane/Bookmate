from typing import List
from app.application.dtos import BookDTO
from app.infrastructure.repositories.interfaces import BookRepositoryProtocol

class ListBooksUseCase:
    def __init__(self, repo: BookRepositoryProtocol):
        self.repo = repo

    async def execute(self) -> List[BookDTO]:
        domain_books = await self.repo.list_all()
        return [BookDTO(
            id=b.id.value,
            title=b.title,
            author=b.author,
            published_date=b.published_date,
            image_url=b.image_url,
            purchased_date=b.purchased_date
        ) for b in domain_books]
