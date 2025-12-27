from pydantic import BaseModel
from typing import Optional
from datetime import date

class CreateBookDTO(BaseModel):
    title: str
    author: str
    language: str
    published_date: Optional[date] = None
    image_url: Optional[str] = None
    purchased_date: Optional[date] = None

class BookDTO(BaseModel):
    id: str
    title: str
    author: str
    language: str
    published_date: Optional[date] = None
    image_url: Optional[str] = None
    purchased_date: Optional[date] = None

class UpdateBookDTO(BaseModel):    
    title: str
    author: str
    language: str
    published_date: Optional[date] = None
    image_url: Optional[str] = None
    purchased_date: Optional[date] = None

class PatchBookDTO(BaseModel):
    title: Optional[str] = None
    author: Optional[str] = None
    language: Optional[str] = None
    published_date: Optional[date] = None
    image_url: Optional[str] = None
    purchased_date: Optional[date] = None