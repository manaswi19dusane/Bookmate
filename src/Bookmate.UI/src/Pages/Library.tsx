import { useEffect, useMemo, useState } from "react";
import BookCard from "../Componants/BookCard";
import { booksApi, libraryApi, type Book, type LibraryItem } from "../services/api";
import { useAuth } from "../context/AuthContext";

export default function Library() {
  const { token } = useAuth();
  const [filter, setFilter] = useState<string>("all");
  const [items, setItems] = useState<LibraryItem[]>([]);
  const [books, setBooks] = useState<Book[]>([]);
  const [availableBooks, setAvailableBooks] = useState<Book[]>([]);
  const [selectedBookId, setSelectedBookId] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("reading");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  async function loadLibrary(currentFilter = filter) {
    if (!token) return;
    setLoading(true);
    setError("");
    try {
      const [libraryItems, allBooks, candidateBooks] = await Promise.all([
        libraryApi.list(token, currentFilter === "all" ? undefined : currentFilter),
        booksApi.list(),
        booksApi.listAvailable(token),
      ]);
      setItems(libraryItems);
      setBooks(allBooks);
      setAvailableBooks(candidateBooks);
    } catch (err) {
      setError((err as Error).message || "Unable to load your library.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void loadLibrary(filter);
  }, [filter, token]);

  const joinedItems = useMemo(
    () =>
      items.map((item) => ({
        item,
        book: books.find((book) => book.id === item.book_id),
      })),
    [items, books]
  );

  async function handleAddBook(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!token || !selectedBookId) return;
    setSaving(true);
    setError("");
    try {
      await libraryApi.add(token, selectedBookId, selectedStatus);
      setSelectedBookId("");
      setSelectedStatus("reading");
      await loadLibrary(filter);
    } catch (err) {
      setError((err as Error).message || "Unable to add the book to your library.");
    } finally {
      setSaving(false);
    }
  }

  async function handleStatusChange(libraryId: string, status: string) {
    if (!token) return;
    try {
      await libraryApi.updateStatus(token, libraryId, status);
      await loadLibrary(filter);
    } catch (err) {
      setError((err as Error).message || "Unable to update the reading status.");
    }
  }

  async function handleRemove(libraryId: string) {
    if (!token) return;
    try {
      await libraryApi.remove(token, libraryId);
      await loadLibrary(filter);
    } catch (err) {
      setError((err as Error).message || "Unable to remove the library item.");
    }
  }

  return (
    <section className="page-shell">
      <div className="section-heading">
        <p className="page-eyebrow">Library</p>
        <h1>Your reading shelf</h1>
        <p>Keep reading, completed, and wishlist items in sync with the live backend.</p>
      </div>

      <div className="toolbar">
        <div className="toolbar-tabs">
          {["all", "reading", "completed", "wishlist"].map((value) => (
            <button
              key={value}
              className={filter === value ? "tab-button active" : "tab-button"}
              onClick={() => setFilter(value)}
            >
              {value}
            </button>
          ))}
        </div>
      </div>

      <form className="inline-form" onSubmit={handleAddBook}>
        <select value={selectedBookId} onChange={(event) => setSelectedBookId(event.target.value)} required>
          <option value="">Add a book to library</option>
          {availableBooks.map((book) => (
            <option key={book.id} value={book.id}>
              {book.title} by {book.author}
            </option>
          ))}
        </select>
        <select value={selectedStatus} onChange={(event) => setSelectedStatus(event.target.value)}>
          <option value="reading">reading</option>
          <option value="completed">completed</option>
          <option value="wishlist">wishlist</option>
        </select>
        <button type="submit" className="primary-button" disabled={saving}>
          {saving ? "Adding..." : "Add to library"}
        </button>
      </form>

      {error && <p className="form-error">{error}</p>}

      {loading ? (
        <p className="page-status">Loading library...</p>
      ) : joinedItems.length === 0 ? (
        <div className="empty-panel">
          <h3>Your library is empty</h3>
          <p>Add a book above to start tracking your reading.</p>
        </div>
      ) : (
        <div className="card-grid">
          {joinedItems.map(({ item, book }) =>
            book ? (
              <BookCard
                key={item.id}
                book={book}
                badge={item.status}
                secondaryText={item.notes || `Added ${new Date(item.added_at).toLocaleDateString()}`}
                actions={
                  <>
                    <select value={item.status} onChange={(event) => handleStatusChange(item.id, event.target.value)}>
                      <option value="reading">reading</option>
                      <option value="completed">completed</option>
                      <option value="wishlist">wishlist</option>
                    </select>
                    <button className="icon-button danger" onClick={() => handleRemove(item.id)}>
                      Remove
                    </button>
                  </>
                }
              />
            ) : null
          )}
        </div>
      )}
    </section>
  );
}
