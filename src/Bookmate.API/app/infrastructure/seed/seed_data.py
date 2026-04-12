from datetime import datetime
import random
from typing import List, Dict, Any
from sqlalchemy.orm import Session
from passlib.context import CryptContext
from app.domain.models import Book
from app.domain.models_user import User as UserDomain, UserPreference, UserInteraction
from app.infrastructure.Mappers.book_orm import BookORM
from app.infrastructure.Mappers.user_orm import UserORM
from app.infrastructure.Mappers.extended_orm import (
    CorporateClubORM as CorporateClub,
    CommunityGroupORM as CommunityGroup,
    MarketplaceORM as MarketplaceItem,
    LibraryORM as LibraryItem,
    InstitutionORM as Institution
)

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

# -----------------------------------------------------------------------------
# SAMPLE DATA DEFINITIONS
# -----------------------------------------------------------------------------

# 5-10 Users with realistic emails
SAMPLE_USERS = [
    {"email": "john.doe@example.com", "password": "SecurePass123!", "first_name": "John", "last_name": "Doe", "is_active": True},
    {"email": "jane.smith@example.com", "password": "SecurePass123!", "first_name": "Jane", "last_name": "Smith", "is_active": True},
    {"email": "bob.jones@example.com", "password": "SecurePass123!", "first_name": "Bob", "last_name": "Jones", "is_active": True},
    {"email": "alice.brown@example.com", "password": "SecurePass123!", "first_name": "Alice", "last_name": "Brown", "is_active": True},
    {"email": "charlie.wilson@example.com", "password": "SecurePass123!", "first_name": "Charlie", "last_name": "Wilson", "is_active": True},
    {"email": "emma.davis@example.com", "password": "SecurePass123!", "first_name": "Emma", "last_name": "Davis", "is_active": True},
    {"email": "michael.miller@example.com", "password": "SecurePass123!", "first_name": "Michael", "last_name": "Miller", "is_active": True},
]

# 15-20 Books with real image URLs
SAMPLE_BOOKS = [
    {
        "title": "The Great Gatsby", "author": "F. Scott Fitzgerald", "language": "English",
        "published_date": datetime(1925, 4, 10), "description": "A novel about the American dream and its corruption.",
        "image_url": "https://picsum.photos/id/237/200/300", "status": "Available"
    },
    {
        "title": "To Kill a Mockingbird", "author": "Harper Lee", "language": "English",
        "published_date": datetime(1960, 7, 11), "description": "A novel about racial injustice in the Deep South.",
        "image_url": "https://picsum.photos/id/238/200/300", "status": "Available"
    },
    {
        "title": "1984", "author": "George Orwell", "language": "English",
        "published_date": datetime(1949, 6, 8), "description": "A dystopian novel about totalitarianism.",
        "image_url": "https://picsum.photos/id/239/200/300", "status": "Available"
    },
    {
        "title": "Pride and Prejudice", "author": "Jane Austen", "language": "English",
        "published_date": datetime(1813, 1, 28), "description": "A romantic novel about love and marriage.",
        "image_url": "https://picsum.photos/id/240/200/300", "status": "Available"
    },
    {
        "title": "The Catcher in the Rye", "author": "J.D. Salinger", "language": "English",
        "published_date": datetime(1951, 7, 16), "description": "A novel about teenage rebellion and alienation.",
        "image_url": "https://picsum.photos/id/241/200/300", "status": "Available"
    },
    {
        "title": "Moby-Dick", "author": "Herman Melville", "language": "English",
        "published_date": datetime(1851, 10, 18), "description": "A novel about a sailor's obsessive quest for a whale.",
        "image_url": "https://picsum.photos/id/242/200/300", "status": "Available"
    },
    {
        "title": "War and Peace", "author": "Leo Tolstoy", "language": "English",
        "published_date": datetime(1869, 1, 1), "description": "An epic novel about Russian society during the Napoleonic era.",
        "image_url": "https://picsum.photos/id/243/200/300", "status": "Available"
    },
    {
        "title": "The Odyssey", "author": "Homer", "language": "English",
        "published_date": datetime(1900, 1, 1), "description": "An ancient Greek epic poem about Odysseus's journey home.",
        "image_url": "https://picsum.photos/id/244/200/300", "status": "Available"
    },
    {
        "title": "The Divine Comedy", "author": "Dante Alighieri", "language": "English",
        "published_date": datetime(1320, 1, 1), "description": "An epic poem about the afterlife.",
        "image_url": "https://picsum.photos/id/245/200/300", "status": "Available"
    },
    {
        "title": "Don Quixote", "author": "Miguel de Cervantes", "language": "English",
        "published_date": datetime(1605, 1, 1), "description": "A novel about a man who becomes a knight-errant.",
        "image_url": "https://picsum.photos/id/246/200/300", "status": "Available"
    },
    {
        "title": "The Brothers Karamazov", "author": "Fyodor Dostoevsky", "language": "English",
        "published_date": datetime(1880, 1, 1), "description": "A novel about faith, doubt, and morality.",
        "image_url": "https://picsum.photos/id/247/200/300", "status": "Available"
    },
    {
        "title": "The Iliad", "author": "Homer", "language": "English",
        "published_date": datetime(1900, 1, 1), "description": "An ancient Greek epic poem about the Trojan War.",
        "image_url": "https://picsum.photos/id/248/200/300", "status": "Available"
    },
    {
        "title": "Madame Bovary", "author": "Gustave Flaubert", "language": "English",
        "published_date": datetime(1857, 1, 1), "description": "A novel about a woman's romantic illusions.",
        "image_url": "https://picsum.photos/id/249/200/300", "status": "Available"
    },
    {
        "title": "The Adventures of Huckleberry Finn", "author": "Mark Twain", "language": "English",
        "published_date": datetime(1884, 12, 10), "description": "A novel about a boy's journey down the Mississippi River.",
        "image_url": "https://picsum.photos/id/250/200/300", "status": "Available"
    },
    {
        "title": "The Count of Monte Cristo", "author": "Alexandre Dumas", "language": "English",
        "published_date": datetime(1844, 1, 1), "description": "A novel about revenge and redemption.",
        "image_url": "https://picsum.photos/id/251/200/300", "status": "Available"
    },
    {
        "title": "Brave New World", "author": "Aldous Huxley", "language": "English",
        "published_date": datetime(1932, 1, 1), "description": "A dystopian social science fiction novel.",
        "image_url": "https://picsum.photos/id/252/200/300", "status": "Available"
    },
    {
        "title": "Crime and Punishment", "author": "Fyodor Dostoevsky", "language": "English",
        "published_date": datetime(1866, 1, 1), "description": "A psychological novel about morality.",
        "image_url": "https://picsum.photos/id/253/200/300", "status": "Available"
    },
]

SAMPLE_INSTITUTIONS = [
    {"name": "Harvard University", "type": "university", "description": "A prestigious Ivy League research university.", "location": "Cambridge, MA"},
    {"name": "Stanford University", "type": "university", "description": "A leading research and teaching institution.", "location": "Stanford, CA"},
    {"name": "MIT", "type": "university", "description": "A world-renowned technical university.", "location": "Cambridge, MA"},
]

SAMPLE_CORPORATE_CLUBS = [
    {"name": "Tech Corp Book Club", "company_name": "Technology Company", "description": "A book club for technology professionals.", "industry": "Technology"},
    {"name": "Finance Readers", "company_name": "Financial Services", "description": "A book club for finance professionals.", "industry": "Finance"},
]

SAMPLE_COMMUNITY_GROUPS = [
    {"name": "Sci-Fi Enthusiasts", "category": "fiction", "description": "Science fiction and fantasy lovers community.", "tags": ["scifi", "fantasy", "space"]},
    {"name": "Business Books", "category": "non-fiction", "description": "Business and entrepreneurship books group.", "tags": ["business", "leadership"]},
]

# -----------------------------------------------------------------------------
# SEEDING FUNCTIONS
# -----------------------------------------------------------------------------

def seed_users(db: Session) -> List[UserDomain]:
    """Seed sample users with hashed passwords"""
    if db.query(UserDomain).first():
        return db.query(UserDomain).all()
    
    created_users = []
    for user_data in SAMPLE_USERS:
        hashed_password = pwd_context.hash(user_data.pop("password"))
        user = UserDomain(**user_data, hashed_password=hashed_password)
        db.add(user)
        created_users.append(user)
    
    db.commit()
    for user in created_users:
        db.refresh(user)
    
    return created_users

def seed_books(db: Session) -> List[Book]:
    """Seed sample books with real image URLs"""
    if db.query(Book).first():
        return db.query(Book).all()
    
    created_books = []
    for book_data in SAMPLE_BOOKS:
        book = Book(**book_data)
        db.add(book)
        created_books.append(book)
    
    db.commit()
    for book in created_books:
        db.refresh(book)
    
    return created_books

def seed_preferences(db: Session, users: List[UserDomain], books: List[Book]):
    """Seed user preferences linked to existing users and books"""
    if db.query(UserPreference).first():
        return
    
    genres = ["fiction", "non-fiction", "science fiction", "fantasy", "mystery", "thriller", "classics"]
    
    for user in users:
        selected_books = random.sample(books, min(3, len(books)))
        for book in selected_books:
            preference = UserPreference(
                user_id=user.id,
                book_id=book.id,
                genre=random.choice(genres),
                author=book.author
            )
            db.add(preference)
    
    db.commit()

def seed_interactions(db: Session, users: List[UserDomain], books: List[Book]):
    """Seed user interactions linked to existing users and books"""
    if db.query(UserInteraction).first():
        return
    
    interaction_types = ["view", "like", "purchase", "rating"]
    
    for user in users:
        selected_books = random.sample(books, min(5, len(books)))
        for book in selected_books:
            interaction_type = random.choice(interaction_types)
            rating = random.randint(3, 5) if interaction_type == "rating" else None
            
            interaction = UserInteraction(
                user_id=user.id,
                book_id=book.id,
                interaction_type=interaction_type,
                rating=rating,
                interaction_date=datetime.now()
            )
            db.add(interaction)
    
    db.commit()

def seed_library(db: Session, users: List[UserDomain], books: List[Book]):
    """Seed library items with valid user-book relationships"""
    if db.query(LibraryItem).first():
        return
    
    statuses = ["reading", "completed", "wishlist"]
    
    for user in users:
        selected_books = random.sample(books, min(7, len(books)))
        for book in selected_books:
            library_item = LibraryItem(
                user_id=user.id,
                book_id=book.id,
                status=random.choice(statuses),
                added_date=datetime.now()
            )
            db.add(library_item)
    
    db.commit()

def seed_marketplace(db: Session, users: List[UserDomain], books: List[Book]):
    """Seed marketplace listings using existing users and books"""
    if db.query(MarketplaceItem).first():
        return
    
    conditions = ["New", "Like New", "Very Good", "Good", "Acceptable"]
    
    for _ in range(10):
        seller = random.choice(users)
        book = random.choice(books)
        
        marketplace_item = MarketplaceItem(
            book_id=book.id,
            seller_id=seller.id,
            title=book.title,
            author=book.author,
            price=round(random.uniform(5.99, 29.99), 2),
            condition=random.choice(conditions),
            description=f"For sale: {book.title} by {book.author}",
            image_url=book.image_url,
            is_available=True,
            listed_date=datetime.now()
        )
        db.add(marketplace_item)
    
    db.commit()

def seed_groups_and_institutions(db: Session, users: List[UserDomain]):
    """Seed institutions, corporate clubs and community groups"""
    # Seed Institutions
    if not db.query(Institution).first():
        for inst_data in SAMPLE_INSTITUTIONS:
            institution = Institution(**inst_data, admin_id=random.choice(users).id)
            db.add(institution)
    
    # Seed Corporate Clubs
    if not db.query(CorporateClub).first():
        for club_data in SAMPLE_CORPORATE_CLUBS:
            club = CorporateClub(**club_data, creator_id=random.choice(users).id)
            db.add(club)
    
    # Seed Community Groups
    if not db.query(CommunityGroup).first():
        for group_data in SAMPLE_COMMUNITY_GROUPS:
            group = CommunityGroup(**group_data, creator_id=random.choice(users).id)
            db.add(group)
    
    db.commit()

# -----------------------------------------------------------------------------
# MAIN SEED FUNCTION
# -----------------------------------------------------------------------------

def run_seed(db: Session):
    """Run complete seeding process in correct dependency order"""
    # 1. Seed Users first (base entity)
    users = seed_users(db)
    
    # 2. Seed Books next (base entity)
    books = seed_books(db)
    
    # 3. Seed dependent entities in correct order
    seed_preferences(db, users, books)
    seed_interactions(db, users, books)
    seed_library(db, users, books)
    seed_marketplace(db, users, books)
    seed_groups_and_institutions(db, users)

def is_sample_data_loaded(db: Session) -> bool:
    """Check if sample data has already been loaded"""
    from sqlalchemy import select, func
    
    book_count = db.execute(select(func.count(BookORM.id))).scalar_one()
    user_count = db.execute(select(func.count(UserORM.id))).scalar_one()
    
    return book_count > 0 and user_count > 0
