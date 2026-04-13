from __future__ import annotations

from datetime import date, datetime
from typing import Iterable
from uuid import uuid4

from passlib.context import CryptContext
from sqlalchemy import func, select, text
from sqlalchemy.orm import Session

from app.infrastructure.Mappers.book_orm import BookORM
from app.infrastructure.Mappers.extended_orm import (
    CommunityGroupORM,
    CorporateClubORM,
    InstitutionORM,
    LibraryORM,
    MarketplaceORM,
)
from app.infrastructure.Mappers.user_orm import (
    UserInteractionORM,
    UserORM,
    UserPreferenceORM,
)

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

DEFAULT_ADMIN_EMAIL = "admin@bookmate.com"
DEFAULT_ADMIN_PASSWORD = "P@$$w0rd"


def _uuid() -> str:
    return str(uuid4())


SAMPLE_USERS = [
    {"email": "john.doe@example.com", "password": "SecurePass123!"},
    {"email": "jane.smith@example.com", "password": "SecurePass123!"},
    {"email": "bob.jones@example.com", "password": "SecurePass123!"},
    {"email": "alice.brown@example.com", "password": "SecurePass123!"},
]

SAMPLE_BOOKS = [
    {
        "title": "The Great Gatsby",
        "author": "F. Scott Fitzgerald",
        "language": "English",
        "published_date": date(1925, 4, 10),
        "image_url": "https://picsum.photos/id/237/200/300",
    },
    {
        "title": "To Kill a Mockingbird",
        "author": "Harper Lee",
        "language": "English",
        "published_date": date(1960, 7, 11),
        "image_url": "https://picsum.photos/id/238/200/300",
    },
    {
        "title": "1984",
        "author": "George Orwell",
        "language": "English",
        "published_date": date(1949, 6, 8),
        "image_url": "https://picsum.photos/id/239/200/300",
    },
    {
        "title": "Pride and Prejudice",
        "author": "Jane Austen",
        "language": "English",
        "published_date": date(1813, 1, 28),
        "image_url": "https://picsum.photos/id/240/200/300",
    },
    {
        "title": "The Catcher in the Rye",
        "author": "J.D. Salinger",
        "language": "English",
        "published_date": date(1951, 7, 16),
        "image_url": "https://picsum.photos/id/241/200/300",
    },
    {
        "title": "Moby-Dick",
        "author": "Herman Melville",
        "language": "English",
        "published_date": date(1851, 10, 18),
        "image_url": "https://picsum.photos/id/242/200/300",
    },
]

SAMPLE_INSTITUTIONS = [
    {
        "name": "Harvard University",
        "type": "university",
        "address": "Cambridge, Massachusetts, USA",
        "website": "https://www.harvard.edu",
        "contact_email": "library@harvard.edu",
        "is_verified": True,
    },
    {
        "name": "Stanford University",
        "type": "university",
        "address": "Stanford, California, USA",
        "website": "https://www.stanford.edu",
        "contact_email": "library@stanford.edu",
        "is_verified": True,
    },
]

SAMPLE_CORPORATE_CLUBS = [
    {
        "name": "Tech Corp Book Club",
        "organization_name": "Technology Company",
        "description": "A book club for technology professionals.",
        "max_members": 50,
        "is_active": True,
    },
    {
        "name": "Finance Readers",
        "organization_name": "Financial Services",
        "description": "A book club for finance professionals.",
        "max_members": 30,
        "is_active": True,
    },
]

SAMPLE_COMMUNITY_GROUPS = [
    {
        "name": "Sci-Fi Enthusiasts",
        "topic": "science fiction",
        "description": "Readers who love science fiction classics and new releases.",
        "is_public": True,
    },
    {
        "name": "Business Books",
        "topic": "business",
        "description": "A community for business and leadership readers.",
        "is_public": True,
    },
]


def seed_users(db: Session) -> list[UserORM]:
    users = db.execute(select(UserORM).order_by(UserORM.email)).scalars().all()
    if users:
        return users

    created_users: list[UserORM] = []
    for user_data in SAMPLE_USERS:
        user = UserORM(
            id=_uuid(),
            email=user_data["email"],
            password=pwd_context.hash(user_data["password"]),
            created_at=datetime.utcnow(),
            role="user",
        )
        db.add(user)
        created_users.append(user)

    db.commit()
    for user in created_users:
        db.refresh(user)
    return created_users


def ensure_default_admin(db: Session) -> UserORM:
    admin_user = db.execute(
        select(UserORM).where(UserORM.email == DEFAULT_ADMIN_EMAIL)
    ).scalar_one_or_none()

    if admin_user is None:
        admin_user = UserORM(
            id=_uuid(),
            email=DEFAULT_ADMIN_EMAIL,
            password=pwd_context.hash(DEFAULT_ADMIN_PASSWORD),
            created_at=datetime.utcnow(),
            role="admin",
        )
        db.add(admin_user)
        db.commit()
        db.refresh(admin_user)
        return admin_user

    if admin_user.role != "admin":
        admin_user.role = "admin"
        db.add(admin_user)
        db.commit()
        db.refresh(admin_user)

    return admin_user


def seed_books(db: Session) -> list[BookORM]:
    books = db.execute(select(BookORM).order_by(BookORM.title)).scalars().all()
    if books:
        return books

    created_books: list[BookORM] = []
    for book_data in SAMPLE_BOOKS:
        book = BookORM(id=_uuid(), **book_data)
        db.add(book)
        created_books.append(book)

    db.commit()
    for book in created_books:
        db.refresh(book)
    return created_books


def _seed_preferences(db: Session, users: Iterable[UserORM], books: list[BookORM]) -> None:
    if db.execute(select(func.count(UserPreferenceORM.id))).scalar_one() > 0:
        return

    for index, user in enumerate(users):
        first_book = books[index % len(books)]
        second_book = books[(index + 1) % len(books)]
        db.add(
            UserPreferenceORM(
                id=_uuid(),
                user_id=user.id,
                book_id=first_book.id,
                genre="Classics",
                author=first_book.author,
                created_at=datetime.utcnow(),
            )
        )
        db.add(
            UserPreferenceORM(
                id=_uuid(),
                user_id=user.id,
                book_id=second_book.id,
                genre="Literature",
                author=second_book.author,
                created_at=datetime.utcnow(),
            )
        )
    db.commit()


def _seed_interactions(db: Session, users: Iterable[UserORM], books: list[BookORM]) -> None:
    if db.execute(select(func.count(UserInteractionORM.id))).scalar_one() > 0:
        return

    interaction_types = ["view", "like", "rating", "purchase"]
    for index, user in enumerate(users):
        book = books[index % len(books)]
        db.add(
            UserInteractionORM(
                id=_uuid(),
                user_id=user.id,
                book_id=book.id,
                interaction_type=interaction_types[index % len(interaction_types)],
                rating=5 if index % 2 == 0 else 4,
                created_at=datetime.utcnow(),
            )
        )
    db.commit()


def _seed_library(db: Session, users: Iterable[UserORM], books: list[BookORM]) -> None:
    if db.execute(select(func.count(LibraryORM.id))).scalar_one() > 0:
        return

    statuses = ["reading", "completed", "wishlist", "reading"]
    for index, user in enumerate(users):
        book = books[(index + 2) % len(books)]
        db.add(
            LibraryORM(
                id=_uuid(),
                user_id=user.id,
                book_id=book.id,
                added_at=datetime.utcnow(),
                status=statuses[index % len(statuses)],
                progress=25 * ((index % 4) + 1),
                notes=f"Seeded library item for {user.email}",
            )
        )
    db.commit()


def _seed_marketplace(db: Session, users: list[UserORM], books: list[BookORM]) -> None:
    if db.execute(select(func.count(MarketplaceORM.id))).scalar_one() > 0:
        return

    conditions = ["New", "Like New", "Good", "Very Good"]
    for index, book in enumerate(books[:4]):
        seller = users[index % len(users)]
        db.add(
            MarketplaceORM(
                id=_uuid(),
                book_id=book.id,
                seller_user_id=seller.id,
                price=9.99 + index * 3,
                condition=conditions[index % len(conditions)],
                description=f"Seed listing for {book.title}",
                listed_at=datetime.utcnow(),
                is_available=True,
            )
        )
    db.commit()


def _seed_institutions(db: Session) -> None:
    if db.execute(select(func.count(InstitutionORM.id))).scalar_one() > 0:
        return

    for data in SAMPLE_INSTITUTIONS:
        db.add(InstitutionORM(id=_uuid(), created_at=datetime.utcnow(), **data))
    db.commit()


def _seed_corporate_clubs(db: Session, users: list[UserORM]) -> None:
    if db.execute(select(func.count(CorporateClubORM.id))).scalar_one() > 0:
        return

    for index, data in enumerate(SAMPLE_CORPORATE_CLUBS):
        db.add(
            CorporateClubORM(
                id=_uuid(),
                admin_user_id=users[index % len(users)].id,
                created_at=datetime.utcnow(),
                **data,
            )
        )
    db.commit()


def _seed_community_groups(db: Session, users: list[UserORM]) -> None:
    if db.execute(select(func.count(CommunityGroupORM.id))).scalar_one() > 0:
        return

    for index, data in enumerate(SAMPLE_COMMUNITY_GROUPS):
        db.add(
            CommunityGroupORM(
                id=_uuid(),
                creator_user_id=users[index % len(users)].id,
                created_at=datetime.utcnow(),
                **data,
            )
        )
    db.commit()


def _mark_sample_data_loaded(db: Session) -> None:
    db.execute(text("DELETE FROM sample_data_tracking"))
    db.execute(
        text(
            "INSERT INTO sample_data_tracking (sample_data_loaded) "
            "VALUES (:sample_data_loaded)"
        ),
        {"sample_data_loaded": True},
    )
    db.commit()


def run_seed(db: Session) -> None:
    users = seed_users(db)
    books = seed_books(db)
    _seed_preferences(db, users, books)
    _seed_interactions(db, users, books)
    _seed_library(db, users, books)
    _seed_marketplace(db, users, books)
    _seed_institutions(db)
    _seed_corporate_clubs(db, users)
    _seed_community_groups(db, users)
    _mark_sample_data_loaded(db)


def is_sample_data_loaded(db: Session) -> bool:
    tracking_loaded = db.execute(
        text(
            "SELECT sample_data_loaded "
            "FROM sample_data_tracking "
            "ORDER BY id DESC LIMIT 1"
        )
    ).scalar()
    if not tracking_loaded:
        return False

    counts = {
        "books": db.execute(select(func.count(BookORM.id))).scalar_one(),
        "users": db.execute(select(func.count(UserORM.id))).scalar_one(),
        "preferences": db.execute(select(func.count(UserPreferenceORM.id))).scalar_one(),
        "interactions": db.execute(select(func.count(UserInteractionORM.id))).scalar_one(),
        "library": db.execute(select(func.count(LibraryORM.id))).scalar_one(),
        "marketplace": db.execute(select(func.count(MarketplaceORM.id))).scalar_one(),
        "institutions": db.execute(select(func.count(InstitutionORM.id))).scalar_one(),
        "corporate_clubs": db.execute(select(func.count(CorporateClubORM.id))).scalar_one(),
        "community_groups": db.execute(select(func.count(CommunityGroupORM.id))).scalar_one(),
    }
    return all(count > 0 for count in counts.values())
