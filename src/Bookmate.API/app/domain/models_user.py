from dataclasses import dataclass
from datetime import datetime
import uuid
from typing import Optional


@dataclass(frozen=True)
class UserId:
    value: str

    @staticmethod
    def new() -> "UserId":
        return UserId(str(uuid.uuid4()))


@dataclass
class User:
    id: UserId
    email: str
    password: str
    created_at: datetime


@dataclass(frozen=True)
class UserPreferenceId:
    value: str

    @staticmethod
    def new() -> "UserPreferenceId":
        return UserPreferenceId(str(uuid.uuid4()))


@dataclass
class UserPreference:
    id: UserPreferenceId
    user_id: str
    genre: str
    author: str
    created_at: datetime


@dataclass(frozen=True)
class UserInteractionId:
    value: str

    @staticmethod
    def new() -> "UserInteractionId":
        return UserInteractionId(str(uuid.uuid4()))


@dataclass
class UserInteraction:
    id: UserInteractionId
    user_id: str
    book_id: str
    interaction_type: str
    rating: Optional[int]
    created_at: datetime