import { useEffect, useState } from "react";
import "../css/wishlist.css";
import { fetchBooks, updateBookStatus, deleteBook, BookResponse } from "../Api/Books";

export default function Wishlist() {
  const [books, setBooks] = useState<BookResponse[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadWishlist();
  }, []);

  async function loadWishlist() {
    try {
      const allBooks = await fetchBooks();
      const wishlistBooks = allBooks.filter(
        (book: BookResponse) => book.language === "english"
      );
      setBooks(wishlistBooks);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  async function moveToOwned(id: number) {
    await updateBookStatus(id, "owned");
    loadWishlist();
  }

  async function removeFromWishlist(id: number) {
    await deleteBook(id);
    loadWishlist();
  }

  if (loading) return <p>Loading wishlist...</p>;

  return (
    <div className="wishlist-page">
      <h2>❤️ My Wishlist</h2>

      {books.length === 0 ? (
        <p className="empty-text">
          🤍 Your wishlist is empty. Add books you love!
        </p>
      ) : (
        <div className="wishlist-list">
          {books.map((book) => (
            <div className="wishlist-card" key={book.id}>
              <img
                src={book.image_url || "/placeholder-book.png"}
                alt={book.title}
              />

              <div className="wishlist-info">
                <h3>{book.title}</h3>
                <p>{book.author}</p>

                <span className="language-badge">
                  Language: {book.language}
                </span>

                <div className="wishlist-actions">
                  <button
                    className="btn-move"
                    onClick={() => moveToOwned(book.id)}
                  >
                    Move to Owned
                  </button>

                  <button
                    className="btn-remove"
                    onClick={() => removeFromWishlist(book.id)}
                  >
                    Remove
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
