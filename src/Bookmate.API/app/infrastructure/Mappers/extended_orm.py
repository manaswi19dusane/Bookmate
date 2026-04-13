from sqlmodel import SQLModel, Field, Index
from datetime import datetime
from typing import Optional


class LibraryORM(SQLModel, table=True):
    __tablename__ = "library"
    
    id: str = Field(primary_key=True, index=True)
    user_id: str = Field(index=True)
    book_id: str = Field(index=True)
    added_at: datetime = Field(default_factory=datetime.utcnow)
    status: str
    progress: Optional[int] = Field(default=None)
    notes: Optional[str] = Field(default=None)
    
    __table_args__ = (
        Index("idx_library_user_book", "user_id", "book_id", unique=True),
    )


class InstitutionORM(SQLModel, table=True):
    __tablename__ = "institution"
    
    id: str = Field(primary_key=True, index=True)
    name: str = Field(index=True)
    type: str
    address: Optional[str] = Field(default=None)
    website: Optional[str] = Field(default=None)
    contact_email: Optional[str] = Field(default=None)
    created_at: datetime = Field(default_factory=datetime.utcnow)
    is_verified: bool = Field(default=False)


class CorporateClubORM(SQLModel, table=True):
    __tablename__ = "corporate_club"
    
    id: str = Field(primary_key=True, index=True)
    name: str = Field(index=True)
    organization_name: str
    admin_user_id: str = Field(index=True)
    description: Optional[str] = Field(default=None)
    max_members: Optional[int] = Field(default=None)
    created_at: datetime = Field(default_factory=datetime.utcnow)
    is_active: bool = Field(default=True)


class CommunityGroupORM(SQLModel, table=True):
    __tablename__ = "community_group"
    
    id: str = Field(primary_key=True, index=True)
    name: str = Field(index=True)
    creator_user_id: str = Field(index=True)
    topic: str
    description: Optional[str] = Field(default=None)
    created_at: datetime = Field(default_factory=datetime.utcnow)
    is_public: bool = Field(default=True)


class MarketplaceORM(SQLModel, table=True):
    __tablename__ = "marketplace"
    
    id: str = Field(primary_key=True, index=True)
    book_id: str = Field(index=True)
    seller_user_id: str = Field(index=True)
    price: float
    condition: str
    description: Optional[str] = Field(default=None)
    listed_at: datetime = Field(default_factory=datetime.utcnow)
    is_available: bool = Field(default=True)
    buyer_user_id: Optional[str] = Field(default=None, index=True)
    sold_at: Optional[datetime] = Field(default=None)
    
    __table_args__ = (
        Index("idx_marketplace_available", "is_available", "listed_at"),
    )