from datetime import datetime
from typing import List
from uuid import uuid4

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlmodel import select
from sqlmodel.ext.asyncio.session import AsyncSession

from app.infrastructure.Mappers.book_orm import BookORM
from app.infrastructure.Mappers.extended_orm import MarketplaceORM
from app.infrastructure.Mappers.user_orm import UserORM
from app.infrastructure.db import async_session
from app.interfaces.schemas import MarketplaceCreate, MarketplaceResponse, MarketplaceUpdate

router = APIRouter(tags=["marketplaces"])


async def get_session():
    async with async_session() as session:
        yield session


@router.post("/marketplaces", response_model=MarketplaceResponse, status_code=status.HTTP_201_CREATED)
async def create_marketplace(
    payload: MarketplaceCreate,
    session: AsyncSession = Depends(get_session),
):
    seller = await session.get(UserORM, payload.seller_user_id)
    book = await session.get(BookORM, payload.book_id)
    if seller is None:
        raise HTTPException(status_code=400, detail="seller_user_id does not exist")
    if book is None:
        raise HTTPException(status_code=400, detail="book_id does not exist")

    item = MarketplaceORM(
        id=str(uuid4()),
        book_id=payload.book_id,
        seller_user_id=payload.seller_user_id,
        price=payload.price,
        condition=payload.condition,
        description=payload.description,
        listed_at=datetime.utcnow(),
        is_available=True,
    )
    session.add(item)
    await session.commit()
    await session.refresh(item)
    return item


@router.get("/marketplaces", response_model=List[MarketplaceResponse])
async def list_marketplaces(
    page: int = Query(1, ge=1),
    limit: int = Query(10, ge=1, le=100),
    session: AsyncSession = Depends(get_session),
):
    stmt = (
        select(MarketplaceORM)
        .offset((page - 1) * limit)
        .limit(limit)
        .order_by(MarketplaceORM.listed_at.desc())
    )
    result = await session.exec(stmt)
    return result.all()


@router.get("/marketplaces/{marketplace_id}", response_model=MarketplaceResponse)
async def get_marketplace(
    marketplace_id: str,
    session: AsyncSession = Depends(get_session),
):
    item = await session.get(MarketplaceORM, marketplace_id)
    if item is None:
        raise HTTPException(status_code=404, detail="Marketplace not found")
    return item


@router.put("/marketplaces/{marketplace_id}", response_model=MarketplaceResponse)
async def update_marketplace(
    marketplace_id: str,
    payload: MarketplaceUpdate,
    session: AsyncSession = Depends(get_session),
):
    item = await session.get(MarketplaceORM, marketplace_id)
    if item is None:
        raise HTTPException(status_code=404, detail="Marketplace not found")

    updates = payload.model_dump(exclude_unset=True)
    for field, value in updates.items():
        setattr(item, field, value)

    if item.is_available is False and item.sold_at is None:
        item.sold_at = datetime.utcnow()

    session.add(item)
    await session.commit()
    await session.refresh(item)
    return item


@router.delete("/marketplaces/{marketplace_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_marketplace(
    marketplace_id: str,
    session: AsyncSession = Depends(get_session),
):
    item = await session.get(MarketplaceORM, marketplace_id)
    if item is None:
        raise HTTPException(status_code=404, detail="Marketplace not found")
    await session.delete(item)
    await session.commit()
