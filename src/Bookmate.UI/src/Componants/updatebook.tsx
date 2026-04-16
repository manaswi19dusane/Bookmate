import { useState } from "react";
import { booksApi, type Book } from "../services/api";
import { useAuth } from "../context/AuthContext";

interface Props {
  book: Book;
  onClose: () => void;
  onUpdated: (book: Book) => void;
}

export default function UpdateBook({ book, onClose, onUpdated }: Props) {
  const { token } = useAuth();
  const [form, setForm] = useState({
    title: book.title,
    author: book.author,
    language: book.language,
    published_date: book.published_date || "",
    purchased_date: book.purchased_date || "",
    image_url: book.image_url || "",
    description: book.description || "",
    isbn: book.isbn || "",
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  async function handleSave() {
    setSaving(true);
    setError("");
    try {
      await booksApi.update(book.id, {
        ...form,
        published_date: form.published_date || null,
        purchased_date: form.purchased_date || null,
        image_url: form.image_url || null,
        description: form.description || null,
        isbn: form.isbn || null,
        source: book.source || "manual",
      }, token);
      onUpdated({
        ...book,
        ...form,
        published_date: form.published_date || null,
        purchased_date: form.purchased_date || null,
        image_url: form.image_url || null,
        description: form.description || null,
        isbn: form.isbn || null,
      });
      onClose();
    } catch (err) {
      setError((err as Error).message || "Unable to update the book.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="drawer-overlay">
      <div className="drawer">
        <div className="drawer-header">
          <h3>Edit book</h3>
          <button onClick={onClose}>Close</button>
        </div>

        <div className="drawer-body">
          <input value={form.title} onChange={(event) => setForm((prev) => ({ ...prev, title: event.target.value }))} placeholder="Title" />
          <input value={form.author} onChange={(event) => setForm((prev) => ({ ...prev, author: event.target.value }))} placeholder="Author" />
          <input value={form.language} onChange={(event) => setForm((prev) => ({ ...prev, language: event.target.value }))} placeholder="Language" />
          <input type="date" value={form.published_date} onChange={(event) => setForm((prev) => ({ ...prev, published_date: event.target.value }))} />
          <input type="date" value={form.purchased_date} onChange={(event) => setForm((prev) => ({ ...prev, purchased_date: event.target.value }))} />
          <input value={form.isbn} onChange={(event) => setForm((prev) => ({ ...prev, isbn: event.target.value }))} placeholder="ISBN" />
          <input value={form.image_url} onChange={(event) => setForm((prev) => ({ ...prev, image_url: event.target.value }))} placeholder="Cover image URL" />
          <textarea value={form.description} onChange={(event) => setForm((prev) => ({ ...prev, description: event.target.value }))} placeholder="Description" rows={4} />
          {error && <p className="form-error">{error}</p>}
        </div>

        <div className="drawer-footer">
          <button className="cancel-btn" onClick={onClose}>Cancel</button>
          <button className="save-btn" onClick={handleSave} disabled={saving}>
            {saving ? "Saving..." : "Save changes"}
          </button>
        </div>
      </div>
    </div>
  );
}
