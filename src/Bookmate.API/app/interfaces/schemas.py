from pydantic import BaseModel, ConfigDict
from typing import Optional
from datetime import date, datetime

class CreateBookRequest(BaseModel):
    title: str
    author: str
    language: str
    published_date: Optional[date] = None
    image_url: Optional[str] = None
    description: Optional[str] = None
    isbn: Optional[str] = None
    source: Optional[str] = None
    purchased_date: Optional[date] = None

class BookResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: str
    title: str
    author: str
    language: str
    published_date: Optional[date] = None
    image_url: Optional[str] = None
    description: Optional[str] = None
    isbn: Optional[str] = None
    source: Optional[str] = None
    purchased_date: Optional[date] = None
    owner_id: Optional[str] = None

class UpdateBookRequest(BaseModel):
    title: Optional[str] = None
    author: Optional[str] = None
    language: Optional[str] = None
    description: Optional[str] = None
    image_url: Optional[str] = None
    isbn: Optional[str] = None
    source: Optional[str] = None
    published_date: Optional[date] = None
    purchased_date: Optional[date] = None


class RegisterRequest(BaseModel):
    email: str
    password: str


class LoginRequest(BaseModel):
    email: str
    password: str


class UserResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)
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
    model_config = ConfigDict(from_attributes=True)
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
    model_config = ConfigDict(from_attributes=True)
    id: str
    book_id: str
    interaction_type: str
    rating: Optional[int] = None
    created_at: datetime


class InstitutionCreate(BaseModel):
    name: str
    type: str
    address: Optional[str] = None
    website: Optional[str] = None
    contact_email: Optional[str] = None
    is_verified: bool = False


class InstitutionUpdate(BaseModel):
    name: Optional[str] = None
    type: Optional[str] = None
    address: Optional[str] = None
    website: Optional[str] = None
    contact_email: Optional[str] = None
    is_verified: Optional[bool] = None


class InstitutionResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: str
    name: str
    type: str
    address: Optional[str] = None
    website: Optional[str] = None
    contact_email: Optional[str] = None
    created_at: datetime
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
    model_config = ConfigDict(from_attributes=True)
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
    model_config = ConfigDict(from_attributes=True)
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
    model_config = ConfigDict(from_attributes=True)
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
    model_config = ConfigDict(from_attributes=True)
    id: str
    user_id: str
    book_id: str
    added_at: datetime
    status: str
    progress: Optional[int] = None
    notes: Optional[str] = None


class LendBookRequest(BaseModel):
    friend_name: str
    friend_email: str
    due_date: date


class LentBookResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: str
    book_id: str
    book_name: str
    owner_id: str
    friend_name: str
    friend_email: str
    lend_date: datetime
    due_date: date
    status: str
    reminder_stage: Optional[str] = None
    returned_at: Optional[datetime] = None


class GoogleBookResponse(BaseModel):
    external_id: str
    title: str
    authors: list[str]
    thumbnail: Optional[str] = None
    description: Optional[str] = None
    published_date: Optional[str] = None
    language: Optional[str] = None
    isbn: Optional[str] = None
    categories: list[str] = []


class WishlistCreateRequest(BaseModel):
    book_name: str
    author: str
    image: Optional[str] = None


class WishlistResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: str
    user_id: str
    book_name: str
    author: str
    image: Optional[str] = None
    created_at: datetime
