from typing import Optional
from sqlmodel import SQLModel, Field
from datetime import date

class BookORM(SQLModel, table=True):
    id: str = Field(primary_key=True)
    title: str
    author: str
    language: str
    published_date: Optional[date] = None
    image_url: Optional[str] = None
    purchased_date: Optional[date] = None