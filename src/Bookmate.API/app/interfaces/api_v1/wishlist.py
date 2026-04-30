from __future__ import annotations

from datetime import datetime
from typing import List, Optional
import uuid

from fastapi import APIRouter, Depends, HTTPException
from sqlmodel import Field, SQLModel, select
from sqlmodel.ext.asyncio.session import AsyncSession

from app.application.services.auth_dependency import get_current_user
from app.domain.models_user import User
from app.infrastructure.db import get_db


class WishlistORM(SQLModel, table=True):
    __tablename__ = "wishlist"

    id: str = Field(default_factory=lambda: str(uuid.uuid4()), primary_key=True)
    owner_user_id: Optional[str] = Field(default=None, index=True)
    book_name: str
    author: str
    image: Optional[str] = None
    description: Optional[str] = None
    google_id: Optional[str] = None
    amazon_url: Optional[str] = None
    added_at: datetime = Field(default_factory=datetime.utcnow)


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


router = APIRouter(prefix="/api/wishlist", tags=["wishlist"])


@router.get("/", response_model=List[WishlistResponse])
async def list_wishlist(
    session: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    result = await session.execute(
        select(WishlistORM)
        .where(WishlistORM.owner_user_id == current_user.id.value)
        .order_by(WishlistORM.added_at.desc())
    )
    return result.scalars().all()


@router.post("/", response_model=WishlistResponse, status_code=201)
async def add_to_wishlist(
    payload: WishlistCreate,
    session: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    existing = await session.execute(
        select(WishlistORM).where(
            WishlistORM.owner_user_id == current_user.id.value,
            WishlistORM.book_name == payload.book_name,
        )
    )
    if existing.scalar_one_or_none():
        raise HTTPException(status_code=400, detail="Book already in wishlist.")

    item = WishlistORM(owner_user_id=current_user.id.value, **payload.model_dump())
    session.add(item)
    await session.commit()
    await session.refresh(item)
    return item


@router.delete("/{item_id}", status_code=204)
async def remove_from_wishlist(
    item_id: str,
    session: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    result = await session.execute(
        select(WishlistORM).where(
            WishlistORM.id == item_id,
            WishlistORM.owner_user_id == current_user.id.value,
        )
    )
    item = result.scalars().first()
    if not item:
        raise HTTPException(status_code=404, detail="Wishlist item not found.")
    await session.delete(item)
    await session.commit()
