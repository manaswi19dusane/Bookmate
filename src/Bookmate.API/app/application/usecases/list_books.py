from typing import List
from app.application.dtos import BookDTO
from app.application.Mappers.book_dto_mapper import BookDTOMapper
from app.infrastructure.repositories.interfaces import BookRepositoryProtocol

class ListBooksUseCase:
    def __init__(self, repo: BookRepositoryProtocol):
        self.repo = repo

    async def execute(self, owner_user_id: str) -> List[BookDTO]:
        domain_books = await self.repo.list_all(owner_user_id)
        return [BookDTOMapper.to_dto(b) for b in domain_books]
