from fastapi import APIRouter, Depends, HTTPException
from sqlmodel import SQLModel, Field, select
from sqlmodel.ext.asyncio.session import AsyncSession
from typing import Optional, List
from datetime import date, datetime
from app.infrastructure.db import get_db
import uuid

# ── ORM Model ────────────────────────────────────────────────
class LendingORM(SQLModel, table=True):
    __tablename__ = "lendings"
    id: str = Field(default_factory=lambda: str(uuid.uuid4()), primary_key=True)
    book_id: str = Field(index=True)
    friend_name: str
    friend_email: str
    due_date: date
    status: str = Field(default="Active")   # Active | Overdue | Returned
    lent_at: datetime = Field(default_factory=datetime.utcnow)

# ── Schemas ───────────────────────────────────────────────────
class LendingCreate(SQLModel):
    book_id: str
    friend_name: str
    friend_email: str
    due_date: date

class LendingResponse(SQLModel):
    id: str
    book_id: str
    friend_name: str
    friend_email: str
    due_date: date
    status: str
    lent_at: datetime

# ── Router ────────────────────────────────────────────────────
router = APIRouter(prefix="/api/lendings", tags=["lendings"])

@router.get("/", response_model=List[LendingResponse])
async def list_lendings(session: AsyncSession = Depends(get_db)):
    """Get all active lendings."""
    result = await session.execute(
        select(LendingORM).where(LendingORM.status != "Returned").order_by(LendingORM.lent_at.desc())
    )
    lendings = result.scalars().all()
    today = date.today()
    updated = []
    for lending in lendings:
        if lending.status == "Active" and lending.due_date < today:
            lending.status = "Overdue"
            session.add(lending)
        updated.append(lending)
    await session.commit()
    return updated

@router.post("/", response_model=LendingResponse, status_code=201)
async def lend_book(payload: LendingCreate, session: AsyncSession = Depends(get_db)):
    """Lend a book to a friend."""
    # Check book exists
    from app.infrastructure.Mappers.book_orm import BookORM
    book = await session.get(BookORM, payload.book_id)
    if not book:
        raise HTTPException(status_code=404, detail="Book not found.")

    # Check not already lent
    existing = await session.execute(
        select(LendingORM).where(
            LendingORM.book_id == payload.book_id,
            LendingORM.status.in_(["Active", "Overdue"])
        )
    )
    if existing.scalar_one_or_none():
        raise HTTPException(status_code=400, detail="Book is already lent out.")

    lending = LendingORM(
        book_id=payload.book_id,
        friend_name=payload.friend_name,
        friend_email=payload.friend_email,
        due_date=payload.due_date,
    )
    session.add(lending)
    await session.commit()
    await session.refresh(lending)
    return lending

@router.patch("/{lending_id}/return", response_model=LendingResponse)
async def mark_returned(lending_id: str, session: AsyncSession = Depends(get_db)):
    """Mark a lent book as returned."""
    lending = await session.get(LendingORM, lending_id)
    if not lending:
        raise HTTPException(status_code=404, detail="Lending record not found.")
    lending.status = "Returned"
    session.add(lending)
    await session.commit()
    await session.refresh(lending)
    return lending

@router.get("/book/{book_id}/status")
async def get_book_lending_status(book_id: str, session: AsyncSession = Depends(get_db)):
    """Check if a book is currently lent out."""
    result = await session.execute(
        select(LendingORM).where(
            LendingORM.book_id == book_id,
            LendingORM.status.in_(["Active", "Overdue"])
        )
    )
    lending = result.scalar_one_or_none()
    if lending:
        return {"lent": True, "lending": lending}
    return {"lent": False}
