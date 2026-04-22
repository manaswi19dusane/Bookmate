import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { booksApi, lendingsApi, wishlistApi, type Book } from "../services/api";

export default function BookDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [book, setBook] = useState<Book | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [feedback, setFeedback] = useState("");
  const [isLent, setIsLent] = useState(false);

  // Edit state
  const [editing, setEditing] = useState(false);
  const [editForm, setEditForm] = useState({ title: "", author: "", language: "", image_url: "", published_date: "" });
  const [saving, setSaving] = useState(false);

  // Delete state
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    if (!id) return;
    Promise.all([
      booksApi.get(id),
      lendingsApi.getBookStatus(id),
    ])
      .then(([b, status]) => {
        setBook(b);
        setIsLent(status.lent);
        setEditForm({
          title: b.title, author: b.author, language: b.language,
          image_url: b.image_url || "", published_date: b.published_date || "",
        });
      })
      .catch(err => setError((err as Error).message))
      .finally(() => setLoading(false));
  }, [id]);

  async function handleSaveEdit() {
    if (!book) return;
    setSaving(true);
    try {
      const updated = await booksApi.patch(book.id, {
        title: editForm.title, author: editForm.author, language: editForm.language,
        image_url: editForm.image_url || null, published_date: editForm.published_date || null,
      });
      setBook(updated);
      setEditing(false);
      setFeedback("✅ Book updated successfully!");
      setTimeout(() => setFeedback(""), 3000);
    } catch {
      setFeedback("❌ Failed to update book.");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    if (!book) return;
    if (isLent) {
      setFeedback("❌ Cannot delete a book that is currently lent out.");
      setConfirmDelete(false);
      return;
    }
    setDeleting(true);
    try {
      await booksApi.remove(book.id);
      navigate("/");
    } catch {
      setFeedback("❌ Failed to delete book.");
    } finally {
      setDeleting(false);
      setConfirmDelete(false);
    }
  }

  async function handleAddToWishlist() {
    if (!book) return;
    try {
      await wishlistApi.add({ book_name: book.title, author: book.author, image: book.image_url });
      setFeedback("♥ Added to wishlist!");
      setTimeout(() => setFeedback(""), 3000);
    } catch {
      setFeedback("Already in wishlist.");
    }
  }

  if (loading) return <div className="page-shell"><p className="page-status">Loading...</p></div>;
  if (error || !book) return <div className="page-shell"><p className="form-error">{error || "Book not found."}</p></div>;

  return (
    <section className="page-shell detail-page">
      {feedback && (
        <p style={{ marginBottom: "16px", fontWeight: 600,
          color: feedback.startsWith("✅") || feedback.startsWith("♥") ? "#16a34a" : "#dc2626" }}>
          {feedback}
        </p>
      )}

      <div className="detail-card">
        <div className="detail-cover">
          {book.image_url
            ? <img src={book.image_url} alt={book.title} />
            : <div className="image-placeholder">{book.title[0]}</div>
          }
          <span style={{
            marginTop: "12px", display: "inline-block", padding: "4px 12px", borderRadius: "99px",
            fontSize: "13px", fontWeight: 600,
            background: isLent ? "#fee2e2" : "#dcfce7",
            color: isLent ? "#dc2626" : "#16a34a",
          }}>
            {isLent ? "Lent Out" : "Available"}
          </span>
        </div>

        <div className="detail-body">
          <p className="page-eyebrow">Book detail</p>

          {!editing ? (
            <>
              <h1>{book.title}</h1>
              <p className="detail-author">by {book.author}</p>
              <dl className="detail-grid">
                <div><dt>Language</dt><dd>{book.language || "—"}</dd></div>
                <div><dt>Published</dt><dd>{book.published_date || "—"}</dd></div>
                <div><dt>Purchased</dt><dd>{book.purchased_date || "—"}</dd></div>
                <div><dt>ID</dt><dd style={{ fontSize: "11px" }}>{book.id}</dd></div>
              </dl>
            </>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: "12px", marginTop: "8px" }}>
              <label style={{ display: "flex", flexDirection: "column", gap: "4px", fontSize: "14px", fontWeight: 500 }}>
                Title
                <input value={editForm.title} onChange={e => setEditForm(p => ({ ...p, title: e.target.value }))}
                  style={{ padding: "8px", borderRadius: "6px", border: "1px solid #d1d5db", fontSize: "14px" }} />
              </label>
              <label style={{ display: "flex", flexDirection: "column", gap: "4px", fontSize: "14px", fontWeight: 500 }}>
                Author
                <input value={editForm.author} onChange={e => setEditForm(p => ({ ...p, author: e.target.value }))}
                  style={{ padding: "8px", borderRadius: "6px", border: "1px solid #d1d5db", fontSize: "14px" }} />
              </label>
              <label style={{ display: "flex", flexDirection: "column", gap: "4px", fontSize: "14px", fontWeight: 500 }}>
                Language
                <input value={editForm.language} onChange={e => setEditForm(p => ({ ...p, language: e.target.value }))}
                  style={{ padding: "8px", borderRadius: "6px", border: "1px solid #d1d5db", fontSize: "14px" }} />
              </label>
              <label style={{ display: "flex", flexDirection: "column", gap: "4px", fontSize: "14px", fontWeight: 500 }}>
                Published Date
                <input type="date" value={editForm.published_date} onChange={e => setEditForm(p => ({ ...p, published_date: e.target.value }))}
                  style={{ padding: "8px", borderRadius: "6px", border: "1px solid #d1d5db", fontSize: "14px" }} />
              </label>
              <label style={{ display: "flex", flexDirection: "column", gap: "4px", fontSize: "14px", fontWeight: 500 }}>
                Image URL
                <input value={editForm.image_url} onChange={e => setEditForm(p => ({ ...p, image_url: e.target.value }))}
                  style={{ padding: "8px", borderRadius: "6px", border: "1px solid #d1d5db", fontSize: "14px" }} />
              </label>
            </div>
          )}

          {/* Action Buttons */}
          <div style={{ display: "flex", gap: "10px", flexWrap: "wrap", marginTop: "24px" }}>
            {!editing ? (
              <>
                <button onClick={() => setEditing(true)}
                  style={{ padding: "8px 18px", borderRadius: "8px", background: "#4f46e5",
                    color: "#fff", border: "none", fontWeight: 600, cursor: "pointer" }}>
                  ✏️ Edit
                </button>
                <button onClick={handleAddToWishlist}
                  style={{ padding: "8px 18px", borderRadius: "8px", background: "#ec4899",
                    color: "#fff", border: "none", fontWeight: 600, cursor: "pointer" }}>
                  ♥ Wishlist
                </button>
                {!confirmDelete ? (
                  <button onClick={() => setConfirmDelete(true)} disabled={isLent}
                    title={isLent ? "Cannot delete a lent book" : ""}
                    style={{ padding: "8px 18px", borderRadius: "8px",
                      background: isLent ? "#e5e7eb" : "#fee2e2",
                      color: isLent ? "#9ca3af" : "#dc2626",
                      border: "none", fontWeight: 600, cursor: isLent ? "not-allowed" : "pointer" }}>
                    🗑 Delete
                  </button>
                ) : (
                  <>
                    <button onClick={handleDelete} disabled={deleting}
                      style={{ padding: "8px 18px", borderRadius: "8px", background: "#dc2626",
                        color: "#fff", border: "none", fontWeight: 600, cursor: "pointer" }}>
                      {deleting ? "Deleting..." : "⚠️ Confirm Delete"}
                    </button>
                    <button onClick={() => setConfirmDelete(false)}
                      style={{ padding: "8px 18px", borderRadius: "8px", background: "#e5e7eb",
                        color: "#374151", border: "none", fontWeight: 600, cursor: "pointer" }}>
                      Cancel
                    </button>
                  </>
                )}
              </>
            ) : (
              <>
                <button onClick={handleSaveEdit} disabled={saving}
                  style={{ padding: "8px 18px", borderRadius: "8px", background: "#16a34a",
                    color: "#fff", border: "none", fontWeight: 600, cursor: "pointer" }}>
                  {saving ? "Saving..." : "💾 Save Changes"}
                </button>
                <button onClick={() => setEditing(false)}
                  style={{ padding: "8px 18px", borderRadius: "8px", background: "#e5e7eb",
                    color: "#374151", border: "none", fontWeight: 600, cursor: "pointer" }}>
                  Cancel
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
