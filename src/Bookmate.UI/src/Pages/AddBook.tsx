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
      <form className="add-form" onSubmit={handleSubmit}>
        <h2>Add New Book</h2>

        <input
          placeholder="Book Title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
        />

        <input
          placeholder="Author Name"
          value={author}
          onChange={(e) => setAuthor(e.target.value)}
          required
        />

        <input
          placeholder="Language"
          value={language}
          onChange={(e) => setLanguage(e.target.value)}
        />

        {/* Published Date */}
      <label className="date-label">Published Date</label>
      <input
        type="date"
        value={publishedDate}
        onChange={(e) => setPublishedDate(e.target.value)}
      />
         {/* Published Date */}
      <label className="date-label">Purchased Date</label>
      <input
        type="date"
        value={purchasedDate}
        onChange={(e) => setPurchasedDate(e.target.value)}
      />

        <input
          placeholder="Image URL"
          value={imageUrl}
          onChange={(e) => setImageUrl(e.target.value)}
        />

        <button disabled={loading}>
          {loading ? "Saving..." : "Add Book"}
        </button>
      </form>
    </div>
  );
}
