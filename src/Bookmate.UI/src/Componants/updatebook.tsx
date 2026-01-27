import { useState } from "react";
import "../css/updatebook.css";
import type { BookResponse } from "../Api/Books";

interface Props {
  book: BookResponse;
  onClose: () => void;
  onUpdated: () => void;
}

export default function UpdateBook({ book, onClose, onUpdated }: Props) {
  const [title, setTitle] = useState(book.title);
  const [author, setAuthor] = useState(book.author);
  const [language, setLanguage] = useState(book.language);

  const handleSave = async () => {
    try {
      const response = await fetch(
        `http://127.0.0.1:8000/api/books/${book.id}`, // ✅ FIXED URL
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            title,
            author,
            language,
            image_url: book.image_url,
          }),
        }
      );

      if (!response.ok) {
        throw new Error("Update failed");
      }

      await onUpdated(); // ✅ reload books
      onClose();         // ✅ close drawer
    } catch (err) {
      console.error("Update failed", err);
      alert("Update failed");
    }
  };

  return (
    <div className="drawer-overlay">
      <div className="drawer">
        <div className="drawer-header">
          <h3>Update Book</h3>
          <button onClick={onClose}>✖</button>
        </div>

        <div className="drawer-body">
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Title"
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
            <option value="English">English</option>
            <option value="Marathi">Marathi</option>
          </select>
        </div>

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
