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

  async function moveToOwned(id: string) {
    await updateBookStatus(id, "owned");
    loadWishlist();
  }

  async function removeFromWishlist(id: string) {
    await deleteBook(id);
    loadWishlist();
  }

  if (loading) return <p>Loading wishlist...</p>;

  return (
    <div className="wishlist-page">
      {/* HEADER */}
      <div className="wishlist-header">
        <h2>💙 My Wishlist</h2>
      </div>

      {/* FILTER BAR (UI only for now) */}
      <div className="wishlist-filters">
        <select>
          <option>Sort By</option>
          <option>Name</option>
          <option>Date</option>
        </select>

        <select>
          <option>Filter</option>
          <option>English</option>
          <option>Marathi</option>
        </select>

        <input type="text" placeholder="🔍 Filter" />
      </div>

      {/* LIST */}
      {books.length === 0 ? (
        <div className="wishlist-empty">
          🤍 Your wishlist is empty! Start adding books you love.
        </div>
      ) : (
        <div className="wishlist-list">
          {books.map((book) => (
            <div className="wishlist-card" key={book.id}>
              {/* HEART ICON */}
              <span className="heart">❤️</span>

              {/* IMAGE */}
              <img
                src={book.image_url || "/placeholder-book.png"}
                alt={book.title}
              />

              {/* INFO */}
              <div className="wishlist-info">
                <h3>{book.title}</h3>
                <p className="author">{book.author}</p>

                <div className="language">
                  Language <span>{book.language}</span>
                </div>

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
                    ⬆ Remove
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
