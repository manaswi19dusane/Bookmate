import { useEffect, useState } from "react";

import { booksApi, googleBooksApi, wishlistApi, type GoogleBook } from "../services/api";

const CATEGORIES = ["All", "Motivation", "Life Lessons", "Fiction", "Science", "History", "Technology"];
const QUICK_QUERIES = ["popular books", "self improvement", "modern fiction", "technology leadership"];

function normalizePublishedDate(value?: string | null) {
  if (!value) {
    return null;
  }
  const trimmed = value.trim();
  if (/^\d{4}-\d{2}-\d{2}$/.test(trimmed)) {
    return trimmed;
  }
  return null;
}

function getAmazonUrl(book: GoogleBook) {
  if (book.amazon_url?.trim()) {
    return book.amazon_url;
  }
  const query = encodeURIComponent(`${book.title} ${book.authors[0] || ""}`.trim());
  return `https://www.amazon.in/s?k=${query}`;
}

export default function Recommendations() {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("All");
  const [results, setResults] = useState<GoogleBook[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [addedIds, setAddedIds] = useState<Set<string>>(new Set());
  const [wishlistedIds, setWishlistedIds] = useState<Set<string>>(new Set());
  const [feedback, setFeedback] = useState("");

  async function runSearch(nextQuery: string, nextCategory: string) {
    setLoading(true);
    setError("");
    setFeedback("");
    try {
      const books = await googleBooksApi.search(
        nextQuery.trim() || undefined,
        nextCategory !== "All" ? nextCategory : undefined,
      );
      setResults(books);
      if (books.length === 0) {
        setError("No books found. Try another topic, author, or category.");
      }
    } catch {
      setError("Failed to fetch recommendations. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void runSearch("popular books", "All");
  }, []);

  async function handleSearch(event: React.FormEvent) {
    event.preventDefault();
    await runSearch(query, category);
  }

  async function handleAddToMyBooks(book: GoogleBook) {
    try {
      await booksApi.create({
        title: book.title,
        author: book.authors[0] || "Unknown",
        language: "English",
        image_url: book.thumbnail,
        published_date: normalizePublishedDate(book.published_date),
      });
      setAddedIds((prev) => new Set([...prev, book.google_id]));
      setFeedback(`"${book.title}" was added to your books.`);
    } catch {
      setFeedback("Failed to add the book. It may already exist.");
    }
  }

  async function handleAddToWishlist(book: GoogleBook) {
    try {
      await wishlistApi.add({
        book_name: book.title,
        author: book.authors[0] || "Unknown",
        image: book.thumbnail,
        description: book.description,
        google_id: book.google_id,
        amazon_url: getAmazonUrl(book),
      });
      setWishlistedIds((prev) => new Set([...prev, book.google_id]));
      setFeedback(`"${book.title}" was added to your wishlist.`);
    } catch {
      setFeedback("That book is already in your wishlist.");
    }
  }

  return (
    <section className="page-shell">
      <div className="section-heading">
        <p className="page-eyebrow">Discover</p>
        <h1>AI Book Recommendations</h1>
        <p>Browse live Google Books suggestions, then save the ones you want in your catalog or wishlist.</p>
      </div>

      <form className="inline-form" onSubmit={handleSearch}>
        <label>
          Search
          <input
            type="text"
            placeholder="Try an author, topic, or mood..."
            value={query}
            onChange={(event) => setQuery(event.target.value)}
          />
        </label>
        <label>
          Category
          <select value={category} onChange={(event) => setCategory(event.target.value)}>
            {CATEGORIES.map((value) => (
              <option key={value} value={value}>
                {value}
              </option>
            ))}
          </select>
        </label>
        <button type="submit" className="primary-button">
          {loading ? "Searching..." : "Search"}
        </button>
      </form>

      <div className="toolbar">
        <div>
          <p className="toolbar-label">Quick prompts</p>
          <div className="toolbar-tabs">
            {QUICK_QUERIES.map((quickQuery) => (
              <button
                key={quickQuery}
                type="button"
                className="tab-button"
                onClick={() => {
                  setQuery(quickQuery);
                  void runSearch(quickQuery, category);
                }}
              >
                {quickQuery}
              </button>
            ))}
          </div>
        </div>
        <div className="toolbar-meta">
          <p className="toolbar-label">Visible suggestions</p>
          <strong>{results.length}</strong>
        </div>
      </div>

      {feedback ? <p className="page-status">{feedback}</p> : null}
      {error ? <p className="form-error">{error}</p> : null}

      {results.length > 0 ? (
        <div className="card-grid">
          {results.map((book) => (
            <article key={book.google_id} className="stack-card recommendation-card">
              {book.thumbnail ? <img src={book.thumbnail} alt={book.title} className="lending-book-cover" /> : null}
              <div className="recommendation-copy">
                <h3>{book.title}</h3>
                <p>{book.authors.join(", ")}</p>
                {book.description ? <small>{book.description}</small> : null}
              </div>
              <div className="hero-actions">
                <a
                  href={getAmazonUrl(book)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="secondary-button"
                >
                  Buy on Amazon
                </a>
                <button
                  type="button"
                  className="secondary-button"
                  disabled={wishlistedIds.has(book.google_id)}
                  onClick={() => handleAddToWishlist(book)}
                >
                  {wishlistedIds.has(book.google_id) ? "Wishlisted" : "Wishlist"}
                </button>
                <button
                  type="button"
                  className="primary-button"
                  disabled={addedIds.has(book.google_id)}
                  onClick={() => handleAddToMyBooks(book)}
                >
                  {addedIds.has(book.google_id) ? "Added" : "Add to my books"}
                </button>
              </div>
            </article>
          ))}
        </div>
      ) : null}

      {!loading && results.length === 0 && !error ? (
        <div className="empty-panel">
          <h3>Search for books above</h3>
          <p>Try a topic, a favorite author, or just use one of the quick prompts to get started.</p>
        </div>
      ) : null}
    </section>
  );
}
