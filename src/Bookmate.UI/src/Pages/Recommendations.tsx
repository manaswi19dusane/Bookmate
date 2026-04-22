import { useState } from "react";
import { googleBooksApi, wishlistApi, booksApi, type GoogleBook } from "../services/api";

const CATEGORIES = ["All", "Motivation", "Life Lessons", "Fiction", "Science", "History", "Technology"];

export default function Recommendations() {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("All");
  const [results, setResults] = useState<GoogleBook[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [addedIds, setAddedIds] = useState<Set<string>>(new Set());
  const [wishlistedIds, setWishlistedIds] = useState<Set<string>>(new Set());
  const [feedback, setFeedback] = useState("");

  async function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    if (!query.trim()) return;
    setLoading(true);
    setError("");
    setFeedback("");
    try {
      const books = await googleBooksApi.search(query, category !== "All" ? category : undefined);
      setResults(books);
      if (books.length === 0) setError("No books found. Try a different search.");
    } catch {
      setError("Failed to fetch recommendations. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  async function handleAddToMyBooks(book: GoogleBook) {
    try {
      await booksApi.create({
        title: book.title,
        author: book.authors[0] || "Unknown",
        language: "English",
        image_url: book.thumbnail,
        published_date: book.published_date || null,
      });
      setAddedIds(prev => new Set([...prev, book.google_id]));
      setFeedback(`"${book.title}" added to your books!`);
    } catch {
      setFeedback("Failed to add book. It may already exist.");
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
        amazon_url: book.amazon_url,
      });
      setWishlistedIds(prev => new Set([...prev, book.google_id]));
      setFeedback(`"${book.title}" added to wishlist!`);
    } catch {
      setFeedback("Already in wishlist.");
    }
  }

  return (
    <section className="page-shell">
      <div className="section-heading">
        <p className="page-eyebrow">Discover</p>
        <h1>AI Book Recommendations</h1>
        <p>Search millions of books powered by Google Books API.</p>
      </div>

      {/* Search Form */}
      <form onSubmit={handleSearch} style={{ display: "flex", gap: "12px", flexWrap: "wrap", marginBottom: "24px" }}>
        <input
          type="text"
          placeholder="Search books, authors, topics..."
          value={query}
          onChange={e => setQuery(e.target.value)}
          style={{ flex: 1, minWidth: "200px", padding: "10px 14px", borderRadius: "8px", border: "1px solid #ccc", fontSize: "15px" }}
        />
        <select
          value={category}
          onChange={e => setCategory(e.target.value)}
          style={{ padding: "10px 14px", borderRadius: "8px", border: "1px solid #ccc", fontSize: "15px" }}
        >
          {CATEGORIES.map(c => <option key={c}>{c}</option>)}
        </select>
        <button
          type="submit"
          style={{ padding: "10px 24px", borderRadius: "8px", background: "#4f46e5", color: "#fff", border: "none", fontSize: "15px", cursor: "pointer" }}
        >
          {loading ? "Searching..." : "Search"}
        </button>
      </form>

      {feedback && <p style={{ color: "#16a34a", marginBottom: "12px", fontWeight: 600 }}>{feedback}</p>}
      {error && <p className="form-error">{error}</p>}

      {/* Results */}
      {results.length > 0 && (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: "20px" }}>
          {results.map(book => (
            <div key={book.google_id} style={{
              background: "#fff", borderRadius: "12px", boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
              overflow: "hidden", display: "flex", flexDirection: "column"
            }}>
              {book.thumbnail && (
                <img src={book.thumbnail} alt={book.title}
                  style={{ width: "100%", height: "180px", objectFit: "cover" }} />
              )}
              <div style={{ padding: "16px", flex: 1, display: "flex", flexDirection: "column", gap: "8px" }}>
                <h3 style={{ fontSize: "15px", fontWeight: 700, margin: 0, lineHeight: 1.3 }}>{book.title}</h3>
                <p style={{ fontSize: "13px", color: "#6b7280", margin: 0 }}>{book.authors.join(", ")}</p>
                {book.description && (
                  <p style={{ fontSize: "12px", color: "#9ca3af", margin: 0, lineHeight: 1.5,
                    display: "-webkit-box", WebkitLineClamp: 3, WebkitBoxOrient: "vertical", overflow: "hidden" }}>
                    {book.description}
                  </p>
                )}
                <div style={{ display: "flex", gap: "8px", flexWrap: "wrap", marginTop: "auto", paddingTop: "12px" }}>
                  <a href={book.amazon_url} target="_blank" rel="noopener noreferrer"
                    style={{ padding: "6px 12px", borderRadius: "6px", background: "#f59e0b", color: "#fff",
                      fontSize: "12px", fontWeight: 600, textDecoration: "none" }}>
                    🛒 Buy on Amazon
                  </a>
                  <button
                    onClick={() => handleAddToWishlist(book)}
                    disabled={wishlistedIds.has(book.google_id)}
                    style={{ padding: "6px 12px", borderRadius: "6px", background: wishlistedIds.has(book.google_id) ? "#e5e7eb" : "#ec4899",
                      color: wishlistedIds.has(book.google_id) ? "#6b7280" : "#fff", fontSize: "12px", fontWeight: 600, border: "none", cursor: "pointer" }}>
                    {wishlistedIds.has(book.google_id) ? "✓ Wishlisted" : "♥ Wishlist"}
                  </button>
                  <button
                    onClick={() => handleAddToMyBooks(book)}
                    disabled={addedIds.has(book.google_id)}
                    style={{ padding: "6px 12px", borderRadius: "6px", background: addedIds.has(book.google_id) ? "#e5e7eb" : "#4f46e5",
                      color: addedIds.has(book.google_id) ? "#6b7280" : "#fff", fontSize: "12px", fontWeight: 600, border: "none", cursor: "pointer" }}>
                    {addedIds.has(book.google_id) ? "✓ Added" : "📚 Add to My Books"}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {!loading && results.length === 0 && !error && (
        <div className="empty-panel">
          <h3>Search for books above</h3>
          <p>Try searching "atomic habits", "fiction 2024", or browse by category.</p>
        </div>
      )}
    </section>
  );
}
