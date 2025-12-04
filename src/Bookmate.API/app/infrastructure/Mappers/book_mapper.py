from app.domain.models import Book, BookId
from app.application.dtos import BookDTO, CreateBookDTO
from app.infrastructure.Mappers.book_orm import BookORM

class BookMapper:

    # DTO → Domain (Create)
    @staticmethod
    def from_create_dto(dto: CreateBookDTO) -> Book:
        return Book(
            id=BookId.new(),
            title=dto.title,
            author=dto.author,
            language = dto.language,
            published_date=dto.published_date,
            image_url=dto.image_url,
            purchased_date=dto.purchased_date
        )

    # Domain → DTO
    @staticmethod
    def to_dto(book: Book) -> BookDTO:
        return BookDTO(
            id=book.id.value,
            title=book.title,
            author=book.author,
            language = book.language,
            published_date=book.published_date,
            image_url=book.image_url,
            purchased_date=book.purchased_date
        )

    # Domain → ORM
    @staticmethod
    def to_orm(book: Book) -> BookORM:
        return BookORM(
            id=book.id.value,
            title=book.title,
            author=book.author,
            language = book.language,
            published_date=book.published_date,
            image_url=book.image_url,
            purchased_date=book.purchased_date
        )

    # ORM → Domain
    @staticmethod
    def from_orm(orm: BookORM) -> Book:
        return Book(
            id=BookId(orm.id),
            title=orm.title,
            author=orm.author,
            language = orm.language,
            published_date=orm.published_date,
            image_url=orm.image_url,
            purchased_date=orm.purchased_date
        )
    
    @staticmethod
    def to_domain_from_orm(orm: BookORM) -> Book:
        return Book(
            id=BookId(orm.id),
            title=orm.title,
            author=orm.author,
            language = orm.language,
            published_date=orm.published_date,
            image_url=orm.image_url,
            purchased_date=orm.purchased_date
        )