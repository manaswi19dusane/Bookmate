import { useEffect, useState } from "react";
import { createPreference, fetchPreferences, UserPreference, fetchAvailableBooks } from "../Api/auth";
import "../css/preferences.css";

export default function Preferences() {
  const [preferences, setPreferences] = useState<UserPreference[]>([]);
  const [genre, setGenre] = useState("");
  const [author, setAuthor] = useState("");
  const [availableBooks, setAvailableBooks] = useState<any[]>([]);
  const [selectedBook, setSelectedBook] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadPreferences = async () => {
    setLoading(true);
    setError("");
    try {
      const [data, books] = await Promise.all([
        fetchPreferences(),
        fetchAvailableBooks()
      ]);
      setPreferences(data);
      setAvailableBooks(books);
    } catch (err) {
      setError((err as Error).message || "Could not load preferences");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPreferences();
  }, []);

  const handleAddPreference = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");
    if (!selectedBook && !genre && !author) {
      setError("Please select a book or enter genre/author");
      return;
    }

    try {
      const preferencePayload = selectedBook
        ? { book_id: selectedBook.id }
        : { genre, author };
      const preference = await createPreference(preferencePayload);
      setPreferences((prev) => [preference, ...prev]);
      setGenre("");
      setAuthor("");
      setSelectedBook(null);
    } catch (err) {
      setError((err as Error).message || "Could not create preference");
    }
  };

  return (
    <div className="preferences-page">
      <div className="preferences-header">
        <h2>Preferences</h2>
      </div>

      <div className="preferences-container">
        <form className="preference-form" onSubmit={handleAddPreference}>
          <div className="preference-inputs">
            <input
              placeholder="Genre"
              value={genre}
              onChange={(e) => setGenre(e.target.value)}
            />
            <input
              placeholder="Author"
              value={author}
              onChange={(e) => setAuthor(e.target.value)}
            />
          </div>
          <button type="submit">Add Preference</button>
        </form>

        <div className="available-books">
          <h3>Select from Available Books</h3>
          {availableBooks.length === 0 ? (
            <p>No available books to select from</p>
          ) : (
            <div className="books-grid">
              {availableBooks.map((book) => (
                <div
                  key={book.id}
                  className={`book-item ${selectedBook?.id === book.id ? 'selected' : ''}`}
                  onClick={() => setSelectedBook(book)}
                >
                  <h4>{book.title}</h4>
                  <p>{book.author}</p>
                  <small>{book.language}</small>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {error && <p className="error-text">{error}</p>}

      {loading ? (
        <p>Loading preferences...</p>
      ) : preferences.length === 0 ? (
        <p>No preferences yet.</p>
      ) : (
        <div className="preferences-list">
          {preferences.map((preference) => (
            <div key={preference.id} className="preference-item">
              {preference.book_id ? (
                <div className="book-preference">
                  <strong>Book Preference</strong>
                  <span>Book ID: {preference.book_id}</span>
                </div>
              ) : (
                <>
                  <strong>{preference.genre}</strong>
                  <span>{preference.author}</span>
                </>
              )}
              <small>{new Date(preference.created_at).toLocaleString()}</small>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}