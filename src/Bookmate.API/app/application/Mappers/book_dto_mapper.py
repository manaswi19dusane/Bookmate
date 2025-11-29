from app.domain.models import Book
from app.application.dtos import BookDTO

class BookDTOMapper:

    @staticmethod
    def to_dto(domain: Book) -> BookDTO:
        return BookDTO(
            id=domain.id.value,
            title=domain.title,
            author=domain.author,
            published_date=domain.published_date,
            image_url=domain.image_url,
            purchased_date=domain.purchased_date
        )
