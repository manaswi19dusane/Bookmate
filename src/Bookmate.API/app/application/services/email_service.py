from __future__ import annotations

import logging
from email.message import EmailMessage

import aiosmtplib

from app.config import settings

logger = logging.getLogger(__name__)


def _build_message(*, subject: str, to_email: str, body: str) -> EmailMessage:
    message = EmailMessage()
    message["Subject"] = subject
    message["From"] = settings.outbound_email_from
    message["To"] = to_email
    message.set_content(body)
    return message


async def _send_message(message: EmailMessage, recipient: str) -> bool:
    if not settings.smtp_enabled:
        logger.info("SMTP credentials are not configured; skipping email to %s", recipient)
        return False

    try:
        await aiosmtplib.send(
            message,
            hostname=settings.SMTP_HOST,
            port=settings.SMTP_PORT,
            username=settings.SMTP_USER,
            password=settings.SMTP_PASSWORD,
            start_tls=settings.SMTP_START_TLS,
            timeout=settings.SMTP_TIMEOUT_SECONDS,
        )
        return True
    except Exception:
        logger.exception("Failed to send email to %s", recipient)
        return False


async def send_lending_confirmation_email(
    *,
    book_title: str,
    friend_name: str,
    friend_email: str,
    due_date: str,
) -> bool:
    subject = f"Bookmate: '{book_title}' has been lent to you"
    body = f"""
Hello {friend_name},

You have been lent "{book_title}" through Bookmate.

Due date: {due_date}

Please return it on or before the due date.

Thanks,
Bookmate
""".strip()

    return await _send_message(
        _build_message(subject=subject, to_email=friend_email, body=body),
        friend_email,
    )


async def send_lending_due_reminder_email(
    *,
    book_title: str,
    friend_name: str,
    friend_email: str,
    due_date: str,
    reminder_stage: str,
) -> bool:
    subject_map = {
        "due_tomorrow": f"Reminder: '{book_title}' is due tomorrow",
        "due_today": f"Reminder: '{book_title}' is due today",
        "overdue": f"Overdue notice: '{book_title}' is still out",
    }
    intro_map = {
        "due_tomorrow": "This is a reminder that your borrowed book is due tomorrow.",
        "due_today": "This is a reminder that your borrowed book is due today.",
        "overdue": "This book is now overdue. Please return it as soon as possible.",
    }

    subject = subject_map.get(reminder_stage, "Bookmate return reminder")
    body = f"""
Hello {friend_name},

{intro_map.get(reminder_stage, "This is a return reminder from Bookmate.")}

Book: {book_title}
Due date: {due_date}

Please return it on or before the due date.

Thanks,
Bookmate
""".strip()

    return await _send_message(
        _build_message(subject=subject, to_email=friend_email, body=body),
        friend_email,
    )
