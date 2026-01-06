from app.domain.exceptions import BookNotFound
from app.infrastructure.Mappers.book_mapper import BookMapper
from app.application.dtos import UpdateBookDTO, BookDTO
from app.infrastructure.repositories.interfaces import BookRepositoryProtocol


class UpdateBookUseCase:
    def __init__(self, repo: BookRepositoryProtocol):
        self.repo = repo

    async def execute(self, book_id: str, dto: UpdateBookDTO) -> BookDTO:
       
        existing = await self.repo.get_by_id(book_id)
        
        updated = BookMapper.from_update_dto(book_id, dto)

        await self.repo.update(book_id, updated)

        return BookMapper.to_dto(updated)
