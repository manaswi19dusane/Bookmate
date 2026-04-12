from dataclasses import dataclass
from typing import Optional
from datetime import datetime

@dataclass
class CreateCorporateClub:
    name: str
    description: Optional[str]
    company_name: str
    is_public: bool
    created_by: str
    created_at: datetime
    updated_at: Optional[datetime]

@dataclass
class ListCorporateClubs:
    page: int = 1
    limit: int = 10

@dataclass
class GetCorporateClub:
    club_id: str

@dataclass
class UpdateCorporateClub:
    name: Optional[str] = None
    description: Optional[str] = None
    company_name: Optional[str] = None
    is_public: Optional[bool] = None
    updated_at: Optional[datetime] = None

@dataclass
class DeleteCorporateClub:
    club_id: str