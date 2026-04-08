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


class UserPreferenceResponse(BaseModel):
    id: str
    genre: str
    author: str
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
