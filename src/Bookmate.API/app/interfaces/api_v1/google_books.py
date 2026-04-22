from fastapi import APIRouter, HTTPException
import httpx
from typing import Optional

router = APIRouter(prefix="/api/google-books", tags=["google-books"])

GOOGLE_BOOKS_API = "https://www.googleapis.com/books/v1/volumes"

def parse_book(item: dict) -> dict:
    info = item.get("volumeInfo", {})
    image_links = info.get("imageLinks", {})
    return {
        "google_id": item.get("id", ""),
        "title": info.get("title", "Unknown Title"),
        "authors": info.get("authors", ["Unknown Author"]),
        "description": info.get("description", ""),
        "thumbnail": image_links.get("thumbnail", image_links.get("smallThumbnail", "")),
        "published_date": info.get("publishedDate", ""),
        "categories": info.get("categories", []),
        "isbn": next(
            (id["identifier"] for id in info.get("industryIdentifiers", []) if "ISBN" in id.get("type", "")),
            ""
        ),
        "amazon_url": f"https://www.amazon.com/s?k={info.get('title', '').replace(' ', '+')}",
    }

@router.get("/search")
async def search_books(q: str, category: Optional[str] = None):
    """Search Google Books API by query and optional category."""
    query = q
    if category:
        query = f"{q}+subject:{category}"

    async with httpx.AsyncClient() as client:
        try:
            response = await client.get(
                GOOGLE_BOOKS_API,
                params={"q": query, "maxResults": 12},
                timeout=10.0,
            )
            response.raise_for_status()
        except httpx.RequestError:
            raise HTTPException(status_code=503, detail="Google Books API is unreachable.")

    data = response.json()
    items = data.get("items", [])
    return [parse_book(item) for item in items]


@router.get("/isbn/{isbn}")
async def get_book_by_isbn(isbn: str):
    """Fetch book details by ISBN (for barcode scanner)."""
    async with httpx.AsyncClient() as client:
        try:
            response = await client.get(
                GOOGLE_BOOKS_API,
                params={"q": f"isbn:{isbn}", "maxResults": 1},
                timeout=10.0,
            )
            response.raise_for_status()
        except httpx.RequestError:
            raise HTTPException(status_code=503, detail="Google Books API is unreachable.")

    data = response.json()
    items = data.get("items", [])
    if not items:
        raise HTTPException(status_code=404, detail="No book found for this ISBN.")

    return parse_book(items[0])
