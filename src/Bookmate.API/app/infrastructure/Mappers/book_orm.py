from typing import Optional
from sqlmodel import SQLModel, Field
from datetime import date

class BookORM(SQLModel, table=True):
    id: str = Field(primary_key=True)
    owner_user_id: Optional[str] = Field(default=None, index=True, foreign_key="userorm.id")
    title: str
    author: str
    language: str
    published_date: Optional[date] = None
    image_url: Optional[str] = None
    purchased_date: Optional[date] = None
