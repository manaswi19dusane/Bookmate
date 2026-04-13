from typing import Optional, List, Set
from sqlmodel import SQLModel, Field
from datetime import date, datetime

# Extended Book ORM
class ExtendedBookORM(SQLModel, table=True):
    __tablename__ = "extended_books"
    id: str = Field(primary_key=True)
    title: str
    author: str
    language: str
    published_date: Optional[date] = None
    image_url: Optional[str] = None
    purchased_date: Optional[date] = None
    isbn: Optional[str] = None
    description: Optional[str] = None
    page_count: Optional[int] = None
    categories: Optional[str] = None  # Comma-separated string
    status: str = "available"
    created_at: datetime = Field(default=datetime.now)
    updated_at: datetime = Field(default=datetime.now)

# Library ORM
class LibraryORM(SQLModel, table=True):
    __tablename__ = "libraries"
    id: str = Field(primary_key=True)
    name: str
    description: Optional[str] = None
    address: Optional[str] = None
    contact_email: Optional[str] = None
    created_at: datetime = Field(default=datetime.now)
    updated_at: datetime = Field(default=datetime.now)

# Institution ORM
class InstitutionORM(SQLModel, table=True):
    __tablename__ = "institutions"
    id: str = Field(primary_key=True)
    name: str
    type: str  # "school", "university", "research"
    address: Optional[str] = None
    contact_email: Optional[str] = None
    created_at: datetime = Field(default=datetime.now)
    updated_at: datetime = Field(default=datetime.now)

# Corporate Club ORM
class CorporateClubORM(SQLModel, table=True):
    __tablename__ = "corporate_clubs"
    id: str = Field(primary_key=True)
    name: str
    company_name: str
    description: Optional[str] = None
    contact_email: Optional[str] = None
    created_at: datetime = Field(default=datetime.now)
    updated_at: datetime = Field(default=datetime.now)

# Community Group ORM
class CommunityGroupORM(SQLModel, table=True):
    __tablename__ = "community_groups"
    id: str = Field(primary_key=True)
    name: str
    description: Optional[str] = None
    location: Optional[str] = None
    contact_email: Optional[str] = None
    created_at: datetime = Field(default=datetime.now)
    updated_at: datetime = Field(default=datetime.now)

# Marketplace ORM
class MarketplaceORM(SQLModel, table=True):
    __tablename__ = "marketplaces"
    id: str = Field(primary_key=True)
    name: str
    description: Optional[str] = None
    commission_rate: float = 0.0
    payment_gateway: Optional[str] = None
    created_at: datetime = Field(default=datetime.now)
    updated_at: datetime = Field(default=datetime.now)

# Wishlist ORM
class WishlistORM(SQLModel, table=True):
    __tablename__ = "wishlists"
    id: str = Field(primary_key=True)
    user_id: str
    book_id: str
    added_at: datetime = Field(default=datetime.now)
    priority: Optional[int] = None  # 1 = high, 2 = medium, 3 = low

# Reading Progress ORM
class ReadingProgressORM(SQLModel, table=True):
    __tablename__ = "reading_progress"
    id: str = Field(primary_key=True)
    user_id: str
    book_id: str
    current_page: int = 0
    total_pages: Optional[int] = None
    status: str = "reading"  # "reading", "completed", "paused"
    started_at: datetime = Field(default=datetime.now)
    completed_at: Optional[datetime] = None
    rating: Optional[int] = None
    review: Optional[str] = None
    updated_at: datetime = Field(default=datetime.now)

# Book-Library Relationship ORM
class BookLibraryORM(SQLModel, table=True):
    __tablename__ = "book_libraries"
    book_id: str = Field(primary_key=True, foreign_key="bookorm.id")
    library_id: str = Field(primary_key=True, foreign_key="libraries.id")
    added_at: datetime = Field(default=datetime.now)
    status: str = "available"
    location: Optional[str] = None  # Shelf location

# Book-Institution Relationship ORM
class BookInstitutionORM(SQLModel, table=True):
    __tablename__ = "book_institutions"
    book_id: str = Field(primary_key=True, foreign_key="bookorm.id")
    institution_id: str = Field(primary_key=True, foreign_key="institutions.id")
    added_at: datetime = Field(default=datetime.now)
    course_code: Optional[str] = None
    required: bool = False

# Book-CorporateClub Relationship ORM
class BookCorporateClubORM(SQLModel, table=True):
    __tablename__ = "book_corporate_clubs"
    book_id: str = Field(primary_key=True, foreign_key="bookorm.id")
    corporate_club_id: str = Field(primary_key=True, foreign_key="corporate_clubs.id")
    added_at: datetime = Field(default=datetime.now)
    recommended_by: Optional[str] = None

# Book-CommunityGroup Relationship ORM
class BookCommunityGroupORM(SQLModel, table=True):
    __tablename__ = "book_community_groups"
    book_id: str = Field(primary_key=True, foreign_key="bookorm.id")
    community_group_id: str = Field(primary_key=True, foreign_key="community_groups.id")
    added_at: datetime = Field(default=datetime.now)
    discussion_topic: Optional[str] = None

# Book-Marketplace Relationship ORM
class BookMarketplaceORM(SQLModel, table=True):
    __tablename__ = "book_marketplaces"
    book_id: str = Field(primary_key=True, foreign_key="bookorm.id")
    marketplace_id: str = Field(primary_key=True, foreign_key="marketplaces.id")
    listed_at: datetime = Field(default=datetime.now)
    price: float = 0.0
    condition: str = "new"  # "new", "used", "refurbished"
    quantity: int = 1
    sold_count: int = 0
