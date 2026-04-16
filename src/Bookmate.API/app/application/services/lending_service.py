from __future__ import annotations

from datetime import date, datetime, timedelta
from email.message import EmailMessage
import smtplib
from uuid import uuid4

from sqlmodel import select
from sqlmodel.ext.asyncio.session import AsyncSession

from app.config import settings
from app.infrastructure.Mappers.book_orm import BookORM
from app.infrastructure.Mappers.extended_orm import BookLendingORM


class LendingService:
    def __init__(self, session: AsyncSession):
        self.session = session

    async def create_lending(
        self,
        *,
        owner_id: str,
        book_id: str,
        friend_name: str,
        friend_email: str,
        due_date: date,
    ) -> BookLendingORM:
        book = await self.session.get(BookORM, book_id)
        if book is None:
            raise ValueError("Book not found")
        if book.owner_id != owner_id:
            raise ValueError("You can only lend books you own")

        result = await self.session.exec(
            select(BookLendingORM).where(
                BookLendingORM.book_id == book_id,
                BookLendingORM.owner_id == owner_id,
                BookLendingORM.status.in_(("active", "overdue")),
            )
        )
        if result.first():
            raise ValueError("This book is already lent out")

        lending = BookLendingORM(
            id=str(uuid4()),
            book_id=book.id,
            book_name=book.title,
            owner_id=owner_id,
            friend_name=friend_name,
            friend_email=friend_email,
            lend_date=datetime.utcnow(),
            due_date=due_date,
            status="overdue" if due_date < date.today() else "active",
        )
        self.session.add(lending)
        await self.session.commit()
        await self.session.refresh(lending)
        self._send_email_reminder(lending, "borrowed")
        return lending

    async def list_owner_lendings(self, owner_id: str) -> list[BookLendingORM]:
        result = await self.session.exec(
            select(BookLendingORM)
            .where(BookLendingORM.owner_id == owner_id)
            .order_by(BookLendingORM.lend_date.desc())
        )
        lendings = result.all()
        updated = False
        today = date.today()
        for lending in lendings:
            next_status = lending.status
            if lending.status != "returned":
                next_status = "overdue" if lending.due_date < today else "active"
            if next_status != lending.status:
                lending.status = next_status
                self.session.add(lending)
                updated = True
        if updated:
            await self.session.commit()
        return lendings

    async def mark_as_returned(self, owner_id: str, lending_id: str) -> BookLendingORM | None:
        lending = await self.session.get(BookLendingORM, lending_id)
        if lending is None or lending.owner_id != owner_id:
            return None

        lending.status = "returned"
        lending.returned_at = datetime.utcnow()
        self.session.add(lending)
        await self.session.commit()
        await self.session.refresh(lending)
        return lending

    async def process_due_reminders(self, run_date: date | None = None) -> int:
        today = run_date or date.today()
        result = await self.session.exec(
            select(BookLendingORM).where(BookLendingORM.status.in_(("active", "overdue")))
        )
        lendings = result.all()
        sent_count = 0

        for lending in lendings:
            stage = self._get_reminder_stage(lending.due_date, today)
            status = "overdue" if lending.due_date < today else "active"
            if lending.status != status:
                lending.status = status

            if stage and stage != lending.reminder_stage:
                self._send_email_reminder(lending, stage)
                lending.reminder_stage = stage
                sent_count += 1

            self.session.add(lending)

        await self.session.commit()
        return sent_count

    def _get_reminder_stage(self, due_date: date, today: date) -> str | None:
        if due_date == today + timedelta(days=1):
            return "day_before"
        if due_date == today:
            return "due_today"
        if due_date < today:
            return "overdue"
        return None

    def _send_email_reminder(self, lending: BookLendingORM, stage: str) -> None:
        subject_map = {
            "borrowed": "Book borrowed successfully",
            "day_before": "Reminder: book due tomorrow",
            "due_today": "Reminder: book due today",
            "overdue": "Overdue notice: book return pending",
        }
        intro_map = {
            "borrowed": "This is your confirmation that the book has been lent to you.",
            "day_before": "This is a reminder that the return date is tomorrow.",
            "due_today": "This is a reminder that the book is due today.",
            "overdue": "This book is now overdue. Please return it as soon as possible.",
        }
        subject = subject_map.get(stage, "Book Return Reminder")
        body = (
            f"Hello {lending.friend_name},\n\n"
            f"You borrowed \"{lending.book_name}\".\n"
            f"{intro_map.get(stage, 'Please return it by the due date.')}\n"
            f"Due date: {lending.due_date}\n\n"
            "Thank you."
        )

        if not settings.SMTP_HOST or not settings.SMTP_FROM_EMAIL:
            print(
                f"[Bookmate reminder] To: {lending.friend_email} | "
                f"Subject: {subject} | Message: {body}"
            )
            return

        message = EmailMessage()
        message["Subject"] = subject
        message["From"] = settings.SMTP_FROM_EMAIL
        message["To"] = lending.friend_email
        message.set_content(body)

        with smtplib.SMTP(settings.SMTP_HOST, settings.SMTP_PORT, timeout=30) as smtp:
            if settings.SMTP_USE_TLS:
                smtp.starttls()
            if settings.SMTP_USERNAME and settings.SMTP_PASSWORD:
                smtp.login(settings.SMTP_USERNAME, settings.SMTP_PASSWORD)
            smtp.send_message(message)

    async def send_due_reminders_now(self, owner_id: str) -> int:
        result = await self.session.exec(
            select(BookLendingORM).where(
                BookLendingORM.owner_id == owner_id,
                BookLendingORM.status.in_(("active", "overdue")),
            )
        )
        lendings = result.all()
        sent_count = 0
        today = date.today()
        for lending in lendings:
            stage = self._get_reminder_stage(lending.due_date, today)
            if stage:
                self._send_email_reminder(lending, stage)
                lending.reminder_stage = stage
                self.session.add(lending)
                sent_count += 1
        await self.session.commit()
        return sent_count
