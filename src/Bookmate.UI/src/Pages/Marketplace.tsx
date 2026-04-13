import { useEffect, useMemo, useState } from "react";
import { booksApi, marketplaceApi, type Book, type MarketplaceItem } from "../services/api";
import { useAuth } from "../context/AuthContext";

export default function Marketplace() {
  const { user } = useAuth();
  const [items, setItems] = useState<MarketplaceItem[]>([]);
  const [books, setBooks] = useState<Book[]>([]);
  const [form, setForm] = useState({
    book_id: "",
    price: "12.99",
    condition: "Like New",
    description: "",
  });
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  async function loadMarketplace() {
    setLoading(true);
    setError("");
    try {
      const [marketplaceItems, allBooks] = await Promise.all([marketplaceApi.list(), booksApi.list()]);
      setItems(marketplaceItems);
      setBooks(allBooks);
    } catch (err) {
      setError((err as Error).message || "Unable to load marketplace items.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void loadMarketplace();
  }, []);

  const bookLookup = useMemo(() => new Map(books.map((book) => [book.id, book])), [books]);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!user) return;
    setSubmitting(true);
    setError("");
    try {
      await marketplaceApi.create({
        book_id: form.book_id,
        seller_user_id: user.id,
        price: Number(form.price),
        condition: form.condition,
        description: form.description || undefined,
      });
      setForm({ book_id: "", price: "12.99", condition: "Like New", description: "" });
      await loadMarketplace();
    } catch (err) {
      setError((err as Error).message || "Unable to create marketplace listing.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <section className="page-shell">
      <div className="section-heading">
        <p className="page-eyebrow">Marketplace</p>
        <h1>Buy and sell books</h1>
        <p>Listings are pulled from the existing marketplace API and can be created with your current user id.</p>
      </div>

      <div className="split-layout">
        <form className="form-card" onSubmit={handleSubmit}>
          <label>
            Book
            <select value={form.book_id} onChange={(event) => setForm((prev) => ({ ...prev, book_id: event.target.value }))} required>
              <option value="">Select a book</option>
              {books.map((book) => (
                <option key={book.id} value={book.id}>
                  {book.title} by {book.author}
                </option>
              ))}
            </select>
          </label>
          <label>
            Price
            <input type="number" min="1" step="0.01" value={form.price} onChange={(event) => setForm((prev) => ({ ...prev, price: event.target.value }))} />
          </label>
          <label>
            Condition
            <select value={form.condition} onChange={(event) => setForm((prev) => ({ ...prev, condition: event.target.value }))}>
              <option value="New">New</option>
              <option value="Like New">Like New</option>
              <option value="Very Good">Very Good</option>
              <option value="Good">Good</option>
            </select>
          </label>
          <label>
            Description
            <textarea value={form.description} onChange={(event) => setForm((prev) => ({ ...prev, description: event.target.value }))} rows={4} />
          </label>
          {error && <p className="form-error">{error}</p>}
          <button className="primary-button" type="submit" disabled={submitting}>
            {submitting ? "Creating..." : "Create listing"}
          </button>
        </form>

        <div className="list-panel">
          <h2>Live listings</h2>
          {loading ? (
            <p className="page-status">Loading listings...</p>
          ) : items.length === 0 ? (
            <div className="empty-panel">
              <h3>No listings yet</h3>
              <p>Create the first marketplace listing using the form.</p>
            </div>
          ) : (
            <div className="stack-list">
              {items.map((item) => {
                const book = bookLookup.get(item.book_id);
                return (
                  <article key={item.id} className="stack-card">
                    <strong>{book?.title || item.book_id}</strong>
                    <span>{book?.author || "Unknown author"}</span>
                    <small>
                      ${item.price.toFixed(2)} · {item.condition} · {item.is_available ? "Available" : "Sold"}
                    </small>
                  </article>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
