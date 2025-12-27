from pydantic import BaseModel
from typing import Optional
from datetime import date

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
