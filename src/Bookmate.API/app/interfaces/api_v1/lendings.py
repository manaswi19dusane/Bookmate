from fastapi import APIRouter, Depends, HTTPException, status
from sqlmodel.ext.asyncio.session import AsyncSession

from app.application.services.auth_dependency import get_current_user
from app.application.services.lending_service import LendingService
from app.domain.models_user import User
from app.infrastructure.db import async_session
from app.interfaces.schemas import LendBookRequest, LentBookResponse

router = APIRouter(prefix="/api/lendings", tags=["lendings"])


async def get_session():
    async with async_session() as session:
        yield session


@router.get("/", response_model=list[LentBookResponse])
async def list_lendings(
    current_user: User = Depends(get_current_user),
    session: AsyncSession = Depends(get_session),
):
    service = LendingService(session)
    return await service.list_owner_lendings(current_user.id.value)


@router.post("/{book_id}", response_model=LentBookResponse, status_code=status.HTTP_201_CREATED)
async def lend_book(
    book_id: str,
    payload: LendBookRequest,
    current_user: User = Depends(get_current_user),
    session: AsyncSession = Depends(get_session),
):
    service = LendingService(session)
    try:
        return await service.create_lending(
            owner_id=current_user.id.value,
            book_id=book_id,
            friend_name=payload.friend_name,
            friend_email=payload.friend_email,
            due_date=payload.due_date,
        )
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc))


@router.patch("/{lending_id}/return", response_model=LentBookResponse)
async def mark_returned(
    lending_id: str,
    current_user: User = Depends(get_current_user),
    session: AsyncSession = Depends(get_session),
):
    service = LendingService(session)
    lending = await service.mark_as_returned(current_user.id.value, lending_id)
    if lending is None:
        raise HTTPException(status_code=404, detail="Lending record not found")
    return lending


@router.post("/reminders/run")
async def run_reminders_now(
    current_user: User = Depends(get_current_user),
    session: AsyncSession = Depends(get_session),
):
    service = LendingService(session)
    sent = await service.send_due_reminders_now(current_user.id.value)
    return {"sent": sent}
