from typing import List, Optional
from datetime import datetime
from sqlmodel.ext.asyncio.session import AsyncSession
from sqlmodel import select, delete

from app.domain.extended_models import Library, EntityId
from app.infrastructure.Mappers.extended_orm import LibraryORM


class LibraryService:
    def __init__(self, db_session: AsyncSession):
        self.db = db_session

    async def add_to_library(self, user_id: str, book_id: str, status: str = "reading") -> Library:
        existing = await self.get_by_user_and_book(user_id, book_id)
        if existing:
            raise ValueError("Book already in library")
        
        library = Library(
            id=EntityId.new(),
            user_id=user_id,
            book_id=book_id,
            added_at=datetime.utcnow(),
            status=status
        )
        
        orm_obj = LibraryORM(
            id=library.id.value,
            user_id=library.user_id,
            book_id=library.book_id,
            added_at=library.added_at,
            status=library.status
        )
        
        self.db.add(orm_obj)
        await self.db.commit()
        await self.db.refresh(orm_obj)
        
        return library

    async def get_by_user_and_book(self, user_id: str, book_id: str) -> Optional[Library]:
        query = select(LibraryORM).where(
            LibraryORM.user_id == user_id,
            LibraryORM.book_id == book_id
        )
        result = await self.db.exec(query)
        orm_obj = result.first()
        
        if not orm_obj:
            return None
            
        return Library(
            id=EntityId(orm_obj.id),
            user_id=orm_obj.user_id,
            book_id=orm_obj.book_id,
            added_at=orm_obj.added_at,
            status=orm_obj.status,
            progress=orm_obj.progress,
            notes=orm_obj.notes
        )

    async def list_user_library(self, user_id: str, status: Optional[str] = None) -> List[Library]:
        query = select(LibraryORM).where(LibraryORM.user_id == user_id)
        
        if status:
            query = query.where(LibraryORM.status == status)
            
        query = query.order_by(LibraryORM.added_at.desc())
        result = await self.db.exec(query)
        
        items = []
        for orm_obj in result.all():
            items.append(Library(
                id=EntityId(orm_obj.id),
                user_id=orm_obj.user_id,
                book_id=orm_obj.book_id,
                added_at=orm_obj.added_at,
                status=orm_obj.status,
                progress=orm_obj.progress,
                notes=orm_obj.notes
            ))
            
        return items

    async def update_status(self, library_id: str, status: str) -> Optional[Library]:
        orm_obj = await self.db.get(LibraryORM, library_id)
        if not orm_obj:
            return None
            
        orm_obj.status = status
        await self.db.commit()
        await self.db.refresh(orm_obj)
        
        return Library(
            id=EntityId(orm_obj.id),
            user_id=orm_obj.user_id,
            book_id=orm_obj.book_id,
            added_at=orm_obj.added_at,
            status=orm_obj.status,
            progress=orm_obj.progress,
            notes=orm_obj.notes
        )

    async def remove_from_library(self, library_id: str) -> bool:
        query = delete(LibraryORM).where(LibraryORM.id == library_id)
        result = await self.db.exec(query)
        await self.db.commit()
        
        return result.rowcount > 0