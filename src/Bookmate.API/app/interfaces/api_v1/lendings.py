from __future__ import annotations

from datetime import date, datetime
from typing import List, Optional
import uuid

from fastapi import APIRouter, Depends, HTTPException
from sqlmodel import Field, SQLModel, select
from sqlmodel.ext.asyncio.session import AsyncSession

from app.application.services.auth_dependency import get_current_user
from app.application.services.lending_notification_service import (
    process_due_reminders,
    send_confirmation_for_lending,
    validate_email_address,
    validate_name,
)
from app.domain.models_user import User
from app.infrastructure.db import get_db


class LendingORM(SQLModel, table=True):
    __tablename__ = "lendings"

    id: str = Field(default_factory=lambda: str(uuid.uuid4()), primary_key=True)
    owner_user_id: Optional[str] = Field(default=None, index=True)
    book_id: str = Field(index=True)
    friend_name: str
    friend_email: str
    due_date: date
    status: str = Field(default="Active")
    lent_at: datetime = Field(default_factory=datetime.utcnow)
    reminder_stage: Optional[str] = None
    returned_at: Optional[datetime] = None


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


router = APIRouter(prefix="/api/lendings", tags=["lendings"])


async def run_due_reminder_processing(session: AsyncSession) -> int:
    from app.infrastructure.Mappers.book_orm import BookORM

    return await process_due_reminders(session, LendingORM, BookORM)


@router.get("/", response_model=List[LendingResponse])
async def list_lendings(
    session: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    await run_due_reminder_processing(session)
    result = await session.execute(
        select(LendingORM)
        .where(
            LendingORM.status != "Returned",
            LendingORM.owner_user_id == current_user.id.value,
        )
        .order_by(LendingORM.lent_at.desc())
    )
    return result.scalars().all()


@router.post("/", response_model=LendingResponse, status_code=201)
async def lend_book(
    payload: LendingCreate,
    session: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    from app.infrastructure.Mappers.book_orm import BookORM

    try:
        friend_name = validate_name(payload.friend_name, "Friend name")
        friend_email = validate_email_address(payload.friend_email)
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc

    if payload.due_date < date.today():
        raise HTTPException(status_code=400, detail="Due date cannot be in the past.")

    book = await session.get(BookORM, payload.book_id)
    if not book or book.owner_user_id != current_user.id.value:
        raise HTTPException(status_code=404, detail="Book not found.")

    existing = await session.execute(
        select(LendingORM).where(
            LendingORM.book_id == payload.book_id,
            LendingORM.owner_user_id == current_user.id.value,
            LendingORM.status.in_(["Active", "Overdue"]),
        )
    )
    if existing.scalar_one_or_none():
        raise HTTPException(status_code=400, detail="Book is already lent out.")

    lending = LendingORM(
        owner_user_id=current_user.id.value,
        book_id=payload.book_id,
        friend_name=friend_name,
        friend_email=friend_email,
        due_date=payload.due_date,
    )
    session.add(lending)
    await session.commit()
    await session.refresh(lending)

    await send_confirmation_for_lending(
        book_title=book.title,
        friend_name=lending.friend_name,
        friend_email=lending.friend_email,
        due_date=lending.due_date,
    )

    return lending


@router.patch("/{lending_id}/return", response_model=LendingResponse)
async def mark_returned(
    lending_id: str,
    session: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    result = await session.execute(
        select(LendingORM).where(
            LendingORM.id == lending_id,
            LendingORM.owner_user_id == current_user.id.value,
        )
    )
    lending = result.scalars().first()
    if not lending:
        raise HTTPException(status_code=404, detail="Lending record not found.")

    lending.status = "Returned"
    lending.returned_at = datetime.utcnow()
    session.add(lending)
    await session.commit()
    await session.refresh(lending)
    return lending


@router.get("/book/{book_id}/status")
async def get_book_lending_status(
    book_id: str,
    session: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    await run_due_reminder_processing(session)
    result = await session.execute(
        select(LendingORM).where(
            LendingORM.book_id == book_id,
            LendingORM.owner_user_id == current_user.id.value,
            LendingORM.status.in_(["Active", "Overdue"]),
        )
    )
    lending = result.scalar_one_or_none()
    if lending:
        return {"lent": True, "lending": lending}
    return {"lent": False}


@router.post("/run-reminders")
async def run_reminders(
    session: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    processed = await run_due_reminder_processing(session)
    return {"processed": processed, "user_id": current_user.id.value}
