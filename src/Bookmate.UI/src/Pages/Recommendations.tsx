import { useEffect, useMemo, useState } from "react";
import {
  booksApi,
  discoverApi,
  interactionsApi,
  preferencesApi,
  wishlistApi,
  type Book,
  type GoogleBook,
  type RankedGoogleBook,
  type UserInteraction,
  type UserPreference,
} from "../services/api";
import { useAuth } from "../context/AuthContext";
import "../css/recommendations.css";

type Category = "Motivation" | "Life Lessons" | "Fiction";

const categories: Category[] = ["Motivation", "Life Lessons", "Fiction"];

function getAmazonUrl(title: string) {
  return `https://www.amazon.com/s?k=${encodeURIComponent(title)}`;
}

export default function Recommendations() {
  const { token } = useAuth();
  const [query, setQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<Category>("Motivation");
  const [books, setBooks] = useState<GoogleBook[]>([]);
  const [preferences, setPreferences] = useState<UserPreference[]>([]);
  const [interactions, setInteractions] = useState<UserInteraction[]>([]);
  const [ownedBooks, setOwnedBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState(true);
  const [busyBookId, setBusyBookId] = useState("");
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (!token) return;
    Promise.allSettled([
      preferencesApi.list(token),
      interactionsApi.list(token),
      booksApi.listMine(token),
    ]).then(([prefResult, interactionResult, ownedResult]) => {
      setPreferences(prefResult.status === "fulfilled" ? prefResult.value : []);
      setInteractions(interactionResult.status === "fulfilled" ? interactionResult.value : []);
      setOwnedBooks(ownedResult.status === "fulfilled" ? ownedResult.value : []);
    });
  }, [token]);

  async function loadRecommendations(activeQuery = query, activeCategory = selectedCategory) {
    setLoading(true);
    setError("");
    try {
      const results = await discoverApi.search({
        query: activeQuery,
        category: activeCategory,
      });
      setBooks(results);
    } catch (err) {
      setError((err as Error).message || "Unable to load recommendations.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void loadRecommendations();
  }, [selectedCategory]);

  async function handleSearch(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    await loadRecommendations();
  }

  async function addToMyBooks(book: GoogleBook) {
    if (!token) return;
    setBusyBookId(book.external_id);
    setMessage("");
    setError("");
    try {
      await booksApi.create(
        {
          title: book.title,
          author: book.authors.join(", "),
          language: book.language || "en",
          published_date: book.published_date || null,
          image_url: book.thumbnail || null,
          description: book.description || null,
          isbn: book.isbn || null,
          source: "google_books",
        },
        token
      );
      setMessage(`Added "${book.title}" to My Books.`);
    } catch (err) {
      setError((err as Error).message || "Unable to add this book.");
    } finally {
      setBusyBookId("");
    }
  }

  async function addToWishlist(book: GoogleBook) {
    if (!token) return;
    setBusyBookId(book.external_id);
    setMessage("");
    setError("");
    try {
      await wishlistApi.create(token, {
        book_name: book.title,
        author: book.authors.join(", "),
        image: book.thumbnail || null,
      });
      setMessage(`Saved "${book.title}" to Wishlist.`);
    } catch (err) {
      setError((err as Error).message || "Unable to add this book to your wishlist.");
    } finally {
      setBusyBookId("");
    }
  }

  const rankedBooks = useMemo(() => {
    const categorySignals: Record<Category, string[]> = {
      Motivation: ["motivation", "habits", "discipline", "growth", "mindset", "success"],
      "Life Lessons": ["life", "meaning", "wisdom", "memoir", "relationships", "reflection"],
      Fiction: ["fiction", "novel", "story", "character", "adventure", "mystery"],
    };

    const preferenceTokens = preferences.flatMap((preference) =>
      `${preference.genre} ${preference.author}`.toLowerCase().split(/\s+/).filter(Boolean)
    );
    const engagedBookIds = new Set(interactions.filter((item) => item.interaction_type !== "view").map((item) => item.book_id));
    const engagedBooks = ownedBooks.filter((book) => engagedBookIds.has(book.id));
    const ownedAuthorTokens = engagedBooks.flatMap((book) => book.author.toLowerCase().split(/\s*,\s*|\s+/).filter(Boolean));
    const queryTokens = query.toLowerCase().split(/\s+/).filter(Boolean);
    const moodTokens = categorySignals[selectedCategory];

    return books
      .map((book): RankedGoogleBook => {
        const searchable = `${book.title} ${book.authors.join(" ")} ${book.description || ""} ${book.categories.join(" ")}`.toLowerCase();
        const moodScore = moodTokens.reduce((acc, token) => acc + (searchable.includes(token) ? 14 : 0), 0);
        const preferenceScore = preferenceTokens.reduce((acc, token) => acc + (searchable.includes(token) ? 10 : 0), 0);
        const authorScore = ownedAuthorTokens.reduce((acc, token) => acc + (searchable.includes(token) ? 7 : 0), 0);
        const queryScore = queryTokens.reduce((acc, token) => acc + (searchable.includes(token) ? 16 : 0), 0);
        const totalScore = 40 + moodScore + preferenceScore + authorScore + queryScore;

        let recommendationReason = `Trending ${selectedCategory.toLowerCase()} pick with strong ${selectedCategory.toLowerCase()} signals.`;
        if (queryTokens.some((token) => searchable.includes(token))) {
          recommendationReason = `Because it matches your current search for "${query}".`;
        } else if (preferenceTokens.some((token) => searchable.includes(token))) {
          recommendationReason = "Because it aligns with the authors or genres in your saved preferences.";
        } else if (ownedAuthorTokens.some((token) => searchable.includes(token))) {
          recommendationReason = "Because it feels close to books you already engaged with, similar to streaming recommendations.";
        }

        return {
          ...book,
          match_score: Math.min(99, totalScore),
          recommendation_reason: recommendationReason,
        };
      })
      .sort((left, right) => right.match_score - left.match_score);
  }, [books, interactions, ownedBooks, preferences, query, selectedCategory]);

  return (
    <section className="page-shell ai-recommendations-page">
      <div className="recommendations-shell">
        <form className="recommendations-topbar" onSubmit={handleSearch}>
          <label className="recommendations-search">
            <span>Search</span>
            <input
              type="search"
              placeholder="Search books, authors, or themes"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
            />
          </label>

          <label className="recommendations-dropdown">
            <span>Category</span>
            <select
              value={selectedCategory}
              onChange={(event) => setSelectedCategory(event.target.value as Category)}
            >
              {categories.map((category) => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>
          </label>

          <button type="submit" className="primary-button recommendation-submit">
            Search Google Books
          </button>
        </form>

        <div className="recommendations-header">
          <div>
            <p className="page-eyebrow">Smart shelf</p>
            <h1>AI Book Recommendations</h1>
            <p>
              Dynamic recommendations now come from Google Books, so you are no longer limited to books already stored in the platform.
            </p>
          </div>
          <span className="recommendations-meta">{rankedBooks.length} picks</span>
        </div>

        <div className="recommendations-tabs" role="tablist" aria-label="Recommendation categories">
          {categories.map((category) => (
            <button
              key={category}
              type="button"
              className={category === selectedCategory ? "recommendation-tab active" : "recommendation-tab"}
              onClick={() => setSelectedCategory(category)}
            >
              {category}
            </button>
          ))}
        </div>

        {message ? <p className="page-status">{message}</p> : null}
        {error ? <p className="form-error">{error}</p> : null}

        <div className="recommendation-stack">
          {loading ? (
            <p className="page-status">Loading live recommendations...</p>
          ) : rankedBooks.length === 0 ? (
            <div className="empty-panel">
              <h3>No recommendations found</h3>
              <p>Try another search term or switch to a different category.</p>
            </div>
          ) : (
            rankedBooks.map((book) => (
              <article key={book.external_id} className="recommendation-card">
                <div className="recommendation-cover-wrap">
                  {book.thumbnail ? (
                    <img src={book.thumbnail} alt={`${book.title} cover`} className="recommendation-cover" />
                  ) : (
                    <div className="recommendation-cover recommendation-cover-fallback">{book.title.slice(0, 1)}</div>
                  )}
                </div>

                <div className="recommendation-body">
                  <div className="recommendation-badges">
                    <span className="ai-badge">Google Books</span>
                    <span className="category-badge">{selectedCategory}</span>
                    <span className="category-badge">{book.match_score}% match</span>
                  </div>
                  <h2>{book.title}</h2>
                  <p className="recommendation-description">
                    {book.description || "No description provided by Google Books for this title."}
                  </p>
                  <p className="recommendation-author">by {book.authors.join(", ")}</p>
                  <p className="recommendation-reason">{book.recommendation_reason}</p>
                </div>

                <div className="recommendation-actions">
                  <a href={getAmazonUrl(book.title)} target="_blank" rel="noreferrer" className="amazon-button">
                    Buy on Amazon
                  </a>
                  <button
                    type="button"
                    className="secondary-button"
                    disabled={busyBookId === book.external_id}
                    onClick={() => addToWishlist(book)}
                  >
                    Add to Wishlist
                  </button>
                  <button
                    type="button"
                    className="primary-button"
                    disabled={busyBookId === book.external_id}
                    onClick={() => addToMyBooks(book)}
                  >
                    {busyBookId === book.external_id ? "Saving..." : "Add to My Books"}
                  </button>
                </div>
              </article>
            ))
          )}
        </div>
      </div>
    </section>
  );
}
