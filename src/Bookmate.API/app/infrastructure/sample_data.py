from datetime import datetime
from typing import List, Dict, Any
from sqlalchemy import select, func
from sqlalchemy.orm import Session
from app.domain.models import (
    Book, CorporateClub, CommunityGroup,
    MarketplaceItem, UserPreference, UserInteraction
)
from app.domain.models_user import User as UserDomain
from app.domain.extended_models import Institution
from app.infrastructure.Mappers.book_orm import BookORM
from app.infrastructure.Mappers.user_orm import UserORM
from app.infrastructure.Mappers.extended_orm import (
    InstitutionORM, CorporateClubORM, CommunityGroupORM,
    MarketplaceItemORM, UserPreferenceORM, UserInteractionORM
)

# Sample Books Data
SAMPLE_BOOKS = [
    {
        "title": "The Great Gatsby",
        "author": "F. Scott Fitzgerald",
        "language": "English",
        "published_date": "1925-04-10",
        "description": "A novel about the American dream and its corruption.",
        "image_url": "https://example.com/gatsby.jpg",
        "status": "Owned"
    },
    {
        "title": "To Kill a Mockingbird",
        "author": "Harper Lee",
        "language": "English",
        "published_date": "1960-07-11",
        "description": "A novel about racial injustice in the Deep South.",
        "image_url": "https://example.com/mockingbird.jpg",
        "status": "Wishlist"
    },
    {
        "title": "1984",
        "author": "George Orwell",
        "language": "English",
        "published_date": "1949-06-08",
        "description": "A dystopian novel about totalitarianism.",
        "image_url": "https://example.com/1984.jpg",
        "status": "Owned"
    },
    {
        "title": "Pride and Prejudice",
        "author": "Jane Austen",
        "language": "English",
        "published_date": "1813-01-28",
        "description": "A romantic novel about love and marriage.",
        "image_url": "https://example.com/pride.jpg",
        "status": "Owned"
    },
    {
        "title": "The Catcher in the Rye",
        "author": "J.D. Salinger",
        "language": "English",
        "published_date": "1951-07-16",
        "description": "A novel about teenage rebellion and alienation.",
        "image_url": "https://example.com/rye.jpg",
        "status": "Wishlist"
    },
    {
        "title": "Moby-Dick",
        "author": "Herman Melville",
        "language": "English",
        "published_date": "1851-10-18",
        "description": "A novel about a sailor's obsessive quest for a whale.",
        "image_url": "https://example.com/moby.jpg",
        "status": "Owned"
    },
    {
        "title": "War and Peace",
        "author": "Leo Tolstoy",
        "language": "English",
        "published_date": "1869-01-01",
        "description": "An epic novel about Russian society during the Napoleonic era.",
        "image_url": "https://example.com/war.jpg",
        "status": "Owned"
    },
    {
        "title": "The Odyssey",
        "author": "Homer",
        "language": "English",
        "published_date": "-800-01-01",
        "description": "An ancient Greek epic poem about Odysseus's journey home.",
        "image_url": "https://example.com/odyssey.jpg",
        "status": "Wishlist"
    },
    {
        "title": "The Divine Comedy",
        "author": "Dante Alighieri",
        "language": "English",
        "published_date": "1320-01-01",
        "description": "An epic poem about the afterlife.",
        "image_url": "https://example.com/comedy.jpg",
        "status": "Owned"
    },
    {
        "title": "Don Quixote",
        "author": "Miguel de Cervantes",
        "language": "English",
        "published_date": "1605-01-01",
        "description": "A novel about a man who becomes a knight-errant.",
        "image_url": "https://example.com/quixote.jpg",
        "status": "Wishlist"
    },
    {
        "title": "The Brothers Karamazov",
        "author": "Fyodor Dostoevsky",
        "language": "English",
        "published_date": "1880-01-01",
        "description": "A novel about faith, doubt, and morality.",
        "image_url": "https://example.com/karamazov.jpg",
        "status": "Owned"
    },
    {
        "title": "The Iliad",
        "author": "Homer",
        "language": "English",
        "published_date": "-800-01-01",
        "description": "An ancient Greek epic poem about the Trojan War.",
        "image_url": "https://example.com/iliad.jpg",
        "status": "Owned"
    },
    {
        "title": "Madame Bovary",
        "author": "Gustave Flaubert",
        "language": "English",
        "published_date": "1857-01-01",
        "description": "A novel about a woman's romantic illusions.",
        "image_url": "https://example.com/bovary.jpg",
        "status": "Wishlist"
    },
    {
        "title": "The Adventures of Huckleberry Finn",
        "author": "Mark Twain",
        "language": "English",
        "published_date": "1884-12-10",
        "description": "A novel about a boy's journey down the Mississippi River.",
        "image_url": "https://example.com/huck.jpg",
        "status": "Owned"
    },
    {
        "title": "The Count of Monte Cristo",
        "author": "Alexandre Dumas",
        "language": "English",
        "published_date": "1844-01-01",
        "description": "A novel about revenge and redemption.",
        "image_url": "https://example.com/monte.jpg",
        "status": "Wishlist"
    }
]

# Sample Users Data
SAMPLE_USERS = [
    {
        "email": "john.doe@example.com",
        "password": "password123",
        "first_name": "John",
        "last_name": "Doe",
        "is_active": True
    },
    {
        "email": "jane.smith@example.com",
        "password": "password123",
        "first_name": "Jane",
        "last_name": "Smith",
        "is_active": True
    },
    {
        "email": "bob.jones@example.com",
        "password": "password123",
        "first_name": "Bob",
        "last_name": "Jones",
        "is_active": True
    },
    {
        "email": "alice.brown@example.com",
        "password": "password123",
        "first_name": "Alice",
        "last_name": "Brown",
        "is_active": True
    }
]

# Sample Institutions Data
SAMPLE_INSTITUTIONS = [
    {
        "name": "Harvard University",
        "type": "university",
        "description": "A prestigious Ivy League research university.",
        "location": "Cambridge, Massachusetts, USA"
    },
    {
        "name": "Stanford University",
        "type": "university",
        "description": "A leading research and teaching institution.",
        "location": "Stanford, California, USA"
    },
    {
        "name": "Massachusetts Institute of Technology",
        "type": "university",
        "description": "A world-renowned technical university.",
        "location": "Cambridge, Massachusetts, USA"
    },
    {
        "name": "Oxford University",
        "type": "university",
        "description": "A historic and prestigious university in England.",
        "location": "Oxford, England"
    },
    {
        "name": "Cambridge University",
        "type": "university",
        "description": "A historic and prestigious university in England.",
        "location": "Cambridge, England"
    }
]

# Sample Corporate Clubs Data
SAMPLE_CORPORATE_CLUBS = [
    {
        "name": "Tech Corp Book Club",
        "company_name": "Technology Company",
        "description": "A book club for technology professionals.",
        "industry": "Technology"
    },
    {
        "name": "Finance Readers",
        "company_name": "Financial Services",
        "description": "A book club for finance professionals.",
        "industry": "Finance"
    },
    {
        "name": "Healthcare Books",
        "company_name": "Healthcare Industry",
        "description": "A book club for healthcare professionals.",
        "industry": "Healthcare"
    },
    {
        "name": "Marketing Masters",
        "company_name": "Marketing Agency",
        "description": "A book club for marketing professionals.",
        "industry": "Marketing"
    },
    {
        "name": "Engineering Excellence",
        "company_name": "Engineering Firm",
        "description": "A book club for engineering professionals.",
        "industry": "Engineering"
    }
]

# Sample Community Groups Data
SAMPLE_COMMUNITY_GROUPS = [
    {
        "name": "Sci-Fi Enthusiasts",
        "category": "fiction",
        "description": "A community group for science fiction and fantasy lovers.",
        "tags": ["science fiction", "fantasy", "space"]
    },
    {
        "name": "Business Books",
        "category": "non-fiction",
        "description": "A community group for business and entrepreneurship books.",
        "tags": ["business", "entrepreneurship", "leadership"]
    },
    {
        "name": "Classic Literature",
        "category": "fiction",
        "description": "A community group for classic literature enthusiasts.",
        "tags": ["classics", "literature", "history"]
    },
    {
        "name": "Self-Improvement",
        "category": "non-fiction",
        "description": "A community group for self-help and personal development books.",
        "tags": ["self-help", "personal development", "motivation"]
    },
    {
        "name": "Mystery & Thriller",
        "category": "fiction",
        "description": "A community group for mystery and thriller book lovers.",
        "tags": ["mystery", "thriller", "crime"]
    }
]

# Sample Marketplace Items Data
SAMPLE_MARKETPLACE_ITEMS = [
    {
        "title": "The Great Gatsby",
        "author": "F. Scott Fitzgerald",
        "price": 12.99,
        "condition": "Good",
        "description": "A classic novel in good condition.",
        "image_url": "https://example.com/gatsby.jpg"
    },
    {
        "title": "To Kill a Mockingbird",
        "author": "Harper Lee",
        "price": 8.99,
        "condition": "Very Good",
        "description": "A classic novel in very good condition.",
        "image_url": "https://example.com/mockingbird.jpg"
    },
    {
        "title": "1984",
        "author": "George Orwell",
        "price": 10.99,
        "condition": "Good",
        "description": "A dystopian classic in good condition.",
        "image_url": "https://example.com/1984.jpg"
    },
    {
        "title": "Pride and Prejudice",
        "author": "Jane Austen",
        "price": 7.99,
        "condition": "Good",
        "description": "A romantic classic in good condition.",
        "image_url": "https://example.com/pride.jpg"
    },
    {
        "title": "The Catcher in the Rye",
        "author": "J.D. Salinger",
        "price": 9.99,
        "condition": "Very Good",
        "description": "A classic novel in very good condition.",
        "image_url": "https://example.com/rye.jpg"
    }
]

# Sample User Preferences Data
SAMPLE_PREFERENCES = [
    {
        "genre": "fiction",
        "author": "George Orwell"
    },
    {
        "genre": "non-fiction",
        "author": "Malcolm Gladwell"
    },
    {
        "genre": "science fiction",
        "author": "Isaac Asimov"
    },
    {
        "genre": "fantasy",
        "author": "J.R.R. Tolkien"
    },
    {
        "genre": "business",
        "author": "Simon Sinek"
    }
]

# Sample User Interactions Data
SAMPLE_INTERACTIONS = [
    {
        "interaction_type": "view",
        "rating": None
    },
    {
        "interaction_type": "like",
        "rating": None
    },
    {
        "interaction_type": "rating",
        "rating": 5
    },
    {
        "interaction_type": "view",
        "rating": None
    },
    {
        "interaction_type": "rating",
        "rating": 4
    }
]

def load_sample_data(db: Session):
    """Load sample data into the database if it's empty."""
    # Check if any books exist
    if db.execute(select(BookORM)).scalars().first():
        return  # Data already exists, skip loading

    # Load sample books
    for book_data in SAMPLE_BOOKS:
        book = BookORM(**book_data)
        db.add(book)

    # Load sample users
    for user_data in SAMPLE_USERS:
        user = UserORM(**user_data)
        db.add(user)

    # Load sample institutions
    for institution_data in SAMPLE_INSTITUTIONS:
        institution = InstitutionORM(**institution_data)
        db.add(institution)

    # Load sample corporate clubs
    for club_data in SAMPLE_CORPORATE_CLUBS:
        club = CorporateClubORM(**club_data)
        db.add(club)

    # Load sample community groups
    for group_data in SAMPLE_COMMUNITY_GROUPS:
        group = CommunityGroupORM(**group_data)
        db.add(group)

    # Load sample marketplace items
    for item_data in SAMPLE_MARKETPLACE_ITEMS:
        item = MarketplaceItemORM(**item_data)
        db.add(item)

    # Commit all changes
    db.commit()

    # Load sample preferences and interactions
    # Get the first user and book for relationships
    user = db.execute(select(UserORM)).scalars().first()
    book = db.execute(select(BookORM)).scalars().first()

    if user and book:
        for preference_data in SAMPLE_PREFERENCES:
            preference = UserPreference(
                user_id=user.id,
                **preference_data
            )
            db.add(preference)

        for interaction_data in SAMPLE_INTERACTIONS:
            interaction = UserInteraction(
                user_id=user.id,
                book_id=book.id,
                **interaction_data
            )
            db.add(interaction)

        db.commit()

def is_sample_data_loaded(db: Session) -> bool:
    """Check if sample data has been loaded."""
    return db.execute(select(func.count()).select_from(BookORM)).scalar() > 0

def clear_sample_data(db: Session):
    """Clear all sample data from the database."""
    # Delete all data in reverse order of dependencies
    db.query(UserInteractionORM).delete()
    db.query(UserPreferenceORM).delete()
    db.query(MarketplaceItemORM).delete()
    db.query(CommunityGroupORM).delete()
    db.query(CorporateClubORM).delete()
    db.query(InstitutionORM).delete()
    db.query(UserORM).delete()
    db.query(BookORM).delete()
    db.commit()
