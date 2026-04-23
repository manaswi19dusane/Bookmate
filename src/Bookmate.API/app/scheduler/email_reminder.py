"""
Email Reminder Scheduler for Bookmate
Run standalone: python -m app.scheduler.email_reminder
Checks daily for due/overdue book lendings and sends reminder emails.
"""
import os
import smtplib
import asyncio
from datetime import date, timedelta
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart

from sqlalchemy import create_engine, text
from sqlalchemy.orm import sessionmaker

# ── Config ────────────────────────────────────────────────────
DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///./bookmate.db").replace(
    "sqlite+aiosqlite:///", "sqlite:///"
)
EMAIL_HOST     = os.getenv("EMAIL_HOST", "smtp.gmail.com")
EMAIL_PORT     = int(os.getenv("EMAIL_PORT", "587"))
EMAIL_USER     = os.getenv("EMAIL_USER", "")
EMAIL_PASSWORD = os.getenv("EMAIL_PASSWORD", "")
EMAIL_FROM     = os.getenv("EMAIL_FROM", EMAIL_USER)

def get_db():
    engine = create_engine(DATABASE_URL)
    Session = sessionmaker(bind=engine)
    return Session()

def send_email(to_email: str, subject: str, body: str):
    """Send email via SMTP."""
    if not EMAIL_USER or not EMAIL_PASSWORD:
        print(f"[EMAIL SKIP] No credentials set. Would send to {to_email}: {subject}")
        return

    msg = MIMEMultipart("alternative")
    msg["Subject"] = subject
    msg["From"]    = EMAIL_FROM
    msg["To"]      = to_email
    msg.attach(MIMEText(body, "html"))

    try:
        with smtplib.SMTP(EMAIL_HOST, EMAIL_PORT) as server:
            server.ehlo()
            server.starttls()
            server.login(EMAIL_USER, EMAIL_PASSWORD)
            server.sendmail(EMAIL_FROM, to_email, msg.as_string())
        print(f"[EMAIL SENT] {subject} → {to_email}")
    except Exception as e:
        print(f"[EMAIL ERROR] {e}")

def build_email_body(book_title: str, friend_name: str, due_date: date, days_overdue: int = 0) -> tuple[str, str]:
    """Returns (subject, html_body) based on due status."""
    if days_overdue > 0:
        subject = f"🔴 Overdue: '{book_title}' was due {days_overdue} day(s) ago"
        body = f"""
        <h2>📚 Bookmate — Overdue Book Reminder</h2>
        <p>Hi there,</p>
        <p>Your book <strong>"{book_title}"</strong> lent to <strong>{friend_name}</strong> 
        was due on <strong>{due_date}</strong> and is now <strong>{days_overdue} day(s) overdue</strong>.</p>
        <p>Please follow up with {friend_name} to get your book back.</p>
        <br><p>— Bookmate</p>
        """
    elif days_overdue == 0:
        subject = f"📅 Due Today: '{book_title}' is due back today"
        body = f"""
        <h2>📚 Bookmate — Due Today</h2>
        <p>Hi there,</p>
        <p>Your book <strong>"{book_title}"</strong> lent to <strong>{friend_name}</strong> 
        is due back <strong>today ({due_date})</strong>.</p>
        <p>You may want to remind {friend_name} to return it.</p>
        <br><p>— Bookmate</p>
        """
    else:
        subject = f"⏰ Reminder: '{book_title}' is due tomorrow"
        body = f"""
        <h2>📚 Bookmate — Due Tomorrow</h2>
        <p>Hi there,</p>
        <p>Your book <strong>"{book_title}"</strong> lent to <strong>{friend_name}</strong> 
        is due back <strong>tomorrow ({due_date})</strong>.</p>
        <br><p>— Bookmate</p>
        """
    return subject, body

def run_reminders():
    """Main scheduler task — run this daily."""
    db = get_db()
    today = date.today()
    tomorrow = today + timedelta(days=1)

    print(f"[SCHEDULER] Running reminder check for {today}")

    try:
        rows = db.execute(text("""
            SELECT l.id, l.book_id, l.friend_name, l.friend_email, l.due_date, l.status,
                   b.title as book_title
            FROM lendings l
            JOIN bookormt b ON b.id = l.book_id
            WHERE l.status IN ('Active', 'Overdue')
        """)).fetchall()

        for row in rows:
            due = row.due_date if isinstance(row.due_date, date) else date.fromisoformat(str(row.due_date))
            days_overdue = (today - due).days

            if due == tomorrow:
                subject, body = build_email_body(row.book_title, row.friend_name, due, -1)
                send_email(row.friend_email, subject, body)
            elif due == today:
                subject, body = build_email_body(row.book_title, row.friend_name, due, 0)
                send_email(row.friend_email, subject, body)
            elif days_overdue > 0:
                subject, body = build_email_body(row.book_title, row.friend_name, due, days_overdue)
                send_email(row.friend_email, subject, body)
                # Update status to Overdue
                db.execute(text("UPDATE lendings SET status='Overdue' WHERE id=:id"), {"id": row.id})
                db.commit()

    except Exception as e:
        print(f"[SCHEDULER ERROR] {e}")
    finally:
        db.close()

    print("[SCHEDULER] Done.")

if __name__ == "__main__":
    import schedule
    import time

    print("[SCHEDULER] Starting Bookmate email reminder scheduler...")
    schedule.every().day.at("08:00").do(run_reminders)

    # Run once immediately on startup
    run_reminders()

    while True:
        schedule.run_pending()
        time.sleep(3600)
