import { useState } from "react";
import { createBook } from "../Api/Books";
import "../css/AddBook.css";

export default function AddBook() {
  const [title, setTitle] = useState("");
  const [author, setAuthor] = useState("");
  const [language, setLanguage] = useState("");
  const [publishedDate, setPublishedDate] = useState("");
  const [purchasedDate, setPurchasedDate] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);

    try {
      await createBook({
        title,
        author,
        language,
        published_date: publishedDate || null,
        purchased_date: purchasedDate || null,
        image_url: imageUrl || null,
      });

      alert("Book added successfully!");
      
      
      setTitle("");
      setAuthor("");
      setLanguage("");
      setPublishedDate("");
      setPurchasedDate("");
      setImageUrl("");

    } catch (err) {
      alert("Failed to add book");
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  return (
  <div className="add-page">
    {/* Header */}
    <div className="add-header">
      <h2>📘 Add New Book</h2>
    </div>

    <form className="add-card" onSubmit={handleSubmit}>
      <div className="form-grid">

        {/* LEFT: Upload box */}
        <div className="upload-box">
          <div className="upload-inner">
            <span className="plus">+</span>
            <p>Upload book cover</p>
            <small>Click to upload</small>
            <input type="file" hidden />
          </div>

          <button
            type="button"
            className="camera-btn"
          >
            📸 Take Picture
          </button>
        </div>

        {/* RIGHT: Form */}
        <div className="form-fields">
          <label>Book Title</label>
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Enter the full name of the book"
            required
          />

          <label>Author</label>
          <input
            value={author}
            onChange={(e) => setAuthor(e.target.value)}
            required
          />

          <div className="row">
            <div>
              <label>Language</label>
              <select
                value={language}
                onChange={(e) => setLanguage(e.target.value)}
              >
                <option>English</option>
                <option>Marathi</option>
              </select>
            </div>

            <div>
              <label>Status</label>
              <select>
                <option>Owned</option>
                <option>Wishlist</option>
              </select>
            </div>
          </div>

          <label>Description</label>
          <textarea rows={4} placeholder="Add a short description..." />
        </div>
      </div>

      {/* ACTIONS */}
      <div className="actions">
        <button type="button" className="cancel">
          Cancel
        </button>

        <button className="save" disabled={loading}>
          {loading ? "Saving..." : "💾 Save Book"}
        </button>
      </div>
    </form>
  </div>
);
}