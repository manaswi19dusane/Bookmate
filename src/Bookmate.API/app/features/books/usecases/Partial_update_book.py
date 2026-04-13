from app.domain.exceptions import BookNotFound
from app.infrastructure.Mappers.book_mapper import BookMapper
from app.application.dtos import PatchBookDTO, BookDTO
from app.infrastructure.repositories.interfaces import BookRepositoryProtocol

class PatchBookUseCase:
    def __init__(self, repo: BookRepositoryProtocol):
        self.repo = repo
async def execute(self, book_id: str, dto: PatchBookDTO) -> BookDTO:
    existing = await self.repo.get_by_id(book_id)
    updated = BookMapper.merge(existing, dto)
    await self.repo.update(book_id, updated)
    return BookMapper.to_dto(updated)