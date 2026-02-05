import { useState } from "react";
import "../css/updatebook.css";
import type { BookResponse } from "../Api/Books";

interface Props {
  book: BookResponse;
  onClose: () => void;
  onUpdated: () => void;
}

export default function UpdateBook({ book, onClose, onUpdated }: Props) {

  // 🔹 FORM STATE
  const [title, setTitle] = useState(book.title);
  const [author, setAuthor] = useState(book.author);
  const [language, setLanguage] = useState(book.language);
  const [status, setStatus] = useState(book.status);
  const [publishedDate, setPublishedDate] = useState(book.published_date || "");
  const [purchasedDate, setPurchasedDate] = useState(book.purchased_date || "");
  const [description, setDescription] = useState(book.description || "");
  const [imageUrl, setImageUrl] = useState(book.image_url || "");

  // 🔹 SAVE HANDLER
  const handleSave = async () => {
    try {
      const response = await fetch(
        `http://127.0.0.1:8000/api/books/${book.id}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            title,
            author,
            language,
            status,
            published_date: publishedDate,
            purchased_date: purchasedDate,
            description,
            image_url: imageUrl,
          }),
        }
      );

      if (!response.ok) {
        throw new Error("Update failed");
      }

      onUpdated(); // reload list
      onClose();   // close drawer

    } catch (error) {
      console.error("Update failed:", error);
      alert("Failed to update book");
    }
  };

  return (
    <div className="drawer-overlay">
      <div className="drawer">

        {/* HEADER */}
        <div className="drawer-header">
          <h3>Update Book</h3>
          <button onClick={onClose}>✖</button>
        </div>

        {/* BODY */}
        <div className="drawer-body">

          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Book Title"
          />

          <input
            value={author}
            onChange={(e) => setAuthor(e.target.value)}
            placeholder="Author"
          />

          <select
            value={language}
            onChange={(e) => setLanguage(e.target.value)}
          >
            <option value="">Select Language</option>
            <option value="English">English</option>
            <option value="Marathi">Marathi</option>
          </select>

          <select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
          >
            <option value="Owned">Owned</option>
            <option value="Wishlist">Wishlist</option>
          </select>

          <input
            type="date"
            value={publishedDate}
            onChange={(e) => setPublishedDate(e.target.value)}
          />

          <input
            type="date"
            value={purchasedDate}
            onChange={(e) => setPurchasedDate(e.target.value)}
          />

          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Add a short description..."
          />

          <input
            value={imageUrl}
            onChange={(e) => setImageUrl(e.target.value)}
            placeholder="Paste image URL"
          />
        </div>

        {/* FOOTER */}
        <div className="drawer-footer">
          <button className="cancel-btn" onClick={onClose}>
            Cancel
          </button>
          <button className="save-btn" onClick={handleSave}>
            Save
          </button>
        </div>

      </div>
    </div>
  );
}