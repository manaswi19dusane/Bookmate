from __future__ import annotations

import logging
from datetime import date

from sqlmodel import select
from sqlmodel.ext.asyncio.session import AsyncSession

from app.application.services.email_service import (
    send_lending_confirmation_email,
    send_lending_due_reminder_email,
)

logger = logging.getLogger(__name__)


def validate_email_address(value: str) -> str:
    email = value.strip()
    if not email:
        raise ValueError("Email is required.")
    if "\r" in email or "\n" in email:
        raise ValueError("Email contains invalid characters.")
    if "@" not in email or email.startswith("@") or email.endswith("@"):
        raise ValueError("Enter a valid email address.")
    return email


def validate_name(value: str, field_name: str) -> str:
    name = value.strip()
    if not name:
        raise ValueError(f"{field_name} is required.")
    if "\r" in name or "\n" in name:
        raise ValueError(f"{field_name} contains invalid characters.")
    return name


def get_reminder_stage(due_date: date, run_date: date) -> str | None:
    delta_days = (due_date - run_date).days
    if delta_days == 1:
        return "due_tomorrow"
    if delta_days == 0:
        return "due_today"
    if delta_days < 0:
        return "overdue"
    return None


async def process_due_reminders(
    session: AsyncSession,
    lending_model: type,
    book_model: type,
    *,
    run_date: date | None = None,
) -> int:
    today = run_date or date.today()
    result = await session.execute(
        select(lending_model).where(lending_model.status != "Returned")
    )
    lendings = result.scalars().all()
    reminders_sent = 0

    for lending in lendings:
        if lending.status == "Active" and lending.due_date < today:
            lending.status = "Overdue"

        reminder_stage = get_reminder_stage(lending.due_date, today)
        if reminder_stage is None or lending.reminder_stage == reminder_stage:
            continue

        book = await session.get(book_model, lending.book_id)
        book_title = book.title if book else "your book"

        email_sent = await send_lending_due_reminder_email(
            book_title=book_title,
            friend_name=lending.friend_name,
            friend_email=lending.friend_email,
            due_date=lending.due_date.isoformat(),
            reminder_stage=reminder_stage,
        )
        if email_sent:
            lending.reminder_stage = reminder_stage
            reminders_sent += 1
        else:
            logger.warning(
                "Reminder email was not sent for lending %s to %s",
                lending.id,
                lending.friend_email,
            )

        session.add(lending)

    await session.commit()
    return reminders_sent


async def send_confirmation_for_lending(
    *,
    book_title: str,
    friend_name: str,
    friend_email: str,
    due_date: date,
) -> bool:
    return await send_lending_confirmation_email(
        book_title=book_title,
        friend_name=friend_name,
        friend_email=friend_email,
        due_date=due_date.isoformat(),
    )
