from fastapi import APIRouter, Depends, HTTPException
from sqlmodel import SQLModel, Field, select
from sqlmodel.ext.asyncio.session import AsyncSession
from typing import Optional, List
from datetime import datetime
from app.infrastructure.db import async_session
import uuid

# ── ORM Model ────────────────────────────────────────────────
class WishlistORM(SQLModel, table=True):
    __tablename__ = "wishlist"
    id: str = Field(default_factory=lambda: str(uuid.uuid4()), primary_key=True)
    book_name: str
    author: str
    image: Optional[str] = None
    description: Optional[str] = None
    google_id: Optional[str] = None
    amazon_url: Optional[str] = None
    added_at: datetime = Field(default_factory=datetime.utcnow)

# ── Schemas ───────────────────────────────────────────────────
class WishlistCreate(SQLModel):
    book_name: str
    author: str
    image: Optional[str] = None
    description: Optional[str] = None
    google_id: Optional[str] = None
    amazon_url: Optional[str] = None

class WishlistResponse(SQLModel):
    id: str
    book_name: str
    author: str
    image: Optional[str] = None
    description: Optional[str] = None
    google_id: Optional[str] = None
    amazon_url: Optional[str] = None
    added_at: datetime

# ── Router ────────────────────────────────────────────────────
router = APIRouter(prefix="/api/wishlist", tags=["wishlist"])

async def get_session():
    async with async_session() as session:
        yield session

@router.get("/", response_model=List[WishlistResponse])
async def list_wishlist(session: AsyncSession = Depends(get_session)):
    result = await session.execute(
        select(WishlistORM).order_by(WishlistORM.added_at.desc())
    )
    return result.scalars().all()

@router.post("/", response_model=WishlistResponse, status_code=201)
async def add_to_wishlist(payload: WishlistCreate, session: AsyncSession = Depends(get_session)):
    # Prevent duplicates by book name
    existing = await session.execute(
        select(WishlistORM).where(WishlistORM.book_name == payload.book_name)
    )
    if existing.scalar_one_or_none():
        raise HTTPException(status_code=400, detail="Book already in wishlist.")
    item = WishlistORM(**payload.model_dump())
    session.add(item)
    await session.commit()
    await session.refresh(item)
    return item

@router.delete("/{item_id}", status_code=204)
async def remove_from_wishlist(item_id: str, session: AsyncSession = Depends(get_session)):
    item = await session.get(WishlistORM, item_id)
    if not item:
        raise HTTPException(status_code=404, detail="Wishlist item not found.")
    await session.delete(item)
    await session.commit()
