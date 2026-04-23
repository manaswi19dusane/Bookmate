import { useEffect, useState } from "react";
import { wishlistApi, type WishlistItem } from "../services/api";

export default function Wishlist() {
  const [items, setItems] = useState<WishlistItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [feedback, setFeedback] = useState("");

  async function loadWishlist() {
    setLoading(true);
    setError("");
    try {
      const data = await wishlistApi.list();
      setItems(data);
    } catch {
      setError("Unable to load your wishlist.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { void loadWishlist(); }, []);

  async function handleRemove(item: WishlistItem) {
    try {
      await wishlistApi.remove(item.id);
      setItems(prev => prev.filter(i => i.id !== item.id));
      setFeedback(`"${item.book_name}" removed from wishlist.`);
      setTimeout(() => setFeedback(""), 3000);
    } catch {
      setError("Failed to remove item.");
    }
  }

  return (
    <section className="page-shell">
      <div className="section-heading">
        <p className="page-eyebrow">Library</p>
        <h1>My Wishlist ♥</h1>
        <p>Books you've saved from recommendations to read later.</p>
      </div>

      {feedback && (
        <p style={{ color: "#16a34a", fontWeight: 600, marginBottom: "12px" }}>{feedback}</p>
      )}
      {error && <p className="form-error">{error}</p>}

      {loading ? (
        <p className="page-status">Loading wishlist...</p>
      ) : items.length === 0 ? (
        <div className="empty-panel">
          <h3>Your wishlist is empty</h3>
          <p>Search for books in Recommendations and click ♥ Wishlist to save them here.</p>
          <a href="/recommendations" className="primary-button" style={{ marginTop: "12px", display: "inline-block" }}>
            Browse Recommendations
          </a>
        </div>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))", gap: "20px" }}>
          {items.map(item => (
            <div key={item.id} style={{
              background: "#fff", borderRadius: "12px", boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
              overflow: "hidden", display: "flex", flexDirection: "column"
            }}>
              {item.image ? (
                <img src={item.image} alt={item.book_name}
                  style={{ width: "100%", height: "180px", objectFit: "cover" }} />
              ) : (
                <div style={{ width: "100%", height: "180px", background: "#f3f4f6",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: "48px", color: "#d1d5db" }}>
                  📚
                </div>
              )}
              <div style={{ padding: "16px", flex: 1, display: "flex", flexDirection: "column", gap: "6px" }}>
                <h3 style={{ fontSize: "15px", fontWeight: 700, margin: 0 }}>{item.book_name}</h3>
                <p style={{ fontSize: "13px", color: "#6b7280", margin: 0 }}>{item.author}</p>
                {item.description && (
                  <p style={{ fontSize: "12px", color: "#9ca3af", margin: 0,
                    display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>
                    {item.description}
                  </p>
                )}
                <div style={{ display: "flex", gap: "8px", marginTop: "auto", paddingTop: "12px", flexWrap: "wrap" }}>
                  {item.amazon_url && (
                    <a href={item.amazon_url} target="_blank" rel="noopener noreferrer"
                      style={{ padding: "6px 12px", borderRadius: "6px", background: "#f59e0b",
                        color: "#fff", fontSize: "12px", fontWeight: 600, textDecoration: "none" }}>
                      🛒 Buy on Amazon
                    </a>
                  )}
                  <button
                    onClick={() => handleRemove(item)}
                    style={{ padding: "6px 12px", borderRadius: "6px", background: "#fee2e2",
                      color: "#dc2626", fontSize: "12px", fontWeight: 600, border: "none", cursor: "pointer" }}>
                    🗑 Remove
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
