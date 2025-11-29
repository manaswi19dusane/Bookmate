from app.application.dtos import CreateBookDTO, BookDTO
from app.domain.models import Book, BookId
from app.infrastructure.repositories.interfaces import BookRepositoryProtocol
from app.infrastructure.Mappers.book_mapper import BookMapper

class CreateBookUseCase:
    def __init__(self, repo: BookRepositoryProtocol):
        self.repo = repo

    async def execute(self, dto: CreateBookDTO) -> BookDTO:
        # book_id = BookId.new()
        book = BookMapper.from_create_dto(dto)
        await self.repo.add(book)
        return BookMapper.to_dto(book)
