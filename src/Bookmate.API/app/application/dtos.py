from pydantic import BaseModel
from typing import Optional
from datetime import date

class CreateBookDTO(BaseModel):
    title: str
    author: str
    published_date: Optional[date] = None
    image_url: Optional[str] = None
    purchased_date: Optional[date] = None

class BookDTO(BaseModel):
    id: str
    title: str
    author: str
    published_date: Optional[date] = None
    image_url: Optional[str] = None
    purchased_date: Optional[date] = None
