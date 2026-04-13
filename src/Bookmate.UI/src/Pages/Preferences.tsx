import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { booksApi, preferencesApi, type Book, type UserPreference } from "../services/api";
import { useAuth } from "../context/AuthContext";

export default function Preferences() {
  const { token } = useAuth();
  const [preferences, setPreferences] = useState<UserPreference[]>([]);
  const [availableBooks, setAvailableBooks] = useState<Book[]>([]);
  const [form, setForm] = useState({ genre: "", author: "", book_id: "" });
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!token) return;
    setLoading(true);
    Promise.all([preferencesApi.list(token), booksApi.listAvailable(token)])
      .then(([loadedPreferences, books]) => {
        setPreferences(loadedPreferences);
        setAvailableBooks(books);
      })
      .catch((err) => setError((err as Error).message || "Unable to load preferences."))
      .finally(() => setLoading(false));
  }, [token]);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!token) return;
    setSubmitting(true);
    setError("");

    if (!form.genre.trim() || !form.author.trim()) {
      setError("Genre and author are required.");
      setSubmitting(false);
      return;
    }

    try {
      const created = await preferencesApi.create(token, {
        genre: form.genre,
        author: form.author,
        book_id: form.book_id || undefined,
      });
      setPreferences((prev) => [created, ...prev]);
      setForm({ genre: "", author: "", book_id: "" });
    } catch (err) {
      setError((err as Error).message || "Unable to save preference.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <section className="page-shell">
      <div className="section-heading">
        <p className="page-eyebrow">Profile</p>
        <h1>Your reading preferences</h1>
        <p>Save favorite genres and authors, and optionally link them to a book the backend already knows about.</p>
      </div>

      <div className="inline-tip">
        <strong>Why this matters</strong>
        <p>
          Preferences are one of the fastest ways to make recommendations feel personal. Add at
          least one favorite author or genre to improve the next step.
        </p>
        <Link to="/recommendations" className="secondary-button">
          View recommendations
        </Link>
      </div>

      <div className="split-layout">
        <form className="form-card" onSubmit={handleSubmit}>
          <label>
            Genre
            <input value={form.genre} onChange={(event) => setForm((prev) => ({ ...prev, genre: event.target.value }))} placeholder="Classics" />
          </label>
          <label>
            Author
            <input value={form.author} onChange={(event) => setForm((prev) => ({ ...prev, author: event.target.value }))} placeholder="Jane Austen" />
          </label>
          <label>
            Link to a book
            <select
              value={form.book_id}
              onChange={(event) => {
                const selected = availableBooks.find((book) => book.id === event.target.value);
                setForm((prev) => ({
                  ...prev,
                  book_id: event.target.value,
                  author: selected?.author || prev.author,
                }));
              }}
            >
              <option value="">Optional</option>
              {availableBooks.map((book) => (
                <option key={book.id} value={book.id}>
                  {book.title} by {book.author}
                </option>
              ))}
            </select>
          </label>
          {error && <p className="form-error">{error}</p>}
          <button type="submit" className="primary-button" disabled={submitting}>
            {submitting ? "Saving..." : "Save preference"}
          </button>
        </form>

        <div className="list-panel">
          <h2>Saved preferences</h2>
          {loading ? (
            <p className="page-status">Loading preferences...</p>
          ) : preferences.length === 0 ? (
            <div className="empty-panel">
              <h3>No preferences yet</h3>
              <p>Add your first genre or author to personalize the experience.</p>
              <div className="hero-actions centered-actions">
                <Link to="/guide" className="secondary-button">
                  Open guide
                </Link>
              </div>
            </div>
          ) : (
            <div className="stack-list">
              {preferences.map((preference) => (
                <article key={preference.id} className="stack-card">
                  <strong>{preference.genre}</strong>
                  <span>{preference.author}</span>
                  <small>{preference.book_id ? `Linked book: ${preference.book_id}` : "Manual preference"}</small>
                </article>
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
