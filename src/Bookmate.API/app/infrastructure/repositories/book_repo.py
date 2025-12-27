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

async def update(self, id: str, book: DomainBook) -> None:
    stmt = (
        update(BookORM)
        .where(BookORM.id == str(id))
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


async def remove(self, id: str) -> None:
    stmt = select(BookORM).where(BookORM.id == id)
    result = await self.session.execute(stmt)
    orm = result.scalars().first()

    if orm is None:
        raise BookNotFound(id)

    await self.session.delete(orm)
    await self.session.commit()
