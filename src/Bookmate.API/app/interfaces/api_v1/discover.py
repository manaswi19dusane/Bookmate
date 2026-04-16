import asyncio

from fastapi import APIRouter, HTTPException, Query

from app.application.services.google_books_service import GoogleBooksService
from app.interfaces.schemas import GoogleBookResponse

router = APIRouter(prefix="/api/discover", tags=["discover"])


@router.get("/books", response_model=list[GoogleBookResponse])
async def discover_books(
    query: str | None = Query(default=None),
    category: str | None = Query(default=None),
):
    service = GoogleBooksService()
    try:
        return await asyncio.to_thread(service.search, query=query, category=category)
    except Exception as exc:
        raise HTTPException(status_code=502, detail=f"Unable to fetch books from Google Books: {exc}")


@router.get("/isbn/{barcode}", response_model=GoogleBookResponse)
async def discover_book_by_isbn(barcode: str):
    service = GoogleBooksService()
    try:
        book = await asyncio.to_thread(service.lookup_isbn, barcode)
    except Exception as exc:
        raise HTTPException(status_code=502, detail=f"Unable to fetch ISBN details: {exc}")

    if book is None:
        raise HTTPException(status_code=404, detail="No book found for this barcode")
    return book
