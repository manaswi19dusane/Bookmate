from typing import List
from sqlmodel import select
from sqlmodel.ext.asyncio.session import AsyncSession
from app.infrastructure.repositories.interfaces import BookRepositoryProtocol
from app.domain.models import Book as DomainBook
from app.domain.exceptions import BookNotFound
from app.infrastructure.Mappers.book_mapper import BookMapper
from app.infrastructure.Mappers.book_orm import BookORM
from sqlalchemy import update

class BookRepository(BookRepositoryProtocol):
    def __init__(self, session: AsyncSession):
        self.session = session

    # CREATE
    async def add(self, book: DomainBook) -> None:
        orm = BookMapper.to_orm(book)
        self.session.add(orm)
        await self.session.commit()
        await self.session.refresh(orm)

    # READ by ID
    async def get_by_id(self, id: str) -> DomainBook:
        stmt = select(BookORM).where(BookORM.id == id)
        result = await self.session.execute(stmt)
        orm = result.scalars().first()

        if orm is None:
            raise BookNotFound(id)

        return BookMapper.to_domain_from_orm(orm)

    # LIST
    async def list_all(self) -> List[DomainBook]:
        stmt = select(BookORM)
        result = await self.session.execute(stmt)
        orm_list = result.scalars().all()

        return [BookMapper.to_domain_from_orm(o) for o in orm_list]

    async def list_by_owner(self, owner_id: str) -> List[DomainBook]:
        stmt = select(BookORM).where(BookORM.owner_id == owner_id)
        result = await self.session.execute(stmt)
        orm_list = result.scalars().all()
        return [BookMapper.to_domain_from_orm(o) for o in orm_list]

    # ✅ UPDATE (MOVED INSIDE CLASS)
    async def update(self, id: str, book: DomainBook) -> None:
        existing = await self.get_by_id(id)
        stmt = (
            update(BookORM)
            .where(BookORM.id == str(id))
            .values(
                title=book.title if book.title is not None else existing.title,
                author=book.author if book.author is not None else existing.author,
                language=book.language if book.language is not None else existing.language,
                published_date=book.published_date if book.published_date is not None else existing.published_date,
                image_url=book.image_url if book.image_url is not None else existing.image_url,
                description=book.description if book.description is not None else existing.description,
                isbn=book.isbn if book.isbn is not None else existing.isbn,
                source=book.source if book.source is not None else existing.source,
                purchased_date=book.purchased_date if book.purchased_date is not None else existing.purchased_date,
            )
        )

        result = await self.session.execute(stmt)

        if result.rowcount == 0:
            raise BookNotFound(id)

        await self.session.commit()

    # ✅ DELETE (MOVED INSIDE CLASS)
    async def remove(self, id: str) -> None:
        stmt = select(BookORM).where(BookORM.id == id)
        result = await self.session.execute(stmt)
        orm = result.scalars().first()

        if orm is None:
            raise BookNotFound(id)

        await self.session.delete(orm)
        await self.session.commit()
