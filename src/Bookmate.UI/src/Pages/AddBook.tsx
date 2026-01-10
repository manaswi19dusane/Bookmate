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
    <div className="add-container">
      <form className="add-card" onSubmit={handleSubmit}>
        <h2 className="form-title">Add New Book</h2>

        <div className="form-grid">
          {/* LEFT: Upload box */}
          <div className="upload-box">
            <div className="upload-inner">
              <span className="plus">+</span>
              <p>Upload book cover</p>
              <small>Click to upload</small>
              <input type="file" hidden />
            </div>

            <button type="button" className="camera-btn">
              📸 Take Picture
            </button>

            {/* KEEP EXISTING IMAGE URL FIELD (IMPORTANT) */}
            <input
              className="image-url-input"
              placeholder="Or paste image URL"
              value={imageUrl}
              onChange={(e) => setImageUrl(e.target.value)}
            />
          </div>

          {/* RIGHT: Form Fields */}
          <div className="form-fields">
            {/* BOOK TITLE */}
            <label>Book Title</label>
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Enter the full name of the book"
              required
            />

            {/* AUTHOR */}
            <label>Author</label>
            <input
              value={author}
              onChange={(e) => setAuthor(e.target.value)}
              placeholder="Author name"
              required
            />

            {/* LANGUAGE + STATUS */}
            <div className="row">
              <div>
                <label>Language</label>
                <select
                  value={language}
                  onChange={(e) => setLanguage(e.target.value)}
                  required
                >
                  <option value="">Select Language</option>
                  <option value="English">English</option>
                  <option value="Marathi">Marathi</option>
                </select>
              </div>

              <div>
                <label>Status</label>
                <select>
                  <option value="Owned">Owned</option>
                  <option value="Wishlist">Wishlist</option>
                </select>
              </div>
            </div>

            {/* PUBLISHED DATE (KEEP) */}
            <label>Published Date</label>
            <input
              type="date"
              value={publishedDate}
              onChange={(e) => setPublishedDate(e.target.value)}
            />

            {/* PURCHASED DATE (KEEP) */}
            <label>Purchased Date</label>
            <input
              type="date"
              value={purchasedDate}
              onChange={(e) => setPurchasedDate(e.target.value)}
            />

            {/* DESCRIPTION (OPTIONAL / UI ONLY) */}
            <label>Description</label>
            <textarea
              rows={4}
              placeholder="Add a short description..."
            />
          </div>
        </div>

        {/* ACTIONS */}
        <div className="actions">
          <button type="button" className="cancel">
            Cancel
          </button>

          <button type="submit" className="save" disabled={loading}>
            {loading ? "Saving..." : "💾 Save Book"}
          </button>
        </div>
      </form>
    </div>
  );
}