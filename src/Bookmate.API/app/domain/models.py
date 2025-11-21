from dataclasses import dataclass
from datetime import date
from typing import Optional
import uuid

@dataclass(frozen=True)
class BookId:
    value: str

    @staticmethod
    def new() -> "BookId":
        return BookId(str(uuid.uuid4()))

@dataclass
class Book:
    id: BookId
    title: str
    author: str
    published_date: Optional[date] = None
    image_url: Optional[str] = None
    purchased_date: Optional[date] = None

    def update_title(self, new_title: str):
        if not new_title:
            raise ValueError("Title cannot be empty")
        self.title = new_title
