from typing import List, Optional
from sqlmodel import SQLModel, Field, select
from sqlmodel.ext.asyncio.session import AsyncSession
from app.infrastructure.repositories.interfaces import BookRepositoryProtocol
from app.domain.models import Book as DomainBook, BookId
from datetime import date

class BookORM(SQLModel, table=True):
    id: str = Field(primary_key=True)
    title: str
    author: str
    published_date: Optional[date] = None
    image_url: Optional[str] = None
    purchased_date: Optional[date] = None

class BookRepository(BookRepositoryProtocol):
    def __init__(self, session: AsyncSession):
        self.session = session

    async def add(self, book: DomainBook) -> None:
        orm = BookORM(
            id=book.id.value,
            title=book.title,
            author=book.author,
            published_date=book.published_date,
            image_url=book.image_url,
            purchased_date=book.purchased_date
        )
        self.session.add(orm)
        await self.session.commit()

    async def get_by_id(self, id: str) -> DomainBook:
        q = select(BookORM).where(BookORM.id == id)
        result = await self.session.execute(q)
        orm = result.scalars().first()
        if not orm:
            from app.domain.exceptions import BookNotFound
            raise BookNotFound(id)
        return DomainBook(
            id=BookId(orm.id),
            title=orm.title,
            author=orm.author,
            published_date=orm.published_date,
            image_url=orm.image_url,
            purchased_date=orm.purchased_date
        )

    async def list_all(self) -> List[DomainBook]:
        q = select(BookORM)
        result = await self.session.execute(q)
        orm_list = result.scalars().all()
        return [
            DomainBook(
                id=BookId(o.id),
                title=o.title,
                author=o.author,
                published_date=o.published_date,
                image_url=o.image_url,
                purchased_date=o.purchased_date
            ) for o in orm_list
        ]

    async def remove(self, id: str) -> None:
        q = select(BookORM).where(BookORM.id == id)
        result = await self.session.execute(q)
        orm = result.scalars().first()
        if orm:
            await self.session.delete(orm)
            await self.session.commit()
