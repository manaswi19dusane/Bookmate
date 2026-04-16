from __future__ import annotations

from dataclasses import dataclass
import json
from typing import Any
from urllib.error import HTTPError, URLError
from urllib.parse import quote_plus
from urllib.request import urlopen

from app.config import settings


@dataclass(frozen=True)
class MoodProfile:
    search_terms: list[str]
    keywords: list[str]
    fallback_books: list[dict[str, Any]]


MOOD_PROFILES: dict[str, MoodProfile] = {
    "motivation": MoodProfile(
        search_terms=[
            "subject:self-help productivity habits motivation",
            "subject:personal development success mindset",
            "motivation resilience goal setting",
        ],
        keywords=["motivation", "discipline", "habits", "growth", "mindset", "success", "productivity"],
        fallback_books=[
            {"title": "Atomic Habits", "authors": ["James Clear"], "description": "Small habits and practical systems that compound into big life changes.", "categories": ["Motivation", "Self-Help"]},
            {"title": "The Mountain Is You", "authors": ["Brianna Wiest"], "description": "A reflective guide to self-sabotage, healing, and meaningful personal growth.", "categories": ["Motivation", "Life Lessons"]},
            {"title": "Can't Hurt Me", "authors": ["David Goggins"], "description": "High-intensity inspiration on discipline, grit, and breaking your own limits.", "categories": ["Motivation"]},
        ],
    ),
    "life lessons": MoodProfile(
        search_terms=[
            'subject:biography memoir philosophy "life lessons"',
            'subject:self-help emotional intelligence relationships wisdom',
            '"meaning of life" resilience memoir',
        ],
        keywords=["wisdom", "meaning", "life", "lessons", "relationships", "memoir", "reflection"],
        fallback_books=[
            {"title": "Tuesdays with Morrie", "authors": ["Mitch Albom"], "description": "Gentle, memorable lessons on work, love, aging, and what really matters.", "categories": ["Life Lessons", "Memoir"]},
            {"title": "Man's Search for Meaning", "authors": ["Viktor E. Frankl"], "description": "A classic on purpose, suffering, and the search for meaning under pressure.", "categories": ["Life Lessons", "Philosophy"]},
            {"title": "The Last Lecture", "authors": ["Randy Pausch"], "description": "A warm and practical set of life lessons shared with urgency and optimism.", "categories": ["Life Lessons"]},
        ],
    ),
    "fiction": MoodProfile(
        search_terms=[
            "subject:fiction bestselling novels",
            "subject:literary fiction adventure imagination",
            "fiction emotional page-turner novel",
        ],
        keywords=["fiction", "novel", "story", "character", "adventure", "mystery", "imaginative"],
        fallback_books=[
            {"title": "The Midnight Library", "authors": ["Matt Haig"], "description": "A thoughtful what-if novel about regret, possibility, and alternate lives.", "categories": ["Fiction"]},
            {"title": "The Alchemist", "authors": ["Paulo Coelho"], "description": "A symbolic novel about destiny, courage, and pursuing a personal legend.", "categories": ["Fiction", "Adventure"]},
            {"title": "A Man Called Ove", "authors": ["Fredrik Backman"], "description": "Character-driven fiction balancing humor, grief, and human connection.", "categories": ["Fiction"]},
        ],
    ),
}


@dataclass
class GoogleBookItem:
    external_id: str
    title: str
    authors: list[str]
    thumbnail: str | None
    description: str | None
    published_date: str | None
    language: str | None
    isbn: str | None
    categories: list[str]


class GoogleBooksService:
    base_url = "https://www.googleapis.com/books/v1/volumes?q="

    def search(self, *, query: str | None = None, category: str | None = None, limit: int = 12) -> list[GoogleBookItem]:
        normalized_category = (category or "motivation").strip().lower()
        profile = MOOD_PROFILES.get(normalized_category, MOOD_PROFILES["motivation"])
        query_parts = self._build_queries(query=query, profile=profile)

        deduped: dict[str, GoogleBookItem] = {}
        for search_query in query_parts:
            try:
                items = self._fetch_google_books(search_query, per_query_limit=6)
            except (HTTPError, URLError, TimeoutError):
                continue

            for item in items:
                key = (item.isbn or item.title).lower()
                if key not in deduped:
                    deduped[key] = item
            if len(deduped) >= limit:
                break

        items = list(deduped.values())
        if not items:
            items = self._fallback_books(normalized_category, query)

        return self._score_and_sort(items, profile=profile, query=query, limit=limit)

    def lookup_isbn(self, isbn: str) -> GoogleBookItem | None:
        normalized = "".join(char for char in isbn if char.isdigit() or char.upper() == "X")
        if not normalized:
            return None

        try:
            items = self._fetch_google_books(f"isbn:{normalized}", per_query_limit=1)
        except (HTTPError, URLError, TimeoutError):
            items = []

        if items:
            return items[0]

        for profile in MOOD_PROFILES.values():
            for index, fallback in enumerate(profile.fallback_books):
                if fallback.get("isbn") == normalized:
                    return self._build_fallback_item(fallback, f"fallback-isbn-{index}")
        return None

    def _build_queries(self, *, query: str | None, profile: MoodProfile) -> list[str]:
        cleaned_query = (query or "").strip()
        queries: list[str] = []
        if cleaned_query:
            queries.extend(
                [
                    f'{cleaned_query} {" ".join(profile.keywords[:3])}',
                    f'intitle:{cleaned_query} {" ".join(profile.keywords[3:5])}',
                    cleaned_query,
                ]
            )
        queries.extend(profile.search_terms)
        seen: set[str] = set()
        return [item for item in queries if item and not (item in seen or seen.add(item))]

    def _fetch_google_books(self, search_query: str, per_query_limit: int) -> list[GoogleBookItem]:
        api_key_suffix = f"&key={settings.GOOGLE_BOOKS_API_KEY}" if settings.GOOGLE_BOOKS_API_KEY else ""
        url = f"{self.base_url}{quote_plus(search_query)}&maxResults={per_query_limit}&printType=books{api_key_suffix}"
        with urlopen(url, timeout=20) as response:
            payload = json.loads(response.read().decode("utf-8"))
        return self._parse_items(payload)

    def _fallback_books(self, category: str, query: str | None) -> list[GoogleBookItem]:
        profile = MOOD_PROFILES.get(category, MOOD_PROFILES["motivation"])
        items = [
            self._build_fallback_item(book, f"fallback-{category}-{index}")
            for index, book in enumerate(profile.fallback_books)
        ]
        if query:
            query_tokens = query.lower().split()
            filtered = [
                item for item in items
                if any(token in f"{item.title} {' '.join(item.authors)} {(item.description or '')}".lower() for token in query_tokens)
            ]
            if filtered:
                return filtered
        return items

    def _build_fallback_item(self, payload: dict[str, Any], external_id: str) -> GoogleBookItem:
        return GoogleBookItem(
            external_id=external_id,
            title=payload.get("title", "Untitled"),
            authors=payload.get("authors", ["Unknown author"]),
            thumbnail=payload.get("thumbnail"),
            description=payload.get("description"),
            published_date=payload.get("published_date"),
            language=payload.get("language", "en"),
            isbn=payload.get("isbn"),
            categories=payload.get("categories", []),
        )

    def _score_and_sort(self, items: list[GoogleBookItem], *, profile: MoodProfile, query: str | None, limit: int) -> list[GoogleBookItem]:
        query_tokens = (query or "").lower().split()

        def score(item: GoogleBookItem) -> int:
            haystack = " ".join(
                [
                    item.title,
                    " ".join(item.authors),
                    item.description or "",
                    " ".join(item.categories),
                ]
            ).lower()
            mood_hits = sum(1 for keyword in profile.keywords if keyword in haystack)
            query_hits = sum(3 for token in query_tokens if token in haystack)
            category_bonus = sum(2 for category_name in item.categories if category_name.lower() in haystack)
            return mood_hits + query_hits + category_bonus

        return sorted(items, key=score, reverse=True)[:limit]

    def _parse_items(self, payload: dict[str, Any]) -> list[GoogleBookItem]:
        items: list[GoogleBookItem] = []
        for raw_item in payload.get("items", []):
            volume_info = raw_item.get("volumeInfo", {})
            industry_ids = volume_info.get("industryIdentifiers", [])
            isbn = next(
                (
                    identifier.get("identifier")
                    for identifier in industry_ids
                    if identifier.get("type") in {"ISBN_13", "ISBN_10"}
                ),
                None,
            )
            image_links = volume_info.get("imageLinks", {})
            items.append(
                GoogleBookItem(
                    external_id=raw_item.get("id", ""),
                    title=volume_info.get("title", "Untitled"),
                    authors=volume_info.get("authors", ["Unknown author"]),
                    thumbnail=image_links.get("thumbnail") or image_links.get("smallThumbnail"),
                    description=volume_info.get("description"),
                    published_date=volume_info.get("publishedDate"),
                    language=volume_info.get("language"),
                    isbn=isbn,
                    categories=volume_info.get("categories", []),
                )
            )
        return items
