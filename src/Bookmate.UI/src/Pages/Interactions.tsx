import { useEffect, useState } from "react";
import { booksApi, interactionsApi, type Book, type UserInteraction } from "../services/api";
import { useAuth } from "../context/AuthContext";

export default function Interactions() {
  const { token } = useAuth();
  const [interactions, setInteractions] = useState<UserInteraction[]>([]);
  const [books, setBooks] = useState<Book[]>([]);
  const [form, setForm] = useState({
    book_id: "",
    interaction_type: "view",
    rating: "",
  });
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!token) return;
    setLoading(true);
    Promise.all([interactionsApi.list(token), booksApi.list()])
      .then(([loadedInteractions, loadedBooks]) => {
        setInteractions(loadedInteractions);
        setBooks(loadedBooks);
      })
      .catch((err) => setError((err as Error).message || "Unable to load interactions."))
      .finally(() => setLoading(false));
  }, [token]);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!token) return;
    setSubmitting(true);
    setError("");
    try {
      const created = await interactionsApi.create(token, {
        book_id: form.book_id,
        interaction_type: form.interaction_type,
        rating: form.rating ? Number(form.rating) : undefined,
      });
      setInteractions((prev) => [created, ...prev]);
      setForm({ book_id: "", interaction_type: "view", rating: "" });
    } catch (err) {
      setError((err as Error).message || "Unable to save interaction.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <section className="page-shell">
      <div className="section-heading">
        <p className="page-eyebrow">Activity</p>
        <h1>Reading interactions</h1>
        <p>Record views, likes, ratings, and purchases through the existing backend API.</p>
      </div>

      <div className="split-layout">
        <form className="form-card" onSubmit={handleSubmit}>
          <label>
            Book
            <select value={form.book_id} onChange={(event) => setForm((prev) => ({ ...prev, book_id: event.target.value }))} required>
              <option value="">Choose a book</option>
              {books.map((book) => (
                <option key={book.id} value={book.id}>
                  {book.title} by {book.author}
                </option>
              ))}
            </select>
          </label>
          <label>
            Interaction type
            <select
              value={form.interaction_type}
              onChange={(event) => setForm((prev) => ({ ...prev, interaction_type: event.target.value }))}
            >
              <option value="view">View</option>
              <option value="like">Like</option>
              <option value="rating">Rating</option>
              <option value="purchase">Purchase</option>
            </select>
          </label>
          <label>
            Rating
            <input
              type="number"
              min="1"
              max="5"
              value={form.rating}
              onChange={(event) => setForm((prev) => ({ ...prev, rating: event.target.value }))}
              placeholder="Optional"
            />
          </label>
          {error && <p className="form-error">{error}</p>}
          <button className="primary-button" type="submit" disabled={submitting}>
            {submitting ? "Saving..." : "Add interaction"}
          </button>
        </form>

        <div className="list-panel">
          <h2>History</h2>
          {loading ? (
            <p className="page-status">Loading interactions...</p>
          ) : interactions.length === 0 ? (
            <div className="empty-panel">
              <h3>No interactions recorded</h3>
              <p>Track a few actions to build your activity feed.</p>
            </div>
          ) : (
            <div className="stack-list">
              {interactions.map((interaction) => (
                <article key={interaction.id} className="stack-card">
                  <strong>{interaction.interaction_type}</strong>
                  <span>{books.find((book) => book.id === interaction.book_id)?.title || interaction.book_id}</span>
                  <small>{interaction.rating ? `Rating ${interaction.rating}/5` : "No rating"}</small>
                </article>
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
