import { useEffect, useMemo, useState } from "react";
import BookCard from "../Componants/BookCard";
import { booksApi, libraryApi, type Book, type LibraryItem } from "../services/api";
import { useAuth } from "../context/AuthContext";

export default function Wishlist() {
  const { token } = useAuth();
  const [items, setItems] = useState<LibraryItem[]>([]);
  const [books, setBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  async function loadWishlist() {
    if (!token) return;
    setLoading(true);
    setError("");
    try {
      const [wishlistItems, allBooks] = await Promise.all([
        libraryApi.list(token, "wishlist"),
        booksApi.list(),
      ]);
      setItems(wishlistItems);
      setBooks(allBooks);
    } catch (err) {
      setError((err as Error).message || "Unable to load your wishlist.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void loadWishlist();
  }, [token]);

  const joinedItems = useMemo(
    () =>
      items.map((item) => ({
        item,
        book: books.find((book) => book.id === item.book_id),
      })),
    [items, books]
  );

  async function moveToReading(item: LibraryItem) {
    if (!token) return;
    await libraryApi.updateStatus(token, item.id, "reading");
    await loadWishlist();
  }

  async function removeItem(item: LibraryItem) {
    if (!token) return;
    await libraryApi.remove(token, item.id);
    await loadWishlist();
  }

  return (
    <section className="page-shell">
      <div className="section-heading">
        <p className="page-eyebrow">Library</p>
        <h1>Wishlist</h1>
        <p>Your wishlist is now driven by real library items with the `wishlist` status.</p>
      </div>

      {error && <p className="form-error">{error}</p>}

      {loading ? (
        <p className="page-status">Loading wishlist...</p>
      ) : joinedItems.length === 0 ? (
        <div className="empty-panel">
          <h3>No wishlist items yet</h3>
          <p>Add books to your library with the wishlist status from the Home or Library page.</p>
        </div>
      ) : (
        <div className="card-grid">
          {joinedItems.map(({ item, book }) =>
            book ? (
              <BookCard
                key={item.id}
                book={book}
                badge="wishlist"
                secondaryText={book.language}
                actions={
                  <>
                    <button className="icon-button" onClick={() => moveToReading(item)}>
                      Move to reading
                    </button>
                    <button className="icon-button danger" onClick={() => removeItem(item)}>
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
