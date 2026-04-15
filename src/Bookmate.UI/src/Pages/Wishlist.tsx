import { useEffect, useState } from "react";
import { booksApi, wishlistApi, type WishlistItem } from "../services/api";
import { useAuth } from "../context/AuthContext";
import "../css/wishlist.css";

export default function Wishlist() {
  const { token } = useAuth();
  const [items, setItems] = useState<WishlistItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  async function loadWishlist() {
    if (!token) return;
    setLoading(true);
    setError("");
    try {
      setItems(await wishlistApi.list(token));
    } catch (err) {
      setError((err as Error).message || "Unable to load your wishlist.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void loadWishlist();
  }, [token]);

  async function addToMyBooks(item: WishlistItem) {
    if (!token) return;
    try {
      await booksApi.create(
        {
          title: item.book_name,
          author: item.author,
          language: "en",
          image_url: item.image || null,
          source: "wishlist",
        },
        token
      );
      await wishlistApi.remove(token, item.id);
      setItems((prev) => prev.filter((entry) => entry.id !== item.id));
    } catch (err) {
      setError((err as Error).message || "Unable to move this wishlist item to your books.");
    }
  }

  async function removeItem(item: WishlistItem) {
    if (!token) return;
    try {
      await wishlistApi.remove(token, item.id);
      setItems((prev) => prev.filter((entry) => entry.id !== item.id));
    } catch (err) {
      setError((err as Error).message || "Unable to remove this wishlist item.");
    }
  }

  return (
    <section className="page-shell wishlist-page">
      <div className="section-heading wishlist-header">
        <p className="page-eyebrow">Saved later</p>
        <h1>Wishlist</h1>
        <p>These are books you want to remember, even before they become part of your owned shelf.</p>
      </div>

      {error && <p className="form-error">{error}</p>}

      {loading ? (
        <p className="page-status">Loading wishlist...</p>
      ) : items.length === 0 ? (
        <div className="empty-panel wishlist-empty">
          <h3>No wishlist items yet</h3>
          <p>Add books from the recommendations page to build your future reading list.</p>
        </div>
      ) : (
        <div className="wishlist-list">
          {items.map((item) => (
            <article key={item.id} className="wishlist-card">
              {item.image ? (
                <img src={item.image} alt={item.book_name} />
              ) : (
                <div className="owner-cover-placeholder">{item.book_name.slice(0, 1)}</div>
              )}
              <div className="wishlist-info">
                <h3>{item.book_name}</h3>
                <p className="author">by {item.author}</p>
                <p className="language">
                  Saved on <span>{new Date(item.created_at).toLocaleDateString()}</span>
                </p>
                <div className="wishlist-actions">
                  <button className="btn-move" onClick={() => addToMyBooks(item)}>
                    Add to My Books
                  </button>
                  <button className="btn-remove" onClick={() => removeItem(item)}>
                    Remove
                  </button>
                </div>
              </div>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}
