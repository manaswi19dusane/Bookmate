from dataclasses import dataclass
from datetime import datetime
from typing import Optional, List
import uuid


@dataclass(frozen=True)
class EntityId:
    value: str

    @staticmethod
    def new() -> "EntityId":
        return EntityId(str(uuid.uuid4()))


@dataclass(frozen=True)
class LibraryId(EntityId):
    @staticmethod
    def new() -> "LibraryId":
        return LibraryId(str(uuid.uuid4()))


@dataclass(frozen=True)
class InstitutionId(EntityId):
    @staticmethod
    def new() -> "InstitutionId":
        return InstitutionId(str(uuid.uuid4()))


@dataclass(frozen=True)
class CorporateClubId(EntityId):
    @staticmethod
    def new() -> "CorporateClubId":
        return CorporateClubId(str(uuid.uuid4()))


@dataclass(frozen=True)
class CommunityGroupId(EntityId):
    @staticmethod
    def new() -> "CommunityGroupId":
        return CommunityGroupId(str(uuid.uuid4()))


@dataclass(frozen=True)
class MarketplaceId(EntityId):
    @staticmethod
    def new() -> "MarketplaceId":
        return MarketplaceId(str(uuid.uuid4()))


@dataclass
class Library:
    id: EntityId
    user_id: str
    book_id: str
    added_at: datetime
    status: str  # reading, completed, wishlist, archived
    progress: Optional[int] = None  # percentage 0-100
    notes: Optional[str] = None


@dataclass
class Institution:
    id: EntityId
    name: str
    type: str  # university, school, library, organization
    description: Optional[str] = None
    is_public: bool = True
    created_by: Optional[str] = None
    address: Optional[str] = None
    website: Optional[str] = None
    contact_email: Optional[str] = None
    created_at: datetime = datetime.utcnow()
    updated_at: Optional[datetime] = None
    is_verified: bool = False


@dataclass
class CorporateClub:
    id: EntityId
    name: str
    organization_name: str
    admin_user_id: str
    description: Optional[str] = None
    max_members: Optional[int] = None
    created_at: datetime = datetime.utcnow()
    is_active: bool = True


@dataclass
class CommunityGroup:
    id: EntityId
    name: str
    creator_user_id: str
    topic: str
    description: Optional[str] = None
    created_at: datetime = datetime.utcnow()
    is_public: bool = True


@dataclass
class Marketplace:
    id: EntityId
    book_id: str
    seller_user_id: str
    price: float
    condition: str  # new, like_new, good, fair
    description: Optional[str] = None
    listed_at: datetime = datetime.utcnow()
    is_available: bool = True
    buyer_user_id: Optional[str] = None
    sold_at: Optional[datetime] = None