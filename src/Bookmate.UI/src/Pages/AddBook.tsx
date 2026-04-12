import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { booksApi } from "../services/api";

export default function AddBook() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    title: "",
    author: "",
    language: "",
    published_date: "",
    purchased_date: "",
    image_url: "",
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");

    if (!form.title.trim() || !form.author.trim() || !form.language.trim()) {
      setError("Title, author, and language are required.");
      return;
    }

    setSaving(true);
    try {
      await booksApi.create({
        ...form,
        published_date: form.published_date || null,
        purchased_date: form.purchased_date || null,
        image_url: form.image_url || null,
      });
      navigate("/");
    } catch (err) {
      setError((err as Error).message || "Unable to create the book.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <section className="page-shell form-page">
      <div className="section-heading">
        <p className="page-eyebrow">Books</p>
        <h1>Add a new book</h1>
        <p>Create a real book entry using the existing backend API.</p>
      </div>

      <form className="form-card" onSubmit={handleSubmit}>
        <div className="form-grid">
          <label>
            Title
            <input value={form.title} onChange={(event) => setForm((prev) => ({ ...prev, title: event.target.value }))} required />
          </label>
          <label>
            Author
            <input value={form.author} onChange={(event) => setForm((prev) => ({ ...prev, author: event.target.value }))} required />
          </label>
          <label>
            Language
            <input value={form.language} onChange={(event) => setForm((prev) => ({ ...prev, language: event.target.value }))} required />
          </label>
          <label>
            Published date
            <input type="date" value={form.published_date} onChange={(event) => setForm((prev) => ({ ...prev, published_date: event.target.value }))} />
          </label>
          <label>
            Purchased date
            <input type="date" value={form.purchased_date} onChange={(event) => setForm((prev) => ({ ...prev, purchased_date: event.target.value }))} />
          </label>
          <label className="full-width">
            Cover image URL
            <input value={form.image_url} onChange={(event) => setForm((prev) => ({ ...prev, image_url: event.target.value }))} placeholder="https://..." />
          </label>
        </div>

        {error && <p className="form-error">{error}</p>}

        <div className="form-actions">
          <button type="button" className="secondary-button" onClick={() => navigate(-1)}>
            Cancel
          </button>
          <button type="submit" className="primary-button" disabled={saving}>
            {saving ? "Saving..." : "Create book"}
          </button>
        </div>
      </form>
    </section>
  );
}
