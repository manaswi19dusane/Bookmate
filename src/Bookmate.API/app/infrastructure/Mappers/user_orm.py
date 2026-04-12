from typing import Optional
from datetime import datetime
from sqlmodel import SQLModel, Field


class UserORM(SQLModel, table=True):
    id: str = Field(primary_key=True)
    email: str = Field(index=True, sa_column_kwargs={"unique": True})
    password: str
    created_at: datetime


class UserPreferenceORM(SQLModel, table=True):
    id: str = Field(primary_key=True)
    user_id: str = Field(foreign_key="userorm.id", index=True)
    genre: str
    author: str
    created_at: datetime
    book_id: Optional[str] = None


class UserInteractionORM(SQLModel, table=True):
    id: str = Field(primary_key=True)
    user_id: str = Field(foreign_key="userorm.id", index=True)
    book_id: str
    interaction_type: str
    rating: Optional[int] = None
    created_at: datetime
