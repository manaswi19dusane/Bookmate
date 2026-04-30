from typing import List

from sqlalchemy import update
from sqlmodel import select
from sqlmodel.ext.asyncio.session import AsyncSession

from app.domain.exceptions import BookNotFound
from app.domain.models import Book as DomainBook
from app.infrastructure.Mappers.book_mapper import BookMapper
from app.infrastructure.Mappers.book_orm import BookORM
from app.infrastructure.repositories.interfaces import BookRepositoryProtocol


class BookRepository(BookRepositoryProtocol):
    def __init__(self, session: AsyncSession):
        self.session = session

    async def add(self, book: DomainBook, owner_user_id: str) -> None:
        orm = BookMapper.to_orm(book, owner_user_id)
        self.session.add(orm)
        await self.session.commit()
        await self.session.refresh(orm)

    async def get_by_id(self, id: str, owner_user_id: str) -> DomainBook:
        stmt = select(BookORM).where(BookORM.id == id, BookORM.owner_user_id == owner_user_id)
        result = await self.session.execute(stmt)
        orm = result.scalars().first()
        if orm is None:
            raise BookNotFound(id)
        return BookMapper.to_domain_from_orm(orm)

    async def list_all(self, owner_user_id: str) -> List[DomainBook]:
        stmt = select(BookORM).where(BookORM.owner_user_id == owner_user_id)
        result = await self.session.execute(stmt)
        orm_list = result.scalars().all()
        return [BookMapper.to_domain_from_orm(orm) for orm in orm_list]

    async def update(self, id: str, book: DomainBook, owner_user_id: str) -> None:
        stmt = (
            update(BookORM)
            .where(BookORM.id == id, BookORM.owner_user_id == owner_user_id)
            .values(
                title=book.title,
                author=book.author,
                language=book.language,
                published_date=book.published_date,
                image_url=book.image_url,
                purchased_date=book.purchased_date,
            )
        )
        result = await self.session.execute(stmt)
        if result.rowcount == 0:
            raise BookNotFound(id)
        await self.session.commit()

    async def remove(self, id: str, owner_user_id: str) -> None:
        stmt = select(BookORM).where(BookORM.id == id, BookORM.owner_user_id == owner_user_id)
        result = await self.session.execute(stmt)
        orm = result.scalars().first()
        if orm is None:
            raise BookNotFound(id)
        await self.session.delete(orm)
        await self.session.commit()
