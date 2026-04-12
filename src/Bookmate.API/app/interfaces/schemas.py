from pydantic import BaseModel
from typing import Optional
from datetime import date, datetime

class CreateBookRequest(BaseModel):
    title: str
    author: str
    language: str
    published_date: Optional[date] = None
    image_url: Optional[str] = None
    purchased_date: Optional[date] = None

class BookResponse(BaseModel):
    id: str
    title: str
    author: str
    language: str
    published_date: Optional[date] = None
    image_url: Optional[str] = None
    purchased_date: Optional[date] = None

class UpdateBookRequest(BaseModel):
    title: Optional[str] = None
    author: Optional[str] = None
    language: Optional[str] = None
    description: Optional[str] = None
    image_url: Optional[str] = None
    published_date: Optional[date] = None
    purchased_date: Optional[date] = None


class RegisterRequest(BaseModel):
    email: str
    password: str


class LoginRequest(BaseModel):
    email: str
    password: str


class UserResponse(BaseModel):
    id: str
    email: str
    created_at: datetime


class AuthResponse(BaseModel):
    access_token: str
    token_type: str
    user: UserResponse


class UserPreferenceRequest(BaseModel):
    genre: str
    author: str
    book_id: Optional[str] = None


class UserPreferenceResponse(BaseModel):
    id: str
    genre: str
    author: str
    book_id: Optional[str] = None
    created_at: datetime


class UserInteractionRequest(BaseModel):
    book_id: str
    interaction_type: str
    rating: Optional[int] = None


class UserInteractionResponse(BaseModel):
    id: str
    book_id: str
    interaction_type: str
    rating: Optional[int] = None
    created_at: datetime


class InstitutionCreate(BaseModel):
    name: str
    type: str
    description: Optional[str] = None
    is_public: bool = True
    created_by: Optional[str] = None
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None


class InstitutionUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    type: Optional[str] = None
    is_public: Optional[bool] = None
    updated_at: Optional[datetime] = None


class InstitutionResponse(BaseModel):
    id: str
    name: str
    type: str
    description: Optional[str] = None
    is_public: bool
    created_by: Optional[str] = None
    created_at: datetime
    updated_at: Optional[datetime] = None
    is_verified: bool = False


class CorporateClubCreate(BaseModel):
    name: str
    organization_name: str
    admin_user_id: str
    description: Optional[str] = None
    max_members: Optional[int] = None
    is_active: bool = True


class CorporateClubUpdate(BaseModel):
    name: Optional[str] = None
    organization_name: Optional[str] = None
    description: Optional[str] = None
    max_members: Optional[int] = None
    is_active: Optional[bool] = None


class CorporateClubResponse(BaseModel):
    id: str
    name: str
    organization_name: str
    admin_user_id: str
    description: Optional[str] = None
    max_members: Optional[int] = None
    created_at: datetime
    is_active: bool


class CommunityGroupCreate(BaseModel):
    name: str
    creator_user_id: str
    topic: str
    description: Optional[str] = None
    is_public: bool = True


class CommunityGroupUpdate(BaseModel):
    name: Optional[str] = None
    topic: Optional[str] = None
    description: Optional[str] = None
    is_public: Optional[bool] = None


class CommunityGroupResponse(BaseModel):
    id: str
    name: str
    creator_user_id: str
    topic: str
    description: Optional[str] = None
    created_at: datetime
    is_public: bool


class MarketplaceCreate(BaseModel):
    book_id: str
    seller_user_id: str
    price: float
    condition: str
    description: Optional[str] = None


class MarketplaceUpdate(BaseModel):
    price: Optional[float] = None
    condition: Optional[str] = None
    description: Optional[str] = None
    is_available: Optional[bool] = None


class MarketplaceResponse(BaseModel):
    id: str
    book_id: str
    seller_user_id: str
    price: float
    condition: str
    description: Optional[str] = None
    listed_at: datetime
    is_available: bool
    buyer_user_id: Optional[str] = None
    sold_at: Optional[datetime] = None


class LibraryCreate(BaseModel):
    user_id: str
    book_id: str
    status: str
    progress: Optional[int] = None
    notes: Optional[str] = None


class LibraryUpdate(BaseModel):
    status: Optional[str] = None
    progress: Optional[int] = None
    notes: Optional[str] = None


class LibraryResponse(BaseModel):
    id: str
    user_id: str
    book_id: str
    added_at: datetime
    status: str
    progress: Optional[int] = None
    notes: Optional[str] = None
