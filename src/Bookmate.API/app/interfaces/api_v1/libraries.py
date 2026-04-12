from fastapi import APIRouter, Depends, HTTPException
from typing import List, Optional
from sqlmodel.ext.asyncio.session import AsyncSession

from app.infrastructure.db import async_session
from app.application.services.library_service import LibraryService
from app.application.services.auth_dependency import get_current_user


router = APIRouter(prefix="/api/library", tags=["library"])


async def get_db():
    async with async_session() as session:
        yield session


@router.get("/")
async def get_user_library(
    status: Optional[str] = None,
    db: AsyncSession = Depends(get_db),
    current_user = Depends(get_current_user)
):
    service = LibraryService(db)
    items = await service.list_user_library(current_user.id.value, status)
    return [
        {
            "id": item.id.value,
            "book_id": item.book_id,
            "added_at": item.added_at,
            "status": item.status,
            "progress": item.progress,
            "notes": item.notes
        } for item in items
    ]


@router.post("/")
async def add_book_to_library(
    book_id: str,
    status: str = "reading",
    db: AsyncSession = Depends(get_db),
    current_user = Depends(get_current_user)
):
    service = LibraryService(db)
    try:
        item = await service.add_to_library(current_user.id.value, book_id, status)
        return {
            "id": item.id.value,
            "book_id": item.book_id,
            "added_at": item.added_at,
            "status": item.status
        }
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.patch("/{library_id}/status")
async def update_library_status(
    library_id: str,
    status: str,
    db: AsyncSession = Depends(get_db),
    current_user = Depends(get_current_user)
):
    service = LibraryService(db)
    item = await service.update_status(library_id, status)
    
    if not item:
        raise HTTPException(status_code=404, detail="Library entry not found")
        
    return {
        "id": item.id.value,
        "status": item.status
    }


@router.delete("/{library_id}")
async def remove_from_library(
    library_id: str,
    db: AsyncSession = Depends(get_db),
    current_user = Depends(get_current_user)
):
    service = LibraryService(db)
    success = await service.remove_from_library(library_id)
    
    if not success:
        raise HTTPException(status_code=404, detail="Library entry not found")
        
    return {"success": True}
