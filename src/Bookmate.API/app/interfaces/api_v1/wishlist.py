from datetime import datetime
from uuid import uuid4

from fastapi import APIRouter, Depends, HTTPException, status
from sqlmodel import select
from sqlmodel.ext.asyncio.session import AsyncSession

from app.application.services.auth_dependency import get_current_user
from app.domain.models_user import User
from app.infrastructure.Mappers.extended_orm import WishlistORM
from app.infrastructure.db import async_session
from app.interfaces.schemas import WishlistCreateRequest, WishlistResponse

router = APIRouter(prefix="/api/wishlist", tags=["wishlist"])


async def get_session():
    async with async_session() as session:
        yield session


@router.get("/", response_model=list[WishlistResponse])
async def list_wishlist(
    current_user: User = Depends(get_current_user),
    session: AsyncSession = Depends(get_session),
):
    result = await session.execute(
        select(WishlistORM)
        .where(WishlistORM.user_id == current_user.id.value)
        .order_by(WishlistORM.created_at.desc())
    )
    return result.scalars().all()


@router.post("/", response_model=WishlistResponse, status_code=status.HTTP_201_CREATED)
async def create_wishlist_item(
    payload: WishlistCreateRequest,
    current_user: User = Depends(get_current_user),
    session: AsyncSession = Depends(get_session),
):
    existing = await session.execute(
        select(WishlistORM).where(
            WishlistORM.user_id == current_user.id.value,
            WishlistORM.book_name == payload.book_name,
            WishlistORM.author == payload.author,
        )
    )
    if existing.scalars().first():
        raise HTTPException(status_code=400, detail="This book is already in your wishlist")

    item = WishlistORM(
        id=str(uuid4()),
        user_id=current_user.id.value,
        book_name=payload.book_name,
        author=payload.author,
        image=payload.image,
        created_at=datetime.utcnow(),
    )
    session.add(item)
    await session.commit()
    await session.refresh(item)
    return item


@router.delete("/{wishlist_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_wishlist_item(
    wishlist_id: str,
    current_user: User = Depends(get_current_user),
    session: AsyncSession = Depends(get_session),
):
    item = await session.get(WishlistORM, wishlist_id)
    if item is None or item.user_id != current_user.id.value:
        raise HTTPException(status_code=404, detail="Wishlist item not found")

    await session.delete(item)
    await session.commit()
