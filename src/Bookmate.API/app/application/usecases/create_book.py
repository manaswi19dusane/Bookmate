from app.application.dtos import CreateBookDTO, BookDTO
from app.domain.models import Book, BookId
from app.infrastructure.repositories.interfaces import BookRepositoryProtocol

class CreateBookUseCase:
    def __init__(self, repo: BookRepositoryProtocol):
        self.repo = repo

    async def execute(self, dto: CreateBookDTO) -> BookDTO:
        book_id = BookId.new()
        book = Book(
            id=book_id,
            title=dto.title,
            author=dto.author,
            published_date=dto.published_date,
            image_url=dto.image_url,
            purchased_date=dto.purchased_date
        )
        await self.repo.add(book)
        return BookDTO(
            id=book.id.value,
            title=book.title,
            author=book.author,
            published_date=book.published_date,
            image_url=book.image_url,
            purchased_date=book.purchased_date
        )
